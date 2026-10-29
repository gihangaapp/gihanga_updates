import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Award, RefreshCw, Save, Star, Gem, Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  AdminPageHeader,
  AdminCard,
  AdminCardHeader,
  AdminBadge,
} from "@/components/system/AdminUI";
import { api } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { hasPermission } from "@/lib/permissions";

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
      <div className="space-y-6">
        <AdminPageHeader
          icon={Award}
          title="Achievement Badges"
          description="Configure Gihanga Stars and Diamonds milestone thresholds."
          accent="accent"
        />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted/50" />
          ))}
        </div>
      </div>
    );
  }

  const starsCount = defs.filter((d) => d.category === "stars").length;
  const diamondsCount = defs.filter((d) => d.category === "diamonds").length;
  const enabledCount = defs.filter((d) => d.enabled).length;

  const renderSection = (
    category: "stars" | "diamonds",
    Icon: typeof Star,
    tone: string,
    title: string,
    subtitle: string,
  ) => (
    <AdminCard className="p-5">
      <AdminCardHeader
        title={
          <span className="flex items-center gap-2">
            <Icon className={`size-4 ${tone}`} />
            {title}
          </span>
        }
        subtitle={subtitle}
        action={
          <AdminBadge tone="muted">
            {defs.filter((d) => d.category === category).length} badges
          </AdminBadge>
        }
      />
      <div className="mt-4 space-y-2.5">
        {defs
          .filter((d) => d.category === category)
          .map((d, i) => (
            <DefinitionRow
              key={d.achievementId}
              def={d}
              index={i}
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
    </AdminCard>
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={Award}
        title="Achievement Badge System"
        description="Configure Gihanga Stars (followers) and Diamonds (views) milestone thresholds. Edits are versioned and audited."
        accent="accent"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={seedDefaults} disabled={!canEdit}>
              <Star className="mr-1.5 size-4" /> Restore defaults
            </Button>
            <Button
              variant="brand"
              size="sm"
              onClick={reconcile}
              disabled={!canEdit || reconciling}
            >
              <RefreshCw className={`mr-1.5 size-4 ${reconciling ? "animate-spin" : ""}`} />
              {reconciling ? "Reconciling…" : "Reconcile now"}
            </Button>
          </div>
        }
      />

      {/* Summary chips */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Star badges", value: starsCount, tone: "bg-warning/10 text-warning" },
          { label: "Diamond badges", value: diamondsCount, tone: "bg-info/10 text-info" },
          { label: "Enabled", value: enabledCount, tone: "bg-success/10 text-success" },
          { label: "Disabled", value: defs.length - enabledCount, tone: "bg-muted text-muted-foreground" },
        ].map((s) => (
          <div key={s.label} className={`flex items-center gap-2 rounded-xl px-4 py-2.5 ${s.tone}`}>
            <span className="font-display text-lg font-extrabold tabular-nums">{s.value}</span>
            <span className="text-xs font-bold">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {renderSection(
          "stars",
          Star,
          "text-warning",
          "Gihanga Stars — Follower Milestones",
          "Current milestones; revoked if the count drops",
        )}
        {renderSection(
          "diamonds",
          Gem,
          "text-info",
          "Gihanga Diamonds — View Milestones",
          "Lifetime cumulative; once earned, never revoked",
        )}
      </div>

      <AdminCard className="p-5">
        <AdminCardHeader
          title={
            <span className="flex items-center gap-2">
              <Info className="size-4 text-muted-foreground" /> How it works
            </span>
          }
          subtitle="Rules the badge engine follows"
        />
        <ul className="mt-3.5 space-y-2 text-xs leading-relaxed text-muted-foreground">
          <li className="flex gap-2">
            <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
            <span>
              <strong className="text-foreground">Follower badges</strong> are current milestones —
              if a user drops below a threshold, the badge is revoked (award record preserved for
              audit).
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
            <span>
              <strong className="text-foreground">View badges</strong> are lifetime cumulative —
              once earned, never revoked.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
            <span>
              Awards are computed authoritatively by the backend on follow/view events and by a
              15-minute sweeper. The frontend never decides earned state.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
            <span>
              Eligible followers exclude deleted/suspended accounts. Eligible views sum{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-primary">
                Post.viewsCount
              </code>{" "}
              across published, non-removed posts (no double-counting across models).
            </span>
          </li>
        </ul>
      </AdminCard>
    </div>
  );
}

function DefinitionRow({
  def,
  index,
  canEdit,
  saving,
  onChange,
  onSave,
}: {
  def: AdminDefinition;
  index: number;
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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3) }}
      className="flex flex-wrap items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-3.5 transition-colors hover:border-primary/25"
    >
      <span
        className="grid size-10 shrink-0 place-items-center rounded-xl shadow-sm"
        style={{ backgroundColor: colorMap[def.color] + "1f", color: colorMap[def.color] }}
      >
        {def.icon === "star" ? <Star className="size-4.5" /> : <Gem className="size-4.5" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-bold text-foreground">{def.name}</p>
        <p className="mt-0.5 text-[11px] tracking-wide text-muted-foreground uppercase">
          {def.metric} · v{def.version}
        </p>
      </div>
      <div className="flex items-center gap-2.5">
        <Input
          type="number"
          value={def.threshold}
          disabled={!canEdit}
          onChange={(e) =>
            onChange({ ...def, threshold: Math.max(1, Math.floor(Number(e.target.value) || 1)) })
          }
          className="h-9 w-28 border-border bg-card text-right text-foreground tabular-nums"
        />
        <Switch checked={def.enabled} disabled={!canEdit} onCheckedChange={(v) => onChange({ ...def, enabled: v })} />
        <Button
          size="sm"
          variant="outline"
          onClick={onSave}
          disabled={!canEdit || saving}
          className="h-9 px-2.5"
          title="Save this badge"
        >
          <Save className={`size-3.5 ${saving ? "animate-pulse" : ""}`} />
        </Button>
      </div>
    </motion.div>
  );
}
