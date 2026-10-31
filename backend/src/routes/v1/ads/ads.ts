import { Router, Response } from "express";
import { Types } from "mongoose";
import { Advertisement, AdPlacement } from "../../../models/Advertisement";
import { AdComment } from "../../../models/AdComment";
import { Like } from "../../../models/Like";
import { User } from "../../../models/User";
import { authenticateConsumer, authenticateConsumerOrStaff, AuthenticatedRequest } from "../../../middleware/rbac";
import { optionalAuth } from "../../../middleware/optionalAuth";
import { verifyStaffAccessToken } from "../../../lib/jwt";
import { UserInteraction } from "../../../models/UserInteraction";
import { getAdConfig } from "../../../lib/adConfig";
import { calculateAdPrice, validateAdMinutes, validateCampaignDays } from "../../../lib/adPricing";
import { notifyStaff } from "../../../lib/staffNotify";
import { notify } from "../../../lib/notify";
import { moderationActive } from "../../../middleware/upload";
import { moderateText, persistAssessment, decisionToStatus } from "../../../services/moderation/contentModerationService";
import { normalizeRwandaPhone } from "../../../lib/phone";

const router = Router();

function publicAdFilter() {
  return {
    status: "active",
    paymentStatus: "paid",
    $and: [
      { $or: [{ paymentMethod: { $ne: "manual" } }, { manualPaymentStatus: "verified" }] },
      { $or: [{ endDate: { $gte: new Date() } }, { endDate: { $exists: false } }] },
    ],
  };
}

const AD_REACTIONS = ["like", "love", "care", "haha", "wow", "sad", "angry"] as const;
type AdReaction = (typeof AD_REACTIONS)[number];

/** Ad delivery may be viewed from either a consumer session or a staff session.
 * Normalize staff identity only for user-specific ad frequency/preferences and
 * engagement state; this does not grant any staff permissions. */
function optionalAdAuth(req: AuthenticatedRequest, res: Response, next: () => void) {
  optionalAuth(req, res, () => {
    if (req.user) return next();
    const header = req.headers.authorization;
    const credential = header?.startsWith("Bearer ")
      ? header.split(" ")[1]
      : typeof req.query?.staffToken === "string" ? req.query.staffToken : undefined;
    if (credential) {
      try {
        const staff = verifyStaffAccessToken(credential);
        req.user = {
          userId: staff.userId,
          username: staff.username,
          email: staff.email,
          role: "user",
          isCreator: false,
          type: "access",
        };
      } catch {
        // Continue as an anonymous viewer when no valid session is supplied.
      }
    }
    next();
  });
}


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
    }).sort({ createdAt: -1 }).populate("creator", "name username avatarHue avatarUrl isCreator verified");

    return res.json({ campaigns });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load campaigns", details: error.message });
  }
});

