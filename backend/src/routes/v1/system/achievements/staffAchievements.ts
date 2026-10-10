import { Router, Response } from "express";
import { authenticateStaff, requirePermission, AuthenticatedRequest } from "../../../../middleware/rbac";
import { AchievementDefinition } from "../../../../models/Achievement";
import { User } from "../../../../models/User";
import { UserAchievement } from "../../../../models/Achievement";
import {
  getAllDefinitions,
  invalidateDefinitionsCache,
  reconcileBatch,
  DEFAULT_ACHIEVEMENTS,
} from "../../../../services/achievementService";
import { logAudit } from "../../../../utils/auditLogger";

const router = Router();

/**
 * Achievement Badge System — administrative endpoints.
 *
 * Mounted under /api/v1/system/achievements. All routes require staff auth.
 *   - Viewing definitions / award records  → achievements.view (admin+)
 *   - Editing definitions / triggering reconcile → achievements.edit (superadmin)
 *
 * The role model is the app's existing one — no new privileged roles are
 * introduced.
 */

// GET /api/v1/system/achievements/definitions — all definitions (incl. disabled)
router.get("/definitions", authenticateStaff, requirePermission("achievements.view"), async (_req, res: Response) => {
  try {
    const definitions = await getAllDefinitions();
    return res.json({ definitions });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load achievement definitions", details: error.message });
  }
});

// PUT /api/v1/system/achievements/definitions/:achievementId
// Edit a single definition's threshold, enabled state, name or description.
// Bumps the definition version so subsequent awards carry the version they
// were granted under (audit trail). Threshold must be a positive integer.
router.put(
  "/definitions/:achievementId",
  authenticateStaff,
  requirePermission("achievements.edit"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const achievementId = String(req.params.achievementId);
      const { threshold, enabled, name, description } = req.body;

      const existing = await AchievementDefinition.findOne({ achievementId });
      if (!existing) return res.status(404).json({ error: "Achievement definition not found" });

      if (threshold !== undefined) {
        const t = Number(threshold);
        if (!Number.isFinite(t) || t < 1 || !Number.isInteger(t)) {
          return res.status(400).json({ error: "threshold must be a positive integer" });
        }
        existing.threshold = t;
      }
      if (enabled !== undefined) existing.enabled = Boolean(enabled);
      if (name !== undefined && String(name).trim()) existing.name = String(name).trim().slice(0, 64);
      if (description !== undefined) existing.description = String(description).slice(0, 280);

      // Bump version on any substantive edit (threshold/enabled change).
      if (threshold !== undefined || enabled !== undefined) {
        existing.version = (existing.version ?? 1) + 1;
      }

      await existing.save();
      await invalidateDefinitionsCache();

      await logAudit({
        actor: req.staffUser!.userId,
        action: "achievements.definition.update",
        targetId: achievementId,
        meta: { threshold, enabled, name, description, version: existing.version },
      });

      return res.json({ definition: existing });
    } catch (error: any) {
      return res.status(500).json({ error: "Failed to update achievement definition", details: error.message });
    }
  },
);

// POST /api/v1/system/achievements/reconcile
// Triggers a reconciliation pass for a batch of users. Accepts an explicit
// list of userIds, or (default) reconciles users who are "near" a follower
// threshold (within 5% below) plus recently-active creators. Bounded to
// 200 users per call so it can't be abused to lock the DB.
router.post(
  "/reconcile",
  authenticateStaff,
  requirePermission("achievements.edit"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      let userIds: string[] = Array.isArray(req.body.userIds)
        ? req.body.userIds.slice(0, 200).map(String).filter(Boolean)
        : [];

      // If no explicit list, pick users near a threshold + recently-active creators.
      if (userIds.length === 0) {
        const thresholds = [10_000, 100_000, 1_000_000];
        const nearThreshold: string[] = [];
        for (const t of thresholds) {
          const docs = await User.find({
            deletedAt: null,
            status: { $in: ["active", "limited"] },
            followersCount: { $gte: Math.floor(t * 0.9), $lt: Math.ceil(t * 1.05) },
          })
            .select("_id")
            .limit(60)
            .lean();
          nearThreshold.push(...docs.map((d) => String(d._id)));
        }
        // Recently-active creators (posted in the last 7 days).
        const since = new Date(Date.now() - 7 * 24 * 3600 * 1000);
        const { Post } = await import("../../../../models/Post");
        const recentAuthors = await Post.aggregate([
          { $match: { createdAt: { $gte: since }, status: "published" } },
          { $group: { _id: "$author" } },
          { $limit: 80 },
        ]);
        userIds = [...new Set([...nearThreshold, ...recentAuthors.map((author) => String(author._id))])].slice(0, 200);
      }

      const summary = await reconcileBatch(userIds);
      await logAudit({
        actor: req.staffUser!.userId,
        action: "achievements.reconcile",
        meta: summary,
      });
      return res.json({ ...summary, userIds });
    } catch (error: any) {
      return res.status(500).json({ error: "Failed to reconcile achievements", details: error.message });
    }
  },
);

// GET /api/v1/system/achievements/awards — paginated list of award records
// (for admin reporting). Supports filtering by achievementId.
router.get("/awards", authenticateStaff, requirePermission("achievements.view"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 30, 1), 100);
    const filter: any = {};
    if (typeof req.query.achievementId === "string") filter.achievementId = req.query.achievementId;
    if (req.query.revoked === "true") filter.revokedAt = { $ne: null };
    else if (req.query.revoked === "false") filter.revokedAt = null;

    const [records, total] = await Promise.all([
      UserAchievement.find(filter).sort({ awardedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      UserAchievement.countDocuments(filter),
    ]);

    return res.json({ records, total, page, pages: Math.ceil(total / limit) || 1 });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load award records", details: error.message });
  }
});

// POST /api/v1/system/achievements/seed — idempotently (re)seeds the default
// achievement definitions. Safe to run more than once (upserts, never deletes
// existing awards). Useful after a schema change or to restore a deleted def.
router.post("/seed", authenticateStaff, requirePermission("achievements.edit"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    let created = 0;
    let updated = 0;
    for (const def of DEFAULT_ACHIEVEMENTS) {
      const result = await AchievementDefinition.findOneAndUpdate(
        { achievementId: def.achievementId },
        {
          $set: {
            name: def.name,
            category: def.category,
            metric: def.metric,
            description: def.description,
            threshold: def.threshold,
            icon: def.icon,
            color: def.color,
            enabled: true,
          },
          $setOnInsert: { version: 1 },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
      if (result.version === 1 && new Date(result.createdAt).getTime() > Date.now() - 5000) created++;
      else updated++;
    }
    await invalidateDefinitionsCache();
    await logAudit({ actor: req.staffUser!.userId, action: "achievements.seed", meta: { created, updated } });
    return res.json({ created, updated, total: DEFAULT_ACHIEVEMENTS.length });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to seed achievements", details: error.message });
  }
});

export default router;
