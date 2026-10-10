import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { I as Sparkles, T as TrendingUp, p as Users } from "../_libs/lucide-react.mjs";
import { n as api } from "./api-client-C-02deeD.mjs";
import { k as formatCount } from "./router-NU7wHj2a.mjs";
import { r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as Area, i as XAxis, l as ResponsiveContainer, o as CartesianGrid, r as YAxis, t as AreaChart, u as Tooltip } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/system.dashboard.growth-nlirmJOB.js
var import_jsx_runtime = require_jsx_runtime();
var tooltipStyle = {
	background: "#0D111C",
	border: "1px solid rgba(255,255,255,0.1)",
	borderRadius: 12,
	fontSize: 12,
	color: "#fff"
};
function GrowthPage() {
	const { data, isLoading } = useQuery({
		queryKey: ["staff", "growth"],
		queryFn: () => api.get("/system/growth", true)
	});
	const chartData = (data?.series ?? []).map((d) => ({
		day: new Date(d.date).toLocaleDateString(void 0, {
			month: "short",
			day: "numeric"
		}),
		newUsers: d.newUsers,
		revenue: d.revenue
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
			className: "flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-6 text-success" }), " Platform Growth"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Real signups, posts, and revenue over the last 30 days."
		})] }), isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Loading…"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-3 sm:grid-cols-4",
				children: [
					{
						label: "Total users",
						value: data?.totals.totalUsers ?? 0,
						icon: Users
					},
					{
						label: "Total creators",
						value: data?.totals.totalCreators ?? 0,
						icon: Sparkles
					},
					{
						label: "New users (30d)",
						value: data?.totals.newUsers30d ?? 0,
						icon: TrendingUp
					},
					{
						label: "New posts (30d)",
						value: data?.totals.newPosts30d ?? 0,
						icon: TrendingUp
					}
				].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border bg-card p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(s.icon, { className: "mb-2 size-4 text-primary" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-2xl font-extrabold text-foreground",
							children: formatCount(s.value)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 text-xs text-muted-foreground",
							children: s.label
						})
					]
				}, s.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border bg-card p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-4 text-sm font-bold text-foreground",
					children: "New users, last 30 days"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-56 w-full",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
							data: chartData,
							margin: {
								left: -18,
								right: 6,
								top: 6
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
									id: "growthFill",
									x1: "0",
									y1: "0",
									x2: "0",
									y2: "1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
										offset: "0%",
										stopColor: "#818CF8",
										stopOpacity: .5
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
										offset: "100%",
										stopColor: "#818CF8",
										stopOpacity: .02
									})]
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									stroke: "rgba(255,255,255,0.06)",
									vertical: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "day",
									tickLine: false,
									axisLine: false,
									fontSize: 11,
									stroke: "#64748b"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									tickLine: false,
									axisLine: false,
									fontSize: 11,
									width: 40,
									stroke: "#64748b"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: tooltipStyle }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
									type: "monotone",
									dataKey: "newUsers",
									stroke: "#818CF8",
									strokeWidth: 2.5,
									fill: "url(#growthFill)"
								})
							]
						})
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border bg-card p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-1 text-sm font-bold text-foreground",
						children: "Platform revenue (30d)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-3xl font-extrabold text-success",
						children: [formatCount(data?.totals.revenue30d ?? 0), " pts"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: "From gifts and ad spend combined."
					})
				]
			})
		] })]
	});
}
//#endregion
export { GrowthPage as component };
