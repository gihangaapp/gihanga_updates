import { Router, Response } from "express";
import { Advertisement, AdType, AdPlacement } from "../../../models/Advertisement";
import { User } from "../../../models/User";
import { Wallet } from "../../../models/Wallet";
import { Transaction } from "../../../models/Transaction";
import { authenticateConsumer, AuthenticatedRequest } from "../../../middleware/rbac";
import { getAdConfig } from "../../../lib/adConfig";
import { calculateAdPrice, validateAdMinutes, validateCampaignDays } from "../../../lib/adPricing";
import { payAdWithPoints } from "../../../lib/adPoints";
import { applyLedgerEntry } from "../../../lib/wallet";
import { notifyStaff } from "../../../lib/staffNotify";
import { notify } from "../../../lib/notify";

const router = Router();

// GET /api/v1/ads/config — Get public ad configuration and pricing rates
router.get("/config", async (_req, res: Response) => {
  try {
    const config = await getAdConfig();
    return res.json({ config });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load advertising configuration", details: error.message });
  }
});

// POST /api/v1/ads/calculate-price — Authoritative server-side price calculator
router.post("/calculate-price", async (req, res: Response) => {
  try {
    const { advertisingMinutes, campaignDurationDays } = req.body;
    const minutes = Number(advertisingMinutes) || 1;
    const days = Number(campaignDurationDays) || 1;

    const config = await getAdConfig();
    const minutesCheck = validateAdMinutes(minutes, config);
    if (!minutesCheck.valid) return res.status(400).json({ error: minutesCheck.error });

    const daysCheck = validateCampaignDays(days, config);
    if (!daysCheck.valid) return res.status(400).json({ error: daysCheck.error });

    const price = calculateAdPrice({ advertisingMinutes: minutes, campaignDurationDays: days }, config);
    return res.json({ price });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to calculate advertisement price", details: error.message });
  }
});

// GET /api/v1/ads — Current user's advertising campaigns
router.get("/", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const campaigns = await Advertisement.find({
      creator: req.user!.userId,
      _legacySystem: { $ne: true },
    }).sort({ createdAt: -1 });

    return res.json({ campaigns });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load campaigns", details: error.message });
  }
});

// POST /api/v1/ads — Create a new advertisement campaign draft
router.post("/", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const {
      adType,
      placement,
      title,
      caption,
      ctaText,
      ctaUrl,
      mediaUrl,
      mediaKey,
      mediaType,
      videoDurationSeconds,
      thumbnailUrl,
      campaignDurationDays,
      advertisingMinutes,
      targeting,
    } = req.body;

    if (!title?.trim()) return res.status(400).json({ error: "Title is required" });
    if (!["image", "video", "story_image", "story_video"].includes(adType)) {
      return res.status(400).json({ error: "Invalid advertisement type" });
    }
    if (!["feed", "story"].includes(placement)) {
      return res.status(400).json({ error: "Invalid placement" });
    }

    const config = await getAdConfig();
    if (!config.enabled) return res.status(403).json({ error: "Advertising is currently disabled" });

    const minutes = Number(advertisingMinutes) || 1;
    const minutesCheck = validateAdMinutes(minutes, config);
    if (!minutesCheck.valid) return res.status(400).json({ error: minutesCheck.error });

    const days = Number(campaignDurationDays) || 1;
    const daysCheck = validateCampaignDays(days, config);
    if (!daysCheck.valid) return res.status(400).json({ error: daysCheck.error });

    if (mediaType === "video" && videoDurationSeconds) {
      if (Number(videoDurationSeconds) > config.maxVideoDurationSeconds) {
        return res.status(400).json({
          error: `Video duration cannot exceed ${config.maxVideoDurationSeconds} seconds`,
        });
      }
    }

    const price = calculateAdPrice({ advertisingMinutes: minutes, campaignDurationDays: days }, config);

    const campaign = await Advertisement.create({
      creator: req.user!.userId,
      isCreator: Boolean(user.isCreator),
      adType,
      placement,
      title: title.trim().slice(0, 100),
      caption: caption?.trim(),
      ctaText: ctaText?.trim() || "Learn More",
      ctaUrl: ctaUrl?.trim(),
      mediaUrl,
      mediaKey,
      mediaType,
      videoDurationSeconds: videoDurationSeconds ? Number(videoDurationSeconds) : undefined,
      thumbnailUrl,
      campaignDurationDays: days,
      advertisingMinutes: minutes,
      rwfPricePerMinute: price.rwfPerMinute,
      gpPricePerMinute: price.gpPerMinute,
      totalRwfCost: price.rwfTotal,
      totalGpCost: price.gpTotal,
      paymentStatus: "unpaid",
      status: "draft",
      targeting: targeting || {},
    });

    return res.status(201).json({ campaign, price });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to create campaign draft", details: error.message });
  }
});

