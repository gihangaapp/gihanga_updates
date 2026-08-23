import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRewardConfig, useSaveRewardConfig, type RewardRates } from "@/hooks/use-staff-finance";

export const Route = createFileRoute("/system/dashboard/rewards")({
  component: RewardsConfigPage,
});

const RATE_LABELS: { key: keyof RewardRates; label: string }[] = [
  { key: "upload", label: "Points per Post Upload" },
  { key: "like", label: "Points per Like Received" },
  { key: "follow", label: "Points per New Follower" },
  { key: "view_per_100", label: "Points per 100 Views" },
  { key: "share", label: "Points per Share" },
  { key: "daily_login", label: "Points per Daily Login" },
  { key: "referral", label: "Points per Referral Sign-up" },
];

function RewardsConfigPage() {
  const { data, isLoading } = useRewardConfig();
  const saveConfig = useSaveRewardConfig();
  const [rates, setRates] = useState<RewardRates | null>(null);
  const [pointsToCashRate, setPointsToCashRate] = useState(100);

  useEffect(() => {
    if (data) {
      setRates(data.rates);
      setPointsToCashRate(data.pointsToCashRate);
    }
  }, [data]);

  function save() {
    if (!rates) return;
    saveConfig.mutate(
      { rates, pointsToCashRate },
      {
        onSuccess: () => toast.success("Kingdom Points reward rates updated platform-wide."),
        onError: (err: any) => toast.error(err.message || "Failed to save"),
      },
    );
  }

  if (isLoading || !rates) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Loading reward configuration…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">
            Kingdom Points Reward Engine Configuration
          </h1>
          <p className="text-sm text-muted-foreground">
            Set point accrual rates for creator actions and the point-to-cash conversion ratio.
          </p>
        </div>
        <Button size="sm" className="bg-indigo-600 font-semibold text-foreground hover:bg-indigo-500" onClick={save} disabled={saveConfig.isPending}>
          <Save className="mr-1.5 size-4" /> {saveConfig.isPending ? "Saving…" : "Save Configuration"}
        </Button>
      </div>

      <div className="space-y-4 rounded-3xl border border-border bg-card p-5">
        <h2 className="font-display text-base font-bold text-foreground">Cash Conversion Ratio</h2>
        <div className="flex items-center gap-3">
          <Input
            type="number"
            value={pointsToCashRate}
            onChange={(e) => setPointsToCashRate(Number(e.target.value) || 1)}
            className="h-10 w-32 border-border bg-elevated text-foreground"
          />
          <span className="text-sm text-foreground/80">Kingdom Points = 1 RWF</span>
        </div>
      </div>

      <div className="space-y-4 rounded-3xl border border-border bg-card p-5">
        <h2 className="font-display text-base font-bold text-foreground">Action Accrual Rates</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {RATE_LABELS.map((r) => (
            <div key={r.key} className="flex items-center justify-between rounded-2xl border border-border bg-elevated/60 p-3.5">
              <span className="text-xs font-semibold text-foreground/80">{r.label}</span>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={rates[r.key]}
                  onChange={(e) => setRates({ ...rates, [r.key]: Number(e.target.value) || 0 })}
                  className="h-9 w-24 border-border bg-card text-right text-foreground"
                />
                <span className="text-xs font-bold text-primary">pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
