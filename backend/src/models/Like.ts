import { Schema, model, Document, Types } from "mongoose";

export interface ILike extends Document {
  user: Types.ObjectId;
  target: Types.ObjectId;
  kind: "post" | "comment";
  createdAt: Date;
  updatedAt: Date;
}

const LikeSchema = new Schema<ILike>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    target: { type: Schema.Types.ObjectId, required: true },
    kind: { type: String, enum: ["post", "comment"], required: true },
  },
  { timestamps: true },
);

LikeSchema.index({ user: 1, target: 1, kind: 1 }, { unique: true });
LikeSchema.index({ target: 1, kind: 1 });

export const Like = model<ILike>("Like", LikeSchema);
