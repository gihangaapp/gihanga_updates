import { o as __toESM } from "../_runtime.mjs";
import { r as cn } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { E as TrendingDown, T as TrendingUp, et as Search, ot as RefreshCw } from "../_libs/lucide-react.mjs";
import { t as motion } from "../_libs/motion.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AdminUI-Cf1j1IrP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var toneChip = {
	primary: "bg-primary/10 text-primary",
	aqua: "bg-aqua/15 text-aqua-foreground dark:text-aqua",
	danger: "bg-danger/10 text-danger",
	success: "bg-success/10 text-success",
	warning: "bg-warning/15 text-warning",
	accent: "bg-accent/15 text-accent",
	info: "bg-info/10 text-info",
	muted: "bg-muted text-muted-foreground"
};
function AdminCard({ className, children, interactive }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("rounded-2xl border border-border bg-card shadow-soft", interactive && "lift cursor-pointer", className),
		children
	});
}
function AdminCardHeader({ title, subtitle, action, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex items-start justify-between gap-3", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-display text-[15px] font-bold tracking-tight text-foreground",
				children: title
			}), subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 text-xs text-muted-foreground",
				children: subtitle
			})]
		}), action]
	});
}
function AdminPageHeader({ icon: Icon, title, description, accent = "primary", action }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
		initial: {
			opacity: 0,
			y: -8
		},
		animate: {
			opacity: 1,
			y: 0
		},
		transition: {
			duration: .35,
			ease: [
				.22,
				1,
				.36,
				1
			]
		},
		className: "flex flex-wrap items-center justify-between gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("grid size-11 shrink-0 place-items-center rounded-2xl border border-border/60 shadow-sm", toneChip[accent]),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-[22px] leading-tight font-extrabold tracking-tight text-foreground",
				children: title
			}), description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 max-w-2xl text-[13px] text-muted-foreground",
				children: description
			})] })]
		}), action]
	});
}
function AdminTrend({ value, suffix = "%" }) {
	if (value === null || Number.isNaN(value)) return null;
	const positive = value >= 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums", positive ? "bg-success/10 text-success" : "bg-danger/10 text-danger"),
		children: [
			positive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingDown, { className: "size-3" }),
			positive ? "+" : "",
			value.toFixed(1),
			suffix
		]
	});
}
function AdminStatCard({ icon: Icon, label, value, trend, trendSuffix, hint, tone = "primary", delay = 0, onClick, footer }) {
	const Comp = onClick ? motion.button : motion.div;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Comp, {
		type: onClick ? "button" : void 0,
		onClick,
		initial: {
			opacity: 0,
			y: 14
		},
		animate: {
			opacity: 1,
			y: 0
		},
		transition: {
			duration: .4,
			delay,
			ease: [
				.22,
				1,
				.36,
				1
			]
		},
		whileHover: onClick ? { y: -3 } : void 0,
		className: cn("group relative overflow-hidden rounded-2xl border border-border bg-card p-5 text-left shadow-soft", onClick && "cursor-pointer"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute -top-10 -right-10 size-28 rounded-full opacity-[0.07] blur-2xl transition-opacity group-hover:opacity-[0.14]",
				style: { background: "var(--gradient-brand)" }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("grid size-10 place-items-center rounded-xl", toneChip[tone]),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-[18px]" })
				}), typeof trend === "number" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTrend, {
					value: trend,
					suffix: trendSuffix
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3.5 font-display text-[26px] leading-none font-extrabold tracking-tight text-foreground tabular-nums",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1.5 text-xs font-medium text-muted-foreground",
				children: label
			}),
			hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 text-[11px] text-muted-foreground/70",
				children: hint
			}),
			footer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3",
				children: footer
			})
		]
	});
}
function AdminBadge({ children, tone = "muted", dot, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-bold whitespace-nowrap", toneChip[tone], className),
		children: [dot && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-current" }), children]
	});
}
function AdminSegmented({ options, value, onChange, className, size = "md" }) {
	const layoutKey = (0, import_react.useId)();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-border bg-muted/50 p-1 no-scrollbar", className),
		children: options.map((opt) => {
			const active = opt.id === value;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => onChange(opt.id),
				className: cn("relative flex shrink-0 items-center gap-1.5 rounded-lg font-semibold transition-colors", size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3.5 py-1.5 text-xs", active ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"),
				children: [
					active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
						layoutId: `admin-seg-${layoutKey}`,
						className: "absolute inset-0 rounded-lg bg-card shadow-sm ring-1 ring-border/60"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "relative",
						children: opt.label
					}),
					typeof opt.count === "number" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("relative rounded-full px-1.5 py-px text-[10px] font-bold tabular-nums", active ? "bg-primary-soft text-primary" : "bg-muted text-muted-foreground"),
						children: opt.count
					})
				]
			}, opt.id);
		})
	});
}
function AdminSearchInput({ value, onChange, placeholder = "Search…", className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex h-10 items-center gap-2 rounded-xl border border-border bg-muted/50 px-3.5 transition-colors focus-within:border-ring focus-within:bg-card", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4 shrink-0 text-muted-foreground" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				value,
				onChange: (e) => onChange(e.target.value),
				placeholder,
				className: "h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
			}),
			value && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": "Clear search",
				onClick: () => onChange(""),
				className: "text-[11px] font-bold text-muted-foreground hover:text-foreground",
				children: "Clear"
			})
		]
	});
}
function AdminEmptyState({ icon: Icon, title, description, action }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center justify-center gap-2.5 rounded-2xl border border-dashed border-border-strong/60 bg-muted/20 px-6 py-14 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-6" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-bold text-foreground",
				children: title
			}),
			description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-sm text-xs leading-relaxed text-muted-foreground",
				children: description
			}),
			action && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2",
				children: action
			})
		]
	});
}
function AdminErrorState({ message, onRetry }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center gap-3 rounded-2xl border border-danger/25 bg-danger/5 py-10 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-semibold text-danger",
			children: message
		}), onRetry && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: onRetry,
			className: "press flex items-center gap-1.5 rounded-lg bg-danger/10 px-3.5 py-1.5 text-xs font-bold text-danger hover:bg-danger/15",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3.5" }), " Retry"]
		})]
	});
}
function AdminToggle({ checked, onChange, disabled }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		role: "switch",
		"aria-checked": checked,
		disabled,
		onClick: onChange,
		className: cn("relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-40", checked ? "bg-primary" : "bg-border-strong"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
			className: "absolute top-0.5 size-5 rounded-full bg-white shadow",
			animate: { x: checked ? 22 : 2 },
			transition: {
				type: "spring",
				stiffness: 500,
				damping: 32
			}
		})
	});
}
function AdminSkeletonRows({ rows = 4, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("space-y-2.5", className),
		children: Array.from({ length: rows }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-14 animate-pulse rounded-xl bg-muted/60" }, i))
	});
}
function AdminStatSkeleton({ count = 4 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-4 xl:grid-cols-4",
		children: Array.from({ length: count }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl border border-border bg-card p-5 shadow-soft",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-10 animate-pulse rounded-xl bg-muted/70" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-4 h-7 w-20 animate-pulse rounded-lg bg-muted/70" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-2 h-3 w-28 animate-pulse rounded bg-muted/50" })
			]
		}, i))
	});
}
function AdminAvatar({ name, hue, size = "md", className }) {
	const h = hue ?? 250;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("grid shrink-0 place-items-center rounded-full font-bold text-white shadow-sm", {
			sm: "size-8 text-[10px]",
			md: "size-10 text-xs",
			lg: "size-12 text-sm"
		}[size], className),
		style: { backgroundImage: `linear-gradient(140deg, oklch(0.52 0.11 ${h}), oklch(0.72 0.1 ${h + 26}))` },
		children: name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
	});
}
function AdminTableWrap({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-hidden rounded-2xl border border-border bg-card shadow-soft",
		children
	});
}
function AdminTable({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("table", {
			className: "w-full text-sm",
			children
		})
	});
}
function AdminTh({ children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
		className: cn("border-b border-border bg-muted/40 px-4 py-3 text-left text-[11px] font-bold tracking-wider text-muted-foreground uppercase", className),
		children
	});
}
function AdminTd({ children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
		className: cn("border-b border-border/50 px-4 py-3.5 last:border-0", className),
		children
	});
}
//#endregion
export { AdminToggle as _, AdminEmptyState as a, AdminSearchInput as c, AdminStatCard as d, AdminStatSkeleton as f, AdminTh as g, AdminTd as h, AdminCardHeader as i, AdminSegmented as l, AdminTableWrap as m, AdminBadge as n, AdminErrorState as o, AdminTable as p, AdminCard as r, AdminPageHeader as s, AdminAvatar as t, AdminSkeletonRows as u };
