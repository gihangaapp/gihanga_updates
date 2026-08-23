import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownLeft, ArrowUpRight, Check, Smartphone, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/format";
import { useStaffPayments, useApprovePayment, useRejectPayment } from "@/hooks/use-staff-finance";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/system/dashboard/payments")({
  component: PaymentsPage,
});

function rwf(n: number) {
  return `${Math.abs(n).toLocaleString()} RWF`;
}

function PaymentsPage() {
  const [tab, setTab] = useState<"pending" | "completed" | "failed" | "cancelled">("pending");
  const { data, isLoading } = useStaffPayments(tab);
  const approve = useApprovePayment();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const list = data?.transactions ?? [];
  const rejectPayment = useRejectPayment();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Payments Queue</h1>
        <p className="text-sm text-muted-foreground">Review and settle MTN Mobile Money deposits and withdrawals.</p>
      </div>

      <div className="flex gap-1 rounded-2xl border border-border bg-card p-1">
        {(["pending", "completed", "failed", "cancelled"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 rounded-xl px-3 py-2 text-xs font-bold capitalize",
              tab === t ? "bg-indigo-600 text-foreground" : "text-muted-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {isLoading && <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>}

      <div className="space-y-3">
        {list.map((tx) => (
          <div key={tx._id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-full",
                  tx.kind === "deposit" ? "bg-success/10 text-success" : "bg-rose-500/15 text-danger",
                )}
              >
                {tx.kind === "deposit" ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">
                  {tx.user?.name} <span className="text-muted-foreground">@{tx.user?.username}</span>
                </p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Smartphone className="size-3" /> {tx.user?.mtnMomoNumber || tx.label}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{timeAgo(tx.createdAt)} ago</p>
              </div>
              <p className={cn("font-display text-lg font-extrabold", tx.kind === "deposit" ? "text-success" : "text-danger")}>
                {rwf(tx.amount)}
              </p>
            </div>

            {tab === "pending" && (
              <div className="mt-3 flex gap-2 border-t border-border pt-3">
                <Button
                  size="sm"
                  className="flex-1 bg-emerald-600 text-foreground hover:bg-emerald-500"
                  onClick={() =>
                    approve.mutate(tx._id, { onSuccess: () => toast.success("Payment approved") })
                  }
                  disabled={approve.isPending}
                >
                  <Check className="size-3.5" /> Approve
                </Button>
                {rejectingId === tx._id ? (
                  <>
                    <input
                      autoFocus
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Reason…"
                      className="h-8 flex-1 rounded-lg border border-border bg-elevated px-2 text-xs text-foreground outline-none"
                    />
                    <Button
                      size="sm"
                      className="bg-danger text-foreground hover:bg-danger/90"
                      disabled={!reason.trim()}
                      onClick={() =>
                        rejectPayment.mutate(
                          { id: tx._id, reason },
                          { onSuccess: () => { toast.error("Payment rejected"); setRejectingId(null); setReason(""); } },
                        )
                      }
                    >
                      Confirm
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="outline" className="border-border text-foreground/80" onClick={() => setRejectingId(tx._id)}>
                    <X className="size-3.5" /> Reject
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}

        {!isLoading && !list.length && (
          <div className="rounded-3xl border border-border bg-muted/40 p-12 text-center text-muted-foreground">
            No {tab} payments.
          </div>
        )}
      </div>
    </div>
  );
}
