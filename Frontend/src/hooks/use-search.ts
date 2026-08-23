import { useQuery } from "@tanstack/react-query";
import { api, FeedPost, PublicUser } from "@/lib/api-client";

interface SearchResponse {
  users: PublicUser[];
  posts: FeedPost[];
  tags: { tag: string; postsCount: number; trend: number }[];
}

export function useSearch(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: () => api.get<SearchResponse>(`/search?q=${encodeURIComponent(query)}`),
    enabled: query.trim().length > 0,
  });
}

export function useTrendingTags() {
  return useQuery({
    queryKey: ["trending-tags"],
    queryFn: () => api.get<{ tags: { tag: string; postsCount: number; trend: number }[] }>("/search/trending"),
  });
}

export function useSuggestedUsers() {
  return useQuery({
    queryKey: ["suggested-users"],
    queryFn: () => api.get<{ users: PublicUser[] }>("/users/suggested"),
  });
}
