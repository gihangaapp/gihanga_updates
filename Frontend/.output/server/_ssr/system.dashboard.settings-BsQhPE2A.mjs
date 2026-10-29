import { o as __toESM } from "../_runtime.mjs";
import { r as cn, t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { D as Trash2, O as ToggleLeft, Z as Settings, c as Wallet, ct as Plus, q as ShieldCheck, zt as Layers } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { _ as AdminToggle, i as AdminCardHeader, n as AdminBadge, r as AdminCard, s as AdminPageHeader } from "./AdminUI-Cf1j1IrP.mjs";
import { c as useSetMomoVisibility, d as useStaffSettings, f as useUpdateCategory, i as useDeleteCategory, l as useStaffCategories, n as useCreateCategory, s as useSetFeatureFlag } from "./use-staff-management-92jpC5YJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/system.dashboard.settings-BsQhPE2A.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function MomoVisibilityCard() {
	const { data } = useStaffSettings();
	const setMomo = useSetMomoVisibility();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, {
		className: "p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCardHeader, {
			title: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "size-4 text-primary" }), " MTN MoMo visibility"]
			}),
			subtitle: "Controls whether the deposit/withdraw buttons show up in users' wallets. Turn this off to hide MoMo entirely while credentials aren't configured yet, without touching any code."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-bold text-foreground",
				children: "Show MoMo deposit/withdraw to users"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 text-xs text-muted-foreground",
				children: data?.momoVisible === false ? "Currently hidden from wallets" : "Currently visible in wallets"
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminToggle, {
				checked: data?.momoVisible ?? true,
				onChange: () => setMomo.mutate(!(data?.momoVisible ?? true), {
					onSuccess: () => toast.success("Updated"),
					onError: (err) => toast.error(err.message || "Failed to update")
				})
			})]
		})]
	});
}
function FlagRow({ label, flagKey, enabled }) {
	const setFlag = useSetFeatureFlag();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-bold text-foreground",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 font-mono text-[11px] text-muted-foreground",
				children: flagKey
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminBadge, {
				tone: enabled ? "success" : "muted",
				dot: true,
				children: enabled ? "On" : "Off"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminToggle, {
				checked: enabled,
				onChange: () => setFlag.mutate({
					key: flagKey,
					value: !enabled
				}, {
					onSuccess: () => toast.success(`${label} ${!enabled ? "enabled" : "disabled"}`),
					onError: (err) => toast.error(err.message || "Failed to update")
				})
			})]
		})]
	});
}
function FeatureFlagsCard() {
	const { data } = useStaffSettings();
	const flags = data?.flags ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, {
		className: "p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCardHeader, {
			title: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleLeft, { className: "size-4 text-accent" }), " Feature flags"]
			}),
			subtitle: "Kill-switches for major platform features."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 space-y-2.5",
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
		})]
	});
}
function CategoriesCard() {
	const { data } = useStaffCategories();
	const createCategory = useCreateCategory();
	const updateCategory = useUpdateCategory();
	const deleteCategory = useDeleteCategory();
	const [name, setName] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, {
		className: "p-5 lg:col-span-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCardHeader, {
				title: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "size-4 text-info" }), " Content categories"]
				}),
				subtitle: "Used to organize Explore/Trending topics."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: name,
					onChange: (e) => setName(e.target.value),
					onKeyDown: (e) => e.key === "Enter" && name.trim() && createCategory.mutate({ name: name.trim() }, {
						onSuccess: () => {
							toast.success("Category added");
							setName("");
						},
						onError: (err) => toast.error(err.message || "Failed to add")
					}),
					placeholder: "New category name…",
					className: "h-10 flex-1 rounded-xl border border-border bg-elevated px-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "brand",
					className: "h-10",
					disabled: !name.trim() || createCategory.isPending,
					onClick: () => createCategory.mutate({ name: name.trim() }, {
						onSuccess: () => {
							toast.success("Category added");
							setName("");
						},
						onError: (err) => toast.error(err.message || "Failed to add")
					}),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Add"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap gap-2",
				children: [(data?.categories ?? []).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: cn("flex items-center gap-1.5 rounded-lg border border-border/60 px-2.5 py-1.5 text-xs font-semibold", c.active ? "bg-primary-soft/50 text-foreground" : "bg-muted/40 text-muted-foreground line-through"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						title: c.active ? "Click to deactivate" : "Click to activate",
						onClick: () => updateCategory.mutate({
							id: c._id,
							active: !c.active
						}, { onSuccess: () => toast.success("Updated") }),
						children: c.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": `Delete ${c.name}`,
						onClick: () => deleteCategory.mutate(c._id, {
							onSuccess: () => toast.success(`Deleted ${c.name}`),
							onError: (err) => toast.error(err.message || "Failed to delete")
						}),
						className: "text-muted-foreground transition-colors hover:text-danger",
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
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminPageHeader, {
			icon: Settings,
			title: "Platform Settings",
			description: "Super Admin only — global configuration for the whole platform.",
			accent: "warning",
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex items-center gap-1.5 rounded-xl bg-warning/10 px-3.5 py-2 text-xs font-bold text-warning",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4" }), " Restricted access"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-5 lg:grid-cols-2",
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
