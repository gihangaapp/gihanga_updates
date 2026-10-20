import fs from "fs";
import path from "path";
import { Router, Response } from "express";
import { authenticateConsumer, AuthenticatedRequest } from "../../../middleware/rbac";
import { optionalAuth } from "../../../middleware/optionalAuth";
import { uploaderFor, UploadKind } from "../../../middleware/upload";
import { processAndStoreMedia } from "../../../services/media/mediaService";
import { Media } from "../../../models/Media";
import { quarantineRoot, UPLOAD_ROOT, moderationActive } from "../../../middleware/upload";
import { isCloudinaryConfigured, signedCloudinaryDeliveryUrl } from "../../../lib/cloudinary";

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

    const approved = media.moderationStatus === "approved" || media.legacyPublic === true;
    const isOwner = Boolean(req.user && media.ownerId && String(media.ownerId) === req.user.userId);
    // Staff reviewers get access through their staff token (optionalAuth only
    // decodes consumer tokens, so staff pass the Bearer token too — verified
    // below via authenticateStaff logic kept inline to avoid double parsing).
    let isReviewer = false;
    const authHeader = req.headers.authorization;
    if (!approved && !isOwner && authHeader?.startsWith("Bearer ")) {
      try {
        // Lazy import to avoid circular deps at module load.
        const { verifyStaffAccessToken } = await import("../../../lib/jwt");
        const decoded = verifyStaffAccessToken(authHeader.split(" ")[1]);
        const { ROLE_PERMISSIONS } = await import("../../../middleware/rbac");
        const perms = ROLE_PERMISSIONS[decoded.role];
        isReviewer = Boolean(perms && perms.has("moderation.assessments.view"));
      } catch {
        isReviewer = false;
      }
    }

    if (!approved && !isOwner && !isReviewer) {
      // 404 (not 403): do not confirm existence of quarantined media.
      return res.status(404).json({ error: "Media not found" });
    }

    // ── Cloudinary-hosted asset ──────────────────────────────────────────────
    if (media.storageKey && media.storageKey.startsWith("gihanga/") && isCloudinaryConfigured) {
      const resourceType = media.type === "video" ? "video" : "image";
      const signed = signedCloudinaryDeliveryUrl(media.storageKey, resourceType as "image" | "video");
      return res.redirect(302, signed);
    }

    // ── Local-disk asset ─────────────────────────────────────────────────────
    if (media.storageKey) {
      const inQuarantine = path.join(quarantineRoot(), media.storageKey);
      const inPublic = path.join(UPLOAD_ROOT, media.storageKey);
      const filePath = fs.existsSync(inQuarantine) ? inQuarantine : fs.existsSync(inPublic) ? inPublic : null;
      if (!filePath) return res.status(404).json({ error: "Media not found" });

      // Path-traversal defense: resolved path must remain inside a root we own.
      const resolved = path.resolve(filePath);
      if (!resolved.startsWith(path.resolve(quarantineRoot())) && !resolved.startsWith(path.resolve(UPLOAD_ROOT))) {
        return res.status(404).json({ error: "Media not found" });
      }

      res.setHeader("Content-Type", media.mimeType || "application/octet-stream");
      res.setHeader("Cache-Control", approved ? "public, max-age=3600" : "private, no-store");
      if (media.type === "video") {
        res.setHeader("Accept-Ranges", "bytes");
      }
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
