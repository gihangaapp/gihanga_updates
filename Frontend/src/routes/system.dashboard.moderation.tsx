import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
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
import {
  AdminPageHeader,
  AdminCard,
  AdminCardHeader,
  AdminBadge,
  AdminSegmented,
  AdminEmptyState,
  AdminSkeletonRows,
  AdminToggle,
} from "@/components/system/AdminUI";
import { cn } from "@/lib/utils";
import { mediaUrl } from "@/lib/api-client";

export const Route = createFileRoute("/system/dashboard/moderation")({
  component: ModerationPage,
});

const pageTabs = ["reports", "ai-review", "appeals", "health"] as const;
type PageTab = (typeof pageTabs)[number];

const PAGE_TAB_META: Record<PageTab, { label: string; hint: string }> = {
  reports: {
    label: "User reports",
    hint: "Reports filed by users against content or accounts.",
  },
  "ai-review": {
    label: "AI review",
    hint: "Content flagged by automated safety checks and awaiting a human decision.",
  },
  appeals: {
    label: "Appeals",
    hint: "Users asking for a second look at rejected content.",
  },
  health: {
    label: "System health",
    hint: "Moderation providers and processing pipeline status.",
  },
};

/* ── Report row ───────────────────────────────────────────────────────────── */

function ActionRow({ report, index }: { report: StaffReport; index: number }) {
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
          toast.success(
            `Report ${action === "dismiss" ? "dismissed" : `actioned: ${action}`}`,
          );
          setReasonFor(null);
          setReason("");
        },
        onError: (err: any) => toast.error(err.message || "Action failed"),
      },
    );
  }

  const media = mediaUrl(report.targetPost?.thumbnailUrl || report.targetPost?.mediaUrl);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.4) }}
    >
      <AdminCard className="p-4 transition-shadow hover:shadow-float/50 sm:p-5">
        <div className="flex flex-wrap items-start gap-3.5">
          {media && (
            <img
              src={media}
              alt=""
              className="size-16 shrink-0 rounded-xl border border-border object-cover sm:size-20"
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <AdminBadge
                tone={
                  report.severity === "high"
                    ? "danger"
                    : report.severity === "medium"
                      ? "warning"
                      : "muted"
                }
              >
                {report.severity}
              </AdminBadge>
              <span className="text-sm font-bold text-foreground">{report.reason}</span>
              {report.reportsCount > 1 && (
                <AdminBadge tone="info">×{report.reportsCount} reports</AdminBadge>
              )}
              {report.status !== "pending" && (
                <AdminBadge tone={report.status === "resolved" ? "success" : "muted"}>
                  {report.status}
                </AdminBadge>
              )}
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Reported by{" "}
              <span className="font-semibold text-foreground/80">@{report.reporter?.username}</span>{" "}
              against{" "}
              <span className="font-semibold text-foreground/80">@{report.target?.username}</span>
              {report.targetLive && <> · live: {report.targetLive.title}</>}
            </p>
            {report.excerpt && (
              <p className="mt-2 rounded-lg bg-muted/40 px-3 py-2 text-sm text-foreground/80">
                "{report.excerpt}"
              </p>
            )}
            {report.targetPost?.body && (
              <p className="mt-2 line-clamp-2 text-sm text-foreground/75">
                {report.targetPost.body}
              </p>
            )}
          </div>
        </div>

        {canAction && report.status === "pending" && (
          <div className="mt-4 border-t border-border pt-3.5">
            {reasonFor ? (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  autoFocus
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Reason (required)…"
                  className="h-9 min-w-[180px] flex-1 rounded-lg border border-border bg-elevated px-3 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
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
      </AdminCard>
    </motion.div>
  );
}

/* ── AI assessment row ────────────────────────────────────────────────────── */

function AssessmentRow({ record, index }: { record: ModerationAssessment; index: number }) {
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
          toast.success(
            `Assessment ${action === "approve" ? "approved" : action === "reject" ? "rejected" : "escalated"}`,
          );
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.4) }}
    >
      <AdminCard
        className={cn("p-4 sm:p-5", record.criticalEscalation && "border-danger/50 bg-danger/[0.03]")}
      >
        <div className="flex flex-wrap items-start gap-3.5">
          {media && (
            <img
              src={media}
              alt=""
              className="size-16 shrink-0 rounded-xl border border-border object-cover sm:size-20"
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {record.criticalEscalation && (
                <AdminBadge tone="danger">Critical protocol</AdminBadge>
              )}
              <AdminBadge
                tone={
                  record.severity === "critical" || record.severity === "high"
                    ? "danger"
                    : record.severity === "medium"
                      ? "warning"
                      : "muted"
                }
              >
                {record.severity}
              </AdminBadge>
              <span className="text-sm font-bold text-foreground capitalize">
                {record.contentType.replace("_", " ")}
              </span>
              <span className="text-xs text-muted-foreground">
                by @{record.author?.username ?? "unknown"}
              </span>
            </div>

            {record.categories.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {record.categories.map((c, i) => (
                  <AdminBadge key={i} tone="info">
                    {c.category.replace(/_/g, " ")} · {c.score.toFixed(2)}
                  </AdminBadge>
                ))}
              </div>
            )}

            {record.content?.post?.body && (
              <p className="mt-2 line-clamp-2 text-sm text-foreground/80">
                {record.content.post.body}
              </p>
            )}
            {record.content?.comment?.body && (
              <p className="mt-2 line-clamp-2 text-sm text-foreground/80">
                "{record.content.comment.body}"
              </p>
            )}
            {record.error && (
              <p className="mt-2 text-xs text-danger/80">Processing error: {record.error}</p>
            )}
          </div>
        </div>

        {canAction && record.status === "pending_review" && !record.reviewedAt && (
          <div className="mt-4 border-t border-border pt-3.5">
            {noteFor ? (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  autoFocus
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={noteFor === "approve" ? "Note (optional)…" : "Reason (required)…"}
                  className="h-9 min-w-[180px] flex-1 rounded-lg border border-border bg-elevated px-3 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
                />
                <Button
                  size="sm"
                  variant={noteFor === "approve" ? "default" : "destructive"}
                  disabled={noteFor !== "approve" && !note.trim()}
                  onClick={() => run(noteFor)}
                >
                  Confirm {noteFor}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground"
                  onClick={() => setNoteFor(null)}
                >
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
      </AdminCard>
    </motion.div>
  );
}

function AssessmentsPanel() {
  const [tab, setTab] = useState<"pending_review" | "failed" | "rejected" | "approved">(
    "pending_review",
  );
  const { data, isLoading } = useAssessmentsQueue(tab);
  const records = data?.records ?? [];

  return (
    <div className="space-y-4">
      <AdminSegmented
        options={[
          { id: "pending_review", label: "Pending review" },
          { id: "failed", label: "Failed" },
          { id: "rejected", label: "Rejected" },
          { id: "approved", label: "Approved" },
        ]}
        value={tab}
        onChange={setTab}
      />
      {isLoading && <AdminSkeletonRows rows={3} />}
      {!isLoading && !records.length && (
        <AdminEmptyState
          icon={Check}
          title="Nothing needs review right now"
          description="AI-flagged content that requires a human decision will appear here."
        />
      )}
      {records.map((r, i) => (
        <AssessmentRow key={r._id} record={r} index={i} />
      ))}
    </div>
  );
}

/* ── Appeals ──────────────────────────────────────────────────────────────── */

function AppealRow({ appeal, index }: { appeal: StaffAppeal; index: number }) {
  const { staffUser } = useAuth();
  const decision = useAppealDecision();
  const [note, setNote] = useState("");
  const canAction = hasPermission(staffUser, "moderation.appeals.action");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.4) }}
    >
      <AdminCard className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-primary-soft text-primary">
            <HeartHandshake className="size-4" />
          </span>
          <span className="text-sm font-bold text-foreground">
            @{appeal.user?.username ?? "unknown"}
          </span>
          <span className="text-xs text-muted-foreground">
            appeals a {appeal.record?.contentType?.replace("_", " ") ?? "content"} decision
          </span>
        </div>
        <p className="mt-3 rounded-xl bg-muted/40 p-3.5 text-sm leading-relaxed text-foreground/90">
          "{appeal.statement}"
        </p>
        {appeal.record?.userMessage && (
          <p className="mt-2 text-xs text-muted-foreground">
            Original outcome: {appeal.record.userMessage}
          </p>
        )}

        {canAction && appeal.status === "pending" && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3.5">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Decision note (required)…"
              className="h-9 min-w-[180px] flex-1 rounded-lg border border-border bg-elevated px-3 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
            />
            <Button
              size="sm"
              disabled={!note.trim() || decision.isPending}
              onClick={() =>
                decision.mutate(
                  { id: appeal._id, action: "approve", note: note.trim() },
                  {
                    onSuccess: () => {
                      toast.success("Appeal approved — content restored");
                      setNote("");
                    },
                  },
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
                  {
                    onSuccess: () => {
                      toast.success("Appeal rejected — decision stands");
                      setNote("");
                    },
                  },
                )
              }
            >
              Reject
            </Button>
          </div>
        )}
      </AdminCard>
    </motion.div>
  );
}

