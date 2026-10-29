import React, { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowUpRight, Loader2, Radio, Sparkles, TrendingUp, UserPlus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { StoryRail } from "@/components/feed/StoryRail";
import { Composer } from "@/components/feed/Composer";
import { PostCard } from "@/components/feed/PostCard";
import { PostSkeleton } from "@/components/feed/PostSkeleton";
import { FeedAdCard } from "@/components/ads/FeedAdCard";
import { Button } from "@/components/ui/button";
import { useFeed, useExplore, useTrending } from "@/hooks/use-posts";
import { useFeedAds } from "@/hooks/use-ads";
import { useLiveStreams } from "@/hooks/use-live";
import { useAuth } from "@/lib/auth-context";
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
          className="surface-card press flex w-[82%] max-w-[360px] shrink-0 snap-start items-center gap-3 p-4"
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
          className="surface-card press flex w-[82%] max-w-[360px] shrink-0 snap-start items-center gap-3 p-4"
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
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("foryou");
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
  const posts = (active.data?.pages.flatMap((p) => p.posts) ?? []).slice();
  if (tab === "trending" && trendingEmpty) posts.sort((a, b) => b.likesCount - a.likesCount);

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

        {active.isLoading ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : posts.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Nothing here yet — be the first to post something.
          </p>
        ) : (
          <>
            {posts.map((p, i) => {
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
            {active.hasNextPage && (
              <div className="flex justify-center py-6">
                <Button
                  variant="outline"
                  onClick={() => active.fetchNextPage()}
                  disabled={active.isFetchingNextPage}
                >
                  {active.isFetchingNextPage && <Loader2 className="size-4 animate-spin" />}
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
