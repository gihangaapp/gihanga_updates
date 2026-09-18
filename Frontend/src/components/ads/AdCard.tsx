import { useState } from "react";
import {
  Eye,
  MousePointerClick,
  Pause,
  Play,
  Trash2,
  Coins,
  Wallet,
  Clock,
  ChevronRight,
  BarChart2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AdBadge } from "./AdBadge";
import { PointsCheckout } from "./PointsCheckout";
import { MoneyCheckout } from "./MoneyCheckout";
import { formatCount } from "@/lib/format";
import { Advertisement, useUpdateAd, useDeleteAd } from "@/hooks/use-ads";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<Advertisement["status"], string> = {
  draft: "bg-muted text-muted-foreground",
  pending_payment: "bg-amber-500/15 text-amber-600",
  processing: "bg-amber-500/15 text-amber-600",
  paid: "bg-indigo-500/15 text-indigo-500",
  pending_review: "bg-amber-500/15 text-amber-600",
  approved: "bg-success/15 text-success",
  active: "bg-success/15 text-success font-extrabold animate-pulse",
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
  const updateAd = useUpdateAd();
  const deleteAd = useDeleteAd();

  const [pointsModalOpen, setPointsModalOpen] = useState(false);
  const [moneyModalOpen, setMoneyModalOpen] = useState(false);

  const deliveryProgress =
    campaign.advertisingMinutes > 0
      ? Math.min(100, (campaign.advertisingMinutesDelivered / campaign.advertisingMinutes) * 100)
      : 0;

  function rwf(n: number) {
    return `${n.toLocaleString()} RWF`;
  }

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

        <span
          className={cn(
            "shrink-0 rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
            STATUS_STYLE[campaign.status],
          )}
        >
          {campaign.status.replace("_", " ")}
        </span>
      </div>

      {/* Rejection Reason Alert */}
      {campaign.status === "rejected" && campaign.rejectionReason && (
        <div className="mt-3 rounded-xl bg-danger/10 p-3 text-xs text-danger border border-danger/20">
          <span className="font-bold block">Rejection Reason:</span>
          <p className="mt-0.5">{campaign.rejectionReason}</p>
        </div>
      )}

      {/* Payment Status Bar */}
      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-elevated p-2.5 text-xs">
        <div className="flex items-center gap-1.5">
          {campaign.paymentMethod === "gihanga_points" ? (
            <Coins className="size-4 text-amber-500" />
          ) : (
            <Wallet className="size-4 text-primary" />
          )}
          <span className="font-semibold text-foreground">
            {campaign.paymentMethod === "gihanga_points" ? "Gihanga Points" : "Real Money"}
          </span>
        </div>

        <div className="font-bold">
          {campaign.paymentMethod === "gihanga_points"
            ? `${formatCount(campaign.totalGpCost)} GP`
            : rwf(campaign.totalRwfCost)}
        </div>
      </div>

      {/* Analytics Summary Grid */}
      <div className="mt-3.5 grid grid-cols-4 gap-1.5 rounded-xl border border-border/60 bg-card p-2 text-center text-xs">
        <div>
          <p className="flex items-center justify-center gap-1 font-extrabold text-foreground">
            <Eye className="size-3 text-primary" />{" "}
            {formatCount(campaign.analytics?.impressions ?? 0)}
          </p>
          <p className="text-[10px] text-muted-foreground">Impressions</p>
        </div>
        <div>
          <p className="flex items-center justify-center gap-1 font-extrabold text-foreground">
            <MousePointerClick className="size-3 text-primary" />{" "}
            {formatCount(campaign.analytics?.clicks ?? 0)}
          </p>
          <p className="text-[10px] text-muted-foreground">Clicks</p>
        </div>
        <div>
          <p className="font-extrabold text-foreground">{campaign.analytics?.ctr ?? 0}%</p>
          <p className="text-[10px] text-muted-foreground">CTR</p>
        </div>
        <div>
          <p className="font-extrabold text-foreground">
            {formatCount(campaign.analytics?.views ?? 0)}
          </p>
          <p className="text-[10px] text-muted-foreground">Views</p>
        </div>
      </div>

      {/* Quota Delivery Progress */}
      <div className="mt-3.5">
        <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
          <span>
            Delivery Quota: {campaign.advertisingMinutesDelivered} / {campaign.advertisingMinutes}{" "}
            min
          </span>
          <span className="font-bold text-foreground">{Math.round(deliveryProgress)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="gradient-brand h-full transition-all duration-300"
            style={{ width: `${deliveryProgress}%` }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/60 pt-3">
        {/* Checkout Button if Unpaid */}
        {campaign.paymentStatus !== "paid" && (
          <div className="flex flex-1 gap-2">
            <Button
              size="sm"
              variant="brand"
              className="flex-1"
              onClick={() => setPointsModalOpen(true)}
            >
              <Coins className="mr-1 size-3.5" /> Pay GP
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => setMoneyModalOpen(true)}
            >
              <Wallet className="mr-1 size-3.5" /> Pay Cash
            </Button>
          </div>
        )}

        {/* Pause/Resume for Active Campaigns */}
        {(campaign.status === "active" || campaign.status === "paused") && (
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            disabled={updateAd.isPending}
            onClick={() =>
              updateAd.mutate({
                id: campaign._id,
                status: campaign.status === "active" ? "paused" : "active",
              })
            }
          >
            {campaign.status === "active" ? (
              <Pause className="mr-1 size-3.5" />
            ) : (
              <Play className="mr-1 size-3.5" />
            )}
            {campaign.status === "active" ? "Pause" : "Resume"}
          </Button>
        )}

        {/* Delete button */}
        {(campaign.paymentStatus !== "paid" || campaign.status === "rejected") && (
          <Button
            size="sm"
            variant="ghost"
            className="text-danger hover:bg-danger/10"
            disabled={deleteAd.isPending}
            onClick={() => {
              deleteAd.mutate(campaign._id);
              toast.success("Campaign removed");
            }}
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>

      {/* Modals */}
      <PointsCheckout
        open={pointsModalOpen}
        onOpenChange={setPointsModalOpen}
        campaign={campaign}
        onSuccess={() => {}}
      />
      <MoneyCheckout
        open={moneyModalOpen}
        onOpenChange={setMoneyModalOpen}
        campaign={campaign}
        onSuccess={() => {}}
      />
    </div>
  );
}
