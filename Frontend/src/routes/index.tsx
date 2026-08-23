import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Loader2, Sparkles, TrendingUp, UserPlus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { StoryRail } from "@/components/feed/StoryRail";
import { Composer } from "@/components/feed/Composer";
import { PostCard } from "@/components/feed/PostCard";
import { PostSkeleton } from "@/components/feed/PostSkeleton";
import { Button } from "@/components/ui/button";
import { useFeed, useExplore } from "@/hooks/use-posts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gihanga Updates — Home Feed for Creators" },
      {
        name: "description",
        content:
          "Follow creators, watch reels and stories, and keep up with what's happening across Rwanda on Gihanga Updates.",
      },
      { property: "og:title", content: "Gihanga Updates — Home Feed for Creators" },
      {
        property: "og:description",
        content:
          "Follow creators, watch reels and stories, and keep up with what's happening across Rwanda on Gihanga Updates.",
      },
    ],
  }),
  component: HomeFeed,
});

const tabs = [
  { id: "foryou", label: "For you", icon: Sparkles },
  { id: "trending", label: "Trending", icon: TrendingUp },
] as const;

function HomeFeed() {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("foryou");
  const forYou = useFeed();
  const explore = useExplore();

  const active = tab === "foryou" ? forYou : explore;
  const posts = (active.data?.pages.flatMap((p) => p.posts) ?? []).slice();
  if (tab === "trending") posts.sort((a, b) => b.likesCount - a.likesCount);

  const isFollowingAnyone = forYou.data?.pages[0]?.isFollowingAnyone ?? true;

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[620px]">
        <h1 className="sr-only">Gihanga Updates home feed</h1>

        <div className="glass sticky top-16 z-30 -mx-3 mb-4 flex gap-1 rounded-none border-b px-3 py-2 sm:-mx-5 sm:px-5 lg:static lg:mx-0 lg:rounded-2xl lg:border lg:px-2">
          {tabs.map((t) => {
            const isActive = t.id === tab;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                aria-current={isActive}
                className={cn(
                  "press relative flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold",
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
            {posts.map((p, i) => (
              <PostCard key={p._id} post={p} index={i} />
            ))}
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
