import { Router, Response } from "express";
import { Report } from "../../../../models/Report";
import { Post } from "../../../../models/Post";
import { Story } from "../../../../models/Story";
import { Comment } from "../../../../models/Comment";
import { AdComment } from "../../../../models/AdComment";
import { Advertisement } from "../../../../models/Advertisement";
import { User } from "../../../../models/User";
import { Media } from "../../../../models/Media";
import { ModerationRule } from "../../../../models/ModerationRule";
import { ModerationRecord } from "../../../../models/ModerationRecord";
import { ModerationJob } from "../../../../models/ModerationJob";
import { Appeal } from "../../../../models/Appeal";
import { AuditLog } from "../../../../models/AuditLog";
import { authenticateStaff, requirePermission, AuthenticatedRequest } from "../../../../middleware/rbac";
import { notify } from "../../../../lib/notify";
import { logAudit } from "../../../../utils/auditLogger";
import { publishPost } from "../../../../services/moderation/contentModerationService";
import { publicSummary, setRuntimeThresholdOverrides } from "../../../../lib/moderation/config";
import { queueStats } from "../../../../services/moderation/moderationQueue";

const router = Router();
const REPORTER_FIELDS = "name username avatarHue avatarUrl";

async function softRemovePost(postId: unknown, staffId: string, reason: string) {
  if (!postId) return;
  const cleanReason = typeof reason === "string" ? reason.trim().slice(0, 500) : "";
  const post = await Post.findById(postId);
  if (!post || post.status === "removed") return;
  post.removedPreviousStatus = post.status;
  post.status = "removed";
  post.removedAt = new Date();
  post.removedBy = staffId as any;
  post.removedReason = cleanReason;
  await post.save();
}

// ─────────────────────────────────────────────────────────────────────────────
// AI moderation review queue (ModerationRecord-based)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/system/moderation/assessments — the AI-flagged review queue.
 * Statuses: pending_review (needs a human), rejected (audit), approved (audit),
 * failed (processing failures worth attention), processing (in-flight).
 */
router.get(
  "/assessments",
  authenticateStaff,
  requirePermission("moderation.assessments.view"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const status = String(req.query.status || "pending_review");
      const validStatuses = ["pending_review", "rejected", "approved", "failed", "processing"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: `status must be one of: ${validStatuses.join(", ")}` });
      }
      const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
      const criticalOnly = req.query.critical === "true";

      const query: any = { status };
      if (criticalOnly) query.criticalEscalation = true;

      const records = await ModerationRecord.find(query)
        .sort({ criticalEscalation: -1, severity: -1, createdAt: -1 })
        .limit(limit)
        .populate("author", REPORTER_FIELDS)
        .populate("reviewedBy", REPORTER_FIELDS);

      // Attach the underlying content for review (staff-only view).
      const enriched = await Promise.all(
        records.map(async (record) => {
          const item: any = record.toObject();
          item.content = await loadContentForReview(record);
          return item;
        }),
      );

      return res.json({ records: enriched });
    } catch (error: any) {
      return res.status(500).json({ error: "Failed to load assessments", details: error.message });
    }
  },
);

async function loadContentForReview(record: any) {
  try {
    switch (record.contentType) {
      case "post": {
        const post = await Post.findById(record.contentId).select(
          "kind body mediaUrl thumbnailUrl status moderation createdAt",
        );
        return post ? { type: "post", post } : null;
      }
      case "story": {
        const story = await Story.findById(record.contentId).select(
          "mediaUrl mediaType caption moderation expiresAt createdAt",
        );
        return story ? { type: "story", story } : null;
      }
      case "comment": {
        const comment = await Comment.findById(record.contentId).select("body hidden moderation createdAt");
        if (comment) return { type: "comment", comment };
        // Ad comments share the platform's comment moderation policy, but are
        // stored separately because they belong to an Advertisement, not a Post.
        const adComment = await AdComment.findById(record.contentId)
          .select("body hidden moderation createdAt ad")
          .populate("ad", "title placement");
        return adComment ? { type: "ad_comment", comment: adComment } : null;
      }
      case "avatar":
      case "media": {
        const media = await Media.findById(record.contentId).select(
          "type context mimeType originalSize moderationStatus createdAt",
        );
        return media ? { type: "media", media } : null;
      }
      case "live_chat":
      case "live_title":
        return { type: record.contentType, note: "See linked content in the record" };
      default:
        return null;
    }
  } catch {
    return null;
  }
}

