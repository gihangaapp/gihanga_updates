import { Eye, MousePointerClick, Pause, Play, Trash2, Clock, CheckCircle2, MonitorPlay } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AdBadge } from "./AdBadge";
import { formatCount } from "@/lib/format";
import { Advertisement, useUpdateAd, useDeleteAd } from "@/hooks/use-ads";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AdPreview } from "./AdPreview";

const STATUS_STYLE: Record<Advertisement["status"], string> = {
  draft: "bg-muted text-muted-foreground",
  pending_payment: "bg-amber-500/15 text-amber-600",
  processing: "bg-amber-500/15 text-amber-600",
  paid: "bg-indigo-500/15 text-indigo-500",
  pending_review: "bg-amber-500/15 text-amber-600",
  approved: "bg-sky-500/15 text-sky-600",
  active: "bg-success/15 text-success font-extrabold",
  paused: "bg-muted text-muted-foreground",
  expired: "bg-primary-soft text-primary",
  rejected: "bg-danger/15 text-danger",
  cancelled: "bg-muted text-muted-foreground line-through",
  refund_pending: "bg-amber-500/15 text-amber-600",
  refunded: "bg-muted text-muted-foreground",
};

interface AdCardProps {
  campaign: Advertisement;
}

export function AdCard({ campaign }: AdCardProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const updateAd = useUpdateAd();
  const deleteAd = useDeleteAd();
  const deliveryProgress = campaign.advertisingMinutes > 0
    ? Math.min(100, (campaign.advertisingMinutesDelivered / campaign.advertisingMinutes) * 100)
    : 0;

  const isManualPayment = campaign.paymentMethod === "manual";
  const reviewLabel = campaign.status === "pending_review"
    ? "Awaiting creative review"
    : campaign.status === "approved" && campaign.manualPaymentStatus !== "verified"
      ? "Creative approved · Awaiting manual payment"
      : campaign.status === "active"
        ? "Payment verified · Campaign delivering"
        : campaign.status.replaceAll("_", " ");

  return (
    <div className="surface-card overflow-hidden border border-border p-4 transition-all hover:border-border/80">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-bold text-sm text-foreground">{campaign.title}</h3>
            <AdBadge variant="glass" />
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground capitalize">
            {campaign.adType.replace("_", " ")} · {campaign.placement} placement
          </p>
        </div>
        <span className={cn("shrink-0 rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider", STATUS_STYLE[campaign.status])}>
          {campaign.status.replaceAll("_", " ")}
        </span>
      </div>

      {campaign.status === "rejected" && campaign.rejectionReason && (
        <div className="mt-3 rounded-xl border border-danger/20 bg-danger/10 p-3 text-xs text-danger">
          <span className="block font-bold">Rejection reason:</span>
          <p className="mt-0.5">{campaign.rejectionReason}</p>
        </div>
      )}

      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-elevated p-3 text-xs">
        <div className="flex items-center gap-2">
          {campaign.paymentStatus === "paid" ? (
            <CheckCircle2 className="size-4 text-success" />
          ) : (
            <Clock className="size-4 text-amber-500" />
          )}
          <div>
            <p className="font-semibold text-foreground">{isManualPayment ? `Manual payment · ${reviewLabel}` : `Payment · ${campaign.paymentStatus.replaceAll("_", " ")}`}</p>
            <p className="text-[10px] text-muted-foreground">{!isManualPayment ? "This campaign uses the original payment record." : campaign.status === "pending_review" ? "Payment is arranged only after the creative is approved." : campaign.status === "approved" ? "Our team will contact you using the submitted details to arrange payment." : campaign.status === "rejected" ? "No payment is due for a rejected campaign." : campaign.status === "active" ? "Your manual payment was confirmed and the campaign is delivering." : "Our team will use the submitted details for campaign follow-up."}</p>
          </div>
        </div>
        <div className="font-extrabold tabular-nums text-foreground">{campaign.totalRwfCost.toLocaleString()} RWF</div>
      </div>

      {isManualPayment && campaign.manualPaymentContact && (
        <div className="mt-2 rounded-lg border border-border/60 p-2.5 text-[11px] text-muted-foreground">
          Payment contact: <strong className="text-foreground">{campaign.manualPaymentContact.email}</strong> · {campaign.manualPaymentContact.phone}
        </div>
      )}

      <div className="mt-3.5 grid grid-cols-4 gap-1.5 rounded-xl border border-border/60 bg-card p-2 text-center text-xs">
        <div>
          <p className="flex items-center justify-center gap-1 font-extrabold text-foreground"><Eye className="size-3 text-primary" /> {formatCount(campaign.analytics?.impressions ?? 0)}</p>
          <p className="text-[10px] text-muted-foreground">Impressions</p>
        </div>
        <div>
          <p className="flex items-center justify-center gap-1 font-extrabold text-foreground"><MousePointerClick className="size-3 text-primary" /> {formatCount(campaign.analytics?.clicks ?? 0)}</p>
          <p className="text-[10px] text-muted-foreground">Clicks</p>
        </div>
        <div>
          <p className="font-extrabold text-foreground">{campaign.analytics?.ctr ?? 0}%</p>
          <p className="text-[10px] text-muted-foreground">CTR</p>
        </div>
        <div>
          <p className="font-extrabold text-foreground">{formatCount(campaign.analytics?.views ?? 0)}</p>
          <p className="text-[10px] text-muted-foreground">Views</p>
        </div>
      </div>

      <div className="mt-3.5">
        <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
          <span>Delivery quota: {campaign.advertisingMinutesDelivered} / {campaign.advertisingMinutes} min</span>
          <span className="font-bold text-foreground">{Math.round(deliveryProgress)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div className="gradient-brand h-full transition-all duration-300" style={{ width: `${deliveryProgress}%` }} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/60 pt-3">
        <Button size="sm" variant="outline" onClick={() => setPreviewOpen(true)}>
          <MonitorPlay className="mr-1 size-3.5" /> Preview
        </Button>
        {(campaign.status === "active" || campaign.status === "paused") && (
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            disabled={updateAd.isPending}
            onClick={() => updateAd.mutate({ id: campaign._id, status: campaign.status === "active" ? "paused" : "active" })}
          >
            {campaign.status === "active" ? <Pause className="mr-1 size-3.5" /> : <Play className="mr-1 size-3.5" />}
            {campaign.status === "active" ? "Pause" : "Resume"}
          </Button>
        )}
        {(campaign.paymentStatus !== "paid" || campaign.status === "rejected" || campaign.status === "draft") && (
          <Button
            size="sm"
            variant="ghost"
            className="text-danger hover:bg-danger/10"
            disabled={deleteAd.isPending}
            onClick={() => deleteAd.mutate(campaign._id, {
              onSuccess: () => toast.success("Campaign removed"),
              onError: (error: any) => toast.error(error.message || "Could not remove campaign"),
            })}
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader><DialogTitle>Advertisement Preview — {campaign.title}</DialogTitle></DialogHeader>
          <div className="pt-2">
            <AdPreview
              adType={campaign.adType}
              placement={campaign.placement}
              title={campaign.title}
              caption={campaign.caption}
              ctaText={campaign.ctaText}
              ctaUrl={campaign.ctaUrl}
              mediaUrl={campaign.mediaUrl}
              mediaKey={campaign.mediaKey}
              thumbnailUrl={campaign.thumbnailUrl}
              creatorName={typeof campaign.creator === "object" ? campaign.creator.name : undefined}
              creatorUsername={typeof campaign.creator === "object" ? campaign.creator.username : undefined}
              creatorAvatarUrl={typeof campaign.creator === "object" ? campaign.creator.avatarUrl : undefined}
              creatorAvatarHue={typeof campaign.creator === "object" ? campaign.creator.avatarHue : undefined}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
