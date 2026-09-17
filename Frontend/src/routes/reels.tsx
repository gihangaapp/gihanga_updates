import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bookmark,
  Camera,
  ChevronDown,
  ChevronUp,
  Heart,
  Loader2,
  MessageCircle,
  MoreVertical,
  Music2,
  Play,
  RefreshCw,
  Send,
  Share2,
  Trash2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { openCreate } from "@/components/create/CreateHub";
import { AppShell } from "@/components/layout/AppShell";
import { GAvatar, VerifiedBadge } from "@/components/common/GAvatar";
import { Button } from "@/components/ui/button";
import { CommentSheet } from "@/components/viewing/CommentSheet";
import { ShareSheet } from "@/components/viewing/ShareSheet";
import { formatCount } from "@/lib/format";
import { FeedPost, mediaUrl } from "@/lib/api-client";
import { useReelsFeed, useToggleLike, useToggleBookmark, useDeletePost } from "@/hooks/use-posts";
import { useFollowUser, useFollowingSet } from "@/hooks/use-social";
import { useAuth } from "@/lib/auth-context";
import { logRecommendationEvent } from "@/hooks/use-recommendations";
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

function toDisplayUser(author: any) {
  if (!author || typeof author === "string") {
    return {
      id: typeof author === "string" ? author : "unknown",
      name: "Creator",
      username: "creator",
      bio: "",
      avatarHue: 0,
      avatarUrl: null,
      verified: false,
      creator: true,
      live: false,
      followers: 0,
      following: 0,
      posts: 0,
    };
  }
  return {
    id: author._id || "unknown",
    name: author.name || "Creator",
    username: author.username || "creator",
    bio: author.bio || "",
    avatarHue: author.avatarHue ?? 0,
    avatarUrl: author.avatarUrl ?? null,
    verified: Boolean(author.verified),
    creator: Boolean(author.isCreator),
    live: Boolean(author.isLive),
    followers: author.followersCount ?? 0,
    following: 0,
    posts: 0,
  };
}

