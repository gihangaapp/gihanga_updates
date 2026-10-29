import { o as __toESM } from "../_runtime.mjs";
import { t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { R as Sparkles, T as TrendingUp, bn as Coins, nt as Save } from "../_libs/lucide-react.mjs";
import { h as Input } from "./router-CrddKQ7E.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { i as AdminCardHeader, r as AdminCard, s as AdminPageHeader } from "./AdminUI-Cf1j1IrP.mjs";
import { i as useSaveRewardConfig, r as useRewardConfig } from "./use-staff-finance-WqTrFAxk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/system.dashboard.rewards-CPaGH81C.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var RATE_LABELS = [
	{
		key: "upload",
		label: "Points per Post Upload",
		hint: "Awarded each time a creator publishes"
	},
	{
		key: "like",
		label: "Points per Like Received",
		hint: "Engagement reward on creator content"
	},
	{
		key: "follow",
		label: "Points per New Follower",
		hint: "Growth reward for audience building"
	},
	{
		key: "view_per_100",
		label: "Points per 100 Views",
		hint: "Scaled viewership reward"
	},
	{
		key: "share",
		label: "Points per Share",
		hint: "Reward for organic amplification"
	},
	{
		key: "daily_login",
		label: "Points per Daily Login",
		hint: "Retention incentive for all users"
	},
	{
		key: "referral",
		label: "Points per Referral Sign-up",
		hint: "Reward for growing the community"
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
	if (isLoading || !rates) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminPageHeader, {
			icon: Coins,
			title: "Reward Engine",
			description: "Set point accrual rates for creator actions and the point-to-cash conversion ratio.",
			accent: "warning"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-4",
			children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-24 animate-pulse rounded-2xl bg-muted/50" }, i))
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminPageHeader, {
				icon: Coins,
				title: "Kingdom Points Reward Engine",
				description: "Set point accrual rates for creator actions and the point-to-cash conversion ratio.",
				accent: "warning",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "lg",
					variant: "brand",
					onClick: save,
					disabled: saveConfig.isPending,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "mr-2 size-4" }), saveConfig.isPending ? "Saving…" : "Save configuration"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, {
				className: "p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCardHeader, {
					title: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-4 text-success" }), " Cash conversion ratio"]
					}),
					subtitle: "How Kingdom Points translate into withdrawable RWF"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							value: pointsToCashRate,
							onChange: (e) => setPointsToCashRate(Number(e.target.value) || 1),
							className: "h-11 w-32 border-border bg-card text-right text-foreground tabular-nums"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-2 text-sm font-semibold text-foreground/80",
							children: ["Kingdom Points = ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-display text-base font-extrabold text-primary",
								children: "1 RWF"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "ml-auto rounded-lg bg-success/10 px-3 py-1.5 text-xs font-bold text-success tabular-nums",
							children: [
								"10,000 pts → ",
								(1e4 / pointsToCashRate).toLocaleString(),
								" RWF"
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, {
				className: "p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCardHeader, {
					title: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4 text-primary" }), " Action accrual rates"]
					}),
					subtitle: "Points earned per action across the platform"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 grid gap-3 sm:grid-cols-2",
					children: RATE_LABELS.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: {
							opacity: 0,
							y: 8
						},
						animate: {
							opacity: 1,
							y: 0
						},
						transition: { delay: i * .05 },
						className: "flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-[13px] font-bold text-foreground",
								children: r.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-0.5 block text-[11px] text-muted-foreground",
								children: r.hint
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex shrink-0 items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								value: rates[r.key],
								onChange: (e) => setRates({
									...rates,
									[r.key]: Number(e.target.value) || 0
								}),
								className: "h-10 w-24 border-border bg-card text-right text-foreground tabular-nums"
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
