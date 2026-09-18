import { useEffect } from "react";
import { ExternalLink, X } from "lucide-react";
import { AdBadge } from "./AdBadge";
import { Advertisement, useRecordImpression, useRecordClick } from "@/hooks/use-ads";
import { mediaUrl as resolveMediaUrl } from "@/lib/api-client";

interface StoryAdOverlayProps {
  ad: Advertisement;
  onClose?: () => void;
}

export function StoryAdOverlay({ ad, onClose }: StoryAdOverlayProps) {
  const recordImpression = useRecordImpression();
  const recordClick = useRecordClick();

  useEffect(() => {
    if (ad._id) {
      recordImpression.mutate(ad._id);
    }
  }, [ad._id]);

  function handleCtaClick() {
    if (ad._id) {
      recordClick.mutate(ad._id);
    }
    if (ad.ctaUrl) {
      window.open(ad.ctaUrl, "_blank", "noopener,noreferrer");
    }
  }

  const creator = typeof ad.creator === "object" ? ad.creator : null;
  const creatorName = creator?.name || "Sponsored Partner";
  const creatorUsername = creator?.username || "sponsored";

  const resolvedMedia = resolveMediaUrl(ad.mediaUrl) || ad.mediaUrl;
  const resolvedThumbnail = resolveMediaUrl(ad.thumbnailUrl) || ad.thumbnailUrl;

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-950 text-white">
      {/* Background Media */}
      {resolvedMedia ? (
        ad.adType.includes("video") ? (
          <video
            src={resolvedMedia}
            poster={resolvedThumbnail}
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <img src={resolvedMedia} alt={ad.title} className="h-full w-full object-cover" />
        )
      ) : (
        <div className="grid h-full w-full place-items-center bg-gradient-to-br from-indigo-950 via-slate-900 to-black p-6 text-center text-sm font-bold">
          {ad.title}
        </div>
      )}

      {/* Top Header Overlay */}
      <div className="absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-full bg-indigo-600 font-bold text-white text-xs shadow-md">
              {creatorName[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-xs leading-tight">{creatorName}</p>
              <p className="text-[10px] text-white/70">@{creatorUsername}</p>
            </div>
            <AdBadge variant="glass" />
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="grid size-8 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Bottom CTA Overlay */}
      <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-5 space-y-3">
        <h3 className="font-extrabold text-base line-clamp-2">{ad.title}</h3>
        {ad.caption && (
          <p className="text-xs text-white/80 line-clamp-3 leading-relaxed">{ad.caption}</p>
        )}

        <button
          type="button"
          onClick={handleCtaClick}
          className="press flex w-full items-center justify-between rounded-2xl bg-primary px-4 py-3 text-xs font-bold text-primary-foreground shadow-xl transition-all hover:bg-primary/90"
        >
          <span>{ad.ctaText || "Learn More"}</span>
          <ExternalLink className="size-4" />
        </button>
      </div>
    </div>
  );
}
