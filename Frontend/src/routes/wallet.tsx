import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Coins,
  Gift,
  Smartphone,
  Wallet as WalletIcon,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCount, timeAgo } from "@/lib/format";
import {
  useWallet,
  useWalletTransactions,
  useDeposit,
  useWithdraw,
  useConvertPoints,
  type WalletTransaction,
} from "@/hooks/use-wallet";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "Wallet — Gihanga Updates" },
      {
        name: "description",
        content: "See your available balance, deposit or withdraw via MTN Mobile Money, and review every transaction.",
      },
      { property: "og:title", content: "Wallet — Gihanga Updates" },
      { property: "og:description", content: "Balances, MoMo deposits/withdrawals, and transaction history." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WalletPage,
});

function rwf(n: number) {
  return `${n.toLocaleString()} RWF`;
}

const KIND_META: Record<string, { icon: typeof WalletIcon; tone: string }> = {
  deposit: { icon: ArrowDownLeft, tone: "text-success bg-success/10" },
  payout: { icon: ArrowUpRight, tone: "text-danger bg-danger/10" },
  gift: { icon: Gift, tone: "text-amber-500 bg-amber-500/10" },
  bonus: { icon: Coins, tone: "text-primary bg-primary-soft" },
  earning: { icon: Coins, tone: "text-success bg-success/10" },
  fee: { icon: ArrowUpRight, tone: "text-muted-foreground bg-muted" },
};

function TransactionRow({ tx }: { tx: WalletTransaction }) {
  const meta = KIND_META[tx.kind] ?? KIND_META["fee"]!;
  return (
    <li className="flex items-center gap-3 border-b border-border py-3 last:border-0">
      <span className={cn("grid size-9 shrink-0 place-items-center rounded-full", meta.tone)}>
        <meta.icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{tx.label}</p>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {tx.status === "pending" && <Clock className="size-3" />}
          {tx.status === "pending" ? "Pending" : timeAgo(tx.createdAt)}
        </p>
      </div>
      <span className={cn("shrink-0 text-sm font-bold tabular-nums", tx.amount >= 0 ? "text-success" : "text-foreground")}>
        {tx.amount >= 0 ? "+" : ""}
        {formatCount(Math.abs(tx.amount))}
      </span>
    </li>
  );
}

