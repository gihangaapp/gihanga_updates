import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Send, X } from "lucide-react";
import { toast } from "sonner";
import { GAvatar } from "@/components/common/GAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCount, timeAgo } from "@/lib/format";
import { mediaUrl, StoryGroup } from "@/lib/api-client";
import { useMarkStoryViewed } from "@/hooks/use-stories";

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
  const [index, setIndex] = useState(startIndex);
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const raf = useRef<number | null>(null);
  const markViewed = useMarkStoryViewed();

  const group = groups[index];
  const item = group?.items[step];
  const count = Math.max(1, group?.items.length ?? 1);
  const duration = (item?.duration ?? 4200) as number;

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
      setIndex((i) => Math.max(0, i - 1));
      return 0;
    });
  }, []);

  useEffect(() => {
    if (item && !item.viewedByMe) {
      markViewed.mutate(item._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?._id]);

  useEffect(() => {
    if (paused) return;
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
  }, [index, step, paused, next, duration]);

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

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/92 p-0 sm:p-6">
      <button
        type="button"
        aria-label="Close stories"
        onClick={onClose}
        className="press absolute top-4 right-4 z-20 grid size-10 place-items-center rounded-full bg-white/12 text-white"
      >
        <X className="size-5" />
      </button>

      <div className="relative h-full w-full overflow-hidden bg-elevated sm:h-[88vh] sm:w-[420px] sm:rounded-3xl">
        {image && item.mediaType === "video" ? (
          <video
            src={image}
            className="absolute inset-0 size-full object-contain bg-black"
            autoPlay
            muted
            playsInline
            onEnded={next}
          />
        ) : image ? (
          <img src={image} alt={item.caption || ""} className="absolute inset-0 size-full object-contain bg-black" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70" />

        <div className="absolute inset-x-3 top-3 flex gap-1">
          {Array.from({ length: count }).map((_, i) => (
            <span key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/30">
              <span
                className="block h-full rounded-full bg-white"
                style={{ width: `${i < step ? 100 : i === step ? progress * 100 : 0}%` }}
              />
            </span>
          ))}
        </div>

        <header className="absolute inset-x-3 top-7 flex items-center gap-3 pt-2">
          <GAvatar user={toDisplayUser(group.author)} size="sm" />
          <Link
            to="/profile/$username"
            params={{ username: group.author.username }}
            className="min-w-0 flex-1 text-sm font-bold text-white hover:underline"
          >
            {group.author.username}
          </Link>
          <span className="text-xs text-white/70">{timeAgo(item.createdAt)}</span>
          {group.author.isLive && (
            <span className="animate-pulse-ring rounded-md bg-danger px-1.5 py-0.5 text-[10px] font-bold text-danger-foreground">
              LIVE
            </span>
          )}
        </header>

        {item.caption && (
          <p className="absolute bottom-20 left-4 right-4 z-10 text-sm font-medium text-white/95">
            {item.caption}
          </p>
        )}

        <button
          type="button"
          aria-label="Previous"
          onClick={prev}
          onPointerDown={() => setPaused(true)}
          onPointerUp={() => setPaused(false)}
          className="absolute inset-y-0 left-0 z-10 w-1/3"
        />
        <button
          type="button"
          aria-label="Next"
          onClick={next}
          onPointerDown={() => setPaused(true)}
          onPointerUp={() => setPaused(false)}
          className="absolute inset-y-0 right-0 z-10 w-1/3"
        />

        <div className="absolute bottom-5 left-0 right-0 z-20 flex items-center gap-2 px-4">
          <Input
            placeholder={`Reply to ${group.author.username}…`}
            className="h-11 rounded-full border-white/25 bg-white/12 text-white placeholder:text-white/60"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                toast.success(`Reply sent to @${group.author.username}`);
                (e.target as HTMLInputElement).value = "";
              }
            }}
          />
          <Button
            variant="ghost"
            size="icon"
            aria-label="View count"
            className="shrink-0 gap-1 text-white hover:bg-white/15"
            disabled
          >
            {formatCount(item.viewCount)}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Share story"
            onClick={() => toast.success("Share sheet opened")}
            className="shrink-0 text-white hover:bg-white/15"
          >
            <Send />
          </Button>
        </div>
      </div>

      <button
        type="button"
        aria-label="Previous story"
        onClick={prev}
        className="press absolute left-4 hidden size-10 place-items-center rounded-full bg-white/12 text-white sm:grid"
      >
        <ChevronLeft />
      </button>
      <button
        type="button"
        aria-label="Next story"
        onClick={next}
        className="press absolute right-4 hidden size-10 place-items-center rounded-full bg-white/12 text-white sm:grid"
        style={{ top: "50%" }}
      >
        <ChevronRight />
      </button>
    </div>
  );
}
