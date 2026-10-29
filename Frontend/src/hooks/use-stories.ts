import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, StoryGroup } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

export function useStories() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["stories"],
    queryFn: ({ signal }) => api.get<{ stories: StoryGroup[] }>("/stories", false, signal),
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
    // Viewing a story is a tiny write. Patch the local story rail immediately
    // instead of refetching the entire rail after every viewed item.
    onMutate: (storyId: string) => {
      const previous = queryClient.getQueryData<{ stories: StoryGroup[] }>(["stories"]);
      if (previous?.stories) {
        queryClient.setQueryData<{ stories: StoryGroup[] }>(["stories"], {
          stories: previous.stories.map((group) => {
            const items = group.items.map((item) =>
              item._id === storyId ? { ...item, viewedByMe: true } : item,
            );
            return { ...group, items, seen: items.every((item) => item.viewedByMe) };
          }),
        });
      }
      return { previous };
    },
    onError: (_err, _storyId, context) => {
      if (context?.previous) queryClient.setQueryData(["stories"], context.previous);
    },
  });
}

export function useReplyToStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ storyId, message }: { storyId: string; message: string }) =>
      api.post<{ success: boolean; message: string }>(`/stories/${storyId}/reply`, { message }),
    onSuccess: (_data, vars) =>
      queryClient.invalidateQueries({ queryKey: ["story-replies", vars.storyId] }),
  });
}

export interface StoryReply {
  _id: string;
  text: string;
  createdAt: string;
  user: {
    _id: string;
    name: string;
    username: string;
    avatarHue: number;
    avatarUrl: string | null;
    verified: boolean;
    isCreator: boolean;
  } | null;
}

/** Comment thread for one story (stored as story_reply notifications). */
export function useStoryReplies(storyId: string | null | undefined) {
  return useQuery({
    queryKey: ["story-replies", storyId],
    queryFn: () => api.get<{ replies: StoryReply[] }>(`/stories/${storyId}/replies`),
    enabled: Boolean(storyId),
  });
}

export function useDeleteStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (storyId: string) => api.delete(`/stories/${storyId}`),
    onMutate: (storyId: string) => {
      const previous = queryClient.getQueryData<{ stories: StoryGroup[] }>(["stories"]);
      void queryClient.cancelQueries({ queryKey: ["stories"] }, { revert: false, silent: true });
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
