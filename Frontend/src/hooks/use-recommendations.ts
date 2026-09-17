import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, FeedPost } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

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

export interface LogEventPayload {
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

export async function logRecommendationEvent(payload: LogEventPayload): Promise<void> {
  try {
    await api.post("/recommendations/events", payload);
  } catch {
    // Fail silently so tracking never breaks UX
  }
}

export function useSubmitNotInterested() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ contentId, reason }: { contentId: string; reason?: string }) =>
      api.post<{ success: boolean; message: string }>("/recommendations/feedback", {
        contentId,
        reason: reason || "not_interested",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
    },
  });
}

export interface RecommendationFeedResponse {
  posts: FeedPost[];
  nextCursor: string | null;
  hasMore: boolean;
  algorithmVersion: string;
  isFollowingAnyone?: boolean;
}

export function useForYouFeed(limit = 12) {
  const { user } = useAuth();
  return useInfiniteQuery({
    queryKey: ["recommendations", "for-you", user?.id],
    queryFn: ({ pageParam }) =>
      api.get<RecommendationFeedResponse>(
        `/recommendations/for-you?limit=${limit}${pageParam ? `&cursor=${pageParam}` : ""}`
      ),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    staleTime: 30_000,
  });
}

export function useReelsRecFeed(limit = 10) {
  const { user } = useAuth();
  return useInfiniteQuery({
    queryKey: ["recommendations", "reels", user?.id],
    queryFn: ({ pageParam }) =>
      api.get<RecommendationFeedResponse>(
        `/recommendations/reels?limit=${limit}${pageParam ? `&cursor=${pageParam}` : ""}`
      ),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    staleTime: 30_000,
  });
}

export function useExploreRecFeed(limit = 12) {
  const { user } = useAuth();
  return useInfiniteQuery({
    queryKey: ["recommendations", "explore", user?.id],
    queryFn: ({ pageParam }) =>
      api.get<RecommendationFeedResponse>(
        `/recommendations/explore?limit=${limit}${pageParam ? `&cursor=${pageParam}` : ""}`
      ),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    staleTime: 30_000,
  });
}

export function useTrendingRecFeed(limit = 12) {
  const { user } = useAuth();
  return useInfiniteQuery({
    queryKey: ["recommendations", "trending", user?.id],
    queryFn: ({ pageParam }) =>
      api.get<RecommendationFeedResponse>(
        `/recommendations/trending?limit=${limit}${pageParam ? `&cursor=${pageParam}` : ""}`
      ),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    staleTime: 30_000,
  });
}
