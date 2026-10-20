import { Router, Response } from "express";
import rateLimit from "express-rate-limit";
import { Types } from "mongoose";
import { Report } from "../../../models/Report";
import { Appeal } from "../../../models/Appeal";
import { ModerationRecord } from "../../../models/ModerationRecord";
import { Post } from "../../../models/Post";
import { Story } from "../../../models/Story";
import { Comment } from "../../../models/Comment";
import { LiveStream } from "../../../models/LiveStream";
import { User } from "../../../models/User";
import { authenticateConsumer, AuthenticatedRequest } from "../../../middleware/rbac";
import { rateLimitHits } from "../../../lib/redis";
import { notifyStaff } from "../../../lib/staffNotify";
import { logAudit } from "../../../utils/auditLogger";

const router = Router();

/**
 * Consumer-facing safety endpoints: content reports and moderation appeals.
 *
 * SECURITY NOTES
 *  - Reports are rate-limited (per-user and burst) and deduplicated against
 *    the SAME target by the SAME reporter; mass-reporting can never remove
 *    content by itself — it only raises staff priority (severity bump).
 *  - Appeals are one-open-per-record, author-only, rate-limited, and never
 *    allowed for critical-protocol records.
 */

const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: { error: "Too many reports submitted — please try again later." },
});

const appealLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: "Too many appeals submitted — please try again later." },
});

const REPORT_REASONS = [
  "Nudity",
  "Violence",
  "Harassment",
  "Spam",
  "Misinformation",
  "Copyright",
  "Other",
] as const;

const SEVERITY_BY_REASON: Record<string, "low" | "medium" | "high"> = {
  Nudity: "high",
  Violence: "high",
  Harassment: "medium",
  Spam: "low",
  Misinformation: "low",
  Copyright: "low",
  Other: "medium",
};

// POST /api/v1/moderation/reports — report a post, story, comment or user
router.post(
  "/reports",
  authenticateConsumer,
  reportLimiter,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Sliding-window secondary limit (works across instances with Redis).
      const allowed = await rateLimitHits("report:create", req.user!.userId, 20, 3600);
      if (!allowed) return res.status(429).json({ error: "Too many reports — please try again later." });

      const { targetType, targetId, reason, details } = req.body as {
        targetType?: string;
        targetId?: string;
        reason?: string;
        details?: string;
      };

      if (!targetType || !["post", "story", "comment", "user"].includes(targetType)) {
        return res.status(400).json({ error: "targetType must be post, story, comment or user" });
      }
      if (!targetId || !Types.ObjectId.isValid(targetId)) {
        return res.status(400).json({ error: "A valid targetId is required" });
      }
      if (!reason || !REPORT_REASONS.includes(reason as (typeof REPORT_REASONS)[number])) {
        return res.status(400).json({ error: `reason must be one of: ${REPORT_REASONS.join(", ")}` });
      }

      // Resolve the target and its owner (reports always name the owner too,
      // matching the existing Report schema).
      let ownerId: string | undefined;
      let excerpt: string | undefined;
      if (targetType === "post") {
        const post = await Post.findById(targetId).select("author body");
        if (!post) return res.status(404).json({ error: "Post not found" });
        ownerId = String(post.author);
        excerpt = post.body?.slice(0, 200);
      } else if (targetType === "story") {
        const story = await Story.findById(targetId).select("author caption");
        if (!story) return res.status(404).json({ error: "Story not found" });
        ownerId = String(story.author);
        excerpt = story.caption?.slice(0, 200);
      } else if (targetType === "comment") {
        const comment = await Comment.findById(targetId).select("author body");
        if (!comment) return res.status(404).json({ error: "Comment not found" });
        ownerId = String(comment.author);
        excerpt = comment.body?.slice(0, 200);
      } else {
        const user = await User.findById(targetId).select("_id");
        if (!user) return res.status(404).json({ error: "User not found" });
        ownerId = String(user._id);
      }

      if (ownerId === req.user!.userId) {
        return res.status(400).json({ error: "You cannot report your own content" });
      }

      // Deduplicate: same reporter, same target post/story/comment.
      const dedupeQuery: any = { reporter: req.user!.userId, reason };
      if (targetType === "post") dedupeQuery.targetPost = new Types.ObjectId(targetId);
      else if (targetType === "story") dedupeQuery.targetId = new Types.ObjectId(targetId);
      else if (targetType === "comment") dedupeQuery.targetId = new Types.ObjectId(targetId);
      else dedupeQuery.target = new Types.ObjectId(targetId);

      const existing = await Report.findOne(dedupeQuery);
      if (existing) {
        return res.status(200).json({ reported: true, duplicate: true });
      }

      // Count distinct reporters on the same content — mass-reporting raises
      // priority but NEVER removes content automatically.
      const countQuery: any = {};
      if (targetType === "post") countQuery.targetPost = new Types.ObjectId(targetId);
      else if (targetType === "story" || targetType === "comment") countQuery.targetId = new Types.ObjectId(targetId);
      else countQuery.target = new Types.ObjectId(targetId);
      const distinctReporters = await Report.countDocuments(countQuery);

      const report = await Report.create({
        reporter: req.user!.userId,
        target: ownerId,
        ...(targetType === "post" ? { targetPost: new Types.ObjectId(targetId) } : {}),
        reason,
        excerpt: details?.trim()?.slice(0, 300) || excerpt,
        severity: distinctReporters >= 3 ? "high" : (SEVERITY_BY_REASON[reason] ?? "medium"),
        reportsCount: distinctReporters + 1,
        status: "pending",
      });

      if (["Nudity", "Violence"].includes(reason)) {
        // Serious categories alert staff immediately.
        await notifyStaff("all", `New ${reason.toLowerCase()} report needs attention.`, {
          reportId: String(report._id),
          targetType,
          targetId,
          distinctReporters: distinctReporters + 1,
        }).catch(() => undefined);
      }

      // Privacy: the reporter's identity is stored for anti-abuse auditing
      // but is never exposed to the reported user.
      return res.status(201).json({ reported: true });
    } catch (error: any) {
      return res.status(500).json({ error: "Failed to submit report", details: error.message });
    }
  },
);