// POST /api/v1/ads — Submit a campaign for content review and manual payment follow-up.
router.post("/", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const {
      adType, placement, title, caption, ctaText, ctaUrl, mediaUrl, mediaKey,
      mediaType, videoDurationSeconds, thumbnailUrl, campaignDurationDays,
      advertisingMinutes, targeting, contactName, contactEmail, contactPhone,
    } = req.body;

    if (!title?.trim()) return res.status(400).json({ error: "Title is required" });
    if (!mediaUrl?.trim()) return res.status(400).json({ error: "Please upload an image or video for your advertisement" });
    if (!/[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+/i.test(String(contactEmail || "").trim())) {
      return res.status(400).json({ error: "Enter a valid contact email address" });
    }
    let normalizedPhone: string;
    try { normalizedPhone = normalizeRwandaPhone(contactPhone); }
    catch { return res.status(400).json({ error: "Enter a valid Rwanda contact phone number in the format +250 7XX XXX XXX" }); }
    const normalizedEmail = String(contactEmail).trim().toLowerCase();
    const destination = String(ctaUrl || "").trim();
    if (destination) {
      try {
        const parsed = new URL(destination);
        if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("unsupported protocol");
      } catch {
        return res.status(400).json({ error: "Destination link must be a valid http or https URL" });
      }
    }
    if (!["image", "video", "story_image", "story_video"].includes(adType)) {
      return res.status(400).json({ error: "Invalid advertisement type" });
    }
    if (!["feed", "story", "reels"].includes(placement)) {
      return res.status(400).json({ error: "Invalid placement" });
    }
    if ((placement === "story" && !String(adType).startsWith("story_")) || (placement !== "story" && String(adType).startsWith("story_"))) {
      return res.status(400).json({ error: "Advertisement type does not match the selected placement" });
    }

    const config = await getAdConfig();
    if (!config.enabled) return res.status(403).json({ error: "Advertising is currently disabled" });

    const minutes = Number(advertisingMinutes) || 1;
    const minutesCheck = validateAdMinutes(minutes, config);
    if (!minutesCheck.valid) return res.status(400).json({ error: minutesCheck.error });
    const days = Number(campaignDurationDays) || 1;
    const daysCheck = validateCampaignDays(days, config);
    if (!daysCheck.valid) return res.status(400).json({ error: daysCheck.error });

    if (mediaType === "video" && videoDurationSeconds && Number(videoDurationSeconds) > config.maxVideoDurationSeconds) {
      return res.status(400).json({ error: `Video duration cannot exceed ${config.maxVideoDurationSeconds} seconds` });
    }

    const price = calculateAdPrice({ advertisingMinutes: minutes, campaignDurationDays: days }, config);
    const cleanInterests = Array.isArray(targeting?.interests)
      ? [...new Set(targeting.interests.map((value: unknown) => String(value).trim().toLowerCase()).filter(Boolean))].slice(0, 20)
      : [];
    const cleanLocation = typeof targeting?.location === "string" ? targeting.location.trim().slice(0, 100) : "";

    const campaign = await Advertisement.create({
      creator: req.user!.userId,
      isCreator: Boolean(user.isCreator),
      adType, placement,
      title: title.trim().slice(0, 100),
      caption: String(caption || "").trim().slice(0, 300),
      ctaText: String(ctaText || "Learn More").trim().slice(0, 30),
      ctaUrl: destination || undefined,
      mediaUrl: String(mediaUrl).trim(), mediaKey, mediaType,
      videoDurationSeconds: videoDurationSeconds ? Number(videoDurationSeconds) : undefined,
      thumbnailUrl,
      campaignDurationDays: days, advertisingMinutes: minutes,
      rwfPricePerMinute: price.rwfPerMinute, gpPricePerMinute: 0,
      totalRwfCost: price.rwfTotal, totalGpCost: 0,
      paymentMethod: "manual", paymentStatus: "pending",
      manualPaymentStatus: "awaiting_payment",
      manualPaymentContact: {
        name: String(contactName || user.name).trim().slice(0, 100),
        email: normalizedEmail, phone: normalizedPhone,
      },
      status: "pending_review",
      targeting: { interests: cleanInterests, location: cleanLocation || undefined },
    });

    await notifyStaff("ads", `New ad campaign submitted for review: "${campaign.title}"`, { campaignId: String(campaign._id) });
    await notify({
      recipient: String(user._id), kind: "system",
      text: `Your campaign "${campaign.title}" was submitted for review. Our team will review the creative and contact you using the details you provided for manual payment.`,
    });

    return res.status(201).json({ campaign, price, message: "Campaign submitted for review. Payment is handled manually outside Gihanga Updates." });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to submit advertisement campaign", details: error.message });
  }
});

