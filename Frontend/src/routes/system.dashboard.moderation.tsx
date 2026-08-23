import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Ban, Check, MessageSquareWarning, ShieldAlert, Sliders, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { hasPermission } from "@/lib/permissions";
import { useModerationQueue, useActionReport, useModerationRules, useUpdateModerationRule, type StaffReport } from "@/hooks/use-staff-moderation";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/system/dashboard/moderation")({
  component: ModerationPage,
});

const statusTabs = ["pending", "resolved", "dismissed"] as const;

function ActionRow({ report }: { report: StaffReport }) {
  const { staffUser } = useAuth();
  const actionReport = useActionReport();
  const [reasonFor, setReasonFor] = useState<"remove" | "warn" | "suspend" | null>(null);
  const [reason, setReason] = useState("");
  const canAction = hasPermission(staffUser, "moderation.queue.action");

  function run(action: "remove" | "warn" | "suspend" | "dismiss") {
    actionReport.mutate(
      { id: report._id, action, reason: reason.trim() || undefined },
      {
        onSuccess: () => {
          toast.success(`Report ${action === "dismiss" ? "dismissed" : `actioned: ${action}`}`);
          setReasonFor(null);
          setReason("");
        },
        onError: (err: any) => toast.error(err.message || "Action failed"),
      },
    );
  }

  const media = report.targetPost?.thumbnailUrl || report.targetPost?.mediaUrl;

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start gap-3">
        {media && <img src={media} alt="" className="size-16 shrink-0 rounded-xl object-cover" />}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase",
                report.severity === "high" ? "bg-rose-500/15 text-danger" : report.severity === "medium" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground",
              )}
            >
              {report.severity}
            </span>
            <span className="text-sm font-bold text-foreground">{report.reason}</span>
            {report.reportsCount > 1 && (
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                ×{report.reportsCount}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Reported by <span className="font-semibold text-foreground/80">@{report.reporter?.username}</span> against{" "}
            <span className="font-semibold text-foreground/80">@{report.target?.username}</span>
            {report.targetLive && <> · live: {report.targetLive.title}</>}
          </p>
          {report.excerpt && <p className="mt-1.5 text-sm text-foreground/80">"{report.excerpt}"</p>}
          {report.targetPost?.body && <p className="mt-1.5 line-clamp-2 text-sm text-foreground/80">{report.targetPost.body}</p>}
        </div>
      </div>

      {canAction && report.status === "pending" && (
        <div className="mt-3 border-t border-border pt-3">
          {reasonFor ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason (required)…"
                className="h-9 flex-1 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-indigo-400/60"
              />
              <Button size="sm" variant="destructive" disabled={!reason.trim() || actionReport.isPending} onClick={() => run(reasonFor)}>
                Confirm {reasonFor}
              </Button>
              <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => setReasonFor(null)}>
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="border-border text-foreground/90 hover:bg-muted" onClick={() => setReasonFor("warn")}>
                <MessageSquareWarning className="size-3.5" /> Warn
              </Button>
              {report.targetPost && (
                <Button size="sm" variant="outline" className="border-border text-foreground/90 hover:bg-muted" onClick={() => setReasonFor("remove")}>
                  <Trash2 className="size-3.5" /> Remove content
                </Button>
              )}
              <Button size="sm" variant="destructive" onClick={() => setReasonFor("suspend")}>
                <Ban className="size-3.5" /> Suspend account
              </Button>
              <Button size="sm" variant="ghost" className="text-muted-foreground hover:bg-muted" onClick={() => run("dismiss")}>
                <X className="size-3.5" /> Dismiss
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RulesPanel() {
  const { staffUser } = useAuth();
  const { data } = useModerationRules();
  const updateRule = useUpdateModerationRule();
  const canEdit = hasPermission(staffUser, "moderation.rules.edit");

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="mb-1 flex items-center gap-2 font-display text-base font-bold text-foreground">
        <Sliders className="size-4" /> Moderation rules
      </h2>
      <p className="mb-4 text-xs text-muted-foreground">
        {canEdit ? "Toggle auto-moderation classifiers and thresholds." : "View only — Admin or Super Admin can edit these."}
      </p>
      <div className="space-y-2">
        {(data?.rules ?? []).map((rule) => (
          <div key={rule._id} className="flex items-center justify-between gap-3 rounded-xl bg-muted/40 p-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{rule.name}</p>
              {rule.description && <p className="text-xs text-muted-foreground">{rule.description}</p>}
            </div>
            <button
              type="button"
              disabled={!canEdit}
              onClick={() =>
                updateRule.mutate(
                  { key: rule.key, enabled: !rule.enabled },
                  { onSuccess: () => toast.success(rule.enabled ? `${rule.name} disabled` : `${rule.name} enabled`) },
                )
              }
              className={cn(
                "relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-40",
                rule.enabled ? "bg-indigo-500" : "bg-white/10",
              )}
            >
              <span className={cn("absolute top-0.5 size-5 rounded-full bg-white transition-transform", rule.enabled ? "translate-x-[22px]" : "translate-x-0.5")} />
            </button>
          </div>
        ))}
        {!data?.rules.length && <p className="text-sm text-muted-foreground">No rules configured yet.</p>}
      </div>
    </div>
  );
}

function ModerationPage() {
  const [tab, setTab] = useState<(typeof statusTabs)[number]>("pending");
  const { data, isLoading } = useModerationQueue(tab);
  const reports = data?.reports ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-foreground">
          <ShieldAlert className="size-6 text-danger" /> Moderation Queue
        </h1>
        <p className="text-sm text-muted-foreground">Review reports and act on content or accounts that break the rules.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          <div className="flex gap-1 rounded-xl border border-border bg-muted/40 p-1">
            {statusTabs.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  "flex-1 rounded-lg px-3 py-1.5 text-xs font-bold capitalize",
                  tab === t ? "bg-primary-soft text-primary" : "text-muted-foreground hover:text-foreground/90",
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {isLoading && <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>}
          {!isLoading && !reports.length && (
            <div className="rounded-2xl border border-border bg-muted/40 py-12 text-center">
              <Check className="mx-auto mb-2 size-6 text-success" />
              <p className="text-sm text-muted-foreground">Nothing here — queue is clear.</p>
            </div>
          )}
          {reports.map((r) => (
            <ActionRow key={r._id} report={r} />
          ))}
        </div>

        <RulesPanel />
      </div>
    </div>
  );
}
