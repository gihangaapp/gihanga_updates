import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, StoryGroup } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

export function useStories() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["stories"],
    queryFn: () => api.get<{ stories: StoryGroup[] }>("/stories"),
    enabled: Boolean(user),
    refetchInterval: 60_000,
  });
}

export function useCreateStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { mediaUrl: string; mediaKey?: string | undefined; mediaType: "image" | "video"; caption?: string | undefined; duration?: number | undefined }) =>
      api.post("/stories", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["stories"] }),
  });
}

export function useMarkStoryViewed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (storyId: string) => api.post(`/stories/${storyId}/view`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["stories"] }),
  });
}
