import React, { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowUpRight, Loader2, Radio, Sparkles, TrendingUp, UserPlus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { StoryRail } from "@/components/feed/StoryRail";
import { Composer } from "@/components/feed/Composer";
import { PostCard } from "@/components/feed/PostCard";
import { PostSkeleton } from "@/components/feed/PostSkeleton";
import { FeedAdCard } from "@/components/ads/FeedAdCard";
import { useFeed, useExplore, useTrending } from "@/hooks/use-posts";
import { useFeedAds } from "@/hooks/use-ads";
import { useLiveStreams } from "@/hooks/use-live";
import { useAuth } from "@/lib/auth-context";
import { api, type FeedPost } from "@/lib/api-client";
import {
  consumeRecentPostHomeVisit,
  isRecentPostReady,
  readRecentPublishedPost,
  RECENT_POST_PIN_EVENT,
  type RecentPostPin,
} from "@/lib/recent-post-pin";
import { LandingPage } from "./landing";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gihanga Updates — The Creative Platform for Rwanda" },
      {
        name: "description",
        content:
          "Follow creators, watch reels and stories, and keep up with what's happening across Rwanda on Gihanga Updates.",
      },
      { property: "og:title", content: "Gihanga Updates — The Creative Platform for Rwanda" },
      {
        property: "og:description",
        content:
          "Follow creators, watch reels and stories, and keep up with what's happening across Rwanda on Gihanga Updates.",
      },
    ],
  }),
  component: RootIndexPage,
});

function RootIndexPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return <HomeFeed />;
}

const tabs = [
  { id: "foryou", label: "For you", icon: Sparkles },
  { id: "trending", label: "Trending", icon: TrendingUp },
] as const;

/**
 * Mobile/tablet discovery strip (hidden on xl+, where the right rail already
 * shows trending): a swipeable banner carousel that scrolls horizontally with
 * snap, so it never pushes the feed.
 */
function MobileDiscovery() {
  const { data: liveData } = useLiveStreams();
  const liveStreams = liveData?.streams ?? [];

  return (
    <div className="mb-4 space-y-3 xl:hidden">
      <div className="-mx-3 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-px-3 px-3 pb-1 no-scrollbar [touch-action:pan-x_pan-y] sm:-mx-5 sm:px-5">
        {liveStreams.length > 0 && (
          <Link
            to="/live"
            className="surface-card press flex w-[82%] max-w-[360px] shrink-0 snap-start items-center gap-3 p-4"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-danger/10 text-danger">
              <Radio className="size-5 animate-pulse" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-display text-sm font-bold">
                {liveStreams.length} live now
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {liveStreams[0]?.title}
              </span>
            </span>
            <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" />
          </Link>
        )}
        <Link
          to="/explore"
          className="surface-card press hidden w-[82%] max-w-[360px] shrink-0 snap-start items-center gap-3 p-4 sm:flex"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
            <TrendingUp className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-display text-sm font-bold">What's trending</span>
            <span className="block truncate text-xs text-muted-foreground">
              Top topics and fresh media from the community
            </span>
          </span>
          <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" />
        </Link>
        <Link
          to="/ads"
          className="surface-card press hidden w-[82%] max-w-[360px] shrink-0 snap-start items-center gap-3 p-4 sm:flex"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
            <Sparkles className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-display text-sm font-bold">
              Grow with Gihanga Ads
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              Campaigns from 5,000 RWF
            </span>
          </span>
          <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" />
        </Link>
      </div>
    </div>
  );
}