// GET /api/v1/ads/:id — View single campaign details
router.get("/:id", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const campaign = await Advertisement.findOne({
      _id: req.params.id,
      creator: req.user!.userId,
      _legacySystem: { $ne: true },
    });
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    return res.json({ campaign });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch campaign", details: error.message });
  }
});

// PATCH /api/v1/ads/:id — Update draft or pause/resume active campaign
router.patch("/:id", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const campaign = await Advertisement.findOne({
      _id: req.params.id,
      creator: req.user!.userId,
      _legacySystem: { $ne: true },
    });
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    const { status, title, caption, ctaText, ctaUrl, mediaUrl, thumbnailUrl } = req.body;

    // Pause/Resume toggle for active/paused campaigns
    if (status && ["paused", "active"].includes(status)) {
      if (!["active", "paused"].includes(campaign.status)) {
        return res.status(400).json({ error: `Cannot change status to ${status} from ${campaign.status}` });
      }
      // If paused by admin, user cannot unpause
      if (status === "active" && campaign.pausedBy) {
        return res.status(403).json({ error: "Campaign was paused by platform administration and cannot be resumed directly" });
      }
      campaign.status = status;
    }

    // Editable draft fields
    if (campaign.status === "draft" || campaign.status === "pending_payment") {
      if (title) campaign.title = title.trim().slice(0, 100);
      if (caption !== undefined) campaign.caption = caption.trim();
      if (ctaText !== undefined) campaign.ctaText = ctaText.trim();
      if (ctaUrl !== undefined) campaign.ctaUrl = ctaUrl.trim();
      if (mediaUrl !== undefined) campaign.mediaUrl = mediaUrl;
      if (thumbnailUrl !== undefined) campaign.thumbnailUrl = thumbnailUrl;
    }

    await campaign.save();
    return res.json({ campaign });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to update campaign", details: error.message });
  }
});

// DELETE /api/v1/ads/:id — Delete draft or cancelled advertisement
router.delete("/:id", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const campaign = await Advertisement.findOne({
      _id: req.params.id,
      creator: req.user!.userId,
      _legacySystem: { $ne: true },
    });
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    if (campaign.paymentStatus === "paid" && campaign.status !== "rejected" && campaign.status !== "draft") {
      return res.status(400).json({ error: "Paid campaigns cannot be deleted directly. Request cancellation/refund first." });
    }

    await campaign.deleteOne();
    return res.status(204).end();
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to delete campaign", details: error.message });
  }
});

// POST /api/v1/ads/:id/pay/points — Pay for advertisement using Gihanga Points (atomic)
router.post("/:id/pay/points", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const idempotencyKey = String(req.get("Idempotency-Key") || req.body?.idempotencyKey || "").trim();
    const campaignId = String(req.params.id);
    const result = await payAdWithPoints(req.user!.userId, campaignId, idempotencyKey);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    if (result.ad) {
      await notifyStaff("ads", `New ad campaign paid with Gihanga Points awaiting review: "${result.ad.title}"`, {
        campaignId: String(result.ad._id),
      });
    }

    return res.json({
      success: true,
      campaign: result.ad,
      transaction: result.transaction,
      pointsBefore: result.pointsBefore,
      pointsDeducted: result.pointsDeducted,
      pointsAfter: result.pointsAfter,
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Points payment failed", details: error.message });
  }
});

