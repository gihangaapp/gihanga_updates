import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Coins,
  Wallet,
  Clock,
  Video,
  ShieldCheck,
  Save,
  Loader2,
  Sparkles,
  Calculator,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSuperadminAdSettings, useUpdateSuperadminAdSettings, AdConfig } from "@/hooks/use-ads";
import { formatCount } from "@/lib/format";
import {
  AdminPageHeader,
  AdminCard,
  AdminCardHeader,
  AdminToggle,
} from "@/components/system/AdminUI";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/system/dashboard/ad-settings")({
  component: SuperadminAdSettingsPage,
});

function rwf(n: number) {
  return `${n.toLocaleString()} RWF`;
}

function SettingRow({
  title,
  description,
  checked,
  onToggle,
  tone = "primary",
}: {
  title: string;
  description: string;
  checked: boolean | undefined;
  onToggle: () => void;
  tone?: "primary" | "warning";
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-4">
      <div className="min-w-0 pr-4">
        <span className="block text-sm font-bold text-foreground">{title}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
          {description}
        </span>
      </div>
      <AdminToggle checked={Boolean(checked)} onChange={onToggle} />
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  hint,
  icon: Icon,
  iconTone = "text-primary",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconTone?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold tracking-wide text-muted-foreground uppercase">
        {Icon && <Icon className={cn("size-3", iconTone)} />}
        {label}
      </label>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-11 border-border bg-elevated text-foreground focus-visible:ring-primary/20"
      />
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function SuperadminAdSettingsPage() {
  const { data: config, isLoading } = useSuperadminAdSettings();
  const updateSettings = useUpdateSuperadminAdSettings();

  const [form, setForm] = useState<Partial<AdConfig>>({});

  useEffect(() => {
    if (config) {
      setForm(config);
    }
  }, [config]);

  function handleChange(key: keyof AdConfig, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    updateSettings.mutate(form, {
      onSuccess: () => toast.success("Advertising configuration saved successfully!"),
      onError: (err: any) => toast.error(err.message || "Failed to update advertising settings"),
    });
  }

  const currentGpPerMin = Number(form.gpPerMinute) || 2000;
  const currentRwfPerMin = Number(form.rwfPerMinute) || 2000;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={Sparkles}
        title="Ad Settings & Rates"
        description="Superadmin privileges required — configure pricing per advertising minute, Gihanga Points conversion rates, video duration caps, and platform limits."
        accent="warning"
        action={
          <Button variant="brand" size="lg" disabled={updateSettings.isPending} onClick={handleSave}>
            {updateSettings.isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Save className="mr-2 size-4" />
            )}
            Save all changes
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl bg-muted/50" />
          ))}
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {/* General Platform Controls */}
          <AdminCard className="space-y-4 p-5">
            <AdminCardHeader
              title={
                <span className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-primary" /> General platform controls
                </span>
              }
              subtitle="Master switches for the advertising engine"
            />

            <SettingRow
              title="Enable advertising platform"
              description="Master toggle for creating and running ad campaigns platform-wide."
              checked={form.enabled}
              onToggle={() => handleChange("enabled", !form.enabled)}
            />

            <SettingRow
              title="Enable Gihanga Points payment method"
              description="Allows users and creators to pay for ads using their Gihanga Points balance."
              checked={form.pointsEnabled}
              onToggle={() => handleChange("pointsEnabled", !form.pointsEnabled)}
              tone="warning"
            />
          </AdminCard>

          {/* Pricing Engine Config */}
          <AdminCard className="space-y-4 p-5">
            <AdminCardHeader
              title={
                <span className="flex items-center gap-2">
                  <Coins className="size-4 text-warning" /> Advertising pricing per minute
                </span>
              }
              subtitle="What advertisers pay for each minute of exposure"
            />

            <div className="grid grid-cols-2 gap-3.5">
              <NumberField
                label="Points / ad minute"
                icon={Coins}
                iconTone="text-warning"
                value={form.gpPerMinute ?? 2000}
                onChange={(v) => handleChange("gpPerMinute", v)}
                hint={`1 minute = ${formatCount(currentGpPerMin)} GP`}
              />
              <NumberField
                label="RWF / ad minute"
                icon={Wallet}
                value={form.rwfPerMinute ?? 2000}
                onChange={(v) => handleChange("rwfPerMinute", v)}
                hint={`1 minute = ${rwf(currentRwfPerMin)}`}
              />
            </div>

            {/* Live Package Preview */}
            <div className="rounded-xl border border-primary/20 bg-primary-soft/30 p-4">
              <p className="flex items-center gap-1.5 text-xs font-bold text-primary">
                <Calculator className="size-3.5" /> Dynamic package calculation preview
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2.5 text-center text-xs">
                {[10, 30, 60].map((mins) => (
                  <motion.div
                    key={mins}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-border/60 bg-card p-3 shadow-sm"
                  >
                    <span className="block font-bold text-muted-foreground">{mins} minutes</span>
                    <span className="mt-1 block font-bold text-warning tabular-nums">
                      {formatCount(mins * currentGpPerMin)} GP
                    </span>
                    <span className="mt-0.5 block font-bold text-primary tabular-nums">
                      {rwf(mins * currentRwfPerMin)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </AdminCard>

          {/* Limits & Video Caps */}
          <AdminCard className="space-y-4 p-5">
            <AdminCardHeader
              title={
                <span className="flex items-center gap-2">
                  <Video className="size-4 text-accent" /> Video & quota limits
                </span>
              }
              subtitle="Upload guardrails for ad creatives"
            />

            <NumberField
              label="Max video ad duration (seconds)"
              icon={Video}
              iconTone="text-accent"
              value={form.maxVideoDurationSeconds ?? 120}
              onChange={(v) => handleChange("maxVideoDurationSeconds", v)}
              hint="Videos longer than this limit will be rejected at upload."
            />

            <div className="grid grid-cols-2 gap-3.5">
              <NumberField
                label="Min quota minutes"
                value={form.minMinutes ?? 1}
                onChange={(v) => handleChange("minMinutes", v)}
              />
              <NumberField
                label="Max quota minutes"
                value={form.maxMinutes ?? 180}
                onChange={(v) => handleChange("maxMinutes", v)}
              />
            </div>
          </AdminCard>

          {/* Campaign Calendar Limits */}
          <AdminCard className="space-y-4 p-5">
            <AdminCardHeader
              title={
                <span className="flex items-center gap-2">
                  <Clock className="size-4 text-info" /> Campaign calendar limits
                </span>
              }
              subtitle="How long campaigns can run and how often they're shown"
            />

            <div className="grid grid-cols-2 gap-3.5">
              <NumberField
                label="Min campaign days"
                value={form.minCampaignDays ?? 1}
                onChange={(v) => handleChange("minCampaignDays", v)}
              />
              <NumberField
                label="Max campaign days"
                value={form.maxCampaignDays ?? 30}
                onChange={(v) => handleChange("maxCampaignDays", v)}
              />
            </div>

            <NumberField
              label="Frequency cap per user (per hour)"
              icon={Clock}
              iconTone="text-info"
              value={form.frequencyCapPerHour ?? 2}
              onChange={(v) => handleChange("frequencyCapPerHour", v)}
              hint="Maximum times the same user sees one ad per hour."
            />
          </AdminCard>
        </div>
      )}
    </div>
  );
}