function DepositWithdrawDialog({
  mode,
  open,
  onOpenChange,
}: {
  mode: "deposit" | "withdraw";
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const deposit = useDeposit();
  const withdraw = useWithdraw();
  const busy = mode === "deposit" ? deposit.isPending : withdraw.isPending;

  function submit() {
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (!phone.trim()) {
      toast.error("Enter your MTN Mobile Money number");
      return;
    }

    const mutation = mode === "deposit" ? deposit : withdraw;
    mutation.mutate(
      { amount: numericAmount, phoneNumber: phone.trim() },
      {
        onSuccess: (data) => {
          toast.success(mode === "deposit" ? "Deposit requested" : "Withdrawal requested", {
            description: data.message,
          });
          onOpenChange(false);
          setAmount("");
          setPhone("");
        },
        onError: (err: any) => toast.error(err.message || "Request failed"),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle>{mode === "deposit" ? "Deposit via MTN MoMo" : "Withdraw via MTN MoMo"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 px-1">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Amount (RWF)</label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="5,000" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">MTN Mobile Money number</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+250 78 000 0000" />
          </div>
          <Button variant="brand" size="lg" onClick={submit} disabled={busy}>
            <Smartphone className="size-4" />
            {busy ? "Sending…" : mode === "deposit" ? "Request deposit" : "Request withdrawal"}
          </Button>
          <p className="text-xs text-muted-foreground">
            {mode === "deposit"
              ? "You'll get a prompt on your phone to approve the payment."
              : "Funds are held until MTN confirms the transfer."}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ConvertPointsDialog({ open, onOpenChange, rate }: { open: boolean; onOpenChange: (v: boolean) => void; rate: number }) {
  const [points, setPoints] = useState("");
  const convert = useConvertPoints();
  const numericPoints = Number(points) || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[360px]">
        <DialogHeader>
          <DialogTitle>Convert Kingdom Points to cash</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 px-1">
          <Input type="number" value={points} onChange={(e) => setPoints(e.target.value)} placeholder="Points to convert" />
          <p className="text-sm text-muted-foreground">
            = <strong className="text-foreground">{rwf(numericPoints / rate)}</strong> at {rate} points per RWF
          </p>
          <Button
            variant="brand"
            disabled={!numericPoints || convert.isPending}
            onClick={() =>
              convert.mutate(numericPoints, {
                onSuccess: () => {
                  toast.success("Converted to your available balance");
                  onOpenChange(false);
                  setPoints("");
                },
                onError: (err: any) => toast.error(err.message || "Conversion failed"),
              })
            }
          >
            Convert
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function WalletPage() {
  const { data, isLoading } = useWallet();
  const { data: txData } = useWalletTransactions();
  const [dialogMode, setDialogMode] = useState<"deposit" | "withdraw" | null>(null);
  const [convertOpen, setConvertOpen] = useState(false);

  const wallet = data?.wallet;
  const transactions = txData?.transactions ?? [];

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[720px] space-y-4">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Wallet</h1>

        {isLoading ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Loading your wallet…</p>
        ) : (
          <>
            {wallet?.frozen && (
              <div className="rounded-2xl bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">
                Your wallet is frozen. Deposits and withdrawals are disabled — contact support.
              </div>
            )}

            <div className="surface-card gradient-brand p-6 text-primary-foreground">
              <p className="text-sm opacity-80">Available balance</p>
              <p className="font-display text-4xl font-extrabold">{rwf(wallet?.available ?? 0)}</p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm opacity-90">
                <span>Pending: {rwf(wallet?.pending ?? 0)}</span>
                <span>Lifetime: {rwf(wallet?.lifetime ?? 0)}</span>
              </div>
              <div className="mt-5 flex gap-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setDialogMode("deposit")}
                  disabled={wallet?.frozen}
                >
                  <ArrowDownLeft className="size-4" /> Deposit
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setDialogMode("withdraw")}
                  disabled={wallet?.frozen}
                >
                  <ArrowUpRight className="size-4" /> Withdraw
                </Button>
              </div>
            </div>

            <div className="surface-card flex items-center gap-4 p-5">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-amber-500/15 text-amber-500">
                <Coins className="size-6" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-xl font-extrabold">{formatCount(wallet?.kingdomPoints ?? 0)} pts</p>
                <p className="text-xs text-muted-foreground">Kingdom Points from gifts, likes, uploads and referrals</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setConvertOpen(true)}>
                Convert
              </Button>
            </div>

            {(!data?.momo.depositConfigured || !data?.momo.withdrawConfigured) && (
              <p className="rounded-2xl bg-muted px-4 py-3 text-xs text-muted-foreground">
                MTN MoMo isn't fully connected on this server yet, so deposits/withdrawals are held as pending
                transactions for admin review instead of an instant phone prompt.
              </p>
            )}

            <div className="surface-card p-5">
              <h2 className="mb-1 text-sm font-bold">Transaction history</h2>
              {transactions.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No transactions yet.</p>
              ) : (
                <ul>
                  {transactions.map((tx) => (
                    <TransactionRow key={tx._id} tx={tx} />
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>

      {dialogMode && (
        <DepositWithdrawDialog mode={dialogMode} open={Boolean(dialogMode)} onOpenChange={(v) => !v && setDialogMode(null)} />
      )}
      <ConvertPointsDialog open={convertOpen} onOpenChange={setConvertOpen} rate={data?.pointsToCashRate ?? 100} />
    </AppShell>
  );
}
