import { Router, Response } from "express";
import { Advertisement } from "../../../../models/Advertisement";
import { AuditLog } from "../../../../models/AuditLog";
import { authenticateStaff, requirePermission, AuthenticatedRequest } from "../../../../middleware/rbac";
import { notify } from "../../../../lib/notify";
import { refundAdPoints } from "../../../../lib/adPoints";
import { applyLedgerEntry } from "../../../../lib/wallet";

const router = Router();

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

    return res.json({ campaigns });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load campaigns", details: error.message });
  }
});

// GET /api/v1/system/ads/analytics/summary — Platform-wide advertising analytics summary
router.get("/analytics/summary", authenticateStaff, requirePermission("ads.view"), async (_req, res: Response) => {
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
          approvedCampaigns: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
          },
          rejectedCampaigns: {
            $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
          },
          totalRwfRevenue: {
            $sum: { $cond: [{ $eq: ["$paymentMethod", "real_money"] }, "$totalRwfCost", 0] },
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

    return res.json({
      summary: stats || {
        totalCampaigns: 0,
        activeCampaigns: 0,
        pendingReview: 0,
        approvedCampaigns: 0,
        rejectedCampaigns: 0,
        totalRwfRevenue: 0,
        totalPointsSpent: 0,
        totalAdvertisingMinutes: 0,
        totalImpressions: 0,
        totalClicks: 0,
        totalViews: 0,
      },
    });
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

    return res.json({ campaign });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch campaign details", details: error.message });
  }
});

// POST /api/v1/system/ads/:id/approve — Approve a paid advertisement for active delivery
router.post("/:id/approve", authenticateStaff, requirePermission("ads.approve"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const campaign = await Advertisement.findById(req.params.id);
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    if (campaign.paymentStatus !== "paid") {
      return res.status(400).json({ error: "Cannot approve an unpaid advertisement campaign" });
    }

    const now = new Date();
    const endDate = new Date(now.getTime() + campaign.campaignDurationDays * 24 * 60 * 60 * 1000);

    campaign.status = "active";
    campaign.approvedBy = req.staffUser!.userId as any;
    campaign.approvedAt = now;
    campaign.reviewedBy = req.staffUser!.userId as any;
    campaign.reviewedAt = now;
    campaign.startDate = campaign.startDate || now;
    campaign.endDate = endDate;
    campaign.pausedBy = undefined;
    await campaign.save();

    await AuditLog.create({
      actor: req.staffUser!.userId,
      actorUsername: req.staffUser!.username,
      action: "ads.approve",
      targetId: String(campaign._id),
      meta: { title: campaign.title, paymentMethod: campaign.paymentMethod },
    });

    await notify({
      recipient: String(campaign.creator),
      kind: "system",
      text: `Your ad campaign "${campaign.title}" was approved and is now active!`,
    });

    return res.json({ campaign });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to approve campaign", details: error.message });
  }
});

// POST /api/v1/system/ads/:id/reject — Reject an advertisement with a required reason
router.post("/:id/reject", authenticateStaff, requirePermission("ads.approve"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { reason, autoRefund } = req.body;
    if (!reason?.trim()) return res.status(400).json({ error: "Rejection reason is required" });

    const campaign = await Advertisement.findById(req.params.id);
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

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
    if (autoRefund && campaign.paymentStatus === "paid") {
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

    return res.json({ campaign });
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
