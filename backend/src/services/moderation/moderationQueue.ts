/**
 * Moderation job queue — an in-process, BOUNDED async runner that mirrors
 * the platform's existing sweeper patterns (liveSweeper / achievementSweeper)
 * so it deploys with zero new infrastructure.
 *
 * GUARANTEES
 *  - Idempotency: a jobKey maps to exactly one durable ModerationJob row
 *    (unique index) — duplicate submissions collapse into a no-op.
 *  - Bounded concurrency: at most config.queueConcurrency jobs run at once.
 *  - Bounded depth: when queued+processing exceeds queueMaxDepth, new
 *    submissions are refused (the content stays "processing" and a retry
 *    endpoint exists — we never silently drop or approve).
 *  - Bounded retries: attempts <= maxAttempts with exponential backoff; a
 *    job that exhausts retries parks itself in "failed" and the linked
 *    content is marked moderation.status="failed" (fail-closed).
 *  - Crash recovery: queued/processing jobs whose nextRunAt has passed are
 *    re-claimed on startup (the in-memory "processing" flag is advisory
 *    only; the DB row is the source of truth).
 *
 * DESIGN NOTE: this is intentionally NOT a separate worker process — the
 * existing backend has no queue infrastructure (no BullMQ/Redis-as-broker),
 * and adding one would change the deployment story. The queue runs inside
 * the API process with strict caps; the docs explain how to externalize it
 * later if volume grows.
 */

import { ModerationJob, IModerationJob } from "../../models/ModerationJob";
import { getModerationConfig } from "../../lib/moderation/config";

export type JobHandler = (job: IModerationJob) => Promise<void>;

interface QueueStats {
  enqueued: number;
  completed: number;
  failed: number;
  duplicatesSuppressed: number;
  rejectedFull: number;
  currentlyRunning: number;
}

const stats: QueueStats = {
  enqueued: 0,
  completed: 0,
  failed: 0,
  duplicatesSuppressed: 0,
  rejectedFull: 0,
  currentlyRunning: 0,
};

let handler: JobHandler | null = null;
let timer: NodeJS.Timeout | null = null;
let started = false;

export function registerJobHandler(fn: JobHandler) {
  handler = fn;
}

export function startModerationQueue() {
  if (started) return;
  started = true;
  const tick = async () => {
    try {
      await pump();
    } catch (err) {
      console.error("[ModerationQueue] pump error:", err instanceof Error ? err.message : err);
    }
  };
  // 2s cadence keeps video turnaround snappy without busy-looping.
  timer = setInterval(tick, 2000);
  timer.unref?.();
  // Kick immediately so startup recovery happens right away.
  void tick();
}

export function stopModerationQueue() {
  if (timer) clearInterval(timer);
  timer = null;
  started = false;
}

async function pump() {
  if (!handler) return;
  const config = getModerationConfig();

  // In-flight budget.
  let slots = config.queueConcurrency - stats.currentlyRunning;
  if (slots <= 0) return;

  // Depth budget (queue must stay bounded).
  const outstanding = await ModerationJob.countDocuments({ status: { $in: ["queued", "processing"] } });
  if (outstanding >= config.queueMaxDepth + stats.currentlyRunning) return;

  // Claim due jobs one at a time — the atomic findOneAndUpdate guarantees a
  // job is claimed exactly once per run even across multiple pumps.
  while (slots > 0) {
    const claimed = await ModerationJob.findOneAndUpdate(
      { status: "queued", nextRunAt: { $lte: new Date() } },
      { $set: { status: "processing" }, $inc: { attempts: 1 } },
      { sort: { nextRunAt: 1 }, new: true },
    );
    if (!claimed) break;

    slots -= 1;
    stats.currentlyRunning += 1;
    void runJob(claimed).finally(() => {
      stats.currentlyRunning -= 1;
    });
  }
}

