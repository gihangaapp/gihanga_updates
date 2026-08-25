import { Socket, Server as SocketIOServer } from "socket.io";
import { LiveStream, LiveChatMessage } from "../models/LiveStream";
import { ModerationRule } from "../models/ModerationRule";
import { User } from "../models/User";
import { addLiveViewer, removeLiveViewer, clearLiveViewers, incrLiveReactions } from "./redis";

async function getFlaggedKeywords(): Promise<string[]> {
  const rule = await ModerationRule.findOne({ key: "live_chat_keywords" });
  const list = (rule?.config as any)?.keywords;
  return Array.isArray(list) ? list.map((w: string) => String(w).toLowerCase()) : [];
}

function canModerate(stream: any, userId: string) {
  return String(stream.host) === userId || stream.moderators.some((m: any) => String(m) === userId);
}

/**
 * Everything here is real-time interaction data plus WebRTC signaling. Video/audio
 * itself never rides this socket; browsers connect directly peer-to-peer.
 */
export function attachLiveHandlers(io: SocketIOServer, socket: Socket, userId?: string) {
  // ── Host heartbeat: keep a valid broadcast lease alive even if a REST request drops ──
  socket.on("live:heartbeat", async ({ streamId }: { streamId: string }) => {
    if (!userId) return;
    await LiveStream.findOneAndUpdate(
      { _id: streamId, host: userId, status: "live" },
      { lastHeartbeatAt: new Date() },
    );
  });

  // ── Viewer joins: Redis-backed presence count, notify the room ──
  socket.on("live:join", async ({ streamId }: { streamId: string }) => {
    if (!userId || !streamId) return;

    // A single authenticated socket can move from one live room to another.
    // Remove its old presence before joining the new room so quick card clicks
    // do not leave the viewer counted in two streams at once.
    const previousStreamId = socket.data.streamId as string | undefined;
    if (previousStreamId && previousStreamId !== streamId) {
      socket.leave(`live:${previousStreamId}`);
      const previousCount = await removeLiveViewer(previousStreamId, socket.id);
      const previousStream = await LiveStream.findOneAndUpdate(
        { _id: previousStreamId, status: "live" },
        { viewerCount: previousCount },
      );
      if (previousStream) {
        io.to(`live:${previousStreamId}`).emit("live:viewer-count", {
          streamId: previousStreamId,
          viewerCount: previousCount,
        });
      }
    }

    const stream = await LiveStream.findById(streamId);
    if (!stream || stream.status !== "live") return;
    if (stream.bannedUsers.some((b) => String(b) === userId)) {
      socket.emit("live:banned", { streamId });
      return;
    }

    socket.join(`live:${streamId}`);
    socket.data.streamId = streamId;
    socket.data.userId = userId;

    const count = await addLiveViewer(streamId, socket.id);
    await LiveStream.findByIdAndUpdate(streamId, { viewerCount: count, $max: { peakViewers: count } });
    io.to(`live:${streamId}`).emit("live:viewer-count", { streamId, viewerCount: count });
  });

  socket.on("live:leave", async ({ streamId }: { streamId: string }) => {
    if (!streamId) return;
    socket.leave(`live:${streamId}`);
    const count = await removeLiveViewer(streamId, socket.id);
    const liveStream = await LiveStream.findOneAndUpdate(
      { _id: streamId, status: "live" },
      { viewerCount: count },
    );
    if (liveStream) io.to(`live:${streamId}`).emit("live:viewer-count", { streamId, viewerCount: count });
    if (socket.data.streamId === streamId) socket.data.streamId = undefined;
  });

  // ── Browser-native WebRTC signaling: Socket.IO carries SDP/ICE only ──
  socket.on("live:webrtc:ready", async ({ streamId }: { streamId: string }) => {
    if (!userId) return;
    const stream = await LiveStream.findOne({ _id: streamId, status: "live" });
    if (!stream || String(stream.host) === userId) return;
    socket.join(`live:${streamId}`);
    socket.to(`live:${streamId}`).emit("live:webrtc:viewer-ready", { streamId, viewerId: socket.id });
  });

  socket.on("live:webrtc:offer", ({ streamId, targetId, description }: { streamId: string; targetId?: string; description: Record<string, unknown> }) => {
    if (!userId || !targetId || !description) return;
    io.to(targetId).emit("live:webrtc:offer", { streamId, hostId: socket.id, description });
  });

  socket.on("live:webrtc:answer", ({ streamId, targetId, description }: { streamId: string; targetId?: string; description: Record<string, unknown> }) => {
    if (!userId || !targetId || !description) return;
    io.to(targetId).emit("live:webrtc:answer", { streamId, viewerId: socket.id, description });
  });

  socket.on("live:webrtc:ice", ({ streamId, targetId, candidate }: { streamId: string; targetId?: string; candidate: Record<string, unknown> }) => {
    if (!userId || !targetId || !candidate) return;
    io.to(targetId).emit("live:webrtc:ice", { streamId, senderId: socket.id, candidate });
  });

  // ── Live chat — blocked for muted/banned users, checked against the keyword list ──
  socket.on("live:chat", async ({ streamId, body }: { streamId: string; body: string }) => {
    if (!userId || !body?.trim()) return;
    const stream = await LiveStream.findById(streamId);
    if (!stream || stream.status !== "live") return;
    if (stream.mutedUsers.some((m) => String(m) === userId) || stream.bannedUsers.some((b) => String(b) === userId)) {
      socket.emit("live:chat-blocked", { streamId, reason: "You've been muted in this stream" });
      return;
    }

    const keywords = await getFlaggedKeywords();
    const lower = body.toLowerCase();
    const flagged = keywords.some((kw) => kw && lower.includes(kw));

    const message = await LiveChatMessage.create({ stream: streamId, sender: userId, body: body.trim(), flagged });
    const sender = await User.findById(userId).select("name username avatarHue avatarUrl isCreator verified");

    io.to(`live:${streamId}`).emit("live:chat", {
      _id: message._id,
      stream: streamId,
      sender,
      body: message.body,
      isGift: false,
      pinned: false,
      createdAt: message.createdAt,
    });

    if (flagged) {
      io.to("staff:moderators").emit("moderation:live-alert", {
        streamId,
        messageId: message._id,
        sender: { username: sender?.username, name: sender?.name },
        body: message.body,
        createdAt: message.createdAt,
      });
    }
  });

  // ── Reactions — counted in Redis for the current room and persisted in DB ──
  socket.on("live:react", async ({ streamId, kind }: { streamId: string; kind?: string }) => {
    if (!userId) return;
    const stream = await LiveStream.findOne({ _id: streamId, status: "live" });
    if (!stream) return;
    const total = await incrLiveReactions(streamId, 1);
    await LiveStream.findByIdAndUpdate(streamId, { $inc: { reactionsCount: 1 } });
    io.to(`live:${streamId}`).emit("live:reaction", { streamId, kind: kind || "heart", total, from: userId });
  });

  // ── Moderation: pin/unpin, delete comment, kick a viewer (host or a stream moderator) ──
  socket.on("live:pin-comment", async ({ streamId, commentId }: { streamId: string; commentId: string }) => {
    if (!userId) return;
    const stream = await LiveStream.findById(streamId);
    if (!stream || !canModerate(stream, userId)) return;
    await LiveChatMessage.updateMany({ stream: streamId }, { pinned: false });
    const message = await LiveChatMessage.findByIdAndUpdate(commentId, { pinned: true }, { new: true }).populate(
      "sender",
      "name username avatarHue avatarUrl",
    );
    if (message) io.to(`live:${streamId}`).emit("live:comment-pinned", { streamId, message });
  });

  socket.on("live:unpin-comment", async ({ streamId, commentId }: { streamId: string; commentId: string }) => {
    if (!userId) return;
    const stream = await LiveStream.findById(streamId);
    if (!stream || !canModerate(stream, userId)) return;
    await LiveChatMessage.findByIdAndUpdate(commentId, { pinned: false });
    io.to(`live:${streamId}`).emit("live:comment-unpinned", { streamId, commentId });
  });

  socket.on("live:delete-comment", async ({ streamId, commentId }: { streamId: string; commentId: string }) => {
    if (!userId) return;
    const stream = await LiveStream.findById(streamId);
    const message = await LiveChatMessage.findById(commentId);
    if (!stream || !message) return;
    const isOwn = String(message.sender) === userId;
    if (!isOwn && !canModerate(stream, userId)) return;
    await LiveChatMessage.deleteOne({ _id: commentId });
    io.to(`live:${streamId}`).emit("live:comment-deleted", { streamId, commentId });
  });

  socket.on("live:kick-viewer", async ({ streamId, targetUserId }: { streamId: string; targetUserId: string }) => {
    if (!userId) return;
    const stream = await LiveStream.findById(streamId);
    if (!stream || !canModerate(stream, userId)) return;
    io.to(`user:${targetUserId}`).emit("live:kicked", { streamId });
  });

  // ── Host ends their own stream ──
  socket.on("live:end", async ({ streamId }: { streamId: string }) => {
    if (!userId) return;
    const stream = await LiveStream.findOne({ _id: streamId, host: userId });
    if (!stream) return;
    const wasLive = stream.status === "live";
    if (wasLive) {
      stream.status = "ended";
      stream.endedAt = new Date();
      stream.endReason = "Host ended the stream";
      stream.viewerCount = 0;
      await stream.save();
      await clearLiveViewers(streamId);
      io.to(`live:${streamId}`).emit("live:ended", { streamId, reason: "Host ended the stream" });
      io.to(`live:${streamId}`).emit("live:viewer-count", { streamId, viewerCount: 0 });
    }
    const anotherLiveStream = await LiveStream.exists({ host: userId, status: "live" });
    if (!anotherLiveStream) await User.findByIdAndUpdate(userId, { isLive: false });
  });

  socket.on("disconnect", async () => {
    const streamId = socket.data?.streamId as string | undefined;
    if (streamId) {
      const count = await removeLiveViewer(streamId, socket.id);
      socket.data.streamId = undefined;
      const liveStream = await LiveStream.findOneAndUpdate(
        { _id: streamId, status: "live" },
        { viewerCount: count },
      );
      if (liveStream) io.to(`live:${streamId}`).emit("live:viewer-count", { streamId, viewerCount: count });
    }
  });
}

/** Used by the moderator "force-end" REST endpoint to push the live event to viewers. */
export function broadcastForceEnd(io: SocketIOServer, streamId: string, reason: string) {
  io.to(`live:${streamId}`).emit("live:ended", { streamId, reason, forced: true });
}
