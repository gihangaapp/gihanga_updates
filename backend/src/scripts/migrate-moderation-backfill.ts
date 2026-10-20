/**
 * Moderation backfill migration — GRANDFATHERS existing content safely.
 *
 * Usage:
 *   npm run migrate:moderation            # Phase 1: grandfather (default, safe)
 *   npm run migrate:moderation -- --rescan   # Phase 2: re-scan legacy media in
 *                                            # controlled batches (flag-only —
 *                                            # flagged content goes to the staff
 *                                            # review queue but STAYS published
 *                                            # until a human decides).
 *
 * WHY GRANDFATHER FIRST: the moderation pipeline only gates NEW submissions.
 * Existing published posts/stories keep working exactly as before (read paths
 * include a legacy fallback), so nothing is hidden by deploying the system.
 * This script then EXPLICITLY marks legacy content as approved so the data
 * model is consistent, and — optionally — re-scans it in batches.
 *
 * The rescan phase is REVERSIBLE: --hide-flagged is intentionally NOT
 * provided as a flag here; if staff want flagged legacy content hidden, they
 * action it through the review queue one by one (auditable decisions).
 *
 * Run: npm run migrate:moderation
 */
import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "../config/db";
import { Post } from "../models/Post";
import { Story } from "../models/Story";
import { Comment } from "../models/Comment";
import { Media } from "../models/Media";
import { ModerationRecord } from "../models/ModerationRecord";
import { enqueueModerationJob } from "../services/moderation/moderationQueue";
import { registerModerationJobHandler, assessPost } from "../services/moderation/contentModerationService";
import { startModerationQueue } from "../services/moderation/moderationQueue";

const BATCH_SIZE = 100;

async function grandfatherLegacy() {
  console.log("[Backfill] Phase 1 — grandfathering existing published content…");

  // Posts: published without a moderation sub-doc -> approved (grandfathered).
  const posts = await Post.countDocuments({
    status: "published",
    moderation: { $exists: false },
  });
  await Post.updateMany(
    { status: "published", moderation: { $exists: false } },
    {
      $set: {
        moderation: {
          status: "approved",
          updatedAt: new Date(),
          userMessage: undefined,
        },
      },
    },
  );
  console.log(`[Backfill] Grandfathered ${posts} published post(s).`);

  // Stories: same treatment (active or not — historical consistency).
  const stories = await Story.countDocuments({ moderation: { $exists: false } });
  await Story.updateMany(
    { moderation: { $exists: false } },
    { $set: { moderation: { status: "approved", updatedAt: new Date() } } },
  );
  console.log(`[Backfill] Grandfathered ${stories} story(ies).`);

  // Comments: visible comments are grandfathered via hidden:false already;
  // stamp the moderation sub-doc for consistency.
  const comments = await Comment.countDocuments({ moderation: { $exists: false }, hidden: false });
  await Comment.updateMany(
    { moderation: { $exists: false }, hidden: false },
    { $set: { moderation: { status: "approved", updatedAt: new Date() } } },
  );
  console.log(`[Backfill] Grandfathered ${comments} visible comment(s).`);

  // Media: mark legacyPublic so the checked delivery route keeps serving it
  // under its ORIGINAL public URL (legacy assets keep working untouched).
  const media = await Media.countDocuments({ legacyPublic: { $ne: true }, moderationStatus: { $exists: true } });
  await Media.updateMany(
    { legacyPublic: { $ne: true } },
    { $set: { legacyPublic: true, moderationStatus: "approved" } },
  );
  console.log(`[Backfill] Marked ${media} legacy media asset(s) as publicly deliverable.`);
}

async function rescanLegacyMedia() {
  console.log("[Backfill] Phase 2 — controlled re-scan of legacy media (flag-only, nothing is hidden)…");
  registerModerationJobHandler();
  startModerationQueue();

  // Enqueue rescan jobs for published posts with media, in batches. The queue
  // caps concurrency and retries; flagged results land in the staff review
  // queue WITHOUT changing publication state (the job handler in rescan mode
  // is invoked with the legacy flag — see below).
  const cursor = Post.find({
    status: "published",
    kind: { $in: ["photo", "video", "reel"] },
    mediaUrl: { $exists: true, $ne: "" },
  })
    .select("_id author kind body mediaUrl mediaKey media")
    .batchSize(BATCH_SIZE)
    .cursor();

  let enqueued = 0;
  let post: any;
  while ((post = await cursor.next())) {
    // Backfill jobs run the normal checks but are FLAG-ONLY: the queue
    // handler persists a review record without changing publication state.
    const job = await enqueueModerationJob({
      jobKey: `backfill:post:${String(post._id)}`,
      kind: "backfill",
      contentType: "post",
      contentId: String(post._id),
    });
    if (job.ok && !job.duplicate) enqueued += 1;
  }
  console.log(
    `[Backfill] Enqueued ${enqueued} re-scan job(s). NOTE: flagged legacy content stays published until staff action — review it in the moderation dashboard.`,
  );
  console.log("[Backfill] The queue runs inside this process; it will drain and this script stays alive until done.");
  console.log("[Backfill] Press Ctrl+C once the moderation dashboard shows the queue drained.");

  // Keep the process alive while the queue drains.
  await new Promise(() => undefined);
}

async function main() {
  await connectDB();
  const rescan = process.argv.includes("--rescan");
  await grandfatherLegacy();
  if (rescan) {
    await rescanLegacyMedia();
  } else {
    console.log("[Backfill] Done. To optionally re-scan legacy media, run: npm run migrate:moderation -- --rescan");
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("[Backfill] FAILED:", err);
  process.exit(1);
});
