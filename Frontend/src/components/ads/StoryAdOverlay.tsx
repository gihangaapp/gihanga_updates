import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, MoreHorizontal, X } from "lucide-react";
import { toast } from "sonner";
import { AdBadge } from "./AdBadge";
import {
  Advertisement,
  useAdFeedback,
  useRecordClick,
  useRecordImpression,
  useRecordView,
} from "@/hooks/use-ads";
import { mediaUrl as resolveMediaUrl, mediaUrlWithAuth } from "@/lib/api-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StoryAdOverlayProps {
  ad: Advertisement;
  onClose?: () => void;
}

const IMAGE_AD_DURATION_MS = 6000;

export function StoryAdOverlay({ ad, onClose }: StoryAdOverlayProps) {
  const recordImpression = useRecordImpression();
  const recordClick = useRecordClick();
  const recordView = useRecordView();
  const feedback = useAdFeedback();
  const impressionMutate = useRef(recordImpression.mutate);
  const viewMutate = useRef(recordView.mutate);
  impressionMutate.current = recordImpression.mutate;
  viewMutate.current = recordView.mutate;
  const [mediaReady, setMediaReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pageVisible, setPageVisible] = useState(
    () => typeof document === "undefined" || document.visibilityState !== "hidden",
  );
  const [hidden, setHidden] = useState(false);
  const [mediaFailed, setMediaFailed] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoWasPlayingWhenHidden = useRef(false);
  const impressionSent = useRef(false);
  const viewSent = useRef(false);
  const elapsedMs = useRef(0);
  const lastTick = useRef<number | null>(null);

  const creator = typeof ad.creator === "object" ? ad.creator : null;
  const creatorName = creator?.name || "Sponsored Partner";
  const creatorUsername = creator?.username || "sponsored";
  const creatorAvatar = mediaUrlWithAuth(resolveMediaUrl(creator?.avatarUrl) || creator?.avatarUrl);
  const mediaPath = ad.mediaUrl || (ad.mediaKey ? `/api/v1/media/file/${ad.mediaKey}` : undefined);
  const resolvedMedia = mediaUrlWithAuth(resolveMediaUrl(mediaPath) || mediaPath);
  const resolvedThumbnail = mediaUrlWithAuth(resolveMediaUrl(ad.thumbnailUrl) || ad.thumbnailUrl);
  useEffect(() => { setMediaFailed(false); setAvatarFailed(false); }, [ad._id, resolvedMedia, creatorAvatar]);
  const isVideo = Boolean(ad.mediaType === "video" || ad.adType.includes("video"));

  useEffect(() => {
    const updateVisibility = () => {
      const visible = document.visibilityState !== "hidden";
      setPageVisible(visible);
      const video = videoRef.current;
      if (!visible && video && !video.ended && (
        !video.paused || video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
      )) {
        videoWasPlayingWhenHidden.current = true;
        if (!video.paused) video.pause();
      } else if (visible && videoWasPlayingWhenHidden.current && video) {
        videoWasPlayingWhenHidden.current = false;
        void video.play().catch(() => {
          // If the browser blocks resumed autoplay, leave the video paused so
          // the viewer can continue using its normal media controls.
        });
      }
    };
    document.addEventListener("visibilitychange", updateVisibility);
    updateVisibility();
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  const recordImpressionOnce = useCallback(() => {
    if (impressionSent.current || !ad._id) return;
    impressionSent.current = true;
    impressionMutate.current(ad._id);
  }, [ad._id]);

  useEffect(() => {
    if (mediaReady && pageVisible) recordImpressionOnce();
  }, [mediaReady, pageVisible, recordImpressionOnce]);

  const finishAd = useCallback(() => {
    if (!viewSent.current && impressionSent.current && ad._id) {
      viewSent.current = true;
      const videoSeconds = videoRef.current?.currentTime;
      const seconds = Math.max(1, Math.floor(Number.isFinite(videoSeconds) ? (videoSeconds ?? 0) : elapsedMs.current / 1000));
      viewMutate.current({ adId: ad._id, seconds });
    }
    onClose?.();
  }, [ad._id, onClose]);

  // Image-story ad duration starts only after the image has decoded. Hidden-tab
  // time is excluded so an advertiser does not lose delivery time in background.
  useEffect(() => {
    if (!mediaReady || isVideo || !pageVisible) {
      lastTick.current = null;
      return;
    }
    const timer = window.setInterval(() => {
      const now = performance.now();
      if (lastTick.current !== null) elapsedMs.current += Math.max(0, now - lastTick.current);
      lastTick.current = now;
      const next = Math.min(1, elapsedMs.current / IMAGE_AD_DURATION_MS);
      setProgress(next);
      if (next >= 1) finishAd();
    }, 100);
    return () => window.clearInterval(timer);
  }, [mediaReady, isVideo, pageVisible, finishAd]);

  const handleImageLoad = async (event: React.SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    if (!image.naturalWidth) return;
    try { await image.decode(); } catch { /* load remains authoritative if decode is unsupported */ }
    if (!image.isConnected) return;
    setMediaReady(true);
  };

  const handleVideoPlaying = () => {
    setMediaReady(true);
  };

  const handleCtaClick = () => {
    if (ad._id) recordClick.mutate(ad._id);
    const destination = ad.ctaUrl || `${window.location.origin}/profile/${encodeURIComponent(creatorUsername)}`;
    window.open(destination, "_blank", "noopener,noreferrer");
  };

  const handleHide = () => {
    feedback.mutate({ id: ad._id, action: "hide" }, {
      onSuccess: () => {
        setHidden(true);
        toast.success("This ad will be hidden from your future ad delivery.");
        onClose?.();
      },
      onError: (error: any) => toast.error(error.message || "Could not hide this advertisement"),
    });
  };

  const handleReport = () => {
    feedback.mutate({ id: ad._id, action: "report", reason: "Reported from Stories" }, {
      onSuccess: () => toast.success("Advertisement reported to the moderation team."),
      onError: (error: any) => toast.error(error.message || "Could not report this advertisement"),
    });
  };

  if (hidden) return null;

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-950 text-white">
      {resolvedMedia && !mediaFailed ? (
        isVideo ? (
          <video
            ref={videoRef}
            src={resolvedMedia}
            poster={resolvedThumbnail}
            autoPlay
            muted
            playsInline
            preload="metadata"
            onPlaying={handleVideoPlaying}
            onError={() => setMediaFailed(true)}
            onTimeUpdate={(event) => {
              const video = event.currentTarget;
              if (pageVisible && !video.paused && Number.isFinite(video.duration) && video.duration > 0) {
                setProgress(video.currentTime / video.duration);
              }
            }}
            onEnded={finishAd}
            className="h-full w-full object-cover"
          />
        ) : (
          <img
            src={resolvedMedia}
            alt={ad.title}
            decoding="async"
            onLoad={handleImageLoad}
            onError={() => setMediaFailed(true)}
            className="h-full w-full object-cover"
          />
        )
      ) : (
        <div className="grid h-full w-full place-items-center bg-gradient-to-br from-indigo-950 via-slate-900 to-black p-6 text-center text-sm font-bold">
          <div className="space-y-2"><p>{ad.title}</p><p className="text-xs font-normal text-white/70">{mediaFailed ? "Advertisement media is temporarily unavailable" : "Sponsored advertisement"}</p></div>
        </div>
      )}

      {/* Progress starts after the image has decoded or video playback has begun. */}
      <div className="absolute inset-x-3 top-3 z-30 h-[3px] overflow-hidden rounded-full bg-white/35">
        <div className="h-full origin-left rounded-full bg-white transition-none" style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }} />
      </div>

      <div className="absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-4 pt-7">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-indigo-600 text-xs font-bold text-white shadow-md">{creatorAvatar && !avatarFailed ? <img src={creatorAvatar} alt={creatorName} onError={() => setAvatarFailed(true)} className="size-full object-cover" /> : creatorName[0]?.toUpperCase()}</div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold leading-tight">{creatorName}</p>
              <p className="truncate text-[10px] text-white/70">@{creatorUsername}</p>
            </div>
            <AdBadge variant="glass" />
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" aria-label="Advertisement options" className="grid size-8 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60"><MoreHorizontal className="size-4" /></button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => toast.info("This sponsored placement is part of an approved campaign that matches the current Stories placement and its audience settings.")}>Why am I seeing this ad?</DropdownMenuItem>
                <DropdownMenuItem onClick={handleHide}>Hide this ad</DropdownMenuItem>
                <DropdownMenuItem onClick={handleReport}>Report ad</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {onClose && (
              <button type="button" onClick={finishAd} aria-label="Skip advertisement" className="grid size-8 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60">
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 space-y-3 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <h3 className="line-clamp-2 text-base font-extrabold">{ad.title}</h3>
        {ad.caption && <p className="line-clamp-3 text-xs leading-relaxed text-white/80">{ad.caption}</p>}
        <button type="button" onClick={handleCtaClick} className="press flex w-full items-center justify-between rounded-2xl bg-primary px-4 py-3 text-xs font-bold text-primary-foreground shadow-xl transition-all hover:bg-primary/90">
          <span>{ad.ctaText || "Learn More"}</span>
          <ExternalLink className="size-4" />
        </button>
        <p className="text-center text-[10px] text-white/65">Sponsored · Swipe or tap X to continue</p>
      </div>
    </div>
  );
}
