import { o as __toESM } from "../_runtime.mjs";
import { r as cn, t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { Ct as MessageSquareWarning, E as Trash2, Gn as Activity, Ln as Ban, On as Check, Wt as HeartHandshake, a as X, q as ShieldAlert, w as TriangleAlert, z as SlidersVertical } from "../_libs/lucide-react.mjs";
import { n as api, s as mediaUrl } from "./api-client-C-02deeD.mjs";
import { l as useAuth } from "./auth-context-Duh7Mq6E.mjs";
import { a as useQueryClient, n as useMutation, r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { r as hasPermission } from "./permissions-CGE25KsA.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/system.dashboard.moderation-BOiTVQ2p.js
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
var statusTabs = [
	"pending",
	"resolved",
	"dismissed"
];
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
		label: "AI review queue",
		hint: "Content flagged by automated safety checks and awaiting a human decision."
	},
	appeals: {
		label: "Appeals",
		hint: "Users asking for a second look at rejected content."
	},
	health: {
		label: "Provider health",
		hint: "Moderation providers, queue depth and processing statistics."
	}
};
function ActionRow({ report }) {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-card p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-start gap-3",
			children: [media && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: media,
				alt: "",
				className: "size-16 shrink-0 rounded-xl object-cover"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase", report.severity === "high" ? "bg-rose-500/15 text-danger" : report.severity === "medium" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"),
								children: report.severity
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-bold text-foreground",
								children: report.reason
							}),
							report.reportsCount > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground",
								children: ["×", report.reportsCount]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: [
							"Reported by",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-semibold text-foreground/80",
								children: ["@", report.reporter?.username]
							}),
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
						className: "mt-1.5 text-sm text-foreground/80",
						children: [
							"\"",
							report.excerpt,
							"\""
						]
					}),
					report.targetPost?.body && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1.5 line-clamp-2 text-sm text-foreground/80",
						children: report.targetPost.body
					})
				]
			})]
		}), canAction && report.status === "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3 border-t border-border pt-3",
			children: reasonFor ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						autoFocus: true,
						value: reason,
						onChange: (e) => setReason(e.target.value),
						placeholder: "Reason (required)…",
						className: "h-9 flex-1 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-indigo-400/60"
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
	});
}
function AssessmentRow({ record }) {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("rounded-2xl border bg-card p-4", record.criticalEscalation ? "border-danger/50" : "border-border"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-start gap-3",
			children: [media && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: media,
				alt: "",
				className: "size-16 shrink-0 rounded-xl object-cover"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [
							record.criticalEscalation && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-md bg-danger/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-danger",
								children: "Critical protocol"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase", record.severity === "critical" ? "bg-danger/15 text-danger" : record.severity === "high" ? "bg-rose-500/15 text-danger" : record.severity === "medium" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"),
								children: record.severity
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-bold capitalize text-foreground",
								children: record.contentType.replace("_", " ")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted-foreground",
								children: ["by @", record.author?.username ?? "unknown"]
							})
						]
					}),
					record.categories.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-1.5 flex flex-wrap gap-1",
						children: record.categories.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground",
							children: [
								c.category.replace(/_/g, " "),
								" · ",
								c.score.toFixed(2)
							]
						}, i))
					}),
					record.content?.post?.body && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1.5 line-clamp-2 text-sm text-foreground/80",
						children: record.content.post.body
					}),
					record.content?.comment?.body && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1.5 line-clamp-2 text-sm text-foreground/80",
						children: [
							"\"",
							record.content.comment.body,
							"\""
						]
					}),
					record.error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-xs text-danger/80",
						children: ["Processing error: ", record.error]
					})
				]
			})]
		}), canAction && record.status === "pending_review" && !record.reviewedAt && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3 border-t border-border pt-3",
			children: noteFor ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						autoFocus: true,
						value: note,
						onChange: (e) => setNote(e.target.value),
						placeholder: noteFor === "approve" ? "Note (optional)…" : "Reason (required)…",
						className: "h-9 flex-1 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-indigo-400/60"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: noteFor === "approve" ? "default" : "destructive",
						disabled: noteFor !== "approve" && !note.trim() || decision.isPending,
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
	});
}
function AssessmentsPanel() {
	const [tab, setTab] = (0, import_react.useState)("pending_review");
	const { data, isLoading } = useAssessmentsQueue(tab);
	const records = data?.records ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-1 rounded-xl border border-border bg-muted/40 p-1",
				children: [
					"pending_review",
					"failed",
					"rejected",
					"approved"
				].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setTab(t),
					className: cn("flex-1 rounded-lg px-2 py-1.5 text-xs font-bold capitalize", tab === t ? "bg-primary-soft text-primary" : "text-muted-foreground hover:text-foreground/90"),
					children: t.replace("_", " ")
				}, t))
			}),
			isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "py-8 text-center text-sm text-muted-foreground",
				children: "Loading…"
			}),
			!isLoading && !records.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border bg-muted/40 py-12 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mx-auto mb-2 size-6 text-success" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Nothing needs review right now."
				})]
			}),
			records.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssessmentRow, { record: r }, r._id))
		]
	});
}
function AppealRow({ appeal }) {
	const { staffUser } = useAuth();
	const decision = useAppealDecision();
	const [note, setNote] = (0, import_react.useState)("");
	const canAction = hasPermission(staffUser, "moderation.appeals.action");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-card p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeartHandshake, { className: "size-4 text-primary" }),
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
				className: "mt-2 rounded-xl bg-muted/40 p-3 text-sm text-foreground/90",
				children: [
					"\"",
					appeal.statement,
					"\""
				]
			}),
			appeal.record?.userMessage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1.5 text-xs text-muted-foreground",
				children: ["Original outcome: ", appeal.record.userMessage]
			}),
			canAction && appeal.status === "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex items-center gap-2 border-t border-border pt-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: note,
						onChange: (e) => setNote(e.target.value),
						placeholder: "Decision note (required)…",
						className: "h-9 flex-1 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-indigo-400/60"
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
	});
}
function AppealsPanel() {
	const [tab, setTab] = (0, import_react.useState)("pending");
	const { data, isLoading } = useAppeals(tab);
	const appeals = data?.appeals ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-1 rounded-xl border border-border bg-muted/40 p-1",
				children: [
					"pending",
					"approved",
					"rejected"
				].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setTab(t),
					className: cn("flex-1 rounded-lg px-3 py-1.5 text-xs font-bold capitalize", tab === t ? "bg-primary-soft text-primary" : "text-muted-foreground hover:text-foreground/90"),
					children: t
				}, t))
			}),
			isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "py-8 text-center text-sm text-muted-foreground",
				children: "Loading…"
			}),
			!isLoading && !appeals.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border bg-muted/40 py-12 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mx-auto mb-2 size-6 text-success" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "No appeals in this state."
				})]
			}),
			appeals.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppealRow, { appeal: a }, a._id))
		]
	});
}
function HealthPanel() {
	const { data, isLoading } = useModerationHealth();
	if (isLoading || !data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "py-8 text-center text-sm text-muted-foreground",
		children: "Loading health…"
	});
	const providers = data["config"]?.providers ?? {};
	const queue = data["queue"] ?? {};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border bg-card p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						className: "mb-3 flex items-center gap-2 font-display text-base font-bold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "size-4" }), " Providers"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-2 sm:grid-cols-2",
						children: Object.entries(providers).map(([name, p]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between rounded-xl bg-muted/40 p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold capitalize",
								children: name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: p.configured ? "credentials detected" : "not configured"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", p.enabled && p.configured ? "bg-emerald-500/15 text-success" : p.enabled ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"),
								children: p.enabled && p.configured ? "active" : p.enabled ? "needs config" : "off"
							})]
						}, name))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-xs text-muted-foreground",
						children: [
							"Fail-closed: ",
							String(data["config"]?.failClosed),
							" — failed checks can never approve content."
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border bg-card p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
					className: "mb-3 flex items-center gap-2 font-display text-base font-bold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "size-4" }), " Processing queue"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
					children: [
						["Queued", queue["depth"]],
						["Processing", queue["processing"]],
						["Running", queue["running"]],
						["Failed jobs", queue["failedJobs"]]
					].map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl bg-muted/40 p-3 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xl font-bold text-foreground",
							children: String(value ?? 0)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[10px] font-semibold uppercase text-muted-foreground",
							children: String(label)
						})]
					}, String(label)))
				})]
			}),
			(data["config"]?.warnings ?? []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-warning/30 bg-warning/5 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-1 text-sm font-bold text-warning",
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-card p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "mb-1 flex items-center gap-2 font-display text-base font-bold text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersVertical, { className: "size-4" }), " Moderation rules"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-4 text-xs text-muted-foreground",
				children: canEdit ? "Toggle auto-moderation classifiers and thresholds." : "View only — Admin or Super Admin can edit these."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [(data?.rules ?? []).map((rule) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3 rounded-xl bg-muted/40 p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold text-foreground",
							children: rule.name
						}), rule.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: rule.description
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: !canEdit,
						onClick: () => updateRule.mutate({
							key: rule.key,
							enabled: !rule.enabled
						}, { onSuccess: () => toast.success(rule.enabled ? `${rule.name} disabled` : `${rule.name} enabled`) }),
						className: cn("relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-40", rule.enabled ? "bg-indigo-500" : "bg-white/10"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("absolute top-0.5 size-5 rounded-full bg-white transition-transform", rule.enabled ? "translate-x-[22px]" : "translate-x-0.5") })
					})]
				}, rule._id)), !data?.rules.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "No rules configured yet."
				})]
			})
		]
	});
}
function ReportsSection() {
	const [tab, setTab] = (0, import_react.useState)("pending");
	const { data, isLoading } = useModerationQueue(tab);
	const reports = data?.reports ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-1 rounded-xl border border-border bg-muted/40 p-1",
				children: statusTabs.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setTab(t),
					className: cn("flex-1 rounded-lg px-3 py-1.5 text-xs font-bold capitalize", tab === t ? "bg-primary-soft text-primary" : "text-muted-foreground hover:text-foreground/90"),
					children: t
				}, t))
			}),
			isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "py-8 text-center text-sm text-muted-foreground",
				children: "Loading…"
			}),
			!isLoading && !reports.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border bg-muted/40 py-12 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mx-auto mb-2 size-6 text-success" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Nothing here — queue is clear."
				})]
			}),
			reports.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionRow, { report: r }, r._id))
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
				className: "flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "size-6 text-danger" }), " Moderation"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: PAGE_TAB_META[pageTab].hint
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-1 rounded-xl border border-border bg-muted/40 p-1",
				children: pageTabs.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setPageTab(t),
					className: cn("flex-1 rounded-lg px-3 py-1.5 text-xs font-bold", pageTab === t ? "bg-primary-soft text-primary" : "text-muted-foreground hover:text-foreground/90"),
					children: PAGE_TAB_META[t].label
				}, t))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-[1fr_320px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					pageTab === "reports" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportsSection, {}),
					pageTab === "ai-review" && (canSeeAssessments ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssessmentsPanel, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "You need the moderation.assessments.view permission."
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
