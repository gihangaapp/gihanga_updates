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
  | "staff.create"
  | "content.view"
  | "content.remove"
  | "content.restore"
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
  "content.view",
  "content.remove",
  "content.restore",
  "payments.view",
  "payments.approve",
  "ads.view",
  "ads.approve",
  "ads.payment.verify",
  "ads.manage",
  "ads.remove",
  "wallet.freeze",
  "wallet.unfreeze",
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
  "staff.create",
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
  // Prefer the permission snapshot supplied by the authenticated backend.
  // The local matrix is only a compatibility fallback for older cached sessions.
  if (Array.isArray(staffUser.permissions)) return staffUser.permissions.includes(permission);
  return DEFAULT_ROLE_PERMISSIONS[staffUser.role]?.has(permission) ?? false;
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
