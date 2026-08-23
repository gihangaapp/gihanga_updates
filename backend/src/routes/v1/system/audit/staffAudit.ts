import { Router, Response } from "express";
import { AuditLog } from "../../../../models/AuditLog";
import { authenticateStaff, requirePermission, ROLE_PERMISSIONS, AuthenticatedRequest } from "../../../../middleware/rbac";

const router = Router();

// GET /api/v1/system/audit — moderators see only their own actions; admin/superadmin see everything.
// Supports filtering by action, actor, and date range.
router.get("/", authenticateStaff, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const permissions = ROLE_PERMISSIONS[req.staffUser!.role];
    const canViewAll = permissions.has("audit.viewAll");
    if (!canViewAll && !permissions.has("audit.viewOwn")) {
      return res.status(403).json({ error: "Forbidden: insufficient permissions" });
    }

    const { action, actor, from, to } = req.query as Record<string, string | undefined>;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);

    const query: any = {};
    if (!canViewAll) query.actor = req.staffUser!.userId;
    else if (actor) query.actor = actor;
    if (action) query.action = new RegExp(action.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    const [entries, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("actor", "name username role")
        .populate("targetUser", "name username"),
      AuditLog.countDocuments(query),
    ]);

    return res.json({ entries, page, total, hasMore: page * limit < total, scope: canViewAll ? "all" : "own" });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load audit log", details: error.message });
  }
});

export default router;
