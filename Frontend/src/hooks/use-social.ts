import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, FeedPost, PostComment, PublicUser } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

// ── Comments ────────────────────────────────────────────────────────────────

export function useComments(postId: string) {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: () => api.get<{ comments: PostComment[] }>(`/comments/post/${postId}`),
    enabled: Boolean(postId),
  });
}

export function useCreateComment(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { body: string; parent?: string | undefined }) =>
      api.post<{ comment: PostComment }>(`/comments/post/${postId}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useDeleteComment(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => api.delete(`/comments/${commentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useToggleCommentLike(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => api.post<{ liked: boolean; likesCount: number }>(`/likes/comment/${commentId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["comments", postId] }),
  });
}

// ── Follow ──────────────────────────────────────────────────────────────────

// ── Canonical follow-state set (fixes Follow buttons going stale across the app) ────

export function useFollowingSet() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["following-set"],
    queryFn: () => api.get<{ usernames: string[] }>("/follow/mine"),
    enabled: Boolean(user),
    select: (data) => new Set(data.usernames),
    staleTime: 30_000,
  });
}

export function useFollowUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ username, follow }: { username: string; follow: boolean }) =>
      follow
        ? api.post<{ following: boolean; followersCount: number }>(`/follow/${username}`)
        : api.delete<{ following: boolean; followersCount: number }>(`/follow/${username}`),
    onMutate: async ({ username, follow }) => {
      // The cache holds the RAW { usernames: [...] } shape — `select` only transforms it
      // into a Set at read time, so patching a Set here would silently corrupt the cache
      // (and throw, since a plain object isn't iterable — killing the mutation before the
      // real request even fires). Patch the raw shape instead.
      queryClient.setQueryData<{ usernames: string[] }>(["following-set"], (prev) => {
        const set = new Set(prev?.usernames ?? []);
        if (follow) set.add(username);
        else set.delete(username);
        return { usernames: Array.from(set) };
      });

      // Flip every cached post by this author so per-post state stays consistent too.
      // Some "posts"-prefixed caches are paginated ({ pages: [...] }), others are flat
      // ({ posts: [...] }, e.g. bookmarks/liked) — handle both, or this throws and kills
      // the whole mutation the moment either of those pages has ever been visited.
      const entries = queryClient.getQueriesData<any>({ queryKey: ["posts"] });
      for (const [key, data] of entries) {
        if (!data) continue;
        if (Array.isArray(data.pages)) {
          queryClient.setQueryData(key, {
            ...data,
            pages: data.pages.map((page: any) => ({
              ...page,
              posts: page.posts.map((p: FeedPost) =>
                p.author.username === username ? { ...p, followingAuthor: follow } : p,
              ),
            })),
          });
        } else if (Array.isArray(data.posts)) {
          queryClient.setQueryData(key, {
            ...data,
            posts: data.posts.map((p: FeedPost) => (p.author.username === username ? { ...p, followingAuthor: follow } : p)),
          });
        }
      }
      queryClient.setQueryData<{ user: PublicUser }>(["profile", username], (prev) =>
        prev ? { ...prev, user: { ...prev.user, isFollowing: follow } } : prev,
      );
    },
    onSuccess: (_data, { username }) => {
      queryClient.invalidateQueries({ queryKey: ["profile", username] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["following-set"] });
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
    },
    onError: () => {
      // Canonical set may now disagree with the server — resync instead of guessing.
      queryClient.invalidateQueries({ queryKey: ["following-set"] });
    },
  });
}

export function useFollowers(username: string) {
  return useQuery({
    queryKey: ["followers", username],
    queryFn: () => api.get<{ users: PublicUser[] }>(`/follow/${username}/followers`),
    enabled: Boolean(username),
  });
}

export function useFollowing(username: string) {
  return useQuery({
    queryKey: ["following", username],
    queryFn: () => api.get<{ users: PublicUser[] }>(`/follow/${username}/following`),
    enabled: Boolean(username),
  });
}

// ── Public profile ──────────────────────────────────────────────────────────

export function useUserProfile(username: string) {
  return useQuery({
    queryKey: ["profile", username],
    queryFn: () => api.get<{ user: PublicUser }>(`/users/${username}`),
    enabled: Boolean(username),
  });
}