// Public ad engagement is separate from organic post engagement. Only active,
// paid campaigns can be liked, commented on, shared, or reacted to.
router.get("/:id/engagement", optionalAdAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ad = await Advertisement.findOne({ _id: req.params.id, ...publicAdFilter() }).select("_id analytics.likes analytics.shares").lean();
    if (!ad) return res.status(404).json({ error: "Advertisement not found" });
    const [commentsCount, current] = await Promise.all([
      AdComment.countDocuments({ ad: ad._id, hidden: false }),
      req.user?.userId ? Like.findOne({ target: ad._id, kind: "ad", user: req.user.userId }).select("reaction").lean() : null,
    ]);
    return res.json({
      liked: Boolean(current),
      reaction: (current as any)?.reaction || (current ? "like" : null),
      likesCount: ad.analytics?.likes || 0,
      commentsCount,
      sharesCount: ad.analytics?.shares || 0,
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load advertisement engagement", details: error.message });
  }
});

router.post("/:id/reaction", authenticateConsumerOrStaff, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const rawReaction = req.body?.reaction;
    const reaction = rawReaction === null ? null : String(rawReaction || "like").toLowerCase();
    if (reaction !== null && !AD_REACTIONS.includes(reaction as AdReaction)) {
      return res.status(400).json({ error: "Unsupported advertisement reaction" });
    }
    const ad = await Advertisement.findOne({ _id: req.params.id, ...publicAdFilter() }).select("_id analytics.likes");
    if (!ad) return res.status(404).json({ error: "Advertisement not found or not currently active" });

    const userId = req.user!.userId;
    const existing = await Like.findOne({ user: userId, target: ad._id, kind: "ad" });
    let nextReaction: AdReaction | null = reaction as AdReaction | null;
    let countDelta = 0;

    if (existing && reaction === null) {
      await Like.deleteOne({ _id: existing._id });
      nextReaction = null;
      countDelta = -1;
    } else if (existing && existing.reaction === reaction) {
      await Like.deleteOne({ _id: existing._id });
      nextReaction = null;
      countDelta = -1;
    } else if (existing && reaction) {
      existing.reaction = reaction as AdReaction;
      await existing.save();
    } else if (reaction) {
      try {
        await Like.create({ user: userId, target: ad._id, kind: "ad", reaction });
        countDelta = 1;
      } catch (error: any) {
        if (error?.code !== 11000) throw error;
        const raced = await Like.findOne({ user: userId, target: ad._id, kind: "ad" });
        if (raced) {
          raced.reaction = reaction as AdReaction;
          await raced.save();
        }
      }
    }

    if (countDelta === 1) {
      await Advertisement.updateOne({ _id: ad._id }, { $inc: { "analytics.likes": 1 } });
    } else if (countDelta === -1) {
      // Preserve legacy aggregate counts, and never let the total go negative.
      await Advertisement.updateOne(
        { _id: ad._id, "analytics.likes": { $gt: 0 } },
        { $inc: { "analytics.likes": -1 } },
      );
    }
    await UserInteraction.create({
      user: userId,
      targetKind: "ad",
      targetId: ad._id,
      event: nextReaction ? (nextReaction === "like" ? "ad_like" : "ad_reaction") : "ad_unlike",
      metadata: { reaction: nextReaction },
    });
    const refreshed = await Advertisement.findById(ad._id).select("analytics.likes").lean();
    const likesCount = refreshed?.analytics?.likes || 0;
    return res.json({ liked: Boolean(nextReaction), reaction: nextReaction, likesCount });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to update advertisement reaction", details: error.message });
  }
});

router.get("/:id/comments", optionalAdAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ad = await Advertisement.findOne({ _id: req.params.id, ...publicAdFilter() }).select("_id").lean();
    if (!ad) return res.status(404).json({ error: "Advertisement not found" });
    const limit = Math.min(Math.max(Number(req.query.limit) || 30, 1), 50);
    const [comments, total] = await Promise.all([
      AdComment.find({ ad: ad._id, hidden: false })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("author", "name username avatarHue avatarUrl isCreator verified")
        .lean(),
      AdComment.countDocuments({ ad: ad._id, hidden: false }),
    ]);
    return res.json({ comments, total });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load advertisement comments", details: error.message });
  }
});

