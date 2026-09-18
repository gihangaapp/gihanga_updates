import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
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
import {
  ReelWheelArbiter,
  WHEEL_SILENCE_MS,
  clampReelIndex,
  normaliseWheelDelta,
  reelIndexFromScroll,
} from "@/lib/reel-scroll";

export const Route = createFileRoute("/reels")({
  validateSearch: (search: Record<string, unknown>): { reel?: string | undefined } => ({
    ...(typeof search["reel"] === "string" ? { reel: search["reel"] } : {}),
  }),
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

function toDisplayUser(author: unknown) {
  const a = (typeof author === "object" && author !== null ? author : {}) as Record<
    string,
    unknown
  >;
  return {
    id: typeof a["_id"] === "string" ? (a["_id"] as string) : "unknown",
    name: typeof a["name"] === "string" ? (a["name"] as string) : "Creator",
    username: typeof a["username"] === "string" ? (a["username"] as string) : "creator",
    bio: "",
    avatarHue: typeof a["avatarHue"] === "number" ? (a["avatarHue"] as number) : 0,
    avatarUrl: (a["avatarUrl"] as string | null) ?? null,
    verified: Boolean(a["verified"]),
    creator: Boolean(a["isCreator"]),
    live: Boolean(a["isLive"]),
    followers: typeof a["followersCount"] === "number" ? (a["followersCount"] as number) : 0,
    following: 0,
    posts: 0,
  };
}

function ReelCard({
  reel,
  isActive,
  isNeighbor,
  isMuted,
  onToggleMute,
}: {
  reel: FeedPost;
  /** The centered, playing reel. */
  isActive: boolean;
  /** Rendered/mounted for instant prev/next navigation, but paused + muted. */
  isNeighbor: boolean;
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

  const mediaSrc = mediaUrl(reel.mediaUrl);
  // B5 — windowed virtualization: the active reel and its ±1 neighbours stay
  // mounted (sources attached) so arrow/wheel navigation is INSTANT; anything
  // further away renders an empty snap cell (no network, no decode).
  const attachSrc = (isActive || isNeighbor) && !hasError;

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

  // Reset progress when this reel becomes active again.
  useEffect(() => {
    if (isActive && videoRef.current && !hasError) {
      // keep position if returning from a comment sheet mid-play
      void videoRef.current.play().catch(() => {});
    }
  }, [isActive, hasError]);

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
      videoRef.current
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
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
  const displayCaption =
    isLongCaption && !isExpanded ? `${bodyText.slice(0, maxCharLimit)}…` : bodyText;

  const tagsList = Array.isArray(reel.tags) ? reel.tags : [];
  const primaryTag = tagsList[0] || "REELS";

  return (
    <article
      data-reel-id={reel._id}
      className="relative flex h-full w-full shrink-0 flex-col justify-center overflow-hidden rounded-3xl bg-black select-none shadow-float"
    >
      {/* B5.8 — snap points live ONLY on the direct wrapper children of the
          scroller (see below). Declaring a second, padded snap area here made
          the browser choose between two points ~4px apart per card, which
          showed up as the reel feed "dancing" between them. */}
      {/* Video Element — neighbours keep their source for instant navigation. */}
      {mediaSrc && attachSrc ? (
        <video
          ref={videoRef}
          src={mediaSrc}
          poster={mediaUrl(reel.thumbnailUrl)}
          autoPlay={isActive}
          loop
          muted={isMuted || !isActive}
          playsInline
          preload={isActive ? "auto" : "metadata"}
          onLoadedData={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          onClick={handleMediaTap}
          onContextMenu={(e) => e.preventDefault()}
          className="size-full cursor-pointer object-contain"
        />
      ) : hasError ? (
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
            className="gap-2 border-white/30 text-white hover:bg-white/20"
          >
            <RefreshCw className="size-4" /> Retry
          </Button>
        </div>
      ) : (
        // Placeholder cell (far-away reels in the window): keeps the snap
        // geometry stable without holding any media resources.
        <div className="flex h-full w-full items-center justify-center bg-black/80">
          <Music2 className="size-8 animate-pulse text-white/20" />
        </div>
      )}

      {/* Loading Spinner */}
      {isLoading && attachSrc && !hasError && (
        <div className="absolute inset-0 grid place-items-center bg-black/40 pointer-events-none">
          <Loader2 className="size-8 animate-spin text-white" />
        </div>
      )}

      {/* Subtle Play/Pause Overlay Feedback */}
      {!playing && !isLoading && !hasError && isActive && (
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
          data-reel-action="like"
          onClick={handleLike}
          className="press flex flex-col items-center gap-1"
        >
          <span
            className={cn(
              "grid size-11 place-items-center rounded-full bg-black/40 backdrop-blur-md transition-colors",
              reel.liked && "bg-danger/20 text-danger",
            )}
          >
            <Heart
              className={cn("size-6", reel.liked && "fill-danger text-danger")}
              strokeWidth={2}
            />
          </span>
          <span className="text-[11px] font-extrabold text-white drop-shadow-md">
            {formatCount(reel.likesCount || 0)}
          </span>
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
          <span className="text-[11px] font-extrabold text-white drop-shadow-md">
            {formatCount(reel.commentsCount || 0)}
          </span>
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
        <div className="relative mt-2 size-10 rounded-xl overflow-hidden border-2 border-white/80 shadow-lg bg-gradient-to-tr from-indigo-600 via-violet-600 to-primary flex items-center justify-center animate-spin [animation-duration:8s] motion-reduce:animate-none">
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
            <span className="text-sm font-extrabold text-white truncate hover:underline">
              {authorUsername}
            </span>
            {authorObj?.verified && <VerifiedBadge />}
          </Link>

          {!isOwn && (
            <button
              type="button"
              onClick={() =>
                followUser.mutate(
                  { username: authorUsername, follow: !following },
                  {
                    onError: (err: Error) =>
                      toast.error(err.message || "Couldn't update follow status"),
                  },
                )
              }
              className={cn(
                "rounded-xl border px-3 py-1 text-xs font-bold transition-all shadow-md",
                following
                  ? "border-white/30 bg-white/10 text-white backdrop-blur-md"
                  : "border-white bg-white text-slate-950 hover:bg-white/90",
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

/** B5 — key target ignore check: typing in inputs/sheets must not navigate. */
function shouldIgnoreReelKeys(): boolean {
  const active = document.activeElement;
  if (
    active instanceof HTMLElement &&
    (active.tagName === "INPUT" ||
      active.tagName === "TEXTAREA" ||
      active.tagName === "SELECT" ||
      active.isContentEditable)
  ) {
    return true;
  }
  // Any open dialog / sheet (Radix portals focus into them).
  return Boolean(
    document.querySelector("[role='dialog'][data-state='open'], [data-state='open'] > .fixed"),
  );
}

function ReelsPage() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useReelsFeed();
  const reels = useMemo(() => data?.pages.flatMap((p) => p.posts) ?? [], [data]);
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const navigate = useNavigate();
  const { reel: deepLinkReel } = useSearch({ from: "/reels" });

  const containerRef = useRef<HTMLDivElement>(null);
  // B5.8 — mirrors of state for listeners that are registered ONCE.
  const activeIndexRef = useRef(0);
  const reelsLengthRef = useRef(0);
  useEffect(() => {
    activeIndexRef.current = activeReelIndex;
  }, [activeReelIndex]);
  useEffect(() => {
    reelsLengthRef.current = reels.length;
  }, [reels.length]);

  // B5.8 — while the reels route is mounted the PAGE itself never scrolls:
  // hides the desktop page scrollbar (full-screen player feel) and removes
  // the page-level scroll target that scrollIntoView used to drag around.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("reels-page-scroll-lock");
    return () => {
      root.classList.remove("reels-page-scroll-lock");
    };
  }, []);

  // ── B5.8 — navigation primitives ──────────────────────────────────────────
  // ONLY the snap container scrolls, ONLY to exact card multiples. Never
  // scrollIntoView(): it also scrolls every scrollable ancestor (the page!)
  // and its smooth animation fights the mandatory CSS snap — the two effects
  // behind the feed "dancing" and skipping a video then snapping back.
  const goToReelImpl = useCallback((idx: number) => {
    const container = containerRef.current;
    if (!container) return;
    const target = clampReelIndex(idx, reelsLengthRef.current);
    container.scrollTo({ top: target * container.clientHeight, behavior: "smooth" });
  }, []);

  /** Step one reel from the CURRENT GEOMETRY (never a stale React state),
   * so chained input mid-animation retargets correctly. */
  const navigateStep = useCallback((dir: 1 | -1) => {
    const container = containerRef.current;
    if (!container || reelsLengthRef.current === 0) return;
    const current = reelIndexFromScroll(container.scrollTop, container.clientHeight);
    const target = clampReelIndex(current + dir, reelsLengthRef.current);
    container.scrollTo({ top: target * container.clientHeight, behavior: "smooth" });
  }, []);
  const navigateStepRef = useRef(navigateStep);
  useEffect(() => {
    navigateStepRef.current = navigateStep;
  }, [navigateStep]);

  // B5.7 — deep-link restore: /reels?reel=<id> scrolls to that reel once loaded.
  const deepLinkHandled = useRef(false);
  useEffect(() => {
    if (deepLinkHandled.current || !deepLinkReel || reels.length === 0) return;
    const idx = reels.findIndex((r) => r._id === deepLinkReel);
    if (idx >= 0) {
      deepLinkHandled.current = true;
      setActiveReelIndex(idx);
      // After paint, when the container has its final height — instant snap
      // (no animation to fight on first positioning).
      requestAnimationFrame(() => {
        const container = containerRef.current;
        if (container) {
          container.scrollTo({
            top: clampReelIndex(idx, reelsLengthRef.current) * container.clientHeight,
            behavior: "auto",
          });
        }
      });
    }
  }, [deepLinkReel, reels]);

  // ── B5.8 — active index from scroll GEOMETRY, committed only once the
  // scroll has SETTLED (scrollend where available, 140ms of quiet as the
  // universal fallback). The old rAF handler flipped state mid-flight; the
  // re-render churn while the snap animation ran is exactly what made the
  // feed visibly jitter between cards. ───────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let settleTimer: number | undefined;
    let lastScrollAt = 0;

    const commitIndex = () => {
      const idx = clampReelIndex(
        reelIndexFromScroll(container.scrollTop, container.clientHeight),
        reelsLengthRef.current,
      );
      if (idx !== activeIndexRef.current) {
        activeIndexRef.current = idx;
        setActiveReelIndex(idx);
      }
    };

    const scheduleSettle = (delay: number) => {
      if (settleTimer !== undefined) window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        settleTimer = undefined;
        commitIndex();
      }, delay);
    };

    const onScroll = () => {
      lastScrollAt = Date.now();
      scheduleSettle(140); // fallback for browsers without scrollend
    };
    const onScrollEnd = () => scheduleSettle(0); // snap/programmatic scroll finished

    container.addEventListener("scroll", onScroll, { passive: true });
    const supportsScrollEnd = "onscrollend" in window;
    if (supportsScrollEnd) container.addEventListener("scrollend", onScrollEnd);

    // Viewport/dvh changes (mobile URL bar collapse, window resize) change
    // card heights; re-pin the scroll to the active card's exact offset so
    // the browser's own re-snap can never choose a neighbour — but only
    // while we are settled (never mid-drag/animation).
    const resizeObserver = new ResizeObserver(() => {
      if (Date.now() - lastScrollAt < 180) return;
      const expected = activeIndexRef.current * container.clientHeight;
      if (Math.abs(container.scrollTop - expected) > 1) {
        container.scrollTop = expected;
      }
    });
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener("scroll", onScroll);
      if (supportsScrollEnd) container.removeEventListener("scrollend", onScrollEnd);
      if (settleTimer !== undefined) window.clearTimeout(settleTimer);
      resizeObserver.disconnect();
    };
  }, []);

  // ── B5.6 — infinite prefetch: fetch the next page when the active reel is
  // within 3 of the end. Keeps the scroll position stable (appends only). ────
  useEffect(() => {
    if (
      hasNextPage &&
      !isFetchingNextPage &&
      reels.length > 0 &&
      activeReelIndex >= reels.length - 3
    ) {
      void fetchNextPage();
    }
  }, [activeReelIndex, reels.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const goToReel = useCallback(
    (idx: number) => {
      if (idx < 0 || idx >= reelsLengthRef.current) return;
      goToReelImpl(idx);
    },
    [goToReelImpl],
  );

  // ── B5.3 — keyboard navigation ─────────────────────────────────────────────
  useEffect(() => {
    const onKeyUpCooldown = { last: 0 };
    const onKeyDown = (e: KeyboardEvent) => {
      if (shouldIgnoreReelKeys()) return;
      // Live length via ref — a closure-captured reels.length goes stale
      // when the feed loads after mount and would leave the keys dead.
      if (reelsLengthRef.current === 0) return;

      // Key-repeat throttle (~120ms) so holding a key doesn't turbo-scroll.
      const now = Date.now();
      const isNavKey = ["ArrowDown", "ArrowUp", "j", "k", "PageDown", "PageUp"].includes(e.key);
      if (isNavKey) {
        if (now - onKeyUpCooldown.last < 120) {
          e.preventDefault();
          return;
        }
        onKeyUpCooldown.last = now;
      }

      switch (e.key) {
        case "ArrowDown":
        case "j":
        case "PageDown":
          e.preventDefault();
          navigateStep(1);
          break;
        case "ArrowUp":
        case "k":
        case "PageUp":
          e.preventDefault();
          navigateStep(-1);
          break;
        case "m":
        case "M":
          setIsMuted((prev) => !prev);
          break;
        case " ": {
          e.preventDefault();
          // B5.8 — resolve the video THROUGH the active article (windowed
          // rendering means querySelectorAll("article video") indices do NOT
          // match reel indices; the old lookup toggled the wrong video).
          const activeArticle =
            containerRef.current?.querySelectorAll("article[data-reel-id]")[activeReelIndex];
          const target = activeArticle?.querySelector("video");
          if (target instanceof HTMLVideoElement) {
            if (target.paused) void target.play().catch(() => {});
            else target.pause();
          }
          break;
        }
        case "l":
        case "L": {
          // Like the active reel via its rail button (keeps one code path).
          // B5.8 — target it by data attribute: querying the first generic
          // `.press` button hit the header MUTE button instead.
          const activeArticle =
            containerRef.current?.querySelectorAll("article[data-reel-id]")[activeReelIndex];
          activeArticle?.querySelector<HTMLButtonElement>('[data-reel-action="like"]')?.click();
          break;
        }
        case "Escape":
          navigate({ to: "/", replace: true });
          break;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeReelIndex, navigateStep, navigate]);

  // Focus the viewport on mount so keys work right after page load.
  useEffect(() => {
    containerRef.current?.focus?.();
  }, []);

  // ── B5.8 — wheel/trackpad: we OWN the wheel on this container (every event
  // preventDefault'd, so native wheel snap never fights our animations) and
  // group deltas into gestures via the pure ReelWheelArbiter: one navigation
  // per gesture, re-armed only after 150ms of silence — a trackpad flick's
  // inertia tail can never fire a second, spurious navigation (the
  // "skips a video then snaps back" report). Touch keeps native snap.
  // Registered once; live state comes through refs, never stale closures. ────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const arbiter = new ReelWheelArbiter();
    let silenceTimer: number | undefined;

    const onWheel = (e: WheelEvent) => {
      // Don't hijack wheel events over open overlays — let sheets scroll.
      if (shouldIgnoreReelKeys()) return;
      // Horizontal-intent gestures (shift+wheel, trackpad swipes) are not ours.
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

      // We fully own vertical wheel on the reel viewport.
      e.preventDefault();

      // Re-arm on gesture silence.
      if (silenceTimer !== undefined) window.clearTimeout(silenceTimer);
      silenceTimer = window.setTimeout(() => {
        silenceTimer = undefined;
        arbiter.rearm();
      }, WHEEL_SILENCE_MS);

      const dy = normaliseWheelDelta(e.deltaY, e.deltaMode, container.clientHeight);
      const decision = arbiter.onWheelDelta(dy, performance.now());
      if ("nav" in decision) {
        navigateStepRef.current(decision.nav);
      }
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", onWheel);
      if (silenceTimer !== undefined) window.clearTimeout(silenceTimer);
    };
  }, []);

  return (
    <AppShell>
      {/* B5 — ONE scroll container with a definite height (dvh, not vh: the
          mobile-chrome-safe unit), mandatory Y snap, contained overscroll and
          NO gap between cards (padding lives inside each card) so every snap
          point aligns pixel-perfectly. */}
      <div
        className="mx-auto flex w-full max-w-[460px] flex-col"
        style={{ height: "calc(100dvh - 9rem)" }}
      >
        <div className="relative min-h-0 flex-1">
          {/* Sticky arrows — always visible while scrolling, on desktop AND
              touch; disabled at the ends; visible focus ring for a11y. */}
          {reels.length > 1 && (
            <div className="absolute -right-14 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-2 lg:flex">
              <button
                type="button"
                disabled={activeReelIndex === 0}
                onClick={() => goToReel(activeReelIndex - 1)}
                className="press grid size-11 place-items-center rounded-full bg-surface border border-border shadow-soft text-foreground disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-ring"
                title="Previous Reel (↑ / k)"
                aria-label="Previous reel"
              >
                <ChevronUp className="size-6" />
              </button>
              <button
                type="button"
                disabled={activeReelIndex === reels.length - 1}
                onClick={() => goToReel(activeReelIndex + 1)}
                className="press grid size-11 place-items-center rounded-full bg-surface border border-border shadow-soft text-foreground disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-ring"
                title="Next Reel (↓ / j)"
                aria-label="Next reel"
              >
                <ChevronDown className="size-6" />
              </button>
            </div>
          )}
          {/* Mobile/tablet floating arrows (touch users get snap, arrows are
              a bonus for precision). */}
          {reels.length > 1 && (
            <div className="absolute right-3 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-2 lg:hidden">
              <button
                type="button"
                disabled={activeReelIndex === 0}
                onClick={() => goToReel(activeReelIndex - 1)}
                className="press grid size-10 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md disabled:opacity-25 focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Previous reel"
              >
                <ChevronUp className="size-5" />
              </button>
              <button
                type="button"
                disabled={activeReelIndex === reels.length - 1}
                onClick={() => goToReel(activeReelIndex + 1)}
                className="press grid size-10 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md disabled:opacity-25 focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Next reel"
              >
                <ChevronDown className="size-5" />
              </button>
            </div>
          )}

          {/* The scroller itself */}
          <div
            ref={containerRef}
            tabIndex={-1}
            aria-label="Reels player — use arrow keys or j and k to navigate"
            className="flex h-full w-full flex-col overflow-y-auto no-scrollbar overscroll-contain"
            style={{ scrollSnapType: "y mandatory" }}
          >
            {isLoading && (
              <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-5 animate-spin text-primary" /> Loading reels…
              </div>
            )}
            {!isLoading && reels.length === 0 && (
              <div className="surface-card m-4 rounded-3xl p-8 text-center text-muted-foreground space-y-3">
                <Play className="size-10 mx-auto text-muted-foreground/40" />
                <p className="text-sm font-semibold">No reels yet — be the first to post one!</p>
                <Button variant="brand" size="sm" onClick={() => openCreate("reel")}>
                  Create a Reel
                </Button>
              </div>
            )}
            {reels.map((r, i) => (
              <div
                key={r._id}
                className="h-full w-full shrink-0 p-1 pb-2"
                style={{ scrollSnapAlign: "start", scrollSnapStop: "always" }}
              >
                {/* B5.8 — snap points are declared HERE only (direct children
                    of the scroller): align-start + stop-always per card, one
                    unambiguous point per reel, flings can never skip cards. */}
                <ReelCard
                  reel={r}
                  isActive={i === activeReelIndex}
                  isNeighbor={Math.abs(i - activeReelIndex) === 1}
                  isMuted={isMuted}
                  onToggleMute={() => setIsMuted((prev) => !prev)}
                />
              </div>
            ))}
            {/* Skeleton row while prefetching the next page — compact (a
                full-height row here would add a viewport-sized block to the
                snap scroller for no reason; it is unreachable past the last
                snap point anyway). */}
            {isFetchingNextPage && (
              <div className="flex h-20 items-center justify-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Loading more…
              </div>
            )}
          </div>

          {/* A11y: announce the current reel. */}
          <p aria-live="polite" className="sr-only">
            {reels[activeReelIndex]
              ? `Reel ${activeReelIndex + 1} of ${reels.length} by @${reels[activeReelIndex]?.author?.username ?? "creator"}`
              : ""}
          </p>
        </div>
      </div>
    </AppShell>
  );
}
