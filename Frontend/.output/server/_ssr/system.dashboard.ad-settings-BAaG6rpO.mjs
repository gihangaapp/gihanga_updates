import { o as __toESM } from "../_runtime.mjs";
import { r as cn, t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { Ft as LoaderCircle, R as Sparkles, Sn as Clock, bn as Coins, c as Wallet, d as Video, nt as Save, q as ShieldCheck, zn as Calculator } from "../_libs/lucide-react.mjs";
import { E as formatCount, h as Input } from "./router-CrddKQ7E.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { b as useUpdateSuperadminAdSettings, v as useSuperadminAdSettings } from "./use-ads-Fhv5Dm_N.mjs";
import { _ as AdminToggle, i as AdminCardHeader, r as AdminCard, s as AdminPageHeader } from "./AdminUI-Cf1j1IrP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/system.dashboard.ad-settings-BAaG6rpO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function rwf(n) {
	return `${n.toLocaleString()} RWF`;
}
function SettingRow({ title, description, checked, onToggle, tone = "primary" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 pr-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block text-sm font-bold text-foreground",
				children: title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-0.5 block text-xs leading-relaxed text-muted-foreground",
				children: description
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminToggle, {
			checked: Boolean(checked),
			onChange: onToggle
		})]
	});
}
function NumberField({ label, value, onChange, hint, icon: Icon, iconTone = "text-primary" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			className: "mb-1.5 flex items-center gap-1.5 text-xs font-bold tracking-wide text-muted-foreground uppercase",
			children: [Icon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: cn("size-3", iconTone) }), label]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			type: "number",
			value,
			onChange: (e) => onChange(Number(e.target.value)),
			className: "h-11 border-border bg-elevated text-foreground focus-visible:ring-primary/20"
		}),
		hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-[11px] text-muted-foreground",
			children: hint
		})
	] });
}
function SuperadminAdSettingsPage() {
	const { data: config, isLoading } = useSuperadminAdSettings();
	const updateSettings = useUpdateSuperadminAdSettings();
	const [form, setForm] = (0, import_react.useState)({});
	(0, import_react.useEffect)(() => {
		if (config) setForm(config);
	}, [config]);
	function handleChange(key, value) {
		setForm((prev) => ({
			...prev,
			[key]: value
		}));
	}
	function handleSave() {
		updateSettings.mutate(form, {
			onSuccess: () => toast.success("Advertising configuration saved successfully!"),
			onError: (err) => toast.error(err.message || "Failed to update advertising settings")
		});
	}
	const currentGpPerMin = Number(form.gpPerMinute) || 2e3;
	const currentRwfPerMin = Number(form.rwfPerMinute) || 2e3;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminPageHeader, {
			icon: Sparkles,
			title: "Ad Settings & Rates",
			description: "Superadmin privileges required — configure pricing per advertising minute, Gihanga Points conversion rates, video duration caps, and platform limits.",
			accent: "warning",
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "brand",
				size: "lg",
				disabled: updateSettings.isPending,
				onClick: handleSave,
				children: [updateSettings.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "mr-2 size-4" }), "Save all changes"]
			})
		}), isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-4",
			children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-44 animate-pulse rounded-2xl bg-muted/50" }, i))
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-5 lg:grid-cols-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, {
					className: "space-y-4 p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCardHeader, {
							title: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4 text-primary" }), " General platform controls"]
							}),
							subtitle: "Master switches for the advertising engine"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingRow, {
							title: "Enable advertising platform",
							description: "Master toggle for creating and running ad campaigns platform-wide.",
							checked: form.enabled,
							onToggle: () => handleChange("enabled", !form.enabled)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingRow, {
							title: "Enable Gihanga Points payment method",
							description: "Allows users and creators to pay for ads using their Gihanga Points balance.",
							checked: form.pointsEnabled,
							onToggle: () => handleChange("pointsEnabled", !form.pointsEnabled),
							tone: "warning"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, {
					className: "space-y-4 p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCardHeader, {
							title: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "size-4 text-warning" }), " Advertising pricing per minute"]
							}),
							subtitle: "What advertisers pay for each minute of exposure"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, {
								label: "Points / ad minute",
								icon: Coins,
								iconTone: "text-warning",
								value: form.gpPerMinute ?? 2e3,
								onChange: (v) => handleChange("gpPerMinute", v),
								hint: `1 minute = ${formatCount(currentGpPerMin)} GP`
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, {
								label: "RWF / ad minute",
								icon: Wallet,
								value: form.rwfPerMinute ?? 2e3,
								onChange: (v) => handleChange("rwfPerMinute", v),
								hint: `1 minute = ${rwf(currentRwfPerMin)}`
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-primary/20 bg-primary-soft/30 p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "flex items-center gap-1.5 text-xs font-bold text-primary",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calculator, { className: "size-3.5" }), " Dynamic package calculation preview"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 grid grid-cols-3 gap-2.5 text-center text-xs",
								children: [
									10,
									30,
									60
								].map((mins) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
									initial: {
										opacity: 0,
										y: 6
									},
									animate: {
										opacity: 1,
										y: 0
									},
									className: "rounded-lg border border-border/60 bg-card p-3 shadow-sm",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "block font-bold text-muted-foreground",
											children: [mins, " minutes"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "mt-1 block font-bold text-warning tabular-nums",
											children: [formatCount(mins * currentGpPerMin), " GP"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mt-0.5 block font-bold text-primary tabular-nums",
											children: rwf(mins * currentRwfPerMin)
										})
									]
								}, mins))
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, {
					className: "space-y-4 p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCardHeader, {
							title: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { className: "size-4 text-accent" }), " Video & quota limits"]
							}),
							subtitle: "Upload guardrails for ad creatives"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, {
							label: "Max video ad duration (seconds)",
							icon: Video,
							iconTone: "text-accent",
							value: form.maxVideoDurationSeconds ?? 120,
							onChange: (v) => handleChange("maxVideoDurationSeconds", v),
							hint: "Videos longer than this limit will be rejected at upload."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, {
								label: "Min quota minutes",
								value: form.minMinutes ?? 1,
								onChange: (v) => handleChange("minMinutes", v)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, {
								label: "Max quota minutes",
								value: form.maxMinutes ?? 180,
								onChange: (v) => handleChange("maxMinutes", v)
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, {
					className: "space-y-4 p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCardHeader, {
							title: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-4 text-info" }), " Campaign calendar limits"]
							}),
							subtitle: "How long campaigns can run and how often they're shown"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, {
								label: "Min campaign days",
								value: form.minCampaignDays ?? 1,
								onChange: (v) => handleChange("minCampaignDays", v)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, {
								label: "Max campaign days",
								value: form.maxCampaignDays ?? 30,
								onChange: (v) => handleChange("maxCampaignDays", v)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, {
							label: "Frequency cap per user (per hour)",
							icon: Clock,
							iconTone: "text-info",
							value: form.frequencyCapPerHour ?? 2,
							onChange: (v) => handleChange("frequencyCapPerHour", v),
							hint: "Maximum times the same user sees one ad per hour."
						})
					]
				})
			]
		})]
	});
}
//#endregion
export { SuperadminAdSettingsPage as component };
