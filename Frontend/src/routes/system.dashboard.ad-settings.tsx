import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Settings,
  Coins,
  Wallet,
  Clock,
  Video,
  ShieldCheck,
  Save,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSuperadminAdSettings, useUpdateSuperadminAdSettings, AdConfig } from "@/hooks/use-ads";
import { formatCount } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/system/dashboard/ad-settings")({
  component: SuperadminAdSettingsPage,
});

function rwf(n: number) {
  return `${n.toLocaleString()} RWF`;
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="size-6 text-amber-500" /> Advertising Configuration & Pricing
          </h1>
          <p className="text-sm text-muted-foreground">
            Superadmin privileges required — configure pricing per advertising minute, Gihanga
            Points conversion rates, video duration caps, and platform limits.
          </p>
        </div>

        <Button variant="brand" size="lg" disabled={updateSettings.isPending} onClick={handleSave}>
          {updateSettings.isPending ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Save className="mr-2 size-4" />
          )}
          Save All Changes
        </Button>
      </div>

      {isLoading ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Loading advertising settings…
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* General Platform Controls */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" /> General Platform Controls
            </h2>

            <div className="flex items-center justify-between rounded-xl bg-muted/40 p-3.5">
              <div>
                <span className="text-sm font-semibold text-foreground block">
                  Enable Advertising Platform
                </span>
                <span className="text-xs text-muted-foreground">
                  Master toggle for creating and running ad campaigns platform-wide.
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleChange("enabled", !form.enabled)}
                className={cn(
                  "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                  form.enabled ? "bg-indigo-500" : "bg-white/10",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 size-5 rounded-full bg-white transition-transform",
                    form.enabled ? "translate-x-[22px]" : "translate-x-0.5",
                  )}
                />
              </button>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-muted/40 p-3.5">
              <div>
                <span className="text-sm font-semibold text-foreground block">
                  Enable Gihanga Points Payment Method
                </span>
                <span className="text-xs text-muted-foreground">
                  Allows users and creators to pay for ads using their Gihanga Points balance.
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleChange("pointsEnabled", !form.pointsEnabled)}
                className={cn(
                  "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                  form.pointsEnabled ? "bg-amber-500" : "bg-white/10",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 size-5 rounded-full bg-white transition-transform",
                    form.pointsEnabled ? "translate-x-[22px]" : "translate-x-0.5",
                  )}
                />
              </button>
            </div>
          </div>

          {/* Pricing Engine Config */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Coins className="size-4 text-amber-500" /> Advertising Pricing per Minute
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Coins className="size-3 text-amber-500" /> Points per Advertising Minute
                </label>
                <Input
                  type="number"
                  value={form.gpPerMinute ?? 2000}
                  onChange={(e) => handleChange("gpPerMinute", Number(e.target.value))}
                />
                <span className="mt-1 text-[11px] text-muted-foreground block">
                  Example: 1 minute = {formatCount(currentGpPerMin)} GP
                </span>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Wallet className="size-3 text-primary" /> RWF per Advertising Minute
                </label>
                <Input
                  type="number"
                  value={form.rwfPerMinute ?? 2000}
                  onChange={(e) => handleChange("rwfPerMinute", Number(e.target.value))}
                />
                <span className="mt-1 text-[11px] text-muted-foreground block">
                  Example: 1 minute = {rwf(currentRwfPerMin)}
                </span>
              </div>
            </div>

            {/* Live Package Preview Box */}
            <div className="rounded-xl border border-border/80 bg-elevated p-4 space-y-2">
              <span className="text-xs font-bold text-foreground block">
                Dynamic Package Calculation Preview
              </span>
              <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
                <div className="rounded-lg bg-card p-2">
                  <span className="text-muted-foreground block font-bold">10 Minutes</span>
                  <span className="text-amber-500 font-bold block">
                    {formatCount(10 * currentGpPerMin)} GP
                  </span>
                  <span className="text-primary font-bold block">{rwf(10 * currentRwfPerMin)}</span>
                </div>
                <div className="rounded-lg bg-card p-2">
                  <span className="text-muted-foreground block font-bold">30 Minutes</span>
                  <span className="text-amber-500 font-bold block">
                    {formatCount(30 * currentGpPerMin)} GP
                  </span>
                  <span className="text-primary font-bold block">{rwf(30 * currentRwfPerMin)}</span>
                </div>
                <div className="rounded-lg bg-card p-2">
                  <span className="text-muted-foreground block font-bold">60 Minutes</span>
                  <span className="text-amber-500 font-bold block">
                    {formatCount(60 * currentGpPerMin)} GP
                  </span>
                  <span className="text-primary font-bold block">{rwf(60 * currentRwfPerMin)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Limits & Video Caps */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Video className="size-4 text-primary" /> Video & Quota Limits
            </h2>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Maximum Video Ad Duration (Seconds)
              </label>
              <Input
                type="number"
                value={form.maxVideoDurationSeconds ?? 120}
                onChange={(e) => handleChange("maxVideoDurationSeconds", Number(e.target.value))}
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Videos longer than this limit will be rejected at upload.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  Min Quota Minutes
                </label>
                <Input
                  type="number"
                  value={form.minMinutes ?? 1}
                  onChange={(e) => handleChange("minMinutes", Number(e.target.value))}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  Max Quota Minutes
                </label>
                <Input
                  type="number"
                  value={form.maxMinutes ?? 180}
                  onChange={(e) => handleChange("maxMinutes", Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Campaign Calendar Duration Limits */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Clock className="size-4 text-primary" /> Campaign Calendar Days Limits
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  Minimum Campaign Days
                </label>
                <Input
                  type="number"
                  value={form.minCampaignDays ?? 1}
                  onChange={(e) => handleChange("minCampaignDays", Number(e.target.value))}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  Maximum Campaign Days
                </label>
                <Input
                  type="number"
                  value={form.maxCampaignDays ?? 30}
                  onChange={(e) => handleChange("maxCampaignDays", Number(e.target.value))}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Frequency Cap per User (per Hour)
              </label>
              <Input
                type="number"
                value={form.frequencyCapPerHour ?? 2}
                onChange={(e) => handleChange("frequencyCapPerHour", Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
