import { Schema, model, Document, Types } from "mongoose";
import { ModerationStatus } from "../lib/moderation/types";

export interface IStory extends Document {
  author: Types.ObjectId;
  mediaUrl: string;
  mediaKey?: string;
  mediaType: "image" | "video";
  caption?: string;
  duration: number;
  expiresAt: Date;
  /** Content-safety state. Stories have no `status` field, so this sub-doc
 *  IS the visibility gate: read paths exclude anything not "approved"
 *  (with a legacy fallback for pre-moderation content — see backfill). */
  moderation?: {
    status: ModerationStatus;
    record?: Types.ObjectId;
    userMessage?: string;
    updatedAt?: Date;
  };
  viewers: { user: Types.ObjectId; viewedAt: Date }[];
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const StorySchema = new Schema<IStory>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    mediaUrl: { type: String, required: true },
    mediaKey: { type: String },
    mediaType: { type: String, enum: ["image", "video"], default: "image" },
    caption: { type: String, maxlength: 500 },
    duration: { type: Number, default: 4200 },
    expiresAt: { type: Date, required: true },
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
    viewers: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        viewedAt: { type: Date, default: Date.now },
      },
    ],
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

StorySchema.index({ author: 1, expiresAt: 1 });
StorySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
StorySchema.index({ "moderation.status": 1, createdAt: -1 });

export const Story = model<IStory>("Story", StorySchema);
