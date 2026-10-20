import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { Gn as Activity, _n as Clock } from "../_libs/lucide-react.mjs";
import { D as timeAgo } from "./router-Dh25U3j0.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { t as ROLE_LABEL } from "./permissions-CGE25KsA.mjs";
import { r as useStaffActivity } from "./use-staff-notifications-DwOT5EOs.mjs";
import { a as StaffPageHeader, n as StaffCard, o as StaffSkeletonRows, r as StaffEmptyState, t as StaffBadge } from "./StaffUI-C6Ki33SI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/system.dashboard.activity-DXXmGrc8.js
var import_jsx_runtime = require_jsx_runtime();
function StaffActivityPage() {
	const { data, isLoading } = useStaffActivity();
	const activity = data?.activity ?? [];
	const maxCount = Math.max(...activity.map((a) => a.actionCount), 1);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StaffPageHeader, {
				icon: Activity,
				title: "Staff Activity",
				description: "Who's doing what — action counts across the team for the last 30 days.",
				accent: "accent"
			}),
			isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StaffSkeletonRows, { rows: 5 }),
			!isLoading && !activity.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StaffEmptyState, {
				icon: Activity,
				title: "No staff activity yet",
				description: "Actions taken by staff will show up here."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: activity.map((a, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
					initial: {
						opacity: 0,
						x: -8
					},
					animate: {
						opacity: 1,
						x: 0
					},
					transition: {
						duration: .25,
						delay: i * .03
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(StaffCard, {
						className: "p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold text-primary-foreground",
										style: { backgroundImage: `linear-gradient(140deg, oklch(0.55 0.11 ${i * 47 % 360}), oklch(0.75 0.1 ${i * 47 % 360 + 24}))` },
										children: a.name.slice(0, 2).toUpperCase()
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "truncate font-semibold text-foreground",
												children: a.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StaffBadge, {
												tone: "primary",
												children: ROLE_LABEL[a.role] ?? a.role
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "truncate text-xs text-muted-foreground",
											children: ["@", a.username]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-right",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-display text-xl font-extrabold text-foreground",
											children: a.actionCount
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "flex items-center gap-1 text-[11px] text-muted-foreground",
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
								className: "mt-3 h-1.5 overflow-hidden rounded-full bg-muted",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
									className: "gradient-brand h-full rounded-full",
									initial: { width: 0 },
									animate: { width: `${a.actionCount / maxCount * 100}%` },
									transition: {
										duration: .6,
										delay: i * .03
									}
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 flex flex-wrap gap-1.5",
								children: Object.entries(a.breakdown).sort(([, x], [, y]) => y - x).slice(0, 6).map(([action, count]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground",
									children: [
										action,
										" × ",
										count
									]
								}, action))
							})
						]
					})
				}, a.staffId))
			})
		]
	});
}
//#endregion
export { StaffActivityPage as component };
