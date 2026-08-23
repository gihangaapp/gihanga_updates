import { Schema, model, Document, Types } from "mongoose";

export interface IBlock extends Document {
  blocker: Types.ObjectId;
  blocked: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BlockSchema = new Schema<IBlock>(
  {
    blocker: { type: Schema.Types.ObjectId, ref: "User", required: true },
    blocked: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

BlockSchema.index({ blocker: 1, blocked: 1 }, { unique: true });

export const Block = model<IBlock>("Block", BlockSchema);
