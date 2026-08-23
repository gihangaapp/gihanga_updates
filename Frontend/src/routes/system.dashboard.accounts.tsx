import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Gift, RotateCcw, Search, Sparkles, UserCog } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import { hasPermission } from "@/lib/permissions";
import { formatCount } from "@/lib/format";
import {
  useStaffAccounts,
  useVerifyAccount,
  useSuspendAccount,
  useReinstateAccount,
  useBanAccount,
  useMakeCreator,
  useGrantPoints,
  type StaffAccount,
} from "@/hooks/use-staff-users";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/system/dashboard/accounts")({
  component: AccountsPage,
});

const statusTone: Record<string, string> = {
  active: "bg-success/10 text-success",
  limited: "bg-warning/10 text-warning",
  suspended: "bg-warning/15 text-warning",
  banned: "bg-rose-500/15 text-danger",
  review: "bg-muted text-muted-foreground",
};

function ReasonPrompt({ label, onConfirm, danger }: { label: string; onConfirm: (reason: string) => void; danger?: boolean }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  if (!open) {
    return (
      <Button
        size="sm"
        variant={danger ? "destructive" : "outline"}
        className={!danger ? "border-border text-foreground/90 hover:bg-muted" : undefined}
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>
    );
  }
  return (
    <div className="flex items-center gap-1.5">
      <input
        autoFocus
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason…"
        className="h-8 w-36 rounded-lg border border-border bg-card px-2 text-xs text-foreground outline-none"
      />
      <Button
        size="sm"
        variant={danger ? "destructive" : "outline"}
        className={!danger ? "border-border text-foreground/90" : undefined}
        disabled={!reason.trim()}
        onClick={() => {
          onConfirm(reason.trim());
          setOpen(false);
          setReason("");
        }}
      >
        Confirm
      </Button>
      <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => setOpen(false)}>
        Cancel
      </Button>
    </div>
  );
}

function GrantPointsDialog({ user, open, onOpenChange }: { user: StaffAccount | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const grantPoints = useGrantPoints();
  const [points, setPoints] = useState("100");
  const [reason, setReason] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle>Grant bonus points {user ? `to @${user.username}` : ""}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 px-1">
          <input
            type="number"
            min={1}
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            className="h-10 rounded-xl border border-border bg-elevated px-3.5 text-sm outline-none focus:border-ring"
          />
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (optional)"
            className="h-10 rounded-xl border border-border bg-elevated px-3.5 text-sm outline-none focus:border-ring"
          />
          <Button
            variant="brand"
            disabled={!user || !Number(points) || grantPoints.isPending}
            onClick={() =>
              user &&
              grantPoints.mutate(
                { id: user._id, points: Number(points), reason: reason.trim() || undefined },
                {
                  onSuccess: () => {
                    toast.success(`Granted ${points} points to @${user.username}`);
                    onOpenChange(false);
                  },
                  onError: (err: any) => toast.error(err.message || "Failed to grant points"),
                },
              )
            }
          >
            <Gift className="size-4" /> Grant points
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AccountsPage() {
  const { staffUser } = useAuth();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [grantTarget, setGrantTarget] = useState<StaffAccount | null>(null);
  const { data, isLoading } = useStaffAccounts({ q: q || undefined, status: status || undefined });

  const canManage = hasPermission(staffUser, "accounts.suspend");
  const canVerify = hasPermission(staffUser, "accounts.verify");
  const canMakeCreator = hasPermission(staffUser, "accounts.makeCreator");
  const canGrantPoints = hasPermission(staffUser, "accounts.grantPoints");

  const verify = useVerifyAccount();
  const suspend = useSuspendAccount();
  const reinstate = useReinstateAccount();
  const ban = useBanAccount();
  const makeCreator = useMakeCreator();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-foreground">
          <UserCog className="size-6 text-info" /> User Accounts
        </h1>
        <p className="text-sm text-muted-foreground">Search accounts and manage verification, status and creator access.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex h-10 min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-border bg-card px-3">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, username, email…"
            className="h-full flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-10 rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none"
        >
          <option value="">All statuses</option>
          {["active", "limited", "suspended", "banned", "review"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
              <th className="p-3 font-semibold">User</th>
              <th className="p-3 font-semibold">Status</th>
              <th className="p-3 font-semibold">Role</th>
              <th className="p-3 font-semibold">Followers</th>
              <th className="p-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">Loading…</td>
              </tr>
            )}
            {(data?.users ?? []).map((u) => (
              <tr key={u._id} className="border-b border-white/5 last:border-0">
                <td className="p-3">
                  <p className="font-semibold text-foreground">{u.name}</p>
                  <p className="text-xs text-muted-foreground">@{u.username} · {u.email}</p>
                </td>
                <td className="p-3">
                  <span className={cn("rounded-md px-1.5 py-0.5 text-[11px] font-bold capitalize", statusTone[u.status])}>{u.status}</span>
                </td>
                <td className="p-3 text-foreground/80">{u.isCreator ? "Creator" : "User"}</td>
                <td className="p-3 text-foreground/80">{formatCount(u.followersCount)}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1.5">
                    {canVerify && (
                      <Button size="sm" variant="outline" className="border-border text-foreground/90 hover:bg-muted" onClick={() => verify.mutate({ id: u._id }, { onSuccess: () => toast.success(`Verified @${u.username}`) })}>
                        <BadgeCheck className="size-3.5" />
                      </Button>
                    )}
                    {canMakeCreator && !u.isCreator && (
                      <Button size="sm" variant="outline" className="border-border text-foreground/90 hover:bg-muted" onClick={() => makeCreator.mutate({ id: u._id }, { onSuccess: () => toast.success(`@${u.username} is now a creator`) })}>
                        <Sparkles className="size-3.5" />
                      </Button>
                    )}
                    {canGrantPoints && (
                      <Button size="sm" variant="outline" className="border-border text-foreground/90 hover:bg-muted" onClick={() => setGrantTarget(u)}>
                        <Gift className="size-3.5" />
                      </Button>
                    )}
                    {canManage && u.status === "active" && (
                      <ReasonPrompt label="Suspend" onConfirm={(reason) => suspend.mutate({ id: u._id, reason }, { onSuccess: () => toast.success(`Suspended @${u.username}`) })} />
                    )}
                    {canManage && (u.status === "suspended" || u.status === "banned") && (
                      <Button size="sm" variant="outline" className="border-border text-foreground/90 hover:bg-muted" onClick={() => reinstate.mutate({ id: u._id }, { onSuccess: () => toast.success(`Reinstated @${u.username}`) })}>
                        <RotateCcw className="size-3.5" />
                      </Button>
                    )}
                    {canManage && u.status !== "banned" && (
                      <ReasonPrompt danger label="Ban" onConfirm={(reason) => ban.mutate({ id: u._id, reason }, { onSuccess: () => toast.success(`Banned @${u.username}`) })} />
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && !data?.users.length && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">No accounts match.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <GrantPointsDialog user={grantTarget} open={!!grantTarget} onOpenChange={(v) => !v && setGrantTarget(null)} />
    </div>
  );
}
