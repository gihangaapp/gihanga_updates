import { Schema, model, Document, Types } from "mongoose";

export interface IUserInterestProfile extends Document {
  user: Types.ObjectId;
  tagWeights: Map<string, number>;
  creatorAffinities: Map<string, number>;
  categoryWeights: Map<string, number>;
  lastInteractionAt: Date;
  updatedAt: Date;
}

const UserInterestProfileSchema = new Schema<IUserInterestProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    tagWeights: { type: Map, of: Number, default: new Map() },
    creatorAffinities: { type: Map, of: Number, default: new Map() },
    categoryWeights: { type: Map, of: Number, default: new Map() },
    lastInteractionAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const UserInterestProfile = model<IUserInterestProfile>(
  "UserInterestProfile",
  UserInterestProfileSchema
);