router.post("/:id/comments", authenticateConsumerOrStaff, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const body = String(req.body?.body || "").trim();
    if (!body) return res.status(400).json({ error: "Comment cannot be empty" });
    if (body.length > 1000) return res.status(400).json({ error: "Comment must be 1,000 characters or fewer" });

    const ad = await Advertisement.findOne({ _id: req.params.id, ...publicAdFilter() }).select("_id creator title");
    if (!ad) return res.status(404).json({ error: "Advertisement not found or not currently active" });

    const shouldModerate = moderationActive();
    const comment = await AdComment.create({
      ad: ad._id,
      author: req.user!.userId,
      body,
      hidden: shouldModerate,
      ...(shouldModerate ? { moderation: { status: "processing", updatedAt: new Date() } } : {}),
    });

    if (shouldModerate) {
      try {
        const result = await moderateText({ text: body, surface: "comment" });
        const record = await persistAssessment({
          contentType: "comment",
          contentId: String(comment._id),
          authorId: req.user!.userId,
          surface: "comment",
        }, result);
        comment.hidden = result.decision !== "APPROVED";
        comment.moderation = {
          status: decisionToStatus(result.decision) as any,
          record: record._id,
          userMessage: result.userMessage,
          updatedAt: new Date(),
        };
        await comment.save();
        if (result.decision === "REJECTED") {
          return res.status(422).json({ error: result.userMessage || "This comment could not be posted.", moderation: { status: "rejected" } });
        }
        if (result.decision !== "APPROVED") {
          return res.status(202).json({ comment: null, moderation: { status: decisionToStatus(result.decision) }, pendingNotice: "Your comment is awaiting review." });
        }
      } catch (error: any) {
        await AdComment.deleteOne({ _id: comment._id });
        return res.status(503).json({ error: "Comments are temporarily unavailable. Please try again." });
      }
    }

    await Advertisement.updateOne({ _id: ad._id }, { $inc: { "analytics.comments": 1 } });
    await UserInteraction.create({ user: req.user!.userId, targetKind: "ad", targetId: ad._id, event: "ad_comment" });
    const populated = await comment.populate("author", "name username avatarHue avatarUrl isCreator verified");
    return res.status(201).json({ comment: populated, total: await AdComment.countDocuments({ ad: ad._id, hidden: false }) });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to post advertisement comment", details: error.message });
  }
});