// POST /api/v1/ads/:id/pay/money — Pay for advertisement using Real Money (Wallet available balance)
router.post("/:id/pay/money", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const ad = await Advertisement.findOne({
      _id: req.params.id,
      creator: userId,
      _legacySystem: { $ne: true },
    });

    if (!ad) return res.status(404).json({ error: "Advertisement not found" });
    if (ad.paymentStatus === "paid") return { error: "This advertisement has already been paid" };
    if (ad.status !== "pending_payment" && ad.status !== "draft") {
      return res.status(400).json({ error: `Cannot pay for an advertisement with status: ${ad.status}` });
    }

    const config = await getAdConfig();
    const price = calculateAdPrice({ advertisingMinutes: ad.advertisingMinutes, campaignDurationDays: ad.campaignDurationDays }, config);
    const rwfCost = price.rwfTotal;

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) return res.status(404).json({ error: "Wallet not found" });
    if (wallet.frozen) return res.status(403).json({ error: "Your wallet is frozen — contact support" });
    if (wallet.available < rwfCost) {
      return res.status(400).json({
        error: `Insufficient available balance in wallet. Required: ${rwfCost.toLocaleString()} RWF, Available: ${wallet.available.toLocaleString()} RWF`,
      });
    }

    const idempotencyKey = String(req.get("Idempotency-Key") || req.body?.idempotencyKey || "").trim();
    if (idempotencyKey) {
      const prior = await Transaction.findOne({ user: userId, kind: "ad_payment", idempotencyKey });
      if (prior) return res.json({ campaign: ad, transaction: prior, message: "Payment already processed" });
    }

    // Deduct RWF from wallet balance
    const { transaction } = await applyLedgerEntry({
      userId,
      kind: "ad_payment",
      amount: -rwfCost,
      label: `Real Money — Ad payment: "${ad.title}" (${ad.advertisingMinutes} min @ ${price.rwfPerMinute.toLocaleString()} RWF/min)`,
    });

    ad.paymentMethod = "real_money";
    ad.paymentStatus = "paid";
    ad.status = "pending_review"; // Payment NEVER auto-publishes
    ad.rwfPricePerMinute = price.rwfPerMinute;
    ad.gpPricePerMinute = price.gpPerMinute;
    ad.totalRwfCost = rwfCost;
    ad.totalGpCost = price.gpTotal;
    ad.paymentTransactionId = transaction._id as any;
    ad.paymentIdempotencyKey = idempotencyKey || undefined;
    ad.paidAt = new Date();
    await ad.save();

    await notify({
      recipient: userId,
      kind: "payment",
      text: `Payment of ${rwfCost.toLocaleString()} RWF received for ad "${ad.title}". It is now pending review.`,
    });

    await notifyStaff("ads", `New ad campaign paid with Real Money awaiting review: "${ad.title}"`, {
      campaignId: String(ad._id),
    });

    return res.json({ success: true, campaign: ad, transaction });
  } catch (error: any) {
    return res.status(500).json({ error: "Real money payment failed", details: error.message });
  }
});

// ─── AD DELIVERY ENGINE & TRACKING ──────────────────────────────────────────

// GET /api/v1/ads/delivery/feed — Get eligible sponsored advertisements for the feed
router.get("/delivery/feed", async (req, res: Response) => {
  try {
    const config = await getAdConfig();
    if (!config.enabled) return res.json({ ads: [] });

    const now = new Date();
    const ads = await Advertisement.find({
      placement: "feed",
      status: "active",
      paymentStatus: "paid",
      _legacySystem: { $ne: true },
      $or: [{ endDate: { $gte: now } }, { endDate: { $exists: false } }],
    })
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate("creator", "name username avatarHue avatarUrl verified isCreator");

    return res.json({ ads });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to deliver feed ads", details: error.message });
  }
});

