import { Router, Response } from "express";
import { LiveStream, LiveChatMessage } from "../../../models/LiveStream";
import { User } from "../../../models/User";
import { Follow } from "../../../models/Follow";
import { Wallet } from "../../../models/Wallet";
import { Transaction } from "../../../models/Transaction";
import { Report } from "../../../models/Report";
import { authenticateConsumer, authenticateConsumerOrStaff, AuthenticatedRequest } from "../../../middleware/rbac";
import { optionalAuth } from "../../../middleware/optionalAuth";
import { getIO } from "../../../lib/socket";
import { applyLedgerEntry } from "../../../lib/wallet";
import { notify } from "../../../lib/notify";
import { notifyStaff } from "../../../lib/staffNotify";
import { clearLiveViewers } from "../../../lib/redis";

const router = Router();
const HOST_FIELDS = "name username avatarHue avatarUrl isCreator verified followersCount";
async function clearHostLiveFlagIfNeeded(hostId: unknown) {
  const anotherLiveStream = await LiveStream.exists({ host: hostId, status: "live" });
  if (!anotherLiveStream) await User.findByIdAndUpdate(hostId, { isLive: false });
}

// PATCH /api/v1/live/:id/settings — host adjusts gifts/subsOnly while live
router.patch("/:id/settings", authenticateConsumerOrStaff, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stream = await LiveStream.findOne({ _id: req.params.id, host: req.user!.userId });
    if (!stream) return res.status(404).json({ error: "Stream not found" });

    const { giftsEnabled, subsOnly } = req.body;
    if (giftsEnabled !== undefined) stream.giftsEnabled = Boolean(giftsEnabled);
    if (subsOnly !== undefined) stream.subsOnly = Boolean(subsOnly);
    await stream.save();

    return res.json({ stream });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to update settings", details: error.message });
  }
});

// POST /api/v1/live/start — a creator, moderator, admin, or superadmin goes live
router.post("/start", authenticateConsumerOrStaff, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user) return res.status(404).json({ error: "Account not found" });
    if (!user.isCreator && user.role === "user") {
      return res.status(403).json({ error: "Only creator or staff accounts can go live" });
    }

    const existing = await LiveStream.findOne({ host: user._id, status: "live" });
    if (existing) {
      return res.status(409).json({ error: "You already have an active live stream", streamId: existing._id });
    }

    const { title, description, subsOnly, giftsEnabled } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: "Give your stream a title" });

    const stream = await LiveStream.create({
      host: user._id,
      title: title.trim().slice(0, 200),
      description: description?.trim().slice(0, 1000),
      subsOnly: Boolean(subsOnly),
      giftsEnabled: giftsEnabled !== false,
      status: "live",
      startedAt: new Date(),
      lastHeartbeatAt: new Date(),
    });

    await user.updateOne({ isLive: true });

    const followers = await Follow.find({ following: user._id }).select("follower").limit(2000);
    await Promise.all(
      followers.map((f) =>
        notify({
          recipient: String(f.follower),
          actor: String(user._id),
          kind: "live",
          text: `${user.name} just went live: ${stream.title}`,
          relatedLive: String(stream._id),
        }),
      ),
    );

    const populated = await stream.populate("host", HOST_FIELDS);
    return res.status(201).json({ stream: populated });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to start live stream", details: error.message });
  }
});

// POST /api/v1/live/:id/heartbeat — host proves that the browser is still broadcasting
router.post("/:id/heartbeat", authenticateConsumerOrStaff, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stream = await LiveStream.findOne({ _id: req.params.id, host: req.user!.userId });
    if (!stream) return res.status(404).json({ error: "Stream not found" });
    if (stream.status !== "live") return res.status(409).json({ error: "Stream has ended" });

    stream.lastHeartbeatAt = new Date();
    await stream.save();
    await User.findByIdAndUpdate(req.user!.userId, { isLive: true });
    return res.json({ ok: true, lastHeartbeatAt: stream.lastHeartbeatAt });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to update stream heartbeat", details: error.message });
  }
});

// POST /api/v1/live/:id/invite — host re-notifies their followers about the live (e.g. for latecomers)
router.post("/:id/invite", authenticateConsumerOrStaff, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stream = await LiveStream.findOne({ _id: req.params.id, host: req.user!.userId }).populate("host", "name");
    if (!stream) return res.status(404).json({ error: "Stream not found" });
    if (stream.status !== "live") return res.status(400).json({ error: "Stream is not live" });

    const followers = await Follow.find({ following: req.user!.userId }).select("follower").limit(2000);
    await Promise.all(
      followers.map((f) =>
        notify({
          recipient: String(f.follower),
          actor: req.user!.userId,
          kind: "live",
          text: `${(stream.host as any).name} is live now: ${stream.title} — join in!`,
          relatedLive: String(stream._id),
        }),
      ),
    );

    return res.json({ invited: followers.length });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to send invites", details: error.message });
  }
});

