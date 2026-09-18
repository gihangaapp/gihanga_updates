import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Flame,
  Hash,
  Play,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  X,
  UserCheck,
  UserPlus,
  BadgeCheck,
  Compass,
  ArrowRight,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { GAvatar, VerifiedBadge, UserName } from "@/components/common/GAvatar";
import { Button } from "@/components/ui/button";
import { formatCount } from "@/lib/format";
import { mediaUrl, PublicUser } from "@/lib/api-client";
import { useSearch, useTrendingTags, useSuggestedUsers } from "@/hooks/use-search";
import { useExplore, useReelsFeed } from "@/hooks/use-posts";
import { useFollowUser, useFollowingSet } from "@/hooks/use-social";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore & Search — Creators, Trends & Reels | Gihanga" },
      {
        name: "description",
        content:
          "Search creators and user accounts, explore top 5 trending topics and watch fresh media from the Gihanga community.",
      },
      { property: "og:title", content: "Explore & Search — Discover Creators & Trends | Gihanga" },
      {
        property: "og:description",
        content: "Search creators and users, browse top trending tags and fresh media on Gihanga.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ExplorePage,
});

type ExploreTab = "all" | "creators" | "trending" | "reels";

function toDisplayUser(u: {
  _id: string;
  name: string;
  username: string;
  avatarHue?: number;
  avatarUrl?: string | null;
  verified?: boolean;
  isCreator?: boolean;
  isLive?: boolean;
  bio?: string;
  followersCount?: number;
}) {
  return {
    id: u._id,
    name: u.name,
    username: u.username,
    bio: u.bio || "",
    avatarHue: u.avatarHue ?? 0,
    avatarUrl: u.avatarUrl || null,
    verified: Boolean(u.verified),
    creator: Boolean(u.isCreator),
    live: Boolean(u.isLive),
    followers: u.followersCount ?? 0,
    following: 0,
    posts: 0,
  };
}

