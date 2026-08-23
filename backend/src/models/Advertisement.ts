import { Schema, model, Document, Types } from "mongoose";

export type CampaignObjective = "reach" | "views" | "clicks" | "leads" | "conversions";
export type CampaignStatus = "review" | "active" | "paused" | "completed" | "rejected";

export interface IAdvertisement extends Document {
  creator: Types.ObjectId;
  name: string;
  objective: CampaignObjective;
  audience?: string;
  dailyBudget: number;
  totalBudget: number;
  spent: number;
  impressions: number;
  clicks: number;
  ctr: number;
  status: CampaignStatus;
  rejectionReason?: string;
  approvedBy?: Types.ObjectId;
  targetPosts: Types.ObjectId[];
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AdvertisementSchema = new Schema<IAdvertisement>(
  {
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, maxlength: 100 },
    objective: {
      type: String,
      enum: ["reach", "views", "clicks", "leads", "conversions"],
      required: true,
    },
    audience: { type: String },
    dailyBudget: { type: Number, required: true },
    totalBudget: { type: Number, required: true },
    spent: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    ctr: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["review", "active", "paused", "completed", "rejected"],
      default: "review",
    },
    rejectionReason: { type: String },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    targetPosts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { timestamps: true },
);

AdvertisementSchema.index({ creator: 1, status: 1 });
AdvertisementSchema.index({ status: 1, endDate: 1 });

export const Advertisement = model<IAdvertisement>("Advertisement", AdvertisementSchema);
