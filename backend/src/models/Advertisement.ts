import { Schema, model, Document, Types } from "mongoose";

// ─── Ad type and placement ────────────────────────────────────────────────────
export type AdType = "image" | "video" | "story_image" | "story_video";
export type AdPlacement = "feed" | "story";

// ─── Status lifecycle ─────────────────────────────────────────────────────────
export type AdStatus =
  | "draft"
  | "pending_payment"
  | "processing"
  | "paid"
  | "pending_review"
  | "approved"
  | "rejected"
  | "active"
  | "paused"
  | "expired"
  | "cancelled"
  | "refund_pending"
  | "refunded";

export type PaymentMethod = "real_money" | "gihanga_points";
export type PaymentStatus = "unpaid" | "pending" | "processing" | "paid" | "refund_pending" | "refunded";

// ─── Targeting ────────────────────────────────────────────────────────────────
export interface IAdTargeting {
  interests?: string[];
  location?: string;
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export interface IAdAnalytics {
  impressions: number;
  views: number;
  clicks: number;
  likes: number;
  shares: number;
  saves: number;
  videoStarts: number;
  videoCompletions: number;
  totalWatchSeconds: number;
  ctr: number;             // clicks / impressions * 100
  completionRate: number;  // videoCompletions / videoStarts * 100
  reach: number;           // unique users reached
}

// ─── Interface ────────────────────────────────────────────────────────────────
export interface IAdvertisement extends Document {
  // Owner
  creator: Types.ObjectId;
  isCreator: boolean;

  // Ad content
  adType: AdType;
  placement: AdPlacement;
  title: string;
  caption?: string;
  ctaText?: string;
  ctaUrl?: string;
  mediaUrl?: string;
  mediaKey?: string;
  mediaType?: "image" | "video";
  videoDurationSeconds?: number;   // actual video clip length (NOT campaign duration)
  thumbnailUrl?: string;

  // Campaign duration (calendar time)
  campaignDurationDays: number;
  startDate?: Date;
  endDate?: Date;

  // Advertising minutes (delivery quota purchased via Gihanga Points)
  advertisingMinutes: number;
  advertisingMinutesDelivered: number;  // accumulated delivery consumed so far

  // Pricing at time of payment (immutable after payment)
  rwfPricePerMinute: number;   // Superadmin's configured RWF/min at time of payment
  gpPricePerMinute: number;    // Superadmin's configured GP/min at time of payment
  totalRwfCost: number;        // final RWF cost calculated at payment time
  totalGpCost: number;         // final GP cost calculated at payment time

  // Payment
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentTransactionId?: Types.ObjectId;
  paymentIdempotencyKey?: string;
  paidAt?: Date;

  // Status & moderation
  status: AdStatus;
  rejectionReason?: string;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  pausedBy?: Types.ObjectId;      // set when paused by admin (different from creator pause)
  disabledBy?: Types.ObjectId;

  // Targeting
  targeting: IAdTargeting;

  // Analytics (embedded summary — updated via delivery engine)
  analytics: IAdAnalytics;

  // Legacy migration flag
  _legacySystem?: boolean;

  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const AdAnalyticsSchema = new Schema<IAdAnalytics>(
  {
    impressions: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
    videoStarts: { type: Number, default: 0 },
    videoCompletions: { type: Number, default: 0 },
    totalWatchSeconds: { type: Number, default: 0 },
    ctr: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    reach: { type: Number, default: 0 },
  },
  { _id: false },
);

const AdTargetingSchema = new Schema<IAdTargeting>(
  {
    interests: [{ type: String }],
    location: { type: String },
  },
  { _id: false },
);

const AdvertisementSchema = new Schema<IAdvertisement>(
  {
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isCreator: { type: Boolean, default: false },

    adType: {
      type: String,
      enum: ["image", "video", "story_image", "story_video"],
      required: true,
    },
    placement: {
      type: String,
      enum: ["feed", "story"],
      required: true,
    },
    title: { type: String, required: true, maxlength: 100 },
    caption: { type: String, maxlength: 300 },
    ctaText: { type: String, maxlength: 30 },
    ctaUrl: { type: String, maxlength: 500 },
    mediaUrl: { type: String },
    mediaKey: { type: String },
    mediaType: { type: String, enum: ["image", "video"] },
    videoDurationSeconds: { type: Number },   // actual uploaded video clip length
    thumbnailUrl: { type: String },

    // Campaign calendar duration
    campaignDurationDays: { type: Number, required: true, min: 1 },
    startDate: { type: Date },
    endDate: { type: Date },

    // Advertising minutes (delivery quota)
    advertisingMinutes: { type: Number, required: true, min: 1 },
    advertisingMinutesDelivered: { type: Number, default: 0 },

    // Pricing — frozen at time of payment, never retroactively changed
    rwfPricePerMinute: { type: Number, default: 0 },
    gpPricePerMinute: { type: Number, default: 0 },
    totalRwfCost: { type: Number, default: 0 },
    totalGpCost: { type: Number, default: 0 },

    // Payment
    paymentStatus: {
      type: String,
      enum: ["unpaid", "pending", "processing", "paid", "refund_pending", "refunded"],
      default: "unpaid",
    },
    paymentMethod: { type: String, enum: ["real_money", "gihanga_points"] },
    paymentTransactionId: { type: Schema.Types.ObjectId, ref: "Transaction" },
    paymentIdempotencyKey: { type: String, unique: true, sparse: true, index: true },
    paidAt: { type: Date },

    // Status
    status: {
      type: String,
      enum: [
        "draft",
        "pending_payment",
        "processing",
        "paid",
        "pending_review",
        "approved",
        "rejected",
        "active",
        "paused",
        "expired",
        "cancelled",
        "refund_pending",
        "refunded",
      ],
      default: "draft",
    },
    rejectionReason: { type: String, maxlength: 500 },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    pausedBy: { type: Schema.Types.ObjectId, ref: "User" },
    disabledBy: { type: Schema.Types.ObjectId, ref: "User" },

    // Targeting
    targeting: { type: AdTargetingSchema, default: () => ({}) },

    // Analytics (embedded)
    analytics: { type: AdAnalyticsSchema, default: () => ({}) },

    // Migration
    _legacySystem: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Indexes for common query patterns
AdvertisementSchema.index({ creator: 1, status: 1, createdAt: -1 });
AdvertisementSchema.index({ status: 1, placement: 1, endDate: 1 });
AdvertisementSchema.index({ paymentStatus: 1 });
AdvertisementSchema.index({ placement: 1, status: 1, startDate: 1, endDate: 1 });
AdvertisementSchema.index({ "targeting.interests": 1 });
AdvertisementSchema.index({ _legacySystem: 1 });

export const Advertisement = model<IAdvertisement>("Advertisement", AdvertisementSchema);
