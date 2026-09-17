import { Schema, model, Document, Types } from "mongoose";

export type FeedbackReason =
  | "not_interested"
  | "seen_too_often"
  | "dont_like_topic"
  | "dont_like_creator";

export interface INegativeFeedback extends Document {
  user: Types.ObjectId;
  content: Types.ObjectId;
  creator?: Types.ObjectId;
  reason: FeedbackReason;
  createdAt: Date;
}

const NegativeFeedbackSchema = new Schema<INegativeFeedback>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    content: { type: Schema.Types.ObjectId, ref: "Post", required: true, index: true },
    creator: { type: Schema.Types.ObjectId, ref: "User", index: true },
    reason: {
      type: String,
      enum: ["not_interested", "seen_too_often", "dont_like_topic", "dont_like_creator"],
      default: "not_interested",
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

NegativeFeedbackSchema.index({ user: 1, content: 1 }, { unique: true });

export const NegativeFeedback = model<INegativeFeedback>(
  "NegativeFeedback",
  NegativeFeedbackSchema
);
