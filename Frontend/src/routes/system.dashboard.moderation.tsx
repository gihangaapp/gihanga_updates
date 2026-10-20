import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  Ban,
  Check,
  HeartHandshake,
  MessageSquareWarning,
  ShieldAlert,
  Sliders,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { hasPermission } from "@/lib/permissions";
import {
  useModerationQueue,
  useActionReport,
  useModerationRules,
  useUpdateModerationRule,
  useAssessmentsQueue,
  useAssessmentDecision,
  useAppeals,
  useAppealDecision,
  useModerationHealth,
  type StaffReport,
  type ModerationAssessment,
  type StaffAppeal,
} from "@/hooks/use-staff-moderation";
import { cn } from "@/lib/utils";
import { mediaUrl } from "@/lib/api-client";

export const Route = createFileRoute("/system/dashboard/moderation")({
  component: ModerationPage,
});

const statusTabs = ["pending", "resolved", "dismissed"] as const;

const pageTabs = ["reports", "ai-review", "appeals", "health"] as const;
type PageTab = (typeof pageTabs)[number];

const PAGE_TAB_META: Record<PageTab, { label: string; hint: string }> = {
  reports: { label: "User reports", hint: "Reports filed by users against content or accounts." },
  "ai-review": { label: "AI review queue", hint: "Content flagged by automated safety checks and awaiting a human decision." },
  appeals: { label: "Appeals", hint: "Users asking for a second look at rejected content." },
  health: { label: "Provider health", hint: "Moderation providers, queue depth and processing statistics." },
};

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

  const media = mediaUrl(report.targetPost?.thumbnailUrl || report.targetPost?.mediaUrl);

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start gap-3">
        {media && <img src={media} alt="" className="size-16 shrink-0 rounded-xl object-cover" />}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase",
                report.severity === "high"
                  ? "bg-rose-500/15 text-danger"
                  : report.severity === "medium"
                    ? "bg-warning/10 text-warning"
                    : "bg-muted text-muted-foreground",
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
            Reported by{" "}
            <span className="font-semibold text-foreground/80">@{report.reporter?.username}</span>
            against{" "}
            <span className="font-semibold text-foreground/80">@{report.target?.username}</span>
            {report.targetLive && <> · live: {report.targetLive.title}</>}
          </p>
          {report.excerpt && (
            <p className="mt-1.5 text-sm text-foreground/80">"{report.excerpt}"</p>
          )}
          {report.targetPost?.body && (
            <p className="mt-1.5 line-clamp-2 text-sm text-foreground/80">
              {report.targetPost.body}
            </p>
          )}
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
              <Button
                size="sm"
                variant="destructive"
                disabled={!reason.trim() || actionReport.isPending}
                onClick={() => run(reasonFor)}
              >
                Confirm {reasonFor}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-muted-foreground"
                onClick={() => setReasonFor(null)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-border text-foreground/90 hover:bg-muted"
                onClick={() => setReasonFor("warn")}
              >
                <MessageSquareWarning className="size-3.5" /> Warn
              </Button>
              {report.targetPost && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-border text-foreground/90 hover:bg-muted"
                  onClick={() => setReasonFor("remove")}
                >
                  <Trash2 className="size-3.5" /> Remove content
                </Button>
              )}
              <Button size="sm" variant="destructive" onClick={() => setReasonFor("suspend")}>
                <Ban className="size-3.5" /> Suspend account
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-muted-foreground hover:bg-muted"
                onClick={() => run("dismiss")}
              >
                <X className="size-3.5" /> Dismiss
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── AI review queue ─────────────────────────────────────────────────────────

