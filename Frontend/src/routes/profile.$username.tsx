import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Film, Grid3x3, Heart, Settings } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { GAvatar, UserName, VerifiedBadge } from "@/components/common/GAvatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import { mediaUrl, PublicUser } from "@/lib/api-client";
import { useUserProfile, useFollowers, useFollowing } from "@/hooks/use-social";
import { useUserPosts, useLikedPosts } from "@/hooks/use-posts";
import { useFollowUser, useFollowingSet } from "@/hooks/use-social";
import { formatCount } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile/$username")({
  head: () => ({
    meta: [
      { title: "Profile — Gihanga Updates" },
      { name: "description", content: "View this creator's posts, reels and activity on Gihanga Updates." },
    ],
  }),
  component: ProfilePage,
});

const tabs = [
  { id: "posts", label: "Posts", icon: Grid3x3 },
  { id: "reels", label: "Reels", icon: Film },
  { id: "likes", label: "Likes", icon: Heart },
] as const;

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

function FollowListDialog({
  username,
  tab,
  onOpenChange,
}: {
  username: string;
  tab: "followers" | "following" | null;
  onOpenChange: (open: boolean) => void;
}) {
  const followers = useFollowers(tab === "followers" ? username : "");
  const following = useFollowing(tab === "following" ? username : "");
  const followUser = useFollowUser();
  const { data: followingSet } = useFollowingSet();
  const { user: me } = useAuth();

  const list = tab === "followers" ? followers.data?.users : following.data?.users;
  const isLoading = tab === "followers" ? followers.isLoading : following.isLoading;

  return (
    <Dialog open={tab !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[70vh] overflow-y-auto sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{tab === "followers" ? "Followers" : "Following"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-1">
          {isLoading && <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>}
          {!isLoading && !list?.length && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {tab === "followers" ? "No followers yet." : "Not following anyone yet."}
            </p>
          )}
          {list?.map((u) => {
            const isMe = me?.username === u.username;
            const isFollowing = followingSet?.has(u.username) ?? false;
            return (
              <div key={u._id} className="flex items-center gap-3 rounded-xl p-2 hover:bg-muted">
                <Link
                  to="/profile/$username"
                  params={{ username: u.username }}
                  className="flex min-w-0 flex-1 items-center gap-3"
                  onClick={() => onOpenChange(false)}
                >
                  <GAvatar user={toDisplayUser(u)} size="sm" />
                  <span className="min-w-0 flex-1">
                    <UserName user={toDisplayUser(u)} className="text-sm" />
                    <span className="block truncate text-xs text-muted-foreground">@{u.username}</span>
                  </span>
                </Link>
                {!isMe && (
                  <Button
                    variant={isFollowing ? "soft" : "default"}
                    size="sm"
                    onClick={() =>
                      followUser.mutate(
                        { username: u.username, follow: !isFollowing },
                        { onError: (err: any) => toast.error(err.message || "Couldn't update follow status") },
                      )
                    }
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ProfileNotFound() {
  return (
    <AppShell>
      <div className="surface-card mx-auto mt-10 max-w-md p-10 text-center">
        <h1 className="mb-2 font-display text-xl font-bold">Account not found</h1>
        <p className="mb-4 text-sm text-muted-foreground">That handle doesn&apos;t exist on Gihanga yet.</p>
        <Button variant="brand" asChild>
          <Link to="/explore">Discover creators</Link>
        </Button>
      </div>
    </AppShell>
  );
}

function ProfilePage() {
  const { username } = Route.useParams();
  const { user: authUser } = useAuth();
  const { data, isLoading, isError } = useUserProfile(username);
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("posts");
  const [followTab, setFollowTab] = useState<"followers" | "following" | null>(null);
  const followUser = useFollowUser();

  const isMe = authUser?.username === username;
  const postsQuery = useUserPosts(username);
  const likesQuery = useLikedPosts(username, isMe && tab === "likes");

  if (isLoading) {
    return (
      <AppShell>
        <p className="py-16 text-center text-sm text-muted-foreground">Loading profile…</p>
      </AppShell>
    );
  }
  if (isError || !data?.user) return <ProfileNotFound />;

  const profile = data.user;
  const displayUser = {
    id: profile._id,
    name: profile.name,
    username: profile.username,
    bio: profile.bio,
    avatarHue: profile.avatarHue,
    avatarUrl: profile.avatarUrl,
    verified: profile.verified,
    creator: profile.isCreator,
    live: profile.isLive,
    followers: profile.followersCount,
    following: profile.followingCount,
    posts: profile.postsCount,
  };

  const allPosts = postsQuery.data?.pages.flatMap((p) => p.posts) ?? [];
  const grid =
    tab === "reels"
      ? allPosts.filter((p) => p.kind === "reel")
      : tab === "likes"
        ? likesQuery.data?.posts ?? []
        : allPosts;

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[900px]">
        <header className="surface-card relative mb-4 overflow-hidden p-0">
          <div
            className="h-32 w-full sm:h-44"
            style={{
              backgroundImage: `linear-gradient(120deg, oklch(0.42 0.11 ${displayUser.avatarHue}), oklch(0.72 0.12 ${displayUser.avatarHue + 30}))`,
            }}
          />
          <div className="px-4 pb-5 sm:px-6">
            <div className="-mt-12 flex items-end gap-4 sm:-mt-14">
              <span className="rounded-full ring-4 ring-card">
                <GAvatar user={displayUser} size="xl" />
              </span>
              <div className="ml-auto flex gap-2 pb-1">
                {isMe ? (
                  <>
                    <Button variant="outline" asChild>
                      <Link to="/settings">
                        <Settings className="size-4" /> Edit profile
                      </Link>
                    </Button>
                    {authUser?.isCreator && (
                      <Button variant="brand" asChild>
                        <Link to="/studio">Studio</Link>
                      </Button>
                    )}
                  </>
                ) : (
                  <Button
                    variant={profile.isFollowing ? "outline" : "brand"}
                    onClick={() => {
                      const wasFollowing = profile.isFollowing;
                      followUser.mutate(
                        { username, follow: !wasFollowing },
                        {
                          onSuccess: () => toast.success(wasFollowing ? `Unfollowed @${username}` : `Following @${username}`),
                          onError: (err: any) => toast.error(err.message || "Couldn't update follow status"),
                        },
                      );
                    }}
                  >
                    {profile.isFollowing ? "Following" : "Follow"}
                  </Button>
                )}
              </div>
            </div>

            <h1 className="mt-3 flex items-center gap-2 font-display text-xl font-extrabold tracking-tight">
              {displayUser.name}
              {displayUser.verified && <VerifiedBadge className="size-5" />}
            </h1>
            <p className="text-sm text-muted-foreground">@{displayUser.username}</p>
            {displayUser.bio && <p className="mt-2 max-w-xl text-sm leading-relaxed">{displayUser.bio}</p>}

            <ul className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <CalendarDays className="size-3.5" />
                Joined {new Date(profile.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
              </li>
            </ul>

            <ul className="mt-4 flex gap-6">
              {[
                { label: "Posts", value: profile.postsCount, onClick: undefined },
                { label: "Followers", value: profile.followersCount, onClick: () => setFollowTab("followers") },
                { label: "Following", value: profile.followingCount, onClick: () => setFollowTab("following") },
              ].map((s) =>
                s.onClick ? (
                  <button key={s.label} type="button" onClick={s.onClick} className="press text-left">
                    <span className="block font-display text-lg font-extrabold">{formatCount(s.value)}</span>
                    <span className="text-xs text-muted-foreground hover:text-foreground">{s.label}</span>
                  </button>
                ) : (
                  <li key={s.label}>
                    <span className="block font-display text-lg font-extrabold">{formatCount(s.value)}</span>
                    <span className="text-xs text-muted-foreground">{s.label}</span>
                  </li>
                ),
              )}
            </ul>
          </div>
        </header>

        <div className="glass mb-4 flex gap-1 rounded-2xl border p-1">
          {tabs.map((t) => {
            if (t.id === "likes" && !isMe) return null;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "press flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-sm font-semibold",
                  t.id === tab ? "bg-primary-soft text-primary" : "text-muted-foreground",
                )}
              >
                <t.icon className="size-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {grid.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Nothing here yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {grid.map((item) => {
              const image = mediaUrl(item.mediaUrl);
              return (
                <div key={item._id} className="group relative aspect-square overflow-hidden rounded-2xl bg-elevated">
                  {image ? (
                    <img
                      src={image}
                      alt={item.body.slice(0, 60)}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <p className="p-4 text-sm leading-snug">{item.body}</p>
                  )}
                  <span className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/70 to-transparent p-2 text-xs font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <Heart className="size-3.5 fill-white" />
                    {formatCount(item.likesCount)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <FollowListDialog username={username} tab={followTab} onOpenChange={(open) => !open && setFollowTab(null)} />
    </AppShell>
  );
}
