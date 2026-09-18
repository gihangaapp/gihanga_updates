import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
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
import { formatCount, timeAgo } from "@/lib/format";
import { mediaUrl, StoryGroup } from "@/lib/api-client";
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
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [shareOpen, setShareOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const raf = useRef<number | null>(null);
  const markViewed = useMarkStoryViewed();
  const deleteStory = useDeleteStory();
  const replyToStory = useReplyToStory();

  const handleSendReply = async () => {
    if (!replyText.trim() || !item?._id || !group) return;
    const msg = replyText.trim();
    setReplyText("");
    try {
      await replyToStory.mutateAsync({ storyId: item._id, message: msg });
      toast.success(`Reply sent to @${group.author.username}!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to send reply");
    }
  };

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const group = groups[index];
  const item = group?.items[step];
  const count = Math.max(1, group?.items.length ?? 1);
  const duration = (item?.duration ?? 4200) as number;
  const isOwnStory = user?.username === group?.author?.username;

  const next = useCallback(() => {
    setProgress(0);
    setStep((s) => {
      if (s + 1 < count) return s + 1;
      setIndex((i) => {
        if (i + 1 < groups.length) return i + 1;
        onClose();
        return i;
      });
      return 0;
    });
  }, [count, groups.length, onClose]);

  const prev = useCallback(() => {
    setProgress(0);
    setStep((s) => {
      if (s > 0) return s - 1;
      setIndex((i) => {
        if (i > 0) return i - 1;
        return 0;
      });
      return 0;
    });
  }, []);

  const nextGroup = useCallback(() => {
    setProgress(0);
    setStep(0);
    setIndex((i) => {
      if (i + 1 < groups.length) return i + 1;
      onClose();
      return i;
    });
  }, [groups.length, onClose]);

  const prevGroup = useCallback(() => {
    setProgress(0);
    setStep(0);
    setIndex((i) => (i > 0 ? i - 1 : 0));
  }, []);

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

  // Handle RAF progress timer for image slides
  useEffect(() => {
    if (paused || item?.mediaType === "video") return;
    let start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setProgress(p);
      if (p >= 1) {
        start = now;
        next();
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [index, step, paused, next, duration, item?.mediaType]);

  // Sync video playback with story pause/resume
  useEffect(() => {
    if (item?.mediaType === "video" && videoRef.current) {
      if (paused) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [paused, item?.mediaType]);

  // Keyboard Navigation Support
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [next, prev, onClose]);

  if (!group || !item) return null;
  const image = mediaUrl(item.mediaUrl);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 p-0 sm:p-6 select-none">
      {/* Close Button */}
      <button
        type="button"
        aria-label="Close stories"
        onClick={onClose}
        className="press absolute top-4 right-4 z-50 grid size-10 place-items-center rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/30"
      >
        <X className="size-5" />
      </button>

      {/* Main Viewer Card */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative h-full w-full overflow-hidden bg-black sm:h-[88vh] sm:w-[420px] sm:rounded-3xl shadow-float"
      >
        {/* Video or Image Stage */}
        {image && item.mediaType === "video" ? (
          <video
            ref={videoRef}
            src={image}
            autoPlay
            muted={muted}
            playsInline
            onEnded={next}
            onTimeUpdate={() => {
              if (videoRef.current && videoRef.current.duration) {
                setProgress(videoRef.current.currentTime / videoRef.current.duration);
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
              loading="lazy"
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
            "absolute inset-x-3 top-3 z-30 flex gap-1 transition-opacity",
            paused && "opacity-0",
          )}
        >
          {Array.from({ length: count }).map((_, i) => (
            <span key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/30">
              <span
                className="block h-full rounded-full bg-white transition-all"
                style={{ width: `${i < step ? 100 : i === step ? progress * 100 : 0}%` }}
              />
            </span>
          ))}
        </div>

        {/* Header Overlay */}
        <header
          className={cn(
            "absolute inset-x-3 top-7 z-30 flex items-center gap-3 pt-2 text-white transition-opacity",
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
          <span className="text-xs text-white/70 shrink-0">{timeAgo(item.createdAt)}</span>

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
        <footer className="absolute inset-x-0 bottom-0 z-50 flex items-center gap-2 p-3 bg-gradient-to-t from-black/95 via-black/80 to-transparent">
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
            disabled={!replyText.trim()}
            className="rounded-full shrink-0"
          >
            <Send className="size-4" />
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
    </div>
  );
}
