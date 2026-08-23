import { Router, Response } from "express";
import { User } from "../../../../models/User";
import { Post } from "../../../../models/Post";
import { Report } from "../../../../models/Report";
import { Transaction } from "../../../../models/Transaction";
import { LiveStream } from "../../../../models/LiveStream";
import { Advertisement } from "../../../../models/Advertisement";
import { authenticateStaff, ROLE_PERMISSIONS, AuthenticatedRequest } from "../../../../middleware/rbac";

const router = Router();

// GET /api/v1/system/overview — a permission-aware snapshot for the dashboard home
router.get("/", authenticateStaff, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const permissions = ROLE_PERMISSIONS[req.staffUser!.role];
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const stats: Record<string, number> = {};

    if (permissions.has("moderation.queue.view")) {
      stats.pendingReports = await Report.countDocuments({ status: "pending" });
    }
    if (permissions.has("accounts.view")) {
      stats.totalUsers = await User.countDocuments({ role: "user" });
      stats.newUsers24h = await User.countDocuments({ role: "user", createdAt: { $gte: since24h } });
      stats.suspendedAccounts = await User.countDocuments({ status: { $in: ["suspended", "banned"] } });
    }
    if (permissions.has("payments.view")) {
      stats.pendingPayments = await Transaction.countDocuments({ kind: { $in: ["deposit", "payout"] }, status: "pending" });
    }
    if (permissions.has("live.forceEnd")) {
      stats.liveNow = await LiveStream.countDocuments({ status: "live" });
    }
    if (permissions.has("ads.view")) {
      stats.pendingCampaigns = await Advertisement.countDocuments({ status: "review" });
    }
    stats.totalPosts = await Post.countDocuments({});

    return res.json({ stats, role: req.staffUser!.role });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load overview", details: error.message });
  }
});

export default router;
