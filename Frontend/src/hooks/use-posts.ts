import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, FeedPost } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

interface PostsPage {
  posts: FeedPost[];
  nextCursor: string | null;
  isFollowingAnyone?: boolean;
}

function useCursoredPosts(key: string, endpoint: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: ["posts", key],
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      api.get<PostsPage>(`${endpoint}${pageParam ? `?before=${encodeURIComponent(pageParam)}` : ""}`),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled,
  });
}

export function useFeed() {
  const { user } = useAuth();
  return useCursoredPosts("feed", "/posts/feed", Boolean(user));
}

export function useExplore() {
  return useCursoredPosts("explore", "/posts/explore");
}

export function useReelsFeed() {
  return useCursoredPosts("reels", "/posts/reels");
}

export function useTagPosts(tag: string) {
  const query = useCursoredPosts(`tag:${tag}`, `/posts/tag/${encodeURIComponent(tag)}`, Boolean(tag));
  const meta = useQuery({
    queryKey: ["tag-meta", tag],
    queryFn: () => api.get<{ tag: string; postsCount: number }>(`/posts/tag/${encodeURIComponent(tag)}`),
    enabled: Boolean(tag),
  });
  return { ...query, postsCount: meta.data?.postsCount ?? 0 };
}

export function useUserPosts(username: string) {
  return useCursoredPosts(`user:${username}`, `/posts/user/${encodeURIComponent(username)}`, Boolean(username));
}

export function useLikedPosts(username: string, enabled: boolean) {
  return useQuery({
    queryKey: ["posts", "liked", username],
    queryFn: () => api.get<{ posts: FeedPost[] }>(`/posts/user/${encodeURIComponent(username)}/liked`),
    enabled: enabled && Boolean(username),
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      kind: "photo" | "video" | "reel" | "text";
      body?: string | undefined;
      mediaUrl?: string | undefined;
      mediaKey?: string | undefined;
      mediaMimeType?: string | undefined;
      thumbnailUrl?: string | undefined;
      location?: string | undefined;
      tags?: string[] | undefined;
      audience?: "public" | "followers" | "private" | undefined;
    }) => api.post<{ post: FeedPost }>("/posts", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/posts/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["posts"] }),
  });
}

/** Optimistically toggles like on a post across every cached feed it appears in. */
export function useToggleLike() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => api.post<{ liked: boolean; likesCount: number }>(`/likes/post/${postId}`),
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      const previous = queryClient.getQueriesData({ queryKey: ["posts"] });
      updatePostEverywhere(queryClient, postId, (post) => ({
        ...post,
        liked: !post.liked,
        likesCount: post.liked ? post.likesCount - 1 : post.likesCount + 1,
      }));
      return { previous };
    },
    onError: (_err, _postId, context) => {
      context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
  });
}

export function useToggleBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => api.post<{ bookmarked: boolean }>(`/bookmarks/${postId}`),
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      const previous = queryClient.getQueriesData({ queryKey: ["posts"] });
      updatePostEverywhere(queryClient, postId, (post) => ({ ...post, bookmarked: !post.bookmarked }));
      return { previous };
    },
    onError: (_err, _postId, context) => {
      context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["posts", "bookmarks"] }),
  });
}

export function useBookmarkedPosts() {
  return useQuery({
    queryKey: ["posts", "bookmarks"],
    queryFn: () => api.get<{ posts: FeedPost[] }>("/bookmarks"),
  });
}

/**
 * Patches a post everywhere it's cached, across both shapes we use:
 *  - paginated feeds: { pages: [{ posts: [...] }, ...] }
 *  - flat lists (bookmarks, liked posts): { posts: [...] }
 * Every "posts"-prefixed query used to be assumed paginated, which crashed
 * (and silently killed the whole like/bookmark mutation) the moment a flat
 * list like the bookmarks page had ever been fetched into cache.
 */
function updatePostEverywhere(
  queryClient: ReturnType<typeof useQueryClient>,
  postId: string,
  updater: (post: FeedPost) => FeedPost,
) {
  const entries = queryClient.getQueriesData<any>({ queryKey: ["posts"] });
  for (const [key, data] of entries) {
    if (!data) continue;
    if (Array.isArray(data.pages)) {
      queryClient.setQueryData(key, {
        ...data,
        pages: data.pages.map((page: PostsPage) => ({
          ...page,
          posts: page.posts.map((p) => (p._id === postId ? updater(p) : p)),
        })),
      });
    } else if (Array.isArray(data.posts)) {
      queryClient.setQueryData(key, {
        ...data,
        posts: data.posts.map((p: FeedPost) => (p._id === postId ? updater(p) : p)),
      });
    }
  }
}
