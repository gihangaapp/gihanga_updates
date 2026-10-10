import { o as __toESM } from "../_runtime.mjs";
import { t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { et as Save } from "../_libs/lucide-react.mjs";
import { h as Input } from "./router-BS6G260b.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as useSaveRewardConfig, r as useRewardConfig } from "./use-staff-finance-CuzUXoO4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/system.dashboard.rewards-BngGBJ3F.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var RATE_LABELS = [
	{
		key: "upload",
		label: "Points per Post Upload"
	},
	{
		key: "like",
		label: "Points per Like Received"
	},
	{
		key: "follow",
		label: "Points per New Follower"
	},
	{
		key: "view_per_100",
		label: "Points per 100 Views"
	},
	{
		key: "share",
		label: "Points per Share"
	},
	{
		key: "daily_login",
		label: "Points per Daily Login"
	},
	{
		key: "referral",
		label: "Points per Referral Sign-up"
	}
];
function RewardsConfigPage() {
	const { data, isLoading } = useRewardConfig();
	const saveConfig = useSaveRewardConfig();
	const [rates, setRates] = (0, import_react.useState)(null);
	const [pointsToCashRate, setPointsToCashRate] = (0, import_react.useState)(100);
	(0, import_react.useEffect)(() => {
		if (data) {
			setRates(data.rates);
			setPointsToCashRate(data.pointsToCashRate);
		}
	}, [data]);
	function save() {
		if (!rates) return;
		saveConfig.mutate({
			rates,
			pointsToCashRate
		}, {
			onSuccess: () => toast.success("Kingdom Points reward rates updated platform-wide."),
			onError: (err) => toast.error(err.message || "Failed to save")
		});
	}
	if (isLoading || !rates) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "py-10 text-center text-sm text-muted-foreground",
		children: "Loading reward configuration…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl font-bold text-foreground tracking-tight",
					children: "Kingdom Points Reward Engine Configuration"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Set point accrual rates for creator actions and the point-to-cash conversion ratio."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					className: "bg-indigo-600 font-semibold text-foreground hover:bg-indigo-500",
					onClick: save,
					disabled: saveConfig.isPending,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "mr-1.5 size-4" }),
						" ",
						saveConfig.isPending ? "Saving…" : "Save Configuration"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4 rounded-3xl border border-border bg-card p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-base font-bold text-foreground",
					children: "Cash Conversion Ratio"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "number",
						value: pointsToCashRate,
						onChange: (e) => setPointsToCashRate(Number(e.target.value) || 1),
						className: "h-10 w-32 border-border bg-elevated text-foreground"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm text-foreground/80",
						children: "Kingdom Points = 1 RWF"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4 rounded-3xl border border-border bg-card p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-base font-bold text-foreground",
					children: "Action Accrual Rates"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-4 sm:grid-cols-2",
					children: RATE_LABELS.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between rounded-2xl border border-border bg-elevated/60 p-3.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-semibold text-foreground/80",
							children: r.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								value: rates[r.key],
								onChange: (e) => setRates({
									...rates,
									[r.key]: Number(e.target.value) || 0
								}),
								className: "h-9 w-24 border-border bg-card text-right text-foreground"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-bold text-primary",
								children: "pts"
							})]
						})]
					}, r.key))
				})]
			})
		]
	});
}
//#endregion
export { RewardsConfigPage as component };
