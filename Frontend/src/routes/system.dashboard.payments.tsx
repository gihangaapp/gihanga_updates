import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowDownLeft, ArrowUpRight, Check, Smartphone, Wallet, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/format";
import { useStaffPayments, useApprovePayment, useRejectPayment } from "@/hooks/use-staff-finance";
import {
  AdminPageHeader,
  AdminCard,
  AdminBadge,
  AdminSegmented,
  AdminEmptyState,
  AdminSkeletonRows,
} from "@/components/system/AdminUI";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/system/dashboard/payments")({
  component: PaymentsPage,
});

function rwf(n: number) {
  return `${Math.abs(n).toLocaleString()} RWF`;
}

type PayTab = "pending" | "completed" | "failed" | "cancelled";

function PaymentsPage() {
  const [tab, setTab] = useState<PayTab>("pending");
  const { data, isLoading } = useStaffPayments(tab);
  const approve = useApprovePayment();
  const rejectPayment = useRejectPayment();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const list = data?.transactions ?? [];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={Wallet}
        title="Payments Queue"
        description="Review and settle MTN Mobile Money deposits and withdrawals."
        accent="success"
      />

      <AdminSegmented
        options={[
          { id: "pending", label: "Pending" },
          { id: "completed", label: "Completed" },
          { id: "failed", label: "Failed" },
          { id: "cancelled", label: "Cancelled" },
        ]}
        value={tab}
        onChange={setTab}
      />

      {isLoading && <AdminSkeletonRows rows={4} />}

      <div className="space-y-3.5">
        {list.map((tx, i) => (
          <motion.div
            key={tx._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.4) }}
          >
            <AdminCard className="p-4 transition-shadow hover:shadow-float/50 sm:p-5">
              <div className="flex items-start gap-3.5">
                <span
                  className={cn(
                    "grid size-11 shrink-0 place-items-center rounded-xl",
                    tx.kind === "deposit"
                      ? "bg-success/10 text-success"
                      : "bg-danger/10 text-danger",
                  )}
                >
                  {tx.kind === "deposit" ? (
                    <ArrowDownLeft className="size-4.5" />
                  ) : (
                    <ArrowUpRight className="size-4.5" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-foreground">
                    {tx.user?.name}{" "}
                    <span className="font-medium text-muted-foreground">@{tx.user?.username}</span>
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Smartphone className="size-3" /> {tx.user?.mtnMomoNumber || tx.label}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {timeAgo(tx.createdAt)} ago
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={cn(
                      "font-display text-lg font-extrabold tabular-nums",
                      tx.kind === "deposit" ? "text-success" : "text-danger",
                    )}
                  >
                    {tx.kind === "deposit" ? "+" : "−"}
                    {rwf(tx.amount)}
                  </p>
                  <AdminBadge
                    tone={
                      tx.status === "completed"
                        ? "success"
                        : tx.status === "failed"
                          ? "danger"
                          : tx.status === "cancelled"
                            ? "muted"
                            : "warning"
                    }
                    dot
                    className="mt-1"
                  >
                    {tx.status ?? tab}
                  </AdminBadge>
                </div>
              </div>

              {tab === "pending" && (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3.5">
                  <Button
                    size="sm"
                    className="flex-1 bg-success text-success-foreground hover:bg-success/90"
                    onClick={() =>
                      approve.mutate(tx._id, {
                        onSuccess: () => toast.success("Payment approved"),
                        onError: (err: any) => toast.error(err.message || "Failed to approve"),
                      })
                    }
                    disabled={approve.isPending}
                  >
                    <Check className="size-3.5" /> Approve settlement
                  </Button>
                  {rejectingId === tx._id ? (
                    <>
                      <input
                        autoFocus
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Reason…"
                        className="h-8 flex-1 rounded-lg border border-border bg-elevated px-2.5 text-xs text-foreground outline-none focus:border-danger/60"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={!reason.trim()}
                        onClick={() =>
                          rejectPayment.mutate(
                            { id: tx._id, reason },
                            {
                              onSuccess: () => {
                                toast.error("Payment rejected");
                                setRejectingId(null);
                                setReason("");
                              },
                            },
                          )
                        }
                      >
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-muted-foreground"
                        onClick={() => setRejectingId(null)}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-border text-foreground/80 hover:bg-danger/10 hover:text-danger"
                      onClick={() => setRejectingId(tx._id)}
                    >
                      <X className="size-3.5" /> Reject
                    </Button>
                  )}
                </div>
              )}
            </AdminCard>
          </motion.div>
        ))}

        {!isLoading && !list.length && (
          <AdminEmptyState
            icon={Wallet}
            title={`No ${tab} payments`}
            description="Mobile money transactions will appear here as users deposit or withdraw."
          />
        )}
      </div>
    </div>
  );
}
