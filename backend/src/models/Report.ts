import { Schema, model, Document, Types } from "mongoose";

export type ReportReason =
  | "Harassment"
  | "Spam"
  | "Nudity"
  | "Misinformation"
  | "Copyright"
  | "Violence"
  | "Other";

export type ReportStatus = "pending" | "escalated" | "resolved" | "dismissed";
export type ReportSeverity = "low" | "medium" | "high";

export interface IReport extends Document {
  reporter: Types.ObjectId;
  target: Types.ObjectId;
  targetPost?: Types.ObjectId;
  targetLive?: Types.ObjectId;
  reason: ReportReason;
  excerpt?: string;
  status: ReportStatus;
  severity: ReportSeverity;
  reportsCount: number;
  actionedBy?: Types.ObjectId;
  actionedAt?: Date;
  actionNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    reporter: { type: Schema.Types.ObjectId, ref: "User", required: true },
    target: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetPost: { type: Schema.Types.ObjectId, ref: "Post" },
    targetLive: { type: Schema.Types.ObjectId, ref: "LiveStream" },
    reason: {
      type: String,
      enum: ["Harassment", "Spam", "Nudity", "Misinformation", "Copyright", "Violence", "Other"],
      required: true,
    },
    excerpt: { type: String },
    status: {
      type: String,
      enum: ["pending", "escalated", "resolved", "dismissed"],
      default: "pending",
    },
    severity: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    reportsCount: { type: Number, default: 1 },
    actionedBy: { type: Schema.Types.ObjectId, ref: "User" },
    actionedAt: { type: Date },
    actionNote: { type: String },
  },
  { timestamps: true },
);

ReportSchema.index({ status: 1, severity: -1, createdAt: -1 });
ReportSchema.index({ target: 1 });

export const Report = model<IReport>("Report", ReportSchema);
