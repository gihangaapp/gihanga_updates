import { Types } from "mongoose";
import { UserInteraction, EventType } from "../../models/UserInteraction";
import { UserInterestProfile } from "../../models/UserInterestProfile";
import { ContentView } from "../../models/ContentView";
import { NegativeFeedback, FeedbackReason } from "../../models/NegativeFeedback";
import { Post } from "../../models/Post";
import { DEFAULT_REC_CONFIG } from "../../models/RecommendationConfig";


const CONTENT_STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "been", "but", "by", "can", "check",
  "for", "from", "get", "has", "have", "here", "how", "i", "if", "in", "into", "is",
  "it", "its", "just", "like", "link", "me", "my", "new", "not", "of", "on", "or",
  "our", "out", "post", "please", "see", "share", "that", "the", "their", "them", "then",
  "there", "these", "they", "this", "to", "today", "us", "video", "was", "we", "were",
  "what", "when", "where", "who", "will", "with", "you", "your",
]);

function extractContentTerms(value: string): string[] {
  const counts = new Map<string, number>();
  const terms = value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}#\s-]/gu, " ")
    .split(/[\s-]+/)
    .map((term) => term.replace(/^#/, "").trim())
    .filter((term) => term.length >= 3 && !/^\d+$/.test(term) && !CONTENT_STOP_WORDS.has(term));

  for (const term of terms) counts.set(term, (counts.get(term) || 0) + 1);
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 8)
    .map(([term]) => term);
}

export interface LogEventPayload {
  userId?: string;
  sessionId?: string;
  event: EventType;
  targetKind: "post" | "reel" | "story" | "user" | "tag" | "search";
  targetId?: string;
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
    const validTargetId = Boolean(payload.targetId && Types.ObjectId.isValid(payload.targetId));
    const isSearchEvent = payload.targetKind === "search";
    if (!validTargetId && !isSearchEvent) return;

