import { Router, Response } from "express";
import { Comment } from "../../../models/Comment";
import { Post } from "../../../models/Post";
import { Like } from "../../../models/Like";
import { authenticateConsumer, AuthenticatedRequest } from "../../../middleware/rbac";
import { optionalAuth } from "../../../middleware/optionalAuth";
import { notify } from "../../../lib/notify";
import { getIO } from "../../../lib/socket";

const router = Router();
const AUTHOR_FIELDS = "name username avatarHue avatarUrl isCreator verified";

async function withLikeFlags(comments: any[], viewerId?: string) {
  if (!viewerId || comments.length === 0) return comments.map((c) => ({ ...c.toObject(), liked: false }));
  const likes = await Like.find({ user: viewerId, kind: "comment", target: { $in: comments.map((c) => c._id) } }).select(
    "target",
  );
  const likedSet = new Set(likes.map((l) => String(l.target)));
  return comments.map((c) => ({ ...c.toObject(), liked: likedSet.has(String(c._id)) }));
}

// GET /api/v1/comments/post/:postId — top-level comments, each with a few of its replies preloaded
router.get("/post/:postId", optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);

    const topLevel = await Comment.find({ post: req.params.postId, parent: { $exists: false }, hidden: false })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("author", AUTHOR_FIELDS);

    const withFlags = await withLikeFlags(topLevel, req.user?.userId);

    const replies = await Comment.find({
      post: req.params.postId,
      parent: { $in: topLevel.map((c) => c._id) },
      hidden: false,
    })
      .sort({ createdAt: 1 })
      .populate("author", AUTHOR_FIELDS);
    const repliesWithFlags = await withLikeFlags(replies, req.user?.userId);

    const byParent = new Map<string, any[]>();
    for (const reply of repliesWithFlags) {
      const key = String(reply.parent);
      if (!byParent.has(key)) byParent.set(key, []);
      byParent.get(key)!.push(reply);
    }

    return res.json({
      comments: withFlags.map((c) => ({ ...c, replies: byParent.get(String(c._id)) || [] })),
      page,
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load comments", details: error.message });
  }
});

// GET /api/v1/comments/:id/replies — paginate a single comment's replies beyond the preloaded set
router.get("/:id/replies", optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);
    const replies = await Comment.find({ parent: req.params.id, hidden: false })
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("author", AUTHOR_FIELDS);
    return res.json({ replies: await withLikeFlags(replies, req.user?.userId), page });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load replies", details: error.message });
  }
});

// POST /api/v1/comments/post/:postId — create a comment, or a reply if `parent` is provided
router.post("/post/:postId", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { body, parent } = req.body;
    if (!body?.trim()) return res.status(400).json({ error: "Comment can't be empty" });

    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    let parentComment = null;
    if (parent) {
      parentComment = await Comment.findById(parent);
      if (!parentComment || String(parentComment.post) !== String(post._id)) {
        return res.status(400).json({ error: "Invalid parent comment" });
      }
    }

    const comment = await Comment.create({
      post: post._id,
      author: req.user!.userId,
      body: body.trim(),
      parent: parentComment?._id,
    });

    await Post.findByIdAndUpdate(post._id, { $inc: { commentsCount: 1 } });
    if (parentComment) {
      await Comment.findByIdAndUpdate(parentComment._id, { $inc: { repliesCount: 1 } });
    }

    const freshPost = await Post.findById(post._id).select("commentsCount");
    getIO()?.emit("post:updated", { postId: String(post._id), commentsCount: freshPost?.commentsCount ?? 0 });
    getIO()?.emit("comment:created", { postId: String(post._id), parent: parentComment ? String(parentComment._id) : null });

    await notify({
      recipient: String(parentComment ? parentComment.author : post.author),
      actor: req.user!.userId,
      kind: "comment",
      text: parentComment ? "replied to your comment" : "commented on your post",
      relatedPost: String(post._id),
    });

    const populated = await comment.populate("author", AUTHOR_FIELDS);
    return res.status(201).json({ comment: { ...populated.toObject(), liked: false, replies: [] } });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to post comment", details: error.message });
  }
});

// DELETE /api/v1/comments/:id — author only
router.delete("/:id", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    if (String(comment.author) !== req.user!.userId) {
      return res.status(403).json({ error: "You can only delete your own comments" });
    }

    const replyCount = await Comment.countDocuments({ parent: comment._id });
    await Comment.deleteMany({ $or: [{ _id: comment._id }, { parent: comment._id }] });
    await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -(1 + replyCount) } });
    if (comment.parent) {
      await Comment.findByIdAndUpdate(comment.parent, { $inc: { repliesCount: -1 } });
    }

    return res.status(204).end();
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to delete comment", details: error.message });
  }
});

export default router;
