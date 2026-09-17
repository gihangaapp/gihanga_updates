import { ExternalLink, Heart, MessageCircle, Share2 } from "lucide-react";
import { AdBadge } from "./AdBadge";
import { mediaUrl as resolveMediaUrl } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface AdPreviewProps {
  adType: "image" | "video" | "story_image" | "story_video";
  placement: "feed" | "story";
  title: string;
  caption?: string;
  ctaText?: string;
  ctaUrl?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  creatorName?: string;
  creatorUsername?: string;
}

export function AdPreview({
  adType,
  placement,
  title,
  caption,
  ctaText = "Learn More",
  ctaUrl,
  mediaUrl,
  thumbnailUrl,
  creatorName = "Your Brand",
  creatorUsername = "yourbrand",
}: AdPreviewProps) {
  const resolvedMedia = resolveMediaUrl(mediaUrl) || mediaUrl;
  const resolvedThumbnail = resolveMediaUrl(thumbnailUrl) || thumbnailUrl;

  if (placement === "story") {
    return (
      <div className="relative mx-auto aspect-[9/16] w-full max-w-[260px] overflow-hidden rounded-3xl border border-border bg-slate-900 shadow-2xl">
        {resolvedMedia ? (
          adType.includes("video") ? (
            <video src={resolvedMedia} poster={resolvedThumbnail} autoPlay loop muted playsInline className="h-full w-full object-cover" />
          ) : (
            <img src={resolvedMedia} alt={title} className="h-full w-full object-cover" />
          )
        ) : (
          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-6 text-center text-xs text-muted-foreground">
            Media preview will display here
          </div>
        )}

        {/* Story Overlay Header */}
        <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-3 text-white">
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-full bg-indigo-600 font-bold text-white text-xs">
              {creatorName[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold leading-tight">{creatorName}</p>
              <p className="text-[10px] text-white/70">@{creatorUsername}</p>
            </div>
            <AdBadge variant="glass" />
          </div>
        </div>

        {/* Story Bottom Bar CTA */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 text-white">
          <p className="font-bold text-sm line-clamp-1">{title}</p>
          {caption && <p className="mt-1 text-xs text-white/80 line-clamp-2">{caption}</p>}

          <div className="mt-3 flex items-center justify-between rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-lg">
            <span>{ctaText}</span>
            <ExternalLink className="size-3.5" />
          </div>
        </div>
      </div>
    );
  }

  // Feed preview
  return (
    <div className="surface-card overflow-hidden border border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-3.5">
        <div className="flex items-center gap-2.5">
          <div className="grid size-9 place-items-center rounded-full bg-indigo-600 font-bold text-white text-xs">
            {creatorName[0]?.toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-foreground">{creatorName}</span>
              <span className="text-[11px] text-muted-foreground">@{creatorUsername}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Sponsored</p>
          </div>
        </div>
        <AdBadge variant="glass" />
      </div>

      {/* Media */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
        {resolvedMedia ? (
          adType.includes("video") ? (
            <video src={resolvedMedia} poster={resolvedThumbnail} controls muted className="h-full w-full object-cover" />
          ) : (
            <img src={resolvedMedia} alt={title} className="h-full w-full object-cover" />
          )
        ) : (
          <div className="grid h-full w-full place-items-center p-6 text-center text-xs text-muted-foreground">
            No media attached yet
          </div>
        )}
      </div>

      {/* CTA Bar */}
      <div className="flex items-center justify-between border-y border-border/60 bg-muted/30 px-4 py-2.5">
        <div className="min-w-0 flex-1 pr-2">
          <p className="truncate text-xs font-bold text-foreground">{title}</p>
          {ctaUrl && <p className="truncate text-[10px] text-muted-foreground">{ctaUrl}</p>}
        </div>
        <span className="flex shrink-0 items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">
          {ctaText}
          <ExternalLink className="size-3" />
        </span>
      </div>

      {/* Body / Caption */}
      <div className="p-3.5">
        {caption && <p className="text-xs text-foreground/90">{caption}</p>}
        <div className="mt-3 flex items-center justify-between text-muted-foreground">
          <div className="flex gap-4">
            <Heart className="size-4" />
            <MessageCircle className="size-4" />
            <Share2 className="size-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
