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
  | "danger.walletFreeze"
  | "danger.liveEnd"
  | "danger.featureDisable"
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
  | "staff.permissions.manage"
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
  | "achievements.edit"
  | "operations.view"
  | "operations.activity.view"
  | "creators.view"
  | "creator.analytics.view"
  | "support.view"
  | "support.manage"
  | "verification.view"
  | "verification.review"
  | "announcements.view"
  | "announcements.create"
  | "announcements.publish"
  | "security.view"
  | "system.health.view"
  | "system.control"
  | "trending.view"
  | "approvals.view"
  | "moderation.content.view"
  | "moderation.investigations.view"
  | "moderation.enforcement.view"
  | "users.intelligence.view";

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
  "operations.view",
  "operations.activity.view",
  "moderation.content.view",
  "moderation.investigations.view",
  "moderation.enforcement.view",
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
  "analytics.view",
  "achievements.view",
  "operations.view",
  "operations.activity.view",
  "creators.view",
  "creator.analytics.view",
  "support.view",
  "support.manage",
  "verification.view",
  "verification.review",
  "announcements.view",
  "announcements.create",
  "trending.view",
  "approvals.view",
  "moderation.investigations.view",
  "moderation.enforcement.view",
]);

const ADMIN_OPTIONAL_PERMISSIONS: Set<Permission> = new Set([
  "payments.view", "payments.approve", "wallet.freeze", "wallet.unfreeze",
  "ads.view", "ads.approve", "ads.payment.verify", "ads.manage", "ads.remove",
  "analytics.revenue", "rewards.view", "settings.view", "settings.featureFlags",
  "settings.categories", "settings.momo.view", "settings.momo.edit",
  "security.view", "system.health.view", "system.control",
]);

const ADMIN_PERMISSION_CEILING: Set<Permission> = new Set([
  ...ADMIN_PERMISSIONS,
  ...ADMIN_OPTIONAL_PERMISSIONS,
]);

const SUPERADMIN_PERMISSIONS: Set<Permission> = new Set([
  ...ADMIN_PERMISSION_CEILING,
  "staff.promote.moderator",
  "staff.promote.admin",
  "staff.demote",
  "staff.view",
  "staff.create",
  "staff.permissions.manage",
  "rewards.edit",
  "settings.view",
  "settings.featureFlags",
  "settings.categories",
  "settings.momo.view",
  "settings.momo.edit",
  "achievements.view",
  "achievements.edit",
  "security.view",
  "system.health.view",
  "system.control",
  "announcements.publish",
  "users.intelligence.view",
]);

export const DEFAULT_ROLE_PERMISSIONS: Record<string, Set<Permission>> = {
  moderator: MODERATOR_PERMISSIONS,
  admin: ADMIN_PERMISSIONS,
  superadmin: SUPERADMIN_PERMISSIONS,
};

export const ROLE_PERMISSION_CEILINGS: Record<string, Set<Permission>> = {
  moderator: MODERATOR_PERMISSIONS,
  admin: ADMIN_PERMISSION_CEILING,
  superadmin: SUPERADMIN_PERMISSIONS,
};

export function getAssignableRolePermissions(role: string): Permission[] {
  return Array.from(ROLE_PERMISSION_CEILINGS[role] || []).sort();
}

export function getDefaultRolePermissions(role: string): Permission[] {
  return Array.from(DEFAULT_ROLE_PERMISSIONS[role] || []).sort();
}

export const STAFF_PERMISSION_GROUPS: { label: string; permissions: Permission[] }[] = [
  { label: "Community safety", permissions: ["moderation.queue.view", "moderation.queue.action", "moderation.queue.escalate", "moderation.rules.view", "moderation.rules.edit", "moderation.assessments.view", "moderation.assessments.action", "moderation.appeals.view", "moderation.appeals.action", "moderation.stats.view", "moderation.content.view", "moderation.investigations.view", "moderation.enforcement.view", "live.forceEnd", "live.alerts.manage"] },
  { label: "Users & creators", permissions: ["accounts.view", "accounts.verify", "accounts.suspend", "accounts.ban", "accounts.makeCreator", "accounts.grantPoints", "creators.view", "creator.analytics.view", "users.intelligence.view"] },
  { label: "Content & operations", permissions: ["content.view", "content.remove", "content.restore", "operations.view", "operations.activity.view", "support.view", "support.manage", "verification.view", "verification.review", "approvals.view", "trending.view", "announcements.view", "announcements.create", "announcements.publish"] },
  { label: "Finance & growth", permissions: ["payments.view", "payments.approve", "wallet.freeze", "wallet.unfreeze", "ads.view", "ads.approve", "ads.payment.verify", "ads.manage", "ads.remove", "analytics.view", "analytics.revenue", "rewards.view", "rewards.edit", "achievements.view", "achievements.edit"] },
  { label: "Security, staff & platform", permissions: ["audit.viewOwn", "audit.viewAll", "staff.promote.moderator", "staff.promote.admin", "staff.demote", "staff.view", "staff.create", "staff.permissions.manage", "settings.view", "settings.featureFlags", "settings.categories", "settings.momo.view", "settings.momo.edit", "security.view", "system.health.view", "system.control"] },
];

export function permissionLabel(permission: Permission): string {
  const known: Record<string, string> = {
    "moderation.queue.view": "View report inbox",
    "moderation.queue.action": "Resolve reports",
    "moderation.queue.escalate": "Escalate reports",
    "moderation.content.view": "Review held content",
    "moderation.investigations.view": "Investigate accounts",
    "moderation.enforcement.view": "View enforcement history",
    "moderation.assessments.action": "Decide AI moderation assessments",
    "moderation.assessments.view": "View AI moderation assessments",
    "moderation.appeals.action": "Decide appeals",
    "moderation.appeals.view": "View appeals",
    "moderation.rules.edit": "Edit moderation rules",
    "moderation.rules.view": "View moderation guidelines",
    "moderation.stats.view": "View own moderation performance",
    "live.forceEnd": "End violating live sessions",
    "live.alerts.manage": "Manage live safety alerts",
    "accounts.view": "View account directory",
    "accounts.verify": "Verify accounts",
    "accounts.suspend": "Suspend and restore accounts",
    "accounts.ban": "Permanently ban accounts",
    "accounts.makeCreator": "Grant creator status",
    "accounts.grantPoints": "Grant reward points",
    "creators.view": "View creator directory",
    "creator.analytics.view": "View creator analytics",
    "users.intelligence.view": "View detailed user intelligence",
    "content.view": "View content directory",
    "content.remove": "Remove content",
    "content.restore": "Restore removed content",
    "payments.view": "View payments",
    "payments.approve": "Approve payments",
    "analytics.view": "View growth analytics",
    "analytics.revenue": "View financial analytics",
    "support.view": "View support tickets",
    "support.manage": "Manage support tickets",
    "verification.view": "View verification requests",
    "verification.review": "Approve or reject verification",
    "announcements.view": "View announcements",
    "announcements.create": "Create announcement drafts",
    "announcements.publish": "Publish platform announcements",
    "security.view": "View security and risk signals",
    "system.health.view": "View system health",
    "system.control": "Manage platform controls",
    "staff.view": "View staff directory",
    "staff.create": "Create staff accounts",
    "staff.permissions.manage": "Manage staff permission sets",
    "audit.viewOwn": "View own audit history",
    "audit.viewAll": "View team audit history",
  };
  return known[permission] || permission.replaceAll(".", " ").replaceAll(/([A-Z])/g, " $1");
}

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
