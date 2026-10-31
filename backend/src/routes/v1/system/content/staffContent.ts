import { Router, Response } from "express";
import { Types } from "mongoose";
import { Post } from "../../../../models/Post";
import { User } from "../../../../models/User";
import { authenticateStaff, requirePermission, AuthenticatedRequest } from "../../../../middleware/rbac";
import { logAudit } from "../../../../utils/auditLogger";
import { notify } from "../../../../lib/notify";

const router = Router();
const VALID_STATUSES = ["published", "scheduled", "draft", "processing", "rejected", "removed"] as const;
const VALID_KINDS = ["photo", "video", "reel", "text"] as const;

// GET /api/v1/system/content — searchable staff content directory.
router.get("/", authenticateStaff, requirePermission("content.view"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const q = String(req.query.q || "").trim().slice(0, 120);
    const status = String(req.query.status || "");
    const kind = String(req.query.kind || "");
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);
    if (status && status !== "all" && !VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
      return res.status(400).json({ error: "Invalid content status filter" });
    }
    if (kind && kind !== "all" && !VALID_KINDS.includes(kind as (typeof VALID_KINDS)[number])) {
      return res.status(400).json({ error: "Invalid content type filter" });
    }

    const filter: Record<string, any> = {};
    if (status && status !== "all") filter.status = status;
    if (kind && kind !== "all") filter.kind = kind;
    if (q) {
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");
      const matchingAuthors = await User.find({ $or: [{ name: regex }, { username: regex }] })
        .select("_id").limit(250).lean();
      filter.$or = [
        { body: regex },
        { tags: regex },
        ...(matchingAuthors.length ? [{ author: { $in: matchingAuthors.map((author) => author._id) } }] : []),
      ];
    }

    const [posts, total, statusRows] = await Promise.all([
      Post.find(filter)
        .select("author kind body mediaUrl thumbnailUrl media status audience tags likesCount commentsCount sharesCount viewsCount createdAt updatedAt removedAt removedBy removedReason removedPreviousStatus")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("author", "name username avatarUrl avatarHue")
        .lean(),
      Post.countDocuments(filter),
      Post.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    ]);

    const statusCounts = Object.fromEntries(statusRows.map((row: any) => [row._id, row.count]));
    return res.json({ posts, total, page, limit, hasMore: page * limit < total, statusCounts });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load content directory", details: error.message });
  }
});

// POST /api/v1/system/content/:id/remove — soft-remove content and preserve evidence/history.
router.post("/:id/remove", authenticateStaff, requirePermission("content.remove"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!Types.ObjectId.isValid(String(req.params.id))) return res.status(400).json({ error: "Invalid content ID" });
    const reason = String(req.body?.reason || "").trim().slice(0, 500);
    if (reason.length < 3) return res.status(400).json({ error: "A removal reason of at least 3 characters is required" });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Content not found" });
    if (post.status === "removed") return res.status(409).json({ error: "Content is already removed" });

    post.removedPreviousStatus = (post.status !== "removed" ? post.status : "published") as typeof post.status;
    post.status = "removed";
    post.removedAt = new Date();
    post.removedBy = new Types.ObjectId(req.staffUser!.userId);
    post.removedReason = reason;
    await post.save();

    await logAudit({
      actor: req.staffUser!.userId,
      actorUsername: req.staffUser!.username,
      action: "content.remove",
      targetUser: post.author,
      targetPost: post._id,
      meta: { reason, previousStatus: post.removedPreviousStatus },
      ipAddress: req.ip,
    });
    await notify({ recipient: String(post.author), kind: "system", text: `Your ${post.kind} was removed by the Gihanga Updates moderation team: ${reason}` });
    return res.json({ message: "Content removed and preserved in the moderation record", postId: String(post._id), status: post.status });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to remove content", details: error.message });
  }
});

// POST /api/v1/system/content/:id/restore — restore the exact previous lifecycle state.
router.post("/:id/restore", authenticateStaff, requirePermission("content.restore"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!Types.ObjectId.isValid(String(req.params.id))) return res.status(400).json({ error: "Invalid content ID" });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Content not found" });
    if (post.status !== "removed") return res.status(409).json({ error: "Only removed content can be restored" });

    const restoredStatus = post.removedPreviousStatus || "published";
    post.status = restoredStatus;
    post.removedAt = undefined;
    post.removedBy = undefined;
    post.removedReason = undefined;
    post.removedPreviousStatus = undefined;
    await post.save();

    await logAudit({
      actor: req.staffUser!.userId,
      actorUsername: req.staffUser!.username,
      action: "content.restore",
      targetUser: post.author,
      targetPost: post._id,
      meta: { restoredStatus },
      ipAddress: req.ip,
    });
    await notify({ recipient: String(post.author), kind: "system", text: "Your previously removed content has been restored by the Gihanga Updates team." });
    return res.json({ message: "Content restored", postId: String(post._id), status: post.status });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to restore content", details: error.message });
  }
});

export default router;