/**
 * POST /api/v1/system/moderation/assessments/:id/decision — a human reviewer
 * resolves a pending assessment (or reverses a recent automated rejection).
 * Actions: approve (publish), reject (keep blocked), escalate (critical path).
 * Every decision is audited and the author is notified.
 */
router.post(
  "/assessments/:id/decision",
  authenticateStaff,
  requirePermission("moderation.assessments.action"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { action, note } = req.body as { action: "approve" | "reject" | "escalate"; note?: string };
      if (!["approve", "reject", "escalate"].includes(action)) {
        return res.status(400).json({ error: "action must be approve, reject or escalate" });
      }
      if (action !== "approve" && !note?.trim()) {
        return res.status(400).json({ error: "A reason is required for reject and escalate" });
      }

      const record = await ModerationRecord.findById(req.params.id);
      if (!record) return res.status(404).json({ error: "Assessment not found" });
      if (action !== "escalate" && record.reviewedAt) {
        return res.status(409).json({ error: "This assessment was already reviewed" });
      }

      // CRITICAL protocol: records flagged under the critical-content protocol
      // can only be escalated further or kept rejected — never approved by a
      // single moderator. Approval requires documented legal/safety review.
      if (record.criticalEscalation && action === "approve") {
        return res.status(403).json({
          error:
            "Critical-protocol records cannot be approved through this endpoint. Follow the documented escalation procedure.",
        });
      }

      const staffId = req.staffUser!.userId;

      if (action === "approve") {
        await applyStaffApproval(record);
      } else if (action === "reject") {
        await applyStaffRejection(record);
      }

      record.reviewedBy = staffId as any;
      record.reviewedAt = new Date();
      record.reviewAction = action === "approve" ? "approved" : action === "reject" ? "rejected" : "escalated";
      record.reviewNote = note?.trim()?.slice(0, 500);
      record.status = action === "approve" ? "approved" : action === "reject" ? "rejected" : "pending_review";
      record.decision = action === "approve" ? "APPROVED" : action === "reject" ? "REJECTED" : "PENDING_REVIEW";
      await record.save();

      await logAudit({
        actor: staffId,
        actorUsername: req.staffUser!.username,
        action: `moderation.assessment.${action}`,
        targetId: String(record._id),
        targetUser: record.author,
        meta: { note, contentType: record.contentType, contentId: record.contentId },
      });

      // Notify the author (non-graphic, no internal detail).
      if (record.author && action !== "escalate") {
        await notify({
          recipient: String(record.author),
          kind: "system",
          text:
            action === "approve"
              ? "Your content was reviewed and is now visible."
              : "After review, your content could not be published because it violates our Content Guidelines.",
          ...(record.contentType === "post" && record.contentId
            ? { relatedPost: String(record.contentId) }
            : {}),
        }).catch(() => undefined);
      }

      return res.json({ record });
    } catch (error: any) {
      return res.status(500).json({ error: "Failed to action assessment", details: error.message });
    }
  },
);

async function applyStaffApproval(record: any) {
  if (record.contentType === "post" && record.contentId) {
    const post = await Post.findById(record.contentId);
    if (post && post.status !== "published" && post.status !== "removed") {
      // publishPost flips status, counters, hashtags and socket events.
      await publishPost(String(post._id));
      // Approve linked media for delivery.
      const urls = new Set<string>();
      if (post.mediaUrl) String(post.mediaUrl).split(",").forEach((u: string) => urls.add(u.trim()));
      for (const item of post.media ?? []) urls.add(item.url);
      if (urls.size) {
        await Media.updateMany(
          { $or: [{ cdnUrl: { $in: Array.from(urls) } }, { "variants.url": { $in: Array.from(urls) } }] },
          { $set: { moderationStatus: "approved" } },
        );
      }
    }
  } else if (record.contentType === "story" && record.contentId) {
    await Story.updateOne(
      { _id: record.contentId },
      { $set: { moderation: { status: "approved", record: record._id, updatedAt: new Date() } } },
    );
    const story = await Story.findById(record.contentId).select("mediaUrl");
    if (story?.mediaUrl) {
      await Media.updateMany({ cdnUrl: story.mediaUrl }, { $set: { moderationStatus: "approved" } });
    }
  } else if (record.contentType === "comment" && record.contentId) {
    const comment = await Comment.findById(record.contentId);
    if (comment) {
      const wasHidden = comment.hidden;
      comment.hidden = false;
      comment.moderation = { status: "approved", record: record._id, updatedAt: new Date() };
      await comment.save();
      if (wasHidden) await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: 1 } });
    } else {
      const adComment = await AdComment.findById(record.contentId);
      if (adComment) {
        const wasHidden = adComment.hidden;
        adComment.hidden = false;
        adComment.moderation = { status: "approved", record: record._id, updatedAt: new Date() };
        await adComment.save();
        if (wasHidden) await Advertisement.findByIdAndUpdate(adComment.ad, { $inc: { "analytics.comments": 1 } });
      }
    }
  } else if ((record.contentType === "avatar" || record.contentType === "media") && record.contentId) {
    await Media.updateOne({ _id: record.contentId }, { $set: { moderationStatus: "approved" } });
  }
}