// POST /api/v1/live/:id/end — host ends their own stream
router.post("/:id/end", authenticateConsumerOrStaff, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stream = await LiveStream.findOne({ _id: req.params.id, host: req.user!.userId });
    if (!stream) return res.status(404).json({ error: "Stream not found" });
    const wasLive = stream.status === "live";
    if (wasLive) {
      stream.status = "ended";
      stream.endedAt = new Date();
      stream.endReason = "Host ended the stream";
      stream.viewerCount = 0;
      stream.coHosts = [];
      await stream.save();
      await clearLiveViewers(String(stream._id));
      getIO()?.to(`live:${stream._id}`).emit("live:ended", { streamId: String(stream._id), reason: "Host ended the stream" });
    }
    await clearHostLiveFlagIfNeeded(req.user!.userId);
    return res.json({ stream });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to end stream", details: error.message });
  }
});

// GET /api/v1/live — currently live streams
router.get("/", optionalAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const streams = await LiveStream.find({ status: "live" }).sort({ viewerCount: -1 }).populate("host", HOST_FIELDS);
    return res.json({ streams });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load live streams", details: error.message });
  }
});

// GET /api/v1/live/:id — a single stream's detail (live or ended — stats persist after ending)
router.get("/:id", optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stream = await LiveStream.findById(req.params.id)
      .populate("host", HOST_FIELDS)
      .populate("moderators", "name username avatarHue avatarUrl")
      .populate("coHosts", "name username avatarHue avatarUrl isCreator verified");
    if (!stream) return res.status(404).json({ error: "Stream not found" });
    return res.json({ stream });
  } catch {
    return res.status(404).json({ error: "Stream not found" });
  }
});

// GET /api/v1/live/:id/chat — chat history, pinned comment first
router.get("/:id/chat", optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 300);
    const [pinned, messages] = await Promise.all([
      LiveChatMessage.findOne({ stream: req.params.id, pinned: true }).populate(
        "sender",
        "name username avatarHue avatarUrl isCreator verified",
      ),
      LiveChatMessage.find({ stream: req.params.id, flagged: false })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("sender", "name username avatarHue avatarUrl isCreator verified"),
    ]);
    return res.json({ pinned, messages: messages.reverse() });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load chat history", details: error.message });
  }
});

// GET /api/v1/live/:id/earnings — host-only: gift earnings for this stream
router.get("/:id/earnings", authenticateConsumerOrStaff, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stream = await LiveStream.findById(req.params.id);
    if (!stream) return res.status(404).json({ error: "Stream not found" });
    if (String(stream.host) !== req.user!.userId) {
      return res.status(403).json({ error: "Only the host can view stream earnings" });
    }

    const gifts = await Transaction.find({
      user: req.user!.userId,
      kind: "gift",
      relatedLive: stream._id,
      amount: { $gt: 0 },
    }).sort({ createdAt: -1 });

    const totalPoints = gifts.reduce((sum, g) => sum + g.amount, 0);
    return res.json({ totalPoints, giftCount: gifts.length, gifts });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to load earnings", details: error.message });
  }
});

// POST /api/v1/live/:id/report — a viewer reports a live stream
router.post("/:id/report", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { reason, excerpt } = req.body;
    const stream = await LiveStream.findById(req.params.id);
    if (!stream) return res.status(404).json({ error: "Stream not found" });

    await Report.create({
      reporter: req.user!.userId,
      target: stream.host,
      targetLive: stream._id,
      reason: reason || "Other",
      excerpt: excerpt?.slice(0, 300),
    });

    await notifyStaff("all", `New report on a live stream: ${reason || "Other"}`, { streamId: String(stream._id) });

    return res.status(201).json({ reported: true });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to submit report", details: error.message });
  }
});

// ── Host moderation: moderators, mute, ban ──────────────────────────────────

function isHost(stream: any, userId: string) {
  return String(stream.host) === userId;
}

router.post("/:id/moderators", authenticateConsumerOrStaff, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { username } = req.body;
    const stream = await LiveStream.findById(req.params.id);
    if (!stream) return res.status(404).json({ error: "Stream not found" });
    if (!isHost(stream, req.user!.userId)) return res.status(403).json({ error: "Only the host can add moderators" });

    const target = await User.findOne({ username: String(username).toLowerCase() });
    if (!target) return res.status(404).json({ error: "User not found" });
    if (!stream.moderators.some((m) => String(m) === String(target._id))) {
      stream.moderators.push(target._id as any);
      await stream.save();
    }
    return res.json({ moderators: stream.moderators });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to add moderator", details: error.message });
  }
});

router.delete("/:id/moderators/:userId", authenticateConsumerOrStaff, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stream = await LiveStream.findById(req.params.id);
    if (!stream) return res.status(404).json({ error: "Stream not found" });
    if (!isHost(stream, req.user!.userId)) return res.status(403).json({ error: "Only the host can remove moderators" });
    stream.moderators = stream.moderators.filter((m) => String(m) !== req.params.userId) as any;
    await stream.save();
    return res.json({ moderators: stream.moderators });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to remove moderator", details: error.message });
  }
});

