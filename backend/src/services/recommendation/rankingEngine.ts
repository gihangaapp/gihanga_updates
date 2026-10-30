import { CandidateSource } from "./candidateGenerator";
import { IUserInterestProfile } from "../../models/UserInterestProfile";
import { DEFAULT_REC_CONFIG } from "../../models/RecommendationConfig";

export interface ScoredCandidate extends CandidateSource {
  score: number;
  explanationReason: string;
}

export interface RankingOptions {
  /** Fixed per-feed timestamp/seed. Reused by cursor pages for stable paging. */
  seed?: number;
  /** Search words are a hard relevance signal when ranking search results. */
  searchTerms?: string[];
}

function readWeight(source: unknown, key: string): number {
  if (source instanceof Map) return Number(source.get(key) ?? 0) || 0;
  if (source && typeof source === "object") {
    return Number((source as Record<string, unknown>)[key] ?? 0) || 0;
  }
  return 0;
}

function seededJitter(value: string, seed: number): number {
  let hash = 2166136261;
  const input = `${seed}:${value}`;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 0xffffffff;
}

function textRelevance(post: CandidateSource["post"], terms: string[]): number {
  if (terms.length === 0) return 0;
  const body = String(post.body || "").toLowerCase();
  const tags = Array.isArray(post.tags) ? post.tags.map((tag) => String(tag).toLowerCase()) : [];
  const location = String(post.location || "").toLowerCase();
  const searchable = `${body} ${location} ${tags.join(" ")}`;
  const matched = terms.filter((term) => searchable.includes(term));
  const tagMatches = terms.filter((term) => tags.some((tag) => tag === term || tag.includes(term)));
  const phrase = terms.join(" ");
  return Math.min(24, (matched.length / terms.length) * 16 + tagMatches.length * 2 + (phrase.length > 2 && body.includes(phrase) ? 6 : 0));
}

export function rankCandidates(
  candidates: CandidateSource[],
  profile: IUserInterestProfile | null,
  seenMap: Map<string, number>,
  config = DEFAULT_REC_CONFIG,
  options: RankingOptions = {},
): ScoredCandidate[] {
  // A fixed timestamp keeps page two and later pages on the same ranking snapshot.
  // A newly opened feed gets a new seed and can explore a different near-tie order.
  const now = options.seed ?? Date.now();
  const halfLifeMs = (config.decayHalfLifeHours || 48) * 3600 * 1000;
  const searchTerms = (options.searchTerms ?? []).map((term) => term.toLowerCase()).filter(Boolean);
  const explorationRate = Math.max(0, Math.min(1, config.explorationRate ?? 0.15));

  return candidates
    .map((item) => {
      const post = item.post;
      const postId = String(post._id);
      const authorId = String((post.author as any)?._id ?? post.author);
      const tags = Array.isArray(post.tags) ? post.tags.map((tag) => String(tag).toLowerCase()) : [];
      const ageMs = Math.max(0, now - new Date(post.createdAt).getTime());
      const ageHours = ageMs / 3_600_000;
      const freshness = Math.pow(0.5, ageMs / halfLifeMs);

      let score = 0;
      let reason = "Popular on Gihanga";

      // Relationship and retrieval-source priors are intentionally modest:
      // predicted interest, creator affinity, freshness and engagement refine them.
      switch (item.source) {
        case "following":
          score += 10;
          reason = `From @${(post.author as any)?.username || "creator"} you follow`;
          break;
        case "own":
          score += 9;
          reason = "Your post";
          break;
        case "interest":
          score += 7;
          reason = "Based on your interests";
          break;
        case "search":
          score += 12;
          reason = "Matches your search";
          break;
        case "trending":
          score += 4;
          reason = "Trending right now";
          break;
        case "fresh":
          score += 2;
          reason = "Recently shared";
          break;
        case "exploration":
          score += 0;
          reason = "Suggested for you";
          break;
        default:
          score += 1;
      }

      // Topic affinity uses both hashtags and caption/location language. This
      // provides useful personalization even when creators do not add hashtags.
      if (profile) {
        const searchableContent = `${String(post.body || "")} ${String(post.location || "")} ${tags.join(" ")}`.toLowerCase();
        const candidateTopics = new Set(tags);
        for (const [term] of profile.tagWeights.entries()) {
          const normalized = String(term).toLowerCase();
          if (normalized.length >= 3 && searchableContent.includes(normalized)) candidateTopics.add(normalized);
        }

        let topicScore = 0;
        for (const topic of candidateTopics) {
          const weight = readWeight(profile.tagWeights, topic);
          if (weight !== 0) {
            topicScore += Math.sign(weight) * Math.min(8, Math.log1p(Math.abs(weight)) * 2.1);
          }
        }
        score += Math.max(-18, Math.min(18, topicScore));
        if (topicScore > 1 && tags.length) reason = `Matched topic #${tags[0]}`;
        else if (topicScore > 1) reason = "Matched a topic you engage with";
      }

      // Creator affinity is based on likes, comments, saves, shares and follow actions.
      if (profile) {
        const creatorAffinity = readWeight(profile.creatorAffinities, authorId);
        score += Math.sign(creatorAffinity) * Math.min(18, Math.log1p(Math.abs(creatorAffinity)) * 3);
      }

      // Multi-objective content value with logarithmic scaling so one viral post
      // cannot overwhelm every relevance and freshness signal.
      const likes = Math.max(0, Number(post.likesCount) || 0);
      const comments = Math.max(0, Number(post.commentsCount) || 0);
      const shares = Math.max(0, Number(post.sharesCount) || 0);
      const views = Math.max(0, Number(post.viewsCount) || 0);
      const engagementValue =
        Math.log1p(likes) * 1.5 +
        Math.log1p(comments) * 2.4 +
        Math.log1p(shares) * 3 +
        Math.log1p(views) * 0.55;
      score += Math.min(24, engagementValue);

      // Approximate engagement velocity: recent posts are rewarded for meaningful
      // engagement without turning lifetime counts into the only ranking factor.
      const weightedActions = likes + comments * 2 + shares * 3;
      const velocity = Math.log1p(weightedActions / (1 + ageHours / 12)) * 2.5;
      score += Math.min(10, velocity);

      // Freshness decay, with a 48-hour default half-life from recommendation config.
      score += 24 * freshness;

      // Search relevance remains a primary signal on the Search surface.
      if (searchTerms.length) score += textRelevance(post, searchTerms);

      // Seen posts are softly demoted, not permanently removed. This encourages
      // discovery while allowing useful content to reappear later.
      const seenCount = seenMap.get(postId) || 0;
      if (seenCount > 0) {
        score -= Math.min(25, (config.seenPenaltyScore || 50) * 0.15 * Math.log2(seenCount + 1));
      }

      // Controlled exploration only breaks close scores. It is fixed for a feed
      // visit, so it never disrupts cursor pagination within that visit.
      score += seededJitter(postId, now) * (10 * explorationRate);

      return { ...item, score, explanationReason: reason };
    })
    .sort((a, b) => {
      if (Math.abs(b.score - a.score) > 1e-8) return b.score - a.score;
      const timeDifference = new Date(b.post.createdAt).getTime() - new Date(a.post.createdAt).getTime();
      if (timeDifference !== 0) return timeDifference;
      return String(b.post._id).localeCompare(String(a.post._id));
    });
}
