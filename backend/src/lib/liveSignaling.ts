import { Socket, Server as SocketIOServer } from "socket.io";
import { LiveStream, LiveChatMessage } from "../models/LiveStream";
import { ModerationRule } from "../models/ModerationRule";
import { User } from "../models/User";
import { addLiveViewer, removeLiveViewer, incrLiveReactions } from "./redis";

async function getFlaggedKeywords(): Promise<string[]> {
  const rule = await ModerationRule.findOne({ key: "live_chat_keywords" });
  const list = (rule?.config as any)?.keywords;
  return Array.isArray(list) ? list.map((w: string) => String(w).toLowerCase()) : [];
}

function canModerate(stream: any, userId: string) {
  return String(stream.host) === userId || stream.moderators.some((m: any) => String(m) === userId);
}

/**
 * Everything here is real-time *interaction* data — chat, presence, reactions,
 * moderation events. Video/audio never rides this socket; the client connects
 * to LiveKit directly for that, per the architecture.
 */
export function attachLiveHandlers(io: SocketIOServer, socket: Socket, userId?: string) {
  // ── Viewer joins: Redis-backed presence count, notify the room ──
  socket.on("live:join", async ({ streamId }: { streamId: string }) => {
    if (!userId) return;
    const stream = await LiveStream.findById(streamId);
    if (!stream) return;
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
    socket.leave(`live:${streamId}`);
    const count = await removeLiveViewer(streamId, socket.id);
    await LiveStream.findByIdAndUpdate(streamId, { viewerCount: count });
    io.to(`live:${streamId}`).emit("live:viewer-count", { streamId, viewerCount: count });
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

  // ── Reactions — high-frequency, counted in Redis, not persisted per-tap ──
  socket.on("live:react", async ({ streamId, kind }: { streamId: string; kind?: string }) => {
    if (!userId) return;
    const total = await incrLiveReactions(streamId, 1);
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
    stream.status = "ended";
    stream.endedAt = new Date();
    await stream.save();
    io.to(`live:${streamId}`).emit("live:ended", { streamId, reason: "Host ended the stream" });
  });

  socket.on("disconnect", async () => {
    const streamId = socket.data?.streamId as string | undefined;
    if (streamId) {
      const count = await removeLiveViewer(streamId, socket.id);
      io.to(`live:${streamId}`).emit("live:viewer-count", { streamId, viewerCount: count });
    }
  });
}

/** Used by the moderator "force-end" REST endpoint to push the live event to viewers. */
export function broadcastForceEnd(io: SocketIOServer, streamId: string, reason: string) {
  io.to(`live:${streamId}`).emit("live:ended", { streamId, reason, forced: true });
}
