import { Router, Response } from "express";
import { Advertisement } from "../../../../models/Advertisement";
import { AuditLog } from "../../../../models/AuditLog";
import { authenticateStaff, requirePermission, AuthenticatedRequest } from "../../../../middleware/rbac";
import { notify } from "../../../../lib/notify";
import { refundAdPoints } from "../../../../lib/adPoints";
import { applyLedgerEntry } from "../../../../lib/wallet";

const router = Router();

function serializeStaffCampaign(campaign: any, role: string) {
  const value = typeof campaign?.toObject === "function" ? campaign.toObject() : { ...campaign };
  // Contact and manual payment reference are financial-contact data.
  // Moderators can review/approve creative but only admins can access these fields.
  if (role === "moderator") {
    delete value.manualPaymentContact;
    delete value.manualPaymentReference;
    delete value.manualPaymentVerifiedBy;
    if (value.creator && typeof value.creator === "object") delete value.creator.email;
  }
  return value;
}

// GET /api/v1/system/ads — List all campaigns across the platform (Admin/Moderator dashboard)
router.get("/", authenticateStaff, requirePermission("ads.view"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, placement, adType, paymentMethod } = req.query;
    const query: any = { _legacySystem: { $ne: true } };

    if (status) query.status = status;
    if (placement) query.placement = placement;
    if (adType) query.adType = adType;
    if (paymentMethod) query.paymentMethod = paymentMethod;

    const campaigns = await Advertisement.find(query)
      .sort({ createdAt: -1 })
      .limit(200)
      .populate("creator", "name username email avatarHue avatarUrl isCreator verified");

    return res.json({ campaigns: campaigns.map((campaign) => serializeStaffCampaign(campaign, req.staffUser!.role)) });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load campaigns", details: error.message });
  }
});

// GET /api/v1/system/ads/analytics/summary — Platform-wide advertising analytics summary
router.get("/analytics/summary", authenticateStaff, requirePermission("ads.view"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [stats] = await Advertisement.aggregate([
      { $match: { _legacySystem: { $ne: true } } },
      {
        $group: {
          _id: null,
          totalCampaigns: { $sum: 1 },
          activeCampaigns: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
          },
          pendingReview: {
            $sum: { $cond: [{ $eq: ["$status", "pending_review"] }, 1, 0] },
          },
          awaitingManualPayment: {
            $sum: { $cond: [{ $and: [{ $eq: ["$status", "approved"] }, { $eq: ["$manualPaymentStatus", "awaiting_payment"] }] }, 1, 0] },
          },
          manualPaymentVerified: {
            $sum: { $cond: [{ $eq: ["$manualPaymentStatus", "verified"] }, 1, 0] },
          },
          approvedCampaigns: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
          },
          rejectedCampaigns: {
            $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
          },
          totalRwfRevenue: {
            $sum: { $cond: [
              { $and: [
                { $in: ["$paymentMethod", ["real_money", "manual"]] },
                { $eq: ["$paymentStatus", "paid"] },
                { $or: [
                  { $ne: ["$paymentMethod", "manual"] },
                  { $eq: ["$manualPaymentStatus", "verified"] },
                ] },
              ] },
              "$totalRwfCost",
              0,
            ] },
          },
          manualPaymentRevenue: {
            $sum: { $cond: [
              { $and: [
                { $eq: ["$paymentMethod", "manual"] },
                { $eq: ["$manualPaymentStatus", "verified"] },
              ] },
              "$totalRwfCost",
              0,
            ] },
          },
          totalPointsSpent: {
            $sum: { $cond: [{ $eq: ["$paymentMethod", "gihanga_points"] }, "$totalGpCost", 0] },
          },
          totalAdvertisingMinutes: { $sum: "$advertisingMinutes" },
          totalImpressions: { $sum: "$analytics.impressions" },
          totalClicks: { $sum: "$analytics.clicks" },
          totalViews: { $sum: "$analytics.views" },
        },
      },
    ]);

    const summary = stats || {
      totalCampaigns: 0,
      activeCampaigns: 0,
      pendingReview: 0,
      awaitingManualPayment: 0,
      manualPaymentVerified: 0,
      approvedCampaigns: 0,
      rejectedCampaigns: 0,
      totalRwfRevenue: 0,
      manualPaymentRevenue: 0,
      totalPointsSpent: 0,
      totalAdvertisingMinutes: 0,
      totalImpressions: 0,
      totalClicks: 0,
      totalViews: 0,
    };
    // Moderators can review creative and see delivery counts, but aggregate
    // revenue/payment totals are only exposed to Admin and Super Admin.
    if (req.staffUser!.role === "moderator") {
      delete summary.totalRwfRevenue;
      delete summary.manualPaymentRevenue;
      delete summary.totalPointsSpent;
    }
    return res.json({ summary });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load ad analytics summary", details: error.message });
  }
});

