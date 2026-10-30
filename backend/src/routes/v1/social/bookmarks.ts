import { Router, Response } from "express";
import { Bookmark } from "../../../models/Bookmark";
import { Post } from "../../../models/Post";
import { Like } from "../../../models/Like";
import { authenticateConsumer, AuthenticatedRequest } from "../../../middleware/rbac";
import { logInteractionEvent } from "../../../services/recommendation/eventTracker";

const router = Router();
const AUTHOR_FIELDS = "name username avatarHue avatarUrl isCreator verified isLive";

// GET /api/v1/bookmarks — the current user's saved posts
router.get("/", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);

    const rows = await Bookmark.find({ user: req.user!.userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({ path: "post", populate: { path: "author", select: AUTHOR_FIELDS } });

    const validRows = rows.filter((r: any) => r.post);
    const postIds = validRows.map((r: any) => r.post._id);
    const likes = await Like.find({ user: req.user!.userId, kind: "post", target: { $in: postIds } }).select("target");
    const likedSet = new Set(likes.map((l) => String(l.target)));

    return res.json({
      posts: validRows.map((r: any) => ({ ...r.post.toObject(), liked: likedSet.has(String(r.post._id)), bookmarked: true })),
      page,
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load bookmarks", details: error.message });
  }
});

// POST /api/v1/bookmarks/:postId — toggle
router.post("/:postId", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const existing = await Bookmark.findOne({ user: req.user!.userId, post: post._id });
    if (existing) {
      await Bookmark.deleteOne({ _id: existing._id });
      await logInteractionEvent({
        userId: req.user!.userId,
        event: post.kind === "reel" ? "reel_unsave" : "post_unsave",
        targetKind: post.kind === "reel" ? "reel" : "post",
        targetId: String(post._id),
        creatorId: String(post.author),
        tags: post.tags || [],
      });
      return res.json({ bookmarked: false });
    }

    await Bookmark.create({ user: req.user!.userId, post: post._id });
    await logInteractionEvent({
      userId: req.user!.userId,
      event: post.kind === "reel" ? "reel_save" : "post_save",
      targetKind: post.kind === "reel" ? "reel" : "post",
      targetId: String(post._id),
      creatorId: String(post.author),
      tags: post.tags || [],
    });
    return res.json({ bookmarked: true });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to save post", details: error.message });
  }
});

export default router;
