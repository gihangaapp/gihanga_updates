import { Schema, model, Document, Types } from "mongoose";

/**
 * Achievement Badge System — data structures.
 *
 * Two independent categories:
 *   - "stars"     → Gihanga Stars  (follower milestones)
 *   - "diamonds"  → Gihanga Diamonds (cumulative eligible-view milestones)
 *
 * AchievementDefinition is the configured set of badges (admin-editable via
 * the /system/achievements/definitions endpoints). UserAchievement is the
 * per-user award record. The unique compound index on (user, achievementId)
 * guarantees a badge can only be awarded once per user — concurrent requests
 * and retried background jobs cannot create duplicates.
 */

export type AchievementCategory = "stars" | "diamonds";
export type AchievementMetric = "followers" | "views";

export interface IAchievementDefinition extends Document {
  /** Stable identifier, e.g. "star_red", "diamond_blue". Never changes. */
  achievementId: string;
  name: string;
  category: AchievementCategory;
  metric: AchievementMetric;
  description: string;
  /** Numeric threshold (followers or cumulative views). */
  threshold: number;
  /** Icon identifier the frontend resolves to an SVG. */
  icon: "star" | "diamond";
  /** Display color token: red | gold | blue | green (mapped to theme vars client-side). */
  color: "red" | "gold" | "blue" | "green";
  enabled: boolean;
  /** Bumped when an admin edits the threshold, so award records carry the version they were granted under. */
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const AchievementDefinitionSchema = new Schema<IAchievementDefinition>(
  {
    achievementId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true, maxlength: 64 },
    category: { type: String, enum: ["stars", "diamonds"], required: true },
    metric: { type: String, enum: ["followers", "views"], required: true },
    description: { type: String, default: "", maxlength: 280 },
    threshold: { type: Number, required: true, min: 1 },
    icon: { type: String, enum: ["star", "diamond"], required: true },
    color: { type: String, enum: ["red", "gold", "blue", "green"], required: true },
    enabled: { type: Boolean, default: true },
    version: { type: Number, default: 1 },
  },
  { timestamps: true },
);

AchievementDefinitionSchema.index({ category: 1, threshold: 1 });

export const AchievementDefinition = model<IAchievementDefinition>(
  "AchievementDefinition",
  AchievementDefinitionSchema,
);

export interface IUserAchievement extends Document {
  user: Types.ObjectId;
  achievementId: string;
  /** The metric value at the moment this was awarded — audit/progress context. */
  metricSnapshot: number;
  /** Definition version the award was granted under. */
  definitionVersion: number;
  awardedAt: Date;
  /**
   * Set when a follower-based badge is no longer currently earned (the
   * eligible follower count dropped below the threshold). View-based badges
   * are lifetime and never revoked. The historical award record is preserved
   * for audit — only `revokedAt` is set/cleared, the row is never deleted.
   */
  revokedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserAchievementSchema = new Schema<IUserAchievement>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    achievementId: { type: String, required: true },
    metricSnapshot: { type: Number, default: 0 },
    definitionVersion: { type: Number, default: 1 },
    awardedAt: { type: Date, default: Date.now },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

/**
 * One award per user per achievement — database-enforced. Concurrent requests
 * that race to award the same badge hit a duplicate-key error on the second;
 * the service treats E11000 as "already awarded" and returns the existing
 * record, so the operation is idempotent.
 */
UserAchievementSchema.index({ user: 1, achievementId: 1 }, { unique: true });
UserAchievementSchema.index({ user: 1, revokedAt: 1 });

export const UserAchievement = model<IUserAchievement>("UserAchievement", UserAchievementSchema);
