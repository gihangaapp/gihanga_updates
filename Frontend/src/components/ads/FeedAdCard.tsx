import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, Heart, MessageCircle, Share2, MoreHorizontal, Smile, Loader2, ImageOff } from "lucide-react";
import { toast } from "sonner";
import { AdBadge } from "./AdBadge";
import {
  Advertisement,
  AdReaction,
  useAdFeedback,
  useAdReaction,
  useShareAd,
  useRecordClick,
  useRecordImpression,
  useRecordView,
} from "@/hooks/use-ads";
import { mediaUrl as resolveMediaUrl, mediaUrlWithAuth } from "@/lib/api-client";
import { formatCount } from "@/lib/format";
import { useAuth } from "@/lib/auth-context";
import { AdCommentsDialog } from "./AdCommentsDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FeedAdCardProps {
  ad: Advertisement;
  variant?: "feed" | "reel";
  isActive?: boolean;
}

export function FeedAdCard({ ad, variant = "feed", isActive = true }: FeedAdCardProps) {
  const recordImpression = useRecordImpression();
  const recordClick = useRecordClick();
  const recordView = useRecordView();
  const feedback = useAdFeedback();
  const updateReaction = useAdReaction();
  const shareAd = useShareAd();
  const { user, staffUser } = useAuth();
  const canInteract = Boolean(user || staffUser);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [mediaFailed, setMediaFailed] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const reelVideoRef = useRef<HTMLVideoElement>(null);
  const impressionMutate = useRef(recordImpression.mutate);
  const viewMutate = useRef(recordView.mutate);
  impressionMutate.current = recordImpression.mutate;
  viewMutate.current = recordView.mutate;
  const [hidden, setHidden] = useState(false);
  const articleRef = useRef<HTMLElement>(null);
  const impressionSent = useRef(false);
  const accumulatedVisibleMs = useRef(0);
  const visibleSince = useRef<number | null>(null);
  const viewReported = useRef(false);
  const intersectionVisible = useRef(false);

  const reportView = useCallback(() => {
    if (!ad._id || viewReported.current) return;
    const currentVisibleMs = visibleSince.current === null ? 0 : Date.now() - visibleSince.current;
    const seconds = Math.floor((accumulatedVisibleMs.current + currentVisibleMs) / 1000);
    if (seconds < 1) return;
    viewReported.current = true;
    visibleSince.current = null;
    viewMutate.current({ adId: ad._id, seconds });
  }, [ad._id]);

  useEffect(() => {
    const element = articleRef.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry) return;
      const isVisible = entry.isIntersecting && entry.intersectionRatio >= 0.5;
      intersectionVisible.current = isVisible;
      if (isVisible && document.visibilityState !== "hidden") {
        if (!impressionSent.current && ad._id) {
          impressionSent.current = true;
          impressionMutate.current(ad._id);
        }
        if (visibleSince.current === null) visibleSince.current = Date.now();
      } else if (visibleSince.current !== null) {
        accumulatedVisibleMs.current += Math.max(0, Date.now() - visibleSince.current);
        visibleSince.current = null;
        reportView();
      }
    }, { threshold: [0, 0.5, 1] });
    observer.observe(element);
    const onVisibility = () => {
      if (document.visibilityState === "hidden" && visibleSince.current !== null) {
        accumulatedVisibleMs.current += Math.max(0, Date.now() - visibleSince.current);
        visibleSince.current = null;
        reportView();
      } else if (document.visibilityState !== "hidden" && intersectionVisible.current) {
        if (!impressionSent.current && ad._id) {
          impressionSent.current = true;
          impressionMutate.current(ad._id);
        }
        if (visibleSince.current === null && !viewReported.current) {
          visibleSince.current = Date.now();
        }
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      if (visibleSince.current !== null) {
        accumulatedVisibleMs.current += Math.max(0, Date.now() - visibleSince.current);
        visibleSince.current = null;
      }
      reportView();
    };
  }, [ad._id, reportView]);

  function handleCtaClick() {
    if (ad._id) recordClick.mutate(ad._id);
    const destination = ad.ctaUrl || `${window.location.origin}/profile/${encodeURIComponent(creatorUsername)}`;
    window.open(destination, "_blank", "noopener,noreferrer");
  }

  function runReaction(reaction: AdReaction | null) {
    if (!canInteract) {
      toast.info("Sign in to react to advertisements.");
      return;
    }
    updateReaction.mutate(
      { adId: ad._id, reaction },
      { onError: (error: any) => toast.error(error.message || "Could not update your reaction") },
    );
  }

  function handleFeedback(action: "hide" | "report") {
    feedback.mutate({ id: ad._id, action, reason: action === "report" ? "Reported from Feed" : undefined }, {
      onSuccess: () => {
        if (action === "hide") setHidden(true);
        toast.success(action === "hide" ? "This advertisement will be hidden from your future ad delivery." : "Advertisement reported to the moderation team.");
      },
      onError: (error: any) => toast.error(error.message || "Could not save advertisement feedback"),
    });
  }

  const creator = typeof ad.creator === "object" ? ad.creator : null;
  const creatorName = creator?.name || "Sponsored Partner";
  const creatorUsername = creator?.username || "sponsored";
  const creatorAvatar = mediaUrlWithAuth(resolveMediaUrl(creator?.avatarUrl) || creator?.avatarUrl);
  const mediaPath = ad.mediaUrl || (ad.mediaKey ? `/api/v1/media/file/${ad.mediaKey}` : undefined);
  const resolvedMedia = mediaUrlWithAuth(resolveMediaUrl(mediaPath) || mediaPath);
  const resolvedThumbnail = mediaUrlWithAuth(resolveMediaUrl(ad.thumbnailUrl) || ad.thumbnailUrl);
  const isVideo = ad.mediaType === "video" || ad.adType.includes("video");
  useEffect(() => { setMediaFailed(false); setAvatarFailed(false); }, [ad._id, resolvedMedia, creatorAvatar]);
  useEffect(() => {
    if (variant !== "reel") return;
    const video = reelVideoRef.current;
    if (!video) return;
    if (isActive) void video.play().catch(() => undefined);
    else video.pause();
  }, [variant, isActive, resolvedMedia]);

  if (hidden) return null;

  return (
    <article ref={articleRef} className={variant === "reel" ? "relative h-full w-full overflow-hidden rounded-3xl border border-white/10 bg-black text-white shadow-float max-lg:rounded-none" : "surface-card mb-4 overflow-hidden rounded-2xl border border-border/80 shadow-sm transition-all hover:border-border"}>
      <div className={variant === "reel" ? "absolute inset-x-0 top-0 z-20 flex items-center justify-between bg-gradient-to-b from-black/85 via-black/35 to-transparent p-4 text-white" : "flex items-center justify-between p-4"}>
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-xs font-bold text-white shadow-md">{creatorAvatar && !avatarFailed ? <img src={creatorAvatar} alt={creatorName} onError={() => setAvatarFailed(true)} className="size-full object-cover" /> : creatorName[0]?.toUpperCase()}</div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={`truncate text-sm font-bold ${variant === "reel" ? "text-white" : "text-foreground"}`}>{creatorName}</span>
              <span className={`truncate text-xs ${variant === "reel" ? "text-white/75" : "text-muted-foreground"}`}>@{creatorUsername}</span>
            </div>
            <p className={`text-[11px] font-medium ${variant === "reel" ? "text-white/75" : "text-muted-foreground"}`}>Sponsored</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <AdBadge variant="glass" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" aria-label="Advertisement options" className={`grid size-8 place-items-center rounded-full ${variant === "reel" ? "text-white hover:bg-white/15" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}><MoreHorizontal className="size-4" /></button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => toast.info("This sponsored placement is part of an approved campaign that matches the current Feed placement and its audience settings.")}>Why am I seeing this ad?</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFeedback("hide")}>Hide this ad</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFeedback("report")}>Report ad</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {variant === "feed" && ad.title && <h3 className="px-4 pb-2 text-base font-bold text-foreground">{ad.title}</h3>}
      {variant === "feed" && ad.caption && <p className="px-4 pb-3 text-xs leading-relaxed text-foreground/90">{ad.caption}</p>}

      <div className={variant === "reel" ? "absolute inset-0 h-full w-full overflow-hidden bg-slate-950" : "relative aspect-video w-full overflow-hidden bg-slate-950"}>
        {resolvedMedia && !mediaFailed ? (
          isVideo ? (
            <video ref={reelVideoRef} src={resolvedMedia} poster={resolvedThumbnail} controls={variant === "feed"} autoPlay={variant === "reel" && isActive} muted playsInline preload={variant === "reel" ? (isActive ? "auto" : "none") : "metadata"} onError={() => setMediaFailed(true)} className="h-full w-full object-cover" />
          ) : (
            <img src={resolvedMedia} alt={ad.title} loading="lazy" decoding="async" onError={() => setMediaFailed(true)} className="h-full w-full object-cover" />
          )
        ) : (
          <div className="grid h-full w-full place-items-center gap-2 text-center text-xs text-white/75">
            <ImageOff className="size-5" />
            <span>{mediaFailed ? "Advertisement media is temporarily unavailable" : "Advertisement media unavailable"}</span>
          </div>
        )}
      </div>

      {variant === "reel" && (ad.title || ad.caption) && <div className="absolute inset-x-0 bottom-28 z-10 bg-gradient-to-t from-black/80 to-transparent px-5 pb-3 pt-12 text-white">{ad.title && <h3 className="text-base font-extrabold">{ad.title}</h3>}{ad.caption && <p className="mt-1 line-clamp-3 text-xs text-white/85">{ad.caption}</p>}</div>}

      <div className={variant === "reel" ? "absolute inset-x-4 bottom-16 z-20 flex items-center justify-between gap-2 rounded-xl bg-primary px-3 py-2.5 text-primary-foreground shadow-xl" : "flex items-center justify-between border-y border-border/60 bg-muted/40 px-4 py-3"}>
        <div className="min-w-0 flex-1 pr-3">
          <p className={`truncate text-xs font-extrabold ${variant === "reel" ? "text-white" : "text-foreground"}`}>{ad.title}</p>
          {ad.ctaUrl && <p className={`truncate text-[10px] ${variant === "reel" ? "text-white/70" : "text-muted-foreground"}`}>{ad.ctaUrl}</p>}
        </div>
        <button type="button" onClick={handleCtaClick} className={variant === "reel" ? "press flex w-full items-center justify-between gap-2 text-xs font-bold" : "press flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90"}>
          <span>{ad.ctaText || "Learn More"}</span><ExternalLink className="size-3.5" />
        </button>
      </div>

      <div className={variant === "reel" ? "absolute inset-x-3 bottom-2 z-20 flex flex-wrap items-center justify-between gap-2 text-white" : "flex flex-wrap items-center justify-between gap-2 border-t border-border/60 px-3.5 py-3 text-muted-foreground"}>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={Boolean(ad.viewerReaction)}
            disabled={updateReaction.isPending}
            onClick={() => runReaction(ad.viewerReaction === "like" ? null : "like")}
            className={`press inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors ${variant === "reel" ? "hover:bg-white/15" : "hover:bg-muted"} ${ad.viewerReaction ? "text-rose-500" : variant === "reel" ? "text-white" : "text-muted-foreground"}`}
          >
            {updateReaction.isPending ? <Loader2 className="size-4 animate-spin" /> : <Heart className={`size-4 ${ad.viewerReaction ? "fill-current" : ""}`} />}
            <span>{formatCount(ad.analytics?.likes ?? 0)}</span>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className={`press inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors ${variant === "reel" ? "text-white hover:bg-white/15" : "hover:bg-muted"}`} aria-label="Choose a reaction">
                <Smile className="size-4" /><span>React</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {([
                ["like", "👍 Like"], ["love", "❤️ Love"], ["care", "🤗 Care"],
                ["haha", "😂 Haha"], ["wow", "😮 Wow"], ["sad", "😢 Sad"], ["angry", "😡 Angry"],
              ] as [AdReaction, string][]).map(([reaction, label]) => (
                <DropdownMenuItem key={reaction} onClick={() => runReaction(ad.viewerReaction === reaction ? null : reaction)}>{label}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button type="button" onClick={() => setCommentsOpen(true)} className={`press inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors ${variant === "reel" ? "text-white hover:bg-white/15" : "hover:bg-muted"}`}>
            <MessageCircle className="size-4" /><span>{formatCount(ad.commentsCount ?? ad.analytics?.comments ?? 0)}</span>
          </button>

          <button
            type="button"
            disabled={shareAd.isPending}
            onClick={async () => {
              if (!canInteract) {
                toast.info("Sign in to share advertisements.");
                return;
              }
              const profileUrl = `${window.location.origin}/profile/${encodeURIComponent(creatorUsername)}`;
              const shareUrl = ad.ctaUrl || profileUrl;
              try {
                if (navigator.share) {
                  await navigator.share({ title: ad.title, text: ad.caption || `Check out ${creatorName} on Gihanga Updates`, url: shareUrl });
                } else if (navigator.clipboard?.writeText) {
                  await navigator.clipboard.writeText(shareUrl);
                  toast.success("Advertisement link copied");
                } else {
                  toast.error("Sharing is not available in this browser");
                  return;
                }
                shareAd.mutate(ad._id, { onError: (error: any) => toast.error(error.message || "Share could not be recorded") });
              } catch (error: any) {
                if (error?.name !== "AbortError") toast.error(error?.message || "Could not share this advertisement");
              }
            }}
            className={`press inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors disabled:opacity-50 ${variant === "reel" ? "text-white hover:bg-white/15" : "hover:bg-muted"}`}
          >
            {shareAd.isPending ? <Loader2 className="size-4 animate-spin" /> : <Share2 className="size-4" />}
            <span>Share</span>
          </button>
        </div>
        <span className={variant === "reel" ? "text-[10px] font-medium text-white/70" : "text-[10px] font-medium text-muted-foreground"}>Sponsored</span>
      </div>

      <AdCommentsDialog adId={ad._id} adTitle={ad.title} open={commentsOpen} onOpenChange={setCommentsOpen} />
    </article>
  );
}
