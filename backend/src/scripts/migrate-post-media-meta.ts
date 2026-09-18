/**
 * B1 migration — backfill media geometry (width/height/aspectRatio) onto
 * existing posts so the home feed can size them without cropping and
 * without layout shift.
 *
 * Sources, in order:
 *   1. The `Media` collection (populated at upload time with real
 *      width/height) — matched by post.mediaKey, or by post.mediaUrl.
 *   2. Cloudinary URL inspection for legacy cloud-hosted media (the
 *      upload transformation embeds w_<W>,h_<H> in the URL path).
 *
 * Anything still unresolved is left untouched: the frontend has a lazy
 * fallback that measures the image on load, so old posts keep working —
 * they just don't get the zero-shift reservation until re-uploaded.
 *
 * Usage:  npm run migrate:post-media   (from backend/)
 * Safe to re-run — idempotent, only fills missing values.
 */
import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "../config/db";
import { Post } from "../models/Post";
import { Media } from "../models/Media";

function ratioFromCloudinaryUrl(url: string): { width: number; height: number } | null {
  // Cloudinary delivery URLs embed the asset dimensions in the path segment
  // after /upload/ when transformations apply, e.g. .../upload/w_800,h_600,c_limit/next.jpg
  const match = url.match(/\/upload\/(?:[^/]*w_(\d+)[^/]*,[^/]*h_(\d+)[^/]*|[^/]*h_(\d+)[^/]*,[^/]*w_(\d+)[^/]*)\//);
  if (match) {
    const width = Number(match[1] ?? match[4]);
    const height = Number(match[2] ?? match[3]);
    if (width > 0 && height > 0) return { width, height };
  }
  return null;
}

async function main() {
  await connectDB();

  const posts = await Post.find({
    kind: { $in: ["photo", "video", "reel"] },
    $or: [{ aspectRatio: { $exists: false } }, { aspectRatio: null }],
  }).limit(0);

  console.log(`[migrate-post-media] ${posts.length} posts to backfill…`);

  let fromMedia = 0;
  let fromUrl = 0;
  let skipped = 0;

  for (const post of posts) {
    const urls = String(post.mediaUrl ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (urls.length === 0) {
      skipped++;
      continue;
    }

    const perItem: { url: string; width?: number; height?: number; aspectRatio?: number; kind?: "photo" | "video" }[] = [];

    for (const url of urls) {
      let width: number | undefined;
      let height: number | undefined;

      const mediaDoc = post.mediaKey
        ? await Media.findOne({ storageKey: post.mediaKey }).catch(() => null)
        : null;
      if (mediaDoc && mediaDoc.originalWidth > 0 && mediaDoc.originalHeight > 0) {
        width = mediaDoc.originalWidth;
        height = mediaDoc.originalHeight;
        fromMedia++;
      } else {
        const fromUrlDims = ratioFromCloudinaryUrl(url);
        if (fromUrlDims) {
          width = fromUrlDims.width;
          height = fromUrlDims.height;
          fromUrl++;
        }
      }

      perItem.push({
        url,
        width,
        height,
        aspectRatio: width && height ? width / height : undefined,
        kind: post.kind === "video" || post.kind === "reel" ? "video" : "photo",
      });
    }

    const first = perItem[0];
    if (first?.aspectRatio) {
      post.mediaWidth = first.width;
      post.mediaHeight = first.height;
      post.aspectRatio = first.aspectRatio;
      post.media = perItem;
      await post.save().catch((err) => console.error(`[migrate-post-media] save failed for ${post._id}:`, err.message));
    } else {
      skipped++;
    }
  }

  console.log(
    `[migrate-post-media] done — from Media collection: ${fromMedia}, from Cloudinary URL: ${fromUrl}, unresolved (frontend lazy-fallback): ${skipped}`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("[migrate-post-media] fatal:", err);
  process.exit(1);
});
