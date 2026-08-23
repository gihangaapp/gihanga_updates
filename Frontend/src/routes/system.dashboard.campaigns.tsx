import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatCount } from "@/lib/format";
import { useStaffCampaigns, useApproveCampaign, useRejectCampaign } from "@/hooks/use-ads";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/system/dashboard/campaigns")({
  component: CampaignsPage,
});

function rwf(n: number) {
  return `${n.toLocaleString()} RWF`;
}

function CampaignsPage() {
  const [tab, setTab] = useState<string | undefined>(undefined);
  const { data, isLoading } = useStaffCampaigns(tab);
  const approve = useApproveCampaign();
  const reject = useRejectCampaign();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const list = data?.campaigns ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Ad Campaigns Oversight</h1>
        <p className="text-sm text-muted-foreground">Review, approve, pause, or reject sponsored ad campaigns platform-wide.</p>
      </div>

      <div className="flex gap-1 rounded-2xl border border-border bg-card p-1">
        {[undefined, "review", "active", "paused", "rejected"].map((s) => (
          <button
            key={s ?? "all"}
            type="button"
            onClick={() => setTab(s)}
            className={cn(
              "flex-1 rounded-xl px-3 py-2 text-xs font-bold capitalize",
              tab === s ? "bg-indigo-600 text-foreground" : "text-muted-foreground",
            )}
          >
            {s ?? "All"}
          </button>
        ))}
      </div>

      {isLoading && <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>}

      <div className="overflow-hidden rounded-3xl border border-border bg-card">
        <ul className="divide-y divide-slate-800/60">
          {list.map((c) => (
            <li key={c._id} className="space-y-3 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-foreground">{c.name}</span>
                  <span className="text-xs text-muted-foreground">
                    by @{c.creator?.username} · {c.objective} · {formatCount(c.impressions)} impressions ·{" "}
                    {formatCount(c.clicks)} clicks
                  </span>
                </span>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold capitalize text-foreground/80">
                  {c.status}
                </span>
                <div className="flex gap-1.5">
                  {c.status === "review" && (
                    <>
                      <Button
                        size="sm"
                        className="bg-emerald-600 text-xs text-foreground hover:bg-emerald-500"
                        onClick={() => approve.mutate(c._id, { onSuccess: () => toast.success("Campaign approved") })}
                      >
                        <Check className="mr-1 size-3.5" /> Approve
                      </Button>
                      {rejectingId === c._id ? (
                        <>
                          <input
                            autoFocus
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Reason…"
                            className="h-8 w-32 rounded-lg border border-border bg-elevated px-2 text-xs text-foreground outline-none"
                          />
                          <Button
                            size="sm"
                            className="bg-danger text-xs text-foreground hover:bg-danger/90"
                            disabled={!reason.trim()}
                            onClick={() =>
                              reject.mutate(
                                { id: c._id, reason },
                                { onSuccess: () => { toast.error("Campaign rejected"); setRejectingId(null); setReason(""); } },
                              )
                            }
                          >
                            Confirm
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" variant="ghost" className="text-xs text-foreground/80 hover:bg-muted" onClick={() => setRejectingId(c._id)}>
                          <X className="mr-1 size-3.5" /> Reject
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground/90">Budget Spent:</span>
                <span>{rwf(c.spent)} / {rwf(c.totalBudget)}</span>
              </div>
            </li>
          ))}
        </ul>
        {!isLoading && !list.length && <p className="p-10 text-center text-sm text-muted-foreground">No campaigns.</p>}
      </div>
    </div>
  );
}
