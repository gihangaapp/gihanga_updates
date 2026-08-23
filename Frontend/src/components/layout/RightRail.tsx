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
}: {
  title: string;
  icon: typeof Flame;
  children: React.ReactNode;
  action?: string;
  actionTo?: string;
}) {
  return (
    <section className="surface-card p-4">
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
  const { data: tagsData } = useTrendingTags();
  const { data: suggestedData } = useSuggestedUsers();
  const followUser = useFollowUser();
  const { data: followingSet } = useFollowingSet();
  const tags = tagsData?.tags ?? [];
  const suggested = suggestedData?.users ?? [];

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-[336px] shrink-0 flex-col gap-4 overflow-y-auto px-4 py-5 no-scrollbar xl:flex">
      {tags.length > 0 && (
        <Panel title="Trending" icon={Flame} action="Explore">
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
        </Panel>
      )}

      {suggested.length > 0 && (
        <Panel title="Suggested creators" icon={Sparkles}>
          <ul className="flex flex-col gap-2.5">
            {suggested.map((u) => {
              const following = followingSet?.has(u.username) ?? false;
              return (
                <li key={u._id} className="flex items-center gap-3">
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
        </Panel>
      )}

      <section className="surface-card halo relative overflow-hidden p-4">
        <span className="mb-2 inline-block rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
          Sponsored
        </span>
        <h3 className="font-display text-base font-bold">Grow with Gihanga Ads</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Reach viewers and creators across Rwanda with campaign budgets from 5,000 RWF.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          asChild
        >
          <Link to="/ads">
            Start a campaign
            <ArrowUpRight />
          </Link>
        </Button>
      </section>

      <p className="px-1.5 pb-4 text-xs leading-relaxed text-muted-foreground">
        About · Help · Guidelines · Privacy · Terms
        <br />© 2026 Gihanga Updates
      </p>
    </aside>
  );
}