function AppealsPanel() {
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending");
  const { data, isLoading } = useAppeals(tab);
  const appeals = data?.appeals ?? [];

  return (
    <div className="space-y-4">
      <AdminSegmented
        options={[
          { id: "pending", label: "Pending" },
          { id: "approved", label: "Approved" },
          { id: "rejected", label: "Rejected" },
        ]}
        value={tab}
        onChange={setTab}
      />
      {isLoading && <AdminSkeletonRows rows={3} />}
      {!isLoading && !appeals.length && (
        <AdminEmptyState
          icon={Check}
          title="No appeals in this state"
          description="Users contesting moderation decisions will show up here."
        />
      )}
      {appeals.map((a, i) => (
        <AppealRow key={a._id} appeal={a} index={i} />
      ))}
    </div>
  );
}

/* ── Health ───────────────────────────────────────────────────────────────── */

function HealthPanel() {
  const { data, isLoading } = useModerationHealth();
  if (isLoading || !data) {
    return <AdminSkeletonRows rows={4} />;
  }

  const providers = (data["config"]?.providers ?? {}) as Record<string, any>;
  const queue = (data["queue"] ?? {}) as Record<string, any>;

  return (
    <div className="space-y-5">
      <AdminCard className="p-5">
        <AdminCardHeader
          title={
            <span className="flex items-center gap-2">
              <Activity className="size-4 text-primary" /> Providers
            </span>
          }
          subtitle="Automated safety classifiers backing the review queue"
        />
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {Object.entries(providers).map(([name, p]) => (
            <div
              key={name}
              className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-3.5"
            >
              <div>
                <p className="text-sm font-bold text-foreground capitalize">{name}</p>
                <p className="text-xs text-muted-foreground">
                  {p.configured ? "Credentials detected" : "Not configured"}
                </p>
              </div>
              <AdminBadge
                tone={
                  p.enabled && p.configured ? "success" : p.enabled ? "warning" : "muted"
                }
                dot
              >
                {p.enabled && p.configured ? "Active" : p.enabled ? "Needs config" : "Off"}
              </AdminBadge>
            </div>
          ))}
        </div>
        <p className="mt-3.5 rounded-xl bg-muted/40 px-3.5 py-2.5 text-xs text-muted-foreground">
          Fail-closed: <strong className="text-foreground">{String(data["config"]?.failClosed)}</strong>{" "}
          — failed checks can never approve content.
        </p>
      </AdminCard>

      <AdminCard className="p-5">
        <AdminCardHeader
          title={
            <span className="flex items-center gap-2">
              <Activity className="size-4 text-accent" /> Processing queue
            </span>
          }
          subtitle="Live pipeline state"
        />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Queued", queue["depth"]],
            ["Processing", queue["processing"]],
            ["Running", queue["running"]],
            ["Failed jobs", queue["failedJobs"]],
          ].map(([label, value]) => (
            <div
              key={String(label)}
              className="rounded-xl border border-border/60 bg-muted/30 p-4 text-center"
            >
              <p className="font-display text-2xl font-extrabold text-foreground tabular-nums">
                {String(value ?? 0)}
              </p>
              <p className="mt-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                {String(label)}
              </p>
            </div>
          ))}
        </div>
      </AdminCard>

      {(data["config"]?.warnings ?? []).length > 0 && (
        <div className="rounded-2xl border border-warning/30 bg-warning/5 p-4">
          <p className="mb-2 text-sm font-bold text-warning">Configuration warnings</p>
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

/* ── Rules ────────────────────────────────────────────────────────────────── */

function RulesPanel() {
  const { staffUser } = useAuth();
  const { data } = useModerationRules();
  const updateRule = useUpdateModerationRule();
  const canEdit = hasPermission(staffUser, "moderation.rules.edit");

  return (
    <AdminCard className="h-fit p-5">
      <AdminCardHeader
        title={
          <span className="flex items-center gap-2">
            <Sliders className="size-4 text-primary" /> Moderation rules
          </span>
        }
        subtitle={
          canEdit
            ? "Toggle auto-moderation classifiers and thresholds."
            : "View only — Admin or Super Admin can edit these."
        }
      />
      <div className="mt-4 space-y-2.5">
        {(data?.rules ?? []).map((rule) => (
          <div
            key={rule._id}
            className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 p-3.5"
          >
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-foreground">{rule.name}</p>
              {rule.description && (
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {rule.description}
                </p>
              )}
            </div>
            <AdminToggle
              checked={rule.enabled}
              disabled={!canEdit}
              onChange={() =>
                updateRule.mutate(
                  { key: rule.key, enabled: !rule.enabled },
                  {
                    onSuccess: () =>
                      toast.success(rule.enabled ? `${rule.name} disabled` : `${rule.name} enabled`),
                  },
                )
              }
            />
          </div>
        ))}
        {!data?.rules.length && (
          <p className="py-4 text-center text-sm text-muted-foreground">No rules configured yet.</p>
        )}
      </div>
    </AdminCard>
  );
}

/* ── Reports ──────────────────────────────────────────────────────────────── */

function ReportsSection() {
  const [tab, setTab] = useState<"pending" | "resolved" | "dismissed">("pending");
  const { data, isLoading } = useModerationQueue(tab);
  const reports = data?.reports ?? [];

  return (
    <div className="space-y-4">
      <AdminSegmented
        options={[
          { id: "pending", label: "Pending" },
          { id: "resolved", label: "Resolved" },
          { id: "dismissed", label: "Dismissed" },
        ]}
        value={tab}
        onChange={setTab}
      />
      {isLoading && <AdminSkeletonRows rows={3} />}
      {!isLoading && !reports.length && (
        <AdminEmptyState
          icon={Check}
          title="Nothing here — queue is clear"
          description="New community reports will land in this queue in real time."
        />
      )}
      {reports.map((r, i) => (
        <ActionRow key={r._id} report={r} index={i} />
      ))}
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */

function ModerationPage() {
  const { staffUser } = useAuth();
  const [pageTab, setPageTab] = useState<PageTab>("reports");
  const canSeeAssessments = hasPermission(staffUser, "moderation.assessments.view");

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={ShieldAlert}
        title="Moderation Queue"
        description={PAGE_TAB_META[pageTab].hint}
        accent="danger"
      />

      <AdminSegmented
        options={pageTabs.map((t) => ({ id: t, label: PAGE_TAB_META[t].label }))}
        value={pageTab}
        onChange={setPageTab}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_330px]">
        <div>
          {pageTab === "reports" && <ReportsSection />}
          {pageTab === "ai-review" &&
            (canSeeAssessments ? (
              <AssessmentsPanel />
            ) : (
              <AdminEmptyState
                icon={ShieldAlert}
                title="Permission required"
                description="You need the moderation.assessments.view permission to see the AI review queue."
              />
            ))}
          {pageTab === "appeals" && <AppealsPanel />}
          {pageTab === "health" && <HealthPanel />}
        </div>

        {pageTab === "reports" && <RulesPanel />}
      </div>
    </div>
  );
}
