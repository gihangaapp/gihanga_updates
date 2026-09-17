import { UserInterestProfile } from "../../models/UserInterestProfile";
import { Follow } from "../../models/Follow";
import { Like } from "../../models/Like";
import { Bookmark } from "../../models/Bookmark";
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
}

async function withViewerFlags(posts: any[], viewerId?: string) {
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

export async function getForYouFeed(
  userId?: string,
  limit = 12,
  cursor?: string
): Promise<FeedResponse> {
  const profile = userId ? await UserInterestProfile.findOne({ user: userId }) : null;

  // Gather candidate pools
  const [followingCands, interestCands, trendingCands, freshCands, exploreCands] =
    await Promise.all([
      userId ? getFollowingCandidates(userId, "post") : [],
      getInterestCandidates(profile, "post"),
      getTrendingCandidates("post"),
      getFreshCandidates("post"),
      getExplorationCandidates(userId, "post"),
    ]);

  const allCandidates: CandidateSource[] = [
    ...followingCands,
    ...interestCands,
    ...trendingCands,
    ...freshCands,
    ...exploreCands,
  ];

  // Apply Eligibility & Seen Filtering
  const { eligible, seenMap } = await filterEligibleCandidates(allCandidates, userId);

  // Rank Candidates
  const ranked = rankCandidates(eligible, profile, seenMap);

  // Apply Diversity Rules
  const diversified = applyDiversity(ranked);

  // Cursor Pagination
  let finalSlice = diversified;
  if (cursor) {
    const cursorIdx = finalSlice.findIndex((c) => String(c.post._id) === cursor);
    if (cursorIdx >= 0) {
      finalSlice = finalSlice.slice(cursorIdx + 1);
    }
  }

  const paged = finalSlice.slice(0, limit);
  const rawPosts = paged.map((c) => c.post);
  const postsWithFlags = await withViewerFlags(rawPosts, userId);

  const nextCursor =
    paged.length === limit ? String(paged[paged.length - 1].post._id) : null;

  return {
    posts: postsWithFlags,
    nextCursor,
    hasMore: Boolean(nextCursor),
    algorithmVersion: "v1",
  };
}

export async function getReelsFeed(
  userId?: string,
  limit = 10,
  cursor?: string
): Promise<FeedResponse> {
  const profile = userId ? await UserInterestProfile.findOne({ user: userId }) : null;

  const [followingCands, interestCands, trendingCands, freshCands, exploreCands] =
    await Promise.all([
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
  const ranked = rankCandidates(eligible, profile, seenMap);
  const diversified = applyDiversity(ranked);

  let finalSlice = diversified;
  if (cursor) {
    const cursorIdx = finalSlice.findIndex((c) => String(c.post._id) === cursor);
    if (cursorIdx >= 0) {
      finalSlice = finalSlice.slice(cursorIdx + 1);
    }
  }

  const paged = finalSlice.slice(0, limit);
  const rawPosts = paged.map((c) => c.post);
  const postsWithFlags = await withViewerFlags(rawPosts, userId);

  const nextCursor =
    paged.length === limit ? String(paged[paged.length - 1].post._id) : null;

  return {
    posts: postsWithFlags,
    nextCursor,
    hasMore: Boolean(nextCursor),
    algorithmVersion: "v1",
  };
}

export async function getExploreFeed(
  userId?: string,
  limit = 12,
  cursor?: string
): Promise<FeedResponse> {
  const profile = userId ? await UserInterestProfile.findOne({ user: userId }) : null;

  const [trendingCands, freshCands, exploreCands] = await Promise.all([
    getTrendingCandidates("post"),
    getFreshCandidates("post"),
    getExplorationCandidates(userId, "post"),
  ]);

  const allCandidates: CandidateSource[] = [
    ...exploreCands,
    ...trendingCands,
    ...freshCands,
  ];

  const { eligible, seenMap } = await filterEligibleCandidates(allCandidates, userId);
  const ranked = rankCandidates(eligible, profile, seenMap);
  const diversified = applyDiversity(ranked);

  let finalSlice = diversified;
  if (cursor) {
    const cursorIdx = finalSlice.findIndex((c) => String(c.post._id) === cursor);
    if (cursorIdx >= 0) {
      finalSlice = finalSlice.slice(cursorIdx + 1);
    }
  }

  const paged = finalSlice.slice(0, limit);
  const rawPosts = paged.map((c) => c.post);
  const postsWithFlags = await withViewerFlags(rawPosts, userId);

  const nextCursor =
    paged.length === limit ? String(paged[paged.length - 1].post._id) : null;

  return {
    posts: postsWithFlags,
    nextCursor,
    hasMore: Boolean(nextCursor),
    algorithmVersion: "v1",
  };
}

export async function getTrendingFeed(
  userId?: string,
  limit = 12,
  cursor?: string
): Promise<FeedResponse> {
  const trendingCands = await getTrendingCandidates("post");

  const { eligible, seenMap } = await filterEligibleCandidates(trendingCands, userId);
  const ranked = rankCandidates(eligible, null, seenMap);
  const diversified = applyDiversity(ranked);

  let finalSlice = diversified;
  if (cursor) {
    const cursorIdx = finalSlice.findIndex((c) => String(c.post._id) === cursor);
    if (cursorIdx >= 0) {
      finalSlice = finalSlice.slice(cursorIdx + 1);
    }
  }

  const paged = finalSlice.slice(0, limit);
  const rawPosts = paged.map((c) => c.post);
  const postsWithFlags = await withViewerFlags(rawPosts, userId);

  const nextCursor =
    paged.length === limit ? String(paged[paged.length - 1].post._id) : null;

  return {
    posts: postsWithFlags,
    nextCursor,
    hasMore: Boolean(nextCursor),
    algorithmVersion: "v1",
  };
}
