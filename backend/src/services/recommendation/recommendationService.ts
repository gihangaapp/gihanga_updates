import { UserInterestProfile } from "../../models/UserInterestProfile";
import { Post } from "../../models/Post";
import { Block } from "../../models/Block";
import { NegativeFeedback } from "../../models/NegativeFeedback";
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

export async function getForYouFeed(
  userId?: string,
  limit = 12,
  cursor?: string
): Promise<FeedResponse> {
  // The home feed must not depend on a small, capped recommendation pool:
  // every published public post is eligible even when its author is not followed.
  // Followers-only posts remain visible to followers, while private posts are
  // visible only to their author. Reels keep their dedicated feed.
  const safeLimit = Math.min(Math.max(Number(limit) || 12, 1), 50);
  const visibleTo: any[] = [{ audience: "public" }];
  let followingIds: string[] = [];
  const excludedAuthors = new Set<string>();
  const excludedPostIds = new Set<string>();

  if (userId) {
    const [follows, blocks, feedback] = await Promise.all([
      Follow.find({ follower: userId }).select("following").lean(),
      Block.find({ $or: [{ blocker: userId }, { blocked: userId }] })
        .select("blocker blocked")
        .lean(),
      NegativeFeedback.find({ user: userId }).select("content creator").lean(),
    ]);

    followingIds = follows.map((entry) => String(entry.following));
    if (followingIds.length) {
      visibleTo.push({ audience: "followers", author: { $in: followingIds } });
    }
    // Include the current user's own published posts regardless of audience.
    visibleTo.push({ author: userId });

    for (const block of blocks) {
      const blocker = String(block.blocker);
      const blocked = String(block.blocked);
      // Exclude the other participant, but do not accidentally hide the viewer's
      // own posts merely because the viewer has blocked someone.
      if (blocker === userId) excludedAuthors.add(blocked);
      else if (blocked === userId) excludedAuthors.add(blocker);
    }
    for (const item of feedback) {
      if (item.creator) excludedAuthors.add(String(item.creator));
      if (item.content) excludedPostIds.add(String(item.content));
    }
  }

  const conditions: Record<string, any>[] = [
    { status: "published" },
    { kind: { $ne: "reel" } },
    { $or: visibleTo },
  ];
  if (excludedAuthors.size) conditions.push({ author: { $nin: [...excludedAuthors] } });
  if (excludedPostIds.size) conditions.push({ _id: { $nin: [...excludedPostIds] } });

  // Cursors are post IDs. Use both createdAt and _id for deterministic paging
  // when multiple posts were created in the same millisecond.
  if (cursor && /^[a-f0-9]{24}$/i.test(cursor)) {
    const cursorPost = await Post.findById(cursor).select("_id createdAt").lean();
    if (cursorPost) {
      conditions.push({
        $or: [
          { createdAt: { $lt: cursorPost.createdAt } },
          { createdAt: cursorPost.createdAt, _id: { $lt: cursorPost._id } },
        ],
      });
    }
  }

  const fetched = await Post.find({ $and: conditions })
    .sort({ createdAt: -1, _id: -1 })
    .limit(safeLimit + 1)
    .populate("author", "name username avatarHue avatarUrl isCreator verified isLive");

  const hasMore = fetched.length > safeLimit;
  const page = fetched.slice(0, safeLimit);
  return {
    posts: await withViewerFlags(page, userId),
    nextCursor: hasMore && page.length ? String(page[page.length - 1]._id) : null,
    hasMore,
    algorithmVersion: "v1",
    isFollowingAnyone: followingIds.length > 0,
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
