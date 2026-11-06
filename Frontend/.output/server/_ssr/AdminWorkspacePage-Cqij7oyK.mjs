import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { $t as Hash, E as TrendingUp, Fn as CircleQuestionMark, In as CircleCheck, J as ShieldCheck, Nn as CircleX, Nt as Megaphone, Qn as BookOpen, T as TriangleAlert, X as ShieldAlert, c as Wallet, ct as RefreshCw, dn as Eye, et as Server, h as UserRound, in as Gauge, ir as ArrowUpRight, jn as ClipboardCheck, lr as Activity, lt as Radio, nr as Award, nt as Search, p as Users, sn as Flag, un as FileText } from "../_libs/lucide-react.mjs";
import { n as api } from "./api-client-C-W0Sa9i.mjs";
import { a as useQueryClient, n as useMutation, r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { i as getStaffSocket, l as useAuth } from "./auth-context-CsN3soau.mjs";
import { E as formatCount, N as timeAgo } from "./router-BDN0UH9I.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { o as hasPermission } from "./permissions-Bg62BCbG.mjs";
import { a as AdminEmptyState, d as AdminStatCard, i as AdminCardHeader, n as AdminBadge, o as AdminErrorState, r as AdminCard, s as AdminPageHeader, u as AdminSkeletonRows } from "./AdminUI-Cf1j1IrP.mjs";
import { i as AdminLineChart } from "./AdminCharts-DonX7Jjc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AdminWorkspacePage-Cqij7oyK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var pageConfig = {
	operations: {
		title: "Operations Overview",
		description: "A live operational view of Gihanga Updates, backed by real account, content, report, live and interaction records.",
		icon: Activity,
		permission: "operations.view"
	},
	"user-intelligence": {
		title: "User Intelligence",
		description: "Review account profiles, activity, content, reports and account history. Personal account details are restricted to Superadmin.",
		icon: UserRound,
		endpoint: "/system/workspace/users",
		permission: "users.intelligence.view"
	},
	"creator-intelligence": {
		title: "Creator Intelligence",
		description: "Monitor creator reach, publishing activity and audience growth using recorded creator-attributed interactions.",
		icon: Award,
		endpoint: "/system/workspace/creators?sort=views",
		permission: "creator.analytics.view"
	},
	creators: {
		title: "Creator Management",
		description: "Manage the creator directory and identify accounts that may need verification, support or review.",
		icon: Users,
		endpoint: "/system/workspace/creators?sort=newest",
		permission: "creators.view"
	},
	announcements: {
		title: "Notifications & Announcements",
		description: "Prepare platform announcements and, for Superadmin, publish them to active user accounts.",
		icon: Megaphone,
		endpoint: "/system/workspace/announcements",
		permission: "announcements.view"
	},
	security: {
		title: "Security & Risk Intelligence",
		description: "Review evidence-based risk signals, failed moderation jobs and unusual report patterns. Signals are not automatic findings.",
		icon: ShieldAlert,
		endpoint: "/system/workspace/risk",
		permission: "security.view"
	},
	"system-control": {
		title: "System Control Center",
		description: "Inspect current API, database, runtime and moderation-provider health. Secrets are never returned to this console.",
		icon: Server,
		endpoint: "/system/workspace/health",
		permission: "system.health.view"
	},
	support: {
		title: "Support Center",
		description: "Manage user-submitted support tickets, assign priorities, reply to users and track resolution.",
		icon: CircleQuestionMark,
		endpoint: "/system/workspace/support",
		permission: "support.view"
	},
	verification: {
		title: "Verification Center",
		description: "Review pending account verification requests and record reasoned decisions.",
		icon: ShieldCheck,
		endpoint: "/system/workspace/verification",
		permission: "verification.view"
	},
	approvals: {
		title: "Approval & Escalation Center",
		description: "See the current approval workload across verification, appeals, moderation reports and support.",
		icon: ClipboardCheck,
		endpoint: "/system/workspace/approvals",
		permission: "approvals.view"
	},
	"post-review": {
		title: "Post Review",
		description: "Review posts and deeds flagged by the moderation pipeline. Human decisions are recorded against the original content.",
		icon: FileText,
		endpoint: "/system/workspace/moderation-content?type=post&status=pending_review",
		permission: "moderation.content.view"
	},
	"comment-review": {
		title: "Comment Review",
		description: "Review comments held by content moderation and record approval, rejection or escalation decisions.",
		icon: Flag,
		endpoint: "/system/workspace/moderation-content?type=comment&status=pending_review",
		permission: "moderation.content.view"
	},
	"story-review": {
		title: "Decision Review",
		description: "Inspect decisions awaiting moderation and take an accountable review decision.",
		icon: Radio,
		endpoint: "/system/workspace/moderation-content?type=story&status=pending_review",
		permission: "moderation.content.view"
	},
	appeals: {
		title: "Appeals",
		description: "Review users' appeals against moderation decisions. Critical-protocol cases remain subject to the existing escalation safeguards.",
		icon: ClipboardCheck,
		endpoint: "/system/moderation/appeals?status=pending",
		permission: "moderation.appeals.view"
	},
	"user-investigations": {
		title: "User Investigations",
		description: "Review patterns of reports against accounts. Report volume is an investigation lead, not proof of misconduct.",
		icon: Users,
		endpoint: "/system/workspace/investigations",
		permission: "moderation.investigations.view"
	},
	enforcement: {
		title: "Enforcement History",
		description: "Trace moderation and account enforcement actions. Moderators see their own actions; Admin and Superadmin can see the team scope.",
		icon: ShieldAlert,
		endpoint: "/system/workspace/enforcement",
		permission: "moderation.enforcement.view"
	},
	guidelines: {
		title: "Moderation Guidelines",
		description: "A working reference for consistent, evidence-based decisions and safe escalation.",
		icon: BookOpen,
		permission: "moderation.rules.view"
	},
	"my-performance": {
		title: "My Performance",
		description: "Review your own moderation workload and recent decisions. Activity volume is not a substitute for decision quality.",
		icon: Gauge,
		endpoint: "/system/workspace/performance",
		permission: "moderation.stats.view"
	},
	trending: {
		title: "Trending & Discovery",
		description: "Monitor real hashtag records and content-topic momentum to support discovery decisions.",
		icon: Hash,
		endpoint: "/system/workspace/trending",
		permission: "trending.view"
	}
};
var number = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;
var displayDate = (value) => value ? timeAgo(value) : "—";
var statusTone = (status) => {
	if (/approved|published|resolved|active|online|connected/i.test(status)) return "success";
	if (/rejected|failed|banned|suspended|critical|urgent/i.test(status)) return "danger";
	if (/pending|processing|in_progress|waiting|review|draft/i.test(status)) return "warning";
	if (/live|verified/i.test(status)) return "info";
	return "muted";
};
function RecordRow({ title, subtitle, status, date, meta, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3 border-b border-border/60 px-4 py-4 last:border-0 sm:flex-row sm:items-start sm:justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 flex-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-sm font-bold text-foreground",
						children: title
					}), status && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminBadge, {
						tone: statusTone(status),
						children: status.replaceAll("_", " ")
					})]
				}),
				subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 line-clamp-2 text-xs text-muted-foreground",
					children: subtitle
				}),
				(date || meta) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1.5 text-[11px] text-muted-foreground/70",
					children: [
						meta,
						meta && date ? " · " : "",
						date
					]
				})
			]
		}), children && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex shrink-0 flex-wrap items-center gap-2",
			children
		})]
	});
}
function SmallButton({ children, onClick, variant = "primary", disabled }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		disabled,
		onClick,
		className: `inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${variant === "danger" ? "border-danger/25 bg-danger/10 text-danger hover:bg-danger/15" : variant === "muted" ? "border-border bg-muted/50 text-muted-foreground hover:bg-muted" : "border-primary/20 bg-primary/10 text-primary hover:bg-primary/15"}`,
		children
	});
}
function AdminWorkspacePage({ module }) {
	const config = pageConfig[module];
	const { staffUser } = useAuth();
	const queryClient = useQueryClient();
	const [search, setSearch] = (0, import_react.useState)("");
	const [statusFilter, setStatusFilter] = (0, import_react.useState)("pending_review");
	const [days, setDays] = (0, import_react.useState)(30);
	const [selectedUserId, setSelectedUserId] = (0, import_react.useState)("");
	const [notes, setNotes] = (0, import_react.useState)({});
	const [ticketReplies, setTicketReplies] = (0, import_react.useState)({});
	const [announcementTitle, setAnnouncementTitle] = (0, import_react.useState)("");
	const [announcementMessage, setAnnouncementMessage] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		const socket = getStaffSocket();
		if (!socket) return;
		const onActivity = () => {
			queryClient.invalidateQueries({ queryKey: ["staff-workspace", "activity"] });
			queryClient.invalidateQueries({ queryKey: ["staff-workspace", "overview"] });
		};
		socket.on("platform:activity", onActivity);
		return () => {
			socket.off("platform:activity", onActivity);
		};
	}, [queryClient]);
	const canRead = hasPermission(staffUser, config.permission);
	const endpoint = (0, import_react.useMemo)(() => {
		if (!config.endpoint) return "";
		if (module === "user-intelligence") return `${config.endpoint}?q=${encodeURIComponent(search)}&limit=30`;
		if (module === "creator-intelligence" || module === "creators") return `${config.endpoint}&q=${encodeURIComponent(search)}&limit=50`;
		if (module === "support") {
			const supportStatus = [
				"open",
				"in_progress",
				"waiting_user",
				"resolved",
				"closed"
			].includes(statusFilter) ? statusFilter : "";
			return `${config.endpoint}?q=${encodeURIComponent(search)}${supportStatus ? `&status=${supportStatus}` : ""}`;
		}
		if (module === "verification") {
			const verificationStatus = [
				"pending",
				"approved",
				"rejected"
			].includes(statusFilter) ? statusFilter : "pending";
			return `${config.endpoint}?status=${verificationStatus}`;
		}
		if (module === "post-review" || module === "comment-review" || module === "story-review") return `/system/workspace/moderation-content?type=${module === "post-review" ? "post" : module === "comment-review" ? "comment" : "story"}&status=${statusFilter || "pending_review"}`;
		if (module === "appeals") return `/system/moderation/appeals?status=${[
			"pending",
			"approved",
			"rejected"
		].includes(statusFilter) ? statusFilter : "pending"}`;
		return config.endpoint;
	}, [
		config.endpoint,
		module,
		search,
		statusFilter
	]);
	const workspaceQuery = useQuery({
		queryKey: [
			"staff-workspace",
			module,
			endpoint
		],
		queryFn: () => api.get(endpoint, true),
		enabled: canRead && Boolean(endpoint) && module !== "operations",
		staleTime: 1e4,
		refetchInterval: module === "support" || module === "announcements" ? 3e4 : 45e3
	});
	const overviewQuery = useQuery({
		queryKey: ["staff-workspace", "overview"],
		queryFn: () => api.get("/system/workspace/overview", true),
		enabled: canRead && module === "operations",
		refetchInterval: 2e4
	});
	const activityQuery = useQuery({
		queryKey: ["staff-workspace", "activity"],
		queryFn: () => api.get("/system/workspace/activity?limit=40", true),
		enabled: canRead && module === "operations",
		refetchInterval: 12e3
	});
	const analyticsQuery = useQuery({
		queryKey: [
			"staff-workspace",
			"analytics",
			days
		],
		queryFn: () => api.get(`/system/workspace/analytics?days=${days}`, true),
		enabled: canRead && module === "operations" && hasPermission(staffUser, "operations.activity.view"),
		staleTime: 6e4
	});
	const userDetailQuery = useQuery({
		queryKey: [
			"staff-workspace",
			"user-detail",
			selectedUserId
		],
		queryFn: () => api.get(`/system/workspace/users/${selectedUserId}`, true),
		enabled: canRead && module === "user-intelligence" && Boolean(selectedUserId)
	});
	const actionMutation = useMutation({
		mutationFn: async (action) => {
			if (action.kind === "support") return api.patch(`/system/workspace/support/${action.id}`, action.body, true);
			if (action.kind === "creator-revoke") return api.post(`/system/users/${action.id}/remove-creator`, action.body, true);
			if (action.kind === "verification") return api.post(`/system/workspace/verification/${action.id}/decision`, action.body, true);
			if (action.kind === "moderation") return api.post(`/system/moderation/assessments/${action.id}/decision`, action.body, true);
			if (action.kind === "appeal") return api.post(`/system/moderation/appeals/${action.id}/decision`, action.body, true);
			if (action.kind === "announcement-create") return api.post("/system/workspace/announcements", action.body, true);
			return api.post(`/system/workspace/announcements/${action.id}/publish`, action.body || {}, true);
		},
		onSuccess: (_result, action) => {
			toast.success(action.kind === "announcement-publish" ? "Announcement published" : action.kind === "announcement-create" ? "Draft saved" : action.kind === "creator-revoke" ? "Creator status removed" : "Changes saved");
			queryClient.invalidateQueries({ queryKey: ["staff-workspace"] });
			queryClient.invalidateQueries({ queryKey: ["staff", "overview"] });
			queryClient.invalidateQueries({ queryKey: ["staff", "accounts"] });
		},
		onError: (error) => toast.error(error instanceof Error ? error.message : "Action could not be completed")
	});
	const title = module === "operations" ? staffUser?.role === "superadmin" ? "Command Center" : staffUser?.role === "moderator" ? "Moderation Overview" : "Operations Overview" : config.title;
	const response = workspaceQuery.data || {};
	const items = module === "user-intelligence" ? response.users || [] : module === "creator-intelligence" || module === "creators" ? response.creators || [] : module === "announcements" ? response.announcements || [] : module === "support" ? response.tickets || [] : module === "verification" ? response.requests || [] : module === "post-review" || module === "comment-review" || module === "story-review" ? response.records || [] : module === "appeals" ? response.appeals || [] : module === "security" ? response.signals || [] : module === "user-investigations" ? response.investigations || [] : module === "enforcement" ? response.entries || [] : module === "trending" ? response.tags || [] : module === "my-performance" ? response.recent || [] : [];
	const submit = (action) => actionMutation.mutate(action);
	const setNote = (id, value) => setNotes((prev) => ({
		...prev,
		[id]: value
	}));
	const errorMessage = workspaceQuery.error instanceof Error ? workspaceQuery.error.message : "Unable to load this workspace";
	if (!canRead) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminEmptyState, {
		icon: ShieldAlert,
		title: "Permission required",
		description: "Your staff role does not have access to this management area. Contact Superadmin if you believe this is incorrect."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminPageHeader, {
				icon: config.icon,
				title,
				description: config.description,
				accent: module === "security" ? "warning" : module.includes("review") || module === "appeals" ? "success" : "primary",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SmallButton, {
					variant: "muted",
					onClick: () => {
						workspaceQuery.refetch();
						overviewQuery.refetch();
						activityQuery.refetch();
						analyticsQuery.refetch();
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3.5" }), " Refresh"]
				})
			}),
			module === "operations" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OperationsPanel, {
				overview: overviewQuery.data,
				activity: activityQuery.data?.activity || [],
				analytics: analyticsQuery.data,
				days,
				setDays,
				loading: overviewQuery.isLoading,
				error: overviewQuery.error instanceof Error ? overviewQuery.error.message : "",
				canViewFinancial: hasPermission(staffUser, "payments.view") && hasPermission(staffUser, "analytics.revenue"),
				canViewSupport: hasPermission(staffUser, "support.view"),
				canViewVerification: hasPermission(staffUser, "verification.view"),
				canViewAccounts: hasPermission(staffUser, "accounts.view"),
				canViewContent: hasPermission(staffUser, "content.view") || hasPermission(staffUser, "moderation.content.view"),
				canViewReports: hasPermission(staffUser, "moderation.queue.view"),
				canViewCreators: hasPermission(staffUser, "creators.view"),
				canViewLive: hasPermission(staffUser, "live.forceEnd"),
				canViewModeration: hasPermission(staffUser, "moderation.content.view"),
				canViewSystemHealth: hasPermission(staffUser, "system.health.view")
			}),
			module === "user-intelligence" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchBar, {
				value: search,
				onChange: setSearch,
				placeholder: "Search by name, username or email…"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 xl:grid-cols-[1fr_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordList, {
					title: "User directory",
					rows: items,
					loading: workspaceQuery.isLoading,
					error: workspaceQuery.error ? errorMessage : "",
					empty: "No matching user accounts",
					render: (row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordRow, {
						title: `${row.name} · @${row.username}`,
						subtitle: `${row.email} · ${row.followersCount || 0} esteems · ${row.postsCount || 0} posts`,
						status: row.status,
						date: displayDate(row.createdAt),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SmallButton, {
							onClick: () => setSelectedUserId(row._id),
							children: "Inspect profile"
						})
					}, row._id)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCardHeader, {
						title: "Account intelligence",
						subtitle: "Select a user to view their actual activity and administrative history."
					})
				}), !selectedUserId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-4 pb-5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminEmptyState, {
						icon: UserRound,
						title: "No account selected",
						description: "Choose a user from the directory to inspect their profile, content and history."
					})
				}) : userDetailQuery.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminSkeletonRows, { rows: 5 })
				}) : userDetailQuery.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminErrorState, {
						message: "Could not load account details",
						onRetry: () => void userDetailQuery.refetch()
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserDetail, { data: userDetailQuery.data })] })]
			})] }),
			(module === "creator-intelligence" || module === "creators") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `grid gap-4 sm:grid-cols-2 ${hasPermission(staffUser, "creator.analytics.view") ? "xl:grid-cols-4" : "xl:grid-cols-3"}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatCard, {
							icon: Users,
							label: "Creators in directory",
							value: formatCount(response.total ?? items.length),
							tone: "primary",
							hint: "Accounts marked as creators"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatCard, {
							icon: TrendingUp,
							label: "Creator esteems",
							value: formatCount(items.reduce((sum, row) => sum + number(row.followersCount), 0)),
							tone: "aqua",
							hint: "Esteems across the loaded page"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatCard, {
							icon: FileText,
							label: "Published activity",
							value: formatCount(items.reduce((sum, row) => sum + number(row.postsCount), 0)),
							tone: "success",
							hint: "Post count across the loaded page"
						}),
						hasPermission(staffUser, "creator.analytics.view") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatCard, {
							icon: Eye,
							label: "Tracked 30-day views",
							value: formatCount(items.reduce((sum, row) => sum + number(row.views30d), 0)),
							tone: "info",
							hint: "Interactions attributed to creators"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchBar, {
					value: search,
					onChange: setSearch,
					placeholder: "Search creator name or username…"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordList, {
					title: "Creator directory",
					rows: items.filter((row) => !search || `${row.name} ${row.username}`.toLowerCase().includes(search.toLowerCase())),
					loading: workspaceQuery.isLoading,
					error: workspaceQuery.error ? errorMessage : "",
					empty: "No creator accounts found",
					render: (row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RecordRow, {
						title: `${row.name} · @${row.username}`,
						subtitle: `${formatCount(row.followersCount)} esteems · ${formatCount(row.postsCount)} posts${hasPermission(staffUser, "creator.analytics.view") ? ` · ${formatCount(row.views30d)} tracked views / 30d · ${formatCount(row.uniqueAudience30d)} unique audience` : ""}`,
						status: row.status,
						date: displayDate(row.createdAt),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminBadge, {
							tone: row.verified ? "success" : "muted",
							children: row.verified ? "Verified" : "Unverified"
						}), hasPermission(staffUser, "accounts.makeCreator") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							"aria-label": `Reason to remove creator status from ${row.username}`,
							value: notes[`creator:${row._id}`] || "",
							onChange: (e) => setNote(`creator:${row._id}`, e.target.value),
							placeholder: "Reason to revoke",
							className: "h-8 w-36 rounded-lg border border-border bg-background px-2 text-[11px]"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SmallButton, {
							variant: "danger",
							disabled: actionMutation.isPending || (notes[`creator:${row._id}`] || "").trim().length < 5,
							onClick: () => {
								if (window.confirm(`Remove Creator status from @${row.username}? Their account and content will remain intact.`)) submit({
									kind: "creator-revoke",
									id: row._id,
									body: { reason: notes[`creator:${row._id}`].trim() }
								});
							},
							children: "Remove Creator"
						})] })]
					}, row._id)
				})
			] }),
			module === "support" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchBar, {
					value: search,
					onChange: setSearch,
					placeholder: "Search ticket subject or user…"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					value: [
						"open",
						"in_progress",
						"waiting_user",
						"resolved",
						"closed"
					].includes(statusFilter) ? statusFilter : "",
					onChange: (e) => setStatusFilter(e.target.value),
					className: "h-10 rounded-xl border border-border bg-card px-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						children: "All statuses"
					}), [
						"open",
						"in_progress",
						"waiting_user",
						"resolved",
						"closed"
					].map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: v,
						children: v.replaceAll("_", " ")
					}, v))]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordList, {
				title: "Support ticket queue",
				rows: items,
				loading: workspaceQuery.isLoading,
				error: workspaceQuery.error ? errorMessage : "",
				empty: "No support tickets match this filter",
				render: (row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SupportTicketRow, {
					ticket: row,
					reply: ticketReplies[row._id] || "",
					setReply: (v) => setTicketReplies((prev) => ({
						...prev,
						[row._id]: v
					})),
					busy: actionMutation.isPending,
					onUpdate: (body) => submit({
						kind: "support",
						id: row._id,
						body
					}),
					staff: response.staff || [],
					canManage: hasPermission(staffUser, "support.manage")
				}, row._id)
			})] }),
			module === "verification" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
				value: [
					"pending",
					"approved",
					"rejected"
				].includes(statusFilter) ? statusFilter : "pending",
				onChange: setStatusFilter,
				options: [
					"pending",
					"approved",
					"rejected"
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordList, {
				title: "Account verification requests",
				rows: items,
				loading: workspaceQuery.isLoading,
				error: workspaceQuery.error ? errorMessage : "",
				empty: "No verification requests in this view",
				render: (row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border-b border-border/60 p-4 last:border-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm font-bold",
									children: [
										row.user?.name || "Unknown user",
										" · @",
										row.user?.username || "unknown"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminBadge, {
									tone: statusTone(row.status),
									children: row.status
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminBadge, { children: row.category })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted-foreground",
							children: row.statement
						}),
						(row.publicLinks || []).map((url) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: url,
							target: "_blank",
							rel: "noreferrer",
							className: "mt-1 mr-3 inline-block text-xs text-primary underline",
							children: url
						}, url)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-[11px] text-muted-foreground",
							children: ["Submitted ", displayDate(row.createdAt)]
						}),
						row.status === "pending" && hasPermission(staffUser, "verification.review") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-wrap gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: notes[row._id] || "",
									onChange: (e) => setNote(row._id, e.target.value),
									placeholder: "Decision note (optional)",
									className: "h-9 min-w-[200px] flex-1 rounded-lg border border-border bg-background px-3 text-xs"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SmallButton, {
									disabled: actionMutation.isPending,
									onClick: () => submit({
										kind: "verification",
										id: row._id,
										body: {
											action: "approve",
											note: notes[row._id] || ""
										}
									}),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5" }), " Approve"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SmallButton, {
									variant: "danger",
									disabled: actionMutation.isPending || (notes[row._id] || "").trim().length < 5,
									onClick: () => submit({
										kind: "verification",
										id: row._id,
										body: {
											action: "reject",
											note: notes[row._id] || ""
										}
									}),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "size-3.5" }), " Reject"]
								})
							]
						})
					]
				}, row._id)
			})] }),
			module === "announcements" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [hasPermission(staffUser, "announcements.create") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCard, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3 p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCardHeader, {
						title: "Create announcement draft",
						subtitle: "Drafts do not notify users until Superadmin publishes them."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: announcementTitle,
						onChange: (e) => setAnnouncementTitle(e.target.value),
						maxLength: 120,
						placeholder: "Announcement title",
						className: "h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						value: announcementMessage,
						onChange: (e) => setAnnouncementMessage(e.target.value),
						maxLength: 1e3,
						rows: 3,
						placeholder: "Write a clear message for Gihanga Updates users…",
						className: "w-full rounded-xl border border-border bg-background p-3 text-sm"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-[11px] text-muted-foreground",
							children: [announcementMessage.length, "/1000 characters"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SmallButton, {
							disabled: !announcementTitle.trim() || announcementMessage.trim().length < 5 || actionMutation.isPending,
							onClick: () => submit({
								kind: "announcement-create",
								body: {
									title: announcementTitle.trim(),
									message: announcementMessage.trim()
								}
							}),
							children: "Save draft"
						})]
					})
				]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordList, {
				title: "Announcement history",
				rows: items,
				loading: workspaceQuery.isLoading,
				error: workspaceQuery.error ? errorMessage : "",
				empty: "No announcements yet",
				render: (row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordRow, {
					title: row.title,
					subtitle: row.message,
					status: row.status,
					date: displayDate(row.createdAt),
					meta: `${row.recipientsCount || 0} recipients`,
					children: row.status === "draft" && hasPermission(staffUser, "announcements.publish") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SmallButton, {
						disabled: actionMutation.isPending,
						onClick: () => {
							if (window.confirm(`Publish “${row.title}” to all active user accounts?`)) submit({
								kind: "announcement-publish",
								id: row._id
							});
						},
						children: "Publish to users"
					})
				}, row._id)
			})] }),
			(module === "post-review" || module === "comment-review" || module === "story-review") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
				value: statusFilter,
				onChange: setStatusFilter,
				options: [
					"pending_review",
					"failed",
					"processing",
					"rejected",
					"approved"
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordList, {
				title: "Moderation review queue",
				rows: items,
				loading: workspaceQuery.isLoading,
				error: workspaceQuery.error ? errorMessage : "",
				empty: "No moderation records in this queue",
				render: (row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModerationRow, {
					record: row,
					note: notes[row._id] || "",
					setNote: (v) => setNote(row._id, v),
					busy: actionMutation.isPending,
					onDecision: (action) => submit({
						kind: "moderation",
						id: row._id,
						body: {
							action,
							note: notes[row._id] || ""
						}
					}),
					canAct: hasPermission(staffUser, "moderation.assessments.action")
				}, row._id)
			})] }),
			module === "appeals" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
				value: [
					"pending",
					"approved",
					"rejected"
				].includes(statusFilter) ? statusFilter : "pending",
				onChange: setStatusFilter,
				options: [
					"pending",
					"approved",
					"rejected"
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordList, {
				title: "Appeal cases",
				rows: items,
				loading: workspaceQuery.isLoading,
				error: workspaceQuery.error ? errorMessage : "",
				empty: "No appeals in this view",
				render: (row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border-b border-border/60 p-4 last:border-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm font-bold",
								children: [
									row.user?.name || "User appeal",
									" · @",
									row.user?.username || "unknown"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminBadge, {
								tone: statusTone(row.status),
								children: row.status
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-muted-foreground",
							children: row.reason || row.message || "The user requested a review of a moderation decision."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-[11px] text-muted-foreground",
							children: ["Submitted ", displayDate(row.submittedAt)]
						}),
						row.status === "pending" && hasPermission(staffUser, "moderation.appeals.action") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-wrap gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: notes[row._id] || "",
									onChange: (e) => setNote(row._id, e.target.value),
									placeholder: "Required decision note",
									className: "h-9 min-w-[200px] flex-1 rounded-lg border border-border bg-background px-3 text-xs"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SmallButton, {
									disabled: !notes[row._id]?.trim() || actionMutation.isPending,
									onClick: () => submit({
										kind: "appeal",
										id: row._id,
										body: {
											action: "approve",
											note: notes[row._id]
										}
									}),
									children: "Approve appeal"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SmallButton, {
									variant: "danger",
									disabled: !notes[row._id]?.trim() || actionMutation.isPending,
									onClick: () => submit({
										kind: "appeal",
										id: row._id,
										body: {
											action: "reject",
											note: notes[row._id]
										}
									}),
									children: "Reject appeal"
								})
							]
						})
					]
				}, row._id)
			})] }),
			module === "approvals" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ApprovalsPanel, {
				data: response,
				loading: workspaceQuery.isLoading,
				error: workspaceQuery.error ? errorMessage : ""
			}),
			module === "security" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `grid gap-4 sm:grid-cols-2 ${hasPermission(staffUser, "payments.view") && hasPermission(staffUser, "analytics.revenue") ? "xl:grid-cols-3" : "xl:grid-cols-2"}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatCard, {
							icon: TriangleAlert,
							label: "Risk signals",
							value: formatCount(items.length),
							tone: "warning",
							hint: "Seven-day review window"
						}),
						hasPermission(staffUser, "payments.view") && hasPermission(staffUser, "analytics.revenue") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatCard, {
							icon: Wallet,
							label: "Failed transactions",
							value: formatCount(response.failedPayments),
							tone: "danger",
							hint: "Failed status in the last seven days"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatCard, {
							icon: ShieldCheck,
							label: "Automated decisions",
							value: "Human review",
							tone: "success",
							hint: "Signals never trigger penalties by themselves"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordList, {
					title: "Signals requiring attention",
					rows: items,
					loading: workspaceQuery.isLoading,
					error: workspaceQuery.error ? errorMessage : "",
					empty: "No risk signals were returned",
					render: (row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordRow, {
						title: row.title,
						subtitle: row.summary,
						status: row.severity,
						date: displayDate(row.createdAt),
						meta: row.category?.replaceAll("_", " ")
					}, row.id)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: response.note || "Risk signals are investigative prompts only. Verify evidence and apply due process before taking action."
				})
			] }),
			module === "system-control" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SystemHealthPanel, {
				data: response,
				loading: workspaceQuery.isLoading,
				error: workspaceQuery.error ? errorMessage : ""
			}),
			module === "user-investigations" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordList, {
				title: "Accounts with repeated reports",
				rows: items,
				loading: workspaceQuery.isLoading,
				error: workspaceQuery.error ? errorMessage : "",
				empty: "No grouped report patterns found in the last 30 days",
				render: (row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordRow, {
					title: `${row.name || "Unknown account"} · @${row.username || "unknown"}`,
					subtitle: `${row.reportCases} report cases · ${row.reportSubmissions} report submissions · ${row.highSeverityCases} high-severity cases · ${row.pendingCases} open`,
					status: row.status,
					date: displayDate(row.lastReportedAt),
					meta: row.isCreator ? "Creator account" : "Community account"
				}, row._id)
			}),
			module === "enforcement" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordList, {
				title: "Moderation and enforcement trail",
				rows: items,
				loading: workspaceQuery.isLoading,
				error: workspaceQuery.error ? errorMessage : "",
				empty: "No enforcement actions found",
				render: (row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordRow, {
					title: row.action,
					subtitle: `${row.actor?.name || row.actorUsername || "Staff member"}${row.targetUser?.username ? ` → @${row.targetUser.username}` : ""}`,
					status: row.action?.split(".").pop(),
					date: displayDate(row.createdAt),
					meta: row.targetId || "Platform action"
				}, row._id)
			}),
			module === "my-performance" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 sm:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatCard, {
							icon: Activity,
							label: "Actions in 30 days",
							value: formatCount(response.totalActions),
							tone: "primary"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatCard, {
							icon: Flag,
							label: "Reports reviewed",
							value: formatCount(response.reviewedReports),
							tone: "aqua"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatCard, {
							icon: CircleCheck,
							label: "Assessments reviewed",
							value: formatCount(response.reviewedAssessments),
							tone: "success"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCardHeader, {
						title: "Recent personal activity",
						subtitle: "Your own recorded staff actions"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordList, {
					title: "Recent personal activity",
					rows: items,
					loading: workspaceQuery.isLoading,
					error: workspaceQuery.error ? errorMessage : "",
					empty: "No recent actions",
					render: (row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordRow, {
						title: row.action,
						subtitle: row.targetId || row.meta?.contentType || "Staff action",
						date: displayDate(row.createdAt)
					}, row._id)
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: response.qualityNote
				})
			] }),
			module === "trending" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordList, {
				title: "Trending hashtag records",
				rows: items,
				loading: workspaceQuery.isLoading,
				error: workspaceQuery.error ? errorMessage : "",
				empty: "No hashtag records available",
				render: (row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordRow, {
					title: `#${row.tag}`,
					subtitle: `${formatCount(row.postsCount)} posts`,
					status: row.category || "community",
					meta: `Trend score ${number(row.trend).toFixed(2)}`,
					date: displayDate(row.updatedAt)
				}, row._id)
			}),
			module === "guidelines" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GuidelinesPanel, {}),
			![
				"operations",
				"user-intelligence",
				"creator-intelligence",
				"creators",
				"announcements",
				"security",
				"system-control",
				"support",
				"verification",
				"approvals",
				"post-review",
				"comment-review",
				"story-review",
				"appeals",
				"user-investigations",
				"enforcement",
				"my-performance",
				"trending",
				"guidelines"
			].includes(module) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminEmptyState, {
				icon: config.icon,
				title: "Workspace module unavailable",
				description: "This module is not configured."
			})
		]
	});
}
function SearchBar({ value, onChange, placeholder }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-10 min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-border bg-card px-3.5 focus-within:border-ring",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			value,
			onChange: (e) => onChange(e.target.value),
			placeholder,
			className: "h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
		})]
	});
}
function FilterSelect({ value, onChange, options }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
		value,
		onChange: (e) => onChange(e.target.value),
		className: "h-10 rounded-xl border border-border bg-card px-3 text-sm text-foreground",
		children: options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
			value: option,
			children: option.replaceAll("_", " ")
		}, option))
	});
}
function RecordList({ title, rows, loading, error, empty, render }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCardHeader, {
			title,
			subtitle: `${rows.length} record${rows.length === 1 ? "" : "s"} loaded`
		})
	}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "px-4 pb-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminSkeletonRows, { rows: 5 })
	}) : error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminErrorState, { message: error })
	}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "px-4 pb-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminEmptyState, {
			icon: Search,
			title: empty
		})
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: rows.map(render) })] });
}
function OperationsPanel({ overview, activity, analytics, days, setDays, loading, error, canViewFinancial, canViewSupport, canViewVerification, canViewAccounts, canViewContent, canViewReports, canViewCreators, canViewLive, canViewModeration, canViewSystemHealth }) {
	const stats = overview?.stats || {};
	const series = (analytics?.series || []).map((row) => ({
		label: new Date(row.date).toLocaleDateString(void 0, {
			month: "short",
			day: "numeric"
		}),
		"New users": row.newUsers ?? 0,
		Posts: row.posts ?? 0,
		Reports: row.reports ?? 0,
		"Content views": row.contentViews ?? 0,
		"Active users": row.activeUsers ?? 0
	}));
	const chartSeries = [
		...canViewAccounts ? [{
			key: "New users",
			name: "New users",
			colorIndex: 1
		}] : [],
		...canViewContent ? [{
			key: "Posts",
			name: "Posts",
			colorIndex: 2
		}, {
			key: "Content views",
			name: "Content views",
			colorIndex: 3
		}] : [],
		...canViewReports ? [{
			key: "Reports",
			name: "Reports",
			colorIndex: 4
		}] : [],
		{
			key: "Active users",
			name: "Active users",
			colorIndex: 5
		}
	];
	const statCards = [
		...canViewAccounts ? [{
			icon: Users,
			label: "Registered users",
			value: formatCount(stats.totalUsers),
			hint: `+${formatCount(stats.newUsers24h)} in the last 24 hours`,
			tone: "primary"
		}] : [],
		{
			icon: Activity,
			label: "Content-active users",
			value: formatCount(stats.contentActiveUsers24h),
			hint: "Distinct users with recorded content interactions in 24h",
			tone: "aqua"
		},
		...canViewContent ? [{
			icon: FileText,
			label: "Published content records",
			value: formatCount(number(stats.totalPosts) + number(stats.totalStories)),
			hint: `${formatCount(stats.totalPosts)} posts · ${formatCount(stats.totalStories)} decisions`,
			tone: "success"
		}] : [],
		...canViewReports ? [{
			icon: Flag,
			label: "Open reports",
			value: formatCount(stats.pendingReports),
			hint: `${formatCount(stats.highReports)} high severity`,
			tone: stats.pendingReports ? "warning" : "muted"
		}] : [],
		...canViewCreators ? [{
			icon: Award,
			label: "Creator accounts",
			value: formatCount(stats.totalCreators),
			hint: `+${formatCount(stats.newCreators30d)} newly created in 30 days`,
			tone: "accent"
		}] : [],
		...canViewLive ? [{
			icon: Radio,
			label: "Live sessions now",
			value: formatCount(stats.liveNow),
			hint: "Current live stream status",
			tone: "info"
		}] : [],
		...canViewContent ? [{
			icon: Eye,
			label: "Recorded content views",
			value: formatCount(stats.contentViews24h),
			hint: "Last 24 hours; event-tracked views",
			tone: "primary"
		}] : [],
		...canViewModeration ? [{
			icon: ShieldAlert,
			label: "Pending content assessments",
			value: formatCount(stats.pendingAssessments),
			hint: "Items awaiting human review",
			tone: "warning"
		}] : [],
		...canViewSystemHealth ? [{
			icon: Server,
			label: "Failed moderation jobs",
			value: formatCount(stats.failedModerationJobs),
			hint: "Pipeline jobs requiring attention",
			tone: "warning"
		}] : [],
		...canViewSupport ? [{
			icon: CircleQuestionMark,
			label: "Open support tickets",
			value: formatCount(stats.pendingSupport),
			hint: "Current open and in-progress cases",
			tone: "aqua"
		}] : [],
		...canViewVerification ? [{
			icon: ShieldCheck,
			label: "Pending verifications",
			value: formatCount(stats.pendingVerification),
			hint: "Awaiting authorized review",
			tone: "info"
		}] : [],
		...canViewFinancial ? [{
			icon: Wallet,
			label: "Ad payment revenue",
			value: `${formatCount(stats.adRevenueRwf)} RWF`,
			hint: "Completed ad_payment transactions only",
			tone: "success"
		}] : []
	];
	if (loading && !overview) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminSkeletonRows, { rows: 8 });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminErrorState, { message: error }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
			children: statCards.map((card) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatCard, {
				icon: card.icon,
				label: card.label,
				value: card.value,
				hint: card.hint,
				tone: card.tone
			}, card.label))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCardHeader, {
					title: "Platform activity trends",
					subtitle: "Daily counts from persisted app records and interaction events."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
					value: String(days),
					onChange: (v) => setDays(Number(v)),
					options: [
						"7",
						"30",
						"90"
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-3 pb-4",
				children: series.length && chartSeries.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminLineChart, {
					data: series,
					series: chartSeries,
					height: 280
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminEmptyState, {
					icon: TrendingUp,
					title: "No analytics series yet",
					description: "Activity trends will appear once there are records for this period."
				})
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCardHeader, {
					title: "Live platform activity",
					subtitle: "Recent app activity, refreshed every 12 seconds"
				})
			}), activity.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "max-h-[390px] overflow-y-auto",
				children: activity.slice(0, 16).map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-3 border-t border-border/50 px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "size-4" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold text-foreground",
							children: event.summary
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-[11px] text-muted-foreground",
							children: [
								event.actor?.name ? `${event.actor.name} · ` : "",
								event.category,
								" · ",
								displayDate(event.createdAt)
							]
						})]
					})]
				}, event.id))
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-4 pb-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminEmptyState, {
					icon: Activity,
					title: "No recent activity",
					description: "New registrations, content, reports and live events will appear here."
				})
			})] })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[11px] text-muted-foreground",
			children: "Metrics are limited to your current staff permissions. Active users are distinct accounts with persisted interaction events in the selected time window; content views are observed interaction events and ad revenue is completed ad_payment transactions in RWF only."
		})
	] });
}
function UserDetail({ data }) {
	const user = data.user;
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminEmptyState, {
			icon: UserRound,
			title: "Account not found"
		})
	});
	const sections = [
		{
			title: "Recent reports",
			rows: (data.reports || []).slice(0, 6),
			empty: "No report records found for this account."
		},
		{
			title: "Recorded interactions · last 90 days",
			rows: (data.interactions || []).slice(0, 8),
			empty: "No recorded interactions in this period."
		},
		{
			title: "Administrative history",
			rows: (data.administrativeHistory || []).slice(0, 6),
			empty: "No administrative actions linked to this account."
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4 p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-lg font-extrabold text-primary",
					children: String(user.name || "?").slice(0, 1).toUpperCase()
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate font-bold",
							children: user.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "truncate text-xs text-muted-foreground",
							children: [
								"@",
								user.username,
								" · ",
								user.email
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-[10px] text-muted-foreground",
							children: ["Joined ", displayDate(user.createdAt)]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-2",
				children: [
					["Esteems", user.followersCount],
					["Estemmed", user.followingCount],
					["Posts", user.postsCount],
					["Strikes", user.strikes]
				].map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl bg-muted/50 p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-lg font-extrabold",
						children: formatCount(number(value))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] text-muted-foreground",
						children: label
					})]
				}, String(label)))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminBadge, {
						tone: statusTone(user.status),
						children: user.status
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminBadge, {
						tone: user.verified ? "success" : "muted",
						children: user.verified ? "Verified" : "Unverified"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminBadge, { children: user.isCreator ? "Creator" : "Member" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminBadge, {
						tone: user.emailVerified ? "success" : "muted",
						children: user.emailVerified ? "Email verified" : "Email unverified"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground",
				children: "Recent content"
			}), (data.posts || []).slice(0, 6).length ? (data.posts || []).slice(0, 6).map((post) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-t border-border/50 py-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs font-semibold",
							children: [
								post.kind,
								" · ",
								post.status
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] text-muted-foreground",
							children: displayDate(post.createdAt)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "line-clamp-2 text-xs text-muted-foreground",
						children: post.body || "Media post"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-[10px] text-muted-foreground",
						children: [
							formatCount(post.viewsCount),
							" views · ",
							formatCount(post.likesCount),
							" likes · ",
							formatCount(post.commentsCount),
							" comments"
						]
					})
				]
			}, post._id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "No recent content."
			})] }),
			sections.map((section, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground",
				children: section.title
			}), section.rows.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-2",
				children: section.rows.map((entry, entryIndex) => {
					const report = index === 0;
					const interaction = index === 1;
					const title = report ? `${entry.reason || "Report"} · ${entry.severity || "unrated"}` : interaction ? String(entry.event || "interaction").replaceAll("_", " ") : String(entry.action || "Administrative action").replaceAll(".", " ");
					const detail = report ? entry.actionNote || `Report status: ${entry.status || "unknown"}` : interaction ? `${entry.targetKind || "Platform"}${entry.watchPercentage != null ? ` · ${entry.watchPercentage}% watched` : ""}` : typeof entry.meta === "object" && entry.meta ? Object.entries(entry.meta).map(([key, value]) => `${key}: ${String(value)}`).join(" · ") : "Recorded administrative action";
					const actor = !report && !interaction ? entry.actor?.name || entry.actor?.username : void 0;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border/60 bg-card/60 p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-semibold capitalize",
									children: title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] text-muted-foreground",
									children: displayDate(entry.createdAt)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: [detail, actor ? ` · By ${actor}` : ""]
							}),
							report && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminBadge, {
								tone: statusTone(entry.status || "pending"),
								children: entry.status || "unknown"
							})
						]
					}, entry._id || `${section.title}-${entryIndex}`);
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: section.empty
			})] }, section.title))
		]
	});
}
function SupportTicketRow({ ticket, reply, setReply, busy, onUpdate, staff, canManage }) {
	const [staffNote, setStaffNote] = (0, import_react.useState)(ticket.staffNote || "");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border-b border-border/60 p-4 last:border-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-bold",
						children: ticket.subject
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminBadge, {
						tone: statusTone(ticket.status),
						children: ticket.status?.replaceAll("_", " ")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminBadge, {
						tone: ticket.priority === "urgent" ? "danger" : ticket.priority === "high" ? "warning" : "muted",
						children: ticket.priority
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: [
					ticket.user?.name || "User",
					" · @",
					ticket.user?.username || "unknown",
					" · ",
					ticket.category
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-foreground/85",
				children: ticket.message
			}),
			Array.isArray(ticket.messages) && ticket.messages.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 space-y-2 rounded-xl bg-muted/40 p-3",
				children: ticket.messages.slice(-4).map((message, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-[10px] font-bold uppercase text-muted-foreground",
					children: [
						message.senderRole || "user",
						" · ",
						displayDate(message.createdAt)
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-foreground/85",
					children: message.body
				})] }, `${message.createdAt || "message"}-${index}`))
			}),
			canManage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					value: reply,
					onChange: (e) => setReply(e.target.value),
					rows: 2,
					placeholder: "Reply to the user…",
					className: "mt-3 w-full rounded-lg border border-border bg-background p-2.5 text-xs"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 grid gap-2 sm:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: ticket.assignedTo?._id || "",
						onChange: (e) => onUpdate({ assignedTo: e.target.value || null }),
						className: "h-9 rounded-lg border border-border bg-background px-2 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Unassigned"
						}), staff.map((person) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
							value: person._id,
							children: [
								person.name,
								" · ",
								person.role
							]
						}, person._id))]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: ticket.priority || "normal",
						onChange: (e) => onUpdate({ priority: e.target.value }),
						className: "h-9 rounded-lg border border-border bg-background px-2 text-xs",
						children: [
							"low",
							"normal",
							"high",
							"urgent"
						].map((priority) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
							value: priority,
							children: [priority, " priority"]
						}, priority))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SmallButton, {
						disabled: busy || !reply.trim(),
						onClick: () => {
							onUpdate({
								reply: reply.trim(),
								status: "waiting_user"
							});
							setReply("");
						},
						children: "Send reply"
					}), [
						"open",
						"in_progress",
						"waiting_user",
						"resolved",
						"closed"
					].map((status) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SmallButton, {
						variant: "muted",
						disabled: busy || ticket.status === status,
						onClick: () => onUpdate({ status }),
						children: status.replaceAll("_", " ")
					}, status))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: staffNote,
						onChange: (e) => setStaffNote(e.target.value),
						maxLength: 2e3,
						placeholder: "Internal note — visible to staff only",
						className: "h-9 min-w-[220px] flex-1 rounded-lg border border-border bg-background px-3 text-xs"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SmallButton, {
						variant: "muted",
						disabled: busy || staffNote === (ticket.staffNote || ""),
						onClick: () => onUpdate({ staffNote }),
						children: "Save internal note"
					})]
				})
			] }),
			" ",
			!canManage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-[11px] text-muted-foreground",
				children: "Read-only support access. Ticket changes require the support.manage permission."
			})
		]
	});
}
function ModerationRow({ record, note, setNote, busy, onDecision, canAct }) {
	const content = record.content?.post || record.content?.story || record.content?.comment || record.content || {};
	const body = content.body || content.caption || record.userMessage || record.error || "Content was flagged for human review.";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border-b border-border/60 p-4 last:border-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm font-bold",
						children: [
							record.contentType,
							" · ",
							record.author?.name || "Unknown author",
							" (@",
							record.author?.username || "unknown",
							")"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminBadge, {
						tone: record.severity === "critical" || record.severity === "high" ? "danger" : "warning",
						children: record.severity || "review"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminBadge, {
						tone: statusTone(record.status),
						children: record.status
					}),
					record.criticalEscalation && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminBadge, {
						tone: "danger",
						children: "Critical protocol"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 whitespace-pre-wrap text-sm text-foreground/85",
				children: String(body).slice(0, 600)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-[11px] text-muted-foreground",
				children: [
					record.categories?.join(", ") || "Automated content-safety assessment",
					" · ",
					displayDate(record.createdAt)
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: canAct ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: note,
						onChange: (e) => setNote(e.target.value),
						placeholder: "Reason required for reject / escalate",
						className: "h-9 min-w-[220px] flex-1 rounded-lg border border-border bg-background px-3 text-xs"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SmallButton, {
						disabled: busy || Boolean(record.criticalEscalation),
						onClick: () => onDecision("approve"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5" }), " Approve"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SmallButton, {
						variant: "danger",
						disabled: busy || !note.trim(),
						onClick: () => onDecision("reject"),
						children: "Reject"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SmallButton, {
						variant: "muted",
						disabled: busy || !note.trim(),
						onClick: () => onDecision("escalate"),
						children: "Escalate"
					})
				] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] text-muted-foreground",
					children: "Read-only review access. Decision permission is not assigned."
				})
			})
		]
	});
}
function ApprovalsPanel({ data, loading, error }) {
	const counts = data.counts || {};
	const tiles = [
		[
			"Verification",
			counts.verification,
			"/system/dashboard/verification"
		],
		[
			"Appeals",
			counts.appeals,
			"/system/dashboard/appeals"
		],
		[
			"Reports",
			counts.reports,
			"/system/dashboard/moderation"
		],
		[
			"AI review queue",
			counts.moderation,
			"/system/dashboard/moderation"
		],
		[
			"Support tickets",
			counts.support,
			"/system/dashboard/support"
		]
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminErrorState, { message: error }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-5",
			children: tiles.map(([label, value, to]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
				href: String(to),
				className: "rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-2xl font-extrabold",
						children: loading ? "—" : formatCount(value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-[11px] font-bold text-primary",
						children: ["Open queue ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "inline size-3" })]
					})
				]
			}, String(label)))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordList, {
			title: "Verification waiting for review",
			rows: data.verification || [],
			loading,
			error: "",
			empty: "No verification approvals pending",
			render: (row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordRow, {
				title: `${row.user?.name || "User"} · @${row.user?.username || "unknown"}`,
				subtitle: row.statement,
				status: "pending",
				date: displayDate(row.createdAt)
			}, row._id)
		})
	] });
}
function SystemHealthPanel({ data, loading, error }) {
	const cards = [
		[
			"API",
			data.api?.status,
			data.api?.environment
		],
		[
			"Database",
			data.database?.status,
			data.database?.name
		],
		[
			"Moderation",
			data.moderation?.enabled ? "enabled" : "disabled",
			data.moderation?.failClosed ? "Fail-closed" : "Provider state"
		]
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-4 sm:grid-cols-3",
			children: cards.map(([label, status, meta]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatCard, {
				icon: label === "Database" ? Activity : label === "Moderation" ? ShieldCheck : Server,
				label: String(label),
				value: loading ? "…" : String(status || "unknown"),
				tone: statusTone(String(status || "unknown")),
				hint: String(meta || "No additional detail")
			}, String(label)))
		}),
		error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminErrorState, { message: error }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-5 md:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCardHeader, {
					title: "Runtime diagnostics",
					subtitle: "Current backend process only"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3 px-4 pb-4 text-xs",
				children: [
					["Node runtime", data.api?.nodeVersion],
					["Uptime", data.api?.uptimeSeconds ? `${Math.floor(data.api.uptimeSeconds / 3600)}h ${Math.floor(data.api.uptimeSeconds % 3600 / 60)}m` : "—"],
					["RSS memory", data.runtime?.memoryRssMb ? `${data.runtime.memoryRssMb} MB` : "—"],
					["Heap used", data.runtime?.heapUsedMb ? `${data.runtime.heapUsedMb} MB` : "—"],
					["Checked", displayDate(data.checkedAt)]
				].map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between gap-3 border-b border-border/50 pb-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted-foreground",
						children: label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: String(value || "—") })]
				}, String(label)))
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCardHeader, {
					title: "Moderation providers",
					subtitle: "Secret-free provider readiness summary"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2 px-4 pb-4 text-xs",
				children: [Object.entries(data.moderation?.providers || {}).map(([name, provider]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3 rounded-lg bg-muted/40 p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-semibold capitalize",
						children: name.replaceAll(/([A-Z])/g, " $1")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminBadge, {
						tone: provider.configured ? "success" : "warning",
						children: provider.configured ? "Configured" : "Not configured"
					})]
				}, name)), (data.moderation?.warnings || []).map((warning) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-lg bg-warning/10 p-2 text-warning",
					children: warning
				}, warning))]
			})] })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted-foreground",
			children: (data.limitations || []).join(" ")
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				className: "rounded-lg border border-border px-3 py-2 text-xs font-bold text-primary",
				href: "/system/dashboard/settings",
				children: "Platform settings"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				className: "rounded-lg border border-border px-3 py-2 text-xs font-bold text-primary",
				href: "/system/dashboard/ad-settings",
				children: "Ad settings & rates"
			})]
		})
	] });
}
function GuidelinesPanel() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid gap-4 md:grid-cols-2",
		children: [
			["Assess the actual content", "Review the specific post, comment, story or live context. Do not make a decision from a report count alone."],
			["Use proportional enforcement", "Apply the least restrictive action that addresses the documented policy concern, following the platform's configured rules."],
			["Document non-approval decisions", "Rejection and escalation actions require a clear staff note in the moderation API. Notes become part of the review record."],
			["Escalate critical-protocol records", "Critical records cannot be approved through the standard assessment endpoint. Follow the existing escalation procedure."],
			["Preserve user due process", "Use appeal review for eligible cases, disclose only appropriate information, and avoid exposing reporter identity."],
			["Treat AI as assistance", "AI moderation classifications and provider errors are review signals. A human should resolve uncertain or high-impact cases."]
		].map(([title, body], index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCard, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-3 p-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-sm font-extrabold text-primary",
				children: index + 1
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-bold",
				children: title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs leading-relaxed text-muted-foreground",
				children: body
			})] })]
		}) }, title))
	});
}
//#endregion
export { AdminWorkspacePage as t };
