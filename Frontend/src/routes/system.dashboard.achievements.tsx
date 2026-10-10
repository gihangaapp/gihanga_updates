import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Award, RefreshCw, Save, Star, Gem } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { StaffPageHeader, StaffCard } from "@/components/staff/StaffUI";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { hasPermission } from "@/lib/permissions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/system/dashboard/achievements")({
  component: AchievementsConfigPage,
});

interface AdminDefinition {
  _id: string;
  achievementId: string;
  name: string;
  category: "stars" | "diamonds";
  metric: "followers" | "views";
  description: string;
  threshold: number;
  icon: "star" | "diamond";
  color: "red" | "gold" | "blue" | "green";
  enabled: boolean;
  version: number;
}

function AchievementsConfigPage() {
  const { staffUser } = useAuth();
  const canEdit = hasPermission(staffUser, "achievements.edit");
  const canView = hasPermission(staffUser, "achievements.view");
  const [defs, setDefs] = useState<AdminDefinition[] | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [reconciling, setReconciling] = useState(false);

  async function load() {
    try {
      const data = await api.get<{ definitions: AdminDefinition[] }>(
        "/system/achievements/definitions",
        true,
      );
      setDefs(data.definitions);
    } catch (err: any) {
      toast.error(err.message || "Failed to load achievement definitions");
    }
  }

  useEffect(() => {
    if (canView) load();
  }, [canView]);

  async function saveOne(def: AdminDefinition) {
    setSaving(def.achievementId);
    try {
      await api.put(
        `/system/achievements/definitions/${def.achievementId}`,
        {
          threshold: def.threshold,
          enabled: def.enabled,
          name: def.name,
          description: def.description,
        },
        true,
      );
      toast.success(`${def.name} updated.`);
      await load();
    } catch (err: any) {
      toast.error(err.message || "Failed to update definition");
    } finally {
      setSaving(null);
    }
  }

  async function reconcile() {
    setReconciling(true);
    try {
      const summary = await api.post<{
        processed: number;
        awarded: number;
        revoked: number;
        errors: number;
      }>("/system/achievements/reconcile", {}, true);
      toast.success(
        `Reconciled ${summary.processed} users — ${summary.awarded} awarded, ${summary.revoked} revoked.`,
      );
    } catch (err: any) {
      toast.error(err.message || "Reconciliation failed");
    } finally {
      setReconciling(false);
    }
  }

  async function seedDefaults() {
    try {
      const res = await api.post<{ created: number; updated: number; total: number }>(
        "/system/achievements/seed",
        {},
        true,
      );
      toast.success(`Seeded: ${res.created} created, ${res.updated} updated.`);
      await load();
    } catch (err: any) {
      toast.error(err.message || "Seed failed");
    }
  }

  if (!canView) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        You don&apos;t have permission to view achievement definitions.
      </div>
    );
  }

  if (!defs) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Loading achievement definitions…
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <StaffPageHeader
        icon={Award}
        title="Achievement Badge System"
        description="Configure Gihanga Stars (followers) and Diamonds (views) milestone thresholds. Edits are versioned and audited."
        accent="accent"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={seedDefaults} disabled={!canEdit}>
              <Star className="mr-1.5 size-4" /> Restore Defaults
            </Button>
            <Button
              variant="brand"
              size="sm"
              onClick={reconcile}
              disabled={!canEdit || reconciling}
            >
              <RefreshCw className={cn("mr-1.5 size-4", reconciling && "animate-spin")} />
              {reconciling ? "Reconciling…" : "Reconcile Now"}
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Stars */}
        <StaffCard className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <Star className="size-5 text-warning" />
            <h2 className="font-display text-lg font-bold text-foreground">
              Gihanga Stars — Follower Milestones
            </h2>
          </div>
          <div className="space-y-3">
            {defs
              .filter((d) => d.category === "stars")
              .map((d) => (
                <DefinitionRow
                  key={d.achievementId}
                  def={d}
                  canEdit={canEdit}
                  saving={saving === d.achievementId}
                  onChange={(next) =>
                    setDefs(
                      (prev) =>
                        prev?.map((p) => (p.achievementId === d.achievementId ? next : p)) ?? null,
                    )
                  }
                  onSave={() => saveOne(d)}
                />
              ))}
          </div>
        </StaffCard>

        {/* Diamonds */}
        <StaffCard className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <Gem className="size-5 text-info" />
            <h2 className="font-display text-lg font-bold text-foreground">
              Gihanga Diamonds — View Milestones
            </h2>
          </div>
          <div className="space-y-3">
            {defs
              .filter((d) => d.category === "diamonds")
              .map((d) => (
                <DefinitionRow
                  key={d.achievementId}
                  def={d}
                  canEdit={canEdit}
                  saving={saving === d.achievementId}
                  onChange={(next) =>
                    setDefs(
                      (prev) =>
                        prev?.map((p) => (p.achievementId === d.achievementId ? next : p)) ?? null,
                    )
                  }
                  onSave={() => saveOne(d)}
                />
              ))}
          </div>
        </StaffCard>
      </div>

      <StaffCard className="p-5">
        <h2 className="mb-2 font-display text-base font-bold text-foreground">How it works</h2>
        <ul className="space-y-1.5 text-xs text-muted-foreground">
          <li>
            • <strong className="text-foreground">Follower badges</strong> are current milestones —
            if a user drops below a threshold, the badge is revoked (award record preserved for
            audit).
          </li>
          <li>
            • <strong className="text-foreground">View badges</strong> are lifetime cumulative —
            once earned, never revoked.
          </li>
          <li>
            • Awards are computed authoritatively by the backend on follow/view events and by a
            15-minute sweeper. The frontend never decides earned state.
          </li>
          <li>
            • Eligible followers exclude deleted/suspended accounts. Eligible views sum{" "}
            <code>Post.viewsCount</code> across published, non-removed posts (no double-counting
            across models).
          </li>
        </ul>
      </StaffCard>
    </div>
  );
}

function DefinitionRow({
  def,
  canEdit,
  saving,
  onChange,
  onSave,
}: {
  def: AdminDefinition;
  canEdit: boolean;
  saving: boolean;
  onChange: (next: AdminDefinition) => void;
  onSave: () => void;
}) {
  const colorMap: Record<string, string> = {
    red: "var(--color-danger)",
    gold: "var(--color-warning)",
    blue: "var(--color-info)",
    green: "var(--color-success)",
  };
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-elevated/60 p-3">
      <span
        className="grid size-9 shrink-0 place-items-center rounded-full"
        style={{ backgroundColor: colorMap[def.color] + "20", color: colorMap[def.color] }}
      >
        {def.icon === "star" ? <Star className="size-4" /> : <Gem className="size-4" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-foreground">{def.name}</p>
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {def.metric} · v{def.version} · {def.enabled ? "enabled" : "disabled"}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={def.threshold}
          disabled={!canEdit}
          onChange={(e) =>
            onChange({ ...def, threshold: Math.max(1, Math.floor(Number(e.target.value) || 1)) })
          }
          className="h-8 w-28 border-border bg-card text-right text-foreground"
        />
        <Switch
          checked={def.enabled}
          disabled={!canEdit}
          onCheckedChange={(v) => onChange({ ...def, enabled: v })}
        />
        <Button
          size="sm"
          variant="outline"
          onClick={onSave}
          disabled={!canEdit || saving}
          className="h-8 px-2"
        >
          <Save className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
