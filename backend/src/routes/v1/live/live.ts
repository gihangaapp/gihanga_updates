import { Router, Response } from "express";
import { body as bodyValidator, validationResult } from "express-validator";
import { LiveStream, LiveChatMessage } from "../../../models/LiveStream";
import { User } from "../../../models/User";
import { Follow } from "../../../models/Follow";
import { Wallet } from "../../../models/Wallet";
import { Transaction } from "../../../models/Transaction";
import { Report } from "../../../models/Report";
import { authenticateConsumer, authenticateConsumerOrStaff, AuthenticatedRequest } from "../../../middleware/rbac";
import { optionalAuth } from "../../../middleware/optionalAuth";
import { getIO } from "../../../lib/socket";
import { createLiveKitToken, getLiveKitUrl, isLiveKitConfigured, computeLiveKitTokenTtlSeconds } from "../../../lib/livekit";
import { applyLedgerEntry, debitWalletAtomic } from "../../../lib/wallet";
import { notify } from "../../../lib/notify";
import { notifyStaff } from "../../../lib/staffNotify";
import { clearLiveViewers } from "../../../lib/redis";
import { endStream } from "../../../services/liveStreamService";
import { getPaidInteractionDefaults, isStaffRole, PAID_INTERACTION_BOUNDS } from "../../../lib/paidInteractions";
import { MAX_LIVE_DURATION_MS } from "../../../lib/liveConfig";

const router = Router();
const HOST_FIELDS = "name username avatarHue avatarUrl isCreator verified followersCount role";

