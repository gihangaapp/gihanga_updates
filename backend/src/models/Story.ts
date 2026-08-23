import { Schema, model, Document, Types } from "mongoose";

export interface IStory extends Document {
  author: Types.ObjectId;
  mediaUrl: string;
  mediaKey?: string;
  mediaType: "image" | "video";
  caption?: string;
  duration: number;
  expiresAt: Date;
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

export const Story = model<IStory>("Story", StorySchema);
