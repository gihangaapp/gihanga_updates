import { o as __toESM } from "../_runtime.mjs";
import { r as cn } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Logo } from "./Logo-C5LwQkSU.mjs";
import { b as Link, g as Outlet, p as useRouterState, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { Cn as ChevronRight, G as ShieldCheck, I as Sparkles, Ln as Award, N as Sun, Ot as LogOut, Pn as Bell, T as TrendingUp, Tt as Menu, Un as Activity, Vt as History, Y as Settings, _t as Moon, a as X, at as Radio, c as Wallet, gn as Circle, j as Target, p as Users, q as ShieldAlert } from "../_libs/lucide-react.mjs";
import { F as timeAgo, wt as useTheme } from "./router-BS6G260b.mjs";
import { l as useAuth } from "./auth-context-Duh7Mq6E.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as AnimatePresence } from "../_libs/framer-motion.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { n as hasAnyPermission, t as ROLE_LABEL } from "./permissions-B9dpCwVw.mjs";
import { i as useStaffNotifications, n as useOnlineDot, t as useMarkStaffNotificationsRead } from "./use-staff-notifications-DwOT5EOs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/system.dashboard-CFUl01eQ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function StaffTopBar({ onMenuClick }) {
	const { theme, toggle } = useTheme();
	const { data } = useStaffNotifications();
	const markRead = useMarkStaffNotificationsRead();
	const online = useOnlineDot();
	const [bellOpen, setBellOpen] = (0, import_react.useState)(false);
	const unread = data?.unreadCount ?? 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md sm:px-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			"aria-label": "Open menu",
			onClick: onMenuClick,
			className: "press grid size-9 place-items-center rounded-xl text-muted-foreground hover:bg-muted lg:hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "ml-auto flex items-center gap-1.5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] font-semibold text-muted-foreground",
					title: online ? "Real-time connected" : "Reconnecting…",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: cn("size-2 fill-current", online ? "text-success" : "text-warning animate-pulse") }), online ? "Live" : "Connecting"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "Toggle theme",
					onClick: toggle,
					className: "press grid size-9 place-items-center rounded-xl text-muted-foreground hover:bg-muted",
					children: theme === "dark" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "size-4.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "size-4.5" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"aria-label": "Notifications",
						onClick: () => setBellOpen((v) => !v),
						className: "press relative grid size-9 place-items-center rounded-xl text-muted-foreground hover:bg-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4.5" }), unread > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "absolute top-1 right-1 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[9px] font-bold text-danger-foreground",
							children: unread > 9 ? "9+" : unread
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: bellOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "fixed inset-0 z-40",
						onClick: () => setBellOpen(false)
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
						transition: { duration: .15 },
						className: "absolute top-11 right-0 z-50 w-80 overflow-hidden rounded-2xl border border-border bg-popover shadow-xl",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between border-b border-border px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-bold text-foreground",
								children: "Notifications"
							}), unread > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => markRead.mutate(),
								className: "text-xs font-semibold text-primary hover:underline",
								children: "Mark all read"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "max-h-80 overflow-y-auto",
							children: [!data?.notifications.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "p-6 text-center text-xs text-muted-foreground",
								children: "No notifications yet."
							}), data?.notifications.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: cn("border-b border-border/60 px-4 py-3 text-sm last:border-0", !n.read && "bg-primary-soft/40"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-foreground/90",
									children: n.text
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-0.5 text-[11px] text-muted-foreground",
									children: [timeAgo(n.createdAt), " ago"]
								})]
							}, n._id))]
						})]
					})] }) })]
				})
			]
		})]
	});
}
var navSections = [
	{
		label: "Overview",
		items: [{
			to: "/system/dashboard",
			label: "Dashboard",
			icon: TrendingUp,
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
				permissions: ["moderation.queue.view"]
			},
			{
				to: "/system/dashboard/live",
				label: "Live Oversight",
				icon: Radio,
				permissions: ["live.forceEnd"]
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
				permissions: ["payments.view"]
			},
			{
				to: "/system/dashboard/campaigns",
				label: "Ad Campaigns",
				icon: Target,
				permissions: ["ads.view"]
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
				icon: Award,
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
function initials(name) {
	return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}
function StaffDashboardLayout() {
	const navigate = useNavigate();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const { staffUser, signOutStaff, loading } = useAuth();
	const [mobileNavOpen, setMobileNavOpen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (loading) return;
		if (!staffUser || staffUser.role === "user") navigate({ to: "/system" });
	}, [
		loading,
		staffUser,
		navigate
	]);
	if (loading || !staffUser || staffUser.role === "user") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-screen place-items-center bg-background text-muted-foreground",
		children: "Loading console…"
	});
	const role = staffUser.role;
	const visibleSections = navSections.map((section) => ({
		...section,
		items: section.items.filter((item) => hasAnyPermission(staffUser, item.permissions))
	})).filter((section) => section.items.length > 0);
	const sidebarContent = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center gap-2.5 px-1 pb-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
			className: "flex-1 space-y-6 overflow-y-auto",
			children: visibleSections.map((section) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-1.5 px-2 text-[10px] font-bold tracking-wider text-muted-foreground uppercase",
				children: section.label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-0.5",
				children: section.items.map((item) => {
					const active = pathname === item.to;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: item.to,
						onClick: () => setMobileNavOpen(false),
						className: cn("relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-semibold transition-colors", active ? "bg-primary-soft text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"),
						children: [
							active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
								layoutId: "staff-nav-active",
								className: "absolute inset-0 rounded-xl bg-primary-soft",
								transition: {
									type: "spring",
									stiffness: 500,
									damping: 40
								},
								style: { zIndex: -1 }
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "size-4 shrink-0" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "min-w-0 flex-1 truncate",
								children: item.label
							}),
							active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-3.5 shrink-0" })
						]
					}, item.to);
				})
			})] }, section.label))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 flex items-center gap-2.5 rounded-xl border border-border bg-muted/40 p-2.5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold text-primary-foreground",
					style: { backgroundImage: `linear-gradient(140deg, oklch(0.5 0.11 ${staffUser.avatarHue || 250}), oklch(0.72 0.1 ${(staffUser.avatarHue || 250) + 24}))` },
					children: initials(staffUser.name)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-xs font-bold text-foreground",
						children: staffUser.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-[10px] font-semibold text-primary",
						children: ROLE_LABEL[role]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "Sign out",
					onClick: () => {
						signOutStaff();
						toast.success("Signed out of the staff console");
						navigate({ to: "/system" });
					},
					className: "grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-danger/10 hover:text-danger",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" })
				})
			]
		})
	] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
			className: "sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card/50 p-4 lg:flex",
			children: sidebarContent
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-1 flex-col",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StaffTopBar, { onMenuClick: () => setMobileNavOpen(true) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: mobileNavOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "fixed inset-0 z-40 flex lg:hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
						initial: { opacity: 0 },
						animate: { opacity: 1 },
						exit: { opacity: 0 },
						className: "absolute inset-0 bg-black/60",
						onClick: () => setMobileNavOpen(false)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: { x: -288 },
						animate: { x: 0 },
						exit: { x: -288 },
						transition: {
							type: "spring",
							stiffness: 400,
							damping: 38
						},
						className: "relative flex h-full w-72 flex-col border-r border-border bg-card p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": "Close menu",
							onClick: () => setMobileNavOpen(false),
							className: "absolute top-4 right-4 grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
						}), sidebarContent]
					})]
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "flex-1 p-4 sm:p-6 lg:p-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
						initial: {
							opacity: 0,
							y: 8
						},
						animate: {
							opacity: 1,
							y: 0
						},
						transition: { duration: .25 },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
					}, pathname)
				})
			]
		})]
	});
}
//#endregion
export { StaffDashboardLayout as component };
