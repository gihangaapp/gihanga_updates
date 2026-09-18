import { useState } from "react";
import { cn } from "@/lib/utils";
import { cdnSrcSet } from "@/lib/cdn";

export interface ResponsiveImageProps {
  src: string;
  alt: string;
  blurDataUrl?: string | undefined;
  /** Intrinsic width/height ratio (w/h); omit to size from the natural image. */
  aspectRatio?: number | undefined;
  className?: string;
  imgClassName?: string | undefined;
  loading?: "lazy" | "eager" | undefined;
  fetchPriority?: "high" | "low" | "auto" | undefined;
  sizes?: string | undefined;
  onClick?: (() => void) | undefined;
  /** B1 — "cover" crops to the box (legacy behaviour); "contain" letterboxes
   * on the blurred backdrop so nothing important is cropped. */
  fit?: "cover" | "contain" | undefined;
  /** Called once the natural size is known (legacy-post lazy fallback). */
  onMeasured?: ((width: number, height: number) => void) | undefined;
}

// Fallback blur data URL SVG when none provided (neutral dark placeholder).
const FALLBACK_PLACEHOLDER = `data:image/svg+xml;base64,${btoa(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="#18181b"/></svg>`,
)}`;

const SRCSET_WIDTHS = [480, 800, 1200] as const;

export function ResponsiveImage({
  src,
  alt,
  blurDataUrl,
  aspectRatio,
  className,
  imgClassName,
  loading = "lazy",
  fetchPriority,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px",
  onClick,
  fit = "cover",
  onMeasured,
}: ResponsiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // B1 — reserve space with the intrinsic aspect ratio BEFORE load → CLS ≈ 0.
  const placeholder = blurDataUrl || FALLBACK_PLACEHOLDER;
  const srcSet = cdnSrcSet(src, SRCSET_WIDTHS);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted/40 select-none flex items-center justify-center",
        className,
      )}
      style={aspectRatio ? { aspectRatio: `${aspectRatio}` } : undefined}
      onClick={onClick}
    >
      {/* Blurred backdrop for the object-contain "best-fit" mode — a soft
          blown-up version of the image fills the letterbox so the block
          looks designed instead of empty, while the sharp image shows
          EVERYTHING (no crop). */}
      {fit === "contain" && !hasError && (
        <div
          className="absolute inset-0 size-full bg-cover bg-center blur-2xl scale-110 opacity-60"
          style={{ backgroundImage: `url(${isLoaded ? src : placeholder})` }}
          aria-hidden="true"
        />
      )}

      {/* Progressive Blur-Up Placeholder Overlay */}
      {!isLoaded && !hasError && (
        <img
          src={placeholder}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover filter blur-xl scale-110 opacity-70 transition-opacity duration-500"
        />
      )}

      {/* Main Responsive Image — real srcset/sizes when served from the CDN. */}
      {hasError ? (
        // B1.6 — broken URL → neutral placeholder with the same footprint,
        // never a collapsed height.
        <div className="relative z-10 grid size-full place-items-center bg-muted/60">
          <svg
            viewBox="0 0 24 24"
            className="size-8 text-muted-foreground/50"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="m9 9 6 6M15 9l-6 6" />
          </svg>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={loading}
          fetchPriority={fetchPriority}
          sizes={srcSet ? sizes : undefined}
          srcSet={srcSet}
          onLoad={(e) => {
            setIsLoaded(true);
            // B1 lazy fallback for legacy posts with no persisted metadata:
            // report the natural size once so the carousel can adopt it.
            const img = e.currentTarget;
            if (onMeasured && img.naturalWidth > 0 && img.naturalHeight > 0) {
              onMeasured(img.naturalWidth, img.naturalHeight);
            }
          }}
          onError={() => {
            setHasError(true);
            setIsLoaded(true);
          }}
          className={cn(
            "relative z-10 transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            fit === "contain"
              ? "w-full h-full object-contain max-h-full"
              : "w-full h-full object-cover",
            imgClassName,
          )}
        />
      )}
    </div>
  );
}
