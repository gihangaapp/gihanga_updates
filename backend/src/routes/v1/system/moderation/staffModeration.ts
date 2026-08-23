import { Router, Response } from "express";
import { Report } from "../../../../models/Report";
import { Post } from "../../../../models/Post";
import { User } from "../../../../models/User";
import { ModerationRule } from "../../../../models/ModerationRule";
import { AuditLog } from "../../../../models/AuditLog";
import { authenticateStaff, requirePermission, AuthenticatedRequest } from "../../../../middleware/rbac";
import { notify } from "../../../../lib/notify";

const router = Router();
const REPORTER_FIELDS = "name username avatarHue avatarUrl";

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
      .populate("targetLive", "title host status");
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
      const { action, reason } = req.body as { action: "remove" | "warn" | "suspend" | "dismiss"; reason: string };
      if (!["remove", "warn", "suspend", "dismiss"].includes(action)) {
        return res.status(400).json({ error: "action must be remove, warn, suspend or dismiss" });
      }
      if (action !== "dismiss" && !reason?.trim()) {
        return res.status(400).json({ error: "A reason is required for this action" });
      }

      const report = await Report.findById(req.params.id);
      if (!report) return res.status(404).json({ error: "Report not found" });

      if (action === "remove" && report.targetPost) {
        await Post.findByIdAndDelete(report.targetPost);
      } else if (action === "suspend") {
        await User.findByIdAndUpdate(report.target, { status: "suspended" });
      }

      report.status = action === "dismiss" ? "dismissed" : "resolved";
      report.actionedBy = req.staffUser!.userId as any;
      report.actionedAt = new Date();
      report.actionNote = reason?.trim();
      await report.save();

      await AuditLog.create({
        actor: req.staffUser!.userId,
        action: `moderation.${action}`,
        targetUser: report.target,
        targetPost: report.targetPost,
        targetId: String(report._id),
        meta: { reason },
      });

      if (action === "warn" || action === "suspend" || action === "remove") {
        await notify({
          recipient: String(report.target),
          kind: "system",
          text:
            action === "warn"
              ? `You received a warning from moderation: ${reason}`
              : action === "suspend"
                ? `Your account has been suspended: ${reason}`
                : `Content you posted was removed for violating guidelines: ${reason}`,
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
      const { ids, action, reason } = req.body as { ids: string[]; action: "remove" | "warn" | "suspend" | "dismiss"; reason?: string };
      if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ error: "ids must be a non-empty array" });
      if (!["remove", "warn", "suspend", "dismiss"].includes(action)) {
        return res.status(400).json({ error: "action must be remove, warn, suspend or dismiss" });
      }
      if (action !== "dismiss" && !reason?.trim()) {
        return res.status(400).json({ error: "A reason is required for this action" });
      }

      const reports = await Report.find({ _id: { $in: ids }, status: "pending" });
      let succeeded = 0;

      for (const report of reports) {
        if (action === "remove" && report.targetPost) {
          await Post.findByIdAndDelete(report.targetPost);
        } else if (action === "suspend") {
          await User.findByIdAndUpdate(report.target, { status: "suspended" });
        }

        report.status = action === "dismiss" ? "dismissed" : "resolved";
        report.actionedBy = req.staffUser!.userId as any;
        report.actionedAt = new Date();
        report.actionNote = reason?.trim();
        await report.save();

        await AuditLog.create({
          actor: req.staffUser!.userId,
          action: `moderation.${action}`,
          targetUser: report.target,
          targetPost: report.targetPost,
          targetId: String(report._id),
          meta: { reason, bulk: true },
        });

        if (action !== "dismiss") {
          await notify({
            recipient: String(report.target),
            kind: "system",
            text:
              action === "warn"
                ? `You received a warning from moderation: ${reason}`
                : action === "suspend"
                  ? `Your account has been suspended: ${reason}`
                  : `Content you posted was removed for violating guidelines: ${reason}`,
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

// GET /api/v1/system/moderation/rules — everyone with moderation.rules.view can read
router.get("/rules", authenticateStaff, requirePermission("moderation.rules.view"), async (_req, res: Response) => {
  try {
    const rules = await ModerationRule.find({}).sort({ name: 1 });
    return res.json({ rules });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load moderation rules", details: error.message });
  }
});

// PUT /api/v1/system/moderation/rules/:key — admin/superadmin only
router.put("/rules/:key", authenticateStaff, requirePermission("moderation.rules.edit"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { enabled, config, name, description } = req.body;
    const rule = await ModerationRule.findOneAndUpdate(
      { key: req.params.key },
      {
        key: req.params.key,
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(enabled !== undefined ? { enabled } : {}),
        ...(config !== undefined ? { config } : {}),
      },
      { upsert: true, new: true, setDefaults: true },
    );

    await AuditLog.create({
      actor: req.staffUser!.userId,
      action: "moderation.rules.edit",
      targetId: req.params.key,
      meta: { enabled, config },
    });

    return res.json({ rule });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to update rule", details: error.message });
  }
});

export default router;
