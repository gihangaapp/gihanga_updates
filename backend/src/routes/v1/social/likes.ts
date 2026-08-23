import { Router, Response } from "express";
import { Like } from "../../../models/Like";
import { Post } from "../../../models/Post";
import { Comment } from "../../../models/Comment";
import { authenticateConsumer, AuthenticatedRequest } from "../../../middleware/rbac";
import { notify } from "../../../lib/notify";
import { getIO } from "../../../lib/socket";
import { awardPoints } from "../../../lib/rewards";

const router = Router();

// POST /api/v1/likes/post/:id — toggle
router.post("/post/:id", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const existing = await Like.findOne({ user: req.user!.userId, target: post._id, kind: "post" });
    if (existing) {
      await Like.deleteOne({ _id: existing._id });
      const updated = await Post.findByIdAndUpdate(post._id, { $inc: { likesCount: -1 } }, { new: true });
      getIO()?.emit("post:updated", { postId: String(post._id), likesCount: updated?.likesCount ?? 0 });
      return res.json({ liked: false, likesCount: updated?.likesCount ?? 0 });
    }

    await Like.create({ user: req.user!.userId, target: post._id, kind: "post" });
    const updated = await Post.findByIdAndUpdate(post._id, { $inc: { likesCount: 1 } }, { new: true });
    getIO()?.emit("post:updated", { postId: String(post._id), likesCount: updated?.likesCount ?? 0 });
    await awardPoints(String(post.author), "like", "Your post got a like").catch((err) =>
      console.error("[Rewards] Like bonus failed:", err),
    );

    await notify({
      recipient: String(post.author),
      actor: req.user!.userId,
      kind: "like",
      text: "liked your post",
      relatedPost: String(post._id),
    });

    return res.json({ liked: true, likesCount: updated?.likesCount ?? 0 });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to like post", details: error.message });
  }
});

// POST /api/v1/likes/comment/:id — toggle
router.post("/comment/:id", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    const existing = await Like.findOne({ user: req.user!.userId, target: comment._id, kind: "comment" });
    if (existing) {
      await Like.deleteOne({ _id: existing._id });
      const updated = await Comment.findByIdAndUpdate(comment._id, { $inc: { likesCount: -1 } }, { new: true });
      return res.json({ liked: false, likesCount: updated?.likesCount ?? 0 });
    }

    await Like.create({ user: req.user!.userId, target: comment._id, kind: "comment" });
    const updated = await Comment.findByIdAndUpdate(comment._id, { $inc: { likesCount: 1 } }, { new: true });

    await notify({
      recipient: String(comment.author),
      actor: req.user!.userId,
      kind: "like",
      text: "liked your comment",
      relatedPost: String(comment.post),
    });

    return res.json({ liked: true, likesCount: updated?.likesCount ?? 0 });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to like comment", details: error.message });
  }
});

export default router;
