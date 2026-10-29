import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { mediaUrlWithAuth } from "@/lib/api-client";
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
 * Each active item uses its own measured/persisted aspect ratio and the stage
 * is capped at 56dvh (or 680px) so feed cards stay compact on short screens.
 * Nothing important is cropped: common photo/video ratios use object-contain
 * over a blurred backdrop when the stage is height-limited. Aspect-ratio
 * reserves space before load, with a natural-size fallback for legacy posts.
 */
const RATIO_MIN = 0.4; // extreme-portrait safety clamp only
const RATIO_MAX = 4; // extreme-panorama safety clamp only
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
  // Measured natural ratio per media URL (true pixel dimensions win over
  // persisted metadata so the stage always matches the real media exactly).
  const [measured, setMeasured] = useState<Record<string, number>>({});

  if (!mediaUrlString || kind === "text") return null;

  // Split comma-separated URLs for multi-media posts
  const rawUrls = mediaUrlString
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (rawUrls.length === 0) return null;

  const activeRawUrl = rawUrls[activeIdx] ?? rawUrls[0];
  const activeFullUrl = mediaUrlWithAuth(activeRawUrl);
  const measuredRatio = measured[rawUrls[0] ?? ""];
  const activeMeasured = measured[activeRawUrl ?? ""];
  const handleMeasured = (w: number, h: number) => {
    const key = activeRawUrl ?? "";
    if (w > 0 && h > 0 && measured[key] === undefined) {
      setMeasured((m) => ({ ...m, [key]: w / h }));
    }
  };

  // Each carousel item uses its own measured/persisted dimensions. That lets a
  // portrait slide and a landscape slide use the most natural stage height.
  const activeItem = mediaItems?.find((m) => m.url === activeRawUrl);
  const activeItemRatio =
    activeItem?.aspectRatio ??
    (activeItem?.width && activeItem?.height ? activeItem.width / activeItem.height : undefined);
  const stageRatio =
    clampRatio(
      activeMeasured ??
        activeItemRatio ??
        (activeIdx === 0 ? aspectRatio ?? measuredRatio : undefined),
    ) ?? DEFAULT_RATIO;
  const intrinsicRatio: number = activeMeasured ?? activeItemRatio ?? stageRatio;
  // Portrait media and extreme ratios always use contain so the real image or
  // video remains undistorted when the viewport height limits the stage.
  const needsContain = Math.abs(intrinsicRatio / stageRatio - 1) > 0.02 || intrinsicRatio < 3.5;

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
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" && activeIdx < rawUrls.length - 1) {
          e.preventDefault();
          setActiveIdx((prev) => prev + 1);
        } else if (e.key === "ArrowLeft" && activeIdx > 0) {
          e.preventDefault();
          setActiveIdx((prev) => prev - 1);
        } else if (e.key === "Enter" && onDoubleTapLike) {
          onDoubleTapLike();
        }
      }}
      aria-roledescription="carousel"
      aria-label="Post media. Swipe horizontally or use arrow keys to change media. Double tap to like."
      className="relative mb-3 w-full overflow-hidden rounded-xl bg-black select-none group flex items-center justify-center sm:rounded-2xl"
      style={{
        // Preserve the current item's natural shape, but cap its height so the
        // post and its controls remain usable within short desktop/mobile screens.
        aspectRatio: `${stageRatio ?? DEFAULT_RATIO}`,
        // Leave room for the post header/caption/actions while allowing common
        // portrait ratios to keep their full width without artificial side bars.
        maxHeight: "min(68dvh, 860px)",
        touchAction: "pan-y",
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
              posterUrl={mediaUrlWithAuth(thumbnailUrl)}
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
