import { LiveStream } from "../models/LiveStream";
import { AuditLog } from "../models/AuditLog";
import { getIO } from "../lib/socket";
import { redis } from "../lib/redis";
import { endStream } from "../services/liveStreamService";
import {
  MAX_LIVE_DURATION_MS,
  STALE_HEARTBEAT_MS,
  SWEEP_INTERVAL_MS,
  SWEEPER_LOCK_KEY,
  TIME_WARNING_MINUTES,
} from "../lib/liveConfig";

/**
 * Server-enforced stream hygiene:
 *
 *  1) Hard cap — any stream whose maxEndsAt has passed is ended with
 *     "Maximum duration (5 hours) reached" (LIVE_MAX_HOURS overrides the
 *     length for testing; the A7 regression run uses 2 minutes).
 *
 *  2) Stale heartbeat — a host whose lastHeartbeatAt is older than the
 *     grace window (crashed browser, killed tab, dead network) is ended
 *     with "Host disconnected". lastHeartbeatAt used to be written by the
 *     heartbeat route and never read by anything; this is the reader.
 *
 *  3) Time warnings — at 30/5/1 minutes of remaining time the room gets a
 *     live:time-warning event so hosts can wrap up and viewers aren't
 *     surprised by the cutoff.
 *
 * planSweep() is a PURE function (injectable clock, plain data in, plain
 * plan out) so the whole decision table is unit-testable without MongoDB,
 * Redis or timers. runSweep()/startLiveSweeper() are the thin impure shell.
 */

export interface SweepStreamInput {
  _id: string;
  status: string;
  startedAt?: Date | null;
  lastHeartbeatAt?: Date | null;
  maxEndsAt?: Date | null;
  /** Minutes already warned for (indexes into TIME_WARNING_MINUTES). */
  timeWarningsSent?: number[];
}

export interface SweepEndAction {
  streamId: string;
  reason: string;
  cause: "max-duration" | "stale-heartbeat";
}

export interface SweepWarningAction {
  streamId: string;
  minutesLeft: number;
  warningIndex: number;
}

export interface SweepPlan {
  toEnd: SweepEndAction[];
  warnings: SweepWarningAction[];
}

/** The canonical end-of-cap message, reused by tests and the client UI. */
export const MAX_DURATION_REASON = "Maximum duration (5 hours) reached";
export const STALE_HOST_REASON = "Host disconnected";

export function planSweep(now: Date, streams: SweepStreamInput[]): SweepPlan {
  const toEnd: SweepEndAction[] = [];
  const warnings: SweepWarningAction[] = [];

  for (const stream of streams) {
    if (stream.status !== "live") continue;

    // 1) Hard cap.
    if (stream.maxEndsAt) {
      if (now.getTime() >= stream.maxEndsAt.getTime()) {
        toEnd.push({ streamId: stream._id, reason: MAX_DURATION_REASON, cause: "max-duration" });
        continue; // no warnings for a stream that's about to die
      }

      // 3) Remaining-time warnings (each mark fires once per stream).
      const minutesLeft = (stream.maxEndsAt.getTime() - now.getTime()) / 60_000;
      const sent = stream.timeWarningsSent ?? [];
      for (let i = 0; i < TIME_WARNING_MINUTES.length; i++) {
        const mark = TIME_WARNING_MINUTES[i];
        if (minutesLeft <= mark && !sent.includes(i)) {
          warnings.push({ streamId: stream._id, minutesLeft: Math.max(0, Math.round(minutesLeft)), warningIndex: i });
        }
      }
    }

    // 2) Stale host. A missing heartbeat falls back to startedAt (a stream
    //    started and never heartbeated is equally dead after the grace).
    const lastBeat = stream.lastHeartbeatAt ?? stream.startedAt ?? null;
    if (lastBeat && now.getTime() - lastBeat.getTime() > STALE_HEARTBEAT_MS) {
      toEnd.push({ streamId: stream._id, reason: STALE_HOST_REASON, cause: "stale-heartbeat" });
    }
  }

  return { toEnd, warnings };
}

export interface SweeperState {
  running: boolean;
  lastRunAt: string | null;
  lastRunEnded: number;
  lastRunWarnings: number;
  lastError: string | null;
  intervalMs: number;
}