router.post("/:id/share", authenticateConsumerOrStaff, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ad = await Advertisement.findOneAndUpdate(
      { _id: req.params.id, ...publicAdFilter() },
      { $inc: { "analytics.shares": 1 } },
      { new: true },
    ).select("analytics.shares");
    if (!ad) return res.status(404).json({ error: "Advertisement not found or not currently active" });
    await UserInteraction.create({ user: req.user!.userId, targetKind: "ad", targetId: req.params.id, event: "ad_share" });
    return res.json({ sharesCount: ad.analytics?.shares || 0 });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to record advertisement share", details: error.message });
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

// Online ad checkout is intentionally disabled. Gihanga ad payments are collected
// offline and verified by authorized staff before delivery.
router.post("/:id/pay/points", authenticateConsumer, async (_req, res: Response) => {
  return res.status(410).json({ error: "Online Gihanga Points payment is disabled for advertisements. Submit your contact details and our team will arrange manual payment." });
});

router.post("/:id/pay/money", authenticateConsumer, async (_req, res: Response) => {
  return res.status(410).json({ error: "Online payment is disabled for advertisements. Submit your contact details and our team will arrange manual payment." });
});

// ─── AD DELIVERY ENGINE & TRACKING ──────────────────────────────────────────

// Delivery candidates are restricted to campaigns that passed content review AND
// have a verified manual payment (or were paid through the legacy system before
// the manual-payment workflow was introduced).
async function deliverAds(placement: AdPlacement, req: AuthenticatedRequest, res: Response) {
  try {
    const config = await getAdConfig();
    if (!config.enabled) return res.json({ ads: [] });

    const now = new Date();
    // Keep campaign states consistent when calendar duration has elapsed.
    await Advertisement.updateMany(
      { placement, status: "active", endDate: { $lt: now } },
      { $set: { status: "expired" } },
    );
    const userId = req.user?.userId;
    const user = userId ? await User.findById(userId).select("interests").lean() : null;
    const userInterests = [...new Set((user?.interests || []).map((value: string) => String(value).trim().toLowerCase()).filter(Boolean))];
    // If a viewer has not provided interests, do not exclude interest-targeted
    // ads entirely; without preference data, all otherwise eligible campaigns
    // remain candidates. Known interests narrow the candidates below.
    const targetingEligibility = userInterests.length
      ? { $or: [
          { "targeting.interests": { $exists: false } },
          { "targeting.interests": { $size: 0 } },
          { "targeting.interests": { $in: userInterests } },
        ] }
      : null;
    const query: any = {
      placement,
      status: "active",
      paymentStatus: "paid",
      _legacySystem: { $ne: true },
      ...(userId ? { creator: { $ne: userId } } : {}),
      $and: [
        { $or: [{ paymentMethod: { $ne: "manual" } }, { manualPaymentStatus: "verified" }] },
        { $or: [{ endDate: { $gte: now } }, { endDate: { $exists: false } }] },
        ...(targetingEligibility ? [targetingEligibility] : []),
      ],
    };
    const candidates = await Advertisement.find(query)
      // Public delivery responses must never expose advertiser contact details,
      // payment references, review metadata, or internal targeting data.
      .select("creator adType placement title caption ctaText ctaUrl mediaUrl mediaKey mediaType videoDurationSeconds thumbnailUrl analytics.impressions analytics.views analytics.clicks analytics.likes analytics.comments analytics.shares analytics.ctr createdAt")
      .sort({ "analytics.impressions": 1, createdAt: 1 })
      .limit(100)
      .populate("creator", "name username avatarHue avatarUrl verified isCreator");

    let eligible = candidates;

    if (userId && eligible.length) {
      const cutoff = new Date(Date.now() - 60 * 60 * 1000);
      const ids = eligible.map((ad) => ad._id);
      const impressions = await UserInteraction.aggregate([
        { $match: { user: new Types.ObjectId(userId), targetKind: "ad", event: "ad_impression", targetId: { $in: ids }, createdAt: { $gte: cutoff } } },
        { $group: { _id: "$targetId", count: { $sum: 1 } } },
      ]);
      const counts = new Map(impressions.map((item: any) => [String(item._id), Number(item.count)]));
      eligible = eligible.filter((ad) => (counts.get(String(ad._id)) || 0) < config.frequencyCapPerHour);
      const hidden = await UserInteraction.find({
        user: userId, targetKind: "ad", event: "ad_hide", targetId: { $in: eligible.map((ad) => ad._id) },
      }).distinct("targetId");
      const hiddenIds = new Set(hidden.map(String));
      eligible = eligible.filter((ad) => !hiddenIds.has(String(ad._id)));
    }

    const deliveryLimit = placement === "feed" ? 20 : placement === "story" ? 10 : 12;
    const delivered = eligible.slice(0, deliveryLimit);
    const deliveredIds = delivered.map((ad) => ad._id);
    const [commentCounts, viewerLikes] = await Promise.all([
      AdComment.aggregate([
        { $match: { ad: { $in: deliveredIds }, hidden: false } },
        { $group: { _id: "$ad", count: { $sum: 1 } } },
      ]),
      userId ? Like.find({ user: userId, kind: "ad", target: { $in: deliveredIds } }).select("target reaction").lean() : [],
    ]);
    const commentsByAd = new Map(commentCounts.map((item: any) => [String(item._id), Number(item.count)]));
    const viewerReactionByAd = new Map(viewerLikes.map((item: any) => [String(item.target), item.reaction || "like"]));
    return res.json({
      ads: delivered.map((ad) => {
        const value = typeof (ad as any).toObject === "function" ? (ad as any).toObject() : { ...ad };
        value.analytics = {
          ...(value.analytics || {}),
          // Keep the campaign's aggregate total authoritative so historical
          // aggregate-only engagement remains visible after this upgrade.
          likes: value.analytics?.likes ?? 0,
          comments: commentsByAd.get(String(ad._id)) ?? 0,
        };
        value.commentsCount = commentsByAd.get(String(ad._id)) ?? 0;
        value.viewerReaction = viewerReactionByAd.get(String(ad._id)) ?? null;
        return value;
      }),
    });
  } catch (error: any) {
    return res.status(500).json({ error: `Failed to deliver ${placement} ads`, details: error.message });
  }
}

router.get("/delivery/feed", optionalAdAuth, async (req: AuthenticatedRequest, res: Response) => deliverAds("feed", req, res));
router.get("/delivery/story", optionalAdAuth, async (req: AuthenticatedRequest, res: Response) => deliverAds("story", req, res));
router.get("/delivery/reels", optionalAdAuth, async (req: AuthenticatedRequest, res: Response) => deliverAds("reels", req, res));

// Track only eligible active paid ads. Atomic increments avoid lost updates
// when multiple viewers interact with the same campaign concurrently.
router.post("/:id/impression", optionalAdAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ad = await Advertisement.findOneAndUpdate(
      { _id: req.params.id, status: "active", paymentStatus: "paid", $or: [{ paymentMethod: { $ne: "manual" } }, { manualPaymentStatus: "verified" }] },
      { $inc: { "analytics.impressions": 1 } },
      { new: true },
    );
    if (!ad) return res.status(204).end();
    const impressions = ad.analytics.impressions || 0;
    const clicks = ad.analytics.clicks || 0;
    ad.analytics.ctr = impressions ? Number(((clicks / impressions) * 100).toFixed(2)) : 0;
    await ad.save();
    if (req.user?.userId) {
      await UserInteraction.create({ user: req.user.userId, targetKind: "ad", targetId: ad._id, event: "ad_impression" });
    }
    return res.status(204).end();
  } catch { return res.status(204).end(); }
});

