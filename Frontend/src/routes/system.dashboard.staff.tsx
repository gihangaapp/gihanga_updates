import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight, ShieldCheck, ShieldMinus, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ROLE_LABEL, STAFF_PERMISSION_GROUPS, getAssignableRolePermissions, getDefaultRolePermissions, permissionLabel, type Permission } from "@/lib/permissions";
import { useAuth } from "@/lib/auth-context";
import {
  useStaffList,
  usePromoteStaff,
  useCreateStaff,
  useDemoteStaff,
  useUpdateStaffPermissions,
  type StaffMember,
} from "@/hooks/use-staff-management";
import {
  AdminPageHeader,
  AdminCard,
  AdminCardHeader,
  AdminBadge,
  AdminStatCard,
  AdminAvatar,
  AdminTableWrap,
  AdminTable,
  AdminTh,
  AdminTd,
  AdminEmptyState,
} from "@/components/system/AdminUI";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/system/dashboard/staff")({
  component: StaffManagementPage,
});

const roleTone: Record<string, "info" | "accent" | "warning"> = {
  moderator: "info",
  admin: "accent",
  superadmin: "warning",
};

function StaffManagementPage() {
  const navigate = useNavigate();
  const { staffUser } = useAuth();
  const { data, isLoading } = useStaffList();
  const promote = usePromoteStaff();
  const createStaff = useCreateStaff();
  const demote = useDemoteStaff();
  const updatePermissions = useUpdateStaffPermissions();
  const [permissionTarget, setPermissionTarget] = useState<StaffMember | null>(null);
  const [permissionDraft, setPermissionDraft] = useState<Permission[]>([]);
  const [identifier, setIdentifier] = useState("");
  const [role, setRole] = useState<"moderator" | "admin">("moderator");
  const [newStaff, setNewStaff] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "moderator" as "moderator" | "admin",
  });

  const staff = data?.staff ?? [];
  const counts = {
    total: staff.length,
    superadmins: staff.filter((s) => s.role === "superadmin").length,
    admins: staff.filter((s) => s.role === "admin").length,
    moderators: staff.filter((s) => s.role === "moderator").length,
  };

  async function submitCreateStaff(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const result = await createStaff.mutateAsync({
        ...newStaff,
        name: newStaff.name.trim(),
        username: newStaff.username.trim(),
        email: newStaff.email.trim(),
      });
      toast.success(`Staff account created as ${ROLE_LABEL[result.user.role]}.`, {
        description: `The new staff member can now sign in with their own credentials.`,
      });
      navigate({ to: "/system/dashboard/staff" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't create staff account");
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={ShieldCheck}
        title="Staff Management"
        description="Create and oversee Moderator and Admin accounts. Only the Super Admin can change staff access."
        accent="warning"
        action={
          staffUser?.role === "superadmin" ? (
            <Link
              to="/system/register"
              className="press gradient-brand flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-bold text-primary-foreground shadow-glow"
            >
              <UserPlus className="size-4" /> Register administrator
              <ArrowRight className="size-3.5" />
            </Link>
          ) : undefined
        }
      />

      {/* Team stats */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <AdminStatCard icon={Users} label="Team members" value={counts.total} tone="primary" delay={0} />
        <AdminStatCard icon={ShieldCheck} label="Super Admins" value={counts.superadmins} tone="warning" delay={0.06} />
        <AdminStatCard icon={ShieldCheck} label="Admins" value={counts.admins} tone="accent" delay={0.12} />
        <AdminStatCard icon={ShieldCheck} label="Moderators" value={counts.moderators} tone="info" delay={0.18} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        {/* Staff table */}
        <AdminTableWrap>
          <div className="border-b border-border bg-muted/40 px-5 py-4">
            <AdminCardHeader title="Administration team" subtitle="Every account with staff privileges" />
          </div>
          <AdminTable>
            <thead>
              <tr>
                <AdminTh className="min-w-[220px]">Staff member</AdminTh>
                <AdminTh>Role</AdminTh>
                <AdminTh>Since</AdminTh>
                <AdminTh className="text-right">Actions</AdminTh>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-2">
                      <span className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      Loading team…
                    </span>
                  </td>
                </tr>
              )}
              {staff.map((s, i) => (
                <motion.tr
                  key={s._id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.3) }}
                  className="transition-colors hover:bg-muted/30"
                >
                  <AdminTd>
                    <div className="flex items-center gap-3">
                      <AdminAvatar name={s.name} hue={(s.username.charCodeAt(0) * 7) % 360} size="sm" />
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground">{s.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          @{s.username} · {s.email}
                        </p>
                      </div>
                    </div>
                  </AdminTd>
                  <AdminTd>
                    <AdminBadge tone={roleTone[s.role] ?? "muted"} dot>
                      {ROLE_LABEL[s.role]}
                    </AdminBadge>
                  </AdminTd>
                  <AdminTd className="text-muted-foreground">
                    {new Date(s.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </AdminTd>
                  <AdminTd className="text-right">
                    {s.role !== "superadmin" ? (
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button size="sm" variant="outline" className="border-primary/30 text-primary" onClick={() => {
                          setPermissionTarget(s);
                          setPermissionDraft((s.permissions || getDefaultRolePermissions(s.role)) as Permission[]);
                        }}>Permissions</Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-border text-foreground/90 hover:bg-danger/10 hover:text-danger"
                          onClick={() =>
                            demote.mutate(s._id, {
                              onSuccess: () => { toast.success(`Removed staff access for @${s.username}`); setPermissionTarget((current) => current?._id === s._id ? null : current); },
                              onError: (err: any) => toast.error(err.message || "Couldn't demote"),
                            })
                          }
                        >
                          <ShieldMinus className="size-3.5" /> Remove access
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Owner protected</span>
                    )}
                  </AdminTd>
                </motion.tr>
              ))}
              {!isLoading && !staff.length && (
                <tr>
                  <td colSpan={4} className="p-6">
                    <AdminEmptyState
                      icon={Users}
                      title="No staff accounts yet"
                      description="Promote an existing account or register a new administrator to get started."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </AdminTable>
        </AdminTableWrap>

        <div className="space-y-6">
          {/* Promote */}
          <AdminCard className="p-5">
            <AdminCardHeader
              title="Promote an account"
              subtitle="Elevate an existing Gihanga user by email or username"
            />
            <div className="mt-4 space-y-2.5">
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="email or username"
                className="h-10 w-full rounded-xl border border-border bg-elevated px-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
              />
              <div className="grid grid-cols-2 gap-2">
                {(["moderator", "admin"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={cn(
                      "h-10 rounded-xl border text-xs font-bold transition-colors",
                      role === r
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border bg-elevated text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {ROLE_LABEL[r]}
                  </button>
                ))}
              </div>
              <Button
                variant="brand"
                className="h-10 w-full"
                disabled={!identifier.trim() || promote.isPending}
                onClick={() =>
                  promote.mutate(
                    { identifier: identifier.trim(), role },
                    {
                      onSuccess: () => {
                        toast.success(`Promoted to ${ROLE_LABEL[role]}`);
                        setIdentifier("");
                      },
                      onError: (err: any) =>
                        toast.error(err.message || "Couldn't promote that account"),
                    },
                  )
                }
              >
                <UserPlus className="size-4" /> Promote to {ROLE_LABEL[role]}
              </Button>
            </div>
          </AdminCard>

          {/* Create staff (admin / superadmin) */}
          {staffUser?.role === "superadmin" && (
            <AdminCard className="p-5">
              <AdminCardHeader
                title="Quick create"
                subtitle="Prefer the guided experience? Use the full registration page."
              />
              <Link
                to="/system/register"
                className="press group mt-4 flex items-center justify-between gap-2 rounded-xl border border-primary/25 bg-primary-soft/40 px-4 py-3 text-xs font-bold text-primary transition-colors hover:bg-primary-soft/70"
              >
                <span className="flex items-center gap-2">
                  <UserPlus className="size-4" /> Open registration form
                </span>
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <form onSubmit={submitCreateStaff} className="mt-4 space-y-2.5 border-t border-border pt-4">
                <p className="text-xs font-semibold text-muted-foreground">
                  …or create inline with defaults:
                </p>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <input
                    required
                    minLength={2}
                    maxLength={64}
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                    placeholder="Full name"
                    autoComplete="name"
                    className="h-10 rounded-xl border border-border bg-elevated px-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/60"
                  />
                  <input
                    required
                    minLength={3}
                    maxLength={20}
                    pattern="[a-zA-Z0-9_]{3,20}"
                    value={newStaff.username}
                    onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
                    placeholder="Username"
                    autoComplete="username"
                    className="h-10 rounded-xl border border-border bg-elevated px-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/60"
                  />
                  <input
                    required
                    type="email"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    placeholder="Email address"
                    autoComplete="email"
                    className="h-10 rounded-xl border border-border bg-elevated px-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/60"
                  />
                  <input
                    required
                    type="password"
                    minLength={8}
                    maxLength={72}
                    value={newStaff.password}
                    onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                    placeholder="Password (8+ chars)"
                    autoComplete="new-password"
                    className="h-10 rounded-xl border border-border bg-elevated px-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/60"
                  />
                  <select
                    value={newStaff.role}
                    onChange={(e) =>
                      setNewStaff({
                        ...newStaff,
                        role: e.target.value as "moderator" | "admin" | "superadmin",
                      })
                    }
                    className="h-10 rounded-xl border border-border bg-elevated px-3 text-sm text-foreground outline-none focus:border-primary/60"
                  >
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                  <Button type="submit" variant="outline" className="border-primary/30 text-primary hover:bg-primary-soft" disabled={createStaff.isPending}>
                    {createStaff.isPending ? "Creating…" : "Create"}
                  </Button>
                </div>
              </form>
            </AdminCard>
          )}
        </div>
      </div>

      {staffUser?.role === "superadmin" && permissionTarget && (
        <AdminCard className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <AdminCardHeader title={`Permission set · @${permissionTarget.username}`} subtitle={`Role ceiling: ${ROLE_LABEL[permissionTarget.role]}. You may remove or restore capabilities within this role, but cannot grant higher-role permissions.`} />
              <p className="mt-2 text-xs text-muted-foreground">{permissionTarget.permissionsCustomized ? "A custom permission allowlist is active." : "This staff member currently uses the standard role permissions."} Selected: {permissionDraft.length} of {getAssignableRolePermissions(permissionTarget.role).length} assignable.</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setPermissionTarget(null)}>Close</Button>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {STAFF_PERMISSION_GROUPS.map((group) => {
              const available = group.permissions.filter((permission) => getAssignableRolePermissions(permissionTarget.role).includes(permission));
              if (!available.length) return null;
              return <section key={group.label} className="rounded-xl border border-border p-3">
                <h3 className="mb-3 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">{group.label}</h3>
                <div className="space-y-2">{available.map((permission) => <label key={permission} className="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-1.5 text-xs hover:bg-muted/50">
                  <input type="checkbox" checked={permissionDraft.includes(permission)} onChange={(event) => setPermissionDraft((current) => event.target.checked ? Array.from(new Set([...current, permission])) : current.filter((value) => value !== permission))} className="mt-0.5 size-4 accent-primary" />
                  <span className="min-w-0"><span className="block font-semibold text-foreground">{permissionLabel(permission)}</span><span className="text-[10px] text-muted-foreground">{permission}</span></span>
                </label>)}</div>
              </section>;
            })}
          </div>
          <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-border pt-4">
            <Button variant="outline" className="border-border" onClick={() => setPermissionDraft(getDefaultRolePermissions(permissionTarget.role))}>Reset role defaults</Button>
            <Button variant="brand" disabled={updatePermissions.isPending || permissionDraft.length === 0} onClick={async () => {
              try {
                await updatePermissions.mutateAsync({ id: permissionTarget._id, permissions: permissionDraft });
                toast.success(`Permissions updated for @${permissionTarget.username}`);
                setPermissionTarget(null);
              } catch (error) { toast.error(error instanceof Error ? error.message : "Could not update staff permissions"); }
            }}>{updatePermissions.isPending ? "Saving…" : "Save permissions"}</Button>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">For security, an empty permission set is not saved. The backend validates every permission and applies the new allowlist immediately; the staff member may need to refresh their session to update navigation.</p>
        </AdminCard>
      )}
    </div>
  );
}
