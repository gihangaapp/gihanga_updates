import { useEffect, useState } from "react";
import { ExternalLink, Heart, ImageOff, MessageCircle, Share2 } from "lucide-react";
import { AdBadge } from "./AdBadge";
import { mediaUrl as resolveMediaUrl, mediaUrlWithAuth } from "@/lib/api-client";

interface AdPreviewProps {
  adType: "image" | "video" | "story_image" | "story_video";
  placement: "feed" | "story";
  title: string;
  caption?: string | undefined;
  ctaText?: string | undefined;
  ctaUrl?: string | undefined;
  mediaUrl?: string | undefined;
  mediaKey?: string | undefined;
  thumbnailUrl?: string | undefined;
  creatorName?: string | undefined;
  creatorUsername?: string | undefined;
}

function MissingMedia({ label }: { label: string }) {
  return (
    <div className="grid h-full w-full place-items-center gap-2 bg-slate-900 p-5 text-center text-xs text-white/75">
      <ImageOff className="size-5" />
      <span>{label}</span>
    </div>
  );
}

export function AdPreview({
  adType,
  placement,
  title,
  caption,
  ctaText = "Learn More",
  ctaUrl,
  mediaUrl,
  mediaKey,
  thumbnailUrl,
  creatorName = "Your Brand",
  creatorUsername = "yourbrand",
}: AdPreviewProps) {
  // Pending campaign media remains quarantined. Add the current consumer or
  // staff token to the checked media URL so <img>/<video> can preview it.
  // Published campaign media is authorized by the backend's active-ad check.
  const mediaPath = mediaUrl || (mediaKey ? `/api/v1/media/file/${mediaKey}` : undefined);
  const resolvedMedia = mediaUrlWithAuth(resolveMediaUrl(mediaPath) || mediaPath);
  const resolvedThumbnail = mediaUrlWithAuth(resolveMediaUrl(thumbnailUrl) || thumbnailUrl);
  const isVideo = adType.includes("video");
  const [mediaFailed, setMediaFailed] = useState(false);

  useEffect(() => {
    setMediaFailed(false);
  }, [resolvedMedia]);

  if (placement === "story") {
    return (
      <div className="relative mx-auto aspect-[9/16] w-full max-w-[260px] overflow-hidden rounded-3xl border border-border bg-slate-900 shadow-2xl">
        {resolvedMedia && !mediaFailed ? (
          isVideo ? (
            <video
              src={resolvedMedia}
              poster={resolvedThumbnail}
              controls
              muted
              playsInline
              preload="metadata"
              className="h-full w-full object-cover"
              onError={() => setMediaFailed(true)}
            />
          ) : (
            <img src={resolvedMedia} alt={title} decoding="async" onError={() => setMediaFailed(true)} className="h-full w-full object-cover" />
          )
        ) : <MissingMedia label={mediaFailed ? "Advertisement media could not be loaded. Check the upload or media permissions." : "Upload media to preview this Story advertisement"} />}

        <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-3 text-white">
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-full bg-indigo-600 text-xs font-bold text-white">{creatorName[0]?.toUpperCase()}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold leading-tight">{creatorName}</p>
              <p className="text-[10px] text-white/70">@{creatorUsername}</p>
            </div>
            <AdBadge variant="glass" />
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 text-white">
          <p className="line-clamp-1 text-sm font-bold">{title}</p>
          {caption && <p className="mt-1 line-clamp-2 text-xs text-white/80">{caption}</p>}
          <div className="mt-3 flex items-center justify-between rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-lg">
            <span>{ctaText}</span><ExternalLink className="size-3.5" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-card overflow-hidden border border-border">
      <div className="flex items-center justify-between p-3.5">
        <div className="flex items-center gap-2.5">
          <div className="grid size-9 place-items-center rounded-full bg-indigo-600 text-xs font-bold text-white">{creatorName[0]?.toUpperCase()}</div>
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

      <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
        {resolvedMedia && !mediaFailed ? (
          isVideo ? (
            <video src={resolvedMedia} poster={resolvedThumbnail} controls muted playsInline preload="metadata" onError={() => setMediaFailed(true)} className="h-full w-full object-cover" />
          ) : (
            <img src={resolvedMedia} alt={title} decoding="async" onError={() => setMediaFailed(true)} className="h-full w-full object-cover" />
          )
        ) : <MissingMedia label={mediaFailed ? "Advertisement media could not be loaded. Check the upload or media permissions." : "Upload media to preview this Feed advertisement"} />}
      </div>

      <div className="flex items-center justify-between border-y border-border/60 bg-muted/30 px-4 py-2.5">
        <div className="min-w-0 flex-1 pr-2">
          <p className="truncate text-xs font-bold text-foreground">{title}</p>
          {ctaUrl && <p className="truncate text-[10px] text-muted-foreground">{ctaUrl}</p>}
        </div>
        <span className="flex shrink-0 items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">
          {ctaText}<ExternalLink className="size-3" />
        </span>
      </div>

      <div className="p-3.5">
        {caption && <p className="text-xs text-foreground/90">{caption}</p>}
        <div className="mt-3 flex items-center gap-4 text-muted-foreground" aria-hidden="true">
          <Heart className="size-4" /><MessageCircle className="size-4" /><Share2 className="size-4" />
        </div>
      </div>
    </div>
  );
}
