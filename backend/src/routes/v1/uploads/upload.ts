import { Router, Response } from "express";
import { authenticateConsumer, AuthenticatedRequest } from "../../../middleware/rbac";
import { uploaderFor, publicUrlFor, UploadKind } from "../../../middleware/upload";
import { isCloudinaryConfigured, uploadBufferToCloudinary } from "../../../lib/cloudinary";

const router = Router();

const VALID_KINDS = new Set<UploadKind>(["photos", "videos", "reels", "avatars", "stories"]);

// POST /api/v1/uploads/:kind — upload a single file (photos | videos | reels | avatars | stories)
router.post("/:kind", authenticateConsumer, async (req: AuthenticatedRequest, res: Response) => {
  const kind = req.params.kind as UploadKind;
  if (!VALID_KINDS.has(kind)) {
    return res.status(400).json({ error: `Invalid upload kind. Must be one of: ${[...VALID_KINDS].join(", ")}` });
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
      if (isCloudinaryConfigured) {
        const result = await uploadBufferToCloudinary(file.buffer, kind, file.mimetype);
        return res.status(201).json({
          url: result.secure_url,
          publicId: result.public_id,
          kind,
        });
      }

      // Local disk fallback (dev only — Render's filesystem is ephemeral)
      return res.status(201).json({
        url: publicUrlFor(kind, file.filename),
        kind,
      });
    } catch (error: any) {
      return res.status(500).json({ error: "Failed to store upload", details: error.message });
    }
  });
});

export default router;
