import { Schema, model, Document, Types } from "mongoose";

export type MediaType = "image" | "video" | "audio";
export type MediaContext = "post" | "reel" | "story" | "avatar" | "thumbnail";
export type MediaStatus = "UPLOADING" | "PROCESSING" | "READY" | "FAILED";
export type MediaOrientation = "portrait" | "landscape" | "square";

export interface IMediaVariant {
  label: "thumbnail" | "small" | "medium" | "large" | "master";
  width: number;
  height: number;
  url: string;
  format: string;
  sizeBytes?: number;
}

export interface IMedia extends Document {
  ownerId?: Types.ObjectId;
  type: MediaType;
  context: MediaContext;
  originalName: string;
  mimeType: string;
  format: string;
  originalWidth: number;
  originalHeight: number;
  aspectRatio: number; // width / height
  orientation: MediaOrientation;
  originalSize: number;
  duration?: number; // seconds for video/audio
  status: MediaStatus;
  processingError?: string;
  variants: IMediaVariant[];
  thumbnailUrl?: string;
  blurDataUrl?: string; // base64 data URI for instant blur-up progressive loading
  storageKey?: string;
  cdnUrl?: string;
  focalPoint?: { x: number; y: number }; // 0-100 percentage coordinates for future smart cropping
  createdAt: Date;
  updatedAt: Date;
}

const MediaVariantSchema = new Schema<IMediaVariant>(
  {
    label: {
      type: String,
      enum: ["thumbnail", "small", "medium", "large", "master"],
      required: true,
    },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    url: { type: String, required: true },
    format: { type: String, required: true },
    sizeBytes: { type: Number },
  },
  { _id: false }
);

const MediaSchema = new Schema<IMedia>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    type: { type: String, enum: ["image", "video", "audio"], required: true },
    context: {
      type: String,
      enum: ["post", "reel", "story", "avatar", "thumbnail"],
      default: "post",
    },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    format: { type: String, required: true },
    originalWidth: { type: Number, default: 1080 },
    originalHeight: { type: Number, default: 1080 },
    aspectRatio: { type: Number, default: 1.0 },
    orientation: { type: String, enum: ["portrait", "landscape", "square"], default: "square" },
    originalSize: { type: Number, default: 0 },
    duration: { type: Number },
    status: {
      type: String,
      enum: ["UPLOADING", "PROCESSING", "READY", "FAILED"],
      default: "READY",
    },
    processingError: { type: String },
    variants: [MediaVariantSchema],
    thumbnailUrl: { type: String },
    blurDataUrl: { type: String },
    storageKey: { type: String },
    cdnUrl: { type: String },
    focalPoint: {
      x: { type: Number, default: 50 },
      y: { type: Number, default: 50 },
    },
  },
  { timestamps: true }
);

MediaSchema.index({ ownerId: 1, createdAt: -1 });
MediaSchema.index({ context: 1, type: 1 });

export const Media = model<IMedia>("Media", MediaSchema);