router.post("/:id/click", optionalAdAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ad = await Advertisement.findOneAndUpdate(
      { _id: req.params.id, status: "active", paymentStatus: "paid", $or: [{ paymentMethod: { $ne: "manual" } }, { manualPaymentStatus: "verified" }] },
      { $inc: { "analytics.clicks": 1 } },
      { new: true },
    );
    if (!ad) return res.status(204).end();
    ad.analytics.ctr = ad.analytics.impressions ? Number(((ad.analytics.clicks / ad.analytics.impressions) * 100).toFixed(2)) : 0;
    await ad.save();
    if (req.user?.userId) {
      await UserInteraction.create({ user: req.user.userId, targetKind: "ad", targetId: ad._id, event: "ad_click" });
    }
    return res.status(204).end();
  } catch { return res.status(204).end(); }
});

// User controls: hide an ad from future delivery or report its content.
router.post("/:id/feedback", authenticateConsumerOrStaff, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { action, reason } = req.body || {};
    if (!["hide", "report"].includes(action)) return res.status(400).json({ error: "Unsupported ad feedback action" });
    const ad = await Advertisement.findOne({ _id: req.params.id, status: "active" }).select("_id creator");
    if (!ad) return res.status(404).json({ error: "Advertisement not found" });
    await UserInteraction.create({
      user: req.user!.userId, targetKind: "ad", targetId: ad._id,
      event: action === "hide" ? "ad_hide" : "ad_report",
      metadata: { reason: String(reason || "").slice(0, 300) },
    });
    if (action === "report") {
      await notifyStaff("ads", `A user reported advertisement ${String(ad._id)}.`, { campaignId: String(ad._id), reason: String(reason || "") });
    }
    return res.json({ success: true, message: action === "hide" ? "This advertisement will be hidden from your future ad delivery." : "Your ad report has been submitted." });
  } catch (error: any) {
    return res.status(500).json({ error: "Could not save advertisement feedback", details: error.message });
  }
});

