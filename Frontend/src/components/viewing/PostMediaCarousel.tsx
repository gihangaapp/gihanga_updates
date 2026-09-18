import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { mediaUrl } from "@/lib/api-client";
import { ResponsiveImage } from "@/components/media/ResponsiveImage";
import { ResponsiveVideo } from "@/components/media/ResponsiveVideo";
import { cn } from "@/lib/utils";

interface PostMediaCarouselProps {
  mediaUrlString?: string | undefined;
  thumbnailUrl?: string | undefined;
  blurDataUrl?: string | undefined;
  /** Intrinsic width/height ratio of the (first) media item. */
  aspectRatio?: number | undefined;
  /** Per-item metadata for multi-image posts (B1). */
  mediaItems?:
    | {
        url: string;
        width?: number | undefined;
        height?: number | undefined;
        aspectRatio?: number | undefined;
        kind?: "photo" | "video" | undefined;
      }[]
    | undefined;
  kind: "photo" | "video" | "reel" | "text";
  body?: string | undefined;
  liked?: boolean | undefined;
  onDoubleTapLike?: (() => void) | undefined;
  /** B1 — first feed items get fetchpriority=high. */
  priority?: boolean | undefined;
}

/**
 * B1/B2 — best-fit media stage.
 *
 * The container height is the image's OWN height at container width, clamped
 * to a sensible range: aspect ratio clamped to [4:5 portrait … 1.91:1
 * landscape] and max height ≈ min(80dvh, 720px). Nothing important is ever
 * cropped — when the ratio or the height clamp kicks in, the media renders
 * object-contain over a blurred backdrop of itself. Space is reserved via
 * aspect-ratio BEFORE load (zero layout shift), with a lazy natural-size
 * fallback for legacy posts that never persisted their geometry.
 */
const RATIO_MIN = 4 / 5; // portrait clamp (0.8)
const RATIO_MAX = 1.91; // landscape clamp
const DEFAULT_RATIO = 4 / 3; // legacy posts with no metadata at all

function clampRatio(r: number | undefined): number | undefined {
  if (!r || !Number.isFinite(r) || r <= 0) return undefined;
  return Math.min(RATIO_MAX, Math.max(RATIO_MIN, r));
}

export function PostMediaCarousel({
  mediaUrlString,
  thumbnailUrl,
  blurDataUrl,
  aspectRatio,
  mediaItems,
  kind,
  body,
  liked,
  onDoubleTapLike,
  priority = false,
}: PostMediaCarouselProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [burst, setBurst] = useState(false);
  const lastTap = useRef(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Lazy fallback (B1): legacy posts without persisted geometry report their
  // natural size on load; the stage then adopts the true ratio once.
  const [measuredRatio, setMeasuredRatio] = useState<number | undefined>(undefined);
  const handleMeasured = (w: number, h: number) => {
    if (h > 0 && measuredRatio === undefined) setMeasuredRatio(w / h);
  };

  if (!mediaUrlString || kind === "text") return null;

  // Split comma-separated URLs for multi-media posts
  const rawUrls = mediaUrlString
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (rawUrls.length === 0) return null;

  const activeRawUrl = rawUrls[activeIdx] ?? rawUrls[0];
  const activeFullUrl = mediaUrl(activeRawUrl);

  // B1.4 — the stage ratio is the FIRST item's ratio (or the tallest clamped
  // one), so swiping multi-image posts never jumps the layout.
  const firstItem = mediaItems?.find((m) => m.url === rawUrls[0]);
  const firstItemRatio =
    firstItem?.aspectRatio ??
    (firstItem?.width && firstItem?.height ? firstItem.width / firstItem.height : undefined);
  const stageRatio = clampRatio(measuredRatio ?? aspectRatio ?? firstItemRatio) ?? DEFAULT_RATIO;
  const intrinsicRatio: number =
    measuredRatio ??
    aspectRatio ??
    mediaItems?.find((m) => m.url === activeRawUrl)?.aspectRatio ??
    stageRatio ??
    DEFAULT_RATIO;
  // Contain only when clamping actually applies (ratio outside the window).
  const needsContain = intrinsicRatio < RATIO_MIN || intrinsicRatio > RATIO_MAX;

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
    touchStartX.current = e.targetTouches[0]?.clientX ?? 0;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0]?.clientX ?? 0;
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
    return kind === "video" || kind === "reel" || /\.(mp4|mov|webm|m4v)$/i.test(url);
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
      className="relative mx-4 mb-3 w-[calc(100%-2rem)] overflow-hidden rounded-2xl bg-black select-none group flex items-center justify-center"
      style={{
        // B1.3 — the image's own height at container width, clamped: ratio
        // clamped to [4:5 … 1.91:1], max height min(80dvh, 720px). Reserved
        // BEFORE load → zero layout shift.
        aspectRatio: `${stageRatio ?? DEFAULT_RATIO}`,
        maxHeight: "min(80dvh, 720px)",
      }}
    >
      {/* Current Active Item Stage */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeRawUrl}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="relative h-full w-full overflow-hidden"
        >
          {currentIsVideo ? (
            <ResponsiveVideo
              src={activeFullUrl ?? ""}
              posterUrl={mediaUrl(thumbnailUrl)}
              blurDataUrl={blurDataUrl}
              onDoubleTap={onDoubleTapLike}
              onMeasured={handleMeasured}
              className="h-full w-full"
              videoClassName={cn(needsContain ? "object-contain" : "object-cover")}
            />
          ) : (
            <ResponsiveImage
              src={activeFullUrl ?? ""}
              alt={body || "Post media"}
              blurDataUrl={blurDataUrl}
              onMeasured={handleMeasured}
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : undefined}
              fit={needsContain ? "contain" : "cover"}
              className="h-full w-full"
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
                  i === activeIdx ? "bg-white w-3" : "bg-white/50 hover:bg-white/80",
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
