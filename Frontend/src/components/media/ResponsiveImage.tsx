import { useState } from "react";
import { cn } from "@/lib/utils";

export interface ResponsiveImageProps {
  src: string;
  alt: string;
  blurDataUrl?: string;
  aspectRatio?: number; // e.g. 1.333 for 4:3, 1.0 for 1:1, 0.8 for 4:5
  className?: string;
  imgClassName?: string;
  loading?: "lazy" | "eager";
  sizes?: string;
  onClick?: () => void;
}

export function ResponsiveImage({
  src,
  alt,
  blurDataUrl,
  aspectRatio,
  className,
  imgClassName,
  loading = "lazy",
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px",
  onClick,
}: ResponsiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Fallback blur data URL SVG if none provided
  const placeholder =
    blurDataUrl ||
    `data:image/svg+xml;base64,${btoa(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="#18181b"/></svg>`
    )}`;

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted/40 select-none flex items-center justify-center",
        className
      )}
      style={aspectRatio ? { aspectRatio: `${aspectRatio}` } : undefined}
      onClick={onClick}
    >
      {/* Progressive Blur-Up Placeholder Overlay */}
      {!isLoaded && !hasError && (
        <img
          src={placeholder}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover filter blur-xl scale-110 opacity-70 transition-opacity duration-500"
        />
      )}

      {/* Main Responsive Image */}
      <img
        src={src}
        alt={alt}
        loading={loading}
        sizes={sizes}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true);
          setIsLoaded(true);
        }}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          imgClassName
        )}
      />
    </div>
  );
}
