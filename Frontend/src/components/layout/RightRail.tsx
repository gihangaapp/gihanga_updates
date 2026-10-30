import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Flame, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { GAvatar, UserName } from "@/components/common/GAvatar";
import { Button } from "@/components/ui/button";
import { PublicUser } from "@/lib/api-client";
import { useTrendingTags, useSuggestedUsers } from "@/hooks/use-search";
import { useFollowUser, useFollowingSet } from "@/hooks/use-social";
import { formatCount } from "@/lib/format";

function toDisplayUser(u: PublicUser) {
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
    followers: u.followersCount,
    following: 0,
    posts: 0,
  };
}

function Panel({
  title,
  icon: Icon,
  children,
  action,
  actionTo,
  className,
}: {
  title: string;
  icon: typeof Flame;
  children: React.ReactNode;
  action?: string;
  actionTo?: string;
  className?: string;
}) {
  return (
    <section className={`surface-card p-4 ${className ?? ""}`}>
      <header className="mb-3 flex items-center gap-2">
        <Icon className="size-4 text-primary" />
        <h2 className="text-sm font-bold tracking-tight">{title}</h2>
        {action && (
          <Link
            to={actionTo ?? "/explore"}
            className="ml-auto text-xs font-semibold text-primary hover:underline"
          >
            {action}
          </Link>
        )}
      </header>
      {children}
    </section>
  );
}

export function RightRail() {
  const { data: tagsData, isLoading: isTagsLoading } = useTrendingTags();
  const { data: suggestedData, isLoading: isSuggestedLoading } = useSuggestedUsers();
  const followUser = useFollowUser();
  const { data: followingSet } = useFollowingSet();
  const tags = (tagsData?.tags ?? []).slice(0, 5);
  const suggested = (suggestedData?.users ?? []).filter(
    (u) =>
      u.isCreator &&
      (u as any).role !== "admin" &&
      (u as any).role !== "superadmin" &&
      (u as any).role !== "moderator",
  );

  return (
    <aside className="right-rail sticky top-0 -mt-16 hidden h-dvh w-[clamp(280px,24vw,336px)] min-w-0 shrink-0 flex-col overflow-hidden no-scrollbar xl:flex">
      <div className="min-h-0 flex-1 overflow-hidden">
      <div className="right-rail-body flex h-[calc(100%-4rem)] min-w-0 flex-col gap-4 overflow-hidden px-4 pt-5">
      {(tags.length > 0 || isTagsLoading) && (
        <Panel
          title="Trending"
          icon={Flame}
          action="See all"
          actionTo="/trending"
          className="rail-trending"
        >
          {isTagsLoading && tags.length === 0 ? (
            <div className="space-y-3" aria-label="Loading trending topics" aria-busy="true">
              {Array.from({ length: 5 }, (_, index) => (
                <div key={`tag-skeleton-${index}`} className="flex items-center gap-3 px-1.5 py-1">
                  <div className="shimmer h-4 w-4 rounded bg-muted" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="shimmer h-3.5 w-2/3 rounded-full bg-muted" />
                    <div className="shimmer h-2.5 w-1/3 rounded-full bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ul className="flex flex-col">
              {tags.map((t, i) => (
                <li key={t.tag}>
                  <Link
                    to="/tag/$tag"
                    params={{ tag: t.tag }}
                    className="press group flex w-full items-center gap-3 rounded-xl px-1.5 py-2 text-left hover:bg-muted"
                  >
                    <span className="w-4 font-display text-sm font-bold text-muted-foreground">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold">#{t.tag}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {formatCount(t.postsCount)} posts
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}

      {(suggested.length > 0 || isSuggestedLoading) && (
        <Panel title="Suggested creators" icon={Sparkles} className="rail-creators">
          {isSuggestedLoading && suggested.length === 0 ? (
            <div className="space-y-3" aria-label="Loading suggested creators" aria-busy="true">
              {Array.from({ length: 5 }, (_, index) => (
                <div key={`creator-skeleton-${index}`} className="rail-creator flex items-center gap-3">
                  <div className="shimmer size-9 shrink-0 rounded-full bg-muted" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="shimmer h-3.5 w-3/4 rounded-full bg-muted" />
                    <div className="shimmer h-2.5 w-1/2 rounded-full bg-muted" />
                  </div>
                  <div className="shimmer h-7 w-16 shrink-0 rounded-full bg-muted" />
                </div>
              ))}
            </div>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {suggested.map((u) => {
                const following = followingSet?.has(u.username) ?? false;
                return (
                  <li key={u._id} className="rail-creator flex items-center gap-3">
                    <Link to="/profile/$username" params={{ username: u.username }}>
                      <GAvatar user={toDisplayUser(u)} size="sm" />
                    </Link>
                    <span className="min-w-0 flex-1">
                      <UserName user={toDisplayUser(u)} className="text-sm" />
                      <span className="block truncate text-xs text-muted-foreground">
                        {formatCount(u.followersCount)} followers
                      </span>
                    </span>
                    <Button
                      variant={following ? "soft" : "default"}
                      size="sm"
                      onClick={() => {
                        followUser.mutate({ username: u.username, follow: !following });
                        if (!following) toast.success(`Following @${u.username}`);
                      }}
                      className="shrink-0"
                    >
                      {following ? "Following" : "Follow"}
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      )}

      <section className="surface-card halo relative min-w-0 shrink-0 overflow-hidden p-4">
        <span className="mb-2 inline-block rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
          Sponsored
        </span>
        <h3 className="break-words font-display text-base font-bold leading-snug">Grow with Gihanga Ads</h3>
        <p className="mt-1 break-words text-sm leading-relaxed text-muted-foreground [overflow-wrap:anywhere]">
          Reach viewers and creators across Rwanda with campaign budgets from 5,000 RWF.
        </p>
        <Button variant="outline" size="sm" className="mt-3" asChild>
          <Link to="/ads">
            Start a campaign
            <ArrowUpRight />
          </Link>
        </Button>
      </section>

      </div>
      </div>

      <p className="shrink-0 break-words px-5 pb-5 pt-2 text-xs leading-relaxed text-muted-foreground">
        About · Help · Guidelines · Privacy · Terms
        <br />© 2026 Gihanga Updates
      </p>
    </aside>
  );
}
