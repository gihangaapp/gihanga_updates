import { o as __toESM } from "../_runtime.mjs";
import { r as cn, t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { E as Trash2, Pt as Layers, Y as Settings, c as Wallet, ot as Plus } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { c as useSetMomoVisibility, d as useStaffSettings, f as useUpdateCategory, i as useDeleteCategory, l as useStaffCategories, n as useCreateCategory, s as useSetFeatureFlag } from "./use-staff-management-DwJBpOj5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/system.dashboard.settings-CEGbR2sa.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function MomoVisibilityCard() {
	const { data } = useStaffSettings();
	const setMomo = useSetMomoVisibility();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-card p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "mb-1 flex items-center gap-2 text-sm font-bold text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "size-4" }), " MTN MoMo visibility"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-4 text-xs text-muted-foreground",
				children: "Controls whether the deposit/withdraw buttons show up in users' wallets. Turn this off to hide MoMo entirely while credentials aren't configured yet, without touching any code."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between rounded-xl bg-muted/40 p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm font-semibold text-foreground",
					children: "Show MoMo deposit/withdraw to users"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setMomo.mutate(!(data?.momoVisible ?? true), { onSuccess: () => toast.success("Updated") }),
					className: cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", data?.momoVisible ? "bg-indigo-500" : "bg-white/10"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("absolute top-0.5 size-5 rounded-full bg-white transition-transform", data?.momoVisible ? "translate-x-[22px]" : "translate-x-0.5") })
				})]
			})
		]
	});
}
function FeatureFlagsCard() {
	const { data } = useStaffSettings();
	const flags = data?.flags ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-card p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "mb-1 flex items-center gap-2 text-sm font-bold text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-4" }), " Feature flags"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-4 text-xs text-muted-foreground",
				children: "Kill-switches for major platform features."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-2",
				children: [
					{
						key: "live_streaming_enabled",
						label: "Live streaming"
					},
					{
						key: "ads_enabled",
						label: "Ads"
					},
					{
						key: "gifting_enabled",
						label: "Gifting"
					}
				].map((f) => {
					const enabled = flags.find((x) => x.key === f.key)?.value ?? true;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlagRow, {
						label: f.label,
						flagKey: f.key,
						enabled
					}, f.key);
				})
			})
		]
	});
}
function FlagRow({ label, flagKey, enabled }) {
	const setFlag = useSetFeatureFlag();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between rounded-xl bg-muted/40 p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-sm font-semibold text-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => setFlag.mutate({
				key: flagKey,
				value: !enabled
			}, { onSuccess: () => toast.success("Updated") }),
			className: cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", enabled ? "bg-indigo-500" : "bg-white/10"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("absolute top-0.5 size-5 rounded-full bg-white transition-transform", enabled ? "translate-x-[22px]" : "translate-x-0.5") })
		})]
	});
}
function CategoriesCard() {
	const { data } = useStaffCategories();
	const createCategory = useCreateCategory();
	const updateCategory = useUpdateCategory();
	const deleteCategory = useDeleteCategory();
	const [name, setName] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-card p-5 lg:col-span-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "mb-1 flex items-center gap-2 text-sm font-bold text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "size-4" }), " Content categories"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-4 text-xs text-muted-foreground",
				children: "Used to organize Explore/Trending topics."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: name,
					onChange: (e) => setName(e.target.value),
					placeholder: "New category name…",
					className: "h-10 flex-1 rounded-xl border border-border bg-card px-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "brand",
					disabled: !name.trim() || createCategory.isPending,
					onClick: () => createCategory.mutate({ name: name.trim() }, { onSuccess: () => {
						toast.success("Category added");
						setName("");
					} }),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Add"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [(data?.categories ?? []).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: cn("flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold", c.active ? "bg-muted text-foreground/90" : "bg-muted/40 text-muted-foreground line-through"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => updateCategory.mutate({
							id: c._id,
							active: !c.active
						}),
						children: c.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": `Delete ${c.name}`,
						onClick: () => deleteCategory.mutate(c._id),
						className: "text-muted-foreground hover:text-danger",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3" })
					})]
				}, c._id)), !data?.categories.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "No categories yet."
				})]
			})
		]
	});
}
function PlatformSettingsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
			className: "flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-6 text-warning" }), " Platform Settings"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Super Admin only — global configuration for the whole platform."
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 lg:grid-cols-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MomoVisibilityCard, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeatureFlagsCard, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoriesCard, {})
			]
		})]
	});
}
//#endregion
export { PlatformSettingsPage as component };
