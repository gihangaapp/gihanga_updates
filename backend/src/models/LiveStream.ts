import { Schema, model, Document, Types } from "mongoose";

export type LiveStreamStatus = "pending" | "live" | "ended" | "force_ended";

/**
 * Per-stream monetisation of likes/comments/reactions (A5). Enabled by
 * default on staff-hosted streams (moderator/admin/superadmin hosts), off
 * for everyone else; the host can toggle it while live via
 * PATCH /live/:id/settings and staff can adjust the global price defaults
 * via the Setting model (live_paid_interactions_defaults).
 */
export interface PaidInteractionsSettings {
  enabled: boolean;
  likePrice: number;
  commentPrice: number;
  reactionPrice: number;
}

export interface ILiveStream extends Document {
  host: Types.ObjectId;
  title: string;
  description?: string;
  subsOnly: boolean;
  giftsEnabled: boolean;
  paidInteractions: PaidInteractionsSettings;
  viewerCount: number;
  peakViewers: number;
  totalGifts: number;
  reactionsCount: number;
  moderators: Types.ObjectId[];
  mutedUsers: Types.ObjectId[];
  bannedUsers: Types.ObjectId[];
  coHosts: Types.ObjectId[];
  status: LiveStreamStatus;
  startedAt?: Date;
  lastHeartbeatAt?: Date;
  /** Server-enforced end-of-stream deadline (startedAt + cap). */
  maxEndsAt?: Date;
  /** Which TIME_WARNING_MINUTES marks already fired for this stream. */
  timeWarningsSent?: number[];
  endedAt?: Date;
  endedBy?: Types.ObjectId;
  endReason?: string;
  recordingUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LiveStreamSchema = new Schema<ILiveStream>(
  {
    host: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, maxlength: 1000 },
    subsOnly: { type: Boolean, default: false },
    giftsEnabled: { type: Boolean, default: true },
    paidInteractions: {
      enabled: { type: Boolean, default: false },
      likePrice: { type: Number, default: 2, min: 0, max: 100 },
      commentPrice: { type: Number, default: 5, min: 0, max: 500 },
      reactionPrice: { type: Number, default: 1, min: 0, max: 100 },
    },
    viewerCount: { type: Number, default: 0 },
    peakViewers: { type: Number, default: 0 },
    totalGifts: { type: Number, default: 0 },
    reactionsCount: { type: Number, default: 0 },
    moderators: [{ type: Schema.Types.ObjectId, ref: "User" }],
    mutedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    bannedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    coHosts: [{ type: Schema.Types.ObjectId, ref: "User" }],
    status: {
      type: String,
      enum: ["pending", "live", "ended", "force_ended"],
      default: "pending",
    },
    startedAt: { type: Date },
    lastHeartbeatAt: { type: Date },
    maxEndsAt: { type: Date, index: true },
    timeWarningsSent: { type: [Number], default: [] },
    endedAt: { type: Date },
    endedBy: { type: Schema.Types.ObjectId, ref: "User" },
    endReason: { type: String },
    recordingUrl: { type: String },
  },
  { timestamps: true },
);

LiveStreamSchema.index({ host: 1, status: 1 });
LiveStreamSchema.index({ status: 1, startedAt: -1 });

export const LiveStream = model<ILiveStream>("LiveStream", LiveStreamSchema);

export interface ILiveChatMessage extends Document {
  stream: Types.ObjectId;
  sender: Types.ObjectId;
  body: string;
  isGift: boolean;
  giftAmount?: number;
  pinned: boolean;
  flagged: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LiveChatMessageSchema = new Schema<ILiveChatMessage>(
  {
    stream: { type: Schema.Types.ObjectId, ref: "LiveStream", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true, maxlength: 300 },
    isGift: { type: Boolean, default: false },
    giftAmount: { type: Number },
    pinned: { type: Boolean, default: false },
    flagged: { type: Boolean, default: false },
  },
  { timestamps: true },
);

LiveChatMessageSchema.index({ stream: 1, createdAt: 1 });

export const LiveChatMessage = model<ILiveChatMessage>(
  "LiveChatMessage",
  LiveChatMessageSchema,
);