router.post("/:id/viewers/:userId/mute", authenticateConsumerOrStaff, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stream = await LiveStream.findById(req.params.id);
    if (!stream) return res.status(404).json({ error: "Stream not found" });
    const modOk = isHost(stream, req.user!.userId) || stream.moderators.some((m) => String(m) === req.user!.userId);
    if (!modOk) return res.status(403).json({ error: "Only the host or a moderator can mute viewers" });

    const already = stream.mutedUsers.some((m) => String(m) === req.params.userId);
    stream.mutedUsers = already
      ? (stream.mutedUsers.filter((m) => String(m) !== req.params.userId) as any)
      : ([...stream.mutedUsers, req.params.userId] as any);
    await stream.save();
    return res.json({ muted: !already });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to update mute state", details: error.message });
  }
});

router.post("/:id/viewers/:userId/ban", authenticateConsumerOrStaff, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stream = await LiveStream.findById(req.params.id);
    if (!stream) return res.status(404).json({ error: "Stream not found" });
    const modOk = isHost(stream, req.user!.userId) || stream.moderators.some((m) => String(m) === req.user!.userId);
    if (!modOk) return res.status(403).json({ error: "Only the host or a moderator can ban viewers" });

    const already = stream.bannedUsers.some((m) => String(m) === req.params.userId);
    stream.bannedUsers = already
      ? (stream.bannedUsers.filter((m) => String(m) !== req.params.userId) as any)
      : ([...stream.bannedUsers, req.params.userId] as any);
    await stream.save();

    if (!already) {
      getIO()?.to(`user:${req.params.userId}`).emit("live:kicked", { streamId: String(stream._id) });
    }
    return res.json({ banned: !already });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to update ban state", details: error.message });
  }
});

const GIFT_OPTIONS: Record<string, number> = {
  heart: 10,
  fire: 50,
  crown: 200,
  rocket: 500,
};

// POST /api/v1/live/:id/gift — send a point-based gift, moves real wallet points immediately
router.post("/:id/gift", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { giftId } = req.body;
    const amount = GIFT_OPTIONS[giftId];
    if (!amount) return res.status(400).json({ error: "Unknown gift" });

    const stream = await LiveStream.findById(req.params.id).populate("host", HOST_FIELDS);
    if (!stream || stream.status !== "live") return res.status(404).json({ error: "Stream is not live" });
    if (!stream.giftsEnabled) return res.status(400).json({ error: "Gifting is disabled for this stream" });
    if (String((stream.host as any)._id) === req.user!.userId) {
      return res.status(400).json({ error: "You can't gift your own stream" });
    }

    const senderWallet = await Wallet.findOne({ user: req.user!.userId });
    if (!senderWallet || senderWallet.kingdomPoints < amount) {
      return res.status(400).json({ error: "Not enough Kingdom Points for that gift" });
    }
    if (senderWallet.frozen) return res.status(403).json({ error: "Your wallet is frozen" });

    const sender = await User.findById(req.user!.userId).select("name username avatarHue avatarUrl isCreator verified");

    await applyLedgerEntry({
      userId: req.user!.userId,
      kind: "gift",
      amount: -amount,
      label: `Gift sent to @${(stream.host as any).username}`,
      toBalance: "kingdomPoints",
      relatedLive: String(stream._id),
    });
    await applyLedgerEntry({
      userId: String((stream.host as any)._id),
      kind: "gift",
      amount,
      label: `Gift from @${sender?.username}`,
      toBalance: "kingdomPoints",
      relatedLive: String(stream._id),
    });

    stream.totalGifts += amount;
    await stream.save();

    const message = await LiveChatMessage.create({
      stream: stream._id,
      sender: req.user!.userId,
      body: `sent a ${giftId} gift (${amount} pts)`,
      isGift: true,
      giftAmount: amount,
    });

    getIO()?.to(`live:${stream._id}`).emit("live:chat", {
      _id: message._id,
      stream: String(stream._id),
      sender,
      body: message.body,
      isGift: true,
      giftAmount: amount,
      pinned: false,
      createdAt: message.createdAt,
    });
    getIO()?.to(`live:${stream._id}`).emit("live:gift", {
      streamId: String(stream._id),
      totalGifts: stream.totalGifts,
      giftId,
      amount,
    });

    await notify({
      recipient: String((stream.host as any)._id),
      actor: req.user!.userId,
      kind: "reward",
      text: `sent you a gift worth ${amount} points`,
      relatedLive: String(stream._id),
    });

    return res.json({ sent: true, amount, remainingPoints: senderWallet.kingdomPoints - amount });
  } catch (error: any) {
    return res.status(500).json({ error: "Gift failed", details: error.message });
  }
});

export default router;
