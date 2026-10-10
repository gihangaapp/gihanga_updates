import { o as __toESM } from "../_runtime.mjs";
import { r as cn, t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { Ln as Award, P as Star, et as Save, it as RefreshCw, qt as Gem } from "../_libs/lucide-react.mjs";
import { n as api } from "./api-client-C-02deeD.mjs";
import { T as Switch, h as Input } from "./router-NU7wHj2a.mjs";
import { l as useAuth } from "./auth-context-Duh7Mq6E.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { r as hasPermission } from "./permissions-B9dpCwVw.mjs";
import { a as StaffPageHeader, n as StaffCard } from "./StaffUI-C6Ki33SI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/system.dashboard.achievements-BjUqmunC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AchievementsConfigPage() {
	const { staffUser } = useAuth();
	const canEdit = hasPermission(staffUser, "achievements.edit");
	const canView = hasPermission(staffUser, "achievements.view");
	const [defs, setDefs] = (0, import_react.useState)(null);
	const [saving, setSaving] = (0, import_react.useState)(null);
	const [reconciling, setReconciling] = (0, import_react.useState)(false);
	async function load() {
		try {
			const data = await api.get("/system/achievements/definitions", true);
			setDefs(data.definitions);
		} catch (err) {
			toast.error(err.message || "Failed to load achievement definitions");
		}
	}
	(0, import_react.useEffect)(() => {
		if (canView) load();
	}, [canView]);
	async function saveOne(def) {
		setSaving(def.achievementId);
		try {
			await api.put(`/system/achievements/definitions/${def.achievementId}`, {
				threshold: def.threshold,
				enabled: def.enabled,
				name: def.name,
				description: def.description
			}, true);
			toast.success(`${def.name} updated.`);
			await load();
		} catch (err) {
			toast.error(err.message || "Failed to update definition");
		} finally {
			setSaving(null);
		}
	}
	async function reconcile() {
		setReconciling(true);
		try {
			const summary = await api.post("/system/achievements/reconcile", {}, true);
			toast.success(`Reconciled ${summary.processed} users — ${summary.awarded} awarded, ${summary.revoked} revoked.`);
		} catch (err) {
			toast.error(err.message || "Reconciliation failed");
		} finally {
			setReconciling(false);
		}
	}
	async function seedDefaults() {
		try {
			const res = await api.post("/system/achievements/seed", {}, true);
			toast.success(`Seeded: ${res.created} created, ${res.updated} updated.`);
			await load();
		} catch (err) {
			toast.error(err.message || "Seed failed");
		}
	}
	if (!canView) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "py-10 text-center text-sm text-muted-foreground",
		children: "You don't have permission to view achievement definitions."
	});
	if (!defs) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "py-10 text-center text-sm text-muted-foreground",
		children: "Loading achievement definitions…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StaffPageHeader, {
				icon: Award,
				title: "Achievement Badge System",
				description: "Configure Gihanga Stars (followers) and Diamonds (views) milestone thresholds. Edits are versioned and audited.",
				accent: "accent",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						onClick: seedDefaults,
						disabled: !canEdit,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "mr-1.5 size-4" }), " Restore Defaults"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "brand",
						size: "sm",
						onClick: reconcile,
						disabled: !canEdit || reconciling,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: cn("mr-1.5 size-4", reconciling && "animate-spin") }), reconciling ? "Reconciling…" : "Reconcile Now"]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(StaffCard, {
					className: "p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4 flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-5 text-warning" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-lg font-bold text-foreground",
							children: "Gihanga Stars — Follower Milestones"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-3",
						children: defs.filter((d) => d.category === "stars").map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DefinitionRow, {
							def: d,
							canEdit,
							saving: saving === d.achievementId,
							onChange: (next) => setDefs((prev) => prev?.map((p) => p.achievementId === d.achievementId ? next : p) ?? null),
							onSave: () => saveOne(d)
						}, d.achievementId))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(StaffCard, {
					className: "p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4 flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gem, { className: "size-5 text-info" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-lg font-bold text-foreground",
							children: "Gihanga Diamonds — View Milestones"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-3",
						children: defs.filter((d) => d.category === "diamonds").map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DefinitionRow, {
							def: d,
							canEdit,
							saving: saving === d.achievementId,
							onChange: (next) => setDefs((prev) => prev?.map((p) => p.achievementId === d.achievementId ? next : p) ?? null),
							onSave: () => saveOne(d)
						}, d.achievementId))
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(StaffCard, {
				className: "p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-2 font-display text-base font-bold text-foreground",
					children: "How it works"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "space-y-1.5 text-xs text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							"• ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								className: "text-foreground",
								children: "Follower badges"
							}),
							" are current milestones — if a user drops below a threshold, the badge is revoked (award record preserved for audit)."
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							"• ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								className: "text-foreground",
								children: "View badges"
							}),
							" are lifetime cumulative — once earned, never revoked."
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "• Awards are computed authoritatively by the backend on follow/view events and by a 15-minute sweeper. The frontend never decides earned state." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							"• Eligible followers exclude deleted/suspended accounts. Eligible views sum",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "Post.viewsCount" }),
							" across published, non-removed posts (no double-counting across models)."
						] })
					]
				})]
			})
		]
	});
}
function DefinitionRow({ def, canEdit, saving, onChange, onSave }) {
	const colorMap = {
		red: "var(--color-danger)",
		gold: "var(--color-warning)",
		blue: "var(--color-info)",
		green: "var(--color-success)"
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-3 rounded-2xl border border-border bg-elevated/60 p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid size-9 shrink-0 place-items-center rounded-full",
				style: {
					backgroundColor: colorMap[def.color] + "20",
					color: colorMap[def.color]
				},
				children: def.icon === "star" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gem, { className: "size-4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "truncate text-xs font-bold text-foreground",
					children: def.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-[10px] uppercase tracking-wide text-muted-foreground",
					children: [
						def.metric,
						" · v",
						def.version,
						" · ",
						def.enabled ? "enabled" : "disabled"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "number",
						value: def.threshold,
						disabled: !canEdit,
						onChange: (e) => onChange({
							...def,
							threshold: Math.max(1, Math.floor(Number(e.target.value) || 1))
						}),
						className: "h-8 w-28 border-border bg-card text-right text-foreground"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
						checked: def.enabled,
						disabled: !canEdit,
						onCheckedChange: (v) => onChange({
							...def,
							enabled: v
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "outline",
						onClick: onSave,
						disabled: !canEdit || saving,
						className: "h-8 px-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "size-3.5" })
					})
				]
			})
		]
	});
}
//#endregion
export { AchievementsConfigPage as component };
