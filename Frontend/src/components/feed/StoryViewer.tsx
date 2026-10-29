import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  MoreHorizontal,
  Send,
  Trash2,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { GAvatar } from "@/components/common/GAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShareSheet } from "@/components/viewing/ShareSheet";
import { StoryComments } from "@/components/feed/StoryComments";
import { timeAgo } from "@/lib/format";
import { mediaUrlWithAuth, StoryGroup } from "@/lib/api-client";
import { useMarkStoryViewed, useDeleteStory, useReplyToStory } from "@/hooks/use-stories";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

function toDisplayUser(author: StoryGroup["author"]) {
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

export function StoryViewer({
  groups,
  startIndex,
  onClose,
}: {
  groups: StoryGroup[];
  startIndex: number;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [index, setIndex] = useState(startIndex);
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const [readyItemId, setReadyItemId] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const raf = useRef<number | null>(null);
  const markViewed = useMarkStoryViewed();
  const deleteStory = useDeleteStory();
  const replyToStory = useReplyToStory();

  const handleSendReply = async () => {
    if (!replyText.trim() || !item?._id || !group || replyToStory.isPending) return;
    const msg = replyText.trim();
    setReplyText("");
    try {
      await replyToStory.mutateAsync({ storyId: item._id, message: msg });
      toast.success(`Reply sent to @${group.author.username}!`);
    } catch (err: any) {
      setReplyText(msg);
      toast.error(err.message || "Failed to send reply");
    }
  };

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const updateProgress = useCallback((value: number) => {
    const nextProgress = Math.max(0, Math.min(1, value));
    progressRef.current = nextProgress;
    setProgress(nextProgress);
  }, []);

  const group = groups[index];
  const item = group?.items[step];
  const count = Math.max(1, group?.items.length ?? 1);
  // Photo stories stay visible for eight seconds; video duration remains media-driven.
  const duration = (item?.mediaType === "video" ? (item?.duration ?? 4200) : 8000) as number;
  const isOwnStory = user?.username === group?.author?.username;

  const next = useCallback(() => {
    updateProgress(0);
    setReadyItemId(null);
    setStep((s) => {
      if (s + 1 < count) return s + 1;
      setIndex((i) => {
        if (i + 1 < groups.length) return i + 1;
        onClose();
        return i;
      });
      return 0;
    });
  }, [count, groups.length, onClose, updateProgress]);

  const prev = useCallback(() => {
    updateProgress(0);
    setReadyItemId(null);
    setStep((s) => {
      if (s > 0) return s - 1;
      setIndex((i) => {
        if (i > 0) return i - 1;
        return 0;
      });
      return 0;
    });
  }, [updateProgress]);

  const nextGroup = useCallback(() => {
    updateProgress(0);
    setReadyItemId(null);
    setStep(0);
    setIndex((i) => {
      if (i + 1 < groups.length) return i + 1;
      onClose();
      return i;
    });
  }, [groups.length, onClose, updateProgress]);

  const prevGroup = useCallback(() => {
    updateProgress(0);
    setReadyItemId(null);
    setStep(0);
    setIndex((i) => (i > 0 ? i - 1 : 0));
  }, [updateProgress]);

  // Touch swipe handlers for switching stories
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0]?.clientX ?? 0;
    touchEndX.current = null;
    setPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0]?.clientX ?? 0;
  };

  const handleTouchEnd = () => {
    setPaused(false);
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 45;

    if (diff > minSwipeDistance) {
      // Swipe left -> Next user story
      nextGroup();
    } else if (diff < -minSwipeDistance) {
      // Swipe right -> Previous user story
      prevGroup();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Mark story item as viewed
  useEffect(() => {
    if (item && !item.viewedByMe) {
      markViewed.mutate(item._id);
    }
  }, [item?._id]);

  // Reset the loading line the moment the displayed story changes — moving
  // back (or forward) must NEVER show the previous line re-filling from its
  // old position; the target story starts a fresh loading line at 0.
  useEffect(() => {
    updateProgress(0);
  }, [index, step, item?._id, updateProgress]);

  // A story without a usable media URL cannot emit a load/error event. Allow it
  // to progress rather than leaving the viewer permanently paused on black.
  useEffect(() => {
    if (item?._id && !item.mediaUrl?.trim()) setReadyItemId(item._id);
  }, [item?._id, item?.mediaUrl]);

  // Start the image timer only after its media is ready to display. This avoids
  // consuming story time while an image is still loading on a slow connection.
  // For playable videos, native media time drives the line; an errored video
  // falls back to the regular duration so the viewer never gets stuck.
  useEffect(() => {
    if (paused || !item?._id || readyItemId !== item._id) return;
    const video = videoRef.current;
    if (
      item?.mediaType === "video" &&
      video &&
      video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
      !video.error
    ) {
      return;
    }
    let cancelled = false;
    const startProgress = progressRef.current;
    const start = performance.now();
    const tick = (now: number) => {
      if (cancelled) return;
      const p = Math.min(1, startProgress + (now - start) / duration);
      updateProgress(p);
      if (p >= 1) {
        next();
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [
    index,
    step,
    paused,
    next,
    duration,
    item?._id,
    item?.mediaType,
    readyItemId,
    updateProgress,
  ]);

  // Sync video playback with story pause/resume
  useEffect(() => {
    if (item?.mediaType === "video" && videoRef.current) {
      if (paused) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [paused, index, step, item?.mediaType]);

  // Keyboard Navigation Support
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (commentsOpen) {
          setCommentsOpen(false);
          setPaused(false);
        } else if (shareOpen) {
          setShareOpen(false);
        } else {
          onClose();
        }
        return;
      }
      if (commentsOpen || shareOpen) return;
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, onClose, commentsOpen, shareOpen]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (!group || !item) return null;
  // Token-aware URL: checked media (/api/v1/media/file/:id) is consumed by
  // plain <img>/<video> tags that cannot send an Authorization header, so the
  // token rides in the query string for the author's own pending media.
  const image = mediaUrlWithAuth(item.mediaUrl);

  const handleDeleteCurrentStory = () => {
    if (!item) return;
    deleteStory.mutate(item._id);
    toast.success("Story deleted");
    if (group.items.length <= 1) {
      if (groups.length <= 1) {
        onClose();
      } else {
        nextGroup();
      }
    } else {
      next();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex h-[100dvh] items-center justify-center overflow-hidden bg-black/95 p-0 sm:p-6 select-none">
      {/* Close Button */}
      <button
        type="button"
        aria-label="Close stories"
        onClick={onClose}
        className="press absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-[70] grid size-10 place-items-center rounded-full bg-black/55 text-white shadow-lg ring-1 ring-white/20 backdrop-blur-md transition hover:bg-white/25 sm:fixed sm:right-5 sm:top-5"
      >
        <X className="size-5" />
      </button>

      {/* Main Viewer Card */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative h-[100dvh] w-full overflow-hidden bg-black sm:h-[88vh] sm:max-h-[900px] sm:w-[420px] sm:rounded-3xl shadow-float"
      >
        {/* Video or Image Stage */}
        {image && item.mediaType === "video" ? (
          <video
            ref={videoRef}
            src={image}
            autoPlay
            muted={muted}
            playsInline
            preload="auto"
            onLoadedData={() => setReadyItemId(item._id)}
            onError={() => setReadyItemId(item._id)}
            onEnded={next}
            onTimeUpdate={() => {
              if (videoRef.current && videoRef.current.duration) {
                updateProgress(videoRef.current.currentTime / videoRef.current.duration);
              }
            }}
            className="absolute inset-0 size-full object-contain bg-black"
          />
        ) : image ? (
          <div className="absolute inset-0 size-full overflow-hidden bg-black flex items-center justify-center">
            {/* Blurred background fill for non-9:16 images */}
            <div
              className="absolute inset-0 size-full bg-cover bg-center filter blur-2xl opacity-50 scale-125"
              style={{ backgroundImage: `url(${image})` }}
              aria-hidden="true"
            />
            <img
              src={image}
              alt={item.caption || "Story item"}
              loading="eager"
              decoding="async"
              onLoad={() => setReadyItemId(item._id)}
              onError={() => setReadyItemId(item._id)}
              className="relative z-10 size-full object-contain"
            />
          </div>
        ) : null}

        {/* Gradient Overlay */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/80 transition-opacity",
            paused && "opacity-0",
          )}
        />

        {/* Slide Progress Bars */}
        <div
          className={cn(
            "absolute left-3 right-14 top-[max(0.75rem,env(safe-area-inset-top))] z-30 flex gap-1 transition-opacity sm:inset-x-3 sm:top-3",
            paused && "opacity-0",
          )}
        >
          {Array.from({ length: count }).map((_, i) => (
            <span key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/30">
              <span
                className="block h-full rounded-full bg-white transition-none"
                style={{ width: `${i < step ? 100 : i === step ? progress * 100 : 0}%` }}
              />
            </span>
          ))}
        </div>

        {/* Header Overlay */}
        <header
          className={cn(
            "absolute inset-x-3 top-[calc(3.5rem+env(safe-area-inset-top))] z-30 flex items-center gap-2 pt-1 text-white transition-opacity sm:top-7 sm:gap-3 sm:pt-2",
            paused && "opacity-0",
          )}
        >
          <GAvatar user={toDisplayUser(group.author)} size="sm" ring="story" />
          <Link
            to="/profile/$username"
            params={{ username: group.author.username }}
            className="min-w-0 flex-1 text-sm font-bold text-white hover:underline truncate"
          >
            {group.author.username}
          </Link>
          <span className="hidden shrink-0 text-xs text-white/70 sm:inline">{timeAgo(item.createdAt)}</span>

          {/* Story comments */}
          <button
            type="button"
            aria-label="View comments"
            onClick={() => { setPaused(true); setCommentsOpen(true); }}
            className="press grid size-8 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md"
          >
            <MessageCircle className="size-4" />
          </button>

          {item.mediaType === "video" && (
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              className="press grid size-8 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md"
            >
              {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Story options"
                className="press grid size-8 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md"
              >
                <MoreHorizontal className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShareOpen(true)}>Share story</DropdownMenuItem>
              {isOwnStory ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-danger focus:bg-danger/10 focus:text-danger"
                    onClick={handleDeleteCurrentStory}
                  >
                    <Trash2 className="size-4 mr-1.5" />
                    Delete story
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={() => toast.success("Report sent to moderation")}>
                  Report
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Caption */}
        {item.caption && (
          <p className="absolute bottom-20 left-4 right-4 z-30 text-sm font-medium text-white drop-shadow-md">
            {item.caption}
          </p>
        )}

        {/* Tap Navigation Zones (Left half = prev slide, Right half = next slide) */}
        <div className="absolute inset-0 z-20 flex">
          <div
            className="h-full w-1/2 cursor-pointer"
            onClick={prev}
            onMouseDown={() => setPaused(true)}
            onMouseUp={() => setPaused(false)}
          />
          <div
            className="h-full w-1/2 cursor-pointer"
            onClick={next}
            onMouseDown={() => setPaused(true)}
            onMouseUp={() => setPaused(false)}
          />
        </div>

        {/* Desktop Side Arrows */}
        {index > 0 && (
          <button
            type="button"
            aria-label="Previous user story"
            onClick={(e) => {
              e.stopPropagation();
              prevGroup();
            }}
            className="press absolute left-2 top-1/2 -translate-y-1/2 z-40 hidden sm:grid size-9 place-items-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70"
          >
            <ChevronLeft className="size-5" />
          </button>
        )}
        {index < groups.length - 1 && (
          <button
            type="button"
            aria-label="Next user story"
            onClick={(e) => {
              e.stopPropagation();
              nextGroup();
            }}
            className="press absolute right-2 top-1/2 -translate-y-1/2 z-40 hidden sm:grid size-9 place-items-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70"
          >
            <ChevronRight className="size-5" />
          </button>
        )}

        {/* Bottom Reply Bar */}
        <footer className="absolute inset-x-0 bottom-0 z-50 flex items-center gap-2 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <Input
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            placeholder={`Reply to @${group.author.username}…`}
            className="h-10 rounded-full border-white/20 bg-white/10 text-xs text-white placeholder:text-white/60 focus:border-white focus:bg-white/20 z-50"
          />
          <Button
            size="icon-sm"
            variant="brand"
            onClick={handleSendReply}
            disabled={!replyText.trim() || replyToStory.isPending}
            className="rounded-full shrink-0"
          >
            {replyToStory.isPending ? <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" /> : <Send className="size-4" />}
          </Button>
        </footer>
      </div>

      {/* Share Sheet */}
      <ShareSheet
        open={shareOpen}
        onOpenChange={setShareOpen}
        title={`Story by @${group.author.username}`}
        url={`${typeof window !== "undefined" ? window.location.origin : ""}/story/${item._id}`}
      />

      {/* Story comment thread */}
      {commentsOpen && (
        <StoryComments
          storyId={item._id}
          authorUsername={group.author.username}
          onClose={() => { setCommentsOpen(false); setPaused(false); }}
        />
      )}
    </div>
  );
}
