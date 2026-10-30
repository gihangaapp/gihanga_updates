import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Check,
  X,
  Pause,
  Play,
  Wallet,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  Eye,
  RotateCcw,
  AlertTriangle,
  Sparkles,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCount } from "@/lib/format";
import {
  useStaffAds,
  useStaffAdSummary,
  useApproveAd,
  useConfirmManualAdPayment,
  useRejectAd,
  usePauseAd,
  useResumeAd,
  useRefundAd,
  Advertisement,
} from "@/hooks/use-ads";
import { AdPreview } from "@/components/ads/AdPreview";
import {
  AdminPageHeader,
  AdminCard,
  AdminBadge,
  AdminSegmented,
  AdminStatCard,
  AdminEmptyState,
} from "@/components/system/AdminUI";
import { useAuth } from "@/lib/auth-context";
import { hasPermission } from "@/lib/permissions";

export const Route = createFileRoute("/system/dashboard/campaigns")({
  component: StaffCampaignsPage,
});

function rwf(n: number) {
  return `${n.toLocaleString()} RWF`;
}

const statusTone: Record<string, "warning" | "success" | "muted" | "danger" | "info"> = {
  pending_review: "warning",
  approved: "info",
  active: "success",
  paused: "info",
  rejected: "danger",
  expired: "muted",
};

type FilterTab = string | undefined;

