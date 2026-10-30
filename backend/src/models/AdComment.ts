import { Schema, model, Document, Types } from "mongoose";
import { ModerationStatus } from "../lib/moderation/types";

export interface IAdComment extends Document {
  ad: Types.ObjectId;
  author: Types.ObjectId;
  body: string;
  hidden: boolean;
  moderation?: {
    status: ModerationStatus;
    record?: Types.ObjectId;
    userMessage?: string;
    updatedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AdCommentSchema = new Schema<IAdComment>(
  {
    ad: { type: Schema.Types.ObjectId, ref: "Advertisement", required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true, trim: true, maxlength: 1000 },
    hidden: { type: Boolean, default: false, index: true },
    moderation: {
      status: {
        type: String,
        enum: ["processing", "pending_review", "approved", "rejected", "failed"],
        default: "approved",
      },
      record: { type: Schema.Types.ObjectId, ref: "ModerationRecord" },
      userMessage: { type: String, maxlength: 500 },
      updatedAt: { type: Date },
    },
  },
  { timestamps: true },
);

AdCommentSchema.index({ ad: 1, hidden: 1, createdAt: -1 });
AdCommentSchema.index({ author: 1, createdAt: -1 });

export const AdComment = model<IAdComment>("AdComment", AdCommentSchema);
