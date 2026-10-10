import { Router, Response } from "express";
import { authenticateConsumer, AuthenticatedRequest } from "../../../middleware/rbac";
import { optionalAuth } from "../../../middleware/optionalAuth";
import {
  getEnabledDefinitions,
  getPublicBadgeStates,
  getDetailedProgress,
  evaluateUser,
  invalidateUserMetrics,
} from "../../../services/achievementService";
import { User } from "../../../models/User";

const router = Router();

/**
 * Achievement Badge System — public + authenticated API.
 *
 * All endpoints are read-only from the client's perspective. Awards are only
 * ever created by the backend (the achievement service, on follow events and
 * via the periodic sweeper). A client can never POST to create an award —
 * the earned state is always derived from authoritative backend data.
 */

// GET /api/v1/achievements/definitions
// Public list of all enabled achievement definitions. The frontend uses this
// to render the badge row's shape (icon, color, threshold, label) even before
// per-user data loads, so the row never pops in.
router.get("/definitions", async (_req, res: Response) => {
  try {
    const defs = await getEnabledDefinitions();
    return res.json({
      definitions: defs.map((d) => ({
        achievementId: d.achievementId,
        name: d.name,
        category: d.category,
        metric: d.metric,
        description: d.description,
        threshold: d.threshold,
        icon: d.icon,
        color: d.color,
      })),
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load achievement definitions", details: error.message });
  }
});

// GET /api/v1/achievements/me/progress
// The authenticated user's detailed progress: every badge with its current
// metric value, remaining count and clamped 0–100 progress percentage. Only
// available for the logged-in user (private progress).
router.get("/me/progress", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const progress = await getDetailedProgress(req.user!.userId);
    return res.json({ progress });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load achievement progress", details: error.message });
  }
});

// GET /api/v1/achievements/:username
// Public badge states for any user's profile — returns ALL configured badges
// (locked + unlocked) with earned state and award date (if earned). Only
// public information is exposed; no internal risk scores or moderation data.
router.get("/:username", optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findOne({ username: String(req.params.username).toLowerCase() }).select("_id status deletedAt");
    if (!user) return res.status(404).json({ error: "User not found" });
    // Don't surface badges for deleted/suspended accounts — the profile itself
    // is hidden in that case, so the badge row should be too.
    if (user.deletedAt || user.status === "suspended" || user.status === "banned") {
      return res.json({ badges: [] });
    }

    const badges = await getPublicBadgeStates(String(user._id));
    return res.json({ badges });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load achievements", details: error.message });
  }
});

// POST /api/v1/achievements/me/reevaluate
// Lets the authenticated user request an immediate re-evaluation (e.g. right
// after they hit a milestone they're watching). This is the same idempotent
// operation the sweeper runs; calling it manually just makes the unlock
// happen sooner than the next sweep. Returns the badges that were newly
// awarded so the client can fire its own celebration animation.
router.post("/me/reevaluate", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Invalidate cached metrics first so the evaluation uses fresh values.
    await invalidateUserMetrics(req.user!.userId);
    const result = await evaluateUser(req.user!.userId);
    return res.json({
      newlyAwarded: result.newlyAwarded.map((d) => ({
        achievementId: d.achievementId,
        name: d.name,
        category: d.category,
        color: d.color,
        icon: d.icon,
        threshold: d.threshold,
      })),
      revoked: result.revoked.map((d) => d.achievementId),
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to re-evaluate achievements", details: error.message });
  }
});

export default router;
