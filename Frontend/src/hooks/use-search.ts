import { useQuery } from "@tanstack/react-query";
import { api, FeedPost, PublicUser } from "@/lib/api-client";
import { logRecommendationEvent } from "@/hooks/use-recommendations";

interface SearchResponse {
  users: PublicUser[];
  posts: FeedPost[];
  tags: { tag: string; postsCount: number; trend: number }[];
}

export function useSearch(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: async () => {
      await logRecommendationEvent({
        event: "search",
        targetKind: "search",
        metadata: { searchQuery: query.slice(0, 160) },
      });
      return api.get<SearchResponse>(`/search?q=${encodeURIComponent(query)}`);
    },
    enabled: query.trim().length > 0,
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useTrendingTags(limit = 5) {
  return useQuery({
    queryKey: limit === 5 ? ["trending-tags"] : ["trending-tags", limit],
    queryFn: () =>
      api.get<{ tags: { tag: string; postsCount: number; trend: number }[] }>(
        limit === 5 ? "/search/trending" : `/search/trending?limit=${limit}`,
      ),
  });
}

export function useSuggestedUsers() {
  return useQuery({
    queryKey: ["suggested-users"],
    queryFn: () => api.get<{ users: PublicUser[] }>("/users/suggested"),
  });
}
