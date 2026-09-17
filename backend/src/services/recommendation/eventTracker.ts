import { Types } from "mongoose";
import { UserInteraction, EventType } from "../../models/UserInteraction";
import { UserInterestProfile } from "../../models/UserInterestProfile";
import { ContentView } from "../../models/ContentView";
import { NegativeFeedback, FeedbackReason } from "../../models/NegativeFeedback";
import { Post } from "../../models/Post";
import { DEFAULT_REC_CONFIG } from "../../models/RecommendationConfig";

export interface LogEventPayload {
  userId?: string;
  sessionId?: string;
  event: EventType;
  targetKind: "post" | "reel" | "story" | "user" | "tag";
  targetId: string;
  creatorId?: string;
  watchDuration?: number;
  contentDuration?: number;
  watchPercentage?: number;
  completed?: boolean;
  rewatched?: boolean;
  skipped?: boolean;
  tags?: string[];
  category?: string;
  metadata?: Record<string, any>;
}

export async function logInteractionEvent(payload: LogEventPayload): Promise<void> {
  try {
    // 1. Create interaction record
    await UserInteraction.create({
      user: payload.userId ? new Types.ObjectId(payload.userId) : undefined,
      sessionId: payload.sessionId,
      event: payload.event,
      targetKind: payload.targetKind,
      targetId: new Types.ObjectId(payload.targetId),
      creatorId: payload.creatorId ? new Types.ObjectId(payload.creatorId) : undefined,
      watchDuration: payload.watchDuration || 0,
      contentDuration: payload.contentDuration || 0,
      watchPercentage: payload.watchPercentage || 0,
      completed: Boolean(payload.completed),
      rewatched: Boolean(payload.rewatched),
      skipped: Boolean(payload.skipped),
      tags: payload.tags || [],
      category: payload.category,
      metadata: payload.metadata,
    });

    if (!payload.userId) return;

    // 2. Update ContentView tracking
    if (["post", "reel", "story"].includes(payload.targetKind)) {
      await ContentView.findOneAndUpdate(
        { user: payload.userId, content: payload.targetId },
        {
          $inc: { seenCount: 1 },
          $set: { lastSeenAt: new Date(), kind: payload.targetKind },
          $setOnInsert: { firstSeenAt: new Date() },
        },
        { upsert: true }
      );
    }

    // 3. Update User Interest Profile Weights
    let eventWeight = 0;
    const weights = DEFAULT_REC_CONFIG.weights;

    switch (payload.event) {
      case "reel_25_percent": eventWeight = weights.WATCH_25; break;
      case "reel_50_percent": eventWeight = weights.WATCH_50; break;
      case "reel_75_percent": eventWeight = weights.WATCH_75; break;
      case "reel_100_percent": case "story_complete": eventWeight = weights.WATCH_COMPLETE; break;
      case "reel_rewatch": eventWeight = weights.REWATCH; break;
      case "post_like": case "reel_like": eventWeight = weights.LIKE; break;
      case "post_comment": case "reel_comment": case "story_reply": eventWeight = weights.COMMENT; break;
      case "post_share": case "reel_share": case "story_share": eventWeight = weights.SHARE; break;
      case "post_save": case "reel_save": eventWeight = weights.SAVE; break;
      case "post_follow_creator": case "reel_follow_creator": eventWeight = weights.FOLLOW_CREATOR; break;
      case "post_open_creator": case "reel_open_creator": case "story_open_creator": eventWeight = weights.OPEN_CREATOR; break;
      case "reel_skip": case "story_skip": eventWeight = weights.SKIP; break;
      case "post_not_interested": case "reel_not_interested": eventWeight = weights.NOT_INTERESTED; break;
      case "post_report": case "reel_report": eventWeight = weights.REPORT; break;
      default: eventWeight = 1; break;
    }

    // Fetch tags & creator if not provided
    let tags = payload.tags || [];
    let creatorId = payload.creatorId;

    if ((!tags.length || !creatorId) && ["post", "reel"].includes(payload.targetKind)) {
      const post = await Post.findById(payload.targetId).select("tags author").lean();
      if (post) {
        if (!tags.length) tags = post.tags || [];
        if (!creatorId) creatorId = String(post.author);
      }
    }

    let profile = await UserInterestProfile.findOne({ user: payload.userId });
    if (!profile) {
      profile = new UserInterestProfile({
        user: payload.userId,
        tagWeights: new Map(),
        creatorAffinities: new Map(),
        categoryWeights: new Map(),
      });
    }

    // Exponential decay multiplier (0.98) on existing weights + new event weight
    tags.forEach((tag) => {
      const cleanTag = tag.toLowerCase();
      const current = profile!.tagWeights.get(cleanTag) || 0;
      const updated = Math.max(0, current * 0.98 + eventWeight);
      profile!.tagWeights.set(cleanTag, Math.round(updated * 100) / 100);
    });

    if (creatorId) {
      const current = profile.creatorAffinities.get(creatorId) || 0;
      const updated = Math.max(0, current * 0.98 + eventWeight * 0.5);
      profile.creatorAffinities.set(creatorId, Math.round(updated * 100) / 100);
    }

    profile.lastInteractionAt = new Date();
    await profile.save();
  } catch (err) {
    console.error("[EventTracker] Failed to log interaction event:", err);
  }
}

export async function logNegativeFeedback(
  userId: string,
  contentId: string,
  reason: FeedbackReason
): Promise<void> {
  try {
    const post = await Post.findById(contentId).select("author").lean();
    const creatorId = post?.author ? String(post.author) : undefined;

    await NegativeFeedback.findOneAndUpdate(
      { user: userId, content: contentId },
      { user: userId, content: contentId, creator: creatorId, reason },
      { upsert: true, new: true }
    );

    // Also log as interaction event
    await logInteractionEvent({
      userId,
      event: "post_not_interested",
      targetKind: "post",
      targetId: contentId,
      creatorId,
    });
  } catch (err) {
    console.error("[EventTracker] Failed to log negative feedback:", err);
  }
}
