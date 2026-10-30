import { UserInterestProfile } from "../../models/UserInterestProfile";
import { Post } from "../../models/Post";
import { Block } from "../../models/Block";
import { NegativeFeedback } from "../../models/NegativeFeedback";
import { Follow } from "../../models/Follow";
import { Like } from "../../models/Like";
import { Bookmark } from "../../models/Bookmark";
import { RecommendationConfig, DEFAULT_REC_CONFIG } from "../../models/RecommendationConfig";
import {
  getFollowingCandidates,
  getInterestCandidates,
  getTrendingCandidates,
  getFreshCandidates,
  getExplorationCandidates,
  CandidateSource,
} from "./candidateGenerator";
import { filterEligibleCandidates } from "./eligibilityFilter";
import { rankCandidates, ScoredCandidate } from "./rankingEngine";
import { applyDiversity } from "./diversityEngine";

export interface FeedResponse {
  posts: any[];
  nextCursor: string | null;
  hasMore: boolean;
  algorithmVersion: string;
  isFollowingAnyone?: boolean;
}

export async function withViewerFlags(posts: any[], viewerId?: string) {
  if (!viewerId || posts.length === 0) {
    return posts.map((p) => ({
      ...(p.toObject ? p.toObject() : p),
      liked: false,
      bookmarked: false,
      followingAuthor: false,
    }));
  }
  const ids = posts.map((p) => p._id);
  const authorIds = [...new Set(posts.map((p) => String(p.author?._id ?? p.author)))];
  const [likes, bookmarks, follows] = await Promise.all([
    Like.find({ user: viewerId, kind: "post", target: { $in: ids } }).select("target").lean(),
    Bookmark.find({ user: viewerId, post: { $in: ids } }).select("post").lean(),
    Follow.find({ follower: viewerId, following: { $in: authorIds } }).select("following").lean(),
  ]);
  const likedSet = new Set(likes.map((l) => String(l.target)));
  const bookmarkedSet = new Set(bookmarks.map((b) => String(b.post)));
  const followingSet = new Set(follows.map((f) => String(f.following)));

  return posts.map((p) => {
    const raw = p.toObject ? p.toObject() : p;
    return {
      ...raw,
      liked: likedSet.has(String(p._id)),
      bookmarked: bookmarkedSet.has(String(p._id)),
      followingAuthor: followingSet.has(String(p.author?._id ?? p.author)),
    };
  });
}

interface FeedCursorSnapshot {
  id: string;
  score: number;
  seed: number;
}

function decodeFeedCursor(cursor?: string): FeedCursorSnapshot | { id: string; seed: number; legacy: true } | null {
  if (!cursor) return null;
  try {
    const decoded = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as Partial<FeedCursorSnapshot>;
    if (
      decoded &&
      typeof decoded.id === "string" &&
      /^[a-f0-9]{24}$/i.test(decoded.id) &&
      Number.isFinite(decoded.score) &&
      Number.isFinite(decoded.seed)
    ) {
      return { id: decoded.id, score: Number(decoded.score), seed: Number(decoded.seed) };
    }
  } catch {
    // Older clients used the final post ObjectId as a cursor.
  }
  return /^[a-f0-9]{24}$/i.test(cursor)
    ? { id: cursor, seed: Date.now(), legacy: true }
    : null;
}

function encodeFeedCursor(candidate: ScoredCandidate, seed: number): string {
  return Buffer.from(
    JSON.stringify({ id: String(candidate.post._id), score: candidate.score, seed }),
  ).toString("base64url");
}

async function getRankingConfig() {
  try {
    const saved = await RecommendationConfig.findOne({ key: "global_v1" }).lean();
    if (!saved) return DEFAULT_REC_CONFIG;
    return {
      ...DEFAULT_REC_CONFIG,
      ...saved,
      weights: { ...DEFAULT_REC_CONFIG.weights, ...(saved.weights || {}) },
    };
  } catch {
    return DEFAULT_REC_CONFIG;
  }
}

