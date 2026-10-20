import { Schema, model, Document, Types } from "mongoose";

/**
 * ModerationJob — durable record of an async moderation task (video frame
 * scanning, retries after provider failures, backfill rescans).
 *
 * Guarantees encoded here:
 *  - `jobKey` is UNIQUE: duplicate submissions for the same content collapse
 *    into one job (idempotency at the persistence layer, not just memory).
 *  - `attempts` is bounded by config.maxRetries; exceeding it parks the job
 *    in "failed" instead of looping forever.
 *  - `lastError` is the SANITIZED provider/processing message — never raw
 *    provider payloads or credentials.
 */
export interface IModerationJob extends Document {
  jobKey: string;
  kind: "video" | "image" | "text" | "backfill";
  contentType: "post" | "story" | "comment" | "avatar" | "media" | "profile" | "live_title";
  contentId: Types.ObjectId;
  mediaId?: Types.ObjectId;

  status: "queued" | "processing" | "done" | "failed" | "cancelled";
  attempts: number;
  maxAttempts: number;
  nextRunAt: Date;
  lastError?: string;

  /** Set when the job completed — links the final assessment. */
  recordId?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const ModerationJobSchema = new Schema<IModerationJob>(
  {
    jobKey: { type: String, required: true, unique: true },
    kind: { type: String, enum: ["video", "image", "text", "backfill"], required: true },
    contentType: {
      type: String,
      enum: ["post", "story", "comment", "avatar", "media", "profile", "live_title"],
      required: true,
    },
    contentId: { type: Schema.Types.ObjectId, required: true },
    mediaId: { type: Schema.Types.ObjectId, ref: "Media" },

    status: {
      type: String,
      enum: ["queued", "processing", "done", "failed", "cancelled"],
      default: "queued",
    },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
    nextRunAt: { type: Date, default: Date.now },
    lastError: { type: String },

    recordId: { type: Schema.Types.ObjectId, ref: "ModerationRecord" },
  },
  { timestamps: true },
);

ModerationJobSchema.index({ status: 1, nextRunAt: 1 });
ModerationJobSchema.index({ contentType: 1, contentId: 1 });

export const ModerationJob = model<IModerationJob>("ModerationJob", ModerationJobSchema);
