import { Router, Response } from "express";
import { User } from "../../../models/User";
import { optionalAuth } from "../../../middleware/optionalAuth";
import { AuthenticatedRequest } from "../../../middleware/rbac";
import { uploaderFor, UploadKind, moderationActive } from "../../../middleware/upload";
import { processAndStoreMedia } from "../../../services/media/mediaService";
import { assessAvatar } from "../../../services/moderation/contentModerationService";
import { Media } from "../../../models/Media";

const router = Router();

const VALID_KINDS = new Set<UploadKind>(["photos", "videos", "reels", "avatars", "stories"]);

// POST /api/v1/uploads/:kind — upload a single file (photos | videos | reels | avatars | stories)
// Avatars are allowed without authentication for registration onboarding; all other kinds require auth.
//
// CONTENT SAFETY: uploaded media is stored QUARANTINED (private bucket /
// non-public directory) with moderationStatus "pending" and a checked
// delivery URL. Avatars additionally run an immediate synchronous image
// check — a rejected avatar is never applied to the user's profile.
router.post("/:kind", optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  const kind = req.params.kind as UploadKind;
  if (!VALID_KINDS.has(kind)) {
    return res.status(400).json({ error: `Invalid upload kind. Must be one of: ${[...VALID_KINDS].join(", ")}` });
  }

  if (kind !== "avatars" && !req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  // Anonymous avatar uploads (registration onboarding) skip avatar
  // application anyway; moderation of stored bytes still applies below when
  // a user later claims them via profile update.

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

      // Avatar application is gated on the synchronous image check when the
      // moderation pipeline is active. Rejected avatars return 422 and are
      // never attached to the profile; uncertain ones stay quarantined for
      // staff review (the user keeps their previous avatar).
      let avatarModeration: { status: string; userMessage?: string } | undefined;
      if (kind === "avatars" && req.user?.userId && moderationActive()) {
        const mediaDoc = await Media.findById(processed.mediaId);
        if (mediaDoc) {
          const result = await assessAvatar(mediaDoc, req.user.userId);
          if (result.decision === "REJECTED") {
            return res.status(422).json({
              error: result.userMessage || "This image could not be used as a profile picture.",
              moderation: { status: "rejected" },
            });
          }
          avatarModeration = {
            status: result.decision === "APPROVED" ? "approved" : "needs_review",
            ...(result.userMessage ? { userMessage: result.userMessage } : {}),
          };
          if (result.decision === "APPROVED") {
            // Only now is the avatar attached to the profile.
            await User.findByIdAndUpdate(req.user.userId, { avatarUrl: processed.url });
          }
        }
      } else if (kind === "avatars" && req.user?.userId) {
        // Moderation disabled: legacy behaviour preserved.
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
        moderation: avatarModeration ?? { status: processed.moderationStatus },
      });
    } catch (error: any) {
      const message = String(error?.message || "Failed to store upload");
      if (/does not match|Unrecognized|rejected/i.test(message)) {
        return res.status(400).json({ error: message });
      }
      console.error("[Upload] Error in processAndStoreMedia:", message);
      return res.status(500).json({ error: "Failed to store upload" });
    }
  });
});

export default router;