async function applyStaffRejection(record: any) {
  if (record.contentType === "post" && record.contentId) {
    const post = await Post.findById(record.contentId);
    if (post) {
      post.status = "rejected";
      post.moderation = { status: "rejected", record: record._id, updatedAt: new Date() };
      await post.save();
      const urls = new Set<string>();
      if (post.mediaUrl) String(post.mediaUrl).split(",").forEach((u: string) => urls.add(u.trim()));
      for (const item of post.media ?? []) urls.add(item.url);
      if (urls.size) {
        await Media.updateMany(
          { $or: [{ cdnUrl: { $in: Array.from(urls) } }, { "variants.url": { $in: Array.from(urls) } }] },
          { $set: { moderationStatus: "rejected" } },
        );
      }
    }
  } else if (record.contentType === "story" && record.contentId) {
    await Story.updateOne(
      { _id: record.contentId },
      { $set: { moderation: { status: "rejected", record: record._id, updatedAt: new Date() } } },
    );
  } else if (record.contentType === "comment" && record.contentId) {
    const result = await Comment.updateOne(
      { _id: record.contentId },
      { $set: { hidden: true, moderation: { status: "rejected", record: record._id, updatedAt: new Date() } } },
    );
    if (result.matchedCount === 0) {
      await AdComment.updateOne(
        { _id: record.contentId },
        { $set: { hidden: true, moderation: { status: "rejected", record: record._id, updatedAt: new Date() } } },
      );
    }
  } else if ((record.contentType === "avatar" || record.contentType === "media") && record.contentId) {
    await Media.updateOne({ _id: record.contentId }, { $set: { moderationStatus: "rejected" } });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Appeals
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/v1/system/moderation/appeals — open (and recently closed) appeals
router.get(
  "/appeals",
  authenticateStaff,
  requirePermission("moderation.appeals.view"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const status = String(req.query.status || "pending");
      if (!["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "status must be pending, approved or rejected" });
      }
      const appeals = await Appeal.find({ status })
        .sort({ submittedAt: -1 })
        .limit(200)
        .populate("user", REPORTER_FIELDS)
        .populate({
          path: "record",
          select: "contentType contentId decision status severity categories userMessage createdAt",
        })
        .populate("reviewedBy", REPORTER_FIELDS);
      return res.json({ appeals });
    } catch (error: any) {
      return res.status(500).json({ error: "Failed to load appeals", details: error.message });
    }
  },
);

// POST /api/v1/system/moderation/appeals/:id/decision — resolve an appeal
router.post(
  "/appeals/:id/decision",
  authenticateStaff,
  requirePermission("moderation.appeals.action"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { action, note } = req.body as { action: "approve" | "reject"; note?: string };
      if (!["approve", "reject"].includes(action)) {
        return res.status(400).json({ error: "action must be approve or reject" });
      }
      if (!note?.trim()) {
        return res.status(400).json({ error: "A decision note is required" });
      }

      const appeal = await Appeal.findById(req.params.id).populate("record");
      if (!appeal) return res.status(404).json({ error: "Appeal not found" });
      if (appeal.status !== "pending") return res.status(409).json({ error: "Appeal already resolved" });

      const record = appeal.record as any;
      if (!record) return res.status(404).json({ error: "The moderated record no longer exists" });

      // CRITICAL protocol records cannot be re-opened via appeals.
      if (record.criticalEscalation) {
        return res.status(403).json({ error: "This record is under the critical-content protocol and cannot be appealed." });
      }

      if (action === "approve") {
        // The appeal overturns the automated decision: re-approve the content.
        await applyStaffApproval(record);
        record.status = "approved";
        record.decision = "APPROVED";
        record.appealStatus = "approved";
        record.reviewedBy = req.staffUser!.userId as any;
        record.reviewedAt = new Date();
        record.reviewAction = "approved";
        record.reviewNote = `Appeal approved: ${note.trim().slice(0, 400)}`;
        await record.save();
      } else {
        record.appealStatus = "rejected";
        record.reviewNote = `Appeal rejected: ${note.trim().slice(0, 400)}`;
        await record.save();
      }

      appeal.status = action === "approve" ? "approved" : "rejected";
      appeal.reviewedBy = req.staffUser!.userId as any;
      appeal.reviewedAt = new Date();
      appeal.decisionNote = note.trim().slice(0, 500);
      await appeal.save();

      await logAudit({
        actor: req.staffUser!.userId,
        actorUsername: req.staffUser!.username,
        action: `moderation.appeal.${action}`,
        targetId: String(appeal._id),
        targetUser: appeal.user,
        meta: { note },
      });

      await notify({
        recipient: String(appeal.user),
        kind: "system",
        text:
          action === "approve"
            ? "Good news — your appeal was reviewed and your content has been restored."
            : "Your appeal was reviewed. The original decision stands. You can edit and resubmit the content.",
      }).catch(() => undefined);

      return res.json({ appeal });
    } catch (error: any) {
      return res.status(500).json({ error: "Failed to action appeal", details: error.message });
    }
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// Statistics & health
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/v1/system/moderation/statistics — aggregate moderation metrics
router.get(
  "/statistics",
  authenticateStaff,
  requirePermission("moderation.stats.view"),
  async (_req: AuthenticatedRequest, res: Response) => {
    try {
      const since = new Date(Date.now() - 30 * 24 * 3600 * 1000);
      const [byStatus, bySeverity, byCategory, byDay, criticalCount, providerErrors, appealsOpen, reportsOpen] =
        await Promise.all([
          ModerationRecord.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
          ]),
          ModerationRecord.aggregate([
            { $match: { status: { $in: ["pending_review", "rejected"] } } },
            { $group: { _id: "$severity", count: { $sum: 1 } } },
          ]),
          ModerationRecord.aggregate([
            { $unwind: "$categories" },
            { $group: { _id: "$categories.category", count: { $sum: 1 }, avgScore: { $avg: "$categories.score" } } },
            { $sort: { count: -1 } },
            { $limit: 20 },
          ]),
          ModerationRecord.aggregate([
            { $match: { createdAt: { $gte: since } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                total: { $sum: 1 },
                rejected: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } },
                pending: { $sum: { $cond: [{ $eq: ["$status", "pending_review"] }, 1, 0] } },
                approved: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } },
                failed: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
              },
            },
            { $sort: { _id: 1 } },
          ]),
          ModerationRecord.countDocuments({ criticalEscalation: true }),
          ModerationRecord.aggregate([
            { $unwind: "$providerOutcomes" },
            { $match: { "providerOutcomes.verdict": "error" } },
            { $group: { _id: "$providerOutcomes.providerId", count: { $sum: 1 } } },
          ]),
          Appeal.countDocuments({ status: "pending" }),
          Report.countDocuments({ status: "pending" }),
        ]);

      return res.json({
        totals: {
          byStatus: Object.fromEntries(byStatus.map((b: any) => [b._id, b.count])),
          criticalEscalations: criticalCount,
          appealsOpen,
          reportsOpen,
        },
        bySeverity: Object.fromEntries(bySeverity.map((b: any) => [b._id, b.count])),
        byCategory: byCategory.map((c: any) => ({ category: c._id, count: c.count, avgScore: c.avgScore })),
        daily: byDay.map((d: any) => ({ date: d._id, ...d })),
        providerErrors: providerErrors.map((p: any) => ({ provider: p._id, count: p.count })),
        queue: queueStats(),
      });
    } catch (error: any) {
      return res.status(500).json({ error: "Failed to load statistics", details: error.message });
    }
  },
);