// GET /api/v1/system/ads/:id — View campaign detail for staff review
router.get("/:id", authenticateStaff, requirePermission("ads.view"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const campaign = await Advertisement.findById(req.params.id).populate(
      "creator",
      "name username email avatarHue avatarUrl isCreator verified",
    );
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    return res.json({ campaign: serializeStaffCampaign(campaign, req.staffUser!.role) });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch campaign details", details: error.message });
  }
});

// Content approval is separate from payment collection. Manual campaigns become
// active only after an admin/superadmin verifies that offline payment was received.
router.post("/:id/approve", authenticateStaff, requirePermission("ads.approve"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const campaign = await Advertisement.findById(req.params.id);
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });
    if (campaign.status !== "pending_review") {
      return res.status(409).json({ error: `Only campaigns pending content review can be approved. Current status: ${campaign.status}` });
    }

    const now = new Date();
    campaign.approvedBy = req.staffUser!.userId as any;
    campaign.approvedAt = now;
    campaign.reviewedBy = req.staffUser!.userId as any;
    campaign.reviewedAt = now;
    campaign.rejectionReason = undefined;

    if (campaign.paymentMethod === "manual") {
      campaign.status = "approved";
      campaign.paymentStatus = "pending";
      campaign.manualPaymentStatus = "awaiting_payment";
    } else {
      // Backward compatibility for already-existing campaigns that used the
      // previous in-app checkout flow. New submissions cannot use that flow.
      if (campaign.paymentStatus !== "paid") {
        return res.status(400).json({ error: "Legacy campaigns must have a confirmed payment before activation" });
      }
      campaign.status = "active";
      campaign.startDate = campaign.startDate || now;
      campaign.endDate = new Date(now.getTime() + campaign.campaignDurationDays * 24 * 60 * 60 * 1000);
    }
    campaign.pausedBy = undefined;
    await campaign.save();

    await AuditLog.create({
      actor: req.staffUser!.userId, actorUsername: req.staffUser!.username,
      action: "ads.approve", targetId: String(campaign._id),
      meta: { title: campaign.title, paymentMethod: campaign.paymentMethod, statusAfterApproval: campaign.status },
    });

    await notify({
      recipient: String(campaign.creator), kind: "system",
      text: campaign.paymentMethod === "manual"
        ? `Your advertisement "${campaign.title}" passed content review. Our team will contact you using your supplied email and phone to arrange payment. It will be published after payment is confirmed.`
        : `Your ad campaign "${campaign.title}" was approved and is now active!`,
    });

    return res.json({ campaign: serializeStaffCampaign(campaign, req.staffUser!.role) });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to approve campaign", details: error.message });
  }
});

// Manual payment confirmation is restricted to Admin and Super Admin.
router.post("/:id/confirm-manual-payment", authenticateStaff, requirePermission("ads.payment.verify"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const now = new Date();
    const reference = String(req.body?.reference || "").trim().slice(0, 120) || undefined;
    const filter = {
      _id: req.params.id,
      paymentMethod: "manual",
      status: "approved",
      manualPaymentStatus: "awaiting_payment",
    } as const;
    const existing = await Advertisement.findOne(filter).select("campaignDurationDays").lean();
    if (!existing) {
      const current = await Advertisement.findById(req.params.id).select("paymentMethod status manualPaymentStatus");
      if (!current) return res.status(404).json({ error: "Campaign not found" });
      return res.status(409).json({ error: "Only an approved manual-payment campaign awaiting payment can be activated. Refresh the campaign before retrying." });
    }

    const campaign = await Advertisement.findOneAndUpdate(
      filter,
      {
        $set: {
          manualPaymentStatus: "verified",
          manualPaymentVerifiedBy: req.staffUser!.userId,
          manualPaymentVerifiedAt: now,
          manualPaymentReference: reference,
          paymentStatus: "paid",
          paidAt: now,
          status: "active",
          startDate: now,
          endDate: new Date(now.getTime() + existing.campaignDurationDays * 24 * 60 * 60 * 1000),
        },
        $unset: { pausedBy: 1 },
      },
      { new: true, runValidators: true },
    );
    if (!campaign) {
      return res.status(409).json({ error: "Campaign state changed while payment was being verified. Refresh and try again." });
    }

    await AuditLog.create({
      actor: req.staffUser!.userId, actorUsername: req.staffUser!.username,
      action: "ads.manual_payment.verify", targetId: String(campaign._id),
      meta: { title: campaign.title, amountRwf: campaign.totalRwfCost, reference },
    });

    await notify({
      recipient: String(campaign.creator), kind: "payment",
      text: `Manual payment for your campaign "${campaign.title}" has been confirmed. Your advertisement is now active on Gihanga Updates.`,
    });

    return res.json({ campaign: serializeStaffCampaign(campaign, req.staffUser!.role), message: "Manual payment verified and campaign activated" });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to verify manual payment", details: error.message });
  }
});

