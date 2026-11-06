import { o as __toESM } from "../_runtime.mjs";
import { r as cn } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Logo } from "./Logo-MIwGbQTL.mjs";
import { S as useNavigate, _ as Outlet, m as useRouterState, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { $n as Bell, $t as Hash, Bn as ChevronRight, E as TrendingUp, Fn as CircleQuestionMark, G as Shield, Hn as ChevronDown, Ht as LayoutDashboard, I as Sun, It as LogOut, J as ShieldCheck, Mn as Circle, Mt as Menu, Nt as Megaphone, P as Target, Q as Settings, Qn as BookOpen, St as Moon, X as ShieldAlert, Xt as History, a as X, ar as ArrowRight, c as Wallet, cr as Archive, et as Server, g as UserPlus, h as UserRound, in as Gauge, jn as ClipboardCheck, lr as Activity, lt as Radio, nr as Award, nt as Search, p as Users, sn as Flag, un as FileText, xn as Crown, y as UserCog, z as Sparkles, zt as LoaderCircle } from "../_libs/lucide-react.mjs";
import { n as api } from "./api-client-C-W0Sa9i.mjs";
import { r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { l as useAuth } from "./auth-context-CsN3soau.mjs";
import { N as timeAgo, at as useTheme } from "./router-BDN0UH9I.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as AnimatePresence } from "../_libs/framer-motion.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { a as hasAnyPermission, t as ROLE_LABEL } from "./permissions-Bg62BCbG.mjs";
import { t as AdminAvatar } from "./AdminUI-Cf1j1IrP.mjs";
import { i as useStaffNotifications, n as useOnlineDot, t as useMarkStaffNotificationsRead } from "./use-staff-notifications-BNfsHpuW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/system.dashboard-e7-Q5Im9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var adminNavSections = [
	{
		label: "Overview",
		items: [{
			to: "/system/dashboard/operations",
			label: "Operations Overview",
			icon: LayoutDashboard,
			permissions: ["operations.view"]
		}]
	},
	{
		label: "Users & Creators",
		items: [
			{
				to: "/system/dashboard/user-intelligence",
				label: "User Intelligence",
				icon: UserRound,
				permissions: ["users.intelligence.view"]
			},
			{
				to: "/system/dashboard/accounts",
				label: "User Management",
				icon: Users,
				permissions: ["accounts.view"]
			},
			{
				to: "/system/dashboard/creator-intelligence",
				label: "Creator Intelligence",
				icon: Award,
				permissions: ["creator.analytics.view"]
			},
			{
				to: "/system/dashboard/creators",
				label: "Creator Management",
				icon: UserCog,
				permissions: ["creators.view"]
			},
			{
				to: "/system/dashboard/staff",
				label: "Staff & Permissions",
				icon: ShieldCheck,
				permissions: ["staff.view"]
			}
		]
	},
	{
		label: "Content & Community",
		items: [
			{
				to: "/system/dashboard/content",
				label: "Content Management",
				icon: Archive,
				permissions: ["content.view"]
			},
			{
				to: "/system/dashboard/moderation",
				label: "Report Inbox",
				icon: ShieldAlert,
				permissions: ["moderation.queue.view"],
				badgeKey: "pendingReports"
			},
			{
				to: "/system/dashboard/post-review",
				label: "Post Review",
				icon: FileText,
				permissions: ["moderation.content.view"]
			},
			{
				to: "/system/dashboard/comment-review",
				label: "Comment Review",
				icon: Flag,
				permissions: ["moderation.content.view"]
			},
			{
				to: "/system/dashboard/story-review",
				label: "Decision Review",
				icon: Radio,
				permissions: ["moderation.content.view"]
			},
			{
				to: "/system/dashboard/live",
				label: "Live Management & Safety",
				icon: Radio,
				permissions: ["live.forceEnd"],
				badgeKey: "liveNow"
			},
			{
				to: "/system/dashboard/user-investigations",
				label: "User Investigations",
				icon: Users,
				permissions: ["moderation.investigations.view"]
			},
			{
				to: "/system/dashboard/appeals",
				label: "Appeals",
				icon: ClipboardCheck,
				permissions: ["moderation.appeals.view"]
			},
			{
				to: "/system/dashboard/enforcement",
				label: "Enforcement History",
				icon: ShieldAlert,
				permissions: ["moderation.enforcement.view"]
			},
			{
				to: "/system/dashboard/guidelines",
				label: "Moderation Guidelines",
				icon: BookOpen,
				permissions: ["moderation.rules.view"]
			},
			{
				to: "/system/dashboard/my-performance",
				label: "My Performance",
				icon: Gauge,
				permissions: ["moderation.stats.view"]
			}
		]
	},
	{
		label: "Operations & Support",
		items: [
			{
				to: "/system/dashboard/support",
				label: "Support Center",
				icon: CircleQuestionMark,
				permissions: ["support.view"]
			},
			{
				to: "/system/dashboard/verification",
				label: "Verification Center",
				icon: ShieldCheck,
				permissions: ["verification.view"]
			},
			{
				to: "/system/dashboard/approvals",
				label: "Approval & Escalation",
				icon: ClipboardCheck,
				permissions: ["approvals.view"]
			},
			{
				to: "/system/dashboard/announcements",
				label: "Notifications & Announcements",
				icon: Megaphone,
				permissions: ["announcements.view"]
			},
			{
				to: "/system/dashboard/trending",
				label: "Trending & Discovery",
				icon: Hash,
				permissions: ["trending.view"]
			}
		]
	},
	{
		label: "Analytics & Finance",
		items: [
			{
				to: "/system/dashboard/growth",
				label: "Growth Intelligence",
				icon: TrendingUp,
				permissions: ["analytics.view"]
			},
			{
				to: "/system/dashboard/payments",
				label: "Monetization & Finance",
				icon: Wallet,
				permissions: ["payments.view"]
			},
			{
				to: "/system/dashboard/campaigns",
				label: "Ad Campaigns",
				icon: Target,
				permissions: ["ads.view"],
				badgeKey: "pendingCampaigns"
			},
			{
				to: "/system/dashboard/rewards",
				label: "Rewards & Points",
				icon: Award,
				permissions: ["rewards.view"]
			},
			{
				to: "/system/dashboard/achievements",
				label: "Achievement Badges",
				icon: Sparkles,
				permissions: ["achievements.view"]
			}
		]
	},
	{
		label: "Security & Platform",
		items: [
			{
				to: "/system/dashboard/security",
				label: "Security & Risk",
				icon: ShieldAlert,
				permissions: ["security.view"]
			},
			{
				to: "/system/dashboard/system-control",
				label: "System Control & Health",
				icon: Server,
				permissions: ["system.health.view"]
			},
			{
				to: "/system/dashboard/activity",
				label: "Staff Activity",
				icon: Activity,
				permissions: ["audit.viewAll"]
			},
			{
				to: "/system/dashboard/audit",
				label: "Audit & Activity History",
				icon: History,
				permissions: ["audit.viewOwn", "audit.viewAll"]
			},
			{
				to: "/system/dashboard/settings",
				label: "Platform Settings",
				icon: Settings,
				permissions: ["settings.view"]
			},
			{
				to: "/system/dashboard/ad-settings",
				label: "Ad Settings & Rates",
				icon: Sparkles,
				permissions: ["settings.view"]
			}
		]
	}
];
var ALL_NAV_ITEMS = adminNavSections.flatMap((s) => s.items);
function useNavBadges() {
	const { staffUser } = useAuth();
	return useQuery({
		queryKey: [
			"staff",
			"overview",
			"badges"
		],
		queryFn: async () => {
			try {
				return (await api.get("/system/overview", true)).stats ?? {};
			} catch {
				return {};
			}
		},
		enabled: Boolean(staffUser),
		refetchInterval: 6e4
	});
}
var ROLE_BADGE_CONFIG = {
	superadmin: {
		label: "Super Admin",
		badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
		icon: Crown
	},
	admin: {
		label: "Admin",
		badgeClass: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
		icon: Shield
	},
	moderator: {
		label: "Moderator",
		badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
		icon: ShieldCheck
	}
};
function AdminSidebar({ onNavigate, onSignOut }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const { staffUser } = useAuth();
	const { data: stats } = useNavBadges();
	const role = staffUser?.role;
	const badgeConfig = role && ROLE_BADGE_CONFIG[role] || {
		label: "Staff",
		badgeClass: "bg-primary/15 text-primary border-primary/30",
		icon: ShieldCheck
	};
	const visibleSections = (0, import_react.useMemo)(() => adminNavSections.map((section) => ({
		...section,
		items: section.items.filter((item) => hasAnyPermission(staffUser, item.permissions)).map((item) => item.to === "/system/dashboard/operations" ? {
			...item,
			label: role === "superadmin" ? "Command Center" : role === "moderator" ? "Moderation Overview" : "Operations Overview"
		} : item)
	})).filter((section) => section.items.length > 0), [staffUser, role]);
	const [collapsedSections, setCollapsedSections] = (0, import_react.useState)({});
	(0, import_react.useEffect)(() => {
		visibleSections.forEach((section) => {
			if (section.items.some((item) => item.to === "/system/dashboard" ? pathname === "/system/dashboard" || pathname === "/system/dashboard/" : pathname.startsWith(item.to))) setCollapsedSections((prev) => prev[section.label] ? {
				...prev,
				[section.label]: false
			} : prev);
		});
	}, [pathname, visibleSections]);
	const toggleSection = (label) => {
		setCollapsedSections((prev) => ({
			...prev,
			[label]: !prev[label]
		}));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col select-none bg-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border-b border-border/40 px-4 py-3.5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/system/dashboard",
					onClick: onNavigate,
					className: "group flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2.5 min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {
								compact: true,
								className: "scale-105 transition-transform duration-200 group-hover:scale-110"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-emerald-500 ring-2 ring-card" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-[14px] leading-tight font-extrabold tracking-tight text-foreground truncate",
								children: "Gihanga Updates"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] font-bold tracking-[0.14em] text-primary uppercase",
								children: "Console"
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase", badgeConfig.badgeClass),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(badgeConfig.icon, { className: "size-2.5" }), badgeConfig.label]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "flex-1 space-y-3 overflow-y-auto px-2.5 py-3 no-scrollbar",
				style: {
					scrollbarWidth: "none",
					msOverflowStyle: "none"
				},
				children: visibleSections.map((section) => {
					const isCollapsed = Boolean(collapsedSections[section.label]);
					const sectionBadgeCount = section.items.reduce((acc, item) => {
						const badge = item.badgeKey ? stats?.[item.badgeKey] : void 0;
						return typeof badge === "number" && badge > 0 ? acc + badge : acc;
					}, 0);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-0.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => toggleSection(section.label),
							className: "group flex w-full items-center justify-between rounded-lg px-2 py-1 text-left cursor-pointer transition-colors hover:bg-muted/40",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5 min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] font-bold tracking-[0.14em] text-muted-foreground/75 uppercase transition-colors group-hover:text-foreground",
									children: section.label
								}), isCollapsed && sectionBadgeCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex h-4 min-w-4 items-center justify-center rounded-full bg-danger/15 px-1 text-[9px] font-extrabold text-danger",
									children: sectionBadgeCount > 99 ? "99+" : sectionBadgeCount
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: cn("size-3 text-muted-foreground/50 transition-transform duration-200 group-hover:text-muted-foreground", isCollapsed ? "-rotate-90" : "rotate-0") })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, {
							initial: false,
							children: !isCollapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
								initial: {
									height: 0,
									opacity: 0
								},
								animate: {
									height: "auto",
									opacity: 1
								},
								exit: {
									height: 0,
									opacity: 0
								},
								transition: {
									duration: .18,
									ease: "easeInOut"
								},
								className: "overflow-hidden space-y-0.5",
								children: section.items.map((item) => {
									const active = item.to === "/system/dashboard" ? pathname === "/system/dashboard" || pathname === "/system/dashboard/" : pathname.startsWith(item.to);
									const badge = item.badgeKey ? stats?.[item.badgeKey] : void 0;
									const isLiveItem = item.to === "/system/dashboard/live";
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: item.to,
										onClick: onNavigate,
										className: cn("group relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[12.5px] font-medium transition-all duration-150", active ? "bg-primary/12 text-primary font-bold shadow-sm" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground hover:translate-x-0.5"),
										children: [
											active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
												layoutId: "admin-nav-active-pill",
												className: "absolute top-1.5 bottom-1.5 left-0 w-1 rounded-r-full bg-primary",
												transition: {
													type: "spring",
													stiffness: 500,
													damping: 38
												}
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: cn("size-[16px] shrink-0 transition-transform duration-150 group-hover:scale-110", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground") }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "min-w-0 flex-1 truncate",
												children: item.label
											}),
											isLiveItem && typeof badge === "number" && badge > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "flex items-center gap-1 rounded-full bg-danger/15 px-1.5 py-0.5 text-[10px] font-bold text-danger",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-danger animate-ping" }), badge]
											}),
											!isLiveItem && typeof badge === "number" && badge > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: cn("grid h-4.5 min-w-4.5 place-items-center rounded-full px-1.5 text-[10px] font-extrabold tabular-nums", active ? "bg-primary text-primary-foreground" : "bg-danger/12 text-danger group-hover:bg-danger/20"),
												children: badge > 99 ? "99+" : badge
											}),
											active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-3 shrink-0 text-primary opacity-60" })
										]
									}, item.to);
								})
							})
						})]
					}, section.label);
				})
			}),
			staffUser?.role === "superadmin" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-2.5 pt-1 pb-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/system/register",
					onClick: onNavigate,
					className: "group flex items-center justify-between rounded-xl border border-primary/25 bg-gradient-to-r from-primary/15 via-primary/10 to-transparent p-2 text-xs font-bold text-foreground transition-all hover:border-primary/50 hover:bg-primary-soft/50 shadow-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-6 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "size-3.5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-[11.5px] font-bold leading-tight group-hover:text-primary transition-colors",
								children: "Add Administrator"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-[9.5px] font-medium text-muted-foreground",
								children: "Provision team role"
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border-t border-border/40 p-2.5 bg-card/60 backdrop-blur-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2.5 rounded-xl p-1.5 transition-colors hover:bg-muted/60",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative shrink-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminAvatar, {
								name: staffUser?.name ?? "Staff",
								hue: staffUser?.avatarHue,
								size: "sm"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-emerald-500 ring-2 ring-card" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-xs font-bold text-foreground leading-tight",
								children: staffUser?.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-[10.5px] font-semibold text-primary",
								children: role ? ROLE_LABEL[role] : "Staff"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": "Sign out",
							title: "Sign out",
							onClick: onSignOut,
							className: "press grid size-7 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger cursor-pointer",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-3.5" })
						})
					]
				})
			})
		]
	});
}
function pageTitleFor(pathname, role) {
	const item = [...ALL_NAV_ITEMS].sort((a, b) => b.to.length - a.to.length).find((i) => i.to === "/system/dashboard" && (pathname === "/system/dashboard" || pathname === "/system/dashboard/") || i.to !== "/system/dashboard" && pathname.startsWith(i.to));
	if (pathname.startsWith("/system/dashboard/operations")) return role === "superadmin" ? "Command Center" : role === "moderator" ? "Moderation Overview" : "Operations Overview";
	return item?.label ?? "Dashboard";
}
function GlobalSearch() {
	const navigate = useNavigate();
	const { staffUser } = useAuth();
	const [q, setQ] = (0, import_react.useState)("");
	const [open, setOpen] = (0, import_react.useState)(false);
	const results = (0, import_react.useMemo)(() => {
		const clean = q.trim().toLowerCase();
		if (!clean) return [];
		return ALL_NAV_ITEMS.filter((i) => hasAnyPermission(staffUser, i.permissions) && i.label.toLowerCase().includes(clean)).slice(0, 6);
	}, [q, staffUser]);
	(0, import_react.useEffect)(() => {
		function onKey(e) {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				document.getElementById("admin-global-search")?.focus();
			}
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative hidden md:block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex h-10 w-64 items-center gap-2 rounded-xl border border-border bg-muted/50 px-3.5 transition-colors focus-within:border-ring focus-within:bg-card lg:w-72",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4 shrink-0 text-muted-foreground" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					id: "admin-global-search",
					value: q,
					onChange: (e) => {
						setQ(e.target.value);
						setOpen(true);
					},
					onFocus: () => setOpen(true),
					onBlur: () => window.setTimeout(() => setOpen(false), 150),
					onKeyDown: (e) => {
						if (e.key === "Enter" && results[0]) {
							navigate({ to: results[0].to });
							setQ("");
							setOpen(false);
						}
					},
					placeholder: "Search pages…",
					className: "h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
					className: "hidden shrink-0 rounded-md border border-border bg-card px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground lg:block",
					children: "⌘K"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: open && q.trim() && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
			initial: {
				opacity: 0,
				y: -6,
				scale: .98
			},
			animate: {
				opacity: 1,
				y: 0,
				scale: 1
			},
			exit: {
				opacity: 0,
				y: -6,
				scale: .98
			},
			transition: { duration: .15 },
			className: "absolute top-12 right-0 z-50 w-72 overflow-hidden rounded-2xl border border-border bg-popover shadow-float",
			children: results.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "p-4 text-center text-xs text-muted-foreground",
				children: "No matching pages."
			}) : results.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onMouseDown: (e) => e.preventDefault(),
				onClick: () => {
					navigate({ to: r.to });
					setQ("");
					setOpen(false);
				},
				className: "flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] font-semibold text-foreground/90 transition-colors hover:bg-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(r.icon, { className: "size-4 text-muted-foreground" }),
					r.label,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "ml-auto size-3.5 text-muted-foreground" })
				]
			}, r.to))
		}) })]
	});
}
function NotificationBell() {
	const { data } = useStaffNotifications();
	const markRead = useMarkStaffNotificationsRead();
	const [open, setOpen] = (0, import_react.useState)(false);
	const unread = data?.unreadCount ?? 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			"aria-label": "Notifications",
			onClick: () => setOpen((v) => !v),
			className: "press relative grid size-10 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-[18px]" }), unread > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
				initial: { scale: .4 },
				animate: { scale: 1 },
				className: "absolute top-1.5 right-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[9px] font-extrabold text-danger-foreground",
				children: unread > 9 ? "9+" : unread
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "fixed inset-0 z-40",
			onClick: () => setOpen(false)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			initial: {
				opacity: 0,
				y: -8,
				scale: .97
			},
			animate: {
				opacity: 1,
				y: 0,
				scale: 1
			},
			exit: {
				opacity: 0,
				y: -8,
				scale: .97
			},
			transition: { duration: .16 },
			className: "absolute top-12 right-0 z-50 w-80 overflow-hidden rounded-2xl border border-border bg-popover shadow-float",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between border-b border-border px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-bold text-foreground",
					children: "Notifications"
				}), unread > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => markRead.mutate(),
					className: "text-xs font-bold text-primary hover:underline",
					children: "Mark all read"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-h-80 overflow-y-auto",
				children: [!data?.notifications.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-4 py-10 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "mx-auto mb-2 size-6 text-muted-foreground/50" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "You're all caught up."
					})]
				}), data?.notifications.map((n, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					initial: {
						opacity: 0,
						x: -6
					},
					animate: {
						opacity: 1,
						x: 0
					},
					transition: { delay: i * .03 },
					className: cn("border-b border-border/50 px-4 py-3 text-[13px] last:border-0", !n.read && "bg-primary-soft/40"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "leading-snug text-foreground/90",
						children: n.text
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-[11px] text-muted-foreground",
						children: [timeAgo(n.createdAt), " ago"]
					})]
				}, n._id))]
			})]
		})] }) })]
	});
}
function ProfileMenu({ onSignOut }) {
	const { staffUser } = useAuth();
	const [open, setOpen] = (0, import_react.useState)(false);
	const role = staffUser?.role;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			"aria-label": "Account menu",
			onClick: () => setOpen((v) => !v),
			className: "press flex items-center gap-2 rounded-xl p-1 transition-colors hover:bg-muted",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminAvatar, {
				name: staffUser?.name ?? "Staff",
				hue: staffUser?.avatarHue,
				size: "sm"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "hidden text-left lg:block",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block max-w-[120px] truncate text-[13px] leading-tight font-bold text-foreground",
					children: staffUser?.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-[10px] font-semibold text-primary",
					children: role ? ROLE_LABEL[role] : "Staff"
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "fixed inset-0 z-40",
			onClick: () => setOpen(false)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			initial: {
				opacity: 0,
				y: -8,
				scale: .97
			},
			animate: {
				opacity: 1,
				y: 0,
				scale: 1
			},
			exit: {
				opacity: 0,
				y: -8,
				scale: .97
			},
			transition: { duration: .16 },
			className: "absolute top-12 right-0 z-50 w-56 overflow-hidden rounded-2xl border border-border bg-popover shadow-float",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-b border-border px-4 py-3.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-sm font-bold text-foreground",
						children: staffUser?.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-xs text-muted-foreground",
						children: staffUser?.email
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "mt-2 inline-flex items-center gap-1.5 rounded-md bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-3" }), role ? ROLE_LABEL[role] : "Staff"]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "p-1.5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => {
						setOpen(false);
						onSignOut();
					},
					className: "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-semibold text-danger transition-colors hover:bg-danger/10",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), " Sign out"]
				})
			})]
		})] }) })]
	});
}
function AdminTopBar({ onMenuClick, onSignOut }) {
	const { theme, toggle } = useTheme();
	const online = useOnlineDot();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const { staffUser } = useAuth();
	const title = pageTitleFor(pathname, staffUser?.role);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": "Open menu",
				onClick: onMenuClick,
				className: "press grid size-10 place-items-center rounded-xl text-muted-foreground hover:bg-muted lg:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.h2, {
				initial: {
					opacity: 0,
					y: 4
				},
				animate: {
					opacity: 1,
					y: 0
				},
				className: "font-display text-lg font-bold tracking-tight text-foreground",
				children: title
			}, title),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "ml-auto flex items-center gap-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GlobalSearch, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "mr-1 hidden items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1.5 text-[11px] font-bold text-muted-foreground sm:flex",
						title: online ? "Real-time connected" : "Reconnecting…",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: cn("size-2 fill-current", online ? "text-success" : "text-warning animate-pulse") }), online ? "Live" : "Connecting"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "Toggle theme",
						onClick: toggle,
						className: "press grid size-10 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
						children: theme === "dark" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "size-[18px]" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "size-[18px]" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationBell, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-1 hidden h-6 w-px bg-border sm:block" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileMenu, { onSignOut })
				]
			})
		]
	});
}
function AdminShell({ children }) {
	const navigate = useNavigate();
	const { staffUser, signOutStaff } = useAuth();
	const [mobileNavOpen, setMobileNavOpen] = (0, import_react.useState)(false);
	function handleSignOut() {
		signOutStaff();
		toast.success("Signed out of the admin console");
		navigate({ to: "/system" });
	}
	const sidebar = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminSidebar, {
		onNavigate: () => setMobileNavOpen(false),
		onSignOut: handleSignOut
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
			className: "sticky top-0 hidden h-screen w-[268px] shrink-0 border-r border-border bg-card lg:flex",
			children: sidebar
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 flex-1 flex-col",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTopBar, {
					onMenuClick: () => setMobileNavOpen(true),
					onSignOut: handleSignOut
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: mobileNavOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "fixed inset-0 z-40 flex lg:hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
						initial: { opacity: 0 },
						animate: { opacity: 1 },
						exit: { opacity: 0 },
						className: "absolute inset-0 bg-black/60 backdrop-blur-sm",
						onClick: () => setMobileNavOpen(false)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: { x: -300 },
						animate: { x: 0 },
						exit: { x: -300 },
						transition: {
							type: "spring",
							stiffness: 400,
							damping: 38
						},
						className: "relative flex h-full w-[280px] flex-col border-r border-border bg-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": "Close menu",
							onClick: () => setMobileNavOpen(false),
							className: "absolute top-5 right-4 grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
						}), sidebar]
					})]
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "flex-1 px-4 py-6 sm:px-6 lg:px-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-auto w-full max-w-[1440px]",
						children
					})
				})
			]
		})]
	});
}
function StaffDashboardLayout() {
	const navigate = useNavigate();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const { staffUser, loading } = useAuth();
	(0, import_react.useEffect)(() => {
		if (loading) return;
		if (!staffUser || staffUser.role === "user") navigate({ to: "/system" });
	}, [
		loading,
		staffUser,
		navigate
	]);
	if (loading || !staffUser || staffUser.role === "user") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-screen place-items-center bg-background",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid size-14 place-items-center rounded-2xl border border-border bg-card shadow-soft",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-6 animate-spin text-primary" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-semibold text-muted-foreground",
				children: "Loading console…"
			})]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
		initial: {
			opacity: 0,
			y: 12
		},
		animate: {
			opacity: 1,
			y: 0
		},
		transition: {
			duration: .3,
			ease: [
				.22,
				1,
				.36,
				1
			]
		},
		className: "space-y-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
	}, pathname) });
}
//#endregion
export { StaffDashboardLayout as component };
