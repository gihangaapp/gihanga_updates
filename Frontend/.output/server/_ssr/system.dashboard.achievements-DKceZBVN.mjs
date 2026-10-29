import { o as __toESM } from "../_runtime.mjs";
import { t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { $t as Gem, Gn as Award, Ht as Info, I as Star, nt as Save, ot as RefreshCw } from "../_libs/lucide-react.mjs";
import { n as api } from "./api-client-DZOxvrvB.mjs";
import { Vt as Switch, h as Input } from "./router-CrddKQ7E.mjs";
import { l as useAuth } from "./auth-context-CuF8V2_l.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { r as hasPermission } from "./permissions-CGE25KsA.mjs";
import { i as AdminCardHeader, n as AdminBadge, r as AdminCard, s as AdminPageHeader } from "./AdminUI-Cf1j1IrP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/system.dashboard.achievements-DKceZBVN.js
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
	if (!defs) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminPageHeader, {
			icon: Award,
			title: "Achievement Badges",
			description: "Configure Gihanga Stars and Diamonds milestone thresholds.",
			accent: "accent"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-4",
			children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-16 animate-pulse rounded-2xl bg-muted/50" }, i))
		})]
	});
	const starsCount = defs.filter((d) => d.category === "stars").length;
	const diamondsCount = defs.filter((d) => d.category === "diamonds").length;
	const enabledCount = defs.filter((d) => d.enabled).length;
	const renderSection = (category, Icon, tone, title, subtitle) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, {
		className: "p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCardHeader, {
			title: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `size-4 ${tone}` }), title]
			}),
			subtitle,
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminBadge, {
				tone: "muted",
				children: [defs.filter((d) => d.category === category).length, " badges"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 space-y-2.5",
			children: defs.filter((d) => d.category === category).map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DefinitionRow, {
				def: d,
				index: i,
				canEdit,
				saving: saving === d.achievementId,
				onChange: (next) => setDefs((prev) => prev?.map((p) => p.achievementId === d.achievementId ? next : p) ?? null),
				onSave: () => saveOne(d)
			}, d.achievementId))
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminPageHeader, {
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
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "mr-1.5 size-4" }), " Restore defaults"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "brand",
						size: "sm",
						onClick: reconcile,
						disabled: !canEdit || reconciling,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `mr-1.5 size-4 ${reconciling ? "animate-spin" : ""}` }), reconciling ? "Reconciling…" : "Reconcile now"]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-3",
				children: [
					{
						label: "Star badges",
						value: starsCount,
						tone: "bg-warning/10 text-warning"
					},
					{
						label: "Diamond badges",
						value: diamondsCount,
						tone: "bg-info/10 text-info"
					},
					{
						label: "Enabled",
						value: enabledCount,
						tone: "bg-success/10 text-success"
					},
					{
						label: "Disabled",
						value: defs.length - enabledCount,
						tone: "bg-muted text-muted-foreground"
					}
				].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `flex items-center gap-2 rounded-xl px-4 py-2.5 ${s.tone}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-lg font-extrabold tabular-nums",
						children: s.value
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-bold",
						children: s.label
					})]
				}, s.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 lg:grid-cols-2",
				children: [renderSection("stars", Star, "text-warning", "Gihanga Stars — Follower Milestones", "Current milestones; revoked if the count drops"), renderSection("diamonds", Gem, "text-info", "Gihanga Diamonds — View Milestones", "Lifetime cumulative; once earned, never revoked")]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, {
				className: "p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCardHeader, {
					title: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "size-4 text-muted-foreground" }), " How it works"]
					}),
					subtitle: "Rules the badge engine follows"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-3.5 space-y-2 text-xs leading-relaxed text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-1 size-1.5 shrink-0 rounded-full bg-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								className: "text-foreground",
								children: "Follower badges"
							}), " are current milestones — if a user drops below a threshold, the badge is revoked (award record preserved for audit)."] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-1 size-1.5 shrink-0 rounded-full bg-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								className: "text-foreground",
								children: "View badges"
							}), " are lifetime cumulative — once earned, never revoked."] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-1 size-1.5 shrink-0 rounded-full bg-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Awards are computed authoritatively by the backend on follow/view events and by a 15-minute sweeper. The frontend never decides earned state." })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-1 size-1.5 shrink-0 rounded-full bg-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								"Eligible followers exclude deleted/suspended accounts. Eligible views sum",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
									className: "rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-primary",
									children: "Post.viewsCount"
								}),
								" ",
								"across published, non-removed posts (no double-counting across models)."
							] })]
						})
					]
				})]
			})
		]
	});
}
function DefinitionRow({ def, index, canEdit, saving, onChange, onSave }) {
	const colorMap = {
		red: "var(--color-danger)",
		gold: "var(--color-warning)",
		blue: "var(--color-info)",
		green: "var(--color-success)"
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
		initial: {
			opacity: 0,
			y: 8
		},
		animate: {
			opacity: 1,
			y: 0
		},
		transition: { delay: Math.min(index * .04, .3) },
		className: "flex flex-wrap items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-3.5 transition-colors hover:border-primary/25",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid size-10 shrink-0 place-items-center rounded-xl shadow-sm",
				style: {
					backgroundColor: colorMap[def.color] + "1f",
					color: colorMap[def.color]
				},
				children: def.icon === "star" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-4.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gem, { className: "size-4.5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "truncate text-[13px] font-bold text-foreground",
					children: def.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-0.5 text-[11px] tracking-wide text-muted-foreground uppercase",
					children: [
						def.metric,
						" · v",
						def.version
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "number",
						value: def.threshold,
						disabled: !canEdit,
						onChange: (e) => onChange({
							...def,
							threshold: Math.max(1, Math.floor(Number(e.target.value) || 1))
						}),
						className: "h-9 w-28 border-border bg-card text-right text-foreground tabular-nums"
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
						className: "h-9 px-2.5",
						title: "Save this badge",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: `size-3.5 ${saving ? "animate-pulse" : ""}` })
					})
				]
			})
		]
	});
}
//#endregion
export { AchievementsConfigPage as component };
