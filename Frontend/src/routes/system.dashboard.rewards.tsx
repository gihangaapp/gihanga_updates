import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Coins, Save, Sparkles, TrendingUp, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRewardConfig, useSaveRewardConfig, type RewardRates } from "@/hooks/use-staff-finance";
import {
  AdminPageHeader,
  AdminCard,
  AdminCardHeader,
} from "@/components/system/AdminUI";

export const Route = createFileRoute("/system/dashboard/rewards")({
  component: RewardsConfigPage,
});

const RATE_LABELS: { key: keyof RewardRates; label: string; hint: string }[] = [
  { key: "upload", label: "Points per Post Upload", hint: "Awarded each time a creator publishes" },
  { key: "like", label: "Points per Like Received", hint: "Engagement reward on creator content" },
  { key: "follow", label: "Points per New Follower", hint: "Growth reward for audience building" },
  { key: "view_per_100", label: "Points per 100 Views", hint: "Scaled viewership reward" },
  { key: "share", label: "Points per Share", hint: "Reward for organic amplification" },
  { key: "daily_login", label: "Points per Daily Login", hint: "Retention incentive for all users" },
  { key: "referral", label: "Points per Referral Sign-up", hint: "Reward for growing the community" },
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
    return (
      <div className="space-y-6">
        <AdminPageHeader
          icon={Coins}
          title="Reward Engine"
          description="Set point accrual rates for creator actions and the point-to-cash conversion ratio."
          accent="warning"
        />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted/50" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={Coins}
        title="Kingdom Points Reward Engine"
        description="Set point accrual rates for creator actions and the point-to-cash conversion ratio."
        accent="warning"
        action={
          <Button
            size="lg"
            variant="brand"
            onClick={save}
            disabled={saveConfig.isPending}
          >
            <Save className="mr-2 size-4" />
            {saveConfig.isPending ? "Saving…" : "Save configuration"}
          </Button>
        }
      />

      <AdminCard className="p-5">
        <AdminCardHeader
          title={
            <span className="flex items-center gap-2">
              <TrendingUp className="size-4 text-success" /> Cash conversion ratio
            </span>
          }
          subtitle="How Kingdom Points translate into withdrawable RWF"
        />
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-4">
          <Input
            type="number"
            value={pointsToCashRate}
            onChange={(e) => setPointsToCashRate(Number(e.target.value) || 1)}
            className="h-11 w-32 border-border bg-card text-right text-foreground tabular-nums"
          />
          <span className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
            Kingdom Points = <span className="font-display text-base font-extrabold text-primary">1 RWF</span>
          </span>
          <span className="ml-auto rounded-lg bg-success/10 px-3 py-1.5 text-xs font-bold text-success tabular-nums">
            10,000 pts → {(10000 / pointsToCashRate).toLocaleString()} RWF
          </span>
        </div>
      </AdminCard>

      <AdminCard className="p-5">
        <AdminCardHeader
          title={
            <span className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" /> Action accrual rates
            </span>
          }
          subtitle="Points earned per action across the platform"
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {RATE_LABELS.map((r, i) => (
            <motion.div
              key={r.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 p-4"
            >
              <div className="min-w-0">
                <span className="block text-[13px] font-bold text-foreground">{r.label}</span>
                <span className="mt-0.5 block text-[11px] text-muted-foreground">{r.hint}</span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Input
                  type="number"
                  value={rates[r.key]}
                  onChange={(e) => setRates({ ...rates, [r.key]: Number(e.target.value) || 0 })}
                  className="h-10 w-24 border-border bg-card text-right text-foreground tabular-nums"
                />
                <span className="text-xs font-bold text-primary">pts</span>
              </div>
            </motion.div>
          ))}
        </div>
      </AdminCard>
    </div>
  );
}
