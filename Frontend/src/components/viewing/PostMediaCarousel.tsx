import { useState, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { mediaUrl } from "@/lib/api-client";
import { ResponsiveImage } from "@/components/media/ResponsiveImage";
import { ResponsiveVideo } from "@/components/media/ResponsiveVideo";
import { cn } from "@/lib/utils";

interface PostMediaCarouselProps {
  mediaUrlString?: string;
  thumbnailUrl?: string;
  blurDataUrl?: string;
  aspectRatio?: number;
  kind: "photo" | "video" | "reel" | "text";
  body?: string;
  liked?: boolean;
  onDoubleTapLike?: () => void;
}

export function PostMediaCarousel({
  mediaUrlString,
  thumbnailUrl,
  blurDataUrl,
  aspectRatio,
  kind,
  body,
  liked,
  onDoubleTapLike,
}: PostMediaCarouselProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [burst, setBurst] = useState(false);
  const lastTap = useRef(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  if (!mediaUrlString || kind === "text") return null;

  // Split comma-separated URLs for multi-media posts
  const rawUrls = mediaUrlString.split(",").map((s) => s.trim()).filter(Boolean);
  if (rawUrls.length === 0) return null;

  const activeRawUrl = rawUrls[activeIdx] ?? rawUrls[0];
  const activeFullUrl = mediaUrl(activeRawUrl);

  const handleMediaTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      if (onDoubleTapLike) onDoubleTapLike();
      setBurst(true);
      setTimeout(() => setBurst(false), 700);
    }
    lastTap.current = now;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 40; // minimum pixels to trigger swipe

    if (diff > minSwipeDistance && activeIdx < rawUrls.length - 1) {
      // Swipe left -> Next image
      setActiveIdx((prev) => prev + 1);
    } else if (diff < -minSwipeDistance && activeIdx > 0) {
      // Swipe right -> Previous image
      setActiveIdx((prev) => prev - 1);
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const isVideo = (url: string) => {
    return kind === "video" || kind === "reel" || /\.(mp4|mov|webm)$/i.test(url);
  };

  const currentIsVideo = activeFullUrl ? isVideo(activeFullUrl) : false;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleMediaTap}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onKeyDown={(e) => e.key === "Enter" && onDoubleTapLike && onDoubleTapLike()}
      aria-label="Double tap to like or swipe to view next image"
      className="relative mx-4 mb-3 overflow-hidden rounded-2xl bg-black select-none group flex items-center justify-center aspect-[4/3] max-h-[440px] w-[calc(100%-2rem)]"
    >
      {/* Current Active Item Stage */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeRawUrl}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="flex h-full w-full items-center justify-center overflow-hidden"
        >
          {currentIsVideo ? (
            <ResponsiveVideo
              src={activeFullUrl}
              posterUrl={mediaUrl(thumbnailUrl)}
              blurDataUrl={blurDataUrl}
              aspectRatio={4 / 3}
              onDoubleTap={onDoubleTapLike}
              className="h-full w-full object-cover"
            />
          ) : (
            <ResponsiveImage
              src={activeFullUrl}
              alt={body || "Post media"}
              blurDataUrl={blurDataUrl}
              aspectRatio={4 / 3}
              className="h-full w-full object-cover"
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Multi-Item Carousel Navigation Controls */}
      {rawUrls.length > 1 && (
        <>
          {/* Top Right Counter Badge */}
          <div className="absolute top-3 right-3 z-10 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md">
            {activeIdx + 1} / {rawUrls.length}
          </div>

          {/* Previous Arrow */}
          {activeIdx > 0 && (
            <button
              type="button"
              aria-label="Previous image"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIdx((prev) => prev - 1);
              }}
              className="press absolute left-2 top-1/2 -translate-y-1/2 z-10 grid size-8 place-items-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80"
            >
              <ChevronLeft className="size-5" />
            </button>
          )}

          {/* Next Arrow */}
          {activeIdx < rawUrls.length - 1 && (
            <button
              type="button"
              aria-label="Next image"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIdx((prev) => prev + 1);
              }}
              className="press absolute right-2 top-1/2 -translate-y-1/2 z-10 grid size-8 place-items-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80"
            >
              <ChevronRight className="size-5" />
            </button>
          )}

          {/* Bottom Dot Indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5 rounded-full bg-black/40 px-2 py-1 backdrop-blur-sm">
            {rawUrls.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIdx(i);
                }}
                className={cn(
                  "size-1.5 rounded-full transition-all press",
                  i === activeIdx ? "bg-white w-3" : "bg-white/50 hover:bg-white/80"
                )}
              />
            ))}
          </div>
        </>
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
    </div>
  );
}
