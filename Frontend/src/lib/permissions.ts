import type { UserProfile } from "@/lib/api-client";

export type Permission =
  | "moderation.queue.view"
  | "moderation.queue.action"
  | "moderation.queue.escalate"
  | "moderation.rules.view"
  | "moderation.rules.edit"
  | "live.forceEnd"
  | "live.alerts.manage"
  | "audit.viewOwn"
  | "audit.viewAll"
  | "accounts.view"
  | "accounts.verify"
  | "accounts.suspend"
  | "accounts.ban"
  | "accounts.makeCreator"
  | "accounts.grantPoints"
  | "staff.promote.moderator"
  | "staff.promote.admin"
  | "staff.demote"
  | "staff.view"
  | "payments.view"
  | "payments.approve"
  | "wallet.freeze"
  | "wallet.unfreeze"
  | "ads.view"
  | "ads.approve"
  | "ads.manage"
  | "analytics.view"
  | "analytics.revenue"
  | "rewards.view"
  | "rewards.edit"
  | "settings.view"
  | "settings.featureFlags"
  | "settings.categories"
  | "settings.momo.view"
  | "settings.momo.edit";

/** The backend's login response includes the resolved permission list for the signed-in
 *  staff role — this just checks membership in that list, mirroring the backend's own
 *  `requirePermission` middleware so there's one source of truth (the role matrix),
 *  not scattered `role === "admin"` checks across the UI. */
export function hasPermission(staffUser: UserProfile | null, permission: Permission): boolean {
  if (!staffUser) return false;
  return Boolean(staffUser.permissions?.includes(permission));
}

export function hasAnyPermission(staffUser: UserProfile | null, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(staffUser, p));
}

export const ROLE_LABEL: Record<string, string> = {
  moderator: "Moderator",
  admin: "Admin",
  superadmin: "Super Admin",
};
