import { o as __toESM } from "../_runtime.mjs";
import { r as cn, t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { D as Trash2, Jt as HeartHandshake, Nn as Check, Tt as MessageSquareWarning, Un as Ban, V as SlidersVertical, Y as ShieldAlert, Zn as Activity, a as X, w as TriangleAlert } from "../_libs/lucide-react.mjs";
import { n as api, s as mediaUrl } from "./api-client-DZOxvrvB.mjs";
import { a as useQueryClient, n as useMutation, r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { l as useAuth } from "./auth-context-CuF8V2_l.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { r as hasPermission } from "./permissions-CGE25KsA.mjs";
import { _ as AdminToggle, a as AdminEmptyState, i as AdminCardHeader, l as AdminSegmented, n as AdminBadge, r as AdminCard, s as AdminPageHeader, u as AdminSkeletonRows } from "./AdminUI-Cf1j1IrP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/system.dashboard.moderation-CGHPW_YM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useModerationQueue(status) {
	return useQuery({
		queryKey: [
			"staff",
			"moderation",
			"queue",
			status
		],
		queryFn: () => api.get(`/system/moderation/queue?status=${status}`, true)
	});
}
function useActionReport() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, action, reason }) => api.post(`/system/moderation/reports/${id}/action`, {
			action,
			reason
		}, true),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: [
			"staff",
			"moderation",
			"queue"
		] })
	});
}
function useModerationRules() {
	return useQuery({
		queryKey: [
			"staff",
			"moderation",
			"rules"
		],
		queryFn: () => api.get("/system/moderation/rules", true)
	});
}
function useUpdateModerationRule() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ key, ...input }) => api.put(`/system/moderation/rules/${key}`, input, true),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: [
			"staff",
			"moderation",
			"rules"
		] })
	});
}
function useAssessmentsQueue(status, criticalOnly = false) {
	return useQuery({
		queryKey: [
			"staff",
			"moderation",
			"assessments",
			status,
			criticalOnly
		],
		queryFn: () => api.get(`/system/moderation/assessments?status=${status}${criticalOnly ? "&critical=true" : ""}`, true),
		refetchInterval: status === "pending_review" ? 3e4 : false
	});
}
function useAssessmentDecision() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, action, note }) => api.post(`/system/moderation/assessments/${id}/decision`, {
			action,
			note
		}, true),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [
				"staff",
				"moderation",
				"assessments"
			] });
			queryClient.invalidateQueries({ queryKey: [
				"staff",
				"moderation",
				"statistics"
			] });
		}
	});
}
function useAppeals(status) {
	return useQuery({
		queryKey: [
			"staff",
			"moderation",
			"appeals",
			status
		],
		queryFn: () => api.get(`/system/moderation/appeals?status=${status}`, true)
	});
}
function useAppealDecision() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, action, note }) => api.post(`/system/moderation/appeals/${id}/decision`, {
			action,
			note
		}, true),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: [
			"staff",
			"moderation",
			"appeals"
		] })
	});
}
function useModerationHealth() {
	return useQuery({
		queryKey: [
			"staff",
			"moderation",
			"health"
		],
		queryFn: () => api.get("/system/moderation/health", true),
		refetchInterval: 6e4
	});
}
var pageTabs = [
	"reports",
	"ai-review",
	"appeals",
	"health"
];
var PAGE_TAB_META = {
	reports: {
		label: "User reports",
		hint: "Reports filed by users against content or accounts."
	},
	"ai-review": {
		label: "AI review",
		hint: "Content flagged by automated safety checks and awaiting a human decision."
	},
	appeals: {
		label: "Appeals",
		hint: "Users asking for a second look at rejected content."
	},
	health: {
		label: "System health",
		hint: "Moderation providers and processing pipeline status."
	}
};
function ActionRow({ report, index }) {
	const { staffUser } = useAuth();
	const actionReport = useActionReport();
	const [reasonFor, setReasonFor] = (0, import_react.useState)(null);
	const [reason, setReason] = (0, import_react.useState)("");
	const canAction = hasPermission(staffUser, "moderation.queue.action");
	function run(action) {
		actionReport.mutate({
			id: report._id,
			action,
			reason: reason.trim() || void 0
		}, {
			onSuccess: () => {
				toast.success(`Report ${action === "dismiss" ? "dismissed" : `actioned: ${action}`}`);
				setReasonFor(null);
				setReason("");
			},
			onError: (err) => toast.error(err.message || "Action failed")
		});
	}
	const media = mediaUrl(report.targetPost?.thumbnailUrl || report.targetPost?.mediaUrl);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
		initial: {
			opacity: 0,
			y: 10
		},
		animate: {
			opacity: 1,
			y: 0
		},
		transition: {
			duration: .3,
			delay: Math.min(index * .05, .4)
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, {
			className: "p-4 transition-shadow hover:shadow-float/50 sm:p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start gap-3.5",
				children: [media && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: media,
					alt: "",
					className: "size-16 shrink-0 rounded-xl border border-border object-cover sm:size-20"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminBadge, {
									tone: report.severity === "high" ? "danger" : report.severity === "medium" ? "warning" : "muted",
									children: report.severity
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm font-bold text-foreground",
									children: report.reason
								}),
								report.reportsCount > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminBadge, {
									tone: "info",
									children: [
										"×",
										report.reportsCount,
										" reports"
									]
								}),
								report.status !== "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminBadge, {
									tone: report.status === "resolved" ? "success" : "muted",
									children: report.status
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1.5 text-xs text-muted-foreground",
							children: [
								"Reported by",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-semibold text-foreground/80",
									children: ["@", report.reporter?.username]
								}),
								" ",
								"against",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-semibold text-foreground/80",
									children: ["@", report.target?.username]
								}),
								report.targetLive && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [" · live: ", report.targetLive.title] })
							]
						}),
						report.excerpt && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 rounded-lg bg-muted/40 px-3 py-2 text-sm text-foreground/80",
							children: [
								"\"",
								report.excerpt,
								"\""
							]
						}),
						report.targetPost?.body && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 line-clamp-2 text-sm text-foreground/75",
							children: report.targetPost.body
						})
					]
				})]
			}), canAction && report.status === "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 border-t border-border pt-3.5",
				children: reasonFor ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							autoFocus: true,
							value: reason,
							onChange: (e) => setReason(e.target.value),
							placeholder: "Reason (required)…",
							className: "h-9 min-w-[180px] flex-1 rounded-lg border border-border bg-elevated px-3 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "destructive",
							disabled: !reason.trim() || actionReport.isPending,
							onClick: () => run(reasonFor),
							children: ["Confirm ", reasonFor]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							className: "text-muted-foreground",
							onClick: () => setReasonFor(null),
							children: "Cancel"
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							className: "border-border text-foreground/90 hover:bg-muted",
							onClick: () => setReasonFor("warn"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquareWarning, { className: "size-3.5" }), " Warn"]
						}),
						report.targetPost && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							className: "border-border text-foreground/90 hover:bg-muted",
							onClick: () => setReasonFor("remove"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" }), " Remove content"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "destructive",
							onClick: () => setReasonFor("suspend"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ban, { className: "size-3.5" }), " Suspend account"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "ghost",
							className: "text-muted-foreground hover:bg-muted",
							onClick: () => run("dismiss"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" }), " Dismiss"]
						})
					]
				})
			})]
		})
	});
}
function AssessmentRow({ record, index }) {
	const { staffUser } = useAuth();
	const decision = useAssessmentDecision();
	const [noteFor, setNoteFor] = (0, import_react.useState)(null);
	const [note, setNote] = (0, import_react.useState)("");
	const canAction = hasPermission(staffUser, "moderation.assessments.action");
	function run(action) {
		decision.mutate({
			id: record._id,
			action,
			...note.trim() ? { note: note.trim() } : {}
		}, {
			onSuccess: () => {
				toast.success(`Assessment ${action === "approve" ? "approved" : action === "reject" ? "rejected" : "escalated"}`);
				setNoteFor(null);
				setNote("");
			},
			onError: (err) => toast.error(err.message || "Action failed")
		});
	}
	const media = record.content?.post ? mediaUrl(record.content.post.thumbnailUrl || record.content.post.mediaUrl) : record.content?.story ? mediaUrl(record.content.story.mediaUrl) : void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
		initial: {
			opacity: 0,
			y: 10
		},
		animate: {
			opacity: 1,
			y: 0
		},
		transition: {
			duration: .3,
			delay: Math.min(index * .05, .4)
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, {
			className: cn("p-4 sm:p-5", record.criticalEscalation && "border-danger/50 bg-danger/[0.03]"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start gap-3.5",
				children: [media && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: media,
					alt: "",
					className: "size-16 shrink-0 rounded-xl border border-border object-cover sm:size-20"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [
								record.criticalEscalation && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminBadge, {
									tone: "danger",
									children: "Critical protocol"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminBadge, {
									tone: record.severity === "critical" || record.severity === "high" ? "danger" : record.severity === "medium" ? "warning" : "muted",
									children: record.severity
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm font-bold text-foreground capitalize",
									children: record.contentType.replace("_", " ")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs text-muted-foreground",
									children: ["by @", record.author?.username ?? "unknown"]
								})
							]
						}),
						record.categories.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 flex flex-wrap gap-1.5",
							children: record.categories.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminBadge, {
								tone: "info",
								children: [
									c.category.replace(/_/g, " "),
									" · ",
									c.score.toFixed(2)
								]
							}, i))
						}),
						record.content?.post?.body && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 line-clamp-2 text-sm text-foreground/80",
							children: record.content.post.body
						}),
						record.content?.comment?.body && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 line-clamp-2 text-sm text-foreground/80",
							children: [
								"\"",
								record.content.comment.body,
								"\""
							]
						}),
						record.error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-xs text-danger/80",
							children: ["Processing error: ", record.error]
						})
					]
				})]
			}), canAction && record.status === "pending_review" && !record.reviewedAt && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 border-t border-border pt-3.5",
				children: noteFor ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							autoFocus: true,
							value: note,
							onChange: (e) => setNote(e.target.value),
							placeholder: noteFor === "approve" ? "Note (optional)…" : "Reason (required)…",
							className: "h-9 min-w-[180px] flex-1 rounded-lg border border-border bg-elevated px-3 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: noteFor === "approve" ? "default" : "destructive",
							disabled: noteFor !== "approve" && !note.trim(),
							onClick: () => run(noteFor),
							children: ["Confirm ", noteFor]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							className: "text-muted-foreground",
							onClick: () => setNoteFor(null),
							children: "Cancel"
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							onClick: () => setNoteFor("approve"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5" }), " Approve & publish"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "destructive",
							onClick: () => setNoteFor("reject"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" }), " Reject"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "ghost",
							className: "text-muted-foreground hover:bg-muted",
							onClick: () => setNoteFor("escalate"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-3.5" }), " Escalate"]
						})
					]
				})
			})]
		})
	});
}
function AssessmentsPanel() {
	const [tab, setTab] = (0, import_react.useState)("pending_review");
	const { data, isLoading } = useAssessmentsQueue(tab);
	const records = data?.records ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminSegmented, {
				options: [
					{
						id: "pending_review",
						label: "Pending review"
					},
					{
						id: "failed",
						label: "Failed"
					},
					{
						id: "rejected",
						label: "Rejected"
					},
					{
						id: "approved",
						label: "Approved"
					}
				],
				value: tab,
				onChange: setTab
			}),
			isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminSkeletonRows, { rows: 3 }),
			!isLoading && !records.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminEmptyState, {
				icon: Check,
				title: "Nothing needs review right now",
				description: "AI-flagged content that requires a human decision will appear here."
			}),
			records.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssessmentRow, {
				record: r,
				index: i
			}, r._id))
		]
	});
}
function AppealRow({ appeal, index }) {
	const { staffUser } = useAuth();
	const decision = useAppealDecision();
	const [note, setNote] = (0, import_react.useState)("");
	const canAction = hasPermission(staffUser, "moderation.appeals.action");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
		initial: {
			opacity: 0,
			y: 10
		},
		animate: {
			opacity: 1,
			y: 0
		},
		transition: {
			duration: .3,
			delay: Math.min(index * .05, .4)
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, {
			className: "p-4 sm:p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-8 place-items-center rounded-lg bg-primary-soft text-primary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeartHandshake, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-sm font-bold text-foreground",
							children: ["@", appeal.user?.username ?? "unknown"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs text-muted-foreground",
							children: [
								"appeals a ",
								appeal.record?.contentType?.replace("_", " ") ?? "content",
								" decision"
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 rounded-xl bg-muted/40 p-3.5 text-sm leading-relaxed text-foreground/90",
					children: [
						"\"",
						appeal.statement,
						"\""
					]
				}),
				appeal.record?.userMessage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-xs text-muted-foreground",
					children: ["Original outcome: ", appeal.record.userMessage]
				}),
				canAction && appeal.status === "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: note,
							onChange: (e) => setNote(e.target.value),
							placeholder: "Decision note (required)…",
							className: "h-9 min-w-[180px] flex-1 rounded-lg border border-border bg-elevated px-3 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							disabled: !note.trim() || decision.isPending,
							onClick: () => decision.mutate({
								id: appeal._id,
								action: "approve",
								note: note.trim()
							}, { onSuccess: () => {
								toast.success("Appeal approved — content restored");
								setNote("");
							} }),
							children: "Uphold appeal"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "destructive",
							disabled: !note.trim() || decision.isPending,
							onClick: () => decision.mutate({
								id: appeal._id,
								action: "reject",
								note: note.trim()
							}, { onSuccess: () => {
								toast.success("Appeal rejected — decision stands");
								setNote("");
							} }),
							children: "Reject"
						})
					]
				})
			]
		})
	});
}
function AppealsPanel() {
	const [tab, setTab] = (0, import_react.useState)("pending");
	const { data, isLoading } = useAppeals(tab);
	const appeals = data?.appeals ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminSegmented, {
				options: [
					{
						id: "pending",
						label: "Pending"
					},
					{
						id: "approved",
						label: "Approved"
					},
					{
						id: "rejected",
						label: "Rejected"
					}
				],
				value: tab,
				onChange: setTab
			}),
			isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminSkeletonRows, { rows: 3 }),
			!isLoading && !appeals.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminEmptyState, {
				icon: Check,
				title: "No appeals in this state",
				description: "Users contesting moderation decisions will show up here."
			}),
			appeals.map((a, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppealRow, {
				appeal: a,
				index: i
			}, a._id))
		]
	});
}
function HealthPanel() {
	const { data, isLoading } = useModerationHealth();
	if (isLoading || !data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminSkeletonRows, { rows: 4 });
	const providers = data["config"]?.providers ?? {};
	const queue = data["queue"] ?? {};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, {
				className: "p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCardHeader, {
						title: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "size-4 text-primary" }), " Providers"]
						}),
						subtitle: "Automated safety classifiers backing the review queue"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 grid gap-2.5 sm:grid-cols-2",
						children: Object.entries(providers).map(([name, p]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-3.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-bold text-foreground capitalize",
								children: name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: p.configured ? "Credentials detected" : "Not configured"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminBadge, {
								tone: p.enabled && p.configured ? "success" : p.enabled ? "warning" : "muted",
								dot: true,
								children: p.enabled && p.configured ? "Active" : p.enabled ? "Needs config" : "Off"
							})]
						}, name))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3.5 rounded-xl bg-muted/40 px-3.5 py-2.5 text-xs text-muted-foreground",
						children: [
							"Fail-closed: ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								className: "text-foreground",
								children: String(data["config"]?.failClosed)
							}),
							" ",
							"— failed checks can never approve content."
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, {
				className: "p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCardHeader, {
					title: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "size-4 text-accent" }), " Processing queue"]
					}),
					subtitle: "Live pipeline state"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4",
					children: [
						["Queued", queue["depth"]],
						["Processing", queue["processing"]],
						["Running", queue["running"]],
						["Failed jobs", queue["failedJobs"]]
					].map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border/60 bg-muted/30 p-4 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-2xl font-extrabold text-foreground tabular-nums",
							children: String(value ?? 0)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase",
							children: String(label)
						})]
					}, String(label)))
				})]
			}),
			(data["config"]?.warnings ?? []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-warning/30 bg-warning/5 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 text-sm font-bold text-warning",
					children: "Configuration warnings"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "list-disc space-y-1 pl-4 text-xs text-warning/90",
					children: data["config"]["warnings"].map((w, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: w }, i))
				})]
			})
		]
	});
}
function RulesPanel() {
	const { staffUser } = useAuth();
	const { data } = useModerationRules();
	const updateRule = useUpdateModerationRule();
	const canEdit = hasPermission(staffUser, "moderation.rules.edit");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, {
		className: "h-fit p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCardHeader, {
			title: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersVertical, { className: "size-4 text-primary" }), " Moderation rules"]
			}),
			subtitle: canEdit ? "Toggle auto-moderation classifiers and thresholds." : "View only — Admin or Super Admin can edit these."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 space-y-2.5",
			children: [(data?.rules ?? []).map((rule) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 p-3.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[13px] font-bold text-foreground",
						children: rule.name
					}), rule.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 text-xs leading-relaxed text-muted-foreground",
						children: rule.description
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminToggle, {
					checked: rule.enabled,
					disabled: !canEdit,
					onChange: () => updateRule.mutate({
						key: rule.key,
						enabled: !rule.enabled
					}, { onSuccess: () => toast.success(rule.enabled ? `${rule.name} disabled` : `${rule.name} enabled`) })
				})]
			}, rule._id)), !data?.rules.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "py-4 text-center text-sm text-muted-foreground",
				children: "No rules configured yet."
			})]
		})]
	});
}
function ReportsSection() {
	const [tab, setTab] = (0, import_react.useState)("pending");
	const { data, isLoading } = useModerationQueue(tab);
	const reports = data?.reports ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminSegmented, {
				options: [
					{
						id: "pending",
						label: "Pending"
					},
					{
						id: "resolved",
						label: "Resolved"
					},
					{
						id: "dismissed",
						label: "Dismissed"
					}
				],
				value: tab,
				onChange: setTab
			}),
			isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminSkeletonRows, { rows: 3 }),
			!isLoading && !reports.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminEmptyState, {
				icon: Check,
				title: "Nothing here — queue is clear",
				description: "New community reports will land in this queue in real time."
			}),
			reports.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionRow, {
				report: r,
				index: i
			}, r._id))
		]
	});
}
function ModerationPage() {
	const { staffUser } = useAuth();
	const [pageTab, setPageTab] = (0, import_react.useState)("reports");
	const canSeeAssessments = hasPermission(staffUser, "moderation.assessments.view");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminPageHeader, {
				icon: ShieldAlert,
				title: "Moderation Queue",
				description: PAGE_TAB_META[pageTab].hint,
				accent: "danger"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminSegmented, {
				options: pageTabs.map((t) => ({
					id: t,
					label: PAGE_TAB_META[t].label
				})),
				value: pageTab,
				onChange: setPageTab
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 xl:grid-cols-[1fr_330px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					pageTab === "reports" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportsSection, {}),
					pageTab === "ai-review" && (canSeeAssessments ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssessmentsPanel, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminEmptyState, {
						icon: ShieldAlert,
						title: "Permission required",
						description: "You need the moderation.assessments.view permission to see the AI review queue."
					})),
					pageTab === "appeals" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppealsPanel, {}),
					pageTab === "health" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HealthPanel, {})
				] }), pageTab === "reports" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RulesPanel, {})]
			})
		]
	});
}
//#endregion
export { ModerationPage as component };
