import { CandidateSource } from "./candidateGenerator";
import { IUserInterestProfile } from "../../models/UserInterestProfile";
import { DEFAULT_REC_CONFIG } from "../../models/RecommendationConfig";

export interface ScoredCandidate extends CandidateSource {
  score: number;
  explanationReason: string;
}

export function rankCandidates(
  candidates: CandidateSource[],
  profile: IUserInterestProfile | null,
  seenMap: Map<string, number>,
  config = DEFAULT_REC_CONFIG
): ScoredCandidate[] {
  const now = Date.now();
  const halfLifeMs = (config.decayHalfLifeHours || 48) * 3600 * 1000;

  return candidates
    .map((item) => {
      const post = item.post;
      const postId = String(post._id);
      const authorId = String(post.author._id ?? post.author);

      let score = 0;
      let reason = "Popular on Gihanga";

      // 1. Source Base Boost
      if (item.source === "following") {
        score += 30;
        reason = `From @${(post.author as any).username || "creator"} you follow`;
      } else if (item.source === "interest") {
        score += 25;
        reason = "Based on your interests";
      } else if (item.source === "trending") {
        score += 20;
        reason = "Trending right now";
      } else if (item.source === "exploration") {
        score += 10;
        reason = "Suggested for you";
      }

      // 2. Interest Match Score
      if (profile && post.tags.length > 0) {
        let tagMatchScore = 0;
        post.tags.forEach((tag) => {
          const weight = profile.tagWeights.get(tag.toLowerCase()) || 0;
          tagMatchScore += weight;
        });
        if (tagMatchScore > 0) {
          score += tagMatchScore * 3;
          reason = `Matched topic #${post.tags[0]}`;
        }
      }

      // 3. Creator Affinity Score
      if (profile) {
        const creatorAffinity = profile.creatorAffinities.get(authorId) || 0;
        score += creatorAffinity * 4;
      }

      // 4. Engagement Velocity Score
      const totalEngagement =
        post.likesCount * config.weights.LIKE +
        post.commentsCount * config.weights.COMMENT +
        post.sharesCount * config.weights.SHARE +
        post.viewsCount * 0.5;
      score += Math.min(50, totalEngagement);

      // 5. Freshness Exponential Decay
      const ageMs = now - new Date(post.createdAt).getTime();
      const freshnessBoost = 40 * Math.exp(-ageMs / halfLifeMs);
      score += freshnessBoost;

      // 6. Seen Penalty
      const seenCount = seenMap.get(postId) || 0;
      if (seenCount > 0) {
        score -= config.seenPenaltyScore * Math.min(seenCount, 3);
      }

      return {
        ...item,
        score,
        explanationReason: reason,
      };
    })
    .sort((a, b) => b.score - a.score);
}