// PATCH /api/v1/live/:id/settings — host adjusts gifts/subsOnly/paidInteractions while live
router.patch("/:id/settings", authenticateConsumerOrStaff, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stream = await LiveStream.findOne({ _id: req.params.id, host: req.user!.userId });
    if (!stream) return res.status(404).json({ error: "Stream not found" });

    const { giftsEnabled, subsOnly, paidInteractions } = req.body;
    if (giftsEnabled !== undefined) stream.giftsEnabled = Boolean(giftsEnabled);
    if (subsOnly !== undefined) stream.subsOnly = Boolean(subsOnly);

    // A5 — per-stream paid like/comment/reaction settings, validated with
    // express-validator-style bounds (min 0, sane maxima) so neither a stray
    // client nor a compromised one can set absurd prices.
    if (paidInteractions && typeof paidInteractions === "object") {
      const { enabled, likePrice, commentPrice, reactionPrice } = paidInteractions as Record<string, unknown>;
      // Moderator-only privilege: only staff hosts (moderator/admin/superadmin)
      // may run paid streams. Normal creators' streams are always free — a
      // request to enable is rejected, and any legacy enabled flag is forced
      // back off so old data self-heals.
      const hostUser = await User.findById(req.user!.userId).select("role").lean();
      const staffHost = isStaffRole(hostUser?.role);
      if (!staffHost) {
        if (enabled === true) {
          return res.status(403).json({ error: "Paid interactions are only available on moderator-hosted streams" });
        }
        if (enabled !== undefined) stream.paidInteractions.enabled = false;
      } else {
        if (enabled !== undefined) stream.paidInteractions.enabled = Boolean(enabled);
        const priceFields: ["likePrice" | "commentPrice" | "reactionPrice", number][] = [
          ["likePrice", PAID_INTERACTION_BOUNDS.maxLikePrice],
          ["commentPrice", PAID_INTERACTION_BOUNDS.maxCommentPrice],
          ["reactionPrice", PAID_INTERACTION_BOUNDS.maxReactionPrice],
        ];
        for (const [field, max] of priceFields) {
          const raw = paidInteractions[field];
          if (raw === undefined) continue;
          const n = Number(raw);
          if (!Number.isFinite(n) || n < 0 || n > max) {
            return res.status(400).json({ error: `${field} must be a number between 0 and ${max}` });
          }
          stream.paidInteractions[field] = Math.floor(n);
        }
      }
    }
    await stream.save();

    return res.json({ stream });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update settings", details: (error as Error).message });
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

    const { title, description, subsOnly, giftsEnabled, paidInteractions } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: "Give your stream a title" });

    // A4 — server-enforced duration cap: the deadline is stored on the stream
    // and the sweeper is the reader/enforcer. Returned in every stream payload
    // so hosts can render a countdown and clients can pre-compute remaining time.
    const startedAt = new Date();
    const maxEndsAt = new Date(startedAt.getTime() + MAX_LIVE_DURATION_MS);

    // A5 — paid interactions are a moderator-stream exclusive (v2 policy):
    // default ON for staff-hosted streams (moderator/admin/superadmin), and
    // FORCED OFF for normal creators regardless of what the client sends.
    // The charge path re-checks the host role, so this is defence in depth.
    const staffHost = isStaffRole(user.role);
    const defaultPrices = await getPaidInteractionDefaults();
    const requestedPaid =
      paidInteractions && typeof paidInteractions === "object" ? (paidInteractions as Record<string, unknown>) : {};
    const paidEnabledRaw = requestedPaid.enabled;
    const paidEnabled = staffHost ? (paidEnabledRaw === undefined ? true : Boolean(paidEnabledRaw)) : false;
    const clampPriceField = (raw: unknown, fallback: number, max: number) => {
      if (raw === undefined) return fallback;
      const n = Number(raw);
      if (!Number.isFinite(n) || n < 0 || n > max) return fallback;
      return Math.floor(n);
    };

    const stream = await LiveStream.create({
      host: user._id,
      title: title.trim().slice(0, 200),
      description: description?.trim().slice(0, 1000),
      subsOnly: Boolean(subsOnly),
      giftsEnabled: giftsEnabled !== false,
      paidInteractions: {
        enabled: paidEnabled,
        likePrice: clampPriceField(requestedPaid.likePrice, defaultPrices.likePrice, PAID_INTERACTION_BOUNDS.maxLikePrice),
        commentPrice: clampPriceField(requestedPaid.commentPrice, defaultPrices.commentPrice, PAID_INTERACTION_BOUNDS.maxCommentPrice),
        reactionPrice: clampPriceField(requestedPaid.reactionPrice, defaultPrices.reactionPrice, PAID_INTERACTION_BOUNDS.maxReactionPrice),
      },
      status: "live",
      startedAt,
      lastHeartbeatAt: startedAt,
      maxEndsAt,
      timeWarningsSent: [],
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
    return res.status(201).json({ stream: populated, maxLiveDurationMs: MAX_LIVE_DURATION_MS });
  } catch (error) {
    return res.status(500).json({ error: "Failed to start live stream", details: (error as Error).message });
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

// POST /api/v1/live/:id/end — host ends their own stream. Idempotent, and
// funnelled through the SAME endStream() service as the socket path, staff
// force-end and the sweeper so end-of-stream behaviour can never drift.
router.post("/:id/end", authenticateConsumerOrStaff, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stream = await LiveStream.findOne({ _id: req.params.id, host: req.user!.userId });
    if (!stream) return res.status(404).json({ error: "Stream not found" });
    const result = await endStream({
      streamId: String(stream._id),
      reason: "Host ended the stream",
      status: "ended",
      notifyHost: false,
    });
    return res.json({ stream: result.stream ?? stream });
  } catch (error) {
    return res.status(500).json({ error: "Failed to end stream", details: (error as Error).message });
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

// GET /api/v1/live/:id/livekit-token — mint a short-lived LiveKit Cloud join token
// Replaces the manual SDP/ICE relaying in liveSignaling.ts for the video pipe:
// the browser connects straight to LiveKit Cloud with this token, while chat,
// reactions, gifts, viewer counts and moderation all stay on Socket.IO here.
// Host/co-hosts get canPublish; plain viewers get canSubscribe only. The
// response shape ({ url, token }) is what frontend/src/lib/livekit-live.ts
// consumes. Requires LIVEKIT_URL / LIVEKIT_API_KEY / LIVEKIT_API_SECRET
// (see .env.example); without them the legacy mesh path still works.
router.get("/:id/livekit-token", authenticateConsumerOrStaff, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!isLiveKitConfigured()) {
      return res.status(503).json({ error: "Live video service is not configured yet" });
    }
    const stream = await LiveStream.findById(req.params.id);
    if (!stream) return res.status(404).json({ error: "Stream not found" });
    if (stream.status !== "live") return res.status(409).json({ error: "Stream has ended" });
    if (stream.bannedUsers.some((b) => String(b) === req.user!.userId)) {
      return res.status(403).json({ error: "You're banned from this stream" });
    }

    const userId = req.user!.userId;
    const isHost = String(stream.host) === userId;
    const isCoHost = stream.coHosts.some((c) => String(c) === userId);

    // A4 — a join token must never meaningfully outlive the stream's cap:
    // TTL = clamp(remaining time + 60 s grace, 60 s, ceiling).
    const remainingMs = stream.maxEndsAt ? stream.maxEndsAt.getTime() - Date.now() : Number.MAX_SAFE_INTEGER;
    if (remainingMs <= 0) {
      // The sweeper may not have ticked yet — end it now rather than handing
      // out a token to a stream that's past its deadline.
      await endStream({ streamId: String(stream._id), reason: "Maximum duration (5 hours) reached", status: "ended" });
      return res.status(409).json({ error: "This stream reached the 5-hour limit" });
    }

    const token = await createLiveKitToken({
      room: String(stream._id),
      identity: userId,
      canPublish: isHost || isCoHost,
      ttlSeconds: computeLiveKitTokenTtlSeconds(remainingMs),
    });

    return res.json({ url: getLiveKitUrl(), token, room: String(stream._id), maxEndsAt: stream.maxEndsAt ?? null });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to mint live token", details: error.message });
  }
});

