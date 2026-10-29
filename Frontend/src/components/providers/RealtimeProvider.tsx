import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { getSocket } from "@/lib/socket-client";
import type { FeedPost } from "@/lib/api-client";

/**
 * Mounted once near the root. Keeps every open tab/page in sync as other users
 * like, comment, post or follow — no polling, no manual refresh needed.
 */
export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    if (!socket) return;

    const patchPost = (postId: string, patch: Partial<FeedPost>) => {
      const entries = queryClient.getQueriesData<any>({ queryKey: ["posts"] });
      for (const [key, data] of entries) {
        if (!data) continue;
        if (Array.isArray(data.pages)) {
          queryClient.setQueryData(key, {
            ...data,
            pages: data.pages.map((page: any) => ({
              ...page,
              posts: page.posts.map((p: FeedPost) => (p._id === postId ? { ...p, ...patch } : p)),
            })),
          });
        } else if (Array.isArray(data.posts)) {
          queryClient.setQueryData(key, {
            ...data,
            posts: data.posts.map((p: FeedPost) => (p._id === postId ? { ...p, ...patch } : p)),
          });
        }
      }
    };

    const onPostUpdated = (payload: {
      postId: string;
      likesCount?: number;
      commentsCount?: number;
    }) => {
      const { postId, ...patch } = payload;
      patchPost(postId, patch);
    };

    const onPostCreated = (post: FeedPost) => {
      // Public posts are broadcast platform-wide; followers/private posts are
      // sent only to the relevant user rooms. Insert into every matching cached
      // user-scoped feed (setQueryData with a partial key would miss these keys).
      if (post.status && post.status !== "published") return;
      if (post.moderation && post.moderation.status !== "approved") return;

      const insertIntoFeeds = (keyPrefix: readonly unknown[]) => {
        for (const [key, cached] of queryClient.getQueriesData<any>({ queryKey: keyPrefix })) {
          if (!cached || !Array.isArray(cached.pages) || cached.pages.length === 0) continue;
          if (cached.pages.some((page: any) => page.posts?.some((p: FeedPost) => p._id === post._id))) continue;
          queryClient.setQueryData<any>(key, (data: any) => {
            if (!data || !Array.isArray(data.pages) || data.pages.length === 0) return data;
            if (data.pages.some((page: any) => page.posts?.some((p: FeedPost) => p._id === post._id))) return data;
            const [first, ...rest] = data.pages;
            return {
              ...data,
              pages: [
                { ...first, posts: [post, ...(first.posts ?? [])] },
                ...rest.map((page: any) => ({
                  ...page,
                  posts: (page.posts ?? []).filter((p: FeedPost) => p._id !== post._id),
                })),
              ],
            };
          });
        }
      };

      insertIntoFeeds(["posts", "feed"]);
      if (post.audience === "public") insertIntoFeeds(["posts", "explore"]);
      if (post.author?.username) {
        queryClient.invalidateQueries({ queryKey: ["profile", post.author.username] });
        queryClient.invalidateQueries({ queryKey: ["posts", `user:${post.author.username}`] });
      }
    };

    const onCommentCreated = (payload: { postId: string }) => {
      queryClient.invalidateQueries({ queryKey: ["comments", payload.postId] });
    };

    const onFollowersChanged = (payload: { username: string; followersCount: number }) => {
      queryClient.setQueryData<any>(["profile", payload.username], (prev: any) =>
        prev ? { ...prev, user: { ...prev.user, followersCount: payload.followersCount } } : prev,
      );
    };

    const onNotification = () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    };

    socket.on("post:updated", onPostUpdated);
    socket.on("post:created", onPostCreated);
    socket.on("comment:created", onCommentCreated);
    socket.on("user:followers-changed", onFollowersChanged);
    socket.on("notification:new", onNotification);

    return () => {
      socket.off("post:updated", onPostUpdated);
      socket.off("post:created", onPostCreated);
      socket.off("comment:created", onCommentCreated);
      socket.off("user:followers-changed", onFollowersChanged);
      socket.off("notification:new", onNotification);
    };
  }, [user, queryClient]);

  return <>{children}</>;
}
