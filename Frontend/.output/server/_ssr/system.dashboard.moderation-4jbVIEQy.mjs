import { o as __toESM } from "../_runtime.mjs";
import { r as cn, t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { Ct as MessageSquareWarning, E as Trash2, En as Check, Fn as Ban, a as X, q as ShieldAlert, z as SlidersVertical } from "../_libs/lucide-react.mjs";
import { n as api, s as mediaUrl } from "./api-client-C-02deeD.mjs";
import { l as useAuth } from "./auth-context-Duh7Mq6E.mjs";
import { a as useQueryClient, n as useMutation, r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { r as hasPermission } from "./permissions-B9dpCwVw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/system.dashboard.moderation-4jbVIEQy.js
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
var statusTabs = [
	"pending",
	"resolved",
	"dismissed"
];
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
function ModerationPage() {
	const [tab, setTab] = (0, import_react.useState)("pending");
	const { data, isLoading } = useModerationQueue(tab);
	const reports = data?.reports ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
			className: "flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "size-6 text-danger" }), " Moderation Queue"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Review reports and act on content or accounts that break the rules."
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-6 lg:grid-cols-[1fr_320px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RulesPanel, {})]
		})]
	});
}
//#endregion
export { ModerationPage as component };
