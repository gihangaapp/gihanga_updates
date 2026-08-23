import { Schema, model, Document } from "mongoose";

export interface IHashtag extends Document {
  tag: string;
  postsCount: number;
  category?: string;
  trend: number;
  createdAt: Date;
  updatedAt: Date;
}

const HashtagSchema = new Schema<IHashtag>(
  {
    tag: { type: String, required: true, unique: true, lowercase: true, trim: true },
    postsCount: { type: Number, default: 0 },
    category: { type: String },
    trend: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Hashtag = model<IHashtag>("Hashtag", HashtagSchema);
