import { Router, Response } from "express";
import { authenticateConsumer, AuthenticatedRequest } from "../../../middleware/rbac";
import { uploaderFor, UploadKind } from "../../../middleware/upload";
import { processAndStoreMedia } from "../../../services/media/mediaService";
import { Media } from "../../../models/Media";

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
      return res.status(500).json({ error: "Failed to process media", details: error.message });
    }
  });
});

// GET /api/v1/media/:id — Query media metadata and responsive variants
router.get("/:id", async (req, res: Response) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ error: "Media not found" });
    return res.json({ media });
  } catch {
    return res.status(404).json({ error: "Media not found" });
  }
});

export default router;
