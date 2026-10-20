//#region node_modules/.nitro/vite/services/ssr/assets/permissions-CGE25KsA.js
var MODERATOR_PERMISSIONS = /* @__PURE__ */ new Set([
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
	"ads.view"
]);
var ADMIN_PERMISSIONS = /* @__PURE__ */ new Set([
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
	"ads.manage",
	"analytics.view",
	"analytics.revenue",
	"rewards.view",
	"achievements.view"
]);
var DEFAULT_ROLE_PERMISSIONS = {
	moderator: MODERATOR_PERMISSIONS,
	admin: ADMIN_PERMISSIONS,
	superadmin: /* @__PURE__ */ new Set([
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
		"achievements.edit"
	])
};
/** Checks if a staff user has a specific permission. Uses backend permissions array if available,
*  or falls back to the role matrix. */
function hasPermission(staffUser, permission) {
	if (!staffUser) return false;
	if (Array.isArray(staffUser.permissions) && staffUser.permissions.length > 0) return staffUser.permissions.includes(permission);
	const rolePerms = DEFAULT_ROLE_PERMISSIONS[staffUser.role];
	return Boolean(rolePerms?.has(permission));
}
function hasAnyPermission(staffUser, permissions) {
	return permissions.some((p) => hasPermission(staffUser, p));
}
var ROLE_LABEL = {
	moderator: "Moderator",
	admin: "Admin",
	superadmin: "Super Admin",
	user: "User"
};
//#endregion
export { hasAnyPermission as n, hasPermission as r, ROLE_LABEL as t };
