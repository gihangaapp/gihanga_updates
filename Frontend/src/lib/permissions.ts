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

const MODERATOR_PERMISSIONS: Set<Permission> = new Set([
  "moderation.queue.view",
  "moderation.queue.action",
  "moderation.queue.escalate",
  "moderation.rules.view",
  "live.forceEnd",
  "audit.viewOwn",
  "accounts.view",
  "ads.view",
]);

const ADMIN_PERMISSIONS: Set<Permission> = new Set([
  ...MODERATOR_PERMISSIONS,
  "moderation.rules.edit",
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
  "ads.manage",
  "analytics.view",
  "analytics.revenue",
  "rewards.view",
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
  if (Array.isArray(staffUser.permissions) && staffUser.permissions.length > 0) {
    return staffUser.permissions.includes(permission);
  }
  // Fallback to role default if permissions array is not set on object
  const rolePerms = DEFAULT_ROLE_PERMISSIONS[staffUser.role];
  return Boolean(rolePerms?.has(permission));
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