function StaffCampaignsPage() {
  const [tab, setTab] = useState<FilterTab>(undefined);
  const { data: campaigns = [], isLoading } = useStaffAds({ status: tab });
  const { data: summary } = useStaffAdSummary();
  const { staffUser } = useAuth();
  const canApproveAds = hasPermission(staffUser, "ads.approve");
  const canVerifyManualPayment = hasPermission(staffUser, "ads.payment.verify");
  const canManageAds = hasPermission(staffUser, "ads.manage");

  const approveAd = useApproveAd();
  const confirmManualPayment = useConfirmManualAdPayment();
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
      onSuccess: () => toast.success("Creative approved. The advertiser can now arrange manual payment."),
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
      {
        id: rejectingAd._id,
        reason: rejectReason.trim(),
        autoRefund: canManageAds && rejectingAd.paymentMethod !== "manual" && rejectingAd.paymentStatus === "paid" && autoRefundOnReject,
      },
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

  function handleConfirmManualPayment(id: string) {
    if (!window.confirm("Confirm that the advertiser's offline payment has been received? This will activate the campaign and start its delivery period.")) return;
    const reference = window.prompt("Optional payment receipt / transaction reference (leave blank if not available):");
    if (reference === null) return;
    confirmManualPayment.mutate({ id, reference: reference.trim() || undefined }, {
      onSuccess: (res) => toast.success(res.message || "Payment verified and campaign activated"),
      onError: (err: any) => toast.error(err.message || "Failed to verify manual payment"),
    });
  }

  function handleRefund(id: string) {
    refundAd.mutate(id, {
      onSuccess: (res) => toast.success(res.message || "Refund processed"),
      onError: (err: any) => toast.error(err.message || "Refund failed"),
    });
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={Target}
        title="Advertising Campaigns"
        description="Review sponsored creatives, approve or reject campaigns, and let authorized administrators verify offline payments before delivery."
        accent="accent"
      />

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <AdminStatCard
          icon={Target}
          label="Total campaigns"
          value={formatCount(summary?.totalCampaigns ?? 0)}
          tone="primary"
          delay={0}
        />
        <AdminStatCard
          icon={AlertTriangle}
          label="Pending review"
          value={formatCount(summary?.pendingReview ?? 0)}
          tone="warning"
          delay={0.06}
        />
        <AdminStatCard
          icon={Clock}
          label="Awaiting manual payment"
          value={formatCount(summary?.awaitingManualPayment ?? 0)}
          tone="aqua"
          delay={0.12}
        />
        {canVerifyManualPayment ? (
          <AdminStatCard
            icon={Wallet}
            label="Verified manual payments"
            value={rwf(summary?.manualPaymentRevenue ?? 0)}
            tone="success"
            delay={0.18}
          />
        ) : (
          <AdminStatCard
            icon={Eye}
            label="Active campaigns"
            value={formatCount(summary?.activeCampaigns ?? 0)}
            tone="success"
            delay={0.18}
          />
        )}
      </div>

      {/* Filter tabs */}
      <AdminSegmented
        options={[
          { id: "", label: "All" },
          { id: "pending_review", label: "Pending review" },
          { id: "approved", label: "Awaiting payment" },
          { id: "active", label: "Active" },
          { id: "paused", label: "Paused" },
          { id: "rejected", label: "Rejected" },
          { id: "expired", label: "Expired" },
        ]}
        value={tab ?? ""}
        onChange={(id) => setTab(id || undefined)}
      />

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted/50" />
          ))}
        </div>
      )}

      {/* Campaign list */}
      <div className="space-y-4">
        {campaigns.map((c, i) => {
          const creator = typeof c.creator === "object" ? c.creator : null;
          return (
            <motion.div
              key={c._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.4) }}
            >
              <AdminCard className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                      <h3 className="truncate font-display text-base font-bold text-foreground">
                        {c.title}
                      </h3>
                      <AdminBadge tone={statusTone[c.status] ?? "muted"} dot>
                        {c.status.replace("_", " ")}
                      </AdminBadge>
                    </div>

                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      By <strong className="text-foreground">@{creator?.username || "user"}</strong>{" "}
                      ({creator?.email}) ·{" "}
                      <span className="font-semibold capitalize">{c.adType.replace("_", " ")}</span>{" "}
                      · <span className="font-semibold capitalize">{c.placement} placement</span> ·{" "}
                      {c.advertisingMinutes} min quota · {c.campaignDurationDays} days
                    </p>
                  </div>

                  {/* Manual payment quote and state */}
                  <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/40 px-3 py-2 text-xs font-bold">
                    <Wallet className="size-4 text-primary" />
                    <span className="text-foreground tabular-nums">{rwf(c.totalRwfCost)}</span>
                    <AdminBadge tone={c.manualPaymentStatus === "verified" ? "success" : c.status === "approved" ? "warning" : "muted"}>
                      {c.manualPaymentStatus === "verified" ? "Payment verified" : c.status === "approved" ? "Awaiting payment" : "Manual payment"}
                    </AdminBadge>
                  </div>
                </div>

                {c.rejectionReason && (
                  <p className="mt-3.5 rounded-xl border border-danger/20 bg-danger/5 p-3 text-xs leading-relaxed text-danger">
                    <strong>Rejection reason:</strong> {c.rejectionReason}
                  </p>
                )}
                {c.manualPaymentContact && (
                  <div className="mt-3 grid gap-2 rounded-xl border border-primary/15 bg-primary/5 p-3 text-xs sm:grid-cols-3">
                    <span className="flex min-w-0 items-center gap-2"><strong className="shrink-0">Contact:</strong> {c.manualPaymentContact.name}</span>
                    <span className="flex min-w-0 items-center gap-2"><Mail className="size-3.5 shrink-0" /> <a className="truncate underline" href={`mailto:${c.manualPaymentContact.email}`}>{c.manualPaymentContact.email}</a></span>
                    <span className="flex min-w-0 items-center gap-2"><Phone className="size-3.5 shrink-0" /> <a className="underline" href={`tel:${c.manualPaymentContact.phone}`}>{c.manualPaymentContact.phone}</a></span>
                  </div>
                )}

                {/* Metrics & actions */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4 text-xs">
                  <div className="flex flex-wrap gap-5 text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Eye className="size-3.5" />{" "}
                      <strong className="text-foreground tabular-nums">
                        {formatCount(c.analytics?.impressions ?? 0)}
                      </strong>{" "}
                      impressions
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="size-3.5" />{" "}
                      <strong className="text-foreground tabular-nums">
                        {formatCount(c.analytics?.clicks ?? 0)}
                      </strong>{" "}
                      clicks
                    </span>
                    <span>
                      CTR: <strong className="text-foreground tabular-nums">{c.analytics?.ctr ?? 0}%</strong>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => setPreviewAd(c)}>
                      <Eye className="size-3.5" /> Preview ad
                    </Button>

                    {canApproveAds && c.status === "pending_review" && (
                      <>
                        <Button
                          size="sm"
                          className="bg-success text-success-foreground hover:bg-success/90"
                          disabled={approveAd.isPending}
                          onClick={() => handleApprove(c._id)}
                        >
                          <Check className="size-3.5" /> Approve creative
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => setRejectingAd(c)}>
                          <X className="size-3.5" /> Reject
                        </Button>
                      </>
                    )}

                    {c.status === "approved" && c.paymentMethod === "manual" && canVerifyManualPayment && (
                      <Button
                        size="sm"
                        className="bg-success text-success-foreground hover:bg-success/90"
                        disabled={confirmManualPayment.isPending}
                        onClick={() => handleConfirmManualPayment(c._id)}
                      >
                        <CheckCircle2 className="size-3.5" /> Confirm payment & activate
                      </Button>
                    )}

                    {c.status === "active" && canManageAds && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          pauseAd.mutate(c._id, {
                            onSuccess: () => toast.success("Campaign paused"),
                          })
                        }
                      >
                        <Pause className="size-3.5" /> Pause
                      </Button>
                    )}
                    {c.status === "paused" && canManageAds && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          resumeAd.mutate(c._id, {
                            onSuccess: () => toast.success("Campaign resumed"),
                          })
                        }
                      >
                        <Play className="size-3.5" /> Resume
                      </Button>
                    )}

                    {canManageAds && c.paymentMethod !== "manual" && c.paymentStatus === "paid" && c.status !== "refunded" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-warning hover:bg-warning/10"
                        onClick={() => handleRefund(c._id)}
                      >
                        <RotateCcw className="size-3.5" /> Refund
                      </Button>
                    )}
                  </div>
                </div>
              </AdminCard>
            </motion.div>
          );
        })}

        {!isLoading && !campaigns.length && (
          <AdminEmptyState
            icon={Target}
            title="No campaigns match this filter"
            description="Submitted ad campaigns will show up here for review."
          />
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
                mediaKey={previewAd.mediaKey}
                thumbnailUrl={previewAd.thumbnailUrl}
                creatorName={typeof previewAd.creator === "object" ? previewAd.creator.name : undefined}
                creatorUsername={typeof previewAd.creator === "object" ? previewAd.creator.username : undefined}
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
              <DialogTitle className="flex items-center gap-2 text-danger">
                <AlertTriangle className="size-5" /> Reject Advertisement
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <p className="text-xs leading-relaxed text-muted-foreground">
                Enter a clear explanation for rejecting <strong>"{rejectingAd.title}"</strong>. The
                advertiser will see this message.
              </p>

              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                placeholder="Reason for rejection (e.g. Violates advertising guidelines, misleading link...)"
                className="w-full rounded-xl border border-border bg-card p-3 text-xs text-foreground outline-none focus:border-danger focus:ring-4 focus:ring-danger/10"
              />

              {canManageAds && rejectingAd.paymentMethod !== "manual" && rejectingAd.paymentStatus === "paid" && (
                <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-foreground">
                  <input
                    type="checkbox"
                    checked={autoRefundOnReject}
                    onChange={(e) => setAutoRefundOnReject(e.target.checked)}
                    className="size-4 rounded border-border accent-[oklch(0.42_0.083_244)]"
                  />
                  Automatically refund legacy payment
                </label>
              )}

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
                  Confirm rejection
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
