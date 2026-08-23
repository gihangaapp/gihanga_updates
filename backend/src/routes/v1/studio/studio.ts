import { Router, Response } from "express";
import { Post } from "../../../models/Post";
import { Follow } from "../../../models/Follow";
import { Transaction } from "../../../models/Transaction";
import { User } from "../../../models/User";
import { authenticateConsumer, AuthenticatedRequest } from "../../../middleware/rbac";

const router = Router();

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

// GET /api/v1/studio/analytics — creator-only dashboard data, all real aggregation
router.get("/analytics", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user?.isCreator) return res.status(403).json({ error: "Creator Studio is only available to creator accounts" });

    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [posts, newFollowersRaw, gifts, adSpend, pointsEarned] = await Promise.all([
      Post.find({ author: user._id }).sort({ createdAt: -1 }),
      Follow.find({ following: user._id, createdAt: { $gte: since } }).select("createdAt"),
      Transaction.find({ user: user._id, kind: "gift", amount: { $gt: 0 }, createdAt: { $gte: since } }),
      Transaction.find({ user: user._id, kind: "fee", amount: { $lt: 0 }, createdAt: { $gte: since } }),
      Transaction.find({ user: user._id, kind: "bonus", createdAt: { $gte: since } }),
    ]);

    // Build a 30-day daily series from real post activity + follower growth.
    const byDay = new Map<string, { views: number; likes: number; comments: number; followers: number; earnings: number }>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      byDay.set(dayKey(d), { views: 0, likes: 0, comments: 0, followers: 0, earnings: 0 });
    }
    for (const post of posts) {
      const bucket = byDay.get(dayKey(new Date(post.createdAt)));
      if (bucket) {
        bucket.views += post.viewsCount;
        bucket.likes += post.likesCount;
        bucket.comments += post.commentsCount;
      }
    }
    for (const f of newFollowersRaw) {
      const bucket = byDay.get(dayKey(new Date(f.createdAt)));
      if (bucket) bucket.followers += 1;
    }
    for (const g of [...gifts, ...pointsEarned]) {
      const bucket = byDay.get(dayKey(new Date(g.createdAt)));
      if (bucket) bucket.earnings += g.amount;
    }
    const days = Array.from(byDay.entries()).map(([date, values]) => ({ date, ...values }));

    const topContent = [...posts]
      .sort((a, b) => b.likesCount + b.commentsCount + b.viewsCount - (a.likesCount + a.commentsCount + a.viewsCount))
      .slice(0, 10)
      .map((p) => ({
        _id: p._id,
        kind: p.kind,
        body: p.body,
        mediaUrl: p.mediaUrl,
        thumbnailUrl: p.thumbnailUrl,
        views: p.viewsCount,
        likes: p.likesCount,
        comments: p.commentsCount,
        shares: p.sharesCount,
        createdAt: p.createdAt,
      }));

    const giftTotal = gifts.reduce((s, g) => s + g.amount, 0);
    const bonusTotal = pointsEarned.reduce((s, g) => s + g.amount, 0);
    const adSpendTotal = Math.abs(adSpend.reduce((s, g) => s + g.amount, 0));

    return res.json({
      totals: {
        posts: posts.length,
        followers: user.followersCount,
        totalViews: posts.reduce((s, p) => s + p.viewsCount, 0),
        totalLikes: posts.reduce((s, p) => s + p.likesCount, 0),
        newFollowers30d: newFollowersRaw.length,
      },
      dailyStats: days,
      topContent,
      revenueSplit: [
        { label: "Gifts", value: giftTotal },
        { label: "Reward points", value: bonusTotal },
      ],
      adSpend30d: adSpendTotal,
      note:
        "City/age audience breakdowns and traffic-source attribution aren't shown — Gihanga Updates doesn't currently collect that data (no geolocation or referrer tracking), and this dashboard only shows real numbers, never placeholders.",
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load analytics", details: error.message });
  }
});

export default router;