// GET /api/v1/system/moderation/health — secret-free provider + queue health
router.get(
  "/health",
  authenticateStaff,
  requirePermission("moderation.stats.view"),
  async (_req: AuthenticatedRequest, res: Response) => {
    try {
      const [queueDepth, processing, failedJobs] = await Promise.all([
        ModerationJob.countDocuments({ status: "queued" }),
        ModerationJob.countDocuments({ status: "processing" }),
        ModerationJob.countDocuments({ status: "failed" }),
      ]);
      return res.json({
        config: publicSummary(),
        queue: { ...queueStats(), depth: queueDepth, processing, failedJobs },
      });
    } catch (error: any) {
      return res.status(500).json({ error: "Failed to load health", details: error.message });
    }
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// User reports queue (pre-existing, unchanged behaviour)
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/v1/system/moderation/queue — pending reports
router.get("/queue", authenticateStaff, requirePermission("moderation.queue.view"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const status = (req.query.status as string) || "pending";
    const reports = await Report.find({ status })
      .sort({ severity: -1, createdAt: -1 })
      .limit(200)
      .populate("reporter", REPORTER_FIELDS)
      .populate("target", REPORTER_FIELDS)
      .populate("targetPost", "kind mediaUrl thumbnailUrl body author")
      .populate("targetLive", "title host status")
    return res.json({ reports });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load moderation queue", details: error.message });
  }
});

// POST /api/v1/system/moderation/reports/:id/action — remove content, warn, or suspend, with a reason
router.post(
  "/reports/:id/action",
  authenticateStaff,
  requirePermission("moderation.queue.action"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { action, reason } = req.body as { action: "remove" | "warn" | "suspend" | "dismiss"; reason?: unknown };
      const cleanReason = typeof reason === "string" ? reason.trim().slice(0, 500) : "";
      if (!["remove", "warn", "suspend", "dismiss"].includes(action)) {
        return res.status(400).json({ error: "action must be remove, warn, suspend or dismiss" });
      }
      if (action !== "dismiss" && !cleanReason) {
        return res.status(400).json({ error: "A reason is required for this action" });
      }

      const report = await Report.findById(req.params.id);
      if (!report) return res.status(404).json({ error: "Report not found" });

      if (action === "remove" && report.targetPost) {
        await softRemovePost(report.targetPost, req.staffUser!.userId, cleanReason);
      } else if (action === "suspend") {
        await User.findByIdAndUpdate(report.target, { status: "suspended" });
      }

      report.status = action === "dismiss" ? "dismissed" : "resolved";
      report.actionedBy = req.staffUser!.userId as any;
      report.actionedAt = new Date();
      report.actionNote = cleanReason || undefined;
      await report.save();

      await AuditLog.create({
        actor: req.staffUser!.userId,
        action: `moderation.${action}`,
        targetUser: report.target,
        targetPost: report.targetPost,
        targetId: String(report._id),
        meta: { reason: cleanReason },
      });

      if (action === "warn" || action === "suspend" || action === "remove") {
        await notify({
          recipient: String(report.target),
          kind: "system",
          text:
            action === "warn"
              ? `You received a warning from moderation: ${cleanReason}`
              : action === "suspend"
                ? `Your account has been suspended: ${cleanReason}`
                : `Content you posted was removed for violating guidelines: ${cleanReason}`,
        });
      }

      return res.json({ report });
    } catch (error: any) {
      return res.status(500).json({ error: "Failed to action report", details: error.message });
    }
  },
);

