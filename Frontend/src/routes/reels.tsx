import { useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, Heart, Loader2, MessageCircle, Pause, Play, Send, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { openCreate } from "@/components/feed/CreateSheet";
import { AppShell } from "@/components/layout/AppShell";
import { GAvatar, UserName } from "@/components/common/GAvatar";
import { Button } from "@/components/ui/button";
import { formatCount } from "@/lib/format";
import { FeedPost, mediaUrl } from "@/lib/api-client";
import { useReelsFeed, useToggleLike, useToggleBookmark } from "@/hooks/use-posts";
import { useFollowUser } from "@/hooks/use-social";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reels")({
  head: () => ({
    meta: [
      { title: "Reels — Short Video from Gihanga Creators" },
      {
        name: "description",
        content:
          "Scroll full-screen short videos from Gihanga creators: dance, street photography, workflows and more.",
      },
      { property: "og:title", content: "Reels — Short Video from Gihanga Creators" },
      {
        property: "og:description",
        content: "Full-screen short video from the Gihanga creator community.",
      },
      { property: "og:type", content: "video.other" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReelsPage,
});

function toDisplayUser(author: FeedPost["author"]) {
  return {
    id: author._id,
    name: author.name,
    username: author.username,
    bio: "",
    avatarHue: author.avatarHue,
    avatarUrl: author.avatarUrl,
    verified: author.verified,
    creator: author.isCreator,
    live: author.isLive,
    followers: 0,
    following: 0,
    posts: 0,
  };
}

function ReelCard({ reel }: { reel: FeedPost }) {
  const { user } = useAuth();
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const toggleLike = useToggleLike();
  const toggleBookmark = useToggleBookmark();
  const followUser = useFollowUser();
  const isOwn = user?.username === reel.author.username;

  function togglePlay() {
    setPlaying((p) => {
      const next = !p;
      if (videoRef.current) next ? videoRef.current.play() : videoRef.current.pause();
      return next;
    });
  }

  return (
    <article
      className="relative h-[calc(100vh-9rem)] max-h-[860px] w-full shrink-0 overflow-hidden rounded-3xl bg-black lg:h-[calc(100vh-7rem)]"
      style={{ scrollSnapAlign: "center" }}
    >
      <video
        ref={videoRef}
        src={mediaUrl(reel.mediaUrl)}
        poster={mediaUrl(reel.thumbnailUrl)}
        autoPlay
        loop
        muted={muted}
        playsInline
        className="size-full object-cover"
      />
      <button
        type="button"
        aria-label={playing ? "Pause" : "Play"}
        onClick={togglePlay}
        className="absolute inset-0 grid place-items-center"
      >
        {!playing && (
          <span className="grid size-16 place-items-center rounded-full bg-black/40 backdrop-blur-sm">
            <Play className="size-8 fill-white text-white" />
          </span>
        )}
      </button>

      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          type="button"
          aria-label={muted ? "Unmute" : "Mute"}
          onClick={() => setMuted((m) => !m)}
          className="press grid size-10 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm"
        >
          {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
        </button>
        {playing && (
          <span className="grid size-10 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm">
            <Pause className="size-4" />
          </span>
        )}
      </div>

      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5 text-white">
        {[
          {
            icon: Heart,
            label: formatCount(reel.likesCount),
            active: reel.liked,
            onClick: () => toggleLike.mutate(reel._id),
          },
          {
            icon: MessageCircle,
            label: formatCount(reel.commentsCount),
            onClick: () => toast("Open this reel from the feed to comment"),
          },
          {
            icon: Send,
            label: formatCount(reel.sharesCount),
            onClick: () => {
              navigator.clipboard?.writeText(`${window.location.origin}/post/${reel._id}`);
              toast.success("Link copied");
            },
          },
          {
            icon: Bookmark,
            label: "Save",
            active: reel.bookmarked,
            onClick: () => {
              toggleBookmark.mutate(reel._id);
              toast.success(reel.bookmarked ? "Removed from saved" : "Saved to bookmarks");
            },
          },
        ].map((a) => (
          <button key={a.label} type="button" onClick={a.onClick} className="press flex flex-col items-center gap-1">
            <span className="grid size-11 place-items-center rounded-full bg-white/12 backdrop-blur-sm">
              <a.icon className={cn("size-6", a.active && "fill-danger text-danger")} strokeWidth={2.2} />
            </span>
            <span className="text-[11px] font-bold">{a.label}</span>
          </button>
        ))}
      </div>

      <div className="absolute inset-x-0 bottom-0 p-5 pr-20 text-white">
        <div className="mb-3 flex items-center gap-3">
          <Link to="/profile/$username" params={{ username: reel.author.username }} className="press flex items-center gap-3">
            <GAvatar user={toDisplayUser(reel.author)} size="sm" ring="story" />
            <UserName user={toDisplayUser(reel.author)} className="text-sm" />
          </Link>
          {!isOwn && (
            <button
              type="button"
              onClick={() => followUser.mutate({ username: reel.author.username, follow: !reel.followingAuthor })}
              className="rounded-full border border-white/40 px-3 py-1 text-xs font-bold"
            >
              {reel.followingAuthor ? "Following" : "Follow"}
            </button>
          )}
        </div>
        {reel.body && <p className="mb-2 max-w-lg text-sm leading-snug">{reel.body}</p>}
        {reel.tags.length > 0 && (
          <p className="mb-2 flex flex-wrap gap-2 text-xs font-semibold text-white/80">
            {reel.tags.map((t) => (
              <span key={t}>#{t}</span>
            ))}
          </p>
        )}
        <p className="flex items-center gap-2 text-xs text-white/85">
          <span className="ml-auto shrink-0">{formatCount(reel.viewsCount)} views</span>
        </p>
      </div>
    </article>
  );
}

function ReelsPage() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useReelsFeed();
  const reels = data?.pages.flatMap((p) => p.posts) ?? [];

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[460px]">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="font-display text-2xl font-extrabold tracking-tight">Reels</h1>
          <Button variant="brand" size="pill" onClick={() => openCreate("reel")}>
            Create
          </Button>
        </div>
        <div className="flex flex-col gap-4 overflow-y-auto no-scrollbar" style={{ scrollSnapType: "y mandatory" }}>
          {isLoading && (
            <p className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading reels…
            </p>
          )}
          {!isLoading && reels.length === 0 && (
            <p className="py-16 text-center text-sm text-muted-foreground">
              No reels yet — be the first to post one.
            </p>
          )}
          {reels.map((r) => (
            <ReelCard key={r._id} reel={r} />
          ))}
          {hasNextPage && (
            <div className="flex justify-center py-6">
              <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                {isFetchingNextPage && <Loader2 className="size-4 animate-spin" />}
                Load more
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
