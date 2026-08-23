import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AtSign, Bell, DollarSign, Gift, Heart, MessageSquare, Radio, Sparkles, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { GAvatar } from "@/components/common/GAvatar";
import { Button } from "@/components/ui/button";
import { mediaUrl, type AppNotification } from "@/lib/api-client";
import { useNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from "@/hooks/use-notifications";
import { useFollowUser, useFollowingSet } from "@/hooks/use-social";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Your Gihanga Activity" },
      {
        name: "description",
        content:
          "Likes, comments, mentions, new followers and live alerts from across your Gihanga network in one place.",
      },
      { property: "og:title", content: "Notifications — Your Gihanga Activity" },
      {
        property: "og:description",
        content: "Likes, comments, mentions and follower activity from your Gihanga network.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NotificationsPage,
});

const iconFor: Record<AppNotification["kind"], { icon: typeof Heart; tone: string }> = {
  like: { icon: Heart, tone: "bg-danger/12 text-danger" },
  comment: { icon: MessageSquare, tone: "bg-info/12 text-info" },
  follow: { icon: UserPlus, tone: "bg-success/12 text-success" },
  mention: { icon: AtSign, tone: "bg-accent/15 text-accent" },
  live: { icon: Radio, tone: "bg-danger/12 text-danger" },
  system: { icon: Sparkles, tone: "bg-primary-soft text-primary" },
  payment: { icon: DollarSign, tone: "bg-success/12 text-success" },
  reward: { icon: Gift, tone: "bg-accent/15 text-accent" },
};

const tabs = [
  { id: "all", label: "All" },
  { id: "mentions", label: "Mentions" },
  { id: "follows", label: "Follows" },
] as const;

function toDisplayUser(actor: NonNullable<AppNotification["actor"]>) {
  return {
    id: actor._id,
    name: actor.name,
    username: actor.username,
    bio: "",
    avatarHue: actor.avatarHue,
    avatarUrl: actor.avatarUrl,
    verified: actor.verified,
    creator: actor.isCreator,
    followers: 0,
    following: 0,
    posts: 0,
  };
}

function NotificationsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("all");
  const { data, isLoading } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const markRead = useMarkNotificationRead();
  const followUser = useFollowUser();
  const { data: followingSet } = useFollowingSet();

  const items = data?.notifications ?? [];
  const list = items.filter((n) =>
    tab === "mentions"
      ? n.kind === "mention" || n.kind === "comment"
      : tab === "follows"
        ? n.kind === "follow"
        : true,
  );

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[640px]">
        <div className="mb-4 flex items-center gap-3">
          <h1 className="font-display text-2xl font-extrabold tracking-tight">Notifications</h1>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={() => {
              markAllRead.mutate();
              toast.success("All caught up");
            }}
          >
            Mark all read
          </Button>
        </div>

        <div className="glass mb-4 flex gap-1 rounded-2xl border p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "press flex-1 rounded-xl px-3 py-2 text-sm font-semibold",
                t.id === tab ? "bg-primary-soft text-primary" : "text-muted-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <ul className="surface-card divide-y divide-border overflow-hidden p-0">
          {isLoading && <li className="p-10 text-center text-sm text-muted-foreground">Loading…</li>}
          {list.map((n) => {
            const meta = iconFor[n.kind];
            const postImage = n.relatedPost ? mediaUrl(n.relatedPost.thumbnailUrl || n.relatedPost.mediaUrl) : null;
            return (
              <li key={n._id}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => !n.read && markRead.mutate(n._id)}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 p-4 transition-colors hover:bg-muted",
                    !n.read && "bg-primary-soft/40",
                  )}
                >
                  <span className={cn("grid size-9 shrink-0 place-items-center rounded-full", meta.tone)}>
                    <meta.icon className="size-4.5" />
                  </span>

                  {n.actor ? (
                    <Link
                      to="/profile/$username"
                      params={{ username: n.actor.username }}
                      className="shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <GAvatar user={toDisplayUser(n.actor)} size="sm" />
                    </Link>
                  ) : null}

                  <p className="min-w-0 flex-1 text-sm leading-snug">
                    {n.actor && <span className="font-semibold">{n.actor.name} </span>}
                    <span className={n.actor ? "text-muted-foreground" : ""}>{n.text}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{timeAgo(n.createdAt)} ago</span>
                  </p>

                  {postImage ? (
                    <img src={postImage} alt="" loading="lazy" className="size-12 shrink-0 rounded-lg object-cover" />
                  ) : n.kind === "follow" && n.actor ? (
                    followingSet?.has(n.actor.username) ? (
                      <Button size="sm" variant="soft" disabled>
                        Following
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="brand"
                        onClick={(e) => {
                          e.stopPropagation();
                          followUser.mutate({ username: n.actor!.username, follow: true });
                          toast.success("Following");
                        }}
                      >
                        Follow back
                      </Button>
                    )
                  ) : null}
                </div>
              </li>
            );
          })}
          {!isLoading && !list.length && (
            <li className="flex flex-col items-center gap-2 p-10 text-center">
              <Bell className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Nothing here yet.</p>
            </li>
          )}
        </ul>
      </div>
    </AppShell>
  );
}
