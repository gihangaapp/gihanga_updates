import { Router, Response } from "express";
import { authenticateConsumer, AuthenticatedRequest } from "../../../middleware/rbac";
import { optionalAuth } from "../../../middleware/optionalAuth";
import { logInteractionEvent, logNegativeFeedback } from "../../../services/recommendation/eventTracker";
import {
  getForYouFeed,
  getReelsFeed,
  getExploreFeed,
  getTrendingFeed,
} from "../../../services/recommendation/recommendationService";
import { RecommendationConfig, DEFAULT_REC_CONFIG } from "../../../models/RecommendationConfig";

const router = Router();

// POST /api/v1/recommendations/events — Log interaction event
router.post("/events", optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      event,
      targetKind,
      targetId,
      creatorId,
      watchDuration,
      contentDuration,
      watchPercentage,
      completed,
      rewatched,
      skipped,
      tags,
      category,
      sessionId,
      metadata,
    } = req.body;

    if (!event || !targetKind || !targetId) {
      return res.status(400).json({ error: "event, targetKind, targetId are required" });
    }

    await logInteractionEvent({
      userId: req.user?.userId,
      sessionId,
      event,
      targetKind,
      targetId,
      creatorId,
      watchDuration,
      contentDuration,
      watchPercentage,
      completed,
      rewatched,
      skipped,
      tags,
      category,
      metadata,
    });

    return res.status(204).end();
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to log event", details: error.message });
  }
});

// POST /api/v1/recommendations/feedback — Submit 'Not Interested' feedback
router.post("/feedback", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { contentId, reason } = req.body;
    if (!contentId) return res.status(400).json({ error: "contentId is required" });

    await logNegativeFeedback(req.user!.userId, contentId, reason || "not_interested");
    return res.json({ success: true, message: "Feedback recorded. We will show less content like this." });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to record feedback", details: error.message });
  }
});

// GET /api/v1/recommendations/for-you — Personalized For You feed
router.get("/for-you", optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 50);
    const cursor = req.query.cursor ? String(req.query.cursor) : undefined;

    const result = await getForYouFeed(req.user?.userId, limit, cursor);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load For You feed", details: error.message });
  }
});

// GET /api/v1/recommendations/reels — Personalized Reels feed
router.get("/reels", optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const cursor = req.query.cursor ? String(req.query.cursor) : undefined;

    const result = await getReelsFeed(req.user?.userId, limit, cursor);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load reels recommendation feed", details: error.message });
  }
});

// GET /api/v1/recommendations/explore — Personalized Explore feed
router.get("/explore", optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 50);
    const cursor = req.query.cursor ? String(req.query.cursor) : undefined;

    const result = await getExploreFeed(req.user?.userId, limit, cursor);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load explore feed", details: error.message });
  }
});

// GET /api/v1/recommendations/trending — Dynamic Trending feed
router.get("/trending", optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 50);
    const cursor = req.query.cursor ? String(req.query.cursor) : undefined;

    const result = await getTrendingFeed(req.user?.userId, limit, cursor);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load trending feed", details: error.message });
  }
});

// GET /api/v1/recommendations/config — Get current recommendation config
router.get("/config", async (_req, res: Response) => {
  try {
    const config = await RecommendationConfig.findOne({ key: "global_v1" });
    return res.json({ config: config || DEFAULT_REC_CONFIG });
  } catch {
    return res.json({ config: DEFAULT_REC_CONFIG });
  }
});

export default router;