function AssessmentRow({ record }: { record: ModerationAssessment }) {
  const { staffUser } = useAuth();
  const decision = useAssessmentDecision();
  const [noteFor, setNoteFor] = useState<"approve" | "reject" | "escalate" | null>(null);
  const [note, setNote] = useState("");
  const canAction = hasPermission(staffUser, "moderation.assessments.action");

  function run(action: "approve" | "reject" | "escalate") {
    decision.mutate(
      { id: record._id, action, ...(note.trim() ? { note: note.trim() } : {}) },
      {
        onSuccess: () => {
          toast.success(`Assessment ${action === "approve" ? "approved" : action === "reject" ? "rejected" : "escalated"}`);
          setNoteFor(null);
          setNote("");
        },
        onError: (err: any) => toast.error(err.message || "Action failed"),
      },
    );
  }

  const media =
    record.content?.post
      ? mediaUrl(record.content.post.thumbnailUrl || record.content.post.mediaUrl)
      : record.content?.story
        ? mediaUrl(record.content.story.mediaUrl)
        : undefined;

  return (
    <div className={cn("rounded-2xl border bg-card p-4", record.criticalEscalation ? "border-danger/50" : "border-border")}>
      <div className="flex flex-wrap items-start gap-3">
        {media && <img src={media} alt="" className="size-16 shrink-0 rounded-xl object-cover" />}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {record.criticalEscalation && (
              <span className="rounded-md bg-danger/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-danger">
                Critical protocol
              </span>
            )}
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase",
                record.severity === "critical"
                  ? "bg-danger/15 text-danger"
                  : record.severity === "high"
                    ? "bg-rose-500/15 text-danger"
                    : record.severity === "medium"
                      ? "bg-warning/10 text-warning"
                      : "bg-muted text-muted-foreground",
              )}
            >
              {record.severity}
            </span>
            <span className="text-sm font-bold capitalize text-foreground">
              {record.contentType.replace("_", " ")}
            </span>
            <span className="text-xs text-muted-foreground">
              by @{record.author?.username ?? "unknown"}
            </span>
          </div>

          {record.categories.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {record.categories.map((c, i) => (
                <span
                  key={i}
                  className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground"
                >
                  {c.category.replace(/_/g, " ")} · {c.score.toFixed(2)}
                </span>
              ))}
            </div>
          )}

          {record.content?.post?.body && (
            <p className="mt-1.5 line-clamp-2 text-sm text-foreground/80">{record.content.post.body}</p>
          )}
          {record.content?.comment?.body && (
            <p className="mt-1.5 line-clamp-2 text-sm text-foreground/80">"{record.content.comment.body}"</p>
          )}
          {record.error && (
            <p className="mt-1 text-xs text-danger/80">Processing error: {record.error}</p>
          )}
        </div>
      </div>

      {canAction && record.status === "pending_review" && !record.reviewedAt && (
        <div className="mt-3 border-t border-border pt-3">
          {noteFor ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={noteFor === "approve" ? "Note (optional)…" : "Reason (required)…"}
                className="h-9 flex-1 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-indigo-400/60"
              />
              <Button
                size="sm"
                variant={noteFor === "approve" ? "default" : "destructive"}
                disabled={(noteFor !== "approve" && !note.trim()) || decision.isPending}
                onClick={() => run(noteFor)}
              >
                Confirm {noteFor}
              </Button>
              <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => setNoteFor(null)}>
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setNoteFor("approve")}>
                <Check className="size-3.5" /> Approve & publish
              </Button>
              <Button size="sm" variant="destructive" onClick={() => setNoteFor("reject")}>
                <Trash2 className="size-3.5" /> Reject
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-muted-foreground hover:bg-muted"
                onClick={() => setNoteFor("escalate")}
              >
                <AlertTriangle className="size-3.5" /> Escalate
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AssessmentsPanel() {
  const [tab, setTab] = useState<"pending_review" | "failed" | "rejected" | "approved">("pending_review");
  const { data, isLoading } = useAssessmentsQueue(tab);
  const records = data?.records ?? [];

  return (
    <div className="space-y-3">
      <div className="flex gap-1 rounded-xl border border-border bg-muted/40 p-1">
        {(["pending_review", "failed", "rejected", "approved"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 rounded-lg px-2 py-1.5 text-xs font-bold capitalize",
              tab === t ? "bg-primary-soft text-primary" : "text-muted-foreground hover:text-foreground/90",
            )}
          >
            {t.replace("_", " ")}
          </button>
        ))}
      </div>
      {isLoading && <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>}
      {!isLoading && !records.length && (
        <div className="rounded-2xl border border-border bg-muted/40 py-12 text-center">
          <Check className="mx-auto mb-2 size-6 text-success" />
          <p className="text-sm text-muted-foreground">Nothing needs review right now.</p>
        </div>
      )}
      {records.map((r) => (
        <AssessmentRow key={r._id} record={r} />
      ))}
    </div>
  );
}

