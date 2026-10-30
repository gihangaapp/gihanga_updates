import fs from "fs";
import path from "path";
import { Router, Response } from "express";
import { authenticateConsumer, AuthenticatedRequest } from "../../../middleware/rbac";
import { optionalAuth } from "../../../middleware/optionalAuth";
import { uploaderFor, UploadKind } from "../../../middleware/upload";
import { processAndStoreMedia } from "../../../services/media/mediaService";
import { Media } from "../../../models/Media";
import { Story } from "../../../models/Story";
import { Advertisement } from "../../../models/Advertisement";
import { quarantineRoot, UPLOAD_ROOT, moderationActive } from "../../../middleware/upload";
import { isCloudinaryConfigured, signedCloudinaryDeliveryUrl, signedCloudinaryVideoThumbnailUrl } from "../../../lib/cloudinary";

const router = Router();

const VALID_KINDS = new Set<UploadKind>(["photos", "videos", "reels", "avatars", "stories"]);

// POST /api/v1/media/upload — Centralized upload endpoint returning responsive variants & metadata
router.post("/upload", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  const kindParam = (req.query.kind as UploadKind) || "photos";
  const kind = VALID_KINDS.has(kindParam) ? kindParam : "photos";

  const uploader = uploaderFor(kind).single("file");

  uploader(req as any, res as any, async (err: any) => {
    if (err) return res.status(400).json({ error: err.message || "Upload failed" });

    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) return res.status(400).json({ error: "No file provided" });

    try {
      const result = await processAndStoreMedia({
        ownerId: req.user!.userId,
        fileBuffer: file.buffer,
        filePath: file.path,
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        sizeBytes: file.size,
        kind,
      });

      return res.status(201).json(result);
    } catch (error: any) {
      // Upload rejections from content sniffing are client errors.
      const message = String(error?.message || "Failed to process media");
      if (/does not match|Unrecognized|rejected/i.test(message)) {
        return res.status(400).json({ error: message });
      }
      console.error("[Media] upload processing failed:", message);
      return res.status(500).json({ error: "Failed to process media" });
    } finally {
      if (isCloudinaryConfigured && file.path) {
        await fs.promises.rm(file.path, { force: true }).catch(() => undefined);
      }
    }
  });
});

/**
 * GET /api/v1/media/file/:mediaId — SECURE MEDIA DELIVERY.
 *
 * The ONLY delivery path for media uploaded while the moderation pipeline is
 * active. Access rules (fail-closed):
 *   - moderationStatus "approved"  -> delivered (signed redirect / streamed)
 *   - legacyPublic                 -> delivered (pre-moderation-era asset)
 *   - owner (authenticated)        -> delivered (they uploaded it; needed so
 *                                     authors can preview/edit their own
 *                                     pending or rejected uploads)
 *   - staff w/ assessments.view    -> delivered (reviewers must see evidence)
 *   - anyone else                  -> 404 (existence is not confirmed)
 *
 * Local-disk files are streamed from the QUARANTINE directory which is never
 * express.static-served. Cloudinary assets were uploaded `type:
 * "authenticated"` and are delivered via a short-lived SIGNED redirect.
 */