export function ExplorePage() {
  const { user: currentUser } = useAuth();
  const [q, setQ] = useState("");
  const [activeTab, setActiveTab] = useState<ExploreTab>("all");
  const [userFilter, setUserFilter] = useState<"all" | "creators" | "verified">("all");
  const [visibleCount, setVisibleCount] = useState(24);

  const term = q.trim();
  const search = useSearch(term);
  const trending = useTrendingTags();
  const suggested = useSuggestedUsers();
  const explore = useExplore();
  const reelsFeed = useReelsFeed();

  const followUser = useFollowUser();
  const { data: followingSet } = useFollowingSet();

  // Search Results & Accounts List
  const searchUsers = search.data?.users ?? [];
  const defaultSuggestedUsers = suggested.data?.users ?? [];
  const rawUsersList = term ? searchUsers : defaultSuggestedUsers;

  // Filtered accounts based on sub-toggle (All, Creators, Verified)
  const filteredUsers = useMemo(() => {
    return rawUsersList.filter((u) => {
      if (userFilter === "creators") return u.isCreator;
      if (userFilter === "verified") return u.verified;
      return true;
    });
  }, [rawUsersList, userFilter]);

  // Trending tags strictly limited to top 5 most used tags
  const trendingTags = (trending.data?.tags ?? []).slice(0, 5);

  // Fresh media items
  const mediaPosts =
    (activeTab === "reels" ? reelsFeed : explore).data?.pages.flatMap((p) => p.posts) ?? [];

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1000px] space-y-6 pb-12">
        {/* Top Header */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-xl bg-primary-soft text-primary">
              <Compass className="size-5" />
            </div>
            <h1 className="font-display text-2xl font-black tracking-tight text-foreground sm:text-3xl">
              Explore & Search
            </h1>
          </div>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Discover creators, top trending topics, and fresh media.
          </p>
        </div>

        {/* Global Search Input with Clear Button */}
        <div className="surface-card relative flex items-center gap-3 rounded-2xl p-2 pl-4 shadow-soft border border-border focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <Search className="size-5 shrink-0 text-primary" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setVisibleCount(24);
            }}
            placeholder="Search creator or user accounts by name, username or bio…"
            aria-label="Search creators and users"
            className="h-11 min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground"
          />
          {q && (
            <button
              type="button"
              onClick={() => {
                setQ("");
                setVisibleCount(24);
              }}
              className="press mr-2 grid size-7 place-items-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
              title="Clear search"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Explore Mode Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: "all", label: "All", icon: Sparkles },
            { id: "creators", label: "Creators & Users", icon: Users },
            { id: "trending", label: "Trending Tags", icon: Flame },
            { id: "reels", label: "Fresh Media", icon: Play },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as ExploreTab)}
                className={cn(
                  "press relative flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all",
                  active
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-surface text-muted-foreground hover:bg-muted hover:text-foreground border border-border/60",
                )}
              >
                <tab.icon className="size-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 1. CREATORS & USERS SEARCH SECTION (Always visible when searching or on 'all'/'creators' tab) */}
        {(activeTab === "all" || activeTab === "creators" || term) && (
          <section className="space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Users className="size-4.5 text-primary" />
                <h2 className="font-display text-base font-extrabold tracking-tight text-foreground">
                  {term
                    ? `Found ${filteredUsers.length} account${filteredUsers.length === 1 ? "" : "s"}`
                    : "Suggested Creators & Accounts"}
                </h2>
                {filteredUsers.length > 0 && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-extrabold text-primary">
                    {filteredUsers.length}
                  </span>
                )}
              </div>

              {/* Sub-Filter Pills (All, Creators Only, Verified Only) */}
              <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl w-fit">
                <button
                  type="button"
                  onClick={() => setUserFilter("all")}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-bold transition-all",
                    userFilter === "all"
                      ? "bg-surface text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  All ({rawUsersList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setUserFilter("creators")}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-bold transition-all",
                    userFilter === "creators"
                      ? "bg-surface text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Creators
                </button>
                <button
                  type="button"
                  onClick={() => setUserFilter("verified")}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-bold transition-all",
                    userFilter === "verified"
                      ? "bg-surface text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Verified
                </button>
              </div>
            </div>

            {/* High-Performance, Density-Optimized Responsive User Grid (Handles 100+ accounts gracefully) */}
            {filteredUsers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredUsers.slice(0, visibleCount).map((u) => {
                  const isFollowing = followingSet?.has(u.username) ?? false;
                  const isSelf = currentUser?.username === u.username;

                  return (
                    <div
                      key={u._id}
                      className="surface-card group relative flex flex-col justify-between rounded-2xl p-4 border border-border shadow-soft hover:border-primary/40 hover:shadow-hover transition-all duration-200"
                    >
                      {/* Top Header with Avatar and Follow Action */}
                      <div className="flex items-start justify-between gap-3">
                        <Link
                          to="/profile/$username"
                          params={{ username: u.username }}
                          className="flex items-center gap-3 min-w-0"
                        >
                          <GAvatar
                            user={toDisplayUser(u)}
                            size="md"
                            ring={u.isLive ? "live" : u.isCreator ? "creator" : "none"}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1">
                              <span className="truncate font-extrabold text-sm text-foreground group-hover:text-primary transition-colors">
                                {u.name}
                              </span>
                              {u.verified && <VerifiedBadge />}
                            </div>
                            <span className="block truncate text-xs text-muted-foreground font-medium">
                              @{u.username}
                            </span>
                          </div>
                        </Link>

                        {!isSelf && (
                          <Button
                            variant={isFollowing ? "soft" : "default"}
                            size="sm"
                            onClick={() => {
                              followUser.mutate({ username: u.username, follow: !isFollowing });
                              if (!isFollowing) toast.success(`Following @${u.username}`);
                            }}
                            className={cn(
                              "h-8 rounded-xl px-3 text-xs font-extrabold shrink-0 transition-transform active:scale-95",
                              isFollowing
                                ? "bg-muted text-foreground hover:bg-muted/80"
                                : "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
                            )}
                          >
                            {isFollowing ? (
                              <span className="flex items-center gap-1">
                                <UserCheck className="size-3.5" /> Following
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <UserPlus className="size-3.5" /> Follow
                              </span>
                            )}
                          </Button>
                        )}
                      </div>

                      {/* Middle Bio Section */}
                      {u.bio && (
                        <p className="mt-2.5 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                          {u.bio}
                        </p>
                      )}

                      {/* Footer Badge & Metric Row */}
                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className="text-foreground">
                            {formatCount(u.followersCount || 0)}
                          </span>
                          <span>followers</span>
                        </div>

                        {u.isCreator && (
                          <span className="rounded-md bg-amber-500/10 px-2 py-0.5 font-extrabold text-[10px] uppercase tracking-wider text-amber-500 border border-amber-500/20">
                            Creator
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="surface-card rounded-2xl p-8 text-center text-muted-foreground">
                <Users className="mx-auto mb-2 size-8 text-muted-foreground/50" />
                <p className="text-sm font-semibold">
                  {term ? `No creator or user accounts match “${q}”.` : "No accounts available."}
                </p>
              </div>
            )}

            {/* Pagination / Load More when there are many results */}
            {filteredUsers.length > visibleCount && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVisibleCount((prev) => prev + 24)}
                  className="rounded-xl font-bold gap-1.5"
                >
                  Show More ({filteredUsers.length - visibleCount} remaining)
                </Button>
              </div>
            )}
          </section>
        )}

        {/* 2. TOP 5 TRENDING TAGS SECTION */}
        {(activeTab === "all" || activeTab === "trending") && !term && (
          <section className="space-y-3.5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Flame className="size-4.5 text-danger" />
                <h2 className="font-display text-base font-extrabold tracking-tight text-foreground">
                  Trending Now
                </h2>
                <span className="rounded-full bg-danger/10 px-2 py-0.5 text-[10px] font-black uppercase text-danger">
                  Top 5 Tags
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {trendingTags.map((t, idx) => (
                <Link
                  key={t.tag}
                  to="/tag/$tag"
                  params={{ tag: t.tag }}
                  className="surface-card lift group flex items-center gap-3.5 rounded-2xl p-3.5 border border-border hover:border-primary/50 transition-all"
                >
                  <span
                    className={cn(
                      "grid size-10 shrink-0 place-items-center rounded-xl font-display text-base font-black shadow-md",
                      idx === 0
                        ? "bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-extrabold"
                        : idx === 1
                          ? "bg-gradient-to-tr from-slate-300 to-slate-100 text-slate-950 font-extrabold"
                          : idx === 2
                            ? "bg-gradient-to-tr from-amber-700 to-amber-600 text-white font-extrabold"
                            : "bg-primary-soft text-primary font-bold",
                    )}
                  >
                    #{idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="block truncate font-extrabold text-sm text-foreground group-hover:text-primary transition-colors">
                      #{t.tag}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground font-medium">
                      {formatCount(t.postsCount)} posts
                    </span>
                  </div>
                  {"trend" in t && (t as any).trend > 0 && (
                    <span className="flex items-center gap-1 text-xs font-bold text-success">
                      <TrendingUp className="size-3.5" />
                      {(t as any).trend}
                    </span>
                  )}
                </Link>
              ))}

              {!trendingTags.length && (
                <p className="col-span-full py-4 text-center text-xs text-muted-foreground">
                  No trending tags yet — post with a #hashtag to get on the leaderboard!
                </p>
              )}
            </div>
          </section>
        )}

        {/* 3. FRESH MEDIA & REELS GRID (with resilient image and video fallback) */}
        {(activeTab === "all" || activeTab === "reels") && !term && (
          <section className="space-y-3.5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Play className="size-4.5 text-primary" />
                <h2 className="font-display text-base font-extrabold tracking-tight text-foreground">
                  Fresh Media
                </h2>
              </div>
              <Link
                to="/reels"
                className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
              >
                <span>Watch full screen</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
              {mediaPosts
                .filter((p) => p.mediaUrl || p.thumbnailUrl)
                .map((item, i) => {
                  const mediaSrc = mediaUrl(item.mediaUrl) || mediaUrl(item.thumbnailUrl);
                  const isVideo = item.kind === "video" || item.kind === "reel";

                  return (
                    <Link
                      key={item._id}
                      to={isVideo ? "/reels" : "/post/$postId"}
                      params={{ postId: item._id }}
                      className="press group relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted border border-border/50 shadow-soft"
                      style={{ animationDelay: `${i * 30}ms` }}
                    >
                      {isVideo ? (
                        <video
                          src={mediaSrc}
                          poster={mediaUrl(item.thumbnailUrl)}
                          muted
                          playsInline
                          preload="metadata"
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <img
                          src={mediaSrc}
                          alt={item.body ? item.body.slice(0, 40) : "Post media"}
                          loading="lazy"
                          onError={(e) => {
                            // Gracefully handle broken external media with clean fallback UI
                            const target = e.currentTarget;
                            target.style.display = "none";
                            const parent = target.parentElement;
                            if (parent) {
                              parent.classList.add(
                                "bg-gradient-to-tr",
                                "from-slate-900",
                                "to-slate-800",
                                "flex",
                                "items-center",
                                "justify-center",
                              );
                            }
                          }}
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}

                      {/* Top Creator Indicator */}
                      <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/70 via-black/20 to-transparent p-2.5 flex items-center gap-1.5 text-white">
                        <GAvatar user={toDisplayUser(item.author)} size="xs" />
                        <span className="truncate text-[11px] font-bold drop-shadow-md">
                          {item.author.username}
                        </span>
                      </div>

                      {/* Bottom Metric Pill */}
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2.5">
                        <span className="flex items-center gap-1 text-[11px] font-extrabold text-white">
                          <Play className="size-3 fill-white" />
                          {formatCount(item.viewsCount || item.likesCount || 0)}
                        </span>
                      </span>
                    </Link>
                  );
                })}

              {!mediaPosts.length && (
                <div className="col-span-full py-8 text-center text-xs text-muted-foreground">
                  <ImageIcon className="mx-auto mb-2 size-6 text-muted-foreground/50" />
                  No media posts available yet.
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
