import { r as cn } from "./button-CJVUuoS8.mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { it as RefreshCw } from "../_libs/lucide-react.mjs";
import { t as motion } from "../_libs/motion.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/StaffUI-C6Ki33SI.js
var import_jsx_runtime = require_jsx_runtime();
/** Base surface card used everywhere in the staff console — theme-aware. */
function StaffCard({ className, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("rounded-2xl border border-border bg-card/60 backdrop-blur-sm", className),
		children
	});
}
function StaffPageHeader({ icon: Icon, title, description, accent = "primary", action }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
		initial: {
			opacity: 0,
			y: -6
		},
		animate: {
			opacity: 1,
			y: 0
		},
		transition: { duration: .3 },
		className: "flex flex-wrap items-start justify-between gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("mt-0.5 grid size-10 shrink-0 place-items-center rounded-2xl", {
					primary: "bg-primary-soft text-primary",
					danger: "bg-danger/10 text-danger",
					success: "bg-success/10 text-success",
					warning: "bg-warning/10 text-warning",
					accent: "bg-accent/15 text-accent"
				}[accent]),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-extrabold tracking-tight text-foreground",
				children: title
			}), description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 text-sm text-muted-foreground",
				children: description
			})] })]
		}), action]
	});
}
function StaffBadge({ children, tone = "muted", className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("rounded-md px-1.5 py-0.5 text-[11px] font-bold capitalize", {
			muted: "bg-muted text-muted-foreground",
			primary: "bg-primary-soft text-primary",
			danger: "bg-danger/10 text-danger",
			success: "bg-success/10 text-success",
			warning: "bg-warning/10 text-warning",
			accent: "bg-accent/15 text-accent",
			info: "bg-info/10 text-info"
		}[tone], className),
		children
	});
}
function StaffEmptyState({ icon: Icon, title, description }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-14 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-7 text-muted-foreground" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-semibold text-foreground",
				children: title
			}),
			description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-xs text-xs text-muted-foreground",
				children: description
			})
		]
	});
}
function StaffErrorState({ message, onRetry }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center gap-3 rounded-2xl border border-danger/20 bg-danger/5 py-10 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-semibold text-danger",
			children: message
		}), onRetry && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: onRetry,
			className: "press flex items-center gap-1.5 rounded-lg bg-danger/10 px-3 py-1.5 text-xs font-bold text-danger hover:bg-danger/15",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3.5" }), " Retry"]
		})]
	});
}
function StaffSkeletonRows({ rows = 4 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-2.5",
		children: Array.from({ length: rows }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-14 animate-pulse rounded-xl bg-muted/60" }, i))
	});
}
//#endregion
export { StaffPageHeader as a, StaffErrorState as i, StaffCard as n, StaffSkeletonRows as o, StaffEmptyState as r, StaffBadge as t };
