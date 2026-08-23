import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Flame, Hash, Loader2, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { PostCard } from "@/components/feed/PostCard";
import { Button } from "@/components/ui/button";
import { formatCount } from "@/lib/format";
import { useTagPosts } from "@/hooks/use-posts";
import { useTrendingTags } from "@/hooks/use-search";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tag/$tag")({
  loader: ({ params }) => ({ tag: params.tag }),
  head: ({ loaderData }) => {
    const tag = loaderData?.tag ?? "explore";
    const title = `#${tag} — Gihanga Updates`;
    const description = `Top posts, reels and creators using #${tag} on Gihanga Updates.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: TagPage,
});

const tabs = ["All", "Reels"] as const;

function TagPage() {
  const { tag } = Route.useLoaderData();
  const [tab, setTab] = useState<(typeof tabs)[number]>("All");
  const { data, isLoading, postsCount, fetchNextPage, hasNextPage, isFetchingNextPage } = useTagPosts(tag);
  const trending = useTrendingTags();

  const allPosts = data?.pages.flatMap((p) => p.posts) ?? [];
  const list = tab === "Reels" ? allPosts.filter((p) => p.kind === "reel") : allPosts;
  const relatedTags = (trending.data?.tags ?? []).filter((t) => t.tag.toLowerCase() !== tag.toLowerCase());

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[640px]">
        <header className="surface-card mb-4 flex flex-wrap items-center gap-4 p-5">
          <span className="gradient-brand grid size-16 shrink-0 place-items-center rounded-2xl">
            <Hash className="size-8 text-primary-foreground" strokeWidth={2.6} />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-2xl font-extrabold tracking-tight">#{tag}</h1>
            <p className="text-sm text-muted-foreground">{formatCount(postsCount)} posts</p>
          </div>
        </header>

        <div className="glass mb-4 flex gap-1 rounded-2xl border p-1">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "press flex-1 rounded-xl py-2 text-sm font-semibold",
                t === tab ? "bg-primary-soft text-primary" : "text-muted-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          {isLoading && (
            <p className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading posts…
            </p>
          )}
          {!isLoading && list.length === 0 && (
            <p className="py-16 text-center text-sm text-muted-foreground">No posts with #{tag} yet.</p>
          )}
          {list.map((p) => (
            <PostCard key={p._id} post={p} />
          ))}
          {hasNextPage && (
            <div className="flex justify-center py-2">
              <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                {isFetchingNextPage && <Loader2 className="size-4 animate-spin" />}
                Load more
              </Button>
            </div>
          )}
        </div>

        {relatedTags.length > 0 && (
          <section className="surface-card mt-4 p-4">
            <h2 className="mb-3 flex items-center gap-2 font-display text-base font-bold">
              <Flame className="size-4 text-primary" /> Related tags
            </h2>
            <ul className="flex flex-wrap gap-2">
              {relatedTags.map((t) => (
                <li key={t.tag}>
                  <Link
                    to="/tag/$tag"
                    params={{ tag: t.tag }}
                    className="press flex items-center gap-1.5 rounded-full bg-elevated px-3 py-1.5 text-xs font-semibold hover:bg-muted"
                  >
                    <TrendingUp className="size-3.5 text-success" />#{t.tag}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </AppShell>
  );
}
