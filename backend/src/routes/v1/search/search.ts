import { Router, Response } from "express";
import { User } from "../../../models/User";
import { Hashtag } from "../../../models/Hashtag";
import { Post } from "../../../models/Post";
import { withViewerFlags } from "../../../services/recommendation/recommendationService";
import { optionalAuth } from "../../../middleware/optionalAuth";
import { AuthenticatedRequest } from "../../../middleware/rbac";

const router = Router();
const POST_AUTHOR_FIELDS = "name username avatarHue avatarUrl isCreator verified isLive";
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

    // Public, published posts whose caption/location/hashtags contain the searched words
    const tagTerm = q.replace(/^#/, "").toLowerCase();
    const tagRegex = new RegExp(tagTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const postDocs = await Post.find({
      status: "published",
      audience: "public",
      $or: [{ body: regex }, { location: regex }, { tags: tagRegex }],
    })
      .sort({ likesCount: -1, createdAt: -1 })
      .limit(40)
      .populate("author", POST_AUTHOR_FIELDS);
    const posts = await withViewerFlags(
      postDocs.filter((p: any) => p.author),
      req.user?.userId,
    );

    return res.json({ users, posts, tags: [] });
  } catch (error: any) {
    return res.status(500).json({ error: "Search failed", details: error.message });
  }
});

// GET /api/v1/search/trending — top 5 hashtags right now, for the Explore/Trending page
router.get("/trending", async (_req, res: Response) => {
  try {
    const limit = Math.min(Math.max(Number(_req.query.limit) || 5, 1), 20);
    const tags = await Hashtag.find({}).sort({ postsCount: -1, trend: -1 }).limit(limit);
    return res.json({ tags });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load trending tags", details: error.message });
  }
});

export default router;
