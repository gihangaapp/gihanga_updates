import { o as __toESM } from "../_runtime.mjs";
import { r as cn, t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { G as ShieldCheck, I as Sparkles, c as Wallet, d as Video, et as Save, hn as Clock, jt as LoaderCircle, pn as Coins } from "../_libs/lucide-react.mjs";
import { h as Input, k as formatCount } from "./router-BS6G260b.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { b as useUpdateSuperadminAdSettings, v as useSuperadminAdSettings } from "./use-ads-B0t9iPcQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/system.dashboard.ad-settings-CKhknSSy.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function rwf(n) {
	return `${n.toLocaleString()} RWF`;
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
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center justify-between gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
				className: "font-display text-2xl font-bold tracking-tight text-foreground flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-6 text-amber-500" }), " Advertising Configuration & Pricing"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Superadmin privileges required — configure pricing per advertising minute, Gihanga Points conversion rates, video duration caps, and platform limits."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "brand",
				size: "lg",
				disabled: updateSettings.isPending,
				onClick: handleSave,
				children: [updateSettings.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "mr-2 size-4" }), "Save All Changes"]
			})]
		}), isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "py-12 text-center text-sm text-muted-foreground",
			children: "Loading advertising settings…"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-6 lg:grid-cols-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "text-sm font-bold text-foreground flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4 text-primary" }), " General Platform Controls"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between rounded-xl bg-muted/40 p-3.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-semibold text-foreground block",
								children: "Enable Advertising Platform"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: "Master toggle for creating and running ad campaigns platform-wide."
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => handleChange("enabled", !form.enabled),
								className: cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", form.enabled ? "bg-indigo-500" : "bg-white/10"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("absolute top-0.5 size-5 rounded-full bg-white transition-transform", form.enabled ? "translate-x-[22px]" : "translate-x-0.5") })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between rounded-xl bg-muted/40 p-3.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-semibold text-foreground block",
								children: "Enable Gihanga Points Payment Method"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: "Allows users and creators to pay for ads using their Gihanga Points balance."
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => handleChange("pointsEnabled", !form.pointsEnabled),
								className: cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", form.pointsEnabled ? "bg-amber-500" : "bg-white/10"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("absolute top-0.5 size-5 rounded-full bg-white transition-transform", form.pointsEnabled ? "translate-x-[22px]" : "translate-x-0.5") })
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "text-sm font-bold text-foreground flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "size-4 text-amber-500" }), " Advertising Pricing per Minute"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "mb-1.5 block text-xs font-semibold text-muted-foreground flex items-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "size-3 text-amber-500" }), " Points per Advertising Minute"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									value: form.gpPerMinute ?? 2e3,
									onChange: (e) => handleChange("gpPerMinute", Number(e.target.value))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "mt-1 text-[11px] text-muted-foreground block",
									children: [
										"Example: 1 minute = ",
										formatCount(currentGpPerMin),
										" GP"
									]
								})
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "mb-1.5 block text-xs font-semibold text-muted-foreground flex items-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "size-3 text-primary" }), " RWF per Advertising Minute"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									value: form.rwfPerMinute ?? 2e3,
									onChange: (e) => handleChange("rwfPerMinute", Number(e.target.value))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "mt-1 text-[11px] text-muted-foreground block",
									children: ["Example: 1 minute = ", rwf(currentRwfPerMin)]
								})
							] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-border/80 bg-elevated p-4 space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-bold text-foreground block",
								children: "Dynamic Package Calculation Preview"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-3 gap-2 pt-1 text-center text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-lg bg-card p-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground block font-bold",
												children: "10 Minutes"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-amber-500 font-bold block",
												children: [formatCount(10 * currentGpPerMin), " GP"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-primary font-bold block",
												children: rwf(10 * currentRwfPerMin)
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-lg bg-card p-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground block font-bold",
												children: "30 Minutes"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-amber-500 font-bold block",
												children: [formatCount(30 * currentGpPerMin), " GP"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-primary font-bold block",
												children: rwf(30 * currentRwfPerMin)
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-lg bg-card p-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground block font-bold",
												children: "60 Minutes"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-amber-500 font-bold block",
												children: [formatCount(60 * currentGpPerMin), " GP"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-primary font-bold block",
												children: rwf(60 * currentRwfPerMin)
											})
										]
									})
								]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "text-sm font-bold text-foreground flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { className: "size-4 text-primary" }), " Video & Quota Limits"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "mb-1.5 block text-xs font-semibold text-muted-foreground",
								children: "Maximum Video Ad Duration (Seconds)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								value: form.maxVideoDurationSeconds ?? 120,
								onChange: (e) => handleChange("maxVideoDurationSeconds", Number(e.target.value))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-[11px] text-muted-foreground",
								children: "Videos longer than this limit will be rejected at upload."
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "mb-1 block text-xs font-semibold text-muted-foreground",
								children: "Min Quota Minutes"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								value: form.minMinutes ?? 1,
								onChange: (e) => handleChange("minMinutes", Number(e.target.value))
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "mb-1 block text-xs font-semibold text-muted-foreground",
								children: "Max Quota Minutes"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								value: form.maxMinutes ?? 180,
								onChange: (e) => handleChange("maxMinutes", Number(e.target.value))
							})] })]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "text-sm font-bold text-foreground flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-4 text-primary" }), " Campaign Calendar Days Limits"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "mb-1 block text-xs font-semibold text-muted-foreground",
								children: "Minimum Campaign Days"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								value: form.minCampaignDays ?? 1,
								onChange: (e) => handleChange("minCampaignDays", Number(e.target.value))
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "mb-1 block text-xs font-semibold text-muted-foreground",
								children: "Maximum Campaign Days"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								value: form.maxCampaignDays ?? 30,
								onChange: (e) => handleChange("maxCampaignDays", Number(e.target.value))
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "mb-1.5 block text-xs font-semibold text-muted-foreground",
							children: "Frequency Cap per User (per Hour)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							value: form.frequencyCapPerHour ?? 2,
							onChange: (e) => handleChange("frequencyCapPerHour", Number(e.target.value))
						})] })
					]
				})
			]
		})]
	});
}
//#endregion
export { SuperadminAdSettingsPage as component };
