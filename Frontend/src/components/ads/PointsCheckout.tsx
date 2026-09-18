import { useState } from "react";
import { Coins, CheckCircle2, AlertTriangle, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useWallet } from "@/hooks/use-wallet";
import { usePayAdWithPoints, Advertisement } from "@/hooks/use-ads";
import { formatCount } from "@/lib/format";

interface PointsCheckoutProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Advertisement;
  onSuccess: () => void;
}

export function PointsCheckout({ open, onOpenChange, campaign, onSuccess }: PointsCheckoutProps) {
  const { data: walletData, isLoading: walletLoading } = useWallet();
  const payWithPoints = usePayAdWithPoints();

  const walletPoints = walletData?.wallet?.kingdomPoints ?? 0;
  const requiredPoints = campaign.totalGpCost || 0;
  const remainingPoints = walletPoints - requiredPoints;
  const hasEnough = remainingPoints >= 0;

  function handlePay() {
    if (!hasEnough) {
      toast.error("Insufficient Gihanga Points");
      return;
    }

    const idempotencyKey = `gp_pay_${campaign._id}_${Date.now()}`;
    payWithPoints.mutate(
      { id: campaign._id, idempotencyKey },
      {
        onSuccess: () => {
          toast.success("Payment successful! Your ad is now pending review.");
          onSuccess();
          onOpenChange(false);
        },
        onError: (err: any) => {
          toast.error(err.message || "Points payment failed");
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="size-5 text-amber-500" />
            Pay with Gihanga Points
          </DialogTitle>
        </DialogHeader>

        {walletLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {/* Campaign Summary */}
            <div className="rounded-2xl border border-border bg-card p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Campaign:</span>
                <span className="font-bold text-foreground">{campaign.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type & Placement:</span>
                <span className="capitalize text-foreground">
                  {campaign.adType.replace("_", " ")} · {campaign.placement}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Advertising Minutes:</span>
                <span className="font-bold text-foreground">{campaign.advertisingMinutes} min</span>
              </div>
              <div className="flex justify-between border-t border-border/60 pt-2 text-sm font-extrabold">
                <span>Required Points:</span>
                <span className="text-amber-500">{formatCount(requiredPoints)} GP</span>
              </div>
            </div>

            {/* Balance Breakdown */}
            <div className="rounded-2xl border border-border bg-elevated p-4 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Your Current Balance:</span>
                <span className="font-bold text-foreground">{formatCount(walletPoints)} GP</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Cost:</span>
                <span className="font-bold text-danger">-{formatCount(requiredPoints)} GP</span>
              </div>
              <div className="flex justify-between border-t border-border/60 pt-2 text-sm font-extrabold">
                <span>Balance After Payment:</span>
                <span className={hasEnough ? "text-success" : "text-danger"}>
                  {formatCount(Math.max(0, remainingPoints))} GP
                </span>
              </div>
            </div>

            {!hasEnough && (
              <div className="flex items-start gap-2.5 rounded-2xl bg-danger/10 p-3.5 text-xs text-danger font-medium">
                <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Insufficient Gihanga Points</p>
                  <p className="mt-0.5 opacity-90">
                    You need {formatCount(Math.abs(remainingPoints))} more GP to place this ad.
                    Upload content, complete daily tasks, or choose Real Money.
                  </p>
                </div>
              </div>
            )}

            <div className="pt-2">
              <Button
                variant="brand"
                size="lg"
                className="w-full"
                disabled={!hasEnough || payWithPoints.isPending}
                onClick={handlePay}
              >
                {payWithPoints.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Deducting Points…
                  </>
                ) : (
                  <>
                    Confirm & Pay {formatCount(requiredPoints)} GP
                    <ArrowRight className="ml-2 size-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