// ─── Appeals ─────────────────────────────────────────────────────────────────

function AppealRow({ appeal }: { appeal: StaffAppeal }) {
  const { staffUser } = useAuth();
  const decision = useAppealDecision();
  const [note, setNote] = useState("");
  const canAction = hasPermission(staffUser, "moderation.appeals.action");

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <HeartHandshake className="size-4 text-primary" />
        <span className="text-sm font-bold text-foreground">@{appeal.user?.username ?? "unknown"}</span>
        <span className="text-xs text-muted-foreground">
          appeals a {appeal.record?.contentType?.replace("_", " ") ?? "content"} decision
        </span>
      </div>
      <p className="mt-2 rounded-xl bg-muted/40 p-3 text-sm text-foreground/90">"{appeal.statement}"</p>
      {appeal.record?.userMessage && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          Original outcome: {appeal.record.userMessage}
        </p>
      )}

      {canAction && appeal.status === "pending" && (
        <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Decision note (required)…"
            className="h-9 flex-1 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-indigo-400/60"
          />
          <Button
            size="sm"
            disabled={!note.trim() || decision.isPending}
            onClick={() =>
              decision.mutate(
                { id: appeal._id, action: "approve", note: note.trim() },
                { onSuccess: () => { toast.success("Appeal approved — content restored"); setNote(""); } },
              )
            }
          >
            Uphold appeal
          </Button>
          <Button
            size="sm"
            variant="destructive"
            disabled={!note.trim() || decision.isPending}
            onClick={() =>
              decision.mutate(
                { id: appeal._id, action: "reject", note: note.trim() },
                { onSuccess: () => { toast.success("Appeal rejected — decision stands"); setNote(""); } },
              )
            }
          >
            Reject
          </Button>
        </div>
      )}
    </div>
  );
}

