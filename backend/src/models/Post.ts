import { Schema, model, Document, Types } from "mongoose";
import { ModerationStatus } from "../lib/moderation/types";

export type MediaKind = "photo" | "video" | "reel" | "text";
/**
 * Post lifecycle. "processing" and "rejected" are added by the content-safety
 * system: a post created through the API starts life as "processing" and is
 * only flipped to "published" by the moderation pipeline upon APPROVED.
 * Every existing public read path (feeds, explore, reels, search,
 * recommendations, profile grids) already filters status:"published", so
 * unapproved posts are invisible platform-wide WITHOUT touching those routes.
 */
export type PostStatus = "published" | "scheduled" | "draft" | "processing" | "rejected" | "removed";
export type PostAudience = "public" | "followers" | "private";

export interface PostMediaItem {
  url: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  kind?: "photo" | "video";
}

/** Moderation sub-document: the detailed safety state behind the lifecycle. */
export interface PostModerationInfo {
  status: ModerationStatus;
  /** Links to the ModerationRecord with the latest assessment. */
  record?: Types.ObjectId;
  /** Non-graphic, user-safe explanation. */
  userMessage?: string;
  updatedAt?: Date;
}

export interface IPost extends Document {
  author: Types.ObjectId;
  kind: MediaKind;
  body: string;
  mediaUrl?: string;
  mediaKey?: string;
  mediaMimeType?: string;
  duration?: string;
  thumbnailUrl?: string;
  /** B1 — intrinsic media geometry so the feed can size images WITHOUT cropping. */
  mediaWidth?: number;
  mediaHeight?: number;
  aspectRatio?: number;
  blurDataUrl?: string;
  /** B1 — per-item metadata for multi-image posts (parallel to mediaUrl's comma list). */
  media?: PostMediaItem[];
  location?: string;
  tags: string[];
  audience: PostAudience;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  status: PostStatus;
  scheduledFor?: Date;
  removedAt?: Date;
  removedBy?: Types.ObjectId;
  removedReason?: string;
  removedPreviousStatus?: PostStatus;
  /** Content-safety state — see PostModerationInfo. */
  moderation?: PostModerationInfo;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    kind: { type: String, enum: ["photo", "video", "reel", "text"], required: true },
    body: { type: String, maxlength: 2200, default: "" },
    mediaUrl: { type: String },
    mediaKey: { type: String },
    mediaMimeType: { type: String },
    duration: { type: String },
    thumbnailUrl: { type: String },
    mediaWidth: { type: Number, min: 1, max: 20000 },
    mediaHeight: { type: Number, min: 1, max: 20000 },
    aspectRatio: { type: Number, min: 0.1, max: 10 },
    blurDataUrl: { type: String, maxlength: 200_000 },
    media: [
      {
        url: { type: String, required: true },
        width: { type: Number, min: 1, max: 20000 },
        height: { type: Number, min: 1, max: 20000 },
        aspectRatio: { type: Number, min: 0.1, max: 10 },
        kind: { type: String, enum: ["photo", "video"] },
      },
    ],
    location: { type: String, maxlength: 100 },
    tags: [{ type: String, lowercase: true }],
    audience: { type: String, enum: ["public", "followers", "private"], default: "public" },
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["published", "scheduled", "draft", "processing", "rejected", "removed"],
      default: "processing",
    },
    scheduledFor: { type: Date },
    removedAt: { type: Date },
    removedBy: { type: Schema.Types.ObjectId, ref: "User" },
    removedReason: { type: String, maxlength: 500 },
    removedPreviousStatus: { type: String, enum: ["published", "scheduled", "draft", "processing", "rejected"] },
    moderation: {
      status: {
        type: String,
        enum: ["processing", "pending_review", "approved", "rejected", "failed"],
        default: "processing",
      },
      record: { type: Schema.Types.ObjectId, ref: "ModerationRecord" },
      userMessage: { type: String, maxlength: 500 },
      updatedAt: { type: Date },
    },
  },
  { timestamps: true },
);

PostSchema.index({ author: 1, status: 1, createdAt: -1 });
PostSchema.index({ status: 1, createdAt: -1 });
PostSchema.index({ kind: 1, createdAt: -1 });
// Supports the public home timeline's audience filter + newest-first cursor.
// This is additive only and does not alter or migrate existing post records.
PostSchema.index({ status: 1, audience: 1, createdAt: -1, _id: -1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ status: 1, scheduledFor: 1 });
PostSchema.index({ "moderation.status": 1, createdAt: -1 });

export const Post = model<IPost>("Post", PostSchema);
