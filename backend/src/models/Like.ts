import { Schema, model, Document, Types } from "mongoose";

export interface ILike extends Document {
  user: Types.ObjectId;
  target: Types.ObjectId;
  kind: "post" | "comment" | "ad";
  reaction?: "like" | "love" | "care" | "haha" | "wow" | "sad" | "angry";
  createdAt: Date;
  updatedAt: Date;
}

const LikeSchema = new Schema<ILike>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    target: { type: Schema.Types.ObjectId, required: true },
    kind: { type: String, enum: ["post", "comment", "ad"], required: true },
    reaction: { type: String, enum: ["like", "love", "care", "haha", "wow", "sad", "angry"] },
  },
  { timestamps: true },
);

LikeSchema.index({ user: 1, target: 1, kind: 1 }, { unique: true });
LikeSchema.index({ target: 1, kind: 1 });

export const Like = model<ILike>("Like", LikeSchema);