function AppealsPanel() {
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending");
  const { data, isLoading } = useAppeals(tab);
  const appeals = data?.appeals ?? [];

  return (
    <div className="space-y-3">
      <div className="flex gap-1 rounded-xl border border-border bg-muted/40 p-1">
        {(["pending", "approved", "rejected"] as const).map((t) => (
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
      {!isLoading && !appeals.length && (
        <div className="rounded-2xl border border-border bg-muted/40 py-12 text-center">
          <Check className="mx-auto mb-2 size-6 text-success" />
          <p className="text-sm text-muted-foreground">No appeals in this state.</p>
        </div>
      )}
      {appeals.map((a) => (
        <AppealRow key={a._id} appeal={a} />
      ))}
    </div>
  );
}

// ─── Health ──────────────────────────────────────────────────────────────────

function HealthPanel() {
  const { data, isLoading } = useModerationHealth();
  if (isLoading || !data) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Loading health…</p>;
  }

  const providers = (data['config']?.providers ?? {}) as Record<string, any>;
  const queue = (data["queue"] ?? {}) as Record<string, any>;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-3 flex items-center gap-2 font-display text-base font-bold">
          <Activity className="size-4" /> Providers
        </h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {Object.entries(providers).map(([name, p]) => (
            <div key={name} className="flex items-center justify-between rounded-xl bg-muted/40 p-3">
              <div>
                <p className="text-sm font-semibold capitalize">{name}</p>
                <p className="text-xs text-muted-foreground">
                  {p.configured ? "credentials detected" : "not configured"}
                </p>
              </div>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                  p.enabled && p.configured
                    ? "bg-emerald-500/15 text-success"
                    : p.enabled
                      ? "bg-warning/10 text-warning"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {p.enabled && p.configured ? "active" : p.enabled ? "needs config" : "off"}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Fail-closed: {String(data['config']?.failClosed)} — failed checks can never approve content.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-3 flex items-center gap-2 font-display text-base font-bold">
          <Activity className="size-4" /> Processing queue
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            ["Queued", queue['depth']],
            ["Processing", queue['processing']],
            ["Running", queue['running']],
            ["Failed jobs", queue['failedJobs']],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-xl bg-muted/40 p-3 text-center">
              <p className="text-xl font-bold text-foreground">{String(value ?? 0)}</p>
              <p className="text-[10px] font-semibold uppercase text-muted-foreground">{String(label)}</p>
            </div>
          ))}
        </div>
      </div>

      {(data['config']?.warnings ?? []).length > 0 && (
        <div className="rounded-2xl border border-warning/30 bg-warning/5 p-4">
          <p className="mb-1 text-sm font-bold text-warning">Configuration warnings</p>
          <ul className="list-disc space-y-1 pl-4 text-xs text-warning/90">
            {(data["config"]["warnings"] as string[]).map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Rules (existing) ────────────────────────────────────────────────────────

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
        {canEdit
          ? "Toggle auto-moderation classifiers and thresholds."
          : "View only — Admin or Super Admin can edit these."}
      </p>
      <div className="space-y-2">
        {(data?.rules ?? []).map((rule) => (
          <div
            key={rule._id}
            className="flex items-center justify-between gap-3 rounded-xl bg-muted/40 p-3"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{rule.name}</p>
              {rule.description && (
                <p className="text-xs text-muted-foreground">{rule.description}</p>
              )}
            </div>
            <button
              type="button"
              disabled={!canEdit}
              onClick={() =>
                updateRule.mutate(
                  { key: rule.key, enabled: !rule.enabled },
                  {
                    onSuccess: () =>
                      toast.success(
                        rule.enabled ? `${rule.name} disabled` : `${rule.name} enabled`,
                      ),
                  },
                )
              }
              className={cn(
                "relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-40",
                rule.enabled ? "bg-indigo-500" : "bg-white/10",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 size-5 rounded-full bg-white transition-transform",
                  rule.enabled ? "translate-x-[22px]" : "translate-x-0.5",
                )}
              />
            </button>
          </div>
        ))}
        {!data?.rules.length && (
          <p className="text-sm text-muted-foreground">No rules configured yet.</p>
        )}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

function ReportsSection() {
  const [tab, setTab] = useState<(typeof statusTabs)[number]>("pending");
  const { data, isLoading } = useModerationQueue(tab);
  const reports = data?.reports ?? [];

  return (
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
  );
}

function ModerationPage() {
  const { staffUser } = useAuth();
  const [pageTab, setPageTab] = useState<PageTab>("reports");
  const canSeeAssessments = hasPermission(staffUser, "moderation.assessments.view");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-foreground">
          <ShieldAlert className="size-6 text-danger" /> Moderation
        </h1>
        <p className="text-sm text-muted-foreground">
          {PAGE_TAB_META[pageTab].hint}
        </p>
      </div>

      <div className="flex flex-wrap gap-1 rounded-xl border border-border bg-muted/40 p-1">
        {pageTabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setPageTab(t)}
            className={cn(
              "flex-1 rounded-lg px-3 py-1.5 text-xs font-bold",
              pageTab === t ? "bg-primary-soft text-primary" : "text-muted-foreground hover:text-foreground/90",
            )}
          >
            {PAGE_TAB_META[t].label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          {pageTab === "reports" && <ReportsSection />}
          {pageTab === "ai-review" && (canSeeAssessments ? <AssessmentsPanel /> : <p className="text-sm text-muted-foreground">You need the moderation.assessments.view permission.</p>)}
          {pageTab === "appeals" && <AppealsPanel />}
          {pageTab === "health" && <HealthPanel />}
        </div>

        {pageTab === "reports" && <RulesPanel />}
      </div>
    </div>
  );
}