// GET /api/v1/ads/delivery/story — Get eligible sponsored advertisements for stories
router.get("/delivery/story", async (req, res: Response) => {
  try {
    const config = await getAdConfig();
    if (!config.enabled) return res.json({ ads: [] });

    const now = new Date();
    const ads = await Advertisement.find({
      placement: "story",
      status: "active",
      paymentStatus: "paid",
      _legacySystem: { $ne: true },
      $or: [{ endDate: { $gte: now } }, { endDate: { $exists: false } }],
    })
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate("creator", "name username avatarHue avatarUrl verified isCreator");

    return res.json({ ads });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to deliver story ads", details: error.message });
  }
});

// POST /api/v1/ads/:id/impression — Record an impression
router.post("/:id/impression", async (req, res: Response) => {
  try {
    const ad = await Advertisement.findById(req.params.id);
    if (!ad || ad.status !== "active") return res.status(204).end();

    ad.analytics.impressions += 1;
    if (ad.analytics.impressions > 0) {
      ad.analytics.ctr = Number(((ad.analytics.clicks / ad.analytics.impressions) * 100).toFixed(2));
    }
    await ad.save();
    return res.status(204).end();
  } catch {
    return res.status(204).end();
  }
});

// POST /api/v1/ads/:id/click — Record a click
router.post("/:id/click", async (req, res: Response) => {
  try {
    const ad = await Advertisement.findById(req.params.id);
    if (!ad || ad.status !== "active") return res.status(204).end();

    ad.analytics.clicks += 1;
    if (ad.analytics.impressions > 0) {
      ad.analytics.ctr = Number(((ad.analytics.clicks / ad.analytics.impressions) * 100).toFixed(2));
    }
    await ad.save();
    return res.status(204).end();
  } catch {
    return res.status(204).end();
  }
});

// POST /api/v1/ads/:id/view — Record a view (consumes advertising minutes)
router.post("/:id/view", async (req, res: Response) => {
  try {
    const { seconds } = req.body;
    const viewSeconds = Math.max(1, Number(seconds) || 1);

    const ad = await Advertisement.findById(req.params.id);
    if (!ad || ad.status !== "active") return res.status(204).end();

    ad.analytics.views += 1;
    ad.analytics.totalWatchSeconds += viewSeconds;

    // Convert accumulated watch seconds to delivered advertising minutes
    const deliveredMinutes = ad.analytics.totalWatchSeconds / 60;
    ad.advertisingMinutesDelivered = Number(deliveredMinutes.toFixed(2));

    // If quota reached, complete campaign
    if (ad.advertisingMinutesDelivered >= ad.advertisingMinutes) {
      ad.status = "expired";
      await notify({
        recipient: String(ad.creator),
        kind: "system",
        text: `Your advertisement campaign "${ad.title}" has reached its full quota of ${ad.advertisingMinutes} minute(s) and is now completed.`,
      });
    }

    await ad.save();
    return res.status(204).end();
  } catch {
    return res.status(204).end();
  }
});

// POST /api/v1/ads/:id/engagement — Record engagement (like, share, save)
router.post("/:id/engagement", async (req, res: Response) => {
  try {
    const { action } = req.body;
    const ad = await Advertisement.findById(req.params.id);
    if (!ad || ad.status !== "active") return res.status(204).end();

    if (action === "like") ad.analytics.likes += 1;
    else if (action === "share") ad.analytics.shares += 1;
    else if (action === "save") ad.analytics.saves += 1;

    await ad.save();
    return res.status(204).end();
  } catch {
    return res.status(204).end();
  }
});

export default router;
