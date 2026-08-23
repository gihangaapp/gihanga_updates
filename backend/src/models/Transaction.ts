import crypto from "node:crypto";
import { Document, model, Schema, Types } from "mongoose";

export type TransactionKind = "earning" | "tip" | "payout" | "fee" | "bonus" | "gift" | "deposit";
export type TransactionStatus = "created" | "pending" | "completed" | "failed" | "cancelled" | "expired";

export interface ITransaction extends Document {
  wallet: Types.ObjectId;
  user: Types.ObjectId;
  kind: TransactionKind;
  amount: number;
  currency?: string;
  label: string;
  status: TransactionStatus;
  internalReferenceId: string;
  idempotencyKey?: string;
  provider?: "MTN_MOMO";
  momoReferenceId?: string;
  momoStatus?: string;
  momoReason?: string;
  customerPhone?: string;
  failureReason?: string;
  metadata?: Record<string, unknown>;
  settledAt?: Date;
  relatedPost?: Types.ObjectId;
  relatedLive?: Types.ObjectId;
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    wallet: { type: Schema.Types.ObjectId, ref: "Wallet", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    kind: { type: String, enum: ["earning", "tip", "payout", "fee", "bonus", "gift", "deposit"], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "RWF", uppercase: true, trim: true },
    label: { type: String, required: true, maxlength: 240 },
    status: { type: String, enum: ["created", "pending", "completed", "failed", "cancelled", "expired"], default: "created" },
    internalReferenceId: { type: String, required: true, unique: true, immutable: true, index: true, default: () => crypto.randomUUID() },
    idempotencyKey: { type: String, unique: true, sparse: true, immutable: true, index: true },
    provider: { type: String, enum: ["MTN_MOMO"] },
    momoReferenceId: { type: String, index: true, sparse: true },
    momoStatus: { type: String, trim: true },
    momoReason: { type: String, maxlength: 500 },
    customerPhone: { type: String, select: false },
    failureReason: { type: String, maxlength: 500 },
    metadata: { type: Schema.Types.Mixed },
    settledAt: { type: Date },
    relatedPost: { type: Schema.Types.ObjectId, ref: "Post" },
    relatedLive: { type: Schema.Types.ObjectId, ref: "LiveStream" },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
  },
  { timestamps: true },
);

TransactionSchema.index({ wallet: 1, createdAt: -1 });
TransactionSchema.index({ status: 1, kind: 1 });
TransactionSchema.index({ momoReferenceId: 1, status: 1 });

export const Transaction = model<ITransaction>("Transaction", TransactionSchema);
