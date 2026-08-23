import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Flame, Hash, Play, Search, Sparkles, TrendingUp, Users } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { GAvatar, UserName } from "@/components/common/GAvatar";
import { formatCount } from "@/lib/format";
import { mediaUrl } from "@/lib/api-client";
import { useSearch, useTrendingTags } from "@/hooks/use-search";
import { useExplore, useReelsFeed } from "@/hooks/use-posts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore — Discover Creators & Trends | Gihanga" },
      {
        name: "description",
        content:
          "Search people, hashtags and places, browse trending topics and find the creators shaping the Gihanga community.",
      },
      { property: "og:title", content: "Explore — Discover Creators & Trends | Gihanga" },
      {
        property: "og:description",
        content: "Search people, hashtags and places and discover trending creators on Gihanga.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ExplorePage,
});

const filters = [
  { id: "top", label: "Top", icon: Sparkles },
  { id: "people", label: "People", icon: Users },
  { id: "tags", label: "Tags", icon: Hash },
  { id: "reels", label: "Reels", icon: Play },
] as const;

function toDisplayUser(u: { _id: string; name: string; username: string; avatarHue: number; avatarUrl: string | null; verified: boolean; isCreator: boolean; isLive: boolean }) {
  return {
    id: u._id,
    name: u.name,
    username: u.username,
    bio: "",
    avatarHue: u.avatarHue,
    avatarUrl: u.avatarUrl,
    verified: u.verified,
    creator: u.isCreator,
    live: u.isLive,
    followers: 0,
    following: 0,
    posts: 0,
  };
}

function ExplorePage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("top");

  const term = q.trim();
  const search = useSearch(term);
  const trending = useTrendingTags();
  const explore = useExplore();
  const reelsFeed = useReelsFeed();

  const people = term ? search.data?.users ?? [] : [];
  const tags = term ? search.data?.tags ?? [] : trending.data?.tags ?? [];
  const mediaPosts = (filter === "reels" ? reelsFeed : explore).data?.pages.flatMap((p) => p.posts) ?? [];

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[900px]">
        <h1 className="mb-4 font-display text-2xl font-extrabold tracking-tight">Explore</h1>

        <div className="surface-card mb-4 flex items-center gap-3 p-2 pl-4">
          <Search className="size-5 shrink-0 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search people, tags, places…"
            aria-label="Search Gihanga"
            className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="mb-5 flex gap-1 overflow-x-auto no-scrollbar">
          {filters.map((f) => {
            const active = f.id === filter;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={cn(
                  "press relative flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold",
                  active ? "text-primary" : "text-muted-foreground hover:bg-muted",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="explore-filter"
                    className="absolute inset-0 rounded-xl bg-primary-soft"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <f.icon className="relative size-4" />
                <span className="relative">{f.label}</span>
              </button>
            );
          })}
        </div>

        {(filter === "top" || filter === "tags") && (
          <section className="mb-6">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
              <Flame className="size-4 text-primary" /> Trending now
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {tags.map((t) => (
                <Link
                  key={t.tag}
                  to="/tag/$tag"
                  params={{ tag: t.tag }}
                  className="surface-card lift flex items-center gap-3 p-4"
                >
                  <span className="gradient-brand grid size-11 shrink-0 place-items-center rounded-xl font-display text-lg font-bold text-primary-foreground">
                    #
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold">#{t.tag}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {formatCount(t.postsCount)} posts
                    </span>
                  </span>
                  {"trend" in t && t.trend > 0 && (
                    <span className="flex items-center gap-1 text-xs font-bold text-success">
                      <TrendingUp className="size-3.5" />
                      {t.trend}
                    </span>
                  )}
                </Link>
              ))}
              {!tags.length && (
                <p className="text-sm text-muted-foreground">
                  {term ? `No tags match “${q}”.` : "No trending tags yet — be the first to post with a #hashtag."}
                </p>
              )}
            </div>
          </section>
        )}

        {(filter === "top" || filter === "people") && (
          <section className="mb-6">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
              <Users className="size-4 text-primary" /> {term ? "People" : "Search to find creators"}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {people.map((u) => (
                <Link
                  key={u._id}
                  to="/profile/$username"
                  params={{ username: u.username }}
                  className="surface-card lift flex items-center gap-3 p-4"
                >
                  <GAvatar user={toDisplayUser(u)} size="md" ring={u.isLive ? "live" : "none"} />
                  <span className="min-w-0 flex-1">
                    <UserName user={toDisplayUser(u)} className="text-sm" />
                    <span className="block truncate text-xs text-muted-foreground">
                      @{u.username} · {formatCount(u.followersCount)} followers
                    </span>
                  </span>
                  <span className="rounded-full bg-primary-soft px-3 py-1.5 text-xs font-bold text-primary">
                    View
                  </span>
                </Link>
              ))}
              {term && !people.length && (
                <p className="text-sm text-muted-foreground">No people match “{q}”.</p>
              )}
            </div>
          </section>
        )}

        {(filter === "top" || filter === "reels") && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
              <Play className="size-4 text-primary" /> Fresh media
            </h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {mediaPosts
                .filter((p) => p.mediaUrl)
                .map((item, i) => (
                  <Link
                    key={item._id}
                    to="/reels"
                    className="press group relative aspect-[3/4] overflow-hidden rounded-2xl bg-elevated"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    {item.kind === "video" || item.kind === "reel" ? (
                      <video src={mediaUrl(item.mediaUrl)} muted className="size-full object-cover" />
                    ) : (
                      <img
                        src={mediaUrl(item.mediaUrl)}
                        alt={item.body.slice(0, 60)}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-white">
                        <Play className="size-3.5 fill-white" />
                        {formatCount(item.viewsCount || item.likesCount)}
                      </span>
                    </span>
                  </Link>
                ))}
              {!mediaPosts.length && (
                <p className="col-span-full text-sm text-muted-foreground">Nothing posted yet.</p>
              )}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
