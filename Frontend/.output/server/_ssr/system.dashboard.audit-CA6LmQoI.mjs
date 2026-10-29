import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { Kt as History, et as Search } from "../_libs/lucide-react.mjs";
import { j as timeAgo } from "./router-CrddKQ7E.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { a as AdminEmptyState, g as AdminTh, h as AdminTd, m as AdminTableWrap, n as AdminBadge, p as AdminTable, s as AdminPageHeader } from "./AdminUI-Cf1j1IrP.mjs";
import { t as useAuditLog } from "./use-staff-management-92jpC5YJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/system.dashboard.audit-CA6LmQoI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function actionTone(action) {
	if (/ban|reject|remove|demote|force/i.test(action)) return "danger";
	if (/approve|verify|promote|create|grant/i.test(action)) return "success";
	if (/suspend|pause|warn|escalate/i.test(action)) return "warning";
	if (/login|view/i.test(action)) return "muted";
	return "primary";
}
function AuditLogPage() {
	const [action, setAction] = (0, import_react.useState)("");
	const [from, setFrom] = (0, import_react.useState)("");
	const [to, setTo] = (0, import_react.useState)("");
	const { data, isLoading } = useAuditLog({
		action: action || void 0,
		from: from || void 0,
		to: to || void 0
	});
	const entries = data?.entries ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminPageHeader, {
				icon: History,
				title: "Audit Log",
				description: data?.scope === "own" ? "Showing your own actions only." : "Showing every staff action across the platform.",
				accent: "primary"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex h-10 min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-border bg-muted/50 px-3.5 transition-colors focus-within:border-ring focus-within:bg-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4 shrink-0 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: action,
							onChange: (e) => setAction(e.target.value),
							placeholder: "Filter by action (e.g. accounts.ban)…",
							className: "h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "date",
								value: from,
								onChange: (e) => setFrom(e.target.value),
								className: "h-10 rounded-xl border border-border bg-muted/50 px-3 text-sm text-foreground outline-none focus:border-ring"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold text-muted-foreground",
								children: "to"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "date",
								value: to,
								onChange: (e) => setTo(e.target.value),
								className: "h-10 rounded-xl border border-border bg-muted/50 px-3 text-sm text-foreground outline-none focus:border-ring"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-xl bg-primary-soft px-3.5 py-2.5 text-xs font-bold text-primary tabular-nums",
						children: isLoading ? "…" : `${entries.length} entries`
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTableWrap, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminTable, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTh, {
					className: "min-w-[160px]",
					children: "Actor"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTh, {
					className: "min-w-[140px]",
					children: "Action"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTh, {
					className: "min-w-[160px]",
					children: "Target"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTh, {
					className: "text-right",
					children: "When"
				})
			] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [
				isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					colSpan: 4,
					className: "p-10 text-center text-sm text-muted-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" }), "Loading audit trail…"]
					})
				}) }),
				entries.map((e, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.tr, {
					initial: {
						opacity: 0,
						y: 6
					},
					animate: {
						opacity: 1,
						y: 0
					},
					transition: { delay: Math.min(i * .025, .3) },
					className: "align-top transition-colors hover:bg-muted/30",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminTd, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-semibold text-foreground/90",
							children: e.actor ? e.actor.name : "System"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: e.actor ? `@${e.actor.username}` : "—"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTd, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
							className: "rounded-md bg-primary-soft px-2 py-1 text-[11px] font-bold text-primary",
							children: e.action
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminTd, {
							className: "text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: e.targetUser ? `@${e.targetUser.username}` : e.targetId || "—" }), e.meta && Object.keys(e.meta).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-1 block max-w-xs truncate text-[11px] text-muted-foreground/70",
								children: JSON.stringify(e.meta)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminTd, {
							className: "text-right",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: new Date(e.createdAt).toLocaleDateString(void 0, {
									month: "short",
									day: "numeric"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-0.5 flex items-center justify-end gap-1 text-[11px] text-muted-foreground/70",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminBadge, {
									tone: actionTone(e.action),
									children: [timeAgo(e.createdAt), " ago"]
								})
							})]
						})
					]
				}, e._id)),
				!isLoading && !entries.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					colSpan: 4,
					className: "p-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminEmptyState, {
						icon: History,
						title: "No matching entries",
						description: "Try widening the date range or clearing the action filter."
					})
				}) })
			] })] }) })
		]
	});
}
//#endregion
export { AuditLogPage as component };
