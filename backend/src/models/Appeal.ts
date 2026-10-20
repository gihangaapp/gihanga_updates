import { Schema, model, Document, Types } from "mongoose";

/**
 * Appeal — a user's request to overturn a moderation decision.
 *
 * Rules enforced by the routes (not just the schema):
 *  - only the CONTENT AUTHOR can appeal their own rejected content,
 *  - one OPEN appeal per moderation record,
 *  - appeals are rate-limited per user,
 *  - critical-escalation records (CSAM protocol) cannot be appealed through
 *    the automated flow.
 */
export interface IAppeal extends Document {
  record: Types.ObjectId;
  user: Types.ObjectId;
  statement: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: Date;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  decisionNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppealSchema = new Schema<IAppeal>(
  {
    record: { type: Schema.Types.ObjectId, ref: "ModerationRecord", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    statement: { type: String, required: true, maxlength: 2000 },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    submittedAt: { type: Date, default: Date.now },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    decisionNote: { type: String },
  },
  { timestamps: true },
);

AppealSchema.index({ status: 1, submittedAt: -1 });
AppealSchema.index({ user: 1, createdAt: -1 });
// One open appeal per record.
AppealSchema.index({ record: 1, status: 1 }, { unique: true, partialFilterExpression: { status: "pending" } });

export const Appeal = model<IAppeal>("Appeal", AppealSchema);