// GET /api/v1/live/:id/earnings — host-only: gift + paid-interaction earnings for this stream
router.get("/:id/earnings", authenticateConsumerOrStaff, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stream = await LiveStream.findById(req.params.id);
    if (!stream) return res.status(404).json({ error: "Stream not found" });
    if (String(stream.host) !== req.user!.userId) {
      return res.status(403).json({ error: "Only the host can view stream earnings" });
    }

    const earnings = await Transaction.find({
      user: req.user!.userId,
      kind: { $in: ["gift", "live_like", "live_comment", "live_reaction"] },
      relatedLive: stream._id,
      amount: { $gt: 0 },
    }).sort({ createdAt: -1 });

    const gifts = earnings.filter((t) => t.kind === "gift");
    const paidLikes = earnings.filter((t) => t.kind === "live_like");
    const paidComments = earnings.filter((t) => t.kind === "live_comment");
    const paidReactions = earnings.filter((t) => t.kind === "live_reaction");
    const sum = (list: typeof earnings) => list.reduce((acc, t) => acc + t.amount, 0);

    const totalPoints = sum(earnings);
    return res.json({
      totalPoints,
      giftCount: gifts.length,
      gifts,
      paidInteractions: {
        likeCount: paidLikes.length,
        commentCount: paidComments.length,
        reactionCount: paidReactions.length,
        likePoints: sum(paidLikes),
        commentPoints: sum(paidComments),
        reactionPoints: sum(paidReactions),
      },
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to load earnings", details: (error as Error).message });
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

// POST /api/v1/live/:id/gift — send a point-based gift, moves real wallet points immediately.
// Money safety (A5/§8.1): the old flow did check-then-debit (read balance,
// then applyLedgerEntry) which two concurrent requests could double-spend.
// The debit is now a single conditional findOneAndUpdate — the balance can
// never go negative and concurrent gifts can never both win.
router.post("/:id/gift", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { giftId, idempotencyKey } = req.body as { giftId?: string; idempotencyKey?: string };
    const amount = GIFT_OPTIONS[giftId ?? ""];
    if (!amount) return res.status(400).json({ error: "Unknown gift" });

    const stream = await LiveStream.findById(req.params.id).populate("host", HOST_FIELDS);
    if (!stream || stream.status !== "live") return res.status(404).json({ error: "Stream is not live" });
    if (!stream.giftsEnabled) return res.status(400).json({ error: "Gifting is disabled for this stream" });
    if (String((stream.host as any)._id) === req.user!.userId) {
      return res.status(400).json({ error: "You can't gift your own stream" });
    }

    const sender = await User.findById(req.user!.userId).select("name username avatarHue avatarUrl isCreator verified");

    const debit = await debitWalletAtomic({
      userId: req.user!.userId,
      amount,
      kind: "gift",
      label: `Gift sent to @${(stream.host as any).username}`,
      toBalance: "kingdomPoints",
      relatedLive: String(stream._id),
    });
    if (!debit.ok) {
      if (debit.reason === "frozen") return res.status(403).json({ error: "Your wallet is frozen" });
      return res.status(400).json({ error: "Not enough Kingdom Points for that gift" });
    }

    // Credit the host. On failure the sender is refunded — all-or-nothing.
    try {
      await applyLedgerEntry({
        userId: String((stream.host as any)._id),
        kind: "gift",
        amount,
        label: `Gift from @${sender?.username}`,
        toBalance: "kingdomPoints",
        relatedLive: String(stream._id),
      });
    } catch (creditErr) {
      await applyLedgerEntry({
        userId: req.user!.userId,
        kind: "gift",
        amount,
        label: `Refund — gift to @${(stream.host as any).username} failed`,
        toBalance: "kingdomPoints",
        relatedLive: String(stream._id),
      }).catch(() => {});
      console.error("[live/gift] host credit failed; sender refunded:", creditErr);
      return res.status(500).json({ error: "Gift failed — you were not charged" });
    }

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

    return res.json({ sent: true, amount, remainingPoints: debit.remainingPoints });
  } catch (error: any) {
    return res.status(500).json({ error: "Gift failed", details: error.message });
  }
});

export default router;
