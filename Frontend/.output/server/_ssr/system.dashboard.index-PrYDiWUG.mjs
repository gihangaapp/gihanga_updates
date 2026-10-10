import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { Zt as FileText, at as Radio, c as Wallet, h as UserX, j as Target, p as Users, w as TriangleAlert } from "../_libs/lucide-react.mjs";
import { n as api } from "./api-client-C-02deeD.mjs";
import { k as formatCount } from "./router-NU7wHj2a.mjs";
import { l as useAuth } from "./auth-context-Duh7Mq6E.mjs";
import { r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as ROLE_LABEL } from "./permissions-B9dpCwVw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/system.dashboard.index-PrYDiWUG.js
var import_jsx_runtime = require_jsx_runtime();
function useOverview() {
	return useQuery({
		queryKey: ["staff", "overview"],
		queryFn: async () => {
			try {
				return await api.get("/system/overview", true);
			} catch (err) {
				console.error("[useOverview Error]:", err);
				return {
					stats: {},
					role: ""
				};
			}
		}
	});
}
var cards = [
	{
		key: "pendingReports",
		label: "Pending reports",
		icon: TriangleAlert,
		to: "/system/dashboard/moderation",
		tone: "text-danger bg-danger/10"
	},
	{
		key: "totalUsers",
		label: "Total users",
		icon: Users,
		to: "/system/dashboard/accounts",
		tone: "text-info bg-sky-500/10"
	},
	{
		key: "newUsers24h",
		label: "New users (24h)",
		icon: Users,
		to: "/system/dashboard/accounts",
		tone: "text-success bg-emerald-500/10"
	},
	{
		key: "suspendedAccounts",
		label: "Suspended/banned",
		icon: UserX,
		to: "/system/dashboard/accounts",
		tone: "text-warning bg-amber-500/10"
	},
	{
		key: "pendingPayments",
		label: "Payments pending",
		icon: Wallet,
		to: "/system/dashboard/payments",
		tone: "text-primary bg-indigo-500/10"
	},
	{
		key: "liveNow",
		label: "Live right now",
		icon: Radio,
		to: "/system/dashboard/live",
		tone: "text-danger bg-danger/10"
	},
	{
		key: "pendingCampaigns",
		label: "Ad campaigns to review",
		icon: Target,
		to: "/system/dashboard/campaigns",
		tone: "text-accent bg-violet-500/10"
	},
	{
		key: "totalPosts",
		label: "Total posts",
		icon: FileText,
		to: "/system/dashboard/moderation",
		tone: "text-muted-foreground bg-muted"
	}
];
function DashboardIndex() {
	const { staffUser } = useAuth();
	const { data, isLoading } = useOverview();
	const stats = data?.stats ?? {};
	const visible = cards.filter((c) => stats[c.key] !== void 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
			className: "font-display text-2xl font-bold tracking-tight text-foreground",
			children: ["Welcome back, ", staffUser?.name?.split(" ")[0]]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-sm text-muted-foreground",
			children: [
				"Signed in as",
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-semibold text-primary",
					children: staffUser ? ROLE_LABEL[staffUser.role] || staffUser.role : ""
				}),
				" ",
				"— here's what needs attention."
			]
		})] }), isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Loading overview…"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4",
			children: [visible.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: c.to,
				className: "group rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: `mb-3 grid size-9 place-items-center rounded-xl ${c.tone}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(c.icon, { className: "size-4.5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-2xl font-extrabold text-foreground",
						children: formatCount(stats[c.key] ?? 0)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 text-xs font-medium text-muted-foreground group-hover:text-foreground/80",
						children: c.label
					})
				]
			}, c.key)), !visible.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "col-span-full py-10 text-center text-sm text-muted-foreground",
				children: "Nothing to show yet for your role."
			})]
		})]
	});
}
//#endregion
export { DashboardIndex as component };
