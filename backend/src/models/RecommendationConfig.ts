import { Schema, model, Document } from "mongoose";

export interface IRecommendationConfig extends Document {
  key: string; // e.g. "global_v1"
  weights: {
    WATCH_25: number;
    WATCH_50: number;
    WATCH_75: number;
    WATCH_COMPLETE: number;
    REWATCH: number;
    LIKE: number;
    COMMENT: number;
    SHARE: number;
    SAVE: number;
    FOLLOW_CREATOR: number;
    OPEN_CREATOR: number;
    SKIP: number;
    NOT_INTERESTED: number;
    REPORT: number;
  };
  decayHalfLifeHours: number;
  explorationRate: number; // 0 to 1 (e.g. 0.15 = 15% discovery)
  diversityMaxAuthorConsecutive: number;
  diversityMaxTagConsecutive: number;
  seenPenaltyScore: number;
  algorithmVersion: string;
  updatedAt: Date;
}

const RecommendationConfigSchema = new Schema<IRecommendationConfig>(
  {
    key: { type: String, required: true, unique: true, default: "global_v1" },
    weights: {
      WATCH_25: { type: Number, default: 1 },
      WATCH_50: { type: Number, default: 2 },
      WATCH_75: { type: Number, default: 3 },
      WATCH_COMPLETE: { type: Number, default: 4 },
      REWATCH: { type: Number, default: 5 },
      LIKE: { type: Number, default: 4 },
      COMMENT: { type: Number, default: 5 },
      SHARE: { type: Number, default: 6 },
      SAVE: { type: Number, default: 6 },
      FOLLOW_CREATOR: { type: Number, default: 7 },
      OPEN_CREATOR: { type: Number, default: 2 },
      SKIP: { type: Number, default: -3 },
      NOT_INTERESTED: { type: Number, default: -10 },
      REPORT: { type: Number, default: -20 },
    },
    decayHalfLifeHours: { type: Number, default: 48 },
    explorationRate: { type: Number, default: 0.15 },
    diversityMaxAuthorConsecutive: { type: Number, default: 2 },
    diversityMaxTagConsecutive: { type: Number, default: 2 },
    seenPenaltyScore: { type: Number, default: 50 },
    algorithmVersion: { type: String, default: "v1" },
  },
  { timestamps: true }
);

export const RecommendationConfig = model<IRecommendationConfig>(
  "RecommendationConfig",
  RecommendationConfigSchema
);

/** Default fallback configuration if database record is not present. */
export const DEFAULT_REC_CONFIG = {
  weights: {
    WATCH_25: 1,
    WATCH_50: 2,
    WATCH_75: 3,
    WATCH_COMPLETE: 4,
    REWATCH: 5,
    LIKE: 4,
    COMMENT: 5,
    SHARE: 6,
    SAVE: 6,
    FOLLOW_CREATOR: 7,
    OPEN_CREATOR: 2,
    SKIP: -3,
    NOT_INTERESTED: -10,
    REPORT: -20,
  },
  decayHalfLifeHours: 48,
  explorationRate: 0.15,
  diversityMaxAuthorConsecutive: 2,
  diversityMaxTagConsecutive: 2,
  seenPenaltyScore: 50,
  algorithmVersion: "v1",
};
