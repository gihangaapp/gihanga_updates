import { User } from "../models/User";
import { Post } from "../models/Post";
import { redis } from "./redis";
import { reconcileBatch } from "../services/achievementService";

/**
 * Achievement Badge System — periodic reconciliation sweeper.
 *
 * Mirrors the liveSweeper pattern: a Redis SETNX lock (so only one instance
 * acts per tick, even on multi-instance prod) + setInterval. Every pass:
 *
 *   1) Picks a bounded batch of users worth re-checking:
 *      - users whose followersCount is within 5% below any star threshold
 *        (a follow might have just pushed them over)
 *      - creators who posted in the last 24h (their view counts are moving)
 *      - a rotating slice of all active creators (so nobody is starved)
 *   2) Calls reconcileBatch() on them — idempotent, so a duplicated pass is
 *      always a no-op.
 *
 * Awards happen promptly on follow/unfollow/view events (those call
 * evaluateUser inline). The sweeper is the safety net: it catches anything
 * the event-driven path missed (drift, missed events, bulk suspensions) and
 * repairs the cached followersCount counter when it disagrees with the
 * authoritative Follow collection.
 */

export const SWEEP_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes
export const SWEEPER_LOCK_KEY = "ach:sweeper:lock";
const BATCH_SIZE = 200;
const STAR_THRESHOLDS = [10_000, 100_000, 1_000_000];

export interface SweeperState {
  running: boolean;
  lastRunAt: string | null;
  lastProcessed: number;
  lastAwarded: number;
  lastRevoked: number;
  lastError: string | null;
  intervalMs: number;
}

const state: SweeperState = {
  running: false,
  lastRunAt: null,
  lastProcessed: 0,
  lastAwarded: 0,
  lastRevoked: 0,
  lastError: null,
  intervalMs: SWEEP_INTERVAL_MS,
};

export function getSweeperState(): SweeperState {
  return { ...state };
}

/** Builds the candidate list for a sweeper pass — pure, testable. */
export async function buildCandidateBatch(): Promise<string[]> {
  const candidates = new Set<string>();

  // 1) Users near a star threshold (within 5% below to 5% above).
  for (const t of STAR_THRESHOLDS) {
    const docs = await User.find({
      deletedAt: null,
      status: { $in: ["active", "limited"] },
      followersCount: { $gte: Math.floor(t * 0.95), $lt: Math.ceil(t * 1.05) },
    })
      .select("_id")
      .limit(50)
      .lean();
    for (const d of docs) candidates.add(String(d._id));
  }

  // 2) Creators who posted in the last 24h (view counts moving).
  const since = new Date(Date.now() - 24 * 3600 * 1000);
  const recentAuthorIds = await Post.distinct("author", { createdAt: { $gte: since }, status: "published" }).limit(80);
  for (const id of recentAuthorIds) candidates.add(String(id));

  // 3) A rotating slice of all active creators, so nobody is starved.
  //    Offset by the current hour so the slice advances over time.
  const hourBucket = Math.floor(Date.now() / 3600_000);
  const slice = await User.find({
    deletedAt: null,
    status: { $in: ["active", "limited"] },
    isCreator: true,
  })
    .select("_id")
    .skip((hourBucket % 20) * 50)
    .limit(50)
    .lean();
  for (const d of slice) candidates.add(String(d._id));

  return Array.from(candidates).slice(0, BATCH_SIZE);
}

/** One sweeper pass — safe to run concurrently across instances via the lock. */
export async function runAchievementSweep(opts: { lock?: boolean } = {}): Promise<{
  processed: number;
  awarded: number;
  revoked: number;
  errors: number;
}> {
  const useLock = opts.lock ?? true;
  const instanceId = `${process.pid}-${Math.random().toString(36).slice(2, 8)}`;

  if (useLock) {
    const claimed = await redis.setnx(SWEEPER_LOCK_KEY, instanceId);
    if (claimed !== 1) {
      // Another instance owns this tick — skip, report empty.
      return { processed: 0, awarded: 0, revoked: 0, errors: 0 };
    }
    await redis.expire(SWEEPER_LOCK_KEY, Math.ceil(SWEEP_INTERVAL_MS / 1000) * 2 + 5);
  }

  try {
    const userIds = await buildCandidateBatch();
    const summary = await reconcileBatch(userIds);
    state.lastRunAt = new Date().toISOString();
    state.lastProcessed = summary.processed;
    state.lastAwarded = summary.awarded;
    state.lastRevoked = summary.revoked;
    state.lastError = null;
    return summary;
  } catch (err) {
    state.lastError = err instanceof Error ? err.message : String(err);
    console.error("[achievementSweeper] pass failed:", err);
    return { processed: 0, awarded: 0, revoked: 0, errors: 1 };
  } finally {
    if (useLock) {
      await redis.del(SWEEPER_LOCK_KEY).catch(() => {});
    }
  }
}

let sweeperTimer: ReturnType<typeof setInterval> | null = null;

/** Starts the periodic sweeper (no-op when already running). Call from server.ts. */
export function startAchievementSweeper(): void {
  if (sweeperTimer) return;
  state.running = true;
  console.log(`[achievementSweeper] started — interval ${SWEEP_INTERVAL_MS / 1000}s, batch ≤${BATCH_SIZE} users`);
  // First pass shortly after boot.
  setTimeout(() => void runAchievementSweep(), 8_000).unref?.();
  sweeperTimer = setInterval(() => void runAchievementSweep(), SWEEP_INTERVAL_MS);
  sweeperTimer.unref?.();
}

export function stopAchievementSweeper(): void {
  if (sweeperTimer) {
    clearInterval(sweeperTimer);
    sweeperTimer = null;
  }
  state.running = false;
}
