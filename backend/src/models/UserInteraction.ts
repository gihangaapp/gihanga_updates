import { Schema, model, Document, Types } from "mongoose";

export type EventType =
  | "post_impression"
  | "post_open"
  | "post_view"
  | "post_like"
  | "post_unlike"
  | "post_comment"
  | "post_share"
  | "post_save"
  | "post_unsave"
  | "post_expand_caption"
  | "post_open_creator"
  | "post_follow_creator"
  | "post_not_interested"
  | "post_report"
  | "reel_impression"
  | "reel_start"
  | "reel_pause"
  | "reel_resume"
  | "reel_25_percent"
  | "reel_50_percent"
  | "reel_75_percent"
  | "reel_100_percent"
  | "reel_skip"
  | "reel_rewatch"
  | "reel_like"
  | "reel_unlike"
  | "reel_comment"
  | "reel_share"
  | "reel_save"
  | "reel_unsave"
  | "reel_follow_creator"
  | "reel_open_creator"
  | "reel_not_interested"
  | "reel_report"
  | "story_impression"
  | "story_open"
  | "story_complete"
  | "story_skip"
  | "story_previous"
  | "story_reply"
  | "story_reaction"
  | "story_share"
  | "story_open_creator"
  | "story_mute_creator"
  | "search"
  | "search_result_open";

export interface IUserInteraction extends Document {
  user?: Types.ObjectId;
  sessionId?: string;
  event: EventType;
  targetKind: "post" | "reel" | "story" | "user" | "tag";
  targetId: Types.ObjectId;
  creatorId?: Types.ObjectId;
  watchDuration?: number;
  contentDuration?: number;
  watchPercentage?: number;
  completed?: boolean;
  rewatched?: boolean;
  skipped?: boolean;
  tags?: string[];
  category?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const UserInteractionSchema = new Schema<IUserInteraction>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", index: true },
    sessionId: { type: String },
    event: { type: String, required: true, index: true },
    targetKind: { type: String, enum: ["post", "reel", "story", "user", "tag"], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true, index: true },
    creatorId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    watchDuration: { type: Number, default: 0 },
    contentDuration: { type: Number, default: 0 },
    watchPercentage: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    rewatched: { type: Boolean, default: false },
    skipped: { type: Boolean, default: false },
    tags: [{ type: String, lowercase: true }],
    category: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

UserInteractionSchema.index({ user: 1, createdAt: -1 });
UserInteractionSchema.index({ targetId: 1, createdAt: -1 });
UserInteractionSchema.index({ user: 1, targetId: 1 });

export const UserInteraction = model<IUserInteraction>("UserInteraction", UserInteractionSchema);
