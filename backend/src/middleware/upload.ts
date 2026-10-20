import fs from "fs";
import path from "path";
import crypto from "crypto";
import multer from "multer";
import { Request } from "express";

const UPLOAD_ROOT = path.join(__dirname, "..", "..", "uploads");
const SUBDIRS = ["photos", "videos", "reels", "avatars", "stories"] as const;
export type UploadKind = (typeof SUBDIRS)[number];

/**
 * QUARANTINE — new uploads live here while unapproved. This directory is
 * deliberately OUTSIDE the express.static-served UPLOAD_ROOT, so local-disk
 * quarantined media has NO public URL. Delivery happens exclusively through
 * GET /api/v1/media/file/:id, which checks Media.moderationStatus.
 */
const QUARANTINE_ROOT = path.join(__dirname, "..", "..", "uploads-quarantine");

/** Content-safety switch (import cycle avoided by reading env lazily). */
function moderationActive(): boolean {
  const raw = process.env.CONTENT_MODERATION_ENABLED;
  return raw === undefined || raw === "" ? true : ["1", "true", "yes", "on"].includes(raw.trim().toLowerCase());
}

/** Where quarantined files for a kind are stored. */
export function quarantineDirFor(kind: UploadKind): string {
  return path.join(QUARANTINE_ROOT, kind);
}

export function quarantineRoot(): string {
  return QUARANTINE_ROOT;
}

// Cloudinary is checked lazily (via env vars) rather than importing
// ./cloudinary.ts at module load — that file imports this one (for
// UploadKind), so a top-level import here would create a circular require.
function cloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_URL ||
      (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
  );
}

// Local disk is only used as a dev fallback when Cloudinary isn't configured
// (Render's filesystem is ephemeral, so production should always set
// Cloudinary env vars — see lib/cloudinary.ts). Skip creating these
// directories entirely when Cloudinary is configured.
if (!cloudinaryConfigured()) {
  for (const dir of SUBDIRS) {
    const full = path.join(UPLOAD_ROOT, dir);
    if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
  }
  // Quarantine dirs are needed whenever the moderation pipeline is on.
  if (moderationActive()) {
    for (const dir of SUBDIRS) {
      const q = quarantineDirFor(dir);
      if (!fs.existsSync(q)) fs.mkdirSync(q, { recursive: true });
    }
  }
}

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

// Reels are capped at 2 minutes of runtime — enforced client-side before upload (the
// browser reads the video duration) and re-checked here via file size as a rough proxy,
// since verifying exact duration server-side would require an ffmpeg binary that may not
// be available in every deployment target. Regular video posts get a looser size cap.
const MAX_REEL_BYTES = 80 * 1024 * 1024; // ~80MB, generous for a <=2min clip
const MAX_VIDEO_BYTES = 200 * 1024 * 1024;
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

function destinationFor(kind: UploadKind) {
  return path.join(UPLOAD_ROOT, kind);
}

/**
 * Disk storage for the LOCAL fallback. When the moderation pipeline is
 * active, multer buffers to the QUARANTINE directory (never served by
 * express.static); when the pipeline is disabled (explicit local-dev opt-out)
 * the original public-dirs behaviour is preserved.
 */
function storageFor(kind: UploadKind) {
  // When Cloudinary is configured, files are buffered in memory and streamed
  // up to Cloudinary by the upload route (see routes/v1/uploads/upload.ts) —
  // nothing is written to local disk, which is what makes this work on
  // Render's ephemeral filesystem. Otherwise, fall back to disk storage for
  // local development.
  if (cloudinaryConfigured()) {
    return multer.memoryStorage();
  }
  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, moderationActive() ? quarantineDirFor(kind) : destinationFor(kind)),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || "";
      const unique = crypto.randomBytes(16).toString("hex");
      cb(null, `${Date.now()}-${unique}${ext.toLowerCase()}`);
    },
  });
}

