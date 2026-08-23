import { Router, Response } from "express";
import { Advertisement } from "../../../models/Advertisement";
import { Post } from "../../../models/Post";
import { authenticateConsumer, AuthenticatedRequest } from "../../../middleware/rbac";
import { applyLedgerEntry } from "../../../lib/wallet";
import { notifyStaff } from "../../../lib/staffNotify";

const router = Router();

// GET /api/v1/ads — the current user's campaigns
router.get("/", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const campaigns = await Advertisement.find({ creator: req.user!.userId })
      .sort({ createdAt: -1 })
      .populate("targetPosts", "kind mediaUrl thumbnailUrl body");
    return res.json({ campaigns });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load campaigns", details: error.message });
  }
});

// POST /api/v1/ads — create a campaign (goes to "review" until an admin approves it)
router.post("/", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, objective, audience, dailyBudget, totalBudget, targetPosts, startDate, endDate } = req.body;
    if (!name?.trim() || !objective || !dailyBudget || !totalBudget) {
      return res.status(400).json({ error: "name, objective, dailyBudget and totalBudget are required" });
    }

    if (Array.isArray(targetPosts) && targetPosts.length) {
      const owned = await Post.countDocuments({ _id: { $in: targetPosts }, author: req.user!.userId });
      if (owned !== targetPosts.length) {
        return res.status(403).json({ error: "You can only promote your own posts" });
      }
    }

    const campaign = await Advertisement.create({
      creator: req.user!.userId,
      name: name.trim().slice(0, 100),
      objective,
      audience: audience?.trim(),
      dailyBudget: Number(dailyBudget),
      totalBudget: Number(totalBudget),
      targetPosts: targetPosts ?? [],
      startDate,
      endDate,
      status: "review",
    });
    await notifyStaff("ads", `New ad campaign awaiting review: "${campaign.name}"`, { campaignId: String(campaign._id) });

    return res.status(201).json({ campaign });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to create campaign", details: error.message });
  }
});

// PATCH /api/v1/ads/:id — pause/resume, or edit budget/dates
router.patch("/:id", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const campaign = await Advertisement.findOne({ _id: req.params.id, creator: req.user!.userId });
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    const { status, dailyBudget, totalBudget, endDate } = req.body;
    if (status && ["paused", "active"].includes(status) && ["active", "paused"].includes(campaign.status)) {
      campaign.status = status;
    }
    if (dailyBudget !== undefined) campaign.dailyBudget = Number(dailyBudget);
    if (totalBudget !== undefined) campaign.totalBudget = Number(totalBudget);
    if (endDate !== undefined) campaign.endDate = endDate;
    await campaign.save();

    return res.json({ campaign });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to update campaign", details: error.message });
  }
});

// DELETE /api/v1/ads/:id
router.delete("/:id", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const campaign = await Advertisement.findOneAndDelete({ _id: req.params.id, creator: req.user!.userId });
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });
    return res.status(204).end();
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to delete campaign", details: error.message });
  }
});

// A flat per-impression/click cost — a simple, transparent model good enough for this
// scale; a real ad exchange would auction this, which is out of scope here.
const COST_PER_IMPRESSION = 2; // RWF
const COST_PER_CLICK = 20; // RWF

// POST /api/v1/ads/:id/impression — public, called by the client when an ad renders
router.post("/:id/impression", async (req, res: Response) => {
  try {
    const campaign = await Advertisement.findById(req.params.id);
    if (!campaign || campaign.status !== "active") return res.status(204).end();
    if (campaign.spent + COST_PER_IMPRESSION > campaign.totalBudget) {
      campaign.status = "completed";
      await campaign.save();
      return res.status(204).end();
    }

    campaign.impressions += 1;
    campaign.spent += COST_PER_IMPRESSION;
    campaign.ctr = campaign.impressions ? Number(((campaign.clicks / campaign.impressions) * 100).toFixed(2)) : 0;
    await campaign.save();
    await applyLedgerEntry({
      userId: String(campaign.creator),
      kind: "fee",
      amount: -COST_PER_IMPRESSION,
      label: `Ad spend — ${campaign.name} (impression)`,
    });

    return res.status(204).end();
  } catch {
    return res.status(204).end();
  }
});

// POST /api/v1/ads/:id/click — public, called when a viewer clicks an ad
router.post("/:id/click", async (req, res: Response) => {
  try {
    const campaign = await Advertisement.findById(req.params.id);
    if (!campaign || campaign.status !== "active") return res.status(204).end();
    if (campaign.spent + COST_PER_CLICK > campaign.totalBudget) {
      campaign.status = "completed";
      await campaign.save();
      return res.status(204).end();
    }

    campaign.clicks += 1;
    campaign.spent += COST_PER_CLICK;
    campaign.ctr = campaign.impressions ? Number(((campaign.clicks / campaign.impressions) * 100).toFixed(2)) : 0;
    await campaign.save();
    await applyLedgerEntry({
      userId: String(campaign.creator),
      kind: "fee",
      amount: -COST_PER_CLICK,
      label: `Ad spend — ${campaign.name} (click)`,
    });

    return res.status(204).end();
  } catch {
    return res.status(204).end();
  }
});

// GET /api/v1/ads/active — a small pool of currently active campaigns to show in-feed
router.get("/active", async (_req, res: Response) => {
  try {
    const campaigns = await Advertisement.find({ status: "active" })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("creator", "name username avatarHue avatarUrl")
      .populate("targetPosts", "kind mediaUrl thumbnailUrl body");
    return res.json({ campaigns });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load ads", details: error.message });
  }
});

export default router;
