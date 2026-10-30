import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { AdBadge } from "./AdBadge";
import {
  Advertisement,
  useAdFeedback,
  useRecordClick,
  useRecordImpression,
  useRecordView,
} from "@/hooks/use-ads";
import { mediaUrl as resolveMediaUrl } from "@/lib/api-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FeedAdCardProps {
  ad: Advertisement;
}

export function FeedAdCard({ ad }: FeedAdCardProps) {
  const recordImpression = useRecordImpression();
  const recordClick = useRecordClick();
  const recordView = useRecordView();
  const feedback = useAdFeedback();
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
    if (ad.ctaUrl) window.open(ad.ctaUrl, "_blank", "noopener,noreferrer");
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
  const resolvedMedia = resolveMediaUrl(ad.mediaUrl) || ad.mediaUrl;
  const resolvedThumbnail = resolveMediaUrl(ad.thumbnailUrl) || ad.thumbnailUrl;

  if (hidden) return null;

  return (
    <article ref={articleRef} className="surface-card mb-4 overflow-hidden rounded-2xl border border-border/80 shadow-sm transition-all hover:border-border">
      <div className="flex items-center justify-between p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-xs font-bold text-white shadow-md">{creatorName[0]?.toUpperCase()}</div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm font-bold text-foreground">{creatorName}</span>
              <span className="truncate text-xs text-muted-foreground">@{creatorUsername}</span>
            </div>
            <p className="text-[11px] font-medium text-muted-foreground">Sponsored</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <AdBadge variant="glass" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" aria-label="Advertisement options" className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"><MoreHorizontal className="size-4" /></button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => toast.info("This sponsored placement is part of an approved campaign that matches the current Feed placement and its audience settings.")}>Why am I seeing this ad?</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFeedback("hide")}>Hide this ad</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFeedback("report")}>Report ad</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {ad.title && <h3 className="px-4 pb-2 text-base font-bold text-foreground">{ad.title}</h3>}
      {ad.caption && <p className="px-4 pb-3 text-xs leading-relaxed text-foreground/90">{ad.caption}</p>}

      {resolvedMedia && (
        <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
          {ad.mediaType === "video" || ad.adType.includes("video") ? (
            <video src={resolvedMedia} poster={resolvedThumbnail} controls muted playsInline preload="metadata" className="h-full w-full object-cover" />
          ) : (
            <img src={resolvedMedia} alt={ad.title} loading="lazy" decoding="async" className="h-full w-full object-cover" />
          )}
        </div>
      )}

      <div className="flex items-center justify-between border-y border-border/60 bg-muted/40 px-4 py-3">
        <div className="min-w-0 flex-1 pr-3">
          <p className="truncate text-xs font-extrabold text-foreground">{ad.title}</p>
          {ad.ctaUrl && <p className="truncate text-[10px] text-muted-foreground">{ad.ctaUrl}</p>}
        </div>
        <button type="button" onClick={handleCtaClick} className="press flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90">
          <span>{ad.ctaText || "Learn More"}</span><ExternalLink className="size-3.5" />
        </button>
      </div>

      <div className="flex items-center justify-between p-3.5 text-muted-foreground">
        <div className="flex items-center gap-5">
          <span aria-hidden="true" className="flex items-center gap-1.5 text-xs"><Heart className="size-4" /><span>Sponsored</span></span>
          <span aria-hidden="true"><MessageCircle className="size-4" /></span>
          <span aria-hidden="true"><Share2 className="size-4" /></span>
        </div>
        <span aria-hidden="true"><Bookmark className="size-4" /></span>
      </div>
    </article>
  );
}
