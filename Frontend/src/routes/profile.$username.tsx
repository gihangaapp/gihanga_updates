import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarDays,
  Film,
  Grid3x3,
  Heart,
  MessageCircle,
  MoreVertical,
  Play,
  Settings,
  Share2,
  Trash2,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { GAvatar, UserName, VerifiedBadge } from "@/components/common/GAvatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";
import { mediaUrl, PublicUser } from "@/lib/api-client";
import { useUserProfile, useFollowers, useFollowing } from "@/hooks/use-social";
import { useUserPosts, useLikedPosts, useDeletePost } from "@/hooks/use-posts";
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
                        { onError: (err: any) => toast.error(err.message || "Couldn't update follow status") }
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
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  const followUser = useFollowUser();
  const deletePost = useDeletePost();

  const isMe = authUser?.username === username;
  const postsQuery = useUserPosts(username);
  const likesQuery = useLikedPosts(username, isMe && tab === "likes");

  const handleDelete = async (postId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setDeletingPostId(postId);
      await deletePost.mutateAsync(postId);
      toast.success("Post deleted successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete post");
    } finally {
      setDeletingPostId(null);
    }
  };

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
  const reelsList = allPosts.filter((p) => p.kind === "reel");
  const likesList = likesQuery.data?.posts ?? [];

  const grid =
    tab === "reels"
      ? reelsList
      : tab === "likes"
        ? likesList
        : allPosts;

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[900px] pb-10">
        {/* Profile Header Banner & Info */}
        <header className="surface-card relative mb-4 overflow-hidden rounded-3xl border border-border p-0 shadow-soft">
          <div
            className="h-32 w-full sm:h-44"
            style={{
              backgroundImage: `linear-gradient(120deg, oklch(0.42 0.11 ${displayUser.avatarHue}), oklch(0.72 0.12 ${displayUser.avatarHue + 30}))`,
            }}
          />
          <div className="px-4 pb-5 sm:px-6">
            <div className="-mt-12 flex items-end gap-4 sm:-mt-14">
              <span className="rounded-full ring-4 ring-card shadow-lg">
                <GAvatar user={displayUser} size="xl" ring={displayUser.live ? "live" : displayUser.creator ? "creator" : "none"} />
              </span>
              <div className="ml-auto flex gap-2 pb-1">
                {isMe ? (
                  <>
                    <Button variant="outline" asChild className="rounded-xl font-bold">
                      <Link to="/settings">
                        <Settings className="size-4 mr-1.5" /> Edit profile
                      </Link>
                    </Button>
                    {authUser?.isCreator && (
                      <Button variant="brand" asChild className="rounded-xl font-bold">
                        <Link to="/studio">Studio</Link>
                      </Button>
                    )}
                  </>
                ) : (
                  <Button
                    variant={profile.isFollowing ? "outline" : "brand"}
                    className="rounded-xl font-bold"
                    onClick={() => {
                      const wasFollowing = profile.isFollowing;
                      followUser.mutate(
                        { username, follow: !wasFollowing },
                        {
                          onSuccess: () => toast.success(wasFollowing ? `Unfollowed @${username}` : `Following @${username}`),
                          onError: (err: any) => toast.error(err.message || "Couldn't update follow status"),
                        }
                      );
                    }}
                  >
                    {profile.isFollowing ? "Following" : "Follow"}
                  </Button>
                )}
              </div>
            </div>

            <h1 className="mt-3 flex items-center gap-2 font-display text-xl font-extrabold tracking-tight text-foreground">
              {displayUser.name}
              {displayUser.verified && <VerifiedBadge className="size-5" />}
              {displayUser.creator && (
                <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-black uppercase text-amber-500 border border-amber-500/20">
                  Creator
                </span>
              )}
            </h1>
            <p className="text-sm font-medium text-muted-foreground">@{displayUser.username}</p>
            {displayUser.bio && <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground/90">{displayUser.bio}</p>}

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
                    <span className="block font-display text-lg font-extrabold text-foreground">{formatCount(s.value)}</span>
                    <span className="text-xs text-muted-foreground hover:text-foreground">{s.label}</span>
                  </button>
                ) : (
                  <li key={s.label}>
                    <span className="block font-display text-lg font-extrabold text-foreground">{formatCount(s.value)}</span>
                    <span className="text-xs text-muted-foreground">{s.label}</span>
                  </li>
                )
              )}
            </ul>
          </div>
        </header>

        {/* Profile Tabs Navigation */}
        <div className="surface-card mb-4 flex gap-1 rounded-2xl border border-border p-1 shadow-sm">
          {tabs.map((t) => {
            if (t.id === "likes" && !isMe) return null;
            const count =
              t.id === "posts"
                ? allPosts.length
                : t.id === "reels"
                  ? reelsList.length
                  : likesList.length;

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "press flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs sm:text-sm font-bold transition-all",
                  t.id === tab
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <t.icon className="size-4" />
                <span>{t.label}</span>
                {count > 0 && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.2 text-[10px] font-black",
                      t.id === tab ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Posts, Reels, and Likes Media Grid with full audio/video/image support and delete menu */}
        {grid.length === 0 ? (
          <div className="surface-card rounded-3xl p-12 text-center text-muted-foreground border border-border">
            <p className="text-sm font-semibold">
              {tab === "posts"
                ? "No posts shared yet."
                : tab === "reels"
                  ? "No reels published yet."
                  : "No liked posts yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {grid.map((item) => {
              const mediaSrc = mediaUrl(item.mediaUrl) || mediaUrl(item.thumbnailUrl);
              const isVideo = item.kind === "video" || item.kind === "reel" || Boolean(item.mediaUrl?.match(/\.(mp4|webm|mov)$/i));
              const isDeleting = deletingPostId === item._id;

              return (
                <div
                  key={item._id}
                  className="group relative aspect-square overflow-hidden rounded-2xl bg-slate-900 border border-border/60 shadow-soft hover:shadow-hover transition-all"
                >
                  <Link
                    to={item.kind === "reel" ? "/reels" : "/post/$postId"}
                    params={{ postId: item._id }}
                    className="block size-full"
                  >
                    {mediaSrc ? (
                      isVideo ? (
                        <div className="relative size-full bg-black">
                          <video
                            src={mediaSrc}
                            poster={mediaUrl(item.thumbnailUrl)}
                            muted
                            playsInline
                            preload="metadata"
                            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute top-2.5 right-2.5 grid size-6 place-items-center rounded-full bg-black/60 text-white backdrop-blur-md">
                            <Play className="size-3 fill-white ml-0.5" />
                          </div>
                        </div>
                      ) : (
                        <img
                          src={mediaSrc}
                          alt={item.body ? item.body.slice(0, 40) : "Post"}
                          loading="lazy"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = "none";
                            const parent = target.parentElement;
                            if (parent) {
                              parent.classList.add("bg-gradient-to-tr", "from-slate-900", "to-slate-800", "flex", "items-center", "justify-center", "p-4", "text-center");
                            }
                          }}
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )
                    ) : (
                      <div className="flex size-full flex-col justify-between bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 p-4 text-white">
                        <p className="line-clamp-4 text-xs font-semibold leading-relaxed">
                          {item.body || "Text post"}
                        </p>
                        <span className="text-[10px] text-white/60 font-bold uppercase tracking-wider">
                          Note
                        </span>
                      </div>
                    )}

                    {/* Bottom Likes & Comments Hover Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 backdrop-blur-[2px] pointer-events-none">
                      <span className="flex items-center gap-1.5 text-xs font-extrabold text-white drop-shadow-md">
                        <Heart className="size-4 fill-white" />
                        {formatCount(item.likesCount || 0)}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-extrabold text-white drop-shadow-md">
                        <MessageCircle className="size-4 fill-white" />
                        {formatCount(item.commentsCount || 0)}
                      </span>
                    </div>
                  </Link>

                  {/* Actions Dropdown (Delete option for owner) */}
                  {isMe && (
                    <div className="absolute top-2 right-2 z-20">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            aria-label="Post actions"
                            className="press grid size-7 place-items-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80 transition-colors"
                          >
                            <MoreVertical className="size-3.5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          <DropdownMenuItem
                            disabled={isDeleting}
                            onClick={(e) => handleDelete(item._id, e)}
                            className="text-danger focus:bg-danger/10 focus:text-danger cursor-pointer font-bold"
                          >
                            <Trash2 className="size-3.5 mr-2" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
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
