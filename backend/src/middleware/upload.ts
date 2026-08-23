import fs from "fs";
import path from "path";
import crypto from "crypto";
import multer from "multer";
import { Request } from "express";

const UPLOAD_ROOT = path.join(__dirname, "..", "..", "uploads");
const SUBDIRS = ["photos", "videos", "reels", "avatars", "stories"] as const;
export type UploadKind = (typeof SUBDIRS)[number];

for (const dir of SUBDIRS) {
  const full = path.join(UPLOAD_ROOT, dir);
  if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
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

function storageFor(kind: UploadKind) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, destinationFor(kind)),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || "";
      const unique = crypto.randomBytes(16).toString("hex");
      cb(null, `${Date.now()}-${unique}${ext.toLowerCase()}`);
    },
  });
}

function fileFilterFor(kind: UploadKind) {
  return (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (kind === "avatars" || kind === "photos") {
      if (!IMAGE_TYPES.has(file.mimetype)) return cb(new Error("Only JPEG, PNG, WEBP or GIF images are allowed"));
    } else if (kind === "videos" || kind === "reels") {
      if (!IMAGE_TYPES.has(file.mimetype) && !VIDEO_TYPES.has(file.mimetype)) {
        return cb(new Error("Only MP4, WEBM or MOV videos (or an image thumbnail) are allowed"));
      }
    } else if (kind === "stories") {
      if (!IMAGE_TYPES.has(file.mimetype) && !VIDEO_TYPES.has(file.mimetype)) {
        return cb(new Error("Stories must be an image or a short video"));
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

export { UPLOAD_ROOT, maxBytesFor };
