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

    const onPostUpdated = (payload: { postId: string; likesCount?: number; commentsCount?: number }) => {
      const { postId, ...patch } = payload;
      patchPost(postId, patch);
    };

    const onPostCreated = (post: FeedPost) => {
      // Only the live-viewed feeds get the new post prepended — explore/reels/tag pages
      // the user isn't currently looking at will simply pick it up fresh on next visit.
      for (const key of [["posts", "explore"], ["posts", "feed"]] as const) {
        queryClient.setQueryData<any>(key, (data: any) => {
          if (!data || !Array.isArray(data.pages) || data.pages.length === 0) return data;
          if (data.pages[0].posts.some((p: FeedPost) => p._id === post._id)) return data;
          const [first, ...rest] = data.pages;
          return { ...data, pages: [{ ...first, posts: [post, ...first.posts] }, ...rest] };
        });
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
