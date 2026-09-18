import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Check,
  X,
  Pause,
  Play,
  Coins,
  Wallet,
  Eye,
  RotateCcw,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCount } from "@/lib/format";
import {
  useStaffAds,
  useStaffAdSummary,
  useApproveAd,
  useRejectAd,
  usePauseAd,
  useResumeAd,
  useRefundAd,
  Advertisement,
} from "@/hooks/use-ads";
import { AdPreview } from "@/components/ads/AdPreview";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/system/dashboard/campaigns")({
  component: StaffCampaignsPage,
});

function rwf(n: number) {
  return `${n.toLocaleString()} RWF`;
}

function StaffCampaignsPage() {
  const [tab, setTab] = useState<string | undefined>(undefined);
  const { data: campaigns = [], isLoading } = useStaffAds({ status: tab });
  const { data: summary } = useStaffAdSummary();

  const approveAd = useApproveAd();
  const rejectAd = useRejectAd();
  const pauseAd = usePauseAd();
  const resumeAd = useResumeAd();
  const refundAd = useRefundAd();

  const [previewAd, setPreviewAd] = useState<Advertisement | null>(null);
  const [rejectingAd, setRejectingAd] = useState<Advertisement | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [autoRefundOnReject, setAutoRefundOnReject] = useState(true);

  function handleApprove(id: string) {
    approveAd.mutate(id, {
      onSuccess: () => toast.success("Campaign approved and set active!"),
      onError: (err: any) => toast.error(err.message || "Failed to approve campaign"),
    });
  }

  function handleRejectSubmit() {
    if (!rejectingAd) return;
    if (!rejectReason.trim()) {
      toast.error("Please enter a reason for rejection");
      return;
    }

    rejectAd.mutate(
      { id: rejectingAd._id, reason: rejectReason.trim(), autoRefund: autoRefundOnReject },
      {
        onSuccess: () => {
          toast.success("Campaign rejected");
          setRejectingAd(null);
          setRejectReason("");
        },
        onError: (err: any) => toast.error(err.message || "Failed to reject campaign"),
      },
    );
  }

  function handleRefund(id: string) {
    refundAd.mutate(id, {
      onSuccess: (res) => toast.success(res.message || "Refund processed"),
      onError: (err: any) => toast.error(err.message || "Refund failed"),
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Sparkles className="size-6 text-amber-500" /> Advertising Campaigns Oversight
        </h1>
        <p className="text-sm text-muted-foreground">
          Review submitted sponsored ads, inspect media and links, approve/reject with audit logs,
          manage pauses, and process refunds.
        </p>
      </div>

      {/* Aggregate Overview Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-border bg-card p-4 text-center">
          <span className="text-xs text-muted-foreground font-semibold block">Total Campaigns</span>
          <span className="font-display text-xl font-extrabold text-foreground">
            {summary?.totalCampaigns ?? 0}
          </span>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 text-center">
          <span className="text-xs text-muted-foreground font-semibold block">Pending Review</span>
          <span className="font-display text-xl font-extrabold text-amber-500">
            {summary?.pendingReview ?? 0}
          </span>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 text-center">
          <span className="text-xs text-muted-foreground font-semibold block">Active Live</span>
          <span className="font-display text-xl font-extrabold text-success">
            {summary?.activeCampaigns ?? 0}
          </span>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 text-center">
          <span className="text-xs text-muted-foreground font-semibold block">
            Total Points Spent
          </span>
          <span className="font-display text-xl font-extrabold text-amber-500">
            {formatCount(summary?.totalPointsSpent ?? 0)} GP
          </span>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 text-center col-span-2 sm:col-span-1">
          <span className="text-xs text-muted-foreground font-semibold block">
            Real Money Revenue
          </span>
          <span className="font-display text-xl font-extrabold text-primary">
            {rwf(summary?.totalRwfRevenue ?? 0)}
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1 rounded-2xl border border-border bg-card p-1">
        {[
          { id: undefined, label: "All" },
          { id: "pending_review", label: "Pending Review" },
          { id: "active", label: "Active" },
          { id: "paused", label: "Paused" },
          { id: "rejected", label: "Rejected" },
          { id: "expired", label: "Expired" },
        ].map((s) => (
          <button
            key={s.id ?? "all"}
            type="button"
            onClick={() => setTab(s.id)}
            className={cn(
              "flex-1 rounded-xl px-3 py-2 text-xs font-bold capitalize transition-all",
              tab === s.id
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <p className="py-12 text-center text-sm text-muted-foreground">Loading campaigns…</p>
      )}

      {/* Campaigns Table / List */}
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <ul className="divide-y divide-border/60">
          {campaigns.map((c) => {
            const creator = typeof c.creator === "object" ? c.creator : null;
            return (
              <li key={c._id} className="p-5 space-y-4 hover:bg-muted/20 transition-colors">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-foreground truncate">{c.title}</h3>
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-bold uppercase text-foreground/90">
                        {c.status.replace("_", " ")}
                      </span>
                    </div>

                    <p className="mt-0.5 text-xs text-muted-foreground">
                      By <strong className="text-foreground">@{creator?.username || "user"}</strong>{" "}
                      ({creator?.email}) ·{" "}
                      <span className="capitalize font-semibold">{c.adType.replace("_", " ")}</span>{" "}
                      · <span className="capitalize font-semibold">{c.placement} placement</span> ·{" "}
                      {c.advertisingMinutes} min quota · {c.campaignDurationDays} days
                    </p>
                  </div>

                  {/* Payment Details Badge */}
                  <div className="flex items-center gap-2 rounded-2xl bg-elevated px-3 py-1.5 text-xs font-semibold">
                    {c.paymentMethod === "gihanga_points" ? (
                      <>
                        <Coins className="size-4 text-amber-500" />
                        <span>{formatCount(c.totalGpCost)} GP</span>
                      </>
                    ) : (
                      <>
                        <Wallet className="size-4 text-primary" />
                        <span>{rwf(c.totalRwfCost)}</span>
                      </>
                    )}
                    <span className="ml-1 rounded-md bg-success/15 px-1.5 py-0.5 text-[10px] uppercase font-bold text-success">
                      {c.paymentStatus}
                    </span>
                  </div>
                </div>

                {c.rejectionReason && (
                  <p className="rounded-xl bg-danger/10 p-2.5 text-xs text-danger border border-danger/20">
                    <strong>Rejection Reason:</strong> {c.rejectionReason}
                  </p>
                )}

                {/* Metrics & Preview Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-3 text-xs">
                  <div className="flex gap-4 text-muted-foreground">
                    <span>
                      Impressions:{" "}
                      <strong className="text-foreground">
                        {formatCount(c.analytics?.impressions ?? 0)}
                      </strong>
                    </span>
                    <span>
                      Clicks:{" "}
                      <strong className="text-foreground">
                        {formatCount(c.analytics?.clicks ?? 0)}
                      </strong>
                    </span>
                    <span>
                      CTR: <strong className="text-foreground">{c.analytics?.ctr ?? 0}%</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Preview Ad Button */}
                    <Button size="sm" variant="outline" onClick={() => setPreviewAd(c)}>
                      <Eye className="mr-1 size-3.5" /> Preview Ad
                    </Button>

                    {/* Pending Review Actions */}
                    {c.status === "pending_review" && (
                      <>
                        <Button
                          size="sm"
                          className="bg-emerald-600 text-white hover:bg-emerald-500"
                          disabled={approveAd.isPending}
                          onClick={() => handleApprove(c._id)}
                        >
                          <Check className="mr-1 size-3.5" /> Approve
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => setRejectingAd(c)}>
                          <X className="mr-1 size-3.5" /> Reject
                        </Button>
                      </>
                    )}

                    {/* Pause / Resume for Active/Paused */}
                    {c.status === "active" && (
                      <Button size="sm" variant="outline" onClick={() => pauseAd.mutate(c._id)}>
                        <Pause className="mr-1 size-3.5" /> Pause
                      </Button>
                    )}
                    {c.status === "paused" && (
                      <Button size="sm" variant="outline" onClick={() => resumeAd.mutate(c._id)}>
                        <Play className="mr-1 size-3.5" /> Resume
                      </Button>
                    )}

                    {/* Refund Button for paid campaigns */}
                    {c.paymentStatus === "paid" && c.status !== "refunded" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-amber-500 hover:bg-amber-500/10"
                        onClick={() => handleRefund(c._id)}
                      >
                        <RotateCcw className="mr-1 size-3.5" /> Refund
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {!isLoading && !campaigns.length && (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No campaigns match this filter.
          </p>
        )}
      </div>

      {/* Preview Dialog */}
      {previewAd && (
        <Dialog open={Boolean(previewAd)} onOpenChange={(v) => !v && setPreviewAd(null)}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Ad Preview — {previewAd.title}</DialogTitle>
            </DialogHeader>
            <div className="pt-2">
              <AdPreview
                adType={previewAd.adType}
                placement={previewAd.placement}
                title={previewAd.title}
                caption={previewAd.caption}
                ctaText={previewAd.ctaText}
                ctaUrl={previewAd.ctaUrl}
                mediaUrl={previewAd.mediaUrl}
                thumbnailUrl={previewAd.thumbnailUrl}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Rejection Dialog */}
      {rejectingAd && (
        <Dialog open={Boolean(rejectingAd)} onOpenChange={(v) => !v && setRejectingAd(null)}>
          <DialogContent className="sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle className="text-danger flex items-center gap-2">
                <AlertTriangle className="size-5" /> Reject Advertisement
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <p className="text-xs text-muted-foreground">
                Enter a clear explanation for rejecting <strong>"{rejectingAd.title}"</strong>. The
                advertiser will see this message.
              </p>

              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                placeholder="Reason for rejection (e.g. Violates advertising guidelines, misleading link...)"
                className="w-full rounded-xl border border-border bg-card p-3 text-xs text-foreground outline-none focus:border-danger"
              />

              <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRefundOnReject}
                  onChange={(e) => setAutoRefundOnReject(e.target.checked)}
                  className="rounded border-border"
                />
                Automatically refund payment (
                {rejectingAd.paymentMethod === "gihanga_points"
                  ? `${formatCount(rejectingAd.totalGpCost)} GP`
                  : rwf(rejectingAd.totalRwfCost)}
                )
              </label>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setRejectingAd(null)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  disabled={rejectAd.isPending}
                  onClick={handleRejectSubmit}
                >
                  Confirm Rejection
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
