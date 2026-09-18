import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Play, Loader2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { cdnUrl } from "@/lib/cdn";

export interface ResponsiveVideoProps {
  src: string;
  posterUrl?: string | undefined;
  blurDataUrl?: string | undefined;
  aspectRatio?: number | undefined;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  className?: string | undefined;
  videoClassName?: string | undefined;
  onDoubleTap?: (() => void) | undefined;
  /** B2 — play only when at least this fraction is visible (0..1). */
  playThreshold?: number | undefined;
  /** B2 — attach src when within this root margin (viewport-relative string). */
  preloadRootMargin?: string | undefined;
  /** B2 — measured natural size report (lazy aspect-ratio fallback). */
  onMeasured?: ((width: number, height: number) => void) | undefined;
}

// ── B2 single-play policy ───────────────────────────────────────────────────
// Exactly ONE feed video plays at a time, app-wide. A module-level registry
// tracks the currently playing element; a new play request pauses the
// previous one. This is deliberately OUTSIDE React state so any number of
// mounted components stay in sync without re-render storms.
let currentlyPlaying: HTMLVideoElement | null = null;

function claimPlayback(video: HTMLVideoElement) {
  if (currentlyPlaying && currentlyPlaying !== video) {
    currentlyPlaying.pause();
  }
  currentlyPlaying = video;
}

function releasePlayback(video: HTMLVideoElement) {
  if (currentlyPlaying === video) currentlyPlaying = null;
}

export function ResponsiveVideo({
  src,
  posterUrl,
  blurDataUrl,
  aspectRatio,
  autoPlay = true,
  loop = true,
  muted: initialMuted = true,
  className,
  videoClassName,
  onDoubleTap,
  playThreshold = 0.6,
  preloadRootMargin = "200% 0px",
  onMeasured,
}: ResponsiveVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(initialMuted);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  // B2 — attach the src only once near the viewport (generous root margin),
  // so far-down feed items don't hold connections/buffers; a 0.5-threshold
  // observer inside an AnimatePresence remount can stay false forever, which
  // used to leave src undefined (a black box with no error).
  const [nearViewport, setNearViewport] = useState(false);
  const [visibleRatio, setVisibleRatio] = useState(0);
  const lastTap = useRef(0);

  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const nav =
    typeof navigator !== "undefined"
      ? (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
      : undefined;
  const dataSaver = nav?.saveData === true;
  const effectiveAutoPlay = autoPlay && !reducedMotion && !dataSaver;

  // ── Observer A (near-viewport): attach src generously early. ──────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setNearViewport(entry.isIntersecting);
      },
      { rootMargin: preloadRootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [preloadRootMargin]);

  // ── Observer B (play threshold): play only when sufficiently visible. ────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setVisibleRatio(entry.intersectionRatio);
      },
      { threshold: [0, 0.25, playThreshold, 0.75, 1] },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [playThreshold]);

  // ── Play/pause driven by visibility + single-play registry. ───────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src || !nearViewport) return;

    const shouldPlay = effectiveAutoPlay && visibleRatio >= playThreshold && !hasError;
    if (shouldPlay) {
      claimPlayback(video);
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      video.pause();
      setIsPlaying(false);
      releasePlayback(video);
    }
  }, [visibleRatio, nearViewport, effectiveAutoPlay, src, hasError, playThreshold]);

  // Release the registry slot on unmount.
  useEffect(() => {
    const video = videoRef.current;
    return () => {
      if (video) releasePlayback(video);
    };
  }, []);

  const handleContainerTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300 && onDoubleTap) {
      onDoubleTap();
    } else {
      const video = videoRef.current;
      if (video) {
        if (isPlaying) {
          video.pause();
          setIsPlaying(false);
        } else {
          claimPlayback(video);
          video
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false));
        }
      }
    }
    lastTap.current = now;
  };

  const retry = () => {
    setHasError(false);
    setIsLoading(true);
    const video = videoRef.current;
    if (video) {
      video.load();
      void video.play().catch(() => {});
    }
  };

  // B2.5 — Cloudinary video URLs get f_auto,q_auto,vc_auto (right codec for
  // the browser: h264/hevc/vp9 as supported).
  const optimizedSrc = nearViewport
    ? (cdnUrl(src, { width: 1280, extra: ["vc_auto"] }) ?? src)
    : undefined;

  return (
    <div
      ref={containerRef}
      role="button"
      tabIndex={0}
      onClick={handleContainerTap}
      onKeyDown={(e) => e.key === "Enter" && handleContainerTap()}
      aria-label="Video player — tap to play or pause"
      className={cn(
        "relative overflow-hidden bg-black select-none flex items-center justify-center group",
        className,
      )}
      style={aspectRatio ? { aspectRatio: `${aspectRatio}` } : undefined}
    >
      {/* Blurred Backdrop for letterboxed/clamped videos */}
      {(posterUrl || blurDataUrl) && (
        <div
          className="absolute inset-0 size-full bg-cover bg-center filter blur-2xl opacity-40 scale-125"
          style={{ backgroundImage: `url(${posterUrl || blurDataUrl})` }}
          aria-hidden="true"
        />
      )}

      {/* Video Element — src attached only near the viewport; muted/playsInline
          always set so mobile autoplay works; preload metadata until visible. */}
      <video
        ref={videoRef}
        src={optimizedSrc}
        poster={posterUrl}
        loop={loop}
        muted={isMuted}
        playsInline
        preload={visibleRatio > 0 ? "auto" : "metadata"}
        aria-label="Video"
        onWaiting={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onLoadedMetadata={(e) => {
          setIsLoading(false);
          if (onMeasured && e.currentTarget.videoWidth > 0 && e.currentTarget.videoHeight > 0) {
            onMeasured(e.currentTarget.videoWidth, e.currentTarget.videoHeight);
          }
        }}
        onPlaying={() => {
          setIsLoading(false);
          setIsPlaying(true);
        }}
        onPause={() => setIsPlaying(false)}
        onError={() => {
          if (nearViewport) {
            setHasError(true);
            setIsLoading(false);
          }
        }}
        className={cn("relative z-10 size-full object-contain", videoClassName)}
      />

      {/* Loading Spinner */}
      {isLoading && !hasError && nearViewport && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-black/20 backdrop-blur-xs">
          <Loader2 className="size-8 animate-spin text-white/80" />
        </div>
      )}

      {/* Error state with retry (B2.4) */}
      {hasError && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-black/50">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              retry();
            }}
            className="press flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-black"
          >
            <RotateCcw className="size-4" /> Couldn't play — retry
          </button>
        </div>
      )}

      {/* Sound Mute Toggle */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsMuted((m) => !m);
        }}
        aria-label={isMuted ? "Unmute video" : "Mute video"}
        className="press absolute top-3 right-3 z-30 grid size-8 place-items-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80"
      >
        {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
      </button>

      {/* Pause/Play Overlay Feedback — a clear Play affordance whenever the
          video is paused (including autoplay-blocked). */}
      {!isPlaying && !isLoading && !hasError && (
        <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center">
          <div className="grid size-12 place-items-center rounded-full bg-black/60 text-white backdrop-blur-md">
            <Play className="size-6 fill-current ml-0.5" />
          </div>
        </div>
      )}
    </div>
  );
}
