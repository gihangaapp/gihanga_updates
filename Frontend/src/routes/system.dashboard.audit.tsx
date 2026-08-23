import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { History } from "lucide-react";
import { useAuditLog } from "@/hooks/use-staff-management";

export const Route = createFileRoute("/system/dashboard/audit")({
  component: AuditLogPage,
});

function AuditLogPage() {
  const [action, setAction] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const { data, isLoading } = useAuditLog({ action: action || undefined, from: from || undefined, to: to || undefined });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-foreground">
          <History className="size-6 text-foreground/80" /> Audit Log
        </h1>
        <p className="text-sm text-muted-foreground">
          {data?.scope === "own" ? "Showing your own actions only." : "Showing every staff action across the platform."}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={action}
          onChange={(e) => setAction(e.target.value)}
          placeholder="Filter by action (e.g. accounts.ban)…"
          className="h-10 min-w-[220px] flex-1 rounded-xl border border-border bg-card px-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="h-10 rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="h-10 rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
              <th className="p-3 font-semibold">Actor</th>
              <th className="p-3 font-semibold">Action</th>
              <th className="p-3 font-semibold">Target</th>
              <th className="p-3 font-semibold">When</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">Loading…</td>
              </tr>
            )}
            {(data?.entries ?? []).map((e) => (
              <tr key={e._id} className="border-b border-white/5 last:border-0 align-top">
                <td className="p-3 text-foreground/80">{e.actor ? `@${e.actor.username}` : "—"}</td>
                <td className="p-3">
                  <code className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-primary">{e.action}</code>
                </td>
                <td className="p-3 text-muted-foreground">
                  {e.targetUser ? `@${e.targetUser.username}` : e.targetId || "—"}
                  {e.meta && Object.keys(e.meta).length > 0 && (
                    <span className="mt-0.5 block max-w-xs truncate text-[11px] text-muted-foreground">
                      {JSON.stringify(e.meta)}
                    </span>
                  )}
                </td>
                <td className="p-3 text-muted-foreground">{new Date(e.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {!isLoading && !data?.entries.length && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">No matching entries.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
