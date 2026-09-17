import { Types } from "mongoose";
import { Post, IPost } from "../../models/Post";
import { Follow } from "../../models/Follow";
import { IUserInterestProfile } from "../../models/UserInterestProfile";

export interface CandidateSource {
  source: "following" | "interest" | "trending" | "similar" | "fresh" | "exploration";
  post: IPost;
}

export async function getFollowingCandidates(
  userId: string,
  kindFilter?: "reel" | "post"
): Promise<CandidateSource[]> {
  const follows = await Follow.find({ follower: userId }).select("following").lean();
  if (follows.length === 0) return [];
  const authorIds = follows.map((f) => f.following);

  const query: any = {
    author: { $in: authorIds },
    status: "published",
    audience: { $in: ["public", "followers"] },
  };
  if (kindFilter === "reel") query.kind = "reel";
  else if (kindFilter === "post") query.kind = { $ne: "reel" };

  const posts = await Post.find(query)
    .sort({ createdAt: -1 })
    .limit(40)
    .populate("author", "name username avatarHue avatarUrl isCreator verified isLive");

  return posts.map((post) => ({ source: "following", post }));
}

export async function getInterestCandidates(
  profile: IUserInterestProfile | null,
  kindFilter?: "reel" | "post"
): Promise<CandidateSource[]> {
  if (!profile || !profile.tagWeights) return [];

  let topTags: string[] = [];
  try {
    if (profile.tagWeights instanceof Map) {
      topTags = Array.from(profile.tagWeights.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag]) => tag);
    } else if (typeof profile.tagWeights === "object") {
      topTags = Object.entries(profile.tagWeights)
        .sort((a: any, b: any) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag]) => tag);
    }
  } catch {
    topTags = [];
  }

  if (topTags.length === 0) return [];

  const query: any = {
    tags: { $in: topTags },
    status: "published",
    audience: "public",
  };
  if (kindFilter === "reel") query.kind = "reel";
  else if (kindFilter === "post") query.kind = { $ne: "reel" };

  const posts = await Post.find(query)
    .sort({ createdAt: -1 })
    .limit(40)
    .populate("author", "name username avatarHue avatarUrl isCreator verified isLive");

  return posts.map((post) => ({ source: "interest", post }));
}

export async function getTrendingCandidates(
  kindFilter?: "reel" | "post"
): Promise<CandidateSource[]> {
  const query: any = {
    status: "published",
    audience: "public",
  };
  if (kindFilter === "reel") query.kind = "reel";
  else if (kindFilter === "post") query.kind = { $ne: "reel" };

  // Select top posts by views, likes, shares count
  const posts = await Post.find(query)
    .sort({ viewsCount: -1, likesCount: -1, createdAt: -1 })
    .limit(30)
    .populate("author", "name username avatarHue avatarUrl isCreator verified isLive");

  return posts.map((post) => ({ source: "trending", post }));
}

export async function getFreshCandidates(
  kindFilter?: "reel" | "post"
): Promise<CandidateSource[]> {
  const query: any = {
    status: "published",
    audience: "public",
  };
  if (kindFilter === "reel") query.kind = "reel";
  else if (kindFilter === "post") query.kind = { $ne: "reel" };

  const posts = await Post.find(query)
    .sort({ createdAt: -1 })
    .limit(30)
    .populate("author", "name username avatarHue avatarUrl isCreator verified isLive");

  return posts.map((post) => ({ source: "fresh", post }));
}

export async function getExplorationCandidates(
  userId?: string,
  kindFilter?: "reel" | "post"
): Promise<CandidateSource[]> {
  const query: any = {
    status: "published",
    audience: "public",
  };
  if (kindFilter === "reel") query.kind = "reel";
  else if (kindFilter === "post") query.kind = { $ne: "reel" };

  // Fetch slightly older or diverse posts
  const posts = await Post.find(query)
    .sort({ createdAt: -1 })
    .skip(20)
    .limit(20)
    .populate("author", "name username avatarHue avatarUrl isCreator verified isLive");

  return posts.map((post) => ({ source: "exploration", post }));
}
