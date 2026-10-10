import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { Vt as History } from "../_libs/lucide-react.mjs";
import { t as useAuditLog } from "./use-staff-management-CctOSpQl.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/system.dashboard.audit-DU3jYgp-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AuditLogPage() {
	const [action, setAction] = (0, import_react.useState)("");
	const [from, setFrom] = (0, import_react.useState)("");
	const [to, setTo] = (0, import_react.useState)("");
	const { data, isLoading } = useAuditLog({
		action: action || void 0,
		from: from || void 0,
		to: to || void 0
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
				className: "flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "size-6 text-foreground/80" }), " Audit Log"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: data?.scope === "own" ? "Showing your own actions only." : "Showing every staff action across the platform."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: action,
						onChange: (e) => setAction(e.target.value),
						placeholder: "Filter by action (e.g. accounts.ban)…",
						className: "h-10 min-w-[220px] flex-1 rounded-xl border border-border bg-card px-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "date",
						value: from,
						onChange: (e) => setFrom(e.target.value),
						className: "h-10 rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "date",
						value: to,
						onChange: (e) => setTo(e.target.value),
						className: "h-10 rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-hidden rounded-2xl border border-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border bg-muted/40 text-left text-xs text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-3 font-semibold",
								children: "Actor"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-3 font-semibold",
								children: "Action"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-3 font-semibold",
								children: "Target"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-3 font-semibold",
								children: "When"
							})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [
						isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: 4,
							className: "p-8 text-center text-muted-foreground",
							children: "Loading…"
						}) }),
						(data?.entries ?? []).map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-white/5 last:border-0 align-top",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "p-3 text-foreground/80",
									children: e.actor ? `@${e.actor.username}` : "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "p-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
										className: "rounded-md bg-muted px-1.5 py-0.5 text-xs text-primary",
										children: e.action
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "p-3 text-muted-foreground",
									children: [e.targetUser ? `@${e.targetUser.username}` : e.targetId || "—", e.meta && Object.keys(e.meta).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-0.5 block max-w-xs truncate text-[11px] text-muted-foreground",
										children: JSON.stringify(e.meta)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "p-3 text-muted-foreground",
									children: new Date(e.createdAt).toLocaleString()
								})
							]
						}, e._id)),
						!isLoading && !data?.entries.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: 4,
							className: "p-8 text-center text-muted-foreground",
							children: "No matching entries."
						}) })
					] })]
				})
			})
		]
	});
}
//#endregion
export { AuditLogPage as component };
