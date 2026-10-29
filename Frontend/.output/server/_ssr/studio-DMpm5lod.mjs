import { o as __toESM } from "../_runtime.mjs";
import { r as cn, t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { Fn as ChartColumn, T as TrendingUp, an as Eye, c as Wallet, ct as Plus, g as UserPlus, qn as ArrowUpRight, qt as Heart, rn as Film, st as Radio } from "../_libs/lucide-react.mjs";
import { n as api, s as mediaUrl } from "./api-client-DZOxvrvB.mjs";
import { E as formatCount, O as openCreate, t as AppShell } from "./router-CrddKQ7E.mjs";
import { r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as YAxis, d as Pie, f as Cell, l as CartesianGrid, m as Tooltip, n as PieChart, o as XAxis, p as ResponsiveContainer, s as Area, t as AreaChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/studio-DMpm5lod.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Frontend-only feed store. Holds posts created in-session (composer, story
* creation, reel uploads) on top of the mock seed data. No backend.
*/
var state = {
	created: [],
	myStory: null,
	scheduled: []
};
var listeners = /* @__PURE__ */ new Set();
function subscribe(cb) {
	listeners.add(cb);
	return () => listeners.delete(cb);
}
var getSnapshot = () => state;
function useFeedState() {
	return (0, import_react.useSyncExternalStore)(subscribe, getSnapshot, getSnapshot);
}
function useStudioAnalytics() {
	return useQuery({
		queryKey: ["studio", "analytics"],
		queryFn: () => api.get("/studio/analytics")
	});
}
var ranges = [
	"7d",
	"30d",
	"90d"
];
var pieColors = [
	"oklch(0.62 0.13 205)",
	"oklch(0.72 0.13 190)",
	"oklch(0.55 0.11 240)",
	"oklch(0.78 0.1 175)",
	"oklch(0.46 0.09 250)"
];
function rwf(n) {
	return `${formatCount(n)} pts`;
}
function Stat({ label, value, delta, icon: Icon }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "surface-card p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-2 flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid size-8 place-items-center rounded-xl bg-primary-soft text-primary",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs font-semibold text-muted-foreground",
					children: label
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-2xl font-extrabold tracking-tight",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-0.5 flex items-center gap-1 text-xs font-bold text-success",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-3" }),
					" ",
					delta
				]
			})
		]
	});
}
var tooltipStyle = {
	borderRadius: 12,
	border: "1px solid var(--color-border)",
	background: "var(--color-card)",
	color: "var(--color-foreground)",
	fontSize: 12
};
function StudioPage() {
	const [range, setRange] = (0, import_react.useState)("30d");
	const [metric, setMetric] = (0, import_react.useState)("views");
	const [filter, setFilter] = (0, import_react.useState)("all");
	const { scheduled } = useFeedState();
	const { data, isLoading } = useStudioAnalytics();
	const chartData = (range === "7d" ? (data?.dailyStats ?? []).slice(-7) : data?.dailyStats ?? []).map((d) => ({
		day: new Date(d.date).toLocaleDateString(void 0, {
			month: "short",
			day: "numeric"
		}),
		views: d.views,
		followers: d.followers,
		earnings: d.earnings
	}));
	const rows = [...scheduled.map((s) => ({
		id: s.id,
		title: s.body || "Untitled draft",
		image: s.image,
		status: "scheduled",
		views: 0,
		engagement: 0,
		earnings: 0,
		date: s.scheduledFor?.replace("T", " · ") ?? "—"
	})), ...(data?.topContent ?? []).map((r) => ({
		id: r._id,
		title: r.body || `${r.kind} post`,
		image: mediaUrl(r.thumbnailUrl || r.mediaUrl),
		status: "published",
		views: r.views,
		engagement: r.views ? Math.round((r.likes + r.comments) / Math.max(r.views, 1) * 1e3) / 10 : 0,
		earnings: 0,
		date: new Date(r.createdAt).toLocaleDateString()
	}))].filter((r) => filter === "all" || r.status === filter);
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "py-16 text-center text-sm text-muted-foreground",
		children: "Loading your studio…"
	}) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-[900px]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mb-4 flex flex-wrap items-center gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-2xl font-extrabold tracking-tight",
							children: "Creator Studio"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Your performance, content pipeline and audience — real numbers, updated live."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/wallet",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "size-4" }), " Wallet"]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "brand",
						onClick: () => openCreate("post"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { strokeWidth: 3 }), " Create"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Views (30d)",
						value: formatCount(data?.totals.totalViews ?? 0),
						delta: `${data?.totals.posts ?? 0} posts`,
						icon: Eye
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "New followers",
						value: formatCount(data?.totals.newFollowers30d ?? 0),
						delta: `${formatCount(data?.totals.followers ?? 0)} total`,
						icon: UserPlus
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Likes (30d)",
						value: formatCount(data?.totals.totalLikes ?? 0),
						delta: "across all posts",
						icon: Heart
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Earnings (30d)",
						value: rwf((data?.revenueSplit ?? []).reduce((s, r) => s + r.value, 0)),
						delta: `${formatCount(data?.adSpend30d ?? 0)} ad spend`,
						icon: ChartColumn
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "surface-card mb-4 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "mb-4 flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mr-auto font-display text-base font-bold",
							children: "Performance"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex gap-1 rounded-xl bg-elevated p-1",
							children: [
								"views",
								"followers",
								"earnings"
							].map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setMetric(m),
								className: cn("press rounded-lg px-2.5 py-1 text-xs font-bold capitalize", metric === m ? "bg-card text-primary shadow-soft" : "text-muted-foreground"),
								children: m
							}, m))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex gap-1 rounded-xl bg-elevated p-1",
							children: ranges.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setRange(r),
								className: cn("press rounded-lg px-2.5 py-1 text-xs font-bold", range === r ? "bg-card text-primary shadow-soft" : "text-muted-foreground"),
								children: r
							}, r))
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-64 w-full",
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
									id: "studioFill",
									x1: "0",
									y1: "0",
									x2: "0",
									y2: "1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
										offset: "0%",
										stopColor: "oklch(0.68 0.13 195)",
										stopOpacity: .5
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
										offset: "100%",
										stopColor: "oklch(0.68 0.13 195)",
										stopOpacity: .02
									})]
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									stroke: "var(--color-border)",
									vertical: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "day",
									tickLine: false,
									axisLine: false,
									fontSize: 11
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									tickLine: false,
									axisLine: false,
									fontSize: 11,
									width: 54
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: tooltipStyle }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
									type: "monotone",
									dataKey: metric,
									stroke: "oklch(0.68 0.13 195)",
									strokeWidth: 2.5,
									fill: "url(#studioFill)"
								})
							]
						})
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 grid gap-3 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "surface-card p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-3 font-display text-base font-bold",
						children: "Revenue split (30d)"
					}), (data?.revenueSplit ?? []).some((r) => r.value > 0) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-40 w-40 shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
								width: "100%",
								height: "100%",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
									data: data?.revenueSplit ?? [],
									dataKey: "value",
									nameKey: "label",
									innerRadius: 38,
									outerRadius: 68,
									children: (data?.revenueSplit ?? []).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: pieColors[i % pieColors.length] }, i))
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: tooltipStyle })] })
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "min-w-0 flex-1 space-y-1.5",
							children: (data?.revenueSplit ?? []).map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center gap-2 text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "size-2.5 rounded-full",
										style: { background: pieColors[i % pieColors.length] }
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "min-w-0 flex-1 truncate",
										children: c.label
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-bold",
										children: [formatCount(c.value), " pts"]
									})
								]
							}, c.label))
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "py-8 text-center text-sm text-muted-foreground",
						children: "No earnings yet this period."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "surface-card p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-3 font-display text-base font-bold",
						children: "Audience insights"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm leading-relaxed text-muted-foreground",
						children: data?.note
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "surface-card mb-4 overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "flex flex-wrap items-center gap-2 border-b border-border p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mr-auto font-display text-base font-bold",
						children: "Content"
					}), [
						"all",
						"published",
						"scheduled",
						"draft"
					].map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setFilter(f),
						className: cn("press rounded-lg px-2.5 py-1 text-xs font-bold capitalize", filter === f ? "bg-primary-soft text-primary" : "text-muted-foreground hover:bg-muted"),
						children: f
					}, f))]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "divide-y divide-border",
					children: [rows.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "p-8 text-center text-sm text-muted-foreground",
						children: "No content yet — create your first post."
					}), rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-3 p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "size-12 shrink-0 overflow-hidden rounded-xl bg-elevated",
								children: r.image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: r.image,
									alt: "",
									loading: "lazy",
									className: "size-full object-cover"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid size-full place-items-center text-muted-foreground",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Film, { className: "size-4" })
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block truncate text-sm font-semibold",
									children: r.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs text-muted-foreground",
									children: [
										r.date,
										" · ",
										formatCount(r.views),
										" views · ",
										r.engagement,
										"% eng"
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("hidden shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold capitalize sm:block", r.status === "published" && "bg-success/12 text-success", r.status === "scheduled" && "bg-warning/12 text-warning", r.status === "draft" && "bg-muted text-muted-foreground"),
								children: r.status
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon-sm",
								"aria-label": "Open insights",
								onClick: () => toast("Post insights", { description: r.title.slice(0, 60) }),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, {})
							})
						]
					}, r.id))]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "surface-card halo flex flex-wrap items-center gap-3 p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-10 place-items-center rounded-2xl bg-danger/12 text-danger",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-display text-base font-bold",
							children: [
								"Go live to your ",
								formatCount(data?.totals.followers ?? 0),
								" followers"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Live sessions are a great way to connect in real time."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "brand",
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/live",
							children: "Start setup"
						})
					})
				]
			})
		]
	}) });
}
//#endregion
export { StudioPage as component };
