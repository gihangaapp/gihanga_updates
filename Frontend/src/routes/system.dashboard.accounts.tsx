import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  BadgeCheck,
  Gift,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  UserCog,
  UserX,
  Users,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import {
  AdminPageHeader,
  AdminCard,
  AdminBadge,
  AdminSearchInput,
  AdminEmptyState,
  AdminAvatar,
  AdminTableWrap,
  AdminTable,
  AdminTh,
  AdminTd,
} from "@/components/system/AdminUI";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/system/dashboard/accounts")({
  component: AccountsPage,
});

const statusTone: Record<string, "success" | "warning" | "danger" | "muted"> = {
  active: "success",
  limited: "warning",
  suspended: "warning",
  banned: "danger",
  review: "muted",
};

function ReasonPrompt({
  label,
  onConfirm,
  danger,
}: {
  label: string;
  onConfirm: (reason: string) => void;
  danger?: boolean;
}) {
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
        className="h-8 w-36 rounded-lg border border-border bg-card px-2 text-xs text-foreground outline-none focus:border-primary/60"
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
      <Button
        size="sm"
        variant="ghost"
        className="text-muted-foreground"
        onClick={() => setOpen(false)}
      >
        Cancel
      </Button>
    </div>
  );
}

function GrantPointsDialog({
  user,
  open,
  onOpenChange,
}: {
  user: StaffAccount | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const grantPoints = useGrantPoints();
  const [points, setPoints] = useState("100");
  const [reason, setReason] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-success/10 text-success">
              <Gift className="size-4" />
            </span>
            Grant bonus points {user ? `to @${user.username}` : ""}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 px-1">
          <div>
            <label className="mb-1.5 block text-xs font-bold tracking-wide text-muted-foreground uppercase">
              Points
            </label>
            <input
              type="number"
              min={1}
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-elevated px-3.5 text-sm outline-none focus:border-ring focus:ring-4 focus:ring-primary/10"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold tracking-wide text-muted-foreground uppercase">
              Reason (optional)
            </label>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. community contest prize"
              className="h-11 w-full rounded-xl border border-border bg-elevated px-3.5 text-sm outline-none focus:border-ring focus:ring-4 focus:ring-primary/10"
            />
          </div>
          <Button
            variant="brand"
            className="mt-1 h-11"
            disabled={!user || !Number(points) || grantPoints.isPending}
            onClick={() =>
              user &&
              grantPoints.mutate(
                { id: user._id, points: Number(points), reason: reason.trim() || undefined },
                {
                  onSuccess: () => {
                    toast.success(`Granted ${points} points to @${user.username}`);
                    onOpenChange(false);
                    setReason("");
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

  const users = data?.users ?? [];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={UserCog}
        title="User Accounts"
        description="Search accounts and manage verification, status and creator access."
        accent="primary"
      />

      <div className="flex flex-wrap items-center gap-2.5">
        <AdminSearchInput
          value={q}
          onChange={setQ}
          placeholder="Search name, username, email…"
          className="min-w-[240px] flex-1"
        />
        <div className="relative">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-10 appearance-none rounded-xl border border-border bg-muted/50 pr-9 pl-4 text-sm font-medium text-foreground outline-none transition-colors focus:border-ring"
          >
            <option value="">All statuses</option>
            {["active", "limited", "suspended", "banned", "review"].map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute top-1/2 right-3.5 size-3.5 -translate-y-1/2 text-muted-foreground"
            viewBox="0 0 12 12"
            fill="none"
          >
            <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="rounded-xl bg-primary-soft px-3.5 py-2.5 text-xs font-bold text-primary tabular-nums">
          {isLoading ? "…" : `${users.length} account${users.length === 1 ? "" : "s"}`}
        </span>
      </div>

      <AdminTableWrap>
        <AdminTable>
          <thead>
            <tr>
              <AdminTh className="min-w-[220px]">User</AdminTh>
              <AdminTh>Status</AdminTh>
              <AdminTh>Role</AdminTh>
              <AdminTh>Followers</AdminTh>
              <AdminTh className="text-right">Actions</AdminTh>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="p-10 text-center text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <span className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Loading accounts…
                  </span>
                </td>
              </tr>
            )}
            {users.map((u, i) => (
              <motion.tr
                key={u._id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                className="transition-colors hover:bg-muted/30"
              >
                <AdminTd>
                  <div className="flex items-center gap-3">
                    <AdminAvatar name={u.name} hue={(u.username.charCodeAt(0) * 7) % 360} size="sm" />
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 font-semibold text-foreground">
                        <span className="truncate">{u.name}</span>
                        {u.status === "active" && (
                          <BadgeCheck className="size-3.5 shrink-0 text-primary" />
                        )}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        @{u.username} · {u.email}
                      </p>
                    </div>
                  </div>
                </AdminTd>
                <AdminTd>
                  <AdminBadge tone={statusTone[u.status] ?? "muted"} dot>
                    {u.status}
                  </AdminBadge>
                </AdminTd>
                <AdminTd>
                  {u.role !== "user" ? (
                    <AdminBadge tone="accent">{u.role}</AdminBadge>
                  ) : (
                    <span className="text-[13px] text-foreground/80">
                      {u.isCreator ? "Creator" : "User"}
                    </span>
                  )}
                </AdminTd>
                <AdminTd className="font-semibold text-foreground/80 tabular-nums">
                  {formatCount(u.followersCount)}
                </AdminTd>
                <AdminTd>
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {canVerify && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-border text-foreground/90 hover:bg-primary-soft hover:text-primary"
                        title="Verify account"
                        onClick={() =>
                          verify.mutate(
                            { id: u._id },
                            { onSuccess: () => toast.success(`Verified @${u.username}`) },
                          )
                        }
                      >
                        <BadgeCheck className="size-3.5" />
                      </Button>
                    )}
                    {canMakeCreator && !u.isCreator && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-border text-foreground/90 hover:bg-primary-soft hover:text-primary"
                        title="Make creator"
                        onClick={() =>
                          makeCreator.mutate(
                            { id: u._id },
                            {
                              onSuccess: () =>
                                toast.success(`@${u.username} is now a creator`),
                            },
                          )
                        }
                      >
                        <Sparkles className="size-3.5" />
                      </Button>
                    )}
                    {canGrantPoints && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-border text-foreground/90 hover:bg-success/10 hover:text-success"
                        title="Grant points"
                        onClick={() => setGrantTarget(u)}
                      >
                        <Gift className="size-3.5" />
                      </Button>
                    )}
                    {canManage && u.status === "active" && (
                      <ReasonPrompt
                        label="Suspend"
                        onConfirm={(reason) =>
                          suspend.mutate(
                            { id: u._id, reason },
                            { onSuccess: () => toast.success(`Suspended @${u.username}`) },
                          )
                        }
                      />
                    )}
                    {canManage && (u.status === "suspended" || u.status === "banned") && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-border text-foreground/90 hover:bg-success/10 hover:text-success"
                        title="Reinstate"
                        onClick={() =>
                          reinstate.mutate(
                            { id: u._id },
                            { onSuccess: () => toast.success(`Reinstated @${u.username}`) },
                          )
                        }
                      >
                        <RotateCcw className="size-3.5" />
                      </Button>
                    )}
                    {canManage && u.status !== "banned" && (
                      <ReasonPrompt
                        danger
                        label="Ban"
                        onConfirm={(reason) =>
                          ban.mutate(
                            { id: u._id, reason },
                            { onSuccess: () => toast.success(`Banned @${u.username}`) },
                          )
                        }
                      />
                    )}
                  </div>
                </AdminTd>
              </motion.tr>
            ))}
            {!isLoading && !users.length && (
              <tr>
                <td colSpan={5} className="p-6">
                  <AdminEmptyState
                    icon={Users}
                    title="No accounts match"
                    description="Try a different search term or clear the status filter."
                  />
                </td>
              </tr>
            )}
          </tbody>
        </AdminTable>
      </AdminTableWrap>

      <GrantPointsDialog
        user={grantTarget}
        open={!!grantTarget}
        onOpenChange={(v) => !v && setGrantTarget(null)}
      />
    </div>
  );
}