/** Extension/MIME consistency check — defends against renamed executables. */
const ALLOWED_EXTENSIONS: Record<string, Set<string>> = {
  image: new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]),
  video: new Set([".mp4", ".webm", ".mov"]),
};

function fileFilterFor(kind: UploadKind) {
  return (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const ext = path.extname(file.originalname || "").toLowerCase();

    if (kind === "avatars" || kind === "photos") {
      if (!IMAGE_TYPES.has(file.mimetype)) return cb(new Error("Only JPEG, PNG, WEBP or GIF images are allowed"));
      if (!ALLOWED_EXTENSIONS.image.has(ext)) return cb(new Error("File extension does not match an allowed image type"));
    } else if (kind === "videos" || kind === "reels") {
      if (!IMAGE_TYPES.has(file.mimetype) && !VIDEO_TYPES.has(file.mimetype)) {
        return cb(new Error("Only MP4, WEBM or MOV videos (or an image thumbnail) are allowed"));
      }
      if (VIDEO_TYPES.has(file.mimetype) && !ALLOWED_EXTENSIONS.video.has(ext)) {
        return cb(new Error("File extension does not match an allowed video type"));
      }
    } else if (kind === "stories") {
      if (!IMAGE_TYPES.has(file.mimetype) && !VIDEO_TYPES.has(file.mimetype)) {
        return cb(new Error("Stories must be an image or a short video"));
      }
      if (VIDEO_TYPES.has(file.mimetype) && !ALLOWED_EXTENSIONS.video.has(ext)) {
        return cb(new Error("File extension does not match an allowed video type"));
      }
      if (IMAGE_TYPES.has(file.mimetype) && !ALLOWED_EXTENSIONS.image.has(ext)) {
        return cb(new Error("File extension does not match an allowed image type"));
      }
    }
    cb(null, true);
  };
}

function maxBytesFor(kind: UploadKind, mimetype: string) {
  if (kind === "reels") return MAX_REEL_BYTES;
  if (kind === "videos" || (kind === "stories" && VIDEO_TYPES.has(mimetype))) return MAX_VIDEO_BYTES;
  return MAX_IMAGE_BYTES;
}

/**
 * Sniffs magic bytes to confirm the browser-declared MIME type. Blocks
 * executable/script payloads disguised with a forged Content-Type.
 * (Polyglot files are a deeper problem — that's what the AI checks and
 * human review path are for; this stops the trivial spoof.)
 */
export function sniffMimeCategory(buffer: Buffer): "image" | "video" | "unknown" {
  if (buffer.length < 12) return "unknown";
  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image";
  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return "image";
  // GIF: GIF8
  if (buffer.subarray(0, 4).toString("ascii") === "GIF8") return "image";
  // WEBP: RIFF....WEBP
  if (buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP") return "image";
  // MP4: ftyp box at offset 4
  if (buffer.subarray(4, 8).toString("ascii") === "ftyp") return "video";
  // WEBM/MKV: 1A 45 DF A3 (EBML)
  if (buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3) return "video";
  // QuickTime: size + 'moov'/'ftyp' variants — accept wide/mdat pattern
  if (buffer.subarray(4, 8).toString("ascii") === "moov" || buffer.subarray(4, 12).toString("ascii") === "widepngnot") return "video";
  return "unknown";
}

/** Builds a single-file multer instance scoped to one media kind/subfolder. */
export function uploaderFor(kind: UploadKind) {
  return multer({
    storage: storageFor(kind),
    fileFilter: fileFilterFor(kind),
    limits: { fileSize: kind === "videos" ? MAX_VIDEO_BYTES : kind === "reels" ? MAX_REEL_BYTES : MAX_IMAGE_BYTES },
  });
}

export function publicUrlFor(kind: UploadKind, filename: string) {
  return `/uploads/${kind}/${filename}`;
}

export { UPLOAD_ROOT, maxBytesFor, cloudinaryConfigured, moderationActive };
