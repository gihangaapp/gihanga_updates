import { Schema, model, Document, Types } from "mongoose";
import {
  ModerationDecision,
  ModerationStatus,
  PolicyCategory,
  ProviderOutcome,
  Severity,
  ContentSurface,
} from "../lib/moderation/types";

/**
 * ModerationRecord — ONE assessment of ONE piece of content.
 *
 * Stores normalized, provider-mapped results only:
 *  - which providers ran, their verdicts and LATENCY (observability),
 *  - the combined decision and the policy categories that drove it,
 *  - the media content hash when media was involved (dedupe / audit).
 *
 * PRIVACY: raw provider payloads, full transcripts and media bytes are
 * deliberately NOT persisted. `providerOutcomes[].error` holds only
 * sanitized, secret-free messages (see providers/types.ts errorOutcome).
 *
 * CSAM PROTOCOL: records with criticalEscalation=true are access-restricted
 * — the staff API only exposes them to authenticated staff, and the
 * dedicated escalation endpoint logs every view.
 */
export interface IModerationRecord extends Document {
  contentType: "post" | "story" | "comment" | "live_title" | "live_chat" | "profile" | "avatar" | "media" | "video";
  contentId?: Types.ObjectId;
  author?: Types.ObjectId;
  surface: ContentSurface;

  decision: ModerationDecision;
  status: ModerationStatus;
  severity: Severity;
  criticalEscalation: boolean;

  /** Normalized categories that crossed thresholds. */
  categories: { category: PolicyCategory; score: number; providerLabel: string }[];
  /** Sanitized provider outcomes for the audit trail. */
  providerOutcomes: ProviderOutcome[];

  /** sha256 of media bytes when media was checked (cache + evasion audit). */
  mediaHash?: string;
  mediaIds?: Types.ObjectId[];

  userMessage?: string;
  /** Sanitized failure reason (decision FAILED only). */
  error?: string;

  /** Human review fields. */
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  reviewAction?: "approved" | "rejected" | "escalated";
  reviewNote?: string;
  appealStatus?: "none" | "pending" | "approved" | "rejected";

  decidedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ModerationRecordSchema = new Schema<IModerationRecord>(
  {
    contentType: {
      type: String,
      enum: ["post", "story", "comment", "live_title", "live_chat", "profile", "avatar", "media", "video"],
      required: true,
    },
    contentId: { type: Schema.Types.ObjectId },
    author: { type: Schema.Types.ObjectId, ref: "User" },
    surface: { type: String, required: true },

    decision: {
      type: String,
      enum: ["APPROVED", "REJECTED", "PENDING_REVIEW", "PROCESSING", "FAILED"],
      required: true,
    },
    status: {
      type: String,
      enum: ["processing", "pending_review", "approved", "rejected", "failed"],
      required: true,
    },
    severity: { type: String, enum: ["low", "medium", "high", "critical"], default: "low" },
    criticalEscalation: { type: Boolean, default: false },

    categories: [
      {
        _id: false,
        category: { type: String, required: true },
        score: { type: Number, required: true },
        providerLabel: { type: String, required: true },
      },
    ],
    providerOutcomes: [
      {
        _id: false,
        providerId: { type: String, required: true },
        verdict: { type: String, enum: ["safe", "flagged", "review", "error"], required: true },
        categories: { type: Array, default: [] },
        error: { type: String },
        latencyMs: { type: Number },
        cached: { type: Boolean },
      },
    ],

    mediaHash: { type: String },
    mediaIds: [{ type: Schema.Types.ObjectId, ref: "Media" }],

    userMessage: { type: String },
    error: { type: String },

    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    reviewAction: { type: String, enum: ["approved", "rejected", "escalated"] },
    reviewNote: { type: String },
    appealStatus: { type: String, enum: ["none", "pending", "approved", "rejected"], default: "none" },

    decidedAt: { type: Date },
  },
  { timestamps: true },
);

ModerationRecordSchema.index({ status: 1, severity: -1, createdAt: -1 });
ModerationRecordSchema.index({ contentType: 1, contentId: 1, createdAt: -1 });
ModerationRecordSchema.index({ author: 1, createdAt: -1 });
ModerationRecordSchema.index({ mediaHash: 1, author: 1, createdAt: -1 });
ModerationRecordSchema.index({ criticalEscalation: 1, createdAt: -1 });

export const ModerationRecord = model<IModerationRecord>("ModerationRecord", ModerationRecordSchema);
