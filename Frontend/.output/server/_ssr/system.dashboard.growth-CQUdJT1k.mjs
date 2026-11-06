import { o as __toESM } from "../_runtime.mjs";
import { t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { An as Clock3, Dn as Coins, E as TrendingUp, V as Smartphone, _ as UserRoundCheck, b as UserCheck, ct as RefreshCw, lr as Activity, p as Users, un as FileText, vn as Download } from "../_libs/lucide-react.mjs";
import { n as api } from "./api-client-C-W0Sa9i.mjs";
import { r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { l as useAuth } from "./auth-context-CsN3soau.mjs";
import { E as formatCount } from "./router-BDN0UH9I.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { o as hasPermission } from "./permissions-Bg62BCbG.mjs";
import { a as AdminEmptyState, d as AdminStatCard, f as AdminStatSkeleton, i as AdminCardHeader, l as AdminSegmented, o as AdminErrorState, r as AdminCard, s as AdminPageHeader } from "./AdminUI-Cf1j1IrP.mjs";
import { i as AdminLineChart, t as AdminAreaChart } from "./AdminCharts-DonX7Jjc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/system.dashboard.growth-CQUdJT1k.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function percentChange(current, previous) {
	if (previous === 0) return current > 0 ? 100 : null;
	return (current - previous) / previous * 100;
}
function exportGrowthCsv(data, canViewPoints) {
	if (!data.series.length) {
		toast.error("There is no analytics data to export yet.");
		return;
	}
	const csv = [[
		"Date",
		"New users",
		"New posts",
		"Active users",
		"Content views",
		...canViewPoints ? ["Points activity"] : []
	], ...data.series.map((item) => [
		item.date,
		item.newUsers ?? "",
		item.newPosts ?? "",
		item.activeUsers,
		item.contentViews ?? "",
		...canViewPoints ? [item.pointsActivity ?? ""] : []
	])].map((row) => row.map((value) => `"${String(value).replaceAll("\"", "\"\"")}"`).join(",")).join("\r\n");
	const blob = new Blob(["﻿", csv], { type: "text/csv;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = `gihanga-platform-analytics-${data.range.days}d.csv`;
	document.body.appendChild(anchor);
	anchor.click();
	anchor.remove();
	URL.revokeObjectURL(url);
}
function GrowthPage() {
	const { staffUser } = useAuth();
	const canAnalytics = hasPermission(staffUser, "analytics.view");
	const canViewPoints = hasPermission(staffUser, "rewards.view");
	const canViewAccounts = hasPermission(staffUser, "accounts.view");
	const canViewContent = hasPermission(staffUser, "content.view") || hasPermission(staffUser, "moderation.content.view");
	const [days, setDays] = (0, import_react.useState)("30");
	const [metricView, setMetricView] = (0, import_react.useState)("all");
	const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
		queryKey: [
			"staff",
			"growth",
			days
		],
		queryFn: () => api.get(`/system/growth?days=${days}`, true),
		enabled: canAnalytics,
		staleTime: 6e4,
		refetchInterval: 12e4
	});
	const combinedData = (0, import_react.useMemo)(() => (data?.series ?? []).map((item) => ({
		label: (/* @__PURE__ */ new Date(`${item.date}T00:00:00`)).toLocaleDateString(void 0, {
			month: "short",
			day: "numeric"
		}),
		"New users": item.newUsers ?? 0,
		"New posts": item.newPosts ?? 0,
		"Active users": item.activeUsers,
		"Content views": item.contentViews ?? 0,
		"Points activity": item.pointsActivity ?? 0
	})), [data]);
	const visibleSeries = (0, import_react.useMemo)(() => {
		if (metricView === "users" && canViewAccounts) return [{
			key: "New users",
			name: "New users",
			colorIndex: 1
		}];
		if (metricView === "posts" && canViewContent) return [{
			key: "New posts",
			name: "New posts",
			colorIndex: 4
		}];
		if (metricView === "active") return [{
			key: "Active users",
			name: "Daily active users",
			colorIndex: 2
		}];
		if (metricView === "views" && canViewContent) return [{
			key: "Content views",
			name: "Recorded content views",
			colorIndex: 4
		}];
		if (metricView === "points" && canViewPoints) return [{
			key: "Points activity",
			name: "Points activity",
			colorIndex: 2
		}];
		return [
			...canViewAccounts ? [{
				key: "New users",
				name: "New users",
				colorIndex: 1
			}] : [],
			...canViewContent ? [{
				key: "New posts",
				name: "New posts",
				colorIndex: 4
			}] : [],
			{
				key: "Active users",
				name: "Daily active users",
				colorIndex: 2
			}
		];
	}, [
		metricView,
		canViewAccounts,
		canViewContent,
		canViewPoints
	]);
	const startLabel = data?.range?.from ? new Date(data.range.from).toLocaleDateString(void 0, {
		month: "short",
		day: "numeric",
		year: "numeric"
	}) : "—";
	const endLabel = data?.range?.to ? new Date(data.range.to).toLocaleDateString(void 0, {
		month: "short",
		day: "numeric",
		year: "numeric"
	}) : "—";
	const totals = data?.totals;
	const visibleMetricView = metricView === "points" && !canViewPoints || metricView === "users" && !canViewAccounts || (metricView === "posts" || metricView === "views") && !canViewContent ? "all" : metricView;
	if (!canAnalytics) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminPageHeader, {
			icon: TrendingUp,
			title: "Platform Growth",
			description: "Platform-level analytics and engagement trends.",
			accent: "aqua"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminEmptyState, {
			icon: Users,
			title: "Analytics permission required",
			description: "Growth analytics are available to Admins and Super Admins."
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminPageHeader, {
				icon: TrendingUp,
				title: "Platform Growth & Analytics",
				description: "Explore registration, publishing and points activity using live platform records.",
				accent: "aqua",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						className: "border-border",
						onClick: () => refetch(),
						disabled: isFetching,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `size-4 ${isFetching ? "animate-spin" : ""}` }), " Refresh"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "brand",
						onClick: () => data && exportGrowthCsv(data, canViewPoints),
						disabled: !data?.series.length,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), " Export CSV"]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, {
				className: "flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-bold tracking-wide text-muted-foreground uppercase",
						children: "Reporting period"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm font-semibold text-foreground",
						children: [
							startLabel,
							" – ",
							endLabel
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-0.5 text-[11px] text-muted-foreground",
						children: [
							"Compared with the immediately preceding ",
							days,
							"-day period."
						]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminSegmented, {
					options: [
						{
							id: "7",
							label: "7 days"
						},
						{
							id: "30",
							label: "30 days"
						},
						{
							id: "90",
							label: "90 days"
						}
					],
					value: days,
					onChange: (next) => setDays(next)
				})]
			}),
			isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatSkeleton, { count: 5 }),
			isError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminErrorState, {
				message: error instanceof Error ? error.message : "Analytics could not be loaded.",
				onRetry: () => refetch()
			}),
			data && !isError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `grid grid-cols-2 gap-4 ${canViewPoints ? "xl:grid-cols-5" : "xl:grid-cols-4"}`,
					children: [
						canViewAccounts && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatCard, {
							icon: Users,
							label: `New users (${days}d)`,
							value: formatCount(totals?.newUsers ?? 0),
							trend: percentChange(totals?.newUsers ?? 0, totals?.previousNewUsers ?? 0),
							hint: "Versus previous period",
							tone: "primary"
						}),
						canViewContent && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatCard, {
							icon: FileText,
							label: `New posts (${days}d)`,
							value: formatCount(totals?.newPosts ?? 0),
							trend: percentChange(totals?.newPosts ?? 0, totals?.previousNewPosts ?? 0),
							hint: "Versus previous period",
							tone: "info"
						}),
						canViewPoints && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatCard, {
							icon: Coins,
							label: `Points activity (${days}d)`,
							value: `${formatCount(totals?.pointsActivity ?? 0)} pts`,
							trend: percentChange(totals?.pointsActivity ?? 0, totals?.previousPointsActivity ?? 0),
							hint: "Gift and fee transaction volume",
							tone: "success"
						}),
						canViewAccounts && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatCard, {
							icon: UserRoundCheck,
							label: "Registered users",
							value: formatCount(totals?.totalUsers ?? 0),
							hint: "Current user accounts",
							tone: "accent"
						}),
						canViewAccounts && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatCard, {
							icon: Activity,
							label: "Creators",
							value: formatCount(totals?.totalCreators ?? 0),
							hint: "Current creator accounts",
							tone: "warning"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, {
					className: "p-4 sm:p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCardHeader, {
							title: "Platform activity",
							subtitle: "Daily counts from registered users, posts and points transactions"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminSegmented, {
							size: "sm",
							options: [
								{
									id: "all",
									label: canViewAccounts && canViewContent ? "Users + posts" : canViewAccounts ? "Users" : canViewContent ? "Posts" : "Activity"
								},
								...canViewAccounts ? [{
									id: "users",
									label: "Users"
								}] : [],
								...canViewContent ? [{
									id: "posts",
									label: "Posts"
								}] : [],
								{
									id: "active",
									label: "Active users"
								},
								...canViewContent ? [{
									id: "views",
									label: "Views"
								}] : [],
								...canViewPoints ? [{
									id: "points",
									label: "Points"
								}] : []
							],
							value: visibleMetricView,
							onChange: setMetricView
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4",
						children: combinedData.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminLineChart, {
							data: combinedData,
							series: visibleSeries,
							height: 320
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminEmptyState, {
							icon: Activity,
							title: "No activity in this period",
							description: "Analytics will appear here as platform activity is recorded."
						})
					})]
				}),
				canViewAccounts && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatCard, {
							icon: UserCheck,
							label: "Day 1 retention",
							value: data.retention?.day1?.rate == null ? "Not enough cohort data" : `${data.retention.day1.rate}%`,
							hint: `${formatCount(data.retention?.day1?.returnedUsers ?? 0)} of ${formatCount(data.retention?.day1?.cohortUsers ?? 0)} users returned on day 1`,
							tone: "aqua"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatCard, {
							icon: UserRoundCheck,
							label: "Day 7 retention",
							value: data.retention?.day7?.rate == null ? "Not enough cohort data" : `${data.retention.day7.rate}%`,
							hint: `${formatCount(data.retention?.day7?.returnedUsers ?? 0)} of ${formatCount(data.retention?.day7?.cohortUsers ?? 0)} users returned on day 7`,
							tone: "success"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatCard, {
							icon: Activity,
							label: "Tracked interaction sessions",
							value: formatCount(data.sessionInsights?.trackedSessions ?? 0),
							hint: `${formatCount(data.sessionInsights?.multiEventSessions ?? 0)} sessions included multiple events`,
							tone: "primary"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatCard, {
							icon: Clock3,
							label: "Observed interaction span",
							value: `${Number(data.sessionInsights?.averageObservedInteractionSpanMinutes || 0).toFixed(1)} min`,
							hint: "First-to-last event for recorded session IDs; not full visit duration",
							tone: "warning"
						})
					]
				}),
				!canViewAccounts && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 sm:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatCard, {
						icon: Activity,
						label: "Tracked interaction sessions",
						value: formatCount(data.sessionInsights?.trackedSessions ?? 0),
						hint: `${formatCount(data.sessionInsights?.multiEventSessions ?? 0)} sessions included multiple events`,
						tone: "primary"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatCard, {
						icon: Clock3,
						label: "Observed interaction span",
						value: `${Number(data.sessionInsights?.averageObservedInteractionSpanMinutes || 0).toFixed(1)} min`,
						hint: "First-to-last event for recorded session IDs; not full visit duration",
						tone: "warning"
					})]
				}),
				canViewAccounts && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-5 lg:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, {
						className: "p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCardHeader, {
							title: "Recorded device sessions",
							subtitle: "Device labels saved when users open account settings; partial coverage, not all app visits."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 space-y-3",
							children: (data.deviceBreakdown || []).length ? data.deviceBreakdown.map((device) => {
								const total = data.deviceBreakdown.reduce((sum, item) => sum + item.sessions, 0);
								const percent = total ? Math.round(device.sessions / total * 100) : 0;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-1 flex justify-between gap-3 text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold",
										children: device.device
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "tabular-nums text-muted-foreground",
										children: [
											formatCount(device.sessions),
											" · ",
											percent,
											"%"
										]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-2 overflow-hidden rounded-full bg-muted",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-full rounded-full bg-primary",
										style: { width: `${percent}%` }
									})
								})] }, device.device);
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminEmptyState, {
								icon: Smartphone,
								title: "No recorded device sessions",
								description: "Device insights appear when account settings save device-session records."
							})
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, {
						className: "p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCardHeader, {
							title: "Measurement notes",
							subtitle: "Read these before interpreting the metrics."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground",
							children: (data.dataNotes || []).map((note) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-primary",
									children: "•"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: note })]
							}, note))
						})]
					})]
				}),
				(canViewAccounts || canViewContent) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-5 lg:grid-cols-2",
					children: [canViewAccounts && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, {
						className: "p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCardHeader, {
								title: "User registrations",
								subtitle: `New accounts per day · ${days} days`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminAreaChart, {
									data: combinedData,
									dataKey: "New users",
									height: 240,
									colorIndex: 1
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 border-t border-border pt-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] font-semibold text-muted-foreground",
									children: "Daily average"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 font-display text-2xl font-extrabold text-foreground tabular-nums",
									children: [
										formatCount(Math.round((totals?.newUsers ?? 0) / Number(days))),
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs font-semibold text-muted-foreground",
											children: "users / day"
										})
									]
								})]
							})
						]
					}), canViewContent && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, {
						className: "p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCardHeader, {
								title: "Publishing activity",
								subtitle: `New posts per day · ${days} days`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminAreaChart, {
									data: combinedData,
									dataKey: "New posts",
									height: 240,
									colorIndex: 4
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 border-t border-border pt-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] font-semibold text-muted-foreground",
									children: "Daily average"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 font-display text-2xl font-extrabold text-foreground tabular-nums",
									children: [
										formatCount(Math.round((totals?.newPosts ?? 0) / Number(days))),
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs font-semibold text-muted-foreground",
											children: "posts / day"
										})
									]
								})]
							})
						]
					})]
				}),
				canViewPoints && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, {
					className: "p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCardHeader, {
							title: "Points economy activity",
							subtitle: "Absolute value of gift and fee transactions recorded during the selected period"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminAreaChart, {
								data: combinedData,
								dataKey: "Points activity",
								height: 230,
								colorIndex: 2
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] font-semibold text-muted-foreground",
								children: "Selected-period points activity"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 font-display text-2xl font-extrabold text-success tabular-nums",
								children: [
									formatCount(totals?.pointsActivity ?? 0),
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs font-semibold text-muted-foreground",
										children: "pts"
									})
								]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] font-semibold text-muted-foreground",
									children: "Previous period"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-sm font-bold text-foreground tabular-nums",
									children: [formatCount(totals?.previousPointsActivity ?? 0), " pts"]
								})]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-[11px] leading-relaxed text-muted-foreground",
					children: ["Analytics are based on persisted account, post and interaction records. ", canViewPoints ? "Points activity is a platform-points volume measure, not a cash-revenue or profit figure." : "Financial and points metrics are hidden unless explicitly assigned."]
				})
			] })
		]
	});
}
//#endregion
export { GrowthPage as component };
