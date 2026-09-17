import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, Play, Pause, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ResponsiveVideoProps {
  src: string;
  posterUrl?: string;
  blurDataUrl?: string;
  aspectRatio?: number;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  className?: string;
  videoClassName?: string;
  onDoubleTap?: () => void;
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
}: ResponsiveVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(initialMuted);
  const [isLoading, setIsLoading] = useState(true);
  const [inViewport, setInViewport] = useState(false);
  const lastTap = useRef(0);

  // Viewport observer: auto-pause & release resources when scrolled far out of view
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setInViewport(entry.isIntersecting);
          if (videoRef.current) {
            if (entry.isIntersecting && autoPlay) {
              videoRef.current
                .play()
                .then(() => setIsPlaying(true))
                .catch(() => setIsPlaying(false));
            } else {
              videoRef.current.pause();
              setIsPlaying(false);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [autoPlay]);

  const handleContainerTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300 && onDoubleTap) {
      onDoubleTap();
    } else {
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.pause();
          setIsPlaying(false);
        } else {
          videoRef.current.play().then(() => setIsPlaying(true));
        }
      }
    }
    lastTap.current = now;
  };

  return (
    <div
      ref={containerRef}
      role="button"
      tabIndex={0}
      onClick={handleContainerTap}
      onKeyDown={(e) => e.key === "Enter" && handleContainerTap()}
      aria-label="Video player"
      className={cn(
        "relative overflow-hidden bg-black select-none flex items-center justify-center group",
        className
      )}
      style={aspectRatio ? { aspectRatio: `${aspectRatio}` } : undefined}
    >
      {/* Blurred Backdrop for letterboxed or non-matching aspect ratio videos */}
      {posterUrl && (
        <div
          className="absolute inset-0 size-full bg-cover bg-center filter blur-2xl opacity-40 scale-125"
          style={{ backgroundImage: `url(${posterUrl})` }}
          aria-hidden="true"
        />
      )}

      {/* Video Element */}
      <video
        ref={videoRef}
        src={inViewport ? src : undefined} // Release resource if far out of viewport
        poster={posterUrl}
        loop={loop}
        muted={isMuted}
        playsInline
        onWaiting={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onPlaying={() => {
          setIsLoading(false);
          setIsPlaying(true);
        }}
        onPause={() => setIsPlaying(false)}
        className={cn("relative z-10 w-full h-full object-contain max-h-[640px]", videoClassName)}
      />

      {/* Loading Spinner */}
      {isLoading && inViewport && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-black/20 backdrop-blur-xs">
          <Loader2 className="size-8 animate-spin text-white/80" />
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

      {/* Pause/Play Overlay Feedback */}
      {!isPlaying && !isLoading && (
        <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center">
          <div className="grid size-12 place-items-center rounded-full bg-black/60 text-white backdrop-blur-md">
            <Play className="size-6 fill-current ml-0.5" />
          </div>
        </div>
      )}
    </div>
  );
}
