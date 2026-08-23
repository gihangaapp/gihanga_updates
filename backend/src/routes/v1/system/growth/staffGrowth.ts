import { Router, Response } from "express";
import { User } from "../../../../models/User";
import { Post } from "../../../../models/Post";
import { Transaction } from "../../../../models/Transaction";
import { authenticateStaff, requirePermission } from "../../../../middleware/rbac";

const router = Router();

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

// GET /api/v1/system/growth — platform-wide 30-day growth series, admin/superadmin only
router.get("/", authenticateStaff, requirePermission("analytics.view"), async (_req, res: Response) => {
  try {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [newUsers, newPosts, revenueTx] = await Promise.all([
      User.find({ role: "user", createdAt: { $gte: since } }).select("createdAt"),
      Post.find({ createdAt: { $gte: since } }).select("createdAt"),
      Transaction.find({ kind: { $in: ["gift", "fee"] }, createdAt: { $gte: since } }).select("createdAt amount kind"),
    ]);

    const byDay = new Map<string, { newUsers: number; newPosts: number; revenue: number }>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      byDay.set(dayKey(d), { newUsers: 0, newPosts: 0, revenue: 0 });
    }
    for (const u of newUsers) {
      const bucket = byDay.get(dayKey(new Date(u.createdAt)));
      if (bucket) bucket.newUsers += 1;
    }
    for (const p of newPosts) {
      const bucket = byDay.get(dayKey(new Date(p.createdAt)));
      if (bucket) bucket.newPosts += 1;
    }
    for (const t of revenueTx) {
      const bucket = byDay.get(dayKey(new Date(t.createdAt)));
      // "fee" transactions are stored negative (ad spend / point conversions) — take the
      // absolute value so platform revenue reads as a positive number either way.
      if (bucket) bucket.revenue += Math.abs(t.amount);
    }

    const series = Array.from(byDay.entries()).map(([date, v]) => ({ date, ...v }));
    const [totalUsers, totalCreators] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "user", isCreator: true }),
    ]);
    const totals = {
      newUsers30d: newUsers.length,
      newPosts30d: newPosts.length,
      revenue30d: revenueTx.reduce((s, t) => s + Math.abs(t.amount), 0),
      totalUsers,
      totalCreators,
    };

    return res.json({ series, totals });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load growth data", details: error.message });
  }
});

export default router;
