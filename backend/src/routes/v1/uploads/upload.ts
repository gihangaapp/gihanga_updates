import { Router, Response } from "express";
import { User } from "../../../models/User";
import { optionalAuth } from "../../../middleware/optionalAuth";
import { AuthenticatedRequest } from "../../../middleware/rbac";
import { uploaderFor, UploadKind } from "../../../middleware/upload";
import { processAndStoreMedia } from "../../../services/media/mediaService";

const router = Router();

const VALID_KINDS = new Set<UploadKind>(["photos", "videos", "reels", "avatars", "stories"]);

// POST /api/v1/uploads/:kind — upload a single file (photos | videos | reels | avatars | stories)
// Avatars are allowed without authentication for registration onboarding; all other kinds require auth.
router.post("/:kind", optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  const kind = req.params.kind as UploadKind;
  if (!VALID_KINDS.has(kind)) {
    return res.status(400).json({ error: `Invalid upload kind. Must be one of: ${[...VALID_KINDS].join(", ")}` });
  }

  if (kind !== "avatars" && !req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const uploader = uploaderFor(kind).single("file");

  uploader(req as any, res as any, async (err: any) => {
    if (err) {
      return res.status(400).json({ error: err.message || "Upload failed" });
    }

    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }

    try {
      const processed = await processAndStoreMedia({
        ownerId: req.user?.userId,
        fileBuffer: file.buffer,
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        sizeBytes: file.size,
        kind,
      });

      // If uploading an avatar, automatically update the user's profile avatarUrl in MongoDB
      if (kind === "avatars" && req.user?.userId) {
        await User.findByIdAndUpdate(req.user.userId, { avatarUrl: processed.url });
      }

      return res.status(201).json({
        url: processed.url,
        key: processed.mediaId,
        publicId: processed.mediaId,
        kind,
        mediaId: processed.mediaId,
        thumbnailUrl: processed.thumbnailUrl,
        blurDataUrl: processed.blurDataUrl,
        aspectRatio: processed.aspectRatio,
        orientation: processed.orientation,
        width: processed.width,
        height: processed.height,
        variants: processed.variants,
      });
    } catch (error: any) {
      console.error("[Upload] Error in processAndStoreMedia:", error);
      return res.status(500).json({ error: "Failed to store upload", details: error.message });
    }
  });
});

export default router;
