import { useEffect } from "react";
import { ExternalLink, Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import { AdBadge } from "./AdBadge";
import { Advertisement, useRecordImpression, useRecordClick } from "@/hooks/use-ads";
import { mediaUrl as resolveMediaUrl } from "@/lib/api-client";

interface FeedAdCardProps {
  ad: Advertisement;
}

export function FeedAdCard({ ad }: FeedAdCardProps) {
  const recordImpression = useRecordImpression();
  const recordClick = useRecordClick();

  // Fire impression on render once
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
    <article className="surface-card overflow-hidden border border-border/80 mb-4 rounded-2xl shadow-sm transition-all hover:border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 font-bold text-white text-xs shadow-md">
            {creatorName[0]?.toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-foreground">{creatorName}</span>
              <span className="text-xs text-muted-foreground">@{creatorUsername}</span>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium">Sponsored Post</p>
          </div>
        </div>

        <AdBadge variant="glass" />
      </div>

      {/* Title / Description */}
      {ad.title && <h3 className="px-4 pb-2 font-bold text-base text-foreground">{ad.title}</h3>}
      {ad.caption && (
        <p className="px-4 pb-3 text-xs text-foreground/90 leading-relaxed">{ad.caption}</p>
      )}

      {/* Media Box */}
      {resolvedMedia && (
        <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
          {ad.adType.includes("video") ? (
            <video
              src={resolvedMedia}
              poster={resolvedThumbnail}
              controls
              muted
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            <img src={resolvedMedia} alt={ad.title} className="h-full w-full object-cover" />
          )}
        </div>
      )}

      {/* Call To Action Bar */}
      <div className="flex items-center justify-between border-y border-border/60 bg-muted/40 px-4 py-3">
        <div className="min-w-0 flex-1 pr-3">
          <p className="truncate text-xs font-extrabold text-foreground">{ad.title}</p>
          {ad.ctaUrl && <p className="truncate text-[10px] text-muted-foreground">{ad.ctaUrl}</p>}
        </div>
        <button
          type="button"
          onClick={handleCtaClick}
          className="press flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90"
        >
          <span>{ad.ctaText || "Learn More"}</span>
          <ExternalLink className="size-3.5" />
        </button>
      </div>

      {/* Footer / Social Actions */}
      <div className="flex items-center justify-between p-3.5 text-muted-foreground">
        <div className="flex items-center gap-5">
          <button type="button" className="flex items-center gap-1.5 text-xs hover:text-foreground">
            <Heart className="size-4" />
          </button>
          <button type="button" className="flex items-center gap-1.5 text-xs hover:text-foreground">
            <MessageCircle className="size-4" />
          </button>
          <button type="button" className="flex items-center gap-1.5 text-xs hover:text-foreground">
            <Share2 className="size-4" />
          </button>
        </div>
        <button type="button" className="text-xs hover:text-foreground">
          <Bookmark className="size-4" />
        </button>
      </div>
    </article>
  );
}