async function runJob(job: IModerationJob) {
  if (!handler) {
    // No handler registered (e.g. in unit tests) — park the job back.
    await ModerationJob.updateOne({ _id: job._id }, { $set: { status: "queued" }, $inc: { attempts: -1 } });
    return;
  }
  const config = getModerationConfig();
  try {
    await handler(job);
    stats.completed += 1;
  } catch (err: any) {
    const message = String(err?.message || "processing error").slice(0, 300);
    if (job.attempts >= job.maxAttempts) {
      // Exhausted: park as failed. The handler is responsible for marking the
      // linked content moderation.status="failed" so nothing publishes.
      await ModerationJob.updateOne(
        { _id: job._id },
        { $set: { status: "failed", lastError: message } },
      );
      stats.failed += 1;
    } else {
      // Exponential backoff: 2^attempts seconds, capped.
      const delayMs = Math.min(1000 * Math.pow(2, job.attempts), 60_000);
      await ModerationJob.updateOne(
        { _id: job._id },
        {
          $set: { status: "queued", lastError: message, nextRunAt: new Date(Date.now() + delayMs) },
        },
      );
    }
  }
}

export interface EnqueueInput {
  jobKey: string;
  kind: IModerationJob["kind"];
  contentType: IModerationJob["contentType"];
  contentId: string;
  mediaId?: string;
}

export type EnqueueResult =
  | { ok: true; job: IModerationJob; duplicate: boolean }
  | { ok: false; reason: "queue-full" };

export async function enqueueModerationJob(input: EnqueueInput): Promise<EnqueueResult> {
  const config = getModerationConfig();

  // Depth guard BEFORE the insert (the unique index below is the hard
  // idempotency backstop; this check is backpressure, best-effort).
  const outstanding = await ModerationJob.countDocuments({ status: { $in: ["queued", "processing"] } });
  if (outstanding >= config.queueMaxDepth) {
    stats.rejectedFull += 1;
    return { ok: false, reason: "queue-full" };
  }

  // Idempotent insert: duplicate jobKey -> return the existing job untouched.
  const existing = await ModerationJob.findOne({ jobKey: input.jobKey });
  if (existing && (existing.status === "queued" || existing.status === "processing" || existing.status === "done")) {
    stats.duplicatesSuppressed += 1;
    return { ok: true, job: existing, duplicate: true };
  }
  if (existing && existing.status === "failed") {
    // A previously failed job for the same key may be re-triggered (manual
    // retry): reset it with a fresh attempt budget.
    existing.attempts = 0;
    existing.status = "queued";
    existing.nextRunAt = new Date();
    existing.lastError = undefined;
    await existing.save();
    stats.enqueued += 1;
    return { ok: true, job: existing, duplicate: false };
  }

  const job = await ModerationJob.create({
    jobKey: input.jobKey,
    kind: input.kind,
    contentType: input.contentType,
    contentId: input.contentId,
    mediaId: input.mediaId,
    status: "queued",
    attempts: 0,
    maxAttempts: config.maxRetries + 1,
    nextRunAt: new Date(),
  });
  stats.enqueued += 1;
  return { ok: true, job, duplicate: false };
}

/** Requeues a failed job for manual retry (user pressed "try again"). */
export async function retryFailedJob(jobKey: string): Promise<boolean> {
  const job = await ModerationJob.findOne({ jobKey });
  if (!job || job.status !== "failed") return false;
  job.attempts = 0;
  job.status = "queued";
  job.nextRunAt = new Date();
  job.lastError = undefined;
  await job.save();
  return true;
}

/** Marks jobs cancelled when their content is deleted. */
export async function cancelJobsForContent(contentType: string, contentId: string) {
  await ModerationJob.updateMany(
    { contentType, contentId, status: { $in: ["queued", "processing"] } },
    { $set: { status: "cancelled" } },
  );
}

export function queueStats() {
  return { ...stats, running: stats.currentlyRunning };
}

/**
 * Startup recovery: re-queue jobs stuck in "processing" (crash residue).
 * Called once when the queue starts.
 */
export async function recoverStuckJobs() {
  const result = await ModerationJob.updateMany(
    { status: "processing" },
    { $set: { status: "queued", nextRunAt: new Date() } },
  );
  if (result.modifiedCount > 0) {
    console.log(`[ModerationQueue] recovered ${result.modifiedCount} stuck job(s) after restart`);
  }
  return result.modifiedCount;
}
