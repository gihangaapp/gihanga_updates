import { Router, Response } from "express";
import { User } from "../../../../models/User";
import { Post } from "../../../../models/Post";
import { Transaction } from "../../../../models/Transaction";
import { authenticateStaff, requirePermission } from "../../../../middleware/rbac";

const router = Router();
const DAY_MS = 24 * 60 * 60 * 1000;
const ALLOWED_RANGES = new Set([7, 30, 90]);

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function sumPoints(transactions: { amount: number }[]) {
  return transactions.reduce((sum, transaction) => sum + Math.abs(Number(transaction.amount) || 0), 0);
}

// GET /api/v1/system/growth?days=7|30|90 — platform analytics for Admin/Super Admin.
router.get("/", authenticateStaff, requirePermission("analytics.view"), async (req, res: Response) => {
  try {
    const requestedDays = Number(req.query.days ?? 30);
    if (!Number.isInteger(requestedDays) || !ALLOWED_RANGES.has(requestedDays)) {
      return res.status(400).json({ error: "days must be one of 7, 30, or 90" });
    }

    const now = new Date();
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const rangeStart = new Date(todayStart.getTime() - (requestedDays - 1) * DAY_MS);
    const previousStart = new Date(rangeStart.getTime() - requestedDays * DAY_MS);
    const previousEnd = rangeStart;
    const userFilter = { role: "user" };
    const postFilter = {};
    const pointKinds = { kind: { $in: ["gift", "fee"] }, status: "completed" };

    const [
      newUsers,
      newPosts,
      pointsTransactions,
      previousUsers,
      previousPosts,
      previousPointTransactions,
      totalUsers,
      totalCreators,
    ] = await Promise.all([
      User.find({ ...userFilter, createdAt: { $gte: rangeStart, $lte: now } }).select("createdAt").lean(),
      Post.find({ ...postFilter, createdAt: { $gte: rangeStart, $lte: now } }).select("createdAt").lean(),
      Transaction.find({ ...pointKinds, createdAt: { $gte: rangeStart, $lte: now } }).select("createdAt amount").lean(),
      User.find({ ...userFilter, createdAt: { $gte: previousStart, $lt: previousEnd } }).select("_id").lean(),
      Post.find({ createdAt: { $gte: previousStart, $lt: previousEnd } }).select("_id").lean(),
      Transaction.find({ ...pointKinds, createdAt: { $gte: previousStart, $lt: previousEnd } }).select("amount").lean(),
      User.countDocuments(userFilter),
      User.countDocuments({ ...userFilter, isCreator: true }),
    ]);

    const byDay = new Map<string, { newUsers: number; newPosts: number; pointsActivity: number }>();
    for (let index = requestedDays - 1; index >= 0; index -= 1) {
      const date = new Date(now.getTime() - index * DAY_MS);
      byDay.set(dayKey(date), { newUsers: 0, newPosts: 0, pointsActivity: 0 });
    }
    for (const user of newUsers) {
      const bucket = byDay.get(dayKey(new Date(user.createdAt)));
      if (bucket) bucket.newUsers += 1;
    }
    for (const post of newPosts) {
      const bucket = byDay.get(dayKey(new Date(post.createdAt)));
      if (bucket) bucket.newPosts += 1;
    }
    for (const transaction of pointsTransactions) {
      const bucket = byDay.get(dayKey(new Date(transaction.createdAt)));
      if (bucket) bucket.pointsActivity += Math.abs(Number(transaction.amount) || 0);
    }

    const pointsActivity = sumPoints(pointsTransactions);
    const previousPointsActivity = sumPoints(previousPointTransactions);
    const totals = {
      rangeDays: requestedDays,
      newUsers: newUsers.length,
      newPosts: newPosts.length,
      pointsActivity,
      previousNewUsers: previousUsers.length,
      previousNewPosts: previousPosts.length,
      previousPointsActivity,
      totalUsers,
      totalCreators,
      // Backwards-compatible fields used by the overview dashboard (default range is 30 days).
      newUsers30d: newUsers.length,
      newPosts30d: newPosts.length,
      revenue30d: pointsActivity,
    };

    return res.json({
      range: { days: requestedDays, from: rangeStart.toISOString(), to: now.toISOString(), previousFrom: previousStart.toISOString(), previousTo: previousEnd.toISOString() },
      series: Array.from(byDay.entries()).map(([date, metrics]) => ({ date, ...metrics, revenue: metrics.pointsActivity })),
      totals,
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load growth data", details: error.message });
  }
});

export default router;
