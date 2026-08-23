import { Router, Response } from "express";
import { User } from "../../../models/User";
import { Post } from "../../../models/Post";
import { Hashtag } from "../../../models/Hashtag";
import { optionalAuth } from "../../../middleware/optionalAuth";
import { AuthenticatedRequest } from "../../../middleware/rbac";

const router = Router();
const USER_FIELDS = "name username avatarHue avatarUrl isCreator verified bio followersCount isLive";
const AUTHOR_FIELDS = "name username avatarHue avatarUrl isCreator verified";

// GET /api/v1/search?q=...
router.get("/", optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const q = String(req.query.q || "").trim();
    if (!q) return res.json({ users: [], posts: [], tags: [] });

    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    const [users, posts, tags] = await Promise.all([
      User.find({ $or: [{ username: regex }, { name: regex }] }).select(USER_FIELDS).limit(10),
      Post.find({ status: "published", audience: "public", body: regex })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("author", AUTHOR_FIELDS),
      Hashtag.find({ tag: regex }).sort({ postsCount: -1 }).limit(8),
    ]);

    return res.json({ users, posts, tags });
  } catch (error: any) {
    return res.status(500).json({ error: "Search failed", details: error.message });
  }
});

// GET /api/v1/search/trending — top hashtags right now, for the Explore/Trending page
router.get("/trending", async (_req, res: Response) => {
  try {
    const tags = await Hashtag.find({}).sort({ trend: -1, postsCount: -1 }).limit(15);
    return res.json({ tags });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load trending tags", details: error.message });
  }
});

export default router;