function HomeFeed() {
  const { user } = useAuth();
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("foryou");
  const [recentPostPin, setRecentPostPin] = useState<RecentPostPin | null>(() =>
    user?.id ? readRecentPublishedPost(user.id) : null,
  );
  const pinVisitConsumed = useRef(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const pendingPinId = recentPostPin && !isRecentPostReady(recentPostPin.post)
    ? recentPostPin.postId
    : "";
  // Videos can remain in moderation processing after upload. Poll only that
  // one post (without blocking the feed) so it can be promoted once approved.
  const pendingPinStatus = useQuery({
    queryKey: ["posts", "recent-pin-status", user?.id, pendingPinId],
    queryFn: ({ signal }) =>
      api.get<{ post: FeedPost }>(`/posts/${encodeURIComponent(pendingPinId)}`, false, signal),
    enabled: Boolean(user?.id && pendingPinId),
    staleTime: 0,
    refetchInterval: (query) => {
      const post = query.state.data?.post;
      if (!post) return query.state.error ? false : 5_000;
      if (
        post.status === "published" ||
        ["approved", "rejected", "pending_review", "failed"].includes(post.moderation?.status ?? "")
      ) return false;
      return 5_000;
    },
  });
  const forYou = useFeed();
  const trending = useTrending();
  const explore = useExplore();
  const { data: feedAds = [] } = useFeedAds();

  // Trending uses the dedicated ranked trending feed; if it has nothing yet
  // (fresh platform) fall back to the explore feed ordered by engagement.
  const trendingEmpty =
    !trending.isLoading && (trending.data?.pages.flatMap((p) => p.posts).length ?? 0) === 0;
  const trendingSource = trendingEmpty ? explore : trending;
  const active = tab === "foryou" ? forYou : trendingSource;
  const activeFeedRef = useRef(active);
  activeFeedRef.current = active;
  const activePages = active.data?.pages;
  const posts = useMemo(() => {
    const next = (activePages?.flatMap((p) => p.posts) ?? []).slice();
    if (tab === "trending" && trendingEmpty) {
      next.sort((a, b) => b.likesCount - a.likesCount);
    }
    return next;
  }, [activePages, tab, trendingEmpty]);

  // A successful post gets priority in the home feed for four visits by its
  // author. The counter lives in user-scoped localStorage so it survives reloads;
  // pending moderation posts do not consume a visit until they are approved.
  useEffect(() => {
    if (!user?.id) {
      setRecentPostPin(null);
      return;
    }
    const handlePinUpdate = (event: Event) => {
      const detail = (event as CustomEvent<{ userId?: string }>).detail;
      if (detail?.userId !== user.id) return;
      pinVisitConsumed.current = false;
      setRecentPostPin(readRecentPublishedPost(user.id));
    };
    window.addEventListener(RECENT_POST_PIN_EVENT, handlePinUpdate);
    setRecentPostPin(readRecentPublishedPost(user.id));
    return () => window.removeEventListener(RECENT_POST_PIN_EVENT, handlePinUpdate);
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || !recentPostPin || pinVisitConsumed.current) return;
    const feedVersion = posts.find(
      (post) => post._id === recentPostPin.postId && isRecentPostReady(post),
    );
    const checkedVersion = pendingPinStatus.data?.post?._id === recentPostPin.postId &&
      isRecentPostReady(pendingPinStatus.data.post)
      ? pendingPinStatus.data.post
      : null;
    const postToPin = feedVersion ?? checkedVersion ??
      (isRecentPostReady(recentPostPin.post) ? recentPostPin.post : null);
    if (!postToPin) return;

    pinVisitConsumed.current = true;
    setRecentPostPin(consumeRecentPostHomeVisit(user.id, postToPin));
  }, [user?.id, recentPostPin, posts, pendingPinStatus.data]);

  const displayedPosts = useMemo(() => {
    if (!recentPostPin) return posts;
    const feedVersion = posts.find(
      (post) => post._id === recentPostPin.postId && isRecentPostReady(post),
    );
    const checkedVersion = pendingPinStatus.data?.post?._id === recentPostPin.postId &&
      isRecentPostReady(pendingPinStatus.data.post)
      ? pendingPinStatus.data.post
      : null;
    const pinned = feedVersion ?? checkedVersion ??
      (isRecentPostReady(recentPostPin.post) ? recentPostPin.post : null);
    if (!pinned) return posts;
    return [pinned, ...posts.filter((post) => post._id !== pinned._id)];
  }, [posts, recentPostPin, pendingPinStatus.data]);

  // Prefetch the next page as the user approaches the end of the loaded feed.
  // Re-observe after each successful page so short viewports can keep filling
  // naturally, without exposing a manual "Load more" control.
  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel || !active.hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        const feed = activeFeedRef.current;
        if (feed.hasNextPage && !feed.isFetchingNextPage) {
          void feed.fetchNextPage().catch(() => undefined);
        }
      },
      { root: null, rootMargin: "1400px 0px", threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [active.hasNextPage, active.data?.pages.length, tab, trendingEmpty]);

  const isFollowingAnyone = forYou.data?.pages[0]?.isFollowingAnyone ?? true;

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[620px]">
        <h1 className="sr-only">Gihanga Updates home feed</h1>

        <div className="glass no-scrollbar max-lg:hidden sticky top-16 z-30 -mx-3 mb-4 flex snap-x gap-1 overflow-x-auto overscroll-x-contain rounded-none border-b px-3 py-2 [touch-action:pan-x_pan-y] sm:-mx-5 sm:px-5 lg:static lg:mx-0 lg:rounded-2xl lg:border lg:px-2">
          {tabs.map((t) => {
            const isActive = t.id === tab;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                aria-current={isActive}
                className={cn(
                  "press relative flex min-w-[140px] flex-1 shrink-0 snap-start items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold",
                  isActive ? "text-primary" : "text-muted-foreground hover:bg-muted",
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="feed-tab"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    className="absolute inset-0 rounded-xl bg-primary-soft"
                  />
                )}
                <t.icon className="relative size-4" />
                <span className="relative">{t.label}</span>
              </button>
            );
          })}
        </div>

        <MobileDiscovery />
        <StoryRail />
        <Composer />

        {tab === "foryou" && !isFollowingAnyone && !forYou.isLoading && (
          <div className="surface-card mb-4 flex items-center gap-3 p-4">
            <UserPlus className="size-5 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="text-sm font-semibold">Follow creators to build your feed</p>
              <p className="text-xs text-muted-foreground">
                Your posts still show here — head to Explore to find people to follow.
              </p>
            </div>
          </div>
        )}

        {active.isLoading && displayedPosts.length === 0 ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : displayedPosts.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Nothing here yet — be the first to post something.
          </p>
        ) : (
          <>
            {displayedPosts.map((p, i) => {
              // Inject a sponsored ad every 4th post if ads are available
              const adIndex = Math.floor(i / 4) % (feedAds.length || 1);
              const showAd = (i + 1) % 4 === 0 && feedAds.length > 0 && feedAds[adIndex];
              const currentAd = feedAds[adIndex];

              return (
                <React.Fragment key={p._id}>
                  <PostCard post={p} index={i} />
                  {showAd && currentAd && <FeedAdCard ad={currentAd} />}
                </React.Fragment>
              );
            })}
            {active.isFetchingNextPage && <PostSkeleton />}
            {active.hasNextPage && (
              <div
                ref={loadMoreRef}
                className="flex min-h-14 items-center justify-center gap-2 py-4 text-xs text-muted-foreground"
                aria-live="polite"
                aria-busy={active.isFetchingNextPage}
              >
                {active.isFetchingNextPage ? (
                  <>
                    <Loader2 className="size-4 animate-spin text-primary" />
                    <span>Loading more posts…</span>
                  </>
                ) : active.isFetchNextPageError ? (
                  <button
                    type="button"
                    className="rounded-full px-3 py-1.5 font-semibold text-primary transition-colors hover:bg-primary/10"
                    onClick={() => void active.fetchNextPage()}
                  >
                    Couldn’t load more posts. Try again
                  </button>
                ) : (
                  <span className="sr-only">More posts load automatically as you scroll.</span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