function pageRankedCandidates(
  ranked: ScoredCandidate[],
  limit: number,
  cursor: ReturnType<typeof decodeFeedCursor>,
  seed: number,
) {
  let remaining = ranked;
  if (cursor && "score" in cursor) {
    // Diversity reranking can deliberately move a lower-scoring item ahead of
    // a higher-scoring one. Continue from the actual last item in the final
    // displayed order so pagination does not skip those reordered candidates.
    const position = ranked.findIndex((candidate) => String(candidate.post._id) === cursor.id);
    if (position >= 0) {
      remaining = ranked.slice(position + 1);
    } else {
      // If the cursor item has left the candidate pool since the previous page,
      // fall back to its score boundary rather than restarting the feed.
      remaining = ranked.filter((candidate) =>
        candidate.score < cursor.score ||
        (Math.abs(candidate.score - cursor.score) < 1e-8 && String(candidate.post._id).localeCompare(cursor.id) < 0),
      );
    }
  } else if (cursor && "legacy" in cursor && cursor.legacy) {
    const position = ranked.findIndex((candidate) => String(candidate.post._id) === cursor.id);
    if (position >= 0) remaining = ranked.slice(position + 1);
  }

  const page = remaining.slice(0, limit);
  const hasMore = remaining.length > limit;
  const last = page[page.length - 1];
  return {
    page,
    hasMore,
    nextCursor: hasMore && last ? encodeFeedCursor(last, seed) : null,
  };
}

export async function getForYouFeed(
  userId?: string,
  limit = 12,
  cursor?: string,
): Promise<FeedResponse> {
  const safeLimit = Math.min(Math.max(Number(limit) || 12, 1), 50);
  const decodedCursor = decodeFeedCursor(cursor);
  const seed = decodedCursor?.seed ?? Date.now();
  const [profile, config, followingCandidates, trendingCandidates, freshCandidates, explorationCandidates, followedCount] =
    await Promise.all([
      userId ? UserInterestProfile.findOne({ user: userId }) : null,
      getRankingConfig(),
      userId ? getFollowingCandidates(userId, "post") : [],
      getTrendingCandidates("post"),
      getFreshCandidates("post"),
      getExplorationCandidates(userId, "post"),
      userId ? Follow.countDocuments({ follower: userId }) : 0,
    ]);
  const interestCandidates = userId ? await getInterestCandidates(profile, "post") : [];

  // Multiple retrieval sources make the Home feed a ranked recommendation feed,
  // not a chronological timeline. Deduplication happens in eligibilityFilter.
  const candidates: CandidateSource[] = [
    ...followingCandidates,
    ...interestCandidates,
    ...trendingCandidates,
    ...freshCandidates,
    ...explorationCandidates,
  ];
  const { eligible, seenMap } = await filterEligibleCandidates(candidates, userId);
  const ranked = rankCandidates(eligible, profile, seenMap, config, { seed });
  const diversified = applyDiversity(
    ranked,
    config.diversityMaxAuthorConsecutive,
    config.diversityMaxTagConsecutive,
  );
  const { page, hasMore, nextCursor } = pageRankedCandidates(diversified, safeLimit, decodedCursor, seed);

  return {
    posts: await withViewerFlags(page.map((candidate) => candidate.post), userId),
    nextCursor,
    hasMore,
    algorithmVersion: config.algorithmVersion || "v2-personalized",
    isFollowingAnyone: followedCount > 0,
  };
}

export async function getReelsFeed(
  userId?: string,
  limit = 10,
  cursor?: string,
): Promise<FeedResponse> {
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
  const decodedCursor = decodeFeedCursor(cursor);
  const seed = decodedCursor?.seed ?? Date.now();
  const [profile, config] = await Promise.all([
    userId ? UserInterestProfile.findOne({ user: userId }) : null,
    getRankingConfig(),
  ]);
  const [followingCands, interestCands, trendingCands, freshCands, exploreCands] = await Promise.all([
    userId ? getFollowingCandidates(userId, "reel") : [],
    getInterestCandidates(profile, "reel"),
    getTrendingCandidates("reel"),
    getFreshCandidates("reel"),
    getExplorationCandidates(userId, "reel"),
  ]);

  const allCandidates: CandidateSource[] = [
    ...followingCands,
    ...interestCands,
    ...trendingCands,
    ...freshCands,
    ...exploreCands,
  ];
  const { eligible, seenMap } = await filterEligibleCandidates(allCandidates, userId);
  const ranked = rankCandidates(eligible, profile, seenMap, config, { seed });
  const diversified = applyDiversity(
    ranked,
    config.diversityMaxAuthorConsecutive,
    config.diversityMaxTagConsecutive,
  );
  const { page, hasMore, nextCursor } = pageRankedCandidates(diversified, safeLimit, decodedCursor, seed);
  return {
    posts: await withViewerFlags(page.map((candidate) => candidate.post), userId),
    nextCursor,
    hasMore,
    algorithmVersion: config.algorithmVersion || "v2-personalized",
  };
}

