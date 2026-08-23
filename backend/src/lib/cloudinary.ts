import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
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
};

/** Uploads a buffer (from multer's memoryStorage) to Cloudinary and returns its secure URL + public ID. */
export function uploadBufferToCloudinary(
  buffer: Buffer,
  kind: UploadKind,
  mimetype: string
): Promise<UploadApiResponse> {
  const resourceType = mimetype.startsWith("video/") ? "video" : "image";

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: FOLDER_BY_KIND[kind],
        resource_type: resourceType,
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

export { cloudinary };
