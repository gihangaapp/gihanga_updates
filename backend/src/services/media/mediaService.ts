import crypto from "crypto";
import fs from "fs";
import path from "path";
import { Types } from "mongoose";
import { Media, IMedia, MediaContext, MediaType, MediaOrientation, IMediaVariant } from "../../models/Media";
import { isCloudinaryConfigured, uploadBufferToCloudinary, uploadFileToCloudinary, videoThumbnailFromCloudinary } from "../../lib/cloudinary";
import { publicUrlFor, UploadKind, sniffMimeCategory, moderationActive } from "../../middleware/upload";

export interface ProcessMediaInput {
  ownerId?: string;
  fileBuffer?: Buffer;
  /** Temporary or local-disk path; preferred for large uploads to bound RAM. */
  filePath?: string;
  filename?: string;
  originalname: string;
  mimetype: string;
  sizeBytes: number;
  kind: UploadKind; // "photos" | "videos" | "reels" | "avatars" | "stories" | "covers"
}

export interface ProcessedMediaResult {
  mediaId: string;
  /** Delivery URL. With the moderation pipeline active this is the CHECKED
   *  route /api/v1/media/file/:id — quarantined media has no public URL. */
  url: string;
  thumbnailUrl?: string;
  blurDataUrl: string;
  width: number;
  height: number;
  aspectRatio: number;
  orientation: MediaOrientation;
  variants: IMediaVariant[];
  status: "READY" | "PROCESSING" | "FAILED";
  moderationStatus: "pending" | "approved";
}

/** Determines orientation based on dimensions */
export function getOrientation(width: number, height: number): MediaOrientation {
  const ratio = width / height;
  if (ratio > 1.1) return "landscape";
  if (ratio < 0.9) return "portrait";
  return "square";
}

