import { o as __toESM } from "../_runtime.mjs";
import { r as cn } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Logo } from "./Logo-BWkMw83G.mjs";
import { b as Link, g as Outlet, p as useRouterState, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { An as ChevronRight, Cn as Circle, F as Sun, Ft as LoaderCircle, Gn as Award, Hn as Bell, Kt as History, Mt as LogOut, N as Target, Ot as Menu, R as Sparkles, Rt as LayoutDashboard, T as TrendingUp, Y as ShieldAlert, Z as Settings, Zn as Activity, a as X, c as Wallet, et as Search, p as Users, q as ShieldCheck, st as Radio, yt as Moon } from "../_libs/lucide-react.mjs";
import { n as api } from "./api-client-DZOxvrvB.mjs";
import { j as timeAgo, nt as useTheme } from "./router-CrddKQ7E.mjs";
import { r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { l as useAuth } from "./auth-context-CuF8V2_l.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as AnimatePresence } from "../_libs/framer-motion.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { n as hasAnyPermission, t as ROLE_LABEL } from "./permissions-CGE25KsA.mjs";
import { t as AdminAvatar } from "./AdminUI-Cf1j1IrP.mjs";
import { i as useStaffNotifications, n as useOnlineDot, t as useMarkStaffNotificationsRead } from "./use-staff-notifications-CrbufWm0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/system.dashboard-DeSe317I.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var adminNavSections = [
	{
		label: "Overview",
		items: [{
			to: "/system/dashboard",
			label: "Dashboard",
			icon: LayoutDashboard,
			permissions: ["moderation.queue.view", "accounts.view"]
		}]
	},
	{
		label: "Trust & Safety",
		items: [
			{
				to: "/system/dashboard/moderation",
				label: "Moderation Queue",
				icon: ShieldAlert,
				permissions: ["moderation.queue.view"],
				badgeKey: "pendingReports"
			},
			{
				to: "/system/dashboard/live",
				label: "Live Oversight",
				icon: Radio,
				permissions: ["live.forceEnd"],
				badgeKey: "liveNow"
			},
			{
				to: "/system/dashboard/accounts",
				label: "User Accounts",
				icon: Users,
				permissions: ["accounts.view"]
			}
		]
	},
	{
		label: "Finance",
		items: [
			{
				to: "/system/dashboard/payments",
				label: "Payments Queue",
				icon: Wallet,
				permissions: ["payments.view"],
				badgeKey: "pendingPayments"
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
				label: "Reward Config",
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
		label: "Platform",
		items: [
			{
				to: "/system/dashboard/growth",
				label: "Platform Growth",
				icon: TrendingUp,
				permissions: ["analytics.view"]
			},
			{
				to: "/system/dashboard/staff",
				label: "Staff Management",
				icon: ShieldCheck,
				permissions: ["staff.view"]
			},
			{
				to: "/system/dashboard/activity",
				label: "Staff Activity",
				icon: Activity,
				permissions: ["audit.viewAll"]
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
			},
			{
				to: "/system/dashboard/audit",
				label: "Audit Log",
				icon: History,
				permissions: ["audit.viewOwn", "audit.viewAll"]
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
function AdminSidebar({ onNavigate, onSignOut }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const { staffUser } = useAuth();
	const { data: stats } = useNavBadges();
	const role = staffUser?.role;
	const visibleSections = (0, import_react.useMemo)(() => adminNavSections.map((section) => ({
		...section,
		items: section.items.filter((item) => hasAnyPermission(staffUser, item.permissions))
	})).filter((section) => section.items.length > 0), [staffUser]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3 px-5 pt-6 pb-7",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {
					compact: true,
					className: "scale-110"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-[15px] leading-tight font-extrabold tracking-tight text-foreground",
						children: "Gihanga Updates"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] font-bold tracking-[0.16em] text-primary uppercase",
						children: "Admin Console"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "flex-1 space-y-5 overflow-y-auto px-3 pb-4",
				children: visibleSections.map((section) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-1.5 px-3 text-[10px] font-bold tracking-[0.14em] text-muted-foreground/80 uppercase",
					children: section.label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-0.5",
					children: section.items.map((item) => {
						const active = item.to === "/system/dashboard" ? pathname === "/system/dashboard" || pathname === "/system/dashboard/" : pathname.startsWith(item.to);
						const badge = item.badgeKey ? stats?.[item.badgeKey] : void 0;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.to,
							onClick: onNavigate,
							className: cn("group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-colors", active ? "bg-primary-soft text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"),
							children: [
								active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
									layoutId: "admin-nav-active-bar",
									className: "absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-r-full",
									style: { background: "var(--gradient-brand)" },
									transition: {
										type: "spring",
										stiffness: 500,
										damping: 40
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: cn("size-[17px] shrink-0 transition-colors", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground") }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "min-w-0 flex-1 truncate",
									children: item.label
								}),
								typeof badge === "number" && badge > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[10px] font-extrabold tabular-nums", active ? "bg-primary text-primary-foreground" : "bg-danger/10 text-danger group-hover:bg-danger/15"),
									children: badge > 99 ? "99+" : badge
								}),
								active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-3.5 shrink-0" })
							]
						}, item.to);
					})
				})] }, section.label))
			}),
			staffUser?.role === "superadmin" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-3 pb-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/system/register",
					className: "press gradient-brand flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold text-primary-foreground shadow-glow",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4" }), " Register Administrator"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border-t border-border p-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2.5 rounded-xl p-2 transition-colors hover:bg-muted",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminAvatar, {
							name: staffUser?.name ?? "Staff",
							hue: staffUser?.avatarHue
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-[13px] font-bold text-foreground",
								children: staffUser?.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-[11px] font-semibold text-primary",
								children: role ? ROLE_LABEL[role] : "Staff"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": "Sign out",
							onClick: onSignOut,
							className: "press grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-danger/10 hover:text-danger",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" })
						})
					]
				})
			})
		]
	});
}
function pageTitleFor(pathname) {
	return [...ALL_NAV_ITEMS].sort((a, b) => b.to.length - a.to.length).find((i) => i.to === "/system/dashboard" && (pathname === "/system/dashboard" || pathname === "/system/dashboard/") || i.to !== "/system/dashboard" && pathname.startsWith(i.to))?.label ?? "Dashboard";
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
	const title = pageTitleFor(useRouterState({ select: (s) => s.location.pathname }));
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
			className: "sticky top-0 hidden h-screen w-[264px] shrink-0 border-r border-border bg-card lg:flex",
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
