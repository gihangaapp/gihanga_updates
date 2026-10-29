import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { Jn as ArrowRight, Kt as History, Lt as Lightbulb, N as Target, R as Sparkles, Sn as Clock, T as TrendingUp, Zn as Activity, an as Eye, c as Wallet, g as UserPlus, in as FileText, p as Users, qn as ArrowUpRight, st as Radio, w as TriangleAlert } from "../_libs/lucide-react.mjs";
import { n as api } from "./api-client-DZOxvrvB.mjs";
import { E as formatCount, j as timeAgo } from "./router-CrddKQ7E.mjs";
import { r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { l as useAuth } from "./auth-context-CuF8V2_l.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { r as hasPermission, t as ROLE_LABEL } from "./permissions-CGE25KsA.mjs";
import { d as AdminStatCard, f as AdminStatSkeleton, i as AdminCardHeader, n as AdminBadge, r as AdminCard } from "./AdminUI-Cf1j1IrP.mjs";
import { a as AdminProgressRow, i as AdminLineChart, n as AdminBarChart, r as AdminDonutChart } from "./AdminCharts-CshwxwoM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/system.dashboard.index-BCfPM15I.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useOverview() {
	return useQuery({
		queryKey: ["staff", "overview"],
		queryFn: async () => {
			try {
				return await api.get("/system/overview", true);
			} catch {
				return {
					stats: {},
					role: ""
				};
			}
		},
		refetchInterval: 6e4
	});
}
function useGrowth(enabled) {
	return useQuery({
		queryKey: ["staff", "growth"],
		queryFn: async () => {
			try {
				return await api.get("/system/growth", true);
			} catch {
				return null;
			}
		},
		enabled
	});
}
function useRecentAudit(enabled) {
	return useQuery({
		queryKey: [
			"staff",
			"audit",
			"dashboard-recent"
		],
		queryFn: async () => {
			try {
				return await api.get("/system/audit?page=1", true);
			} catch {
				return null;
			}
		},
		enabled
	});
}
function weekTrend(series, key) {
	if (!series || series.length < 8) return null;
	const now = series.slice(-7).reduce((a, d) => a + (Number(d[key]) || 0), 0);
	const before = series.slice(-14, -7).reduce((a, d) => a + (Number(d[key]) || 0), 0);
	if (!before) return now > 0 ? 100 : null;
	return (now - before) / before * 100;
}
function actionTone(action) {
	if (/ban|reject|remove|demote|force/i.test(action)) return "danger";
	if (/approve|verify|promote|create|grant/i.test(action)) return "success";
	if (/suspend|pause|warn|escalate/i.test(action)) return "warning";
	if (/login|view/i.test(action)) return "muted";
	return "primary";
}
function actionLabel(action) {
	return action.split(".").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" · ");
}
function DashboardIndex() {
	const { staffUser } = useAuth();
	const { data: overview, isLoading } = useOverview();
	const canAnalytics = hasPermission(staffUser, "analytics.view");
	const canAuditAll = hasPermission(staffUser, "audit.viewAll");
	const { data: growth } = useGrowth(canAnalytics);
	const { data: audit } = useRecentAudit(canAuditAll || hasPermission(staffUser, "audit.viewOwn"));
	const stats = overview?.stats ?? {};
	const lineData = (0, import_react.useMemo)(() => {
		return (growth?.series ?? []).map((d) => ({
			label: new Date(d.date).toLocaleDateString(void 0, {
				month: "short",
				day: "numeric"
			}),
			"New posts": d.newPosts,
			"New users": d.newUsers
		}));
	}, [growth]);
	const barData = (0, import_react.useMemo)(() => {
		const series = growth?.series ?? [];
		if (series.length) {
			const weeks = [];
			const chunk = Math.ceil(series.length / 5) || 1;
			for (let i = 0; i < series.length; i += chunk) {
				const slice = series.slice(i, i + chunk);
				weeks.push({
					label: `W${Math.floor(i / chunk) + 1}`,
					value: slice.reduce((a, d) => a + d.newUsers, 0)
				});
			}
			return weeks;
		}
		return [];
	}, [growth]);
	const donutData = (0, import_react.useMemo)(() => [
		{
			name: "Posts",
			value: Number(stats["totalPosts"] ?? 0)
		},
		{
			name: "Live streams",
			value: Number(stats["liveNow"] ?? 0)
		},
		{
			name: "Ad campaigns",
			value: Number(stats["pendingCampaigns"] ?? 0)
		}
	], [stats]);
	const donutTotal = donutData.reduce((a, d) => a + d.value, 0) || 1;
	const hasDonutData = donutTotal > 1 || donutData.some((d) => d.value > 0);
	const usersTrend = weekTrend(growth?.series ?? [], "newUsers");
	const postsTrend = weekTrend(growth?.series ?? [], "newPosts");
	const revenueTrend = weekTrend(growth?.series ?? [], "revenue");
	const firstName = staffUser?.name?.split(" ")[0] ?? "there";
	const role = staffUser?.role ?? "";
	const today = (/* @__PURE__ */ new Date()).toLocaleDateString(void 0, {
		weekday: "long",
		month: "long",
		day: "numeric"
	});
	const recentEntries = (audit?.entries ?? []).slice(0, 6);
	const pendingReports = Number(stats["pendingReports"] ?? 0);
	const pendingPayments = Number(stats["pendingPayments"] ?? 0);
	const pendingCampaigns = Number(stats["pendingCampaigns"] ?? 0);
	const queueMax = Math.max(pendingReports, pendingPayments, pendingCampaigns, 1);
	const queues = [
		{
			label: "Moderation reports",
			value: pendingReports,
			display: String(pendingReports),
			meta: "Awaiting a staff decision",
			to: "/system/dashboard/moderation",
			colorIndex: 1
		},
		{
			label: "Payment settlements",
			value: pendingPayments,
			display: String(pendingPayments),
			meta: "MTN MoMo deposits & withdrawals",
			to: "/system/dashboard/payments",
			colorIndex: 4
		},
		{
			label: "Ad campaign reviews",
			value: pendingCampaigns,
			display: String(pendingCampaigns),
			meta: "Sponsored content to approve",
			to: "/system/dashboard/campaigns",
			colorIndex: 2
		}
	];
	const hour = (/* @__PURE__ */ new Date()).getHours();
	const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
				initial: {
					opacity: 0,
					y: -8
				},
				animate: {
					opacity: 1,
					y: 0
				},
				transition: { duration: .4 },
				className: "flex flex-wrap items-end justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase",
						children: today
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "mt-1 font-display text-[26px] leading-tight font-extrabold tracking-tight text-foreground",
						children: [
							greeting,
							", ",
							firstName,
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-gradient-brand",
								children: "👋"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: [
							"Signed in as",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-bold text-primary",
								children: ROLE_LABEL[role] || role
							}),
							" — here's what's happening on Gihanga Updates."
						]
					})
				] }), staffUser?.role === "superadmin" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/system/register",
					className: "press gradient-brand flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-bold text-primary-foreground shadow-glow",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "size-4" }), " Register Administrator"]
				})]
			}),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatSkeleton, { count: 4 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-4 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatCard, {
						icon: Users,
						label: "Total users",
						value: formatCount(stats["totalUsers"] ?? 0),
						trend: usersTrend,
						hint: `${formatCount(stats["newUsers24h"] ?? 0)} joined in the last 24h`,
						tone: "primary",
						delay: 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatCard, {
						icon: FileText,
						label: "Total posts",
						value: formatCount(stats["totalPosts"] ?? 0),
						trend: postsTrend,
						hint: `${formatCount(stats["newUsers24h"] ?? 0)}+ creators active daily`,
						tone: "aqua",
						delay: .06
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatCard, {
						icon: TriangleAlert,
						label: "Pending reports",
						value: formatCount(stats["pendingReports"] ?? 0),
						hint: "Community flags awaiting review",
						tone: "danger",
						delay: .12
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatCard, {
						icon: Wallet,
						label: "Points revenue (30d)",
						value: `${formatCount(growth?.totals?.revenue30d ?? 0)}`,
						trend: revenueTrend,
						hint: "From gifts and ad spend combined",
						tone: "success",
						delay: .18
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 xl:grid-cols-[1.5fr_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, {
					className: "p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCardHeader, {
						title: "Platform activity",
						subtitle: "New posts and users over the last 30 days",
						action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 text-[11px] font-semibold text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 rounded-full bg-chart-1" }), " Posts"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 rounded-full bg-chart-4" }), " Users"]
							})]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4",
						children: lineData.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminLineChart, {
							data: lineData,
							series: [{
								key: "New posts",
								name: "New posts",
								colorIndex: 1
							}, {
								key: "New users",
								name: "New users",
								colorIndex: 4
							}],
							height: 272
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid h-[272px] place-items-center rounded-xl bg-muted/30 text-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "mx-auto mb-2 size-7 text-muted-foreground/60" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-semibold text-muted-foreground",
									children: canAnalytics ? "No analytics data yet" : "Analytics permission required"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-muted-foreground/70",
									children: "Activity charts appear once growth data is available."
								})
							] })
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, {
						className: "p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCardHeader, {
							title: "Content mix",
							subtitle: "Distribution across the platform"
						}), hasDonutData ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 grid grid-cols-[150px_1fr] items-center gap-4 sm:grid-cols-[160px_1fr]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminDonutChart, {
								data: donutData,
								centerLabel: "Pieces tracked",
								centerValue: formatCount(donutTotal),
								height: 150
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-2.5",
								children: donutData.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-2 text-xs font-semibold text-foreground/80",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "size-2.5 rounded-sm",
											style: { background: `var(--chart-${i + 1})` }
										}), d.name]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs font-bold text-foreground tabular-nums",
										children: [(d.value / donutTotal * 100).toFixed(0), "%"]
									})]
								}, d.name))
							})]
						}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-col items-center justify-center gap-2 py-8 text-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid size-11 place-items-center rounded-2xl bg-muted text-muted-foreground",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[13px] font-semibold text-muted-foreground",
									children: "Nothing to distribute yet"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-muted-foreground/70",
									children: "The mix appears once content exists on the platform."
								})
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, {
						className: "p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCardHeader, {
							title: "Needs attention",
							subtitle: "Queues waiting on staff",
							action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/system/dashboard/moderation",
								className: "text-xs font-bold text-primary hover:underline",
								children: "View all"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-5 space-y-5",
							children: queues.map((q, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminProgressRow, {
								label: q.label,
								value: q.value / queueMax * 100,
								display: q.display,
								meta: q.meta,
								delay: i * .08,
								colorIndex: q.colorIndex
							}, q.label))
						})]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 xl:grid-cols-[1fr_1.5fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, {
					className: "p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCardHeader, {
							title: "Audience growth",
							subtitle: "New members per week",
							action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/system/dashboard/growth",
								className: "flex items-center gap-1 text-xs font-bold text-primary hover:underline",
								children: ["Details ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-3.5" })]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4",
							children: barData.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminBarChart, {
								data: barData,
								height: 232
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid h-[232px] place-items-center rounded-xl bg-muted/30 text-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "mx-auto mb-2 size-7 text-muted-foreground/60" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-semibold text-muted-foreground",
									children: "Growth data coming soon"
								})] })
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl bg-muted/40 p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] font-semibold text-muted-foreground",
									children: "New members (30d)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-0.5 font-display text-lg font-extrabold text-foreground tabular-nums",
									children: formatCount(growth?.totals?.newUsers30d ?? stats["newUsers24h"] ?? 0)
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl bg-muted/40 p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] font-semibold text-muted-foreground",
									children: "Creators"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-0.5 font-display text-lg font-extrabold text-foreground tabular-nums",
									children: formatCount(growth?.totals?.totalCreators ?? 0)
								})]
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, {
					className: "overflow-hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-3 p-5 pb-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCardHeader, {
							title: "Recent staff activity",
							subtitle: "Latest actions from the administration team"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/system/dashboard/audit",
							className: "shrink-0 text-xs font-bold text-primary hover:underline",
							children: "View all"
						})]
					}), recentEntries.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-center gap-2 px-6 py-12 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "size-7 text-muted-foreground/60" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold text-muted-foreground",
								children: "No activity recorded yet"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground/70",
								children: "Staff actions will appear here as they happen."
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b border-border bg-muted/40 text-left",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-5 py-3 text-[11px] font-bold tracking-wider text-muted-foreground uppercase",
										children: "Action"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-5 py-3 text-[11px] font-bold tracking-wider text-muted-foreground uppercase",
										children: "Staff member"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-5 py-3 text-[11px] font-bold tracking-wider text-muted-foreground uppercase",
										children: "Status"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-5 py-3 text-right text-[11px] font-bold tracking-wider text-muted-foreground uppercase",
										children: "When"
									})
								]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: recentEntries.map((e, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.tr, {
								initial: {
									opacity: 0,
									y: 6
								},
								animate: {
									opacity: 1,
									y: 0
								},
								transition: { delay: i * .04 },
								className: "border-b border-border/50 transition-colors last:border-0 hover:bg-muted/30",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "px-5 py-3.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[13px] font-semibold text-foreground",
											children: actionLabel(e.action)
										}), e.targetUser && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-muted-foreground",
											children: ["on @", e.targetUser.username]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "px-5 py-3.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[13px] font-semibold text-foreground/90",
											children: e.actor ? e.actor.name : "System"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground",
											children: e.actor ? `@${e.actor.username}` : "—"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-5 py-3.5",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminBadge, {
											tone: actionTone(e.action),
											dot: true,
											children: /ban|reject|remove/i.test(e.action) ? "Enforced" : /approve|verify|create/i.test(e.action) ? "Completed" : /suspend|pause/i.test(e.action) ? "Limited" : /login/i.test(e.action) ? "Signed in" : "Logged"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-5 py-3.5 text-right",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "inline-flex items-center gap-1 text-xs text-muted-foreground",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-3" }),
												timeAgo(e.createdAt),
												" ago"
											]
										})
									})
								]
							}, e._id)) })]
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 lg:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, {
					className: "p-5 lg:col-span-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCardHeader, {
							title: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid size-7 place-items-center rounded-lg bg-primary-soft text-primary",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4" })
								}), "AI insights"]
							}),
							subtitle: "Automated observations from platform data"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 space-y-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-3 rounded-xl bg-muted/40 p-3.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid size-9 shrink-0 place-items-center rounded-xl bg-card shadow-sm",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-4 text-primary" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[13px] font-bold text-foreground",
									children: "Peak activity window"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-0.5 text-xs leading-relaxed text-muted-foreground",
									children: stats["liveNow"] ? `${stats["liveNow"]} live stream${stats["liveNow"] > 1 ? "s" : ""} running right now — keep Live Oversight open.` : "Evenings (6–10 PM EAT) consistently show the highest posting and viewing volume."
								})] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-3 rounded-xl bg-muted/40 p-3.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid size-9 shrink-0 place-items-center rounded-xl bg-card shadow-sm",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightbulb, { className: "size-4 text-warning" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[13px] font-bold text-foreground",
									children: "Moderation tip"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-0.5 text-xs leading-relaxed text-muted-foreground",
									children: stats["pendingReports"] ? `${stats["pendingReports"]} report${stats["pendingReports"] > 1 ? "s" : ""} older than 24h increase appeal risk — clear the oldest first.` : "Queue is clear. A great moment to review auto-moderation rules and thresholds."
								})] })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/system/dashboard/moderation",
							className: "press gradient-brand mt-4 flex h-11 items-center justify-center gap-2 rounded-xl text-[13px] font-bold text-primary-foreground shadow-glow",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4" }), " Open moderation workspace"]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, {
					className: "p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCardHeader, {
						title: "Quick actions",
						subtitle: "Jump straight into a workspace"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 space-y-2",
						children: [
							{
								to: "/system/dashboard/accounts",
								icon: Users,
								label: "Search user accounts"
							},
							{
								to: "/system/dashboard/live",
								icon: Radio,
								label: "Watch live streams"
							},
							{
								to: "/system/dashboard/campaigns",
								icon: Target,
								label: "Review ad campaigns"
							},
							{
								to: "/system/dashboard/activity",
								icon: Activity,
								label: "See staff leaderboard"
							},
							{
								to: "/system/dashboard/audit",
								icon: Eye,
								label: "Inspect the audit trail"
							}
						].map((q) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: q.to,
							className: "group flex items-center gap-3 rounded-xl border border-border/60 bg-card px-3.5 py-2.5 text-[13px] font-semibold text-foreground/85 transition-all hover:border-primary/30 hover:bg-primary-soft/30 hover:text-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid size-8 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary-soft group-hover:text-primary",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(q.icon, { className: "size-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex-1",
									children: q.label
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" })
							]
						}, q.to))
					})]
				})]
			})
		]
	});
}
//#endregion
export { DashboardIndex as component };
