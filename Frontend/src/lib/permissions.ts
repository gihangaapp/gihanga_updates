import type { UserProfile } from "@/lib/api-client";

export type Permission =
  | "moderation.queue.view"
  | "moderation.queue.action"
  | "moderation.queue.escalate"
  | "moderation.rules.view"
  | "moderation.rules.edit"
  | "moderation.assessments.view"
  | "moderation.assessments.action"
  | "moderation.appeals.view"
  | "moderation.appeals.action"
  | "moderation.stats.view"
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
  | "ads.payment.verify"
  | "ads.manage"
  | "ads.remove"
  | "analytics.view"
  | "analytics.revenue"
  | "rewards.view"
  | "rewards.edit"
  | "settings.view"
  | "settings.featureFlags"
  | "settings.categories"
  | "settings.momo.view"
  | "settings.momo.edit"
  | "achievements.view"
  | "achievements.edit";

const MODERATOR_PERMISSIONS: Set<Permission> = new Set([
  "moderation.queue.view",
  "moderation.queue.action",
  "moderation.queue.escalate",
  "moderation.rules.view",
  "moderation.assessments.view",
  "moderation.assessments.action",
  "moderation.appeals.view",
  "moderation.stats.view",
  "live.forceEnd",
  "audit.viewOwn",
  "accounts.view",
  "ads.view",
  "ads.approve",
  "ads.remove",
]);

const ADMIN_PERMISSIONS: Set<Permission> = new Set([
  ...MODERATOR_PERMISSIONS,
  "moderation.rules.edit",
  "moderation.appeals.action",
  "live.alerts.manage",
  "audit.viewAll",
  "accounts.verify",
  "accounts.suspend",
  "accounts.ban",
  "accounts.makeCreator",
  "accounts.grantPoints",
  "payments.view",
  "payments.approve",
  "wallet.freeze",
  "wallet.unfreeze",
  "ads.approve",
  "ads.payment.verify",
  "ads.manage",
  "analytics.view",
  "analytics.revenue",
  "rewards.view",
  "achievements.view",
]);

const SUPERADMIN_PERMISSIONS: Set<Permission> = new Set([
  ...ADMIN_PERMISSIONS,
  "staff.promote.moderator",
  "staff.promote.admin",
  "staff.demote",
  "staff.view",
  "rewards.edit",
  "settings.view",
  "settings.featureFlags",
  "settings.categories",
  "settings.momo.view",
  "settings.momo.edit",
  "achievements.view",
  "achievements.edit",
]);

const DEFAULT_ROLE_PERMISSIONS: Record<string, Set<Permission>> = {
  moderator: MODERATOR_PERMISSIONS,
  admin: ADMIN_PERMISSIONS,
  superadmin: SUPERADMIN_PERMISSIONS,
};

/** Checks if a staff user has a specific permission. Uses backend permissions array if available,
 *  or falls back to the role matrix. */
export function hasPermission(staffUser: UserProfile | null, permission: Permission): boolean {
  if (!staffUser) return false;
  // The backend enforces the current role matrix. Also consult that same
  // matrix in the UI so a staff profile cached before a permission rollout
  // does not hide a newly granted action until the next sign-in.
  const rolePerms = DEFAULT_ROLE_PERMISSIONS[staffUser.role];
  if (rolePerms?.has(permission)) return true;
  return Array.isArray(staffUser.permissions) && staffUser.permissions.includes(permission);
}

export function hasAnyPermission(
  staffUser: UserProfile | null,
  permissions: Permission[],
): boolean {
  return permissions.some((p) => hasPermission(staffUser, p));
}

export const ROLE_LABEL: Record<string, string> = {
  moderator: "Moderator",
  admin: "Admin",
  superadmin: "Super Admin",
  user: "User",
};
