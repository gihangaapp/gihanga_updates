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
    mutationFn: (input: {
      mediaUrl: string;
      mediaKey?: string | undefined;
      mediaType: "image" | "video";
      caption?: string | undefined;
      duration?: number | undefined;
      audience?: string;
    }) => api.post("/stories", input),
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

export function useReplyToStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ storyId, message }: { storyId: string; message: string }) =>
      api.post<{ success: boolean; message: string }>(`/stories/${storyId}/reply`, { message }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useDeleteStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (storyId: string) => api.delete(`/stories/${storyId}`),
    onMutate: async (storyId: string) => {
      await queryClient.cancelQueries({ queryKey: ["stories"] });
      const previous = queryClient.getQueryData<{ stories: StoryGroup[] }>(["stories"]);
      if (previous?.stories) {
        queryClient.setQueryData<{ stories: StoryGroup[] }>(["stories"], {
          stories: previous.stories
            .map((group) => ({
              ...group,
              items: group.items.filter((item) => item._id !== storyId),
            }))
            .filter((group) => group.items.length > 0),
        });
      }
      return { previous };
    },
    onError: (_err, _storyId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["stories"], context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["stories"] }),
  });
}