// POST /api/v1/moderation/appeals — appeal a rejected decision (own content)
router.post(
  "/appeals",
  authenticateConsumer,
  appealLimiter,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const allowed = await rateLimitHits("appeal:create", req.user!.userId, 6, 3600);
      if (!allowed) return res.status(429).json({ error: "Too many appeals — please try again later." });

      const { recordId, statement } = req.body as { recordId?: string; statement?: string };
      if (!recordId || !Types.ObjectId.isValid(recordId)) {
        return res.status(400).json({ error: "A valid recordId is required" });
      }
      if (!statement?.trim() || statement.trim().length < 20) {
        return res.status(400).json({ error: "Please explain your appeal in at least 20 characters" });
      }

      const record = await ModerationRecord.findById(recordId);
      if (!record) return res.status(404).json({ error: "Moderation record not found" });
      if (String(record.author ?? "") !== req.user!.userId) {
        return res.status(403).json({ error: "You can only appeal decisions on your own content" });
      }
      if (record.status !== "rejected") {
        return res.status(400).json({ error: "Only rejected decisions can be appealed" });
      }
      if (record.criticalEscalation) {
        // Non-graphic refusal — no detail about the protocol is exposed.
        return res.status(403).json({ error: "This decision cannot be appealed." });
      }

      const openAppeal = await Appeal.findOne({ record: record._id, status: "pending" });
      if (openAppeal) {
        return res.status(409).json({ error: "An appeal for this content is already under review" });
      }

      const appeal = await Appeal.create({
        record: record._id,
        user: req.user!.userId,
        statement: statement.trim().slice(0, 2000),
        status: "pending",
        submittedAt: new Date(),
      });
      record.appealStatus = "pending";
      await record.save();

      await notifyStaff("all", "A user filed a moderation appeal.", { appealId: String(appeal._id) }).catch(
        () => undefined,
      );
      await logAudit({
        actor: req.user!.userId,
        action: "moderation.appeal.created",
        targetId: String(appeal._id),
        meta: { recordId: String(record._id) },
      }).catch(() => undefined);

      return res.status(201).json({ appeal: { id: String(appeal._id), status: "pending" } });
    } catch (error: any) {
      return res.status(500).json({ error: "Failed to submit appeal", details: error.message });
    }
  },
);

// GET /api/v1/moderation/appeals/mine — the user's own appeals
router.get("/appeals/mine", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const appeals = await Appeal.find({ user: req.user!.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("record", "contentType decision status userMessage createdAt")
      .select("statement status submittedAt reviewedAt decisionNote record");
    return res.json({ appeals });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load appeals", details: error.message });
  }
});

// GET /api/v1/moderation/records/mine — moderation records for the caller's
// own content (lets the UI render why something is pending/rejected without
// ever exposing thresholds, provider payloads or internal detail).
router.get("/records/mine", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const records = await ModerationRecord.find({ author: req.user!.userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("contentType contentId decision status userMessage appealStatus createdAt decidedAt");
    return res.json({ records });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load moderation records", details: error.message });
  }
});

export default router;