function ReelCard({
  reel,
  isActive,
  isMuted,
  onToggleMute,
}: {
  reel: FeedPost;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
}) {
  const { user } = useAuth();
  const [playing, setPlaying] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [burst, setBurst] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const lastTap = useRef(0);

  const toggleLike = useToggleLike();
  const toggleBookmark = useToggleBookmark();
  const deletePost = useDeletePost();
  const followUser = useFollowUser();
  const { data: followingSet } = useFollowingSet();

  const authorObj = typeof reel.author === "object" ? reel.author : null;
  const authorUsername = authorObj?.username || "creator";
  const authorName = authorObj?.name || "Creator";
  const authorAvatar = authorObj?.avatarUrl;

  const isOwn = user?.username === authorUsername;
  const following = followingSet?.has(authorUsername) ?? Boolean(reel.followingAuthor);

  // Viewport Active Playing & Audio Isolation Management
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive && !hasError) {
      video.muted = isMuted;
      video
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    } else {
      // Immediately pause and silence any non-active reel
      video.pause();
      video.muted = true;
      setPlaying(false);
    }
  }, [isActive, hasError, isMuted]);

  const handleLike = useCallback(() => {
    logRecommendationEvent({
      event: reel.liked ? "reel_unlike" : "reel_like",
      targetKind: "reel",
      targetId: reel._id,
      creatorId: String(authorObj?._id ?? reel.author),
      tags: Array.isArray(reel.tags) ? reel.tags : [],
    });
    toggleLike.mutate(reel._id);
  }, [toggleLike, reel._id, reel.liked, authorObj?._id, reel.author, reel.tags]);

  const togglePlay = () => {
    if (!videoRef.current || hasError) return;
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      videoRef.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  };

  const handleMediaTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      if (!reel.liked) handleLike();
      setBurst(true);
      setTimeout(() => setBurst(false), 700);
    } else {
      togglePlay();
    }
    lastTap.current = now;
  };

  const maxCharLimit = 90;
  const bodyText = reel.body || "";
  const isLongCaption = bodyText.length > maxCharLimit;
  const displayCaption = isLongCaption && !isExpanded
    ? `${bodyText.slice(0, maxCharLimit)}…`
    : bodyText;

  const mediaSrc = mediaUrl(reel.mediaUrl);
  const tagsList = Array.isArray(reel.tags) ? reel.tags : [];
  const primaryTag = tagsList[0] || "REELS";

  return (
    <article
      data-reel-id={reel._id}
      className="relative h-[calc(100vh-9rem)] max-h-[860px] w-full shrink-0 overflow-hidden rounded-3xl bg-black lg:h-[calc(100vh-7rem)] select-none shadow-float"
      style={{ scrollSnapAlign: "center" }}
    >
      {/* Video Element */}
      {mediaSrc && !hasError ? (
        <video
          ref={videoRef}
          src={mediaSrc}
          poster={mediaUrl(reel.thumbnailUrl)}
          autoPlay={isActive}
          loop
          muted={isMuted}
          playsInline
          onLoadedData={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          onClick={handleMediaTap}
          className="size-full object-cover cursor-pointer"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center text-white">
          <p className="text-sm font-semibold">Unable to play this Reel.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setHasError(false);
              setIsLoading(true);
              if (videoRef.current) videoRef.current.load();
            }}
            className="gap-2 text-white border-white/30 hover:bg-white/20"
          >
            <RefreshCw className="size-4" /> Retry
          </Button>
        </div>
      )}

      {/* Loading Spinner */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 grid place-items-center bg-black/40 pointer-events-none">
          <Loader2 className="size-8 animate-spin text-white" />
        </div>
      )}

      {/* Subtle Play/Pause Overlay Feedback */}
      {!playing && !isLoading && !hasError && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 grid place-items-center cursor-pointer bg-black/20"
        >
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="grid size-16 place-items-center rounded-full bg-black/50 text-white backdrop-blur-md"
          >
            <Play className="size-8 fill-white ml-1" />
          </motion.span>
        </div>
      )}

      {/* Double Tap Heart Burst */}
      <AnimatePresence>
        {burst && (
          <motion.span
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: [0.3, 1.25, 1], opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, times: [0, 0.4, 1] }}
            className="pointer-events-none absolute inset-0 z-20 grid place-items-center"
          >
            <Heart className="size-24 fill-danger text-danger drop-shadow-2xl" />
          </motion.span>
        )}
      </AnimatePresence>

      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />

      {/* Top Header Overlay matching screenshot (Reels title at top-left, Camera & Mute icons at top-right) */}
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 via-black/30 to-transparent">
        <h2 className="font-display text-xl font-extrabold text-white drop-shadow-md tracking-tight">
          Reels
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={isMuted ? "Unmute sound" : "Mute sound"}
            onClick={onToggleMute}
            className="press grid size-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60"
          >
            {isMuted ? <VolumeX className="size-4.5" /> : <Volume2 className="size-4.5" />}
          </button>
          <button
            type="button"
            onClick={() => openCreate("reel")}
            className="press grid size-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60"
            title="Create Reel"
          >
            <Camera className="size-5" />
          </button>
        </div>
      </div>

      {/* Right Side Interaction Rail matching screenshot */}
      <div className="absolute right-3 bottom-16 z-20 flex flex-col items-center gap-5 text-white">
        {/* Like (Heart Icon + Count below) */}
        <button
          type="button"
          onClick={handleLike}
          className="press flex flex-col items-center gap-1"
        >
          <span
            className={cn(
              "grid size-11 place-items-center rounded-full bg-black/40 backdrop-blur-md transition-colors",
              reel.liked && "bg-danger/20 text-danger"
            )}
          >
            <Heart className={cn("size-6", reel.liked && "fill-danger text-danger")} strokeWidth={2} />
          </span>
          <span className="text-[11px] font-extrabold text-white drop-shadow-md">{formatCount(reel.likesCount || 0)}</span>
        </button>

        {/* Comment (Speech Bubble + Count below) */}
        <button
          type="button"
          onClick={() => setCommentsOpen(true)}
          className="press flex flex-col items-center gap-1"
        >
          <span className="grid size-11 place-items-center rounded-full bg-black/40 backdrop-blur-md">
            <MessageCircle className="size-6 text-white" strokeWidth={2} />
          </span>
          <span className="text-[11px] font-extrabold text-white drop-shadow-md">{formatCount(reel.commentsCount || 0)}</span>
        </button>

        {/* Share (Paper Plane Send Icon) */}
        <button
          type="button"
          onClick={() => setShareOpen(true)}
          className="press flex flex-col items-center gap-1"
        >
          <span className="grid size-11 place-items-center rounded-full bg-black/40 backdrop-blur-md">
            <Send className="size-6 text-white" strokeWidth={2} />
          </span>
          <span className="text-[11px] font-extrabold text-white drop-shadow-md">
            {reel.sharesCount && reel.sharesCount > 0 ? formatCount(reel.sharesCount) : ""}
          </span>
        </button>

        {/* Three Dots More Menu */}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className="press flex flex-col items-center gap-1"
        >
          <span className="grid size-11 place-items-center rounded-full bg-black/40 backdrop-blur-md">
            <MoreVertical className="size-6 text-white" strokeWidth={2} />
          </span>
        </button>

        {/* Spinning Audio Album Artwork Square matching screenshot bottom right */}
        <div className="relative mt-2 size-10 rounded-xl overflow-hidden border-2 border-white/80 shadow-lg bg-gradient-to-tr from-indigo-600 via-violet-600 to-primary flex items-center justify-center animate-spin [animation-duration:8s]">
          {authorAvatar ? (
            <img src={mediaUrl(authorAvatar)} alt="" className="size-full object-cover" />
          ) : (
            <Music2 className="size-5 text-white" />
          )}
        </div>
      </div>

      {/* Bottom Creator & Audio Information Overlay matching screenshot */}
      <div className="absolute inset-x-0 bottom-0 z-20 p-5 pr-20 text-white space-y-2">
        {/* Audio Track Tag Badge Pill */}
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold text-white backdrop-blur-md border border-white/20">
          <Music2 className="size-3.5" />
          <span className="truncate max-w-[160px] uppercase tracking-wider text-[10px]">
            {primaryTag}
          </span>
        </div>

        {/* Creator Row (Avatar, Username, Follow button) */}
        <div className="flex items-center gap-2.5 pt-1">
          <Link
            to="/profile/$username"
            params={{ username: authorUsername }}
            className="press flex items-center gap-2"
          >
            <GAvatar user={toDisplayUser(reel.author)} size="sm" />
            <span className="text-sm font-extrabold text-white truncate hover:underline">{authorUsername}</span>
            {authorObj?.verified && <VerifiedBadge />}
          </Link>

          {!isOwn && (
            <button
              type="button"
              onClick={() =>
                followUser.mutate(
                  { username: authorUsername, follow: !following },
                  { onError: (err: any) => toast.error(err.message || "Couldn't update follow status") }
                )
              }
              className={cn(
                "rounded-xl border px-3 py-1 text-xs font-bold transition-all shadow-md",
                following
                  ? "border-white/30 bg-white/10 text-white backdrop-blur-md"
                  : "border-white bg-white text-slate-950 hover:bg-white/90"
              )}
            >
              {following ? "Following" : "Follow"}
            </button>
          )}
        </div>

        {/* Caption / Description Text */}
        {bodyText && (
          <p className="max-w-md text-xs leading-relaxed text-white/95 drop-shadow-md">
            {displayCaption}
            {isLongCaption && (
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="ml-1 text-xs font-extrabold text-white hover:underline"
              >
                {isExpanded ? "Show less" : "more"}
              </button>
            )}
          </p>
        )}

        {/* Bottom Audio Track Ticker Line */}
        <div className="flex items-center gap-2 text-[11px] text-white/80 pt-1 font-medium">
          <span>↗</span>
          <span className="truncate">Original audio — {authorName}</span>
          <span>·</span>
          <span className="truncate text-white/70">✨ {primaryTag}</span>
        </div>
      </div>

      {/* Integrated Comments Sheet */}
      <CommentSheet post={reel} open={commentsOpen} onOpenChange={setCommentsOpen} />

      {/* Integrated Share Sheet */}
      <ShareSheet
        open={shareOpen}
        onOpenChange={setShareOpen}
        title={`Reel by @${authorUsername} on Gihanga Updates`}
        text={reel.body}
        url={`${typeof window !== "undefined" ? window.location.origin : ""}/post/${reel._id}`}
      />

      {/* More Options Modal Sheet */}
      {moreOpen && (
        <div
          onClick={() => setMoreOpen(false)}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl border border-white/20 bg-slate-900 p-4 text-white shadow-2xl space-y-2"
          >
            <button
              type="button"
              onClick={() => {
                toggleBookmark.mutate(reel._id);
                setMoreOpen(false);
                toast.success(reel.bookmarked ? "Removed from bookmarks" : "Saved to bookmarks");
              }}
              className="flex w-full items-center gap-3 rounded-2xl p-3 text-xs font-bold hover:bg-white/10"
            >
              <Bookmark className="size-4.5" />
              <span>{reel.bookmarked ? "Remove from bookmarks" : "Save to bookmarks"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMoreOpen(false);
                setShareOpen(true);
              }}
              className="flex w-full items-center gap-3 rounded-2xl p-3 text-xs font-bold hover:bg-white/10"
            >
              <Share2 className="size-4.5" />
              <span>Share Reel</span>
            </button>

            {isOwn && (
              <button
                type="button"
                onClick={() => {
                  setMoreOpen(false);
                  deletePost.mutate(reel._id);
                  toast.success("Reel deleted");
                }}
                className="flex w-full items-center gap-3 rounded-2xl p-3 text-xs font-bold text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="size-4.5" />
                <span>Delete Reel</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setMoreOpen(false)}
              className="w-full rounded-2xl bg-white/10 py-2.5 text-xs font-bold text-white hover:bg-white/20"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

function ReelsPage() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useReelsFeed();
  const reels = data?.pages.flatMap((p) => p.posts) ?? [];
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Set up IntersectionObserver to detect currently visible centered Reel
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const reelId = entry.target.getAttribute("data-reel-id");
            const idx = reels.findIndex((r) => r._id === reelId);
            if (idx >= 0) setActiveReelIndex(idx);
          }
        }
      },
      { root: null, threshold: [0.5, 0.75] }
    );

    const children = container.querySelectorAll("article[data-reel-id]");
    children.forEach((child) => observer.observe(child));

    // Also add scroll listener for instant index detection
    const handleScroll = () => {
      const articles = container.querySelectorAll("article[data-reel-id]");
      if (!articles.length) return;
      const centerY = window.innerHeight / 2;
      let closestIdx = 0;
      let minDistance = Infinity;

      articles.forEach((art, i) => {
        const rect = art.getBoundingClientRect();
        const artCenter = rect.top + rect.height / 2;
        const dist = Math.abs(artCenter - centerY);
        if (dist < minDistance) {
          minDistance = dist;
          closestIdx = i;
        }
      });

      if (minDistance < window.innerHeight * 0.45) {
        setActiveReelIndex(closestIdx);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
      container.removeEventListener("scroll", handleScroll);
    };
  }, [reels]);

  const scrollToReel = (idx: number) => {
    const container = containerRef.current;
    if (!container) return;
    const targets = container.querySelectorAll("article[data-reel-id]");
    if (targets[idx]) {
      targets[idx].scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[460px] relative">
        {/* Desktop Side Navigation Arrows */}
        {reels.length > 1 && (
          <div className="hidden lg:flex flex-col gap-2 absolute -right-16 top-1/2 -translate-y-1/2 z-30">
            <button
              type="button"
              disabled={activeReelIndex === 0}
              onClick={() => scrollToReel(activeReelIndex - 1)}
              className="press grid size-11 place-items-center rounded-full bg-surface border border-border shadow-soft text-foreground disabled:opacity-30"
              title="Previous Reel"
            >
              <ChevronUp className="size-6" />
            </button>
            <button
              type="button"
              disabled={activeReelIndex === reels.length - 1}
              onClick={() => scrollToReel(activeReelIndex + 1)}
              className="press grid size-11 place-items-center rounded-full bg-surface border border-border shadow-soft text-foreground disabled:opacity-30"
              title="Next Reel"
            >
              <ChevronDown className="size-6" />
            </button>
          </div>
        )}

        {/* Reels Vertical Scroll Container */}
        <div
          ref={containerRef}
          className="flex flex-col gap-4 overflow-y-auto no-scrollbar"
          style={{ scrollSnapType: "y mandatory" }}
        >
          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
              <Loader2 className="size-5 animate-spin text-primary" /> Loading reels…
            </div>
          )}
          {!isLoading && reels.length === 0 && (
            <div className="surface-card rounded-3xl p-8 text-center text-muted-foreground space-y-3">
              <Play className="size-10 mx-auto text-muted-foreground/40" />
              <p className="text-sm font-semibold">No reels yet — be the first to post one!</p>
              <Button variant="brand" size="sm" onClick={() => openCreate("reel")}>
                Create a Reel
              </Button>
            </div>
          )}
          {reels.map((r, i) => (
            <ReelCard
              key={r._id}
              reel={r}
              isActive={i === activeReelIndex}
              isMuted={isMuted}
              onToggleMute={() => setIsMuted((prev) => !prev)}
            />
          ))}
          {hasNextPage && (
            <div className="flex justify-center py-6">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage && <Loader2 className="size-4 animate-spin" />}
                Load more reels
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
