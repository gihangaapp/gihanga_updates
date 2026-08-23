import { Schema, model, Document, Types } from "mongoose";

export type MediaKind = "photo" | "video" | "reel" | "text";
export type PostStatus = "published" | "scheduled" | "draft" | "removed";
export type PostAudience = "public" | "followers" | "private";

export interface IPost extends Document {
  author: Types.ObjectId;
  kind: MediaKind;
  body: string;
  mediaUrl?: string;
  mediaKey?: string;
  mediaMimeType?: string;
  duration?: string;
  thumbnailUrl?: string;
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
    location: { type: String, maxlength: 100 },
    tags: [{ type: String, lowercase: true }],
    audience: { type: String, enum: ["public", "followers", "private"], default: "public" },
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["published", "scheduled", "draft", "removed"],
      default: "published",
    },
    scheduledFor: { type: Date },
    removedAt: { type: Date },
    removedBy: { type: Schema.Types.ObjectId, ref: "User" },
    removedReason: { type: String },
  },
  { timestamps: true },
);

PostSchema.index({ author: 1, status: 1, createdAt: -1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ status: 1, scheduledFor: 1 });

export const Post = model<IPost>("Post", PostSchema);
