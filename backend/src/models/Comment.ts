import { Schema, model, Document, Types } from "mongoose";

export interface IComment extends Document {
  post: Types.ObjectId;
  author: Types.ObjectId;
  body: string;
  parent?: Types.ObjectId;
  likesCount: number;
  repliesCount: number;
  hidden: boolean;
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
    removedAt: { type: Date },
    removedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

CommentSchema.index({ post: 1, parent: 1, createdAt: 1 });
CommentSchema.index({ author: 1 });

export const Comment = model<IComment>("Comment", CommentSchema);
