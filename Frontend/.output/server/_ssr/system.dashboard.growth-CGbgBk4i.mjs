import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { R as Sparkles, T as TrendingUp, Zn as Activity, bn as Coins, in as FileText, p as Users } from "../_libs/lucide-react.mjs";
import { n as api } from "./api-client-DZOxvrvB.mjs";
import { E as formatCount } from "./router-CrddKQ7E.mjs";
import { r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { d as AdminStatCard, f as AdminStatSkeleton, i as AdminCardHeader, r as AdminCard, s as AdminPageHeader } from "./AdminUI-Cf1j1IrP.mjs";
import { i as AdminLineChart, t as AdminAreaChart } from "./AdminCharts-CshwxwoM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/system.dashboard.growth-CGbgBk4i.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function GrowthPage() {
	const { data, isLoading } = useQuery({
		queryKey: ["staff", "growth"],
		queryFn: () => api.get("/system/growth", true)
	});
	const usersData = (0, import_react.useMemo)(() => (data?.series ?? []).map((d) => ({
		label: new Date(d.date).toLocaleDateString(void 0, {
			month: "short",
			day: "numeric"
		}),
		"New users": d.newUsers
	})), [data]);
	const combinedData = (0, import_react.useMemo)(() => (data?.series ?? []).map((d) => ({
		label: new Date(d.date).toLocaleDateString(void 0, {
			month: "short",
			day: "numeric"
		}),
		"New users": d.newUsers,
		"New posts": d.newPosts
	})), [data]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminPageHeader, {
			icon: TrendingUp,
			title: "Platform Growth",
			description: "Real signups, posts, and revenue over the last 30 days.",
			accent: "success"
		}), isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatSkeleton, { count: 4 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-4 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatCard, {
						icon: Users,
						label: "Total users",
						value: formatCount(data?.totals.totalUsers ?? 0),
						tone: "primary",
						delay: 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatCard, {
						icon: Sparkles,
						label: "Total creators",
						value: formatCount(data?.totals.totalCreators ?? 0),
						tone: "accent",
						delay: .06
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatCard, {
						icon: Users,
						label: "New users (30d)",
						value: formatCount(data?.totals.newUsers30d ?? 0),
						tone: "aqua",
						delay: .12
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatCard, {
						icon: FileText,
						label: "New posts (30d)",
						value: formatCount(data?.totals.newPosts30d ?? 0),
						tone: "info",
						delay: .18
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, {
				className: "p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCardHeader, {
					title: "Signups & content creation",
					subtitle: "Daily new users and posts over the last 30 days",
					action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3 text-[11px] font-semibold text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 rounded-full bg-chart-1" }), " Users"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 rounded-full bg-chart-4" }), " Posts"]
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminLineChart, {
						data: combinedData,
						series: [{
							key: "New users",
							name: "New users",
							colorIndex: 1
						}, {
							key: "New posts",
							name: "New posts",
							colorIndex: 4
						}],
						height: 300
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 lg:grid-cols-[1.6fr_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, {
					className: "p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCardHeader, {
						title: "Member growth",
						subtitle: "New users per day"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminAreaChart, {
							data: usersData,
							dataKey: "New users",
							height: 240
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, {
					className: "flex flex-col justify-between p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCardHeader, {
							title: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "size-4 text-success" }), " Platform revenue (30d)"]
							}),
							subtitle: "From gifts and ad spend combined"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-display text-4xl font-extrabold tracking-tight text-success tabular-nums",
								children: [formatCount(data?.totals.revenue30d ?? 0), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-1.5 text-base font-bold text-muted-foreground",
									children: "pts"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 flex items-center gap-2 rounded-xl bg-success/10 px-3.5 py-2.5 text-xs font-semibold text-success",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "size-4" }), "Kingdom Points economy across gifting and ads"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 grid grid-cols-2 gap-3 border-t border-border pt-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] font-semibold text-muted-foreground",
								children: "Avg / day"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-0.5 font-display text-lg font-extrabold text-foreground tabular-nums",
								children: formatCount(Math.round((data?.totals.newUsers30d ?? 0) / 30))
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] font-semibold text-muted-foreground",
								children: "Posts / day"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-0.5 font-display text-lg font-extrabold text-foreground tabular-nums",
								children: formatCount(Math.round((data?.totals.newPosts30d ?? 0) / 30))
							})] })]
						})
					]
				})]
			})
		] })]
	});
}
//#endregion
export { GrowthPage as component };
