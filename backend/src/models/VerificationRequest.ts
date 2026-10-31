import { Schema, model, Document, Types } from "mongoose";

export interface IVerificationRequest extends Document {
  user: Types.ObjectId;
  category: "creator" | "public_figure" | "organization" | "business" | "other";
  statement: string;
  publicLinks: string[];
  status: "pending" | "approved" | "rejected";
  decisionNote?: string;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const VerificationRequestSchema = new Schema<IVerificationRequest>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    category: { type: String, enum: ["creator", "public_figure", "organization", "business", "other"], default: "creator" },
    statement: { type: String, required: true, trim: true, maxlength: 2000 },
    publicLinks: [{ type: String, trim: true, maxlength: 500 }],
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
    decisionNote: { type: String, maxlength: 1000 },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
  },
  { timestamps: true },
);

VerificationRequestSchema.index({ user: 1, status: 1 });
VerificationRequestSchema.index({ status: 1, createdAt: -1 });

export const VerificationRequest = model<IVerificationRequest>("VerificationRequest", VerificationRequestSchema);