// POST /api/v1/system/ads/:id/reject — Reject an advertisement with a required reason
router.post("/:id/reject", authenticateStaff, requirePermission("ads.approve"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { reason, autoRefund } = req.body;
    if (!reason?.trim()) return res.status(400).json({ error: "Rejection reason is required" });
    if (autoRefund && !["admin", "superadmin"].includes(req.staffUser!.role)) {
      return res.status(403).json({ error: "Only administrators can initiate legacy ad refunds" });
    }

    const campaign = await Advertisement.findById(req.params.id);
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    if (!["pending_review", "approved"].includes(campaign.status)) {
      return res.status(409).json({ error: `Campaign cannot be rejected from status ${campaign.status}` });
    }
    campaign.status = "rejected";
    campaign.rejectionReason = reason.trim();
    campaign.reviewedBy = req.staffUser!.userId as any;
    campaign.reviewedAt = new Date();
    await campaign.save();

    await AuditLog.create({
      actor: req.staffUser!.userId,
      actorUsername: req.staffUser!.username,
      action: "ads.reject",
      targetId: String(campaign._id),
      meta: { reason: reason.trim() },
    });

    await notify({
      recipient: String(campaign.creator),
      kind: "system",
      text: `Your ad campaign "${campaign.title}" was rejected. Reason: ${campaign.rejectionReason}`,
    });

    // Option to auto-refund on rejection if requested
    if (autoRefund && campaign.paymentStatus === "paid" && campaign.paymentMethod !== "manual") {
      if (campaign.paymentMethod === "gihanga_points") {
        await refundAdPoints(String(campaign._id), req.staffUser!.userId);
      } else if (campaign.paymentMethod === "real_money" && campaign.totalRwfCost > 0) {
        await applyLedgerEntry({
          userId: String(campaign.creator),
          kind: "ad_refund",
          amount: campaign.totalRwfCost,
          label: `Refund — Rejected ad "${campaign.title}"`,
        });
        campaign.paymentStatus = "refunded";
        campaign.status = "refunded";
        await campaign.save();
      }
    }

    return res.json({ campaign: serializeStaffCampaign(campaign, req.staffUser!.role) });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to reject campaign", details: error.message });
  }
});

// POST /api/v1/system/ads/:id/pause — Admin pause (user cannot unpause directly)
router.post("/:id/pause", authenticateStaff, requirePermission("ads.manage"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const campaign = await Advertisement.findById(req.params.id);
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    campaign.status = "paused";
    campaign.pausedBy = req.staffUser!.userId as any;
    await campaign.save();

    await AuditLog.create({
      actor: req.staffUser!.userId,
      actorUsername: req.staffUser!.username,
      action: "ads.pause",
      targetId: String(campaign._id),
    });

    return res.json({ campaign });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to pause campaign", details: error.message });
  }
});

// POST /api/v1/system/ads/:id/resume — Admin resume
router.post("/:id/resume", authenticateStaff, requirePermission("ads.manage"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const campaign = await Advertisement.findById(req.params.id);
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    campaign.status = "active";
    campaign.pausedBy = undefined;
    await campaign.save();

    await AuditLog.create({
      actor: req.staffUser!.userId,
      actorUsername: req.staffUser!.username,
      action: "ads.resume",
      targetId: String(campaign._id),
    });

    return res.json({ campaign });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to resume campaign", details: error.message });
  }
});