// POST /api/v1/system/moderation/reports/bulk-action — apply one action to many reports at once
router.post(
  "/reports/bulk-action",
  authenticateStaff,
  requirePermission("moderation.queue.action"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { ids, action, reason } = req.body as { ids: string[]; action: "remove" | "warn" | "suspend" | "dismiss"; reason?: unknown };
      const cleanReason = typeof reason === "string" ? reason.trim().slice(0, 500) : "";
      if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ error: "ids must be a non-empty array" });
      if (!["remove", "warn", "suspend", "dismiss"].includes(action)) {
        return res.status(400).json({ error: "action must be remove, warn, suspend or dismiss" });
      }
      if (action !== "dismiss" && !cleanReason) {
        return res.status(400).json({ error: "A reason is required for this action" });
      }

      const reports = await Report.find({ _id: { $in: ids }, status: "pending" });
      let succeeded = 0;

      for (const report of reports) {
        if (action === "remove" && report.targetPost) {
          await softRemovePost(report.targetPost, req.staffUser!.userId, cleanReason);
        } else if (action === "suspend") {
          await User.findByIdAndUpdate(report.target, { status: "suspended" });
        }

        report.status = action === "dismiss" ? "dismissed" : "resolved";
        report.actionedBy = req.staffUser!.userId as any;
        report.actionedAt = new Date();
        report.actionNote = cleanReason || undefined;
        await report.save();

        await AuditLog.create({
          actor: req.staffUser!.userId,
          action: `moderation.${action}`,
          targetUser: report.target,
          targetPost: report.targetPost,
          targetId: String(report._id),
          meta: { reason: cleanReason, bulk: true },
        });

        if (action !== "dismiss") {
          await notify({
            recipient: String(report.target),
            kind: "system",
            text:
              action === "warn"
                ? `You received a warning from moderation: ${cleanReason}`
                : action === "suspend"
                  ? `Your account has been suspended: ${cleanReason}`
                  : `Content you posted was removed for violating guidelines: ${cleanReason}`,
          });
        }
        succeeded += 1;
      }

      return res.json({ actioned: succeeded, requested: ids.length });
    } catch (error: any) {
      return res.status(500).json({ error: "Bulk action failed", details: error.message });
    }
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// Rules (thresholds / prohibited terms) — admin-managed with SAFE limits
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/v1/system/moderation/rules — everyone with moderation.rules.view can read
router.get("/rules", authenticateStaff, requirePermission("moderation.rules.view"), async (_req, res: Response) => {
  try {
    const rules = await ModerationRule.find({}).sort({ name: 1 });
    return res.json({ rules });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load moderation rules", details: error.message });
  }
});