router.get("/file/:mediaId", optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!moderationActive()) {
      // Pipeline disabled (explicit local-dev opt-out): legacy behaviour —
      // the original public URL was already returned at upload time.
      return res.status(404).json({ error: "Media not found" });
    }

    const media = await Media.findById(req.params.mediaId);
    if (!media) return res.status(404).json({ error: "Media not found" });

    const mediaApproved = media.moderationStatus === "approved" || media.legacyPublic === true;
    // Advertising creative is uploaded into the same quarantine as user media.
    // Once the campaign has passed staff review AND manual payment verification,
    // its referenced creative is approved for public delivery without making
    // unrelated quarantined uploads public.
    const linkedActiveAd = await Advertisement.findOne({
      status: "active",
      paymentStatus: "paid",
      $and: [
        { $or: [{ paymentMethod: { $ne: "manual" } }, { manualPaymentStatus: "verified" }] },
        { $or: [{ endDate: { $gte: new Date() } }, { endDate: { $exists: false } }] },
      ],
      $or: [
        { mediaKey: String(media._id) },
        { mediaUrl: { $regex: `${String(media._id)}(?:\\?.*)?$` } },
        { thumbnailUrl: { $regex: `${String(media._id)}(?:\\?.*)?$` } },
      ],
    }).select("_id").lean();
    const approved = mediaApproved || Boolean(linkedActiveAd);
    const isOwner = Boolean(req.user && media.ownerId && String(media.ownerId) === req.user.userId);
    // Staff reviewers get access through their staff token (optionalAuth only
    // decodes consumer tokens, so staff pass the Bearer token too — verified
    // below via authenticateStaff logic kept inline to avoid double parsing).
    let isReviewer = false;
    const authHeader = req.headers.authorization;
    const staffCredential = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : typeof req.query?.staffToken === "string"
        ? req.query.staffToken
        : typeof req.query?.token === "string" ? req.query.token : undefined;
    if (!approved && !isOwner && staffCredential) {
      try {
        // Lazy import to avoid circular deps at module load. Staff tokens may
        // also arrive in the query string for native media elements, which
        // cannot attach an Authorization header.
        const { verifyStaffAccessToken } = await import("../../../lib/jwt");
        const decoded = verifyStaffAccessToken(staffCredential);
        const { ROLE_PERMISSIONS } = await import("../../../middleware/rbac");
        const perms = ROLE_PERMISSIONS[decoded.role];
        isReviewer = Boolean(perms && perms.has("moderation.assessments.view"));
      } catch {
        isReviewer = false;
      }
    }

    if (!approved && !isOwner && !isReviewer) {
      // Story-referenced media: when the parent STORY itself is approved (or
      // legacy without a moderation block), its media is deliverable. This
      // rescues story rows whose Media doc stayed "pending" because the old
      // cdnUrl-based approval never matched — those stories otherwise showed
      // an empty photo for every viewer except the author.
      const parentStory = await Story.findOne({
        $or: [
          { mediaKey: String(media._id) },
          { mediaUrl: `/api/v1/media/file/${media._id}` },
        ],
      })
        .select("moderation.status")
        .lean();

      if (!parentStory) {
        // 404 (not 403): do not confirm existence of quarantined media.
        return res.status(404).json({ error: "Media not found" });
      }
      const storyStatus = (parentStory as any).moderation?.status ?? "approved";
      if (storyStatus !== "approved") {
        return res.status(404).json({ error: "Media not found" });
      }
    }

    // ── Cloudinary-hosted asset ──────────────────────────────────────────────
    if (media.storageKey && media.storageKey.startsWith("gihanga/") && isCloudinaryConfigured) {
      if (media.type === "video" && req.query.variant === "thumbnail") {
        return res.redirect(302, signedCloudinaryVideoThumbnailUrl(media.storageKey));
      }
      const resourceType = media.type === "video" ? "video" : "image";
      const signed = signedCloudinaryDeliveryUrl(media.storageKey, resourceType as "image" | "video");
      return res.redirect(302, signed);
    }

    // ── Local-disk asset ─────────────────────────────────────────────────────
    if (media.storageKey) {
      // New uploads include their kind folder in storageKey. Try the older
      // filename-only layout too so existing local assets remain readable.
      const legacyKind = media.context === "reel" ? "reels"
        : media.context === "story" ? "stories"
          : media.context === "avatar" ? "avatars"
            : media.context === "cover" ? "covers"
              : media.type === "video" ? "videos" : "photos";
      const candidates = [
        path.join(quarantineRoot(), media.storageKey),
        path.join(UPLOAD_ROOT, media.storageKey),
        path.join(quarantineRoot(), legacyKind, media.storageKey),
        path.join(UPLOAD_ROOT, legacyKind, media.storageKey),
      ];
      const filePath = candidates.find((candidate) => fs.existsSync(candidate));
      if (!filePath) return res.status(404).json({ error: "Media not found" });

      // Path-traversal defense: resolved path must remain inside a root we own.
      const resolved = path.resolve(filePath);
      const withinRoot = (root: string) => {
        const relative = path.relative(path.resolve(root), resolved);
        return relative === "" || (relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
      };
      if (!withinRoot(quarantineRoot()) && !withinRoot(UPLOAD_ROOT)) {
        return res.status(404).json({ error: "Media not found" });
      }

      const stat = await fs.promises.stat(resolved);
      const fileSize = stat.size;
      res.setHeader("Content-Type", media.mimeType || "application/octet-stream");
      res.setHeader("Cache-Control", approved ? "public, max-age=3600" : "private, no-store");
      res.setHeader("Accept-Ranges", "bytes");

      // HTML video elements commonly request byte ranges. Honour valid single
      // ranges so local fallback videos can seek and start without downloading
      // the entire file; images and ordinary full-file requests still get 200.
      const rangeHeader = typeof req.headers.range === "string" ? req.headers.range : undefined;
      if (rangeHeader) {
        const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim());
        if (!match || (!match[1] && !match[2])) {
          res.setHeader("Content-Range", `bytes */${fileSize}`);
          return res.status(416).end();
        }
        let start: number;
        let end: number;
        if (!match[1]) {
          const suffixLength = Number(match[2]);
          if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) {
            res.setHeader("Content-Range", `bytes */${fileSize}`);
            return res.status(416).end();
          }
          start = Math.max(0, fileSize - suffixLength);
          end = fileSize - 1;
        } else {
          start = Number(match[1]);
          end = match[2] ? Number(match[2]) : fileSize - 1;
        }
        if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start >= fileSize || end < start) {
          res.setHeader("Content-Range", `bytes */${fileSize}`);
          return res.status(416).end();
        }
        end = Math.min(end, fileSize - 1);
        res.status(206);
        res.setHeader("Content-Range", `bytes ${start}-${end}/${fileSize}`);
        res.setHeader("Content-Length", String(end - start + 1));
        const partial = fs.createReadStream(resolved, { start, end });
        partial.on("error", () => {
          if (!res.headersSent) res.status(404).json({ error: "Media not found" });
          else res.end();
        });
        return partial.pipe(res);
      }

      res.setHeader("Content-Length", String(fileSize));
      const stream = fs.createReadStream(resolved);
      stream.on("error", () => {
        if (!res.headersSent) res.status(404).json({ error: "Media not found" });
        else res.end();
      });
      return stream.pipe(res);
    }

    return res.status(404).json({ error: "Media not found" });
  } catch {
    return res.status(404).json({ error: "Media not found" });
  }
});

/**
 * GET /api/v1/media/:id — media metadata.
 * Metadata for quarantined media is visible ONLY to the owner or staff
 * reviewers; the public sees approved/legacy assets only.
 */
router.get("/:id", optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ error: "Media not found" });

    const approved = media.moderationStatus === "approved" || media.legacyPublic === true;
    const isOwner = Boolean(req.user && media.ownerId && String(media.ownerId) === req.user.userId);
    if (!approved && !isOwner) {
      return res.status(404).json({ error: "Media not found" });
    }

    // Never expose internal storage keys or hashes in the public payload.
    const safe = media.toObject();
    delete safe.storageKey;
    delete safe.contentHash;
    return res.json({ media: safe });
  } catch {
    return res.status(404).json({ error: "Media not found" });
  }
});

export default router;
