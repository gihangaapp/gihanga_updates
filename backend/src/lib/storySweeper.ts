import { Story } from "../models/Story";
import { Media } from "../models/Media";
import { Types } from "mongoose";
import { deleteCloudinaryAsset, isCloudinaryConfigured } from "./cloudinary";
import { moderationActive } from "../middleware/upload";

/**
 * Story retention sweeper.
 *
 * Stories are 24-hour content. MongoDB's TTL index on Story.expiresAt
 * removes the story DOC, but nothing removed the underlying media: with
 * Cloudinary configured the photo/video stayed in the gihanga/stories
 * folder forever, and the Media metadata doc stayed "pending" in MongoDB.
 *
 * Every 15 minutes this sweeper:
 *   1. finds stories whose expiresAt has passed (TTL deletion can lag up to
 *      a minute — we still win the race in practice, and every action is
 *      idempotent), destroys their Cloudinary assets, deletes their Media
 *      docs, then deletes the story doc;
 *   2. catches ORPHANED story media — Media docs with context "story" that
 *      are older than 26 hours (their story doc was already removed by the
 *      TTL index before we could clean up) — and destroys those too.
 *
 * Safe to run on every instance: every step is idempotent (destroy returns
 * "not found", deleteOne on a missing doc is a no-op).
 */

const SWEEP_INTERVAL_MS = 15 * 60 * 1000;
const ORPHAN_GRACE_MS = 26 * 60 * 60 * 1000; // 24h life + 2h grace

export async function sweepExpiredStories(): Promise<{ stories: number; media: number }> {
  const now = new Date();
  let storiesDeleted = 0;
  let mediaDeleted = 0;

  // 1) Expired story docs (the TTL index may not have fired yet).
  const expired = await Story.find({ expiresAt: { $lte: now } })
    .select("mediaUrl mediaKey mediaType")
    .lean();

  for (const story of expired) {
    mediaDeleted += await purgeStoryMedia(
      story.mediaKey ? String(story.mediaKey) : undefined,
      story.mediaUrl,
      story.mediaType === "video" ? "video" : "image",
    );
    await Story.deleteOne({ _id: story._id });
    storiesDeleted += 1;
  }

  // 2) Orphaned story media whose Story doc is already gone (TTL fired
  //    first). Only meaningful while the moderation pipeline is active —
  //    that's when Media docs are created for story uploads.
  if (moderationActive()) {
    const cutoff = new Date(now.getTime() - ORPHAN_GRACE_MS);
    const orphans = await Media.find({
      context: "story",
      createdAt: { $lte: cutoff },
    })
      .select("storageKey type")
      .lean();

    for (const media of orphans) {
      if (media.storageKey && media.storageKey.startsWith("gihanga/") && isCloudinaryConfigured) {
        await deleteCloudinaryAsset(media.storageKey, media.type === "video" ? "video" : "image");
      }
      await Media.deleteOne({ _id: media._id });
      mediaDeleted += 1;
    }
  }

  if (storiesDeleted > 0 || mediaDeleted > 0) {
    console.log(
      `[StorySweeper] Removed ${storiesDeleted} expired story doc(s) and ${mediaDeleted} media asset(s).`,
    );
  }
  return { stories: storiesDeleted, media: mediaDeleted };
}

/** Destroys the Cloudinary asset (if any) and the Media doc(s) for a story. */
export async function purgeStoryMedia(
  mediaKey: string | undefined,
  mediaUrl: string | undefined,
  resourceType: "image" | "video",
): Promise<number> {
  let deleted = 0;

  // Resolve the linked Media doc(s) — by id (mediaKey) or URL.
  const conditions: any[] = [];
  if (mediaKey && Types.ObjectId.isValid(mediaKey)) conditions.push({ _id: mediaKey });
  if (mediaUrl) conditions.push({ cdnUrl: mediaUrl });
  const docs =
    conditions.length > 0
      ? await Media.find({ $or: conditions }).select("storageKey type").lean()
      : [];

  for (const doc of docs) {
    if (doc.storageKey && doc.storageKey.startsWith("gihanga/") && isCloudinaryConfigured) {
      await deleteCloudinaryAsset(doc.storageKey, doc.type === "video" ? "video" : "image");
    }
    await Media.deleteOne({ _id: doc._id });
    deleted += 1;
  }

  // Cloudinary-only key with no Media doc (pipeline disabled at upload time).
  if (docs.length === 0 && mediaKey && mediaKey.startsWith("gihanga/") && isCloudinaryConfigured) {
    await deleteCloudinaryAsset(mediaKey, resourceType);
  }

  return deleted;
}

export function startStorySweeper(): void {
  // Run once shortly after boot, then on the interval.
  setTimeout(() => {
    sweepExpiredStories().catch((err) =>
      console.error("[StorySweeper] initial sweep failed:", err instanceof Error ? err.message : err),
    );
  }, 30_000);

  setInterval(() => {
    sweepExpiredStories().catch((err) =>
      console.error("[StorySweeper] sweep failed:", err instanceof Error ? err.message : err),
    );
  }, SWEEP_INTERVAL_MS);

  console.log("[StorySweeper] Started — expired stories and their media are purged every 15 minutes.");
}