// POST /api/v1/system/ads/:id/disable — Permanently disable campaign
router.post("/:id/disable", authenticateStaff, requirePermission("ads.manage"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const campaign = await Advertisement.findById(req.params.id);
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    campaign.status = "cancelled";
    campaign.disabledBy = req.staffUser!.userId as any;
    await campaign.save();

    await AuditLog.create({
      actor: req.staffUser!.userId,
      actorUsername: req.staffUser!.username,
      action: "ads.disable",
      targetId: String(campaign._id),
    });

    return res.json({ campaign });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to disable campaign", details: error.message });
  }
});


// DELETE /api/v1/system/ads/:id — remove a campaign from public delivery.
// This is an audited soft removal: retain payment and moderation history, but
// make the campaign ineligible for Feed, Stories and Reels immediately.
router.delete("/:id", authenticateStaff, requirePermission("ads.remove"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const campaign = await Advertisement.findById(req.params.id);
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });
    if (campaign.status === "cancelled") {
      return res.json({ success: true, campaign: serializeStaffCampaign(campaign, req.staffUser!.role), message: "Campaign was already removed" });
    }

    const previousStatus = campaign.status;
    campaign.status = "cancelled";
    campaign.disabledBy = req.staffUser!.userId as any;
    campaign.pausedBy = undefined;
    await campaign.save();

    await AuditLog.create({
      actor: req.staffUser!.userId,
      actorUsername: req.staffUser!.username,
      action: "ads.remove",
      targetId: String(campaign._id),
      meta: { title: campaign.title, previousStatus },
    });

    // Notification delivery is best-effort: the audited removal and public
    // delivery stop must remain successful even if the notification provider
    // is temporarily unavailable.
    try {
      await notify({
        recipient: String(campaign.creator),
        kind: "system",
        text: `Your advertisement campaign "${campaign.title}" was removed from public delivery by the Gihanga Updates moderation team. Contact support if you need more information.`,
      });
    } catch (notificationError) {
      console.warn("[Ads] Campaign was removed but advertiser notification failed:", notificationError);
    }

    return res.json({
      success: true,
      campaign: serializeStaffCampaign(campaign, req.staffUser!.role),
      message: "Advertisement removed from public delivery",
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to remove advertisement", details: error.message });
  }
});

// POST /api/v1/system/ads/:id/refund — Process a refund (points or money) for a campaign
router.post("/:id/refund", authenticateStaff, requirePermission("ads.manage"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const campaign = await Advertisement.findById(req.params.id);
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    if (campaign.paymentStatus !== "paid" && campaign.paymentStatus !== "refund_pending") {
      return res.status(400).json({ error: "Campaign is not in a paid state eligible for refund" });
    }

    if (campaign.paymentMethod === "gihanga_points") {
      const result = await refundAdPoints(String(campaign._id), req.staffUser!.userId);
      if (!result.success) return res.status(400).json({ error: result.error });

      await AuditLog.create({
        actor: req.staffUser!.userId,
        actorUsername: req.staffUser!.username,
        action: "ads.refund.points",
        targetId: String(campaign._id),
        meta: { pointsReturned: result.pointsReturned },
      });

      return res.json({ success: true, message: `${result.pointsReturned} Gihanga Points refunded`, campaign });
    } else if (campaign.paymentMethod === "real_money") {
      await applyLedgerEntry({
        userId: String(campaign.creator),
        kind: "ad_refund",
        amount: campaign.totalRwfCost,
        label: `Ad refund — "${campaign.title}"`,
      });

      campaign.paymentStatus = "refunded";
      campaign.status = "refunded";
      await campaign.save();

      await AuditLog.create({
        actor: req.staffUser!.userId,
        actorUsername: req.staffUser!.username,
        action: "ads.refund.money",
        targetId: String(campaign._id),
        meta: { rwfRefunded: campaign.totalRwfCost },
      });

      await notify({
        recipient: String(campaign.creator),
        kind: "payment",
        text: `Your payment of ${campaign.totalRwfCost.toLocaleString()} RWF for ad "${campaign.title}" has been refunded to your wallet.`,
      });

      return res.json({ success: true, message: `${campaign.totalRwfCost} RWF refunded to wallet balance`, campaign });
    } else {
      return res.status(400).json({ error: "Unknown payment method on campaign" });
    }
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to process refund", details: error.message });
  }
});

export default router;