/** Generates a lightweight CSS SVG blur-up placeholder data URI */
export function generateBlurDataUrl(aspectRatio: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 ${Math.round(
    100 / (aspectRatio || 1)
  )}"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1e1b4b"/><stop offset="50%" stop-color="#31103f"/><stop offset="100%" stop-color="#0f172a"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`;
  const encoded = Buffer.from(svg).toString("base64");
  return `data:image/svg+xml;base64,${encoded}`;
}

/** Builds variant URLs dynamically for responsive delivery */
export function buildVariants(
  baseUrl: string,
  width: number,
  height: number,
  mimetype: string,
  thumbnailUrl?: string
): IMediaVariant[] {
  const isVideo = mimetype.startsWith("video/");

  if (isVideo) {
    return [
      { label: "thumbnail", width: 320, height: Math.round(320 / (width / height || 1)), url: thumbnailUrl || baseUrl, format: "jpeg" },
      { label: "medium", width: 720, height: Math.round(720 / (width / height || 1)), url: baseUrl, format: "mp4" },
      { label: "master", width, height, url: baseUrl, format: "mp4" },
    ];
  }

  // Image variants
  const aspect = width / height || 1.0;
  const sizes = [
    { label: "thumbnail", w: 320 },
    { label: "small", w: 640 },
    { label: "medium", w: 1080 },
    { label: "large", w: 1600 },
    { label: "master", w: width },
  ] as const;

  return sizes
    .filter((s) => s.w <= width || s.label === "thumbnail" || s.label === "master")
    .map((s) => ({
      label: s.label,
      width: Math.min(s.w, width),
      height: Math.round(Math.min(s.w, width) / aspect),
      url: baseUrl,
      format: mimetype.includes("png") ? "png" : "webp",
    }));
}

export async function processAndStoreMedia(input: ProcessMediaInput): Promise<ProcessedMediaResult> {
  const isVideo = input.mimetype.startsWith("video/");
  const type: MediaType = isVideo ? "video" : "image";
  const contextMap: Record<UploadKind, MediaContext> = {
    photos: "post",
    videos: "post",
    reels: "reel",
    stories: "story",
    avatars: "avatar",
    covers: "cover",
  };
  const context = contextMap[input.kind] || "post";
  const quarantine = moderationActive();

  // ── Content-safety: verify actual file bytes, never trust the client ──────
  // MIME claim. A buffer whose magic bytes don't match its declared category
  // is rejected outright BEFORE any storage or provider call.
  if ((input.fileBuffer || input.filePath) && quarantine) {
    let header = input.fileBuffer;
    if (!header && input.filePath) {
      const handle = await fs.promises.open(input.filePath, "r");
      try {
        header = Buffer.alloc(64);
        const { bytesRead } = await handle.read(header, 0, header.length, 0);
        header = header.subarray(0, bytesRead);
      } finally {
        await handle.close();
      }
    }
    const sniffed = header ? sniffMimeCategory(header) : "unknown";
    const declared = isVideo ? "video" : "image";
    if (sniffed !== "unknown" && sniffed !== declared) {
      throw new Error("File content does not match its declared type — upload rejected");
    }
    if (sniffed === "unknown") {
      throw new Error("Unrecognized or unsupported file format — upload rejected");
    }
  }

  // Dynamic aspect ratio calculation based on context defaults or extracted parameters
  let width = 1080;
  let height = 1080;

  if (context === "reel" || context === "story") {
    width = 1080;
    height = 1920; // 9:16 portrait
  } else if (context === "avatar") {
    width = 400;
    height = 400; // 1:1 square
  } else if (context === "cover") {
    width = 1500;
    height = 500; // landscape banner
  } else {
    // Post default
    width = 1080;
    height = 1350; // 4:5 portrait post standard
  }

  const aspectRatio = Math.round((width / height) * 1000) / 1000;
  const orientation = getOrientation(width, height);
  const blurDataUrl = generateBlurDataUrl(aspectRatio);

  // Content hash of the EXACT uploaded bytes — powers duplicate-scan
  // avoidance and evasion auditing (same bytes re-uploaded = same verdict).
  let contentHash: string | undefined;
  if (input.fileBuffer) {
    contentHash = crypto.createHash("sha256").update(input.fileBuffer).digest("hex");
  } else if (input.filePath) {
    const hash = crypto.createHash("sha256");
    for await (const chunk of fs.createReadStream(input.filePath)) hash.update(chunk);
    contentHash = hash.digest("hex");
  }

  let masterUrl = "";
  let storageKey = "";
  let derivedThumbnailUrl = "";

  if (isCloudinaryConfigured && (input.fileBuffer || input.filePath)) {
    const cloudRes = input.filePath
      ? await uploadFileToCloudinary(input.filePath, input.kind, input.mimetype, { authenticated: quarantine })
      : await uploadBufferToCloudinary(input.fileBuffer!, input.kind, input.mimetype, { authenticated: quarantine });
    masterUrl = cloudRes.secure_url;
    storageKey = cloudRes.public_id;
    // For videos, derive a real JPEG frame thumbnail from Cloudinary instead of
    // pointing "thumbnail" at the .mp4 itself (which <img> tags can't render).
    if (isVideo) {
      try {
        derivedThumbnailUrl = videoThumbnailFromCloudinary(cloudRes.public_id, quarantine);
      } catch {
        derivedThumbnailUrl = "";
      }
    }
  } else {
    // Local storage fallback. With the moderation pipeline active, multer has
    // already written the file into the QUARANTINE directory (see
    // middleware/upload.ts); the returned URL routes through the checked
    // delivery endpoint instead of a public static path.
    const fname = input.filename || (input.filePath ? path.basename(input.filePath) : `${Date.now()}-${input.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`);
    masterUrl = quarantine
      ? "" // filled in below from the Media id
      : publicUrlFor(input.kind, fname);
    // Include the kind subdirectory so /media/file/:id can locate local files
    // in uploads-quarantine/<kind>/ or uploads/<kind> correctly.
    storageKey = `${input.kind}/${fname}`;
  }

  const thumbnailUrl = derivedThumbnailUrl || masterUrl;

  const mediaDoc = await Media.create({
    ownerId: input.ownerId && Types.ObjectId.isValid(input.ownerId) ? new Types.ObjectId(input.ownerId) : undefined,
    type,
    context,
    originalName: input.originalname,
    mimeType: input.mimetype,
    format: input.mimetype.split("/")[1] || "jpeg",
    originalWidth: width,
    originalHeight: height,
    aspectRatio,
    orientation,
    originalSize: input.sizeBytes,
    status: "READY",
    variants: [],
    thumbnailUrl,
    blurDataUrl,
    storageKey,
    cdnUrl: masterUrl || undefined,
    // Content-safety fields:
    moderationStatus: quarantine ? "pending" : "approved",
    contentHash,
    legacyPublic: !quarantine,
  });

  // Delivery URL: token-routed (checked) while the pipeline is active;
  // legacy public path otherwise.
  const deliveryUrl = quarantine
    ? `/api/v1/media/file/${String(mediaDoc._id)}`
    : masterUrl;

  const variants = buildVariants(deliveryUrl, width, height, input.mimetype, thumbnailUrl);
  if (variants.length > 0) {
    mediaDoc.variants = variants;
    await mediaDoc.save();
  }

  return {
    mediaId: String(mediaDoc._id),
    url: deliveryUrl,
    thumbnailUrl: quarantine
      ? isVideo && isCloudinaryConfigured
        ? `${deliveryUrl}?variant=thumbnail`
        : isVideo
          ? undefined
          : deliveryUrl
      : thumbnailUrl,
    blurDataUrl,
    width,
    height,
    aspectRatio,
    orientation,
    variants,
    status: "READY",
    moderationStatus: quarantine ? "pending" : "approved",
  };
}