    // Search terms are useful implicit-interest signals even though a search
    // query is not a MongoDB content document with an ObjectId.
    const searchQuery = String(payload.metadata?.searchQuery ?? "").slice(0, 160);
    const stopWords = new Set([
      "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "how",
      "i", "in", "is", "it", "of", "on", "or", "the", "to", "what", "with",
    ]);
    const queryTags = searchQuery
      .toLowerCase()
      .replace(/[^\p{L}\p{N}#\s-]/gu, " ")
      .split(/[\s-]+/)
      .map((term) => term.replace(/^#/, "").trim())
      .filter((term) => term.length > 1 && !stopWords.has(term))
      .slice(0, 8);
    const suppliedTags = Array.isArray(payload.tags) ? payload.tags.slice(0, 20) : [];

    // 1. Persist the raw interaction so the ranking system can evolve without
    // losing the underlying behavior history.
    await UserInteraction.create({
      user: payload.userId && Types.ObjectId.isValid(payload.userId)
        ? new Types.ObjectId(payload.userId)
        : undefined,
      sessionId: payload.sessionId,
      event: payload.event,
      targetKind: payload.targetKind,
      ...(validTargetId ? { targetId: new Types.ObjectId(payload.targetId!) } : {}),
      creatorId: payload.creatorId && Types.ObjectId.isValid(payload.creatorId)
        ? new Types.ObjectId(payload.creatorId)
        : undefined,
      watchDuration: Math.max(0, Number(payload.watchDuration) || 0),
      contentDuration: Math.max(0, Number(payload.contentDuration) || 0),
      watchPercentage: Math.max(0, Math.min(100, Number(payload.watchPercentage) || 0)),
      completed: Boolean(payload.completed),
      rewatched: Boolean(payload.rewatched),
      skipped: Boolean(payload.skipped),
      tags: queryTags.length ? queryTags : suppliedTags,
      category: payload.category || (isSearchEvent ? "search" : undefined),
      metadata: payload.metadata,
    });

    if (!payload.userId || !Types.ObjectId.isValid(payload.userId)) return;

    // Post/reel impressions also call the existing /posts/:id/view endpoint,
    // which owns the canonical ContentView + viewsCount update. Keep story
    // visibility here because Stories use a separate content lifecycle.
    if (
      payload.targetKind === "story" &&
      ["story_impression", "story_open"].includes(payload.event) &&
      validTargetId
    ) {
      await ContentView.findOneAndUpdate(
        { user: payload.userId, content: payload.targetId },
        {
          $inc: { seenCount: 1 },
          $set: { lastSeenAt: new Date(), kind: "story" },
          $setOnInsert: { firstSeenAt: new Date() },
        },
        { upsert: true },
      );
    }

    // 2. Translate observed actions into weighted preference updates.
    const weights = DEFAULT_REC_CONFIG.weights;
    const eventWeights: Partial<Record<EventType, number>> = {
      post_impression: 0.15,
      post_view: 0.25,
      post_open: 0.5,
      post_like: weights.LIKE,
      post_unlike: -1.5,
      post_comment: weights.COMMENT,
      post_share: weights.SHARE,
      post_save: weights.SAVE,
      post_unsave: -1.5,
      post_expand_caption: 0.8,
      post_open_creator: weights.OPEN_CREATOR,
      post_follow_creator: weights.FOLLOW_CREATOR,
      post_not_interested: weights.NOT_INTERESTED,
      post_report: weights.REPORT,
      reel_impression: 0.2,
      reel_start: 0.25,
      reel_pause: 0,
      reel_resume: 0.2,
      reel_25_percent: weights.WATCH_25,
      reel_50_percent: weights.WATCH_50,
      reel_75_percent: weights.WATCH_75,
      reel_100_percent: weights.WATCH_COMPLETE,
      reel_skip: weights.SKIP,
      reel_rewatch: weights.REWATCH,
      reel_like: weights.LIKE,
      reel_unlike: -1.5,
      reel_comment: weights.COMMENT,
      reel_share: weights.SHARE,
      reel_save: weights.SAVE,
      reel_unsave: -1.5,
      reel_follow_creator: weights.FOLLOW_CREATOR,
      reel_open_creator: weights.OPEN_CREATOR,
      reel_not_interested: weights.NOT_INTERESTED,
      reel_report: weights.REPORT,
      story_impression: 0.15,
      story_open: 0.25,
      story_complete: weights.WATCH_COMPLETE,
      story_skip: weights.SKIP,
      story_previous: -0.5,
      story_reply: weights.COMMENT,
      story_reaction: weights.LIKE,
      story_share: weights.SHARE,
      story_open_creator: weights.OPEN_CREATOR,
      story_mute_creator: weights.SKIP,
      search: 1.5,
      search_result_open: 2.5,
      user_follow: weights.FOLLOW_CREATOR,
      user_unfollow: -2,
    };
    const eventWeight = eventWeights[payload.event] ?? 0;

    // Combine hashtags with lightweight caption/location topics. Hashtags alone
    // are too sparse for a useful feed on platforms where many posts have none.
    let tags = queryTags.length ? queryTags : suppliedTags;
    let creatorId = payload.creatorId;
    if (validTargetId && ["post", "reel"].includes(payload.targetKind)) {
      const post = await Post.findById(payload.targetId).select("tags author body location").lean();
      if (post) {
        if (!creatorId) creatorId = String(post.author);
        const contentTerms = extractContentTerms(`${post.body || ""} ${post.location || ""}`);
        tags = Array.from(new Set([...(post.tags || []), ...tags, ...contentTerms])).slice(0, 20);
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

    // Decay by elapsed time, not by number of events. A burst of likes therefore
    // does not erase older preferences merely because the user was active.
    const now = new Date();
    const previousAt = profile.lastInteractionAt ? new Date(profile.lastInteractionAt).getTime() : now.getTime();
    const elapsedHours = Math.max(0, (now.getTime() - previousAt) / 3_600_000);
    const decay = Math.pow(0.5, elapsedHours / DEFAULT_REC_CONFIG.decayHalfLifeHours);
    const bounded = (value: number) => Math.max(-50, Math.min(100, value));

    for (const tag of tags) {
      const cleanTag = String(tag).replace(/^#/, "").trim().toLowerCase();
      if (!cleanTag) continue;
      const current = Number(profile.tagWeights.get(cleanTag) || 0);
      profile.tagWeights.set(cleanTag, Math.round(bounded(current * decay + eventWeight) * 100) / 100);
    }

    if (creatorId && Types.ObjectId.isValid(creatorId)) {
      const key = String(creatorId);
      const current = Number(profile.creatorAffinities.get(key) || 0);
      profile.creatorAffinities.set(key, Math.round(bounded(current * decay + eventWeight * 0.5) * 100) / 100);
    }

    const category = String(payload.category || (isSearchEvent ? "search" : "")).trim().toLowerCase();
    if (category) {
      const current = Number(profile.categoryWeights.get(category) || 0);
      profile.categoryWeights.set(category, Math.round(bounded(current * decay + eventWeight) * 100) / 100);
    }

    profile.lastInteractionAt = now;
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
