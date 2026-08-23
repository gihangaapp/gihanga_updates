import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, ShieldMinus, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ROLE_LABEL } from "@/lib/permissions";
import { useStaffList, usePromoteStaff, useDemoteStaff } from "@/hooks/use-staff-management";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/system/dashboard/staff")({
  component: StaffManagementPage,
});

const roleTone: Record<string, string> = {
  moderator: "bg-info/10 text-info",
  admin: "bg-accent/15 text-accent",
  superadmin: "bg-warning/10 text-warning",
};

function StaffManagementPage() {
  const { data, isLoading } = useStaffList();
  const promote = usePromoteStaff();
  const demote = useDemoteStaff();
  const [identifier, setIdentifier] = useState("");
  const [role, setRole] = useState<"moderator" | "admin">("moderator");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-foreground">
          <ShieldCheck className="size-6 text-warning" /> Staff Management
        </h1>
        <p className="text-sm text-muted-foreground">Promote existing accounts to Moderator or Admin, or remove staff access.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-3 text-sm font-bold text-foreground">Promote an account</h2>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="email or username"
            className="h-10 min-w-[220px] flex-1 rounded-xl border border-border bg-card px-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "moderator" | "admin")}
            className="h-10 rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none"
          >
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
          </select>
          <Button
            variant="brand"
            disabled={!identifier.trim() || promote.isPending}
            onClick={() =>
              promote.mutate(
                { identifier: identifier.trim(), role },
                {
                  onSuccess: () => {
                    toast.success(`Promoted to ${ROLE_LABEL[role]}`);
                    setIdentifier("");
                  },
                  onError: (err: any) => toast.error(err.message || "Couldn't promote that account"),
                },
              )
            }
          >
            <UserPlus className="size-4" /> Promote
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
              <th className="p-3 font-semibold">Staff member</th>
              <th className="p-3 font-semibold">Role</th>
              <th className="p-3 font-semibold">Since</th>
              <th className="p-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">Loading…</td>
              </tr>
            )}
            {(data?.staff ?? []).map((s) => (
              <tr key={s._id} className="border-b border-white/5 last:border-0">
                <td className="p-3">
                  <p className="font-semibold text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground">@{s.username} · {s.email}</p>
                </td>
                <td className="p-3">
                  <span className={cn("rounded-md px-1.5 py-0.5 text-[11px] font-bold", roleTone[s.role])}>{ROLE_LABEL[s.role]}</span>
                </td>
                <td className="p-3 text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</td>
                <td className="p-3">
                  {s.role !== "superadmin" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-border text-foreground/90 hover:bg-danger/10 hover:text-danger"
                      onClick={() =>
                        demote.mutate(s._id, {
                          onSuccess: () => toast.success(`Removed staff access for @${s.username}`),
                          onError: (err: any) => toast.error(err.message || "Couldn't demote"),
                        })
                      }
                    >
                      <ShieldMinus className="size-3.5" /> Demote
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
