import { createFileRoute } from "@tanstack/react-router";
import { Compass, ImageIcon } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import {
  EmptyState,
  InfiniteSentinel,
  PostCard,
  PostGrid,
  PostGridSkeleton,
} from "@/components/explore/shared";
import { useExplore } from "@/hooks/use-posts";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore — Discover Posts | Gihanga" },
      {
        name: "description",
        content:
          "Explore fresh posts, photos, videos and reels from the Gihanga community.",
      },
      { property: "og:title", content: "Explore — Discover Posts | Gihanga" },
      {
        property: "og:description",
        content: "Browse fresh posts from creators across Gihanga.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ExplorePage,
});

export function ExplorePage() {
  const explore = useExplore();
  const posts = explore.data?.pages.flatMap((p) => p.posts) ?? [];

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1000px] space-y-5 pb-12">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-xl bg-primary-soft text-primary">
              <Compass className="size-5" />
            </div>
            <h1 className="font-display text-2xl font-black tracking-tight text-foreground sm:text-3xl">
              Explore
            </h1>
          </div>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Fresh posts from creators across Gihanga.
          </p>
        </div>

        {explore.isError && !posts.length ? (
          <EmptyState icon={ImageIcon}>
            Couldn’t load posts right now. Check your connection and refresh.
          </EmptyState>
        ) : (
          <PostGrid>
            {posts.map((post, i) => (
              <PostCard key={post._id} post={post} index={i} />
            ))}
            {(explore.isLoading || explore.isFetchingNextPage) && (
              <PostGridSkeleton count={explore.isLoading ? 12 : 4} />
            )}
            {!explore.isLoading && !posts.length && (
              <div className="col-span-full">
                <EmptyState icon={ImageIcon}>No posts available yet.</EmptyState>
              </div>
            )}
          </PostGrid>
        )}

        <InfiniteSentinel
          disabled={!explore.hasNextPage || explore.isFetchingNextPage}
          onVisible={() => explore.fetchNextPage()}
        />
      </div>
    </AppShell>
  );
}
