import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { C as Trophy, Sn as Clock, Zn as Activity } from "../_libs/lucide-react.mjs";
import { j as timeAgo } from "./router-CrddKQ7E.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { t as ROLE_LABEL } from "./permissions-CGE25KsA.mjs";
import { a as AdminEmptyState, i as AdminCardHeader, n as AdminBadge, r as AdminCard, s as AdminPageHeader, t as AdminAvatar, u as AdminSkeletonRows } from "./AdminUI-Cf1j1IrP.mjs";
import { r as useStaffActivity } from "./use-staff-notifications-CrbufWm0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/system.dashboard.activity-NfArsVKM.js
var import_jsx_runtime = require_jsx_runtime();
function StaffActivityPage() {
	const { data, isLoading } = useStaffActivity();
	const activity = data?.activity ?? [];
	const maxCount = Math.max(...activity.map((a) => a.actionCount), 1);
	const totalActions = activity.reduce((acc, a) => acc + a.actionCount, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminPageHeader, {
				icon: Activity,
				title: "Staff Activity",
				description: "Who's doing what — action counts across the team for the last 30 days.",
				accent: "accent"
			}),
			isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminSkeletonRows, { rows: 5 }),
			!isLoading && !activity.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminEmptyState, {
				icon: Activity,
				title: "No staff activity yet",
				description: "Actions taken by staff will show up here."
			}),
			!isLoading && activity.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-3",
				children: activity.slice(0, 3).map((a, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
					initial: {
						opacity: 0,
						y: 14,
						scale: .97
					},
					animate: {
						opacity: 1,
						y: 0,
						scale: 1
					},
					transition: {
						duration: .4,
						delay: i * .08
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, {
						className: i === 0 ? "relative overflow-hidden p-5 ring-1 ring-warning/40" : "p-5",
						children: [
							i === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "pointer-events-none absolute -top-8 -right-8 size-24 rounded-full opacity-15 blur-2xl",
								style: { background: "var(--warning)" }
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminAvatar, {
									name: a.name,
									hue: (i * 97 + 210) % 360
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `grid size-8 place-items-center rounded-xl ${i === 0 ? "bg-warning/15 text-warning" : i === 1 ? "bg-muted text-muted-foreground" : "bg-accent/10 text-accent"}`,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "size-4" })
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 truncate text-sm font-bold text-foreground",
								children: a.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminBadge, {
									tone: "primary",
									children: ROLE_LABEL[a.role] ?? a.role
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-[11px] text-muted-foreground",
									children: ["@", a.username]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-3 font-display text-2xl font-extrabold text-foreground tabular-nums",
								children: [a.actionCount, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-1 text-xs font-semibold text-muted-foreground",
									children: "actions"
								})]
							})
						]
					})
				}, a.staffId))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, {
				className: "p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCardHeader, {
					title: "All team members",
					subtitle: `${totalActions.toLocaleString()} total actions in the last 30 days`
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5 space-y-4",
					children: activity.map((a, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: {
							opacity: 0,
							x: -10
						},
						animate: {
							opacity: 1,
							x: 0
						},
						transition: {
							duration: .3,
							delay: Math.min(i * .03, .4)
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminAvatar, {
										name: a.name,
										hue: i * 47 % 360,
										size: "sm"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-wrap items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "truncate text-[13px] font-bold text-foreground",
												children: a.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminBadge, {
												tone: "primary",
												children: ROLE_LABEL[a.role] ?? a.role
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "truncate text-[11px] text-muted-foreground",
											children: ["@", a.username]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-right",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-display text-lg font-extrabold text-foreground tabular-nums",
											children: a.actionCount
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "flex items-center justify-end gap-1 text-[11px] text-muted-foreground",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-3" }),
												" ",
												timeAgo(a.lastActionAt),
												" ago"
											]
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2.5 h-1.5 overflow-hidden rounded-full bg-muted",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
									className: "h-full rounded-full",
									style: { background: "var(--gradient-brand)" },
									initial: { width: 0 },
									animate: { width: `${a.actionCount / maxCount * 100}%` },
									transition: {
										duration: .7,
										delay: Math.min(i * .03, .4)
									}
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2.5 flex flex-wrap gap-1.5",
								children: Object.entries(a.breakdown).sort(([, x], [, y]) => y - x).slice(0, 6).map(([action, count]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminBadge, {
									tone: "muted",
									children: [
										action,
										" × ",
										count
									]
								}, action))
							})
						]
					}, a.staffId))
				})]
			})] })
		]
	});
}
//#endregion
export { StaffActivityPage as component };
