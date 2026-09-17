import { Types } from "mongoose";
import { Media, IMedia, MediaContext, MediaType, MediaOrientation, IMediaVariant } from "../../models/Media";
import { isCloudinaryConfigured, uploadBufferToCloudinary, videoThumbnailFromCloudinary } from "../../lib/cloudinary";
import { publicUrlFor, UploadKind } from "../../middleware/upload";

export interface ProcessMediaInput {
  ownerId?: string;
  fileBuffer?: Buffer;
  filename?: string;
  originalname: string;
  mimetype: string;
  sizeBytes: number;
  kind: UploadKind; // "photos" | "videos" | "reels" | "avatars" | "stories"
}

export interface ProcessedMediaResult {
  mediaId: string;
  url: string;
  thumbnailUrl: string;
  blurDataUrl: string;
  width: number;
  height: number;
  aspectRatio: number;
  orientation: MediaOrientation;
  variants: IMediaVariant[];
  status: "READY" | "PROCESSING" | "FAILED";
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
  };
  const context = contextMap[input.kind] || "post";

  // Dynamic aspect ratio calculation based on context defaults or extracted parameters
  let width = 1080;
  let height = 1080;

  if (context === "reel" || context === "story") {
    width = 1080;
    height = 1920; // 9:16 portrait
  } else if (context === "avatar") {
    width = 400;
    height = 400; // 1:1 square
  } else {
    // Post default
    width = 1080;
    height = 1350; // 4:5 portrait post standard
  }

  const aspectRatio = Math.round((width / height) * 1000) / 1000;
  const orientation = getOrientation(width, height);
  const blurDataUrl = generateBlurDataUrl(aspectRatio);

  let masterUrl = "";
  let storageKey = "";
  let derivedThumbnailUrl = "";

  if (isCloudinaryConfigured && input.fileBuffer) {
    const cloudRes = await uploadBufferToCloudinary(input.fileBuffer, input.kind, input.mimetype);
    masterUrl = cloudRes.secure_url;
    storageKey = cloudRes.public_id;
    // For videos, derive a real JPEG frame thumbnail from Cloudinary instead of
    // pointing "thumbnail" at the .mp4 itself (which <img> tags can't render).
    if (isVideo) {
      try {
        derivedThumbnailUrl = videoThumbnailFromCloudinary(cloudRes.public_id);
      } catch {
        derivedThumbnailUrl = "";
      }
    }
  } else {
    // Local storage fallback
    const fname = input.filename || `${Date.now()}-${input.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    masterUrl = publicUrlFor(input.kind, fname);
    storageKey = fname;
  }

  const thumbnailUrl = derivedThumbnailUrl || masterUrl;
  const variants = buildVariants(masterUrl, width, height, input.mimetype, thumbnailUrl);

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
    variants,
    thumbnailUrl,
    blurDataUrl,
    storageKey,
    cdnUrl: masterUrl,
  });

  return {
    mediaId: String(mediaDoc._id),
    url: masterUrl,
    thumbnailUrl,
    blurDataUrl,
    width,
    height,
    aspectRatio,
    orientation,
    variants,
    status: "READY",
  };
}