// POST /api/v1/ads/:id/view — Record authenticated, bounded view time.
// Repeated submissions for the same user/ad inside a short window are ignored
// to prevent retries or replayed requests from consuming a campaign quota twice.
router.post("/:id/view", authenticateConsumerOrStaff, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const requestedSeconds = Number(req.body?.seconds);
    if (!Number.isFinite(requestedSeconds) || requestedSeconds < 1 || requestedSeconds > 600) {
      return res.status(400).json({ error: "View duration must be between 1 and 600 seconds" });
    }
    const viewSeconds = Math.floor(requestedSeconds);
    const now = new Date();
    const cutoff = new Date(now.getTime() - 10_000);
    const existingView = await UserInteraction.findOne({
      user: req.user!.userId,
      targetKind: "ad",
      targetId: req.params.id,
      event: "ad_view",
      createdAt: { $gte: cutoff },
    }).select("_id").lean();
    if (existingView) return res.status(204).end();

    const ad = await Advertisement.findOneAndUpdate(
      {
        _id: req.params.id,
        status: "active",
        paymentStatus: "paid",
        $and: [
          { $or: [{ paymentMethod: { $ne: "manual" } }, { manualPaymentStatus: "verified" }] },
          { $or: [{ endDate: { $gte: now } }, { endDate: { $exists: false } }] },
        ],
      },
      { $inc: { "analytics.views": 1, "analytics.totalWatchSeconds": viewSeconds } },
      { new: true },
    );
    if (!ad) return res.status(204).end();

    await UserInteraction.create({
      user: req.user!.userId,
      targetKind: "ad",
      targetId: ad._id,
      event: "ad_view",
      watchDuration: viewSeconds,
    });

    const deliveredMinutes = Number(((ad.analytics.totalWatchSeconds || 0) / 60).toFixed(2));
    const quotaReached = deliveredMinutes >= ad.advertisingMinutes;
    const deliveryUpdate = await Advertisement.updateOne(
      { _id: ad._id, status: "active" },
      { $set: { advertisingMinutesDelivered: deliveredMinutes, ...(quotaReached ? { status: "expired" } : {}) } },
    );

    if (quotaReached && deliveryUpdate.modifiedCount > 0) {
      await notify({
        recipient: String(ad.creator),
        kind: "system",
        text: `Your advertisement campaign "${ad.title}" has reached its full quota of ${ad.advertisingMinutes} minute(s) and is now completed.`,
      });
    }
    return res.status(204).end();
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to record advertisement view", details: error.message });
  }
});

// Backwards-compatible aggregate endpoint; callers must be authenticated.
// New clients use /reaction and /share so every action is attributable and deduplicated.
router.post("/:id/engagement", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  const action = String(req.body?.action || "");
  if (action === "share") {
    try {
      const ad = await Advertisement.findOneAndUpdate(
        { _id: req.params.id, ...publicAdFilter() },
        { $inc: { "analytics.shares": 1 } },
        { new: true },
      ).select("analytics.shares");
      if (!ad) return res.status(404).json({ error: "Advertisement not found" });
      await UserInteraction.create({ user: req.user!.userId, targetKind: "ad", targetId: req.params.id, event: "ad_share" });
      return res.json({ sharesCount: ad.analytics?.shares || 0 });
    } catch (error: any) {
      return res.status(500).json({ error: "Failed to record advertisement engagement", details: error.message });
    }
  }
  return res.status(400).json({ error: "Use the reaction endpoint for likes and reactions" });
});

export default router;
