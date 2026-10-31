import { Schema, model, Document, Types } from "mongoose";

export interface IAnnouncement extends Document {
  title: string;
  message: string;
  status: "draft" | "publishing" | "published";
  createdBy: Types.ObjectId;
  publishedBy?: Types.ObjectId;
  publishedAt?: Date;
  recipientsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    status: { type: String, enum: ["draft", "publishing", "published"], default: "draft", index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    publishedBy: { type: Schema.Types.ObjectId, ref: "User" },
    publishedAt: { type: Date },
    recipientsCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

AnnouncementSchema.index({ status: 1, createdAt: -1 });
export const Announcement = model<IAnnouncement>("Announcement", AnnouncementSchema);