export async function getExploreFeed(
  userId?: string,
  limit = 12,
  cursor?: string,
): Promise<FeedResponse> {
  const safeLimit = Math.min(Math.max(Number(limit) || 12, 1), 50);
  const decodedCursor = decodeFeedCursor(cursor);
  const seed = decodedCursor?.seed ?? Date.now();
  const [profile, config] = await Promise.all([
    userId ? UserInterestProfile.findOne({ user: userId }) : null,
    getRankingConfig(),
  ]);
  const [trendingCands, freshCands, exploreCands, followed] = await Promise.all([
    getTrendingCandidates("post"),
    getFreshCandidates("post"),
    getExplorationCandidates(userId, "post"),
    userId ? Follow.find({ follower: userId }).select("following").lean() : [],
  ]);
  const allCandidates: CandidateSource[] = [...exploreCands, ...trendingCands, ...freshCands];
  const { eligible, seenMap } = await filterEligibleCandidates(allCandidates, userId);

  // Explore prioritizes discovery outside the user's current follow graph.
  const followedIds = new Set(followed.map((item: any) => String(item.following)));
  const discovery = userId
    ? eligible.filter((candidate) => {
        const authorId = String((candidate.post.author as any)?._id ?? candidate.post.author);
        return authorId !== userId && !followedIds.has(authorId);
      })
    : eligible;
  const pool = discovery.length >= safeLimit ? discovery : eligible;

  const ranked = rankCandidates(pool, profile, seenMap, config, { seed });
  const diversified = applyDiversity(
    ranked,
    config.diversityMaxAuthorConsecutive,
    config.diversityMaxTagConsecutive,
  );
  const { page, hasMore, nextCursor } = pageRankedCandidates(diversified, safeLimit, decodedCursor, seed);
  return {
    posts: await withViewerFlags(page.map((candidate) => candidate.post), userId),
    nextCursor,
    hasMore,
    algorithmVersion: config.algorithmVersion || "v2-personalized",
  };
}

export async function getTrendingFeed(
  userId?: string,
  limit = 12,
  cursor?: string,
): Promise<FeedResponse> {
  const safeLimit = Math.min(Math.max(Number(limit) || 12, 1), 50);
  const decodedCursor = decodeFeedCursor(cursor);
  const seed = decodedCursor?.seed ?? Date.now();
  const [profile, config, trendingCands, freshCands] = await Promise.all([
    userId ? UserInterestProfile.findOne({ user: userId }) : null,
    getRankingConfig(),
    getTrendingCandidates("post"),
    getFreshCandidates("post"),
  ]);
  const candidates: CandidateSource[] = [...trendingCands, ...freshCands];
  const { eligible, seenMap } = await filterEligibleCandidates(candidates, userId);
  const ranked = rankCandidates(eligible, profile, seenMap, config, { seed });
  const diversified = applyDiversity(
    ranked,
    config.diversityMaxAuthorConsecutive,
    config.diversityMaxTagConsecutive,
  );
  const { page, hasMore, nextCursor } = pageRankedCandidates(diversified, safeLimit, decodedCursor, seed);
  return {
    posts: await withViewerFlags(page.map((candidate) => candidate.post), userId),
    nextCursor,
    hasMore,
    algorithmVersion: config.algorithmVersion || "v2-personalized",
  };
}

/** Personalized, query-relevant search ranking for public posts. */
export async function rankSearchPosts(posts: any[], userId: string | undefined, query: string) {
  if (!posts.length) return [];
  const [profile, config] = await Promise.all([
    userId ? UserInterestProfile.findOne({ user: userId }) : null,
    getRankingConfig(),
  ]);
  const terms = query
    .toLowerCase()
    .replace(/[^\p{L}\p{N}#\s-]/gu, " ")
    .split(/[\s-]+/)
    .map((term) => term.replace(/^#/, "").trim())
    .filter((term) => term.length > 1)
    .slice(0, 12);
  const candidates: CandidateSource[] = posts
    .filter((post) => post?.author)
    .map((post) => ({ source: "search", post }));
  const { eligible, seenMap } = await filterEligibleCandidates(candidates, userId);
  const ranked = rankCandidates(eligible, profile, seenMap, config, {
    seed: Date.now(),
    searchTerms: terms,
  });
  const diversified = applyDiversity(
    ranked,
    config.diversityMaxAuthorConsecutive,
    config.diversityMaxTagConsecutive,
  );
  return withViewerFlags(diversified.map((candidate) => candidate.post), userId);
}
