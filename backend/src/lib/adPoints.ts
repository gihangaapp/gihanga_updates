/**
 * adPoints.ts
 *
 * Atomic Gihanga Points payment for advertising campaigns.
 *
 * SECURITY CRITICAL:
 * - Never trusts any amount from the frontend.
 * - Recalculates authoritative cost from live AdConfig.
 * - Uses MongoDB atomic findOneAndUpdate with $gte balance check to prevent
 *   race conditions, double-spending, and negative balances.
 * - Idempotency: if the same paymentIdempotencyKey has already been used,
 *   returns the existing result without deducting again.
 *
 * ATOMICITY MODEL:
 *   findOneAndUpdate(
 *     { user, kingdomPoints: { $gte: required } },
 *     { $inc: { kingdomPoints: -required } }
 *   )
 *   If two concurrent requests attempt this simultaneously, only ONE will
 *   match (the first that runs). The second finds kingdomPoints < required
 *   and is correctly rejected.
 */

import mongoose from "mongoose";
import { Wallet } from "../models/Wallet";
import { Transaction } from "../models/Transaction";
import { Advertisement } from "../models/Advertisement";
import { notify } from "./notify";
import { getAdConfig } from "./adConfig";
import { calculateAdPrice } from "./adPricing";

export interface AdPointsPaymentResult {
  success: boolean;
  error?: string;
  ad?: InstanceType<typeof Advertisement>;
  transaction?: InstanceType<typeof Transaction>;
  pointsBefore?: number;
  pointsDeducted?: number;
  pointsAfter?: number;
  gpPerMinute?: number;
  advertisingMinutes?: number;
}

/**
 * Atomically pays for an advertisement using Gihanga Points.
 *
 * @param userId         The authenticated user's ID (from JWT — never from frontend body)
 * @param adId           The advertisement ID to pay for
 * @param idempotencyKey Unique key to prevent duplicate payments on retry
 */
export async function payAdWithPoints(
  userId: string,
  adId: string,
  idempotencyKey: string,
): Promise<AdPointsPaymentResult> {
  // ── 1. Idempotency check — if this key was already used, return existing result ──
  if (idempotencyKey) {
    const existing = await Transaction.findOne({
      user: userId,
      kind: "ad_points_payment",
      idempotencyKey,
    });
    if (existing) {
      const ad = await Advertisement.findById(adId);
      return {
        success: true,
        transaction: existing,
        ad: ad ?? undefined,
        pointsDeducted: Math.abs(existing.amount),
      };
    }
  }

  // ── 2. Load the advertisement ──────────────────────────────────────────────
  const ad = await Advertisement.findOne({
    _id: adId,
    creator: userId,
    _legacySystem: { $ne: true },
  });

  if (!ad) return { success: false, error: "Advertisement not found" };
  if (ad.paymentStatus === "paid") return { success: false, error: "This advertisement has already been paid" };
  if (ad.status !== "pending_payment" && ad.status !== "draft") {
    return { success: false, error: `Cannot pay for an advertisement with status: ${ad.status}` };
  }

  // ── 3. Get live AdConfig (Superadmin-set rates — never trust frontend) ────
  const config = await getAdConfig();

  if (!config.pointsEnabled) {
    return { success: false, error: "Gihanga Points payment is currently disabled" };
  }

  // ── 4. Recalculate authoritative cost (ignore any frontend-sent price) ────
  const price = calculateAdPrice(
    { advertisingMinutes: ad.advertisingMinutes, campaignDurationDays: ad.campaignDurationDays },
    config,
  );
  const requiredPoints = price.gpTotal;

  if (requiredPoints <= 0) {
    return { success: false, error: "Invalid advertising cost calculated" };
  }

  // ── 5. Get wallet to snapshot balance before (for transaction record) ─────
  const walletBefore = await Wallet.findOne({ user: userId });
  if (!walletBefore) {
    return { success: false, error: "Wallet not found" };
  }
  const pointsBefore = walletBefore.kingdomPoints;

  // ── 6. ATOMIC deduction — prevents race conditions ────────────────────────
  //   The $gte condition and $inc happen in a single atomic MongoDB operation.
  //   If two requests run simultaneously, only one matches $gte.
  const updatedWallet = await Wallet.findOneAndUpdate(
    {
      user: userId,
      kingdomPoints: { $gte: requiredPoints },
      frozen: { $ne: true },
    },
    {
      $inc: { kingdomPoints: -requiredPoints },
    },
    { new: true },
  );

  if (!updatedWallet) {
    const currentWallet = await Wallet.findOne({ user: userId });
    const balance = currentWallet?.kingdomPoints ?? 0;
    if (currentWallet?.frozen) {
      return { success: false, error: "Your wallet is frozen — contact support" };
    }
    return {
      success: false,
      error: `Insufficient Gihanga Points. Required: ${requiredPoints.toLocaleString()} GP, Your balance: ${balance.toLocaleString()} GP`,
    };
  }

  // ── 7. Create auditable transaction record ────────────────────────────────
  const transaction = await Transaction.create({
    wallet: updatedWallet._id,
    user: userId,
    kind: "ad_points_payment",
    amount: -requiredPoints,
    currency: "GP",
    label: `Gihanga Points — Ad payment: "${ad.title}" (${ad.advertisingMinutes} min × ${price.gpPerMinute.toLocaleString()} GP/min)`,
    status: "completed",
    relatedAd: ad._id,
    idempotencyKey: idempotencyKey || undefined,
    metadata: {
      adId: String(ad._id),
      advertisingMinutes: ad.advertisingMinutes,
      gpPerMinute: price.gpPerMinute,
      pointsBefore,
      pointsDeducted: requiredPoints,
      pointsAfter: updatedWallet.kingdomPoints,
    },
  });

  // ── 8. Update advertisement — freeze the pricing, mark as paid ────────────
  ad.paymentMethod = "gihanga_points";
  ad.paymentStatus = "paid";
  ad.status = "pending_review";   // Payment NEVER auto-publishes
  ad.gpPricePerMinute = price.gpPerMinute;
  ad.rwfPricePerMinute = price.rwfPerMinute;
  ad.totalGpCost = requiredPoints;
  ad.totalRwfCost = price.rwfTotal;
  ad.paymentTransactionId = transaction._id as any;
  ad.paymentIdempotencyKey = idempotencyKey || undefined;
  ad.paidAt = new Date();
  await ad.save();

  // ── 9. Notify the advertiser ──────────────────────────────────────────────
  await notify({
    recipient: userId,
    kind: "payment",
    text: `${requiredPoints.toLocaleString()} Gihanga Points were used for your ad "${ad.title}". It is now pending review.`,
  });

  return {
    success: true,
    ad,
    transaction,
    pointsBefore,
    pointsDeducted: requiredPoints,
    pointsAfter: updatedWallet.kingdomPoints,
    gpPerMinute: price.gpPerMinute,
    advertisingMinutes: ad.advertisingMinutes,
  };
}