/**
 * PUT /api/v1/system/moderation/rules/:key — admin/superadmin only.
 * Supported keys and their validated config shapes:
 *  - content_thresholds: { reviewThreshold: 0.2-0.9, blockThreshold: 0.4-0.95 }
 *    (block is forced ABOVE review; runtime override applied on next read)
 *  - prohibited_terms: { terms: string[] } (max 200 terms, 40 chars each)
 *  - live_chat_keywords: { keywords: string[] } (pre-existing rule)
 * Any attempt to weaken critical-category behaviour is refused.
 */
router.put("/rules/:key", authenticateStaff, requirePermission("moderation.rules.edit"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { enabled, config, name, description } = req.body;
    const key = req.params.key;

    if (config !== undefined && typeof config !== "object") {
      return res.status(400).json({ error: "config must be an object" });
    }

    if (key === "content_thresholds" && config) {
      const review = Number(config.reviewThreshold);
      const block = Number(config.blockThreshold);
      if (Number.isFinite(review) && (review < 0.2 || review > 0.9)) {
        return res.status(400).json({ error: "reviewThreshold must be between 0.2 and 0.9" });
      }
      if (Number.isFinite(block) && (block < 0.4 || block > 0.95)) {
        return res.status(400).json({ error: "blockThreshold must be between 0.4 and 0.95" });
      }
      if (Number.isFinite(review) && Number.isFinite(block) && block <= review) {
        return res.status(400).json({ error: "blockThreshold must be greater than reviewThreshold" });
      }
    }

    if (key === "prohibited_terms" && config) {
      const terms = config.terms;
      if (!Array.isArray(terms) || terms.length > 200 || terms.some((t: unknown) => typeof t !== "string" || t.length > 40)) {
        return res.status(400).json({ error: "terms must be an array of at most 200 strings of up to 40 characters" });
      }
    }

    const rule = await ModerationRule.findOneAndUpdate(
      { key },
      {
        key,
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(enabled !== undefined ? { enabled } : {}),
        ...(config !== undefined ? { config } : {}),
      },
      { upsert: true, new: true, setDefaults: true },
    );

    // Apply runtime threshold override immediately.
    if (key === "content_thresholds") {
      const c = rule.config as any;
      setRuntimeThresholdOverrides({
        reviewThreshold: Number.isFinite(Number(c?.reviewThreshold)) ? Number(c.reviewThreshold) : undefined,
        blockThreshold: Number.isFinite(Number(c?.blockThreshold)) ? Number(c.blockThreshold) : undefined,
      });
    }

    await AuditLog.create({
      actor: req.staffUser!.userId,
      action: "moderation.rules.edit",
      targetId: key,
      meta: { enabled, config },
    });

    return res.json({ rule });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to update rule", details: error.message });
  }
});

export default router;
