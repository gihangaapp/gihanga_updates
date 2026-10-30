import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Flame, Hash, ImageIcon, TrendingUp, Users } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import {
  EmptyState,
  InfiniteSentinel,
  PostCard,
  PostGrid,
  PostGridSkeleton,
  SectionHeader,
  TagCard,
  TagGridSkeleton,
  UserCard,
  UserGridSkeleton,
} from "@/components/explore/shared";
import { useSuggestedUsers, useTrendingTags } from "@/hooks/use-search";
import { useExplore, useTrending } from "@/hooks/use-posts";

export const Route = createFileRoute("/trending")({
  head: () => ({
    meta: [
      { title: "Trending — Posts, Creators & Hashtags | Gihanga" },
      {
        name: "description",
        content: "See what’s trending on Gihanga: top posts, creators and hashtags right now.",
      },
      { property: "og:title", content: "Trending — Posts, Creators & Hashtags | Gihanga" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: TrendingPage,
});

export function TrendingPage() {
  const tagsQuery = useTrendingTags(10);
  const creatorsQuery = useSuggestedUsers();
  const trending = useTrending();
  const explore = useExplore();

  const tags = tagsQuery.data?.tags ?? [];
  const creators = useMemo(
    () =>
      [...(creatorsQuery.data?.users ?? [])]
        .sort((a, b) => (b.followersCount || 0) - (a.followersCount || 0))
        .slice(0, 6),
    [creatorsQuery.data],
  );

  // Dedicated ranked trending feed; fall back to explore on a fresh platform
  const trendingPosts = trending.data?.pages.flatMap((p) => p.posts) ?? [];
  const useFallback = !trending.isLoading && trendingPosts.length === 0;
  const postsSource = useFallback ? explore : trending;
  const posts = postsSource.data?.pages.flatMap((p) => p.posts) ?? [];

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1000px] space-y-7 pb-12">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-xl bg-danger/10 text-danger">
              <TrendingUp className="size-5" />
            </div>
            <h1 className="font-display text-2xl font-black tracking-tight text-foreground sm:text-3xl">
              Trending
            </h1>
          </div>
          <p className="text-xs text-muted-foreground sm:text-sm">
            The hottest posts, creators and hashtags right now.
          </p>
        </div>

        {/* Hashtags */}
        <section className="space-y-3.5">
          <SectionHeader
            icon={Hash}
            title="Trending hashtags"
            badge={
              <span className="rounded-full bg-danger/10 px-2 py-0.5 text-[10px] font-black uppercase text-danger">
                Top {Math.max(tags.length, 0) || 10}
              </span>
            }
          />
          <div className="-mx-3 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-3 pb-2 no-scrollbar sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
            {tags.map((t, idx) => (
              <TagCard
                key={t.tag}
                tag={t}
                rank={idx}
                className="w-[82%] max-w-[340px] shrink-0 snap-start sm:w-auto sm:max-w-none"
              />
            ))}
            {tagsQuery.isLoading && !tags.length && <TagGridSkeleton count={6} />}
            {!tagsQuery.isLoading && !tags.length && (
              <p className="col-span-full py-4 text-center text-xs text-muted-foreground">
                No trending tags yet — post with a #hashtag to get on the leaderboard!
              </p>
            )}
          </div>
        </section>

        {/* Creators */}
        <section className="space-y-3.5">
          <SectionHeader icon={Users} title="Trending creators" />
          {creatorsQuery.isLoading ? (
            <UserGridSkeleton count={3} />
          ) : creators.length > 0 ? (
            <div className="-mx-3 flex snap-x snap-mandatory gap-3.5 overflow-x-auto overscroll-x-contain px-3 pb-2 no-scrollbar sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
              {creators.map((u) => (
                <UserCard
                  key={u._id}
                  u={u}
                  className="w-[82%] max-w-[340px] shrink-0 snap-start sm:w-auto sm:max-w-none"
                />
              ))}
            </div>
          ) : (
            <EmptyState icon={Users}>No creators to show yet.</EmptyState>
          )}
        </section>

        {/* Posts */}
        <section className="space-y-3.5">
          <SectionHeader icon={Flame} iconClass="text-danger" title="Trending posts" />
          <PostGrid>
            {posts.map((post, i) => (
              <PostCard key={post._id} post={post} index={i} />
            ))}
            {(trending.isLoading || postsSource.isFetchingNextPage) && (
              <PostGridSkeleton count={trending.isLoading ? 8 : 4} />
            )}
            {!trending.isLoading && !posts.length && (
              <div className="col-span-full">
                <EmptyState icon={ImageIcon}>No trending posts yet.</EmptyState>
              </div>
            )}
          </PostGrid>
          <InfiniteSentinel
            disabled={!postsSource.hasNextPage || postsSource.isFetchingNextPage}
            onVisible={() => postsSource.fetchNextPage()}
          />
        </section>
      </div>
    </AppShell>
  );
}