/**
 * Refunds Gihanga Points for a rejected/cancelled advertisement.
 * Creates an auditable refund transaction — never silently increments the balance.
 */
export async function refundAdPoints(
  adId: string,
  actorId: string,
): Promise<{ success: boolean; error?: string; pointsReturned?: number }> {
  const ad = await Advertisement.findById(adId);
  if (!ad) return { success: false, error: "Advertisement not found" };
  if (ad.paymentMethod !== "gihanga_points") {
    return { success: false, error: "This advertisement was not paid with Gihanga Points" };
  }
  if (ad.paymentStatus !== "paid" && ad.paymentStatus !== "refund_pending") {
    return { success: false, error: "Cannot refund — advertisement is not in a refundable state" };
  }

  const pointsToReturn = ad.totalGpCost;
  if (!pointsToReturn || pointsToReturn <= 0) {
    return { success: false, error: "No points to refund" };
  }

  // Atomically return the points
  const wallet = await Wallet.findOneAndUpdate(
    { user: ad.creator },
    { $inc: { kingdomPoints: pointsToReturn } },
    { new: true, upsert: false },
  );
  if (!wallet) return { success: false, error: "Wallet not found for refund" };

  // Create refund transaction record
  await Transaction.create({
    wallet: wallet._id,
    user: ad.creator,
    kind: "ad_points_refund",
    amount: pointsToReturn,
    currency: "GP",
    label: `Points refund — Ad "${ad.title}" (${pointsToReturn.toLocaleString()} GP returned)`,
    status: "completed",
    relatedAd: ad._id,
    metadata: {
      originalGpCost: ad.totalGpCost,
      gpPerMinute: ad.gpPricePerMinute,
      advertisingMinutes: ad.advertisingMinutes,
      refundedBy: actorId,
    },
  });

  // Mark ad as refunded
  ad.paymentStatus = "refunded";
  ad.status = "refunded";
  await ad.save();

  // Notify advertiser
  await notify({
    recipient: String(ad.creator),
    kind: "payment",
    text: `${pointsToReturn.toLocaleString()} Gihanga Points have been refunded for your ad "${ad.title}".`,
  });

  return { success: true, pointsReturned: pointsToReturn };
}
