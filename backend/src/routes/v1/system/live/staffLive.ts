import { Router, Response } from "express";
import { LiveStream, LiveChatMessage } from "../../../../models/LiveStream";
import { ModerationRule } from "../../../../models/ModerationRule";
import { User } from "../../../../models/User";
import { AuditLog } from "../../../../models/AuditLog";
import { authenticateStaff, requirePermission, AuthenticatedRequest } from "../../../../middleware/rbac";
import { getIO } from "../../../../lib/socket";
import { broadcastForceEnd } from "../../../../lib/liveSignaling";
import { notify } from "../../../../lib/notify";
import { clearLiveViewers } from "../../../../lib/redis";

const router = Router();
const HOST_FIELDS = "name username avatarHue avatarUrl isCreator verified";

// GET /api/v1/system/live — every currently-live stream, for the moderation dashboard
router.get("/", authenticateStaff, requirePermission("moderation.queue.view"), async (_req, res: Response) => {
  try {
    const streams = await LiveStream.find({ status: "live" }).sort({ viewerCount: -1 }).populate("host", HOST_FIELDS);
    return res.json({ streams });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load live streams", details: error.message });
  }
});

// POST /api/v1/system/live/:id/force-end — moderator/admin/superadmin kill switch
router.post("/:id/force-end", authenticateStaff, requirePermission("live.forceEnd"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { reason } = req.body;
    const stream = await LiveStream.findById(req.params.id);
    if (!stream) return res.status(404).json({ error: "Stream not found" });

    stream.status = "force_ended";
    stream.endedAt = new Date();
    stream.endedBy = req.staffUser!.userId as any;
    stream.endReason = reason?.trim() || "Ended by moderator";
    stream.viewerCount = 0;
    await stream.save();
    await clearLiveViewers(String(stream._id));
    await User.findByIdAndUpdate(stream.host, { isLive: false });

    const io = getIO();
    if (io) broadcastForceEnd(io, String(stream._id), stream.endReason ?? "Ended by moderator");

    await AuditLog.create({
      actor: req.staffUser!.userId,
      action: "live.force_end",
      targetId: String(stream._id),
      meta: { reason: stream.endReason, host: String(stream.host) },
    });

    await notify({
      recipient: String(stream.host),
      kind: "system",
      text: `Your live stream was ended by a moderator: ${stream.endReason}`,
      relatedLive: String(stream._id),
    });

    return res.json({ stream });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to force-end stream", details: error.message });
  }
});

// GET /api/v1/system/live/alerts — flagged chat messages awaiting review
router.get("/alerts", authenticateStaff, requirePermission("live.alerts.manage"), async (_req, res: Response) => {
  try {
    const alerts = await LiveChatMessage.find({ flagged: true })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("sender", "name username")
      .populate("stream", "title host status");
    return res.json({ alerts });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load alerts", details: error.message });
  }
});

// GET/PUT /api/v1/system/live/keywords — the flagged-keyword list live chat is checked against
router.get("/keywords", authenticateStaff, requirePermission("moderation.rules.view"), async (_req, res: Response) => {
  try {
    const rule = await ModerationRule.findOne({ key: "live_chat_keywords" });
    return res.json({ keywords: (rule?.config as any)?.keywords ?? [] });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load keyword list", details: error.message });
  }
});

router.put("/keywords", authenticateStaff, requirePermission("moderation.rules.edit"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { keywords } = req.body;
    if (!Array.isArray(keywords)) return res.status(400).json({ error: "keywords must be an array of strings" });

    const clean = keywords.map((k: string) => String(k).trim().toLowerCase()).filter(Boolean);
    await ModerationRule.findOneAndUpdate(
      { key: "live_chat_keywords" },
      {
        key: "live_chat_keywords",
        name: "Live chat keyword alerts",
        description: "Chat messages containing these words are flagged for moderator review.",
        enabled: true,
        config: { keywords: clean },
        editableBy: "admin",
      },
      { upsert: true },
    );

    await AuditLog.create({
      actor: req.staffUser!.userId,
      action: "moderation.rules.edit",
      targetId: "live_chat_keywords",
      meta: { keywords: clean },
    });

    return res.json({ keywords: clean });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to update keyword list", details: error.message });
  }
});

export default router;
