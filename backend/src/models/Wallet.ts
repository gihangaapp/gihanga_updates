import { Schema, model, Document, Types } from "mongoose";

export interface IWallet extends Document {
  user: Types.ObjectId;
  available: number;
  pending: number;
  lifetime: number;
  kingdomPoints: number;
  frozen: boolean;
  frozenBy?: Types.ObjectId;
  frozenAt?: Date;
  frozenReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema<IWallet>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    available: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    lifetime: { type: Number, default: 0 },
    kingdomPoints: { type: Number, default: 0 },
    frozen: { type: Boolean, default: false },
    frozenBy: { type: Schema.Types.ObjectId, ref: "User" },
    frozenAt: { type: Date },
    frozenReason: { type: String },
  },
  { timestamps: true },
);

export const Wallet = model<IWallet>("Wallet", WalletSchema);
