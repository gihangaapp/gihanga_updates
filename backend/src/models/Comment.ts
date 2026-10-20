import { Schema, model, Document, Types } from "mongoose";
import { ModerationStatus } from "../lib/moderation/types";

export interface IComment extends Document {
  post: Types.ObjectId;
  author: Types.ObjectId;
  body: string;
  parent?: Types.ObjectId;
  likesCount: number;
  repliesCount: number;
  /** Existing soft-visibility gate — every read path already filters
 *  hidden:false, so the moderation pipeline keeps pending comments hidden
 *  and flips hidden back to false only on APPROVED. */
  hidden: boolean;
  moderation?: {
    status: ModerationStatus;
    record?: Types.ObjectId;
    userMessage?: string;
    updatedAt?: Date;
  };
  removedAt?: Date;
  removedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true, maxlength: 1000 },
    parent: { type: Schema.Types.ObjectId, ref: "Comment" },
    likesCount: { type: Number, default: 0 },
    repliesCount: { type: Number, default: 0 },
    hidden: { type: Boolean, default: false },
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
    removedAt: { type: Date },
    removedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

CommentSchema.index({ post: 1, parent: 1, createdAt: 1 });
CommentSchema.index({ author: 1 });
CommentSchema.index({ "moderation.status": 1, createdAt: -1 });

export const Comment = model<IComment>("Comment", CommentSchema);