const state: SweeperState = {
  running: false,
  lastRunAt: null,
  lastRunEnded: 0,
  lastRunWarnings: 0,
  lastError: null,
  intervalMs: SWEEP_INTERVAL_MS,
};

export function getSweeperState(): SweeperState {
  return { ...state };
}

/**
 * One sweeper pass. Safe to run concurrently on multiple instances: the
 * Redis SETNX lock ( honoured by the in-memory shim for single-instance
 * dev) lets exactly one instance act per tick, and even without the lock
 * endStream()'s conditional update keeps every action idempotent — a
 * duplicated pass is a no-op, never a double side-effect.
 */
export async function runSweep(now: Date = new Date(), opts: { lock?: boolean } = {}): Promise<SweepPlan> {
  const useLock = opts.lock ?? true;
  const instanceId = `${process.pid}-${Math.random().toString(36).slice(2, 8)}`;

  if (useLock) {
    // Lock TTL ~2.5 ticks: long enough to cover a slow pass, short enough
    // that a crashed sweeper can't starve the others.
    const claimed = await redis.setnx(SWEEPER_LOCK_KEY, instanceId);
    if (claimed !== 1) {
      // Another instance owns this tick — skip acting, report an empty plan.
      return { toEnd: [], warnings: [] };
    }
    await redis.expire(SWEEPER_LOCK_KEY, Math.ceil(SWEEP_INTERVAL_MS / 1000) * 2 + 5);
  }

  try {
    const liveStreams = await LiveStream.find({ status: "live" })
      .select("_id status startedAt lastHeartbeatAt maxEndsAt timeWarningsSent")
      .lean();
    const plan = planSweep(now, liveStreams as unknown as SweepStreamInput[]);

    for (const action of plan.toEnd) {
      const result = await endStream({
        streamId: action.streamId,
        reason: action.reason,
        status: "ended",
        notifyHost: action.cause === "stale-heartbeat" ? false : true,
      });
      if (result.changed) {
        await AuditLog.create({
          actor: result.stream?.host ?? undefined,
          action: `live.sweep.${action.cause}`,
          targetId: action.streamId,
          meta: { reason: action.reason, cause: action.cause },
        }).catch(() => {});
      }
    }

    const io = getIO();
    for (const warning of plan.warnings) {
      if (io) {
        io.to(`live:${warning.streamId}`).emit("live:time-warning", {
          streamId: warning.streamId,
          minutesLeft: warning.minutesLeft,
          mark: TIME_WARNING_MINUTES[warning.warningIndex],
        });
      }
      await LiveStream.updateOne(
        { _id: warning.streamId, status: "live" },
        { $addToSet: { timeWarningsSent: warning.warningIndex } },
      ).catch(() => {});
    }

    state.lastRunAt = now.toISOString();
    state.lastRunEnded = plan.toEnd.length;
    state.lastRunWarnings = plan.warnings.length;
    state.lastError = null;
    return plan;
  } catch (err) {
    state.lastError = err instanceof Error ? err.message : String(err);
    console.error("[liveSweeper] pass failed:", err);
    return { toEnd: [], warnings: [] };
  } finally {
    if (useLock) {
      await redis.del(SWEEPER_LOCK_KEY).catch(() => {});
    }
  }
}

let sweeperTimer: ReturnType<typeof setInterval> | null = null;

/** Starts the periodic sweeper (no-op when already running). Call from server.ts. */
export function startLiveSweeper(): void {
  if (sweeperTimer) return;
  state.running = true;
  console.log(
    `[liveSweeper] started — interval ${SWEEP_INTERVAL_MS / 1000}s, cap ${MAX_LIVE_DURATION_MS / 3_600_000}h, stale after ${STALE_HEARTBEAT_MS / 1000}s`,
  );
  // First pass shortly after boot so a restart immediately cleans up
  // anything that ended while the process was down.
  setTimeout(() => void runSweep(), 3_000).unref?.();
  sweeperTimer = setInterval(() => void runSweep(), SWEEP_INTERVAL_MS);
  sweeperTimer.unref?.();
}

export function stopLiveSweeper(): void {
  if (sweeperTimer) {
    clearInterval(sweeperTimer);
    sweeperTimer = null;
  }
  state.running = false;
}
