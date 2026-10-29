import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { History, Search } from "lucide-react";
import { useAuditLog } from "@/hooks/use-staff-management";
import { timeAgo } from "@/lib/format";
import {
  AdminPageHeader,
  AdminCard,
  AdminBadge,
  AdminTableWrap,
  AdminTable,
  AdminTh,
  AdminTd,
  AdminEmptyState,
} from "@/components/system/AdminUI";

export const Route = createFileRoute("/system/dashboard/audit")({
  component: AuditLogPage,
});

function actionTone(action: string): "success" | "danger" | "warning" | "primary" | "muted" {
  if (/ban|reject|remove|demote|force/i.test(action)) return "danger";
  if (/approve|verify|promote|create|grant/i.test(action)) return "success";
  if (/suspend|pause|warn|escalate/i.test(action)) return "warning";
  if (/login|view/i.test(action)) return "muted";
  return "primary";
}

function AuditLogPage() {
  const [action, setAction] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const { data, isLoading } = useAuditLog({
    action: action || undefined,
    from: from || undefined,
    to: to || undefined,
  });

  const entries = data?.entries ?? [];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={History}
        title="Audit Log"
        description={
          data?.scope === "own"
            ? "Showing your own actions only."
            : "Showing every staff action across the platform."
        }
        accent="primary"
      />

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex h-10 min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-border bg-muted/50 px-3.5 transition-colors focus-within:border-ring focus-within:bg-card">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder="Filter by action (e.g. accounts.ban)…"
            className="h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="h-10 rounded-xl border border-border bg-muted/50 px-3 text-sm text-foreground outline-none focus:border-ring"
          />
          <span className="text-xs font-semibold text-muted-foreground">to</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="h-10 rounded-xl border border-border bg-muted/50 px-3 text-sm text-foreground outline-none focus:border-ring"
          />
        </div>
        <span className="rounded-xl bg-primary-soft px-3.5 py-2.5 text-xs font-bold text-primary tabular-nums">
          {isLoading ? "…" : `${entries.length} entries`}
        </span>
      </div>

      <AdminTableWrap>
        <AdminTable>
          <thead>
            <tr>
              <AdminTh className="min-w-[160px]">Actor</AdminTh>
              <AdminTh className="min-w-[140px]">Action</AdminTh>
              <AdminTh className="min-w-[160px]">Target</AdminTh>
              <AdminTh className="text-right">When</AdminTh>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4} className="p-10 text-center text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <span className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Loading audit trail…
                  </span>
                </td>
              </tr>
            )}
            {entries.map((e, i) => (
              <motion.tr
                key={e._id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.025, 0.3) }}
                className="align-top transition-colors hover:bg-muted/30"
              >
                <AdminTd>
                  <p className="font-semibold text-foreground/90">
                    {e.actor ? e.actor.name : "System"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {e.actor ? `@${e.actor.username}` : "—"}
                  </p>
                </AdminTd>
                <AdminTd>
                  <code className="rounded-md bg-primary-soft px-2 py-1 text-[11px] font-bold text-primary">
                    {e.action}
                  </code>
                </AdminTd>
                <AdminTd className="text-muted-foreground">
                  <p>{e.targetUser ? `@${e.targetUser.username}` : e.targetId || "—"}</p>
                  {e.meta && Object.keys(e.meta).length > 0 && (
                    <span className="mt-1 block max-w-xs truncate text-[11px] text-muted-foreground/70">
                      {JSON.stringify(e.meta)}
                    </span>
                  )}
                </AdminTd>
                <AdminTd className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {new Date(e.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="mt-0.5 flex items-center justify-end gap-1 text-[11px] text-muted-foreground/70">
                    <AdminBadge tone={actionTone(e.action)}>
                      {timeAgo(e.createdAt)} ago
                    </AdminBadge>
                  </p>
                </AdminTd>
              </motion.tr>
            ))}
            {!isLoading && !entries.length && (
              <tr>
                <td colSpan={4} className="p-6">
                  <AdminEmptyState
                    icon={History}
                    title="No matching entries"
                    description="Try widening the date range or clearing the action filter."
                  />
                </td>
              </tr>
            )}
          </tbody>
        </AdminTable>
      </AdminTableWrap>
    </div>
  );
}
