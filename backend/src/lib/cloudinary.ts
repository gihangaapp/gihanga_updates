import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import fs from "fs";
import { Readable } from "stream";
import { UploadKind } from "../middleware/upload";

/**
 * Cloudinary is used for persistent file storage in production (Render's
 * filesystem is ephemeral — anything written to local disk is wiped on every
 * deploy/restart). Configure via a single CLOUDINARY_URL env var (the format
 * Cloudinary's dashboard gives you: cloudinary://<key>:<secret>@<cloud_name>),
 * OR the three separate CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY /
 * CLOUDINARY_API_SECRET vars — either works, cloudinary's SDK reads
 * CLOUDINARY_URL from the environment automatically.
 *
 * When neither is set (e.g. local dev with nothing configured yet), uploads
 * fall back to local disk under backend/uploads — fine for a laptop, but NOT
 * suitable for Render, so production deployments should always set one of
 * the above.
 */
export const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_URL ||
    (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
);

if (isCloudinaryConfigured && !process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

const FOLDER_BY_KIND: Record<UploadKind, string> = {
  photos: "gihanga/photos",
  videos: "gihanga/videos",
  reels: "gihanga/reels",
  avatars: "gihanga/avatars",
  stories: "gihanga/stories",
  covers: "gihanga/covers",
};

/**
 * Uploads a buffer (from multer's memoryStorage) to Cloudinary and returns
 * its secure URL + public ID.
 *
 * MODERATION: when `opts.authenticated` is true (the default whenever the
 * content-safety pipeline is active), the asset is uploaded with
 * Cloudinary's `type: "authenticated"` — it is NOT publicly fetchable and
 * can only be delivered through SHORT-LIVED SIGNED URLs minted by the
 * backend (see signedCloudinaryDeliveryUrl). Unapproved media therefore has
 * no public URL at all.
 */
export function uploadBufferToCloudinary(
  buffer: Buffer,
  kind: UploadKind,
  mimetype: string,
  opts: { authenticated?: boolean } = {},
): Promise<UploadApiResponse> {
  const resourceType = mimetype.startsWith("video/") ? "video" : "image";
  const authenticated = opts.authenticated ?? true;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: FOLDER_BY_KIND[kind],
        resource_type: resourceType,
        // Authenticated assets require signed delivery URLs — this is what
        // quarantines media on Cloudinary's CDN before moderation approval.
        ...(authenticated ? { type: "authenticated" } : {}),
        // Lets Cloudinary auto-generate a unique public_id rather than reusing
        // the original filename, avoiding collisions between different users'
        // uploads of e.g. "image.jpg".
        use_filename: false,
        unique_filename: true,
        overwrite: false,
      },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("Cloudinary upload failed"));
        resolve(result);
      }
    );
    Readable.from(buffer).pipe(uploadStream);
  });
}


/**
 * Streams a spooled upload to Cloudinary. All videos use chunked streaming
 * so uploads remain reliable on mobile networks and files above Cloudinary's
 * 100 MB single-request ceiling are handled without a separate failure path.
 */
export function uploadFileToCloudinary(
  filePath: string,
  kind: UploadKind,
  mimetype: string,
  opts: { authenticated?: boolean } = {},
): Promise<UploadApiResponse> {
  const resourceType = mimetype.startsWith("video/") ? "video" : "image";
  const authenticated = opts.authenticated ?? true;
  const useChunkedVideoUpload = resourceType === "video";

  const uploadOptions = {
    folder: FOLDER_BY_KIND[kind],
    resource_type: resourceType,
    ...(authenticated ? { type: "authenticated" } : {}),
    use_filename: false,
    unique_filename: true,
    overwrite: false,
    ...(useChunkedVideoUpload ? { chunk_size: 20 * 1024 * 1024 } : {}),
  } as any;

  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (error?: Error | null, result?: UploadApiResponse & { done?: boolean }) => {
      if (error) {
        if (!settled) {
          settled = true;
          reject(error);
        }
        return;
      }
      // chunked uploads emit interim results with done:false; only the final
      // result has the complete public_id/secure_url metadata needed here.
      if (!result || result.done === false) return;
      if (!settled) {
        settled = true;
        resolve(result);
      }
    };

    const uploadStream = useChunkedVideoUpload
      ? cloudinary.uploader.upload_chunked_stream(uploadOptions, finish as any)
      : cloudinary.uploader.upload_stream(uploadOptions, finish as any);
    const source = fs.createReadStream(filePath);
    source.on("error", (error) => {
      if (!settled) {
        settled = true;
        reject(error);
      }
      uploadStream.destroy(error);
    });
    uploadStream.on("error", (error: Error) => {
      if (!settled) {
        settled = true;
        reject(error);
      }
    });
    source.pipe(uploadStream);
  });
}

/**
 * Mints a short-lived SIGNED delivery URL for an authenticated Cloudinary
 * asset. Signed URLs expire (~1h default) — regenerated per request by the
 * media delivery route, so quarantined media never has a durable public URL.
 */
export function signedCloudinaryDeliveryUrl(
  publicId: string,
  resourceType: "image" | "video" = "image",
  ttlSeconds: number = 3600,
): string {
  return cloudinary.url(publicId, {
    resource_type: resourceType,
    type: "authenticated",
    sign_url: true,
    secure: true,
    // The signature embeds the expiry for authenticated URLs.
    // Cloudinary signs the URL; the TTL is communicated via the signature's
    // timestamp — expiration is enforced by Cloudinary's signed URL scheme.
    expires_at: Math.floor(Date.now() / 1000) + ttlSeconds,
  } as any);
}

/**
 * Derives a JPEG thumbnail URL for a Cloudinary-hosted video by asking
 * Cloudinary to render a frame as an image (same public_id, resource_type
 * "video", format "jpg" — Cloudinary generates this on the fly). Returns
 * undefined for anything that isn't a Cloudinary-hosted video URL.
 *
 * MODERATION: thumbnails of QUARANTINED videos are also quarantined — the
 * URL is signed and only handed out through the checked delivery route, so
 * a thumbnail can never leak prohibited content before approval.
 */
export function videoThumbnailFromCloudinary(publicId: string, authenticated = true): string {
  return cloudinary.url(publicId, {
    resource_type: "video",
    format: "jpg",
    secure: true,
    ...(authenticated ? { type: "authenticated", sign_url: true } : {}),
  });
}


/** Signed JPEG frame URL for an authenticated Cloudinary video. */
export function signedCloudinaryVideoThumbnailUrl(publicId: string, ttlSeconds = 3600): string {
  return cloudinary.url(publicId, {
    resource_type: "video",
    format: "jpg",
    type: "authenticated",
    sign_url: true,
    secure: true,
    expires_at: Math.floor(Date.now() / 1000) + ttlSeconds,
  } as any);
}

/**
 * Deletes a Cloudinary asset (story expiry / content deletion). Stories are
 * 24-hour content, so their media must not outlive them in storage. Tries
 * the "authenticated" upload type first (everything uploaded while the
 * moderation pipeline is active), then the default "upload" type as a
 * fallback for assets created while it was disabled. Errors are swallowed —
 * a failed destroy must never crash the caller.
 */
export async function deleteCloudinaryAsset(
  publicId: string,
  resourceType: "image" | "video" = "image",
): Promise<void> {
  if (!isCloudinaryConfigured || !publicId) return;
  for (const type of ["authenticated", "upload"] as const) {
    try {
      const res = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType, type });
      if (res?.result === "ok" || res?.result === "not found") return;
    } catch {
      // try the next type; if all fail the asset is orphaned (harmless)
    }
  }
}

export { cloudinary };
