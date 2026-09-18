import { useState } from "react";
import { Wallet, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useWallet } from "@/hooks/use-wallet";
import { usePayAdWithMoney, Advertisement } from "@/hooks/use-ads";

interface MoneyCheckoutProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Advertisement;
  onSuccess: () => void;
}

export function MoneyCheckout({ open, onOpenChange, campaign, onSuccess }: MoneyCheckoutProps) {
  const { data: walletData, isLoading: walletLoading } = useWallet();
  const payWithMoney = usePayAdWithMoney();

  const walletAvailable = walletData?.wallet?.available ?? 0;
  const requiredRwf = campaign.totalRwfCost || 0;
  const remainingRwf = walletAvailable - requiredRwf;
  const hasEnough = remainingRwf >= 0;

  function rwf(n: number) {
    return `${n.toLocaleString()} RWF`;
  }

  function handlePay() {
    if (!hasEnough) {
      toast.error("Insufficient wallet balance");
      return;
    }

    const idempotencyKey = `rwf_pay_${campaign._id}_${Date.now()}`;
    payWithMoney.mutate(
      { id: campaign._id, idempotencyKey },
      {
        onSuccess: () => {
          toast.success("Payment successful! Your ad is now pending review.");
          onSuccess();
          onOpenChange(false);
        },
        onError: (err: any) => {
          toast.error(err.message || "Payment failed");
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="size-5 text-primary" />
            Pay with Real Money (Wallet Balance)
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
                <span>Total Cost:</span>
                <span className="text-primary">{rwf(requiredRwf)}</span>
              </div>
            </div>

            {/* Balance Breakdown */}
            <div className="rounded-2xl border border-border bg-elevated p-4 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Your Available Wallet Balance:</span>
                <span className="font-bold text-foreground">{rwf(walletAvailable)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Deduction:</span>
                <span className="font-bold text-danger">-{rwf(requiredRwf)}</span>
              </div>
              <div className="flex justify-between border-t border-border/60 pt-2 text-sm font-extrabold">
                <span>Balance After Payment:</span>
                <span className={hasEnough ? "text-success" : "text-danger"}>
                  {rwf(Math.max(0, remainingRwf))}
                </span>
              </div>
            </div>

            {!hasEnough && (
              <div className="flex items-start gap-2.5 rounded-2xl bg-danger/10 p-3.5 text-xs text-danger font-medium">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Insufficient Wallet Balance</p>
                  <p className="mt-0.5 opacity-90">
                    You need {rwf(Math.abs(remainingRwf))} more in your wallet. Deposit funds via
                    MTN Mobile Money or choose Gihanga Points.
                  </p>
                </div>
              </div>
            )}

            <div className="pt-2">
              <Button
                variant="brand"
                size="lg"
                className="w-full"
                disabled={!hasEnough || payWithMoney.isPending}
                onClick={handlePay}
              >
                {payWithMoney.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Processing Payment…
                  </>
                ) : (
                  <>
                    Confirm & Pay {rwf(requiredRwf)}
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
