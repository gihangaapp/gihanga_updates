import { LiveStream, ILiveStream } from "../models/LiveStream";
import { User } from "../models/User";
import { getIO } from "../lib/socket";
import { clearLiveViewers } from "../lib/redis";
import { notify } from "../lib/notify";
import { deleteLiveKitRoom } from "../lib/livekit";

/**
 * The ONE place a live stream transitions live -> ended/force_ended.
 *
 * Before this service existed the same end-of-stream choreography was
 * duplicated (and drifting) across call sites: REST POST /live/:id/end, the
 * socket "live:end" handler, the staff force-end endpoint — and nothing at
 * all for crashed hosts. Now every caller funnels through here and gets
 * identical behaviour:
 *
 *  - atomic, idempotent status flip (findOneAndUpdate guards on status:"live"
 *    so concurrent callers — REST + sweeper + staff — can never double-end or
 *    resurrect a stream)
 *  - co-host list cleared WITH a live:co-host:left broadcast per co-host (so
 *    every role's split-screen tiles disappear without stale black cells)
 *  - viewer count reset + Redis presence cleared
 *  - live:ended + live:viewer-count socket events to the stream room
 *  - host User.isLive reset (only when they host no other live stream)
 *  - LiveKit room teardown so participants still connected to the SFU are
 *    dropped instead of streaming into a ghost room
 *  - optional host notification
 */

export type EndStreamStatus = "ended" | "force_ended";

export interface EndStreamOptions {
  streamId: string;
  /** Human-readable reason surfaced in the UI and stored on the stream. */
  reason: string;
  /** "ended" (host/sweeper) or "force_ended" (staff kill switch). */
  status?: EndStreamStatus;
  /** Staff/admin user id when a human force-ended the stream. */
  endedBy?: string;
  /** Notify the host via the notifications system (default true). */
  notifyHost?: boolean;
}

export interface EndStreamResult {
  /** The stream AFTER the attempt (latest DB state), or null if never existed. */
  stream: ILiveStream | null;
  /** False when the stream was already ended — no side effects ran. */
  changed: boolean;
  reason: string;
}

export async function endStream(options: EndStreamOptions): Promise<EndStreamResult> {
  const { streamId, reason, status = "ended", endedBy, notifyHost = true } = options;

  // Capture the co-host list BEFORE the flip so the per-co-host broadcasts
  // below can reference people who were live when the stream ended.
  const before = await LiveStream.findById(streamId).select("coHosts status").lean();
  const coHostIdsBefore = (before?.coHosts ?? []).map((c) => String(c));

  // Atomic guard: only a stream that is STILL live flips here. A second
  // concurrent caller (sweeper + REST end, duplicated sweeper instance, …)
  // gets changed:false and performs no side effects — full idempotency.
  const stream = await LiveStream.findOneAndUpdate(
    { _id: streamId, status: "live" },
    {
      status,
      endedAt: new Date(),
      endReason: reason,
      viewerCount: 0,
      coHosts: [],
    },
    { new: true },
  );

  if (!stream) {
    const existing = await LiveStream.findById(streamId);
    return { stream: existing ?? null, changed: false, reason };
  }

  const hostId = String(stream.host);

  // Side effects — each best-effort so one failure can't block the rest.
  const safe = (label: string, fn: () => Promise<unknown>) =>
    fn().catch((err: unknown) => console.error(`[endStream] ${label} failed:`, err));

  await safe("clearLiveViewers", () => clearLiveViewers(streamId));

  const io = getIO();
  if (io) {
    // Tell every co-host tile to disappear on ALL roles before the generic
    // ended event lands (the client treats both, but this keeps the grid
    // consistent even if a client ignores live:ended).
    for (const coHostId of coHostIdsBefore) {
      io.to(`live:${streamId}`).emit("live:co-host:left", { streamId, coHostId });
    }
    io.to(`live:${streamId}`).emit("live:ended", {
      streamId,
      reason,
      forced: status === "force_ended",
      endStatus: status,
    });
    io.to(`live:${streamId}`).emit("live:viewer-count", { streamId, viewerCount: 0 });
  }

  // Clear the host's isLive flag unless they simultaneously host another stream.
  await safe("resetHostIsLive", async () => {
    const anotherLiveStream = await LiveStream.exists({ host: hostId, status: "live" });
    if (!anotherLiveStream) await User.findByIdAndUpdate(hostId, { isLive: false });
  });

  // Drop the LiveKit room so any participant still connected to the SFU is
  // disconnected server-side (their client also receives live:ended and
  // tears down locally).
  await safe("deleteLiveKitRoom", () => deleteLiveKitRoom(streamId));

  if (notifyHost) {
    await safe("notifyHost", () =>
      notify({
        recipient: hostId,
        actor: endedBy,
        kind: "system",
        text:
          status === "force_ended"
            ? `Your live stream was ended by a moderator: ${reason}`
            : `Your live stream ended: ${reason}`,
        relatedLive: streamId,
      }),
    );
  }

  return { stream, changed: true, reason };
}
