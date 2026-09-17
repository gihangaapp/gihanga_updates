import { Router, Response } from "express";
import { User } from "../../../models/User";
import { Hashtag } from "../../../models/Hashtag";
import { optionalAuth } from "../../../middleware/optionalAuth";
import { AuthenticatedRequest } from "../../../middleware/rbac";

const router = Router();
const USER_FIELDS = "name username avatarHue avatarUrl isCreator verified bio followersCount isLive role interests";

// GET /api/v1/search?q=... (Searches exclusively Creator and User accounts up to 100 results)
router.get("/", optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const q = String(req.query.q || "").trim();
    if (!q) return res.json({ users: [], tags: [] });

    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    // Search exclusively user and creator accounts (excluding staff/admin system accounts)
    const users = await User.find({
      role: { $nin: ["admin", "superadmin", "moderator"] },
      $or: [{ username: regex }, { name: regex }, { bio: regex }],
    })
      .select(USER_FIELDS)
      .sort({ isCreator: -1, followersCount: -1, verified: -1 })
      .limit(100);

    return res.json({ users, posts: [], tags: [] });
  } catch (error: any) {
    return res.status(500).json({ error: "Search failed", details: error.message });
  }
});

// GET /api/v1/search/trending — top 5 hashtags right now, for the Explore/Trending page
router.get("/trending", async (_req, res: Response) => {
  try {
    const tags = await Hashtag.find({}).sort({ postsCount: -1, trend: -1 }).limit(5);
    return res.json({ tags });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load trending tags", details: error.message });
  }
});

export default router;
