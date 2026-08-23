import { Schema, model, Document, Types } from "mongoose";

export interface IBookmark extends Document {
  user: Types.ObjectId;
  post: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BookmarkSchema = new Schema<IBookmark>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  },
  { timestamps: true },
);

BookmarkSchema.index({ user: 1, createdAt: -1 });
BookmarkSchema.index({ user: 1, post: 1 }, { unique: true });

export const Bookmark = model<IBookmark>("Bookmark", BookmarkSchema);
