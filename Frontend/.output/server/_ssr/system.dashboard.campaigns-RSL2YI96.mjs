import { o as __toESM } from "../_runtime.mjs";
import { t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { N as Target, Nn as Check, R as Sparkles, a as X, an as Eye, bn as Coins, c as Wallet, it as RotateCcw, lt as Play, pt as Pause, w as TriangleAlert } from "../_libs/lucide-react.mjs";
import { E as formatCount, Gt as DialogContent, Jt as DialogHeader, Wt as Dialog, Yt as DialogTitle } from "./router-CrddKQ7E.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { _ as useStaffAds, c as usePauseAd, g as useStaffAdSummary, h as useResumeAd, m as useRejectAd, n as useApproveAd, p as useRefundAd } from "./use-ads-Fhv5Dm_N.mjs";
import { t as AdPreview } from "./AdPreview-BFld21LW.mjs";
import { a as AdminEmptyState, d as AdminStatCard, l as AdminSegmented, n as AdminBadge, r as AdminCard, s as AdminPageHeader } from "./AdminUI-Cf1j1IrP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/system.dashboard.campaigns-RSL2YI96.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function rwf(n) {
	return `${n.toLocaleString()} RWF`;
}
var statusTone = {
	pending_review: "warning",
	active: "success",
	paused: "info",
	rejected: "danger",
	expired: "muted"
};
function StaffCampaignsPage() {
	const [tab, setTab] = (0, import_react.useState)(void 0);
	const { data: campaigns = [], isLoading } = useStaffAds({ status: tab });
	const { data: summary } = useStaffAdSummary();
	const approveAd = useApproveAd();
	const rejectAd = useRejectAd();
	const pauseAd = usePauseAd();
	const resumeAd = useResumeAd();
	const refundAd = useRefundAd();
	const [previewAd, setPreviewAd] = (0, import_react.useState)(null);
	const [rejectingAd, setRejectingAd] = (0, import_react.useState)(null);
	const [rejectReason, setRejectReason] = (0, import_react.useState)("");
	const [autoRefundOnReject, setAutoRefundOnReject] = (0, import_react.useState)(true);
	function handleApprove(id) {
		approveAd.mutate(id, {
			onSuccess: () => toast.success("Campaign approved and set active!"),
			onError: (err) => toast.error(err.message || "Failed to approve campaign")
		});
	}
	function handleRejectSubmit() {
		if (!rejectingAd) return;
		if (!rejectReason.trim()) {
			toast.error("Please enter a reason for rejection");
			return;
		}
		rejectAd.mutate({
			id: rejectingAd._id,
			reason: rejectReason.trim(),
			autoRefund: autoRefundOnReject
		}, {
			onSuccess: () => {
				toast.success("Campaign rejected");
				setRejectingAd(null);
				setRejectReason("");
			},
			onError: (err) => toast.error(err.message || "Failed to reject campaign")
		});
	}
	function handleRefund(id) {
		refundAd.mutate(id, {
			onSuccess: (res) => toast.success(res.message || "Refund processed"),
			onError: (err) => toast.error(err.message || "Refund failed")
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminPageHeader, {
				icon: Target,
				title: "Advertising Campaigns",
				description: "Review submitted sponsored ads, inspect media and links, approve or reject with audit logs, manage pauses and refunds.",
				accent: "accent"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-4 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatCard, {
						icon: Target,
						label: "Total campaigns",
						value: formatCount(summary?.totalCampaigns ?? 0),
						tone: "primary",
						delay: 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatCard, {
						icon: TriangleAlert,
						label: "Pending review",
						value: formatCount(summary?.pendingReview ?? 0),
						tone: "warning",
						delay: .06
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatCard, {
						icon: Coins,
						label: "Points spent",
						value: `${formatCount(summary?.totalPointsSpent ?? 0)} GP`,
						tone: "aqua",
						delay: .12
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatCard, {
						icon: Wallet,
						label: "Real money revenue",
						value: rwf(summary?.totalRwfRevenue ?? 0),
						tone: "success",
						delay: .18
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminSegmented, {
				options: [
					{
						id: "",
						label: "All"
					},
					{
						id: "pending_review",
						label: "Pending"
					},
					{
						id: "active",
						label: "Active"
					},
					{
						id: "paused",
						label: "Paused"
					},
					{
						id: "rejected",
						label: "Rejected"
					},
					{
						id: "expired",
						label: "Expired"
					}
				],
				value: tab ?? "",
				onChange: (id) => setTab(id || void 0)
			}),
			isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: Array.from({ length: 3 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-32 animate-pulse rounded-2xl bg-muted/50" }, i))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [campaigns.map((c, i) => {
					const creator = typeof c.creator === "object" ? c.creator : null;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
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
							delay: Math.min(i * .05, .4)
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, {
							className: "p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-start justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
												className: "truncate font-display text-base font-bold text-foreground",
												children: c.title
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminBadge, {
												tone: statusTone[c.status] ?? "muted",
												dot: true,
												children: c.status.replace("_", " ")
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-1.5 text-xs leading-relaxed text-muted-foreground",
											children: [
												"By ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
													className: "text-foreground",
													children: ["@", creator?.username || "user"]
												}),
												" ",
												"(",
												creator?.email,
												") ·",
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-semibold capitalize",
													children: c.adType.replace("_", " ")
												}),
												" ",
												"· ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-semibold capitalize",
													children: [c.placement, " placement"]
												}),
												" ·",
												" ",
												c.advertisingMinutes,
												" min quota · ",
												c.campaignDurationDays,
												" days"
											]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 rounded-xl border border-border/60 bg-muted/40 px-3 py-2 text-xs font-bold",
										children: [c.paymentMethod === "gihanga_points" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "size-4 text-warning" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-foreground tabular-nums",
											children: [formatCount(c.totalGpCost), " GP"]
										})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-foreground tabular-nums",
											children: rwf(c.totalRwfCost)
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminBadge, {
											tone: c.paymentStatus === "paid" ? "success" : "warning",
											children: c.paymentStatus
										})]
									})]
								}),
								c.rejectionReason && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-3.5 rounded-xl border border-danger/20 bg-danger/5 p-3 text-xs leading-relaxed text-danger",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Rejection reason:" }),
										" ",
										c.rejectionReason
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4 text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap gap-5 text-muted-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "flex items-center gap-1.5",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-3.5" }),
													" ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
														className: "text-foreground tabular-nums",
														children: formatCount(c.analytics?.impressions ?? 0)
													}),
													" ",
													"impressions"
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "flex items-center gap-1.5",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3.5" }),
													" ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
														className: "text-foreground tabular-nums",
														children: formatCount(c.analytics?.clicks ?? 0)
													}),
													" ",
													"clicks"
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["CTR: ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
												className: "text-foreground tabular-nums",
												children: [c.analytics?.ctr ?? 0, "%"]
											})] })
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-center gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												variant: "outline",
												onClick: () => setPreviewAd(c),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-3.5" }), " Preview ad"]
											}),
											c.status === "pending_review" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												className: "bg-success text-success-foreground hover:bg-success/90",
												disabled: approveAd.isPending,
												onClick: () => handleApprove(c._id),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5" }), " Approve"]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												variant: "destructive",
												onClick: () => setRejectingAd(c),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" }), " Reject"]
											})] }),
											c.status === "active" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												variant: "outline",
												onClick: () => pauseAd.mutate(c._id, { onSuccess: () => toast.success("Campaign paused") }),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-3.5" }), " Pause"]
											}),
											c.status === "paused" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												variant: "outline",
												onClick: () => resumeAd.mutate(c._id, { onSuccess: () => toast.success("Campaign resumed") }),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-3.5" }), " Resume"]
											}),
											c.paymentStatus === "paid" && c.status !== "refunded" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												variant: "ghost",
												className: "text-warning hover:bg-warning/10",
												onClick: () => handleRefund(c._id),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-3.5" }), " Refund"]
											})
										]
									})]
								})
							]
						})
					}, c._id);
				}), !isLoading && !campaigns.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminEmptyState, {
					icon: Target,
					title: "No campaigns match this filter",
					description: "Submitted ad campaigns will show up here for review."
				})]
			}),
			previewAd && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: Boolean(previewAd),
				onOpenChange: (v) => !v && setPreviewAd(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[480px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: ["Ad Preview — ", previewAd.title] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "pt-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdPreview, {
							adType: previewAd.adType,
							placement: previewAd.placement,
							title: previewAd.title,
							caption: previewAd.caption,
							ctaText: previewAd.ctaText,
							ctaUrl: previewAd.ctaUrl,
							mediaUrl: previewAd.mediaUrl,
							thumbnailUrl: previewAd.thumbnailUrl
						})
					})]
				})
			}),
			rejectingAd && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: Boolean(rejectingAd),
				onOpenChange: (v) => !v && setRejectingAd(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[420px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
						className: "flex items-center gap-2 text-danger",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-5" }), " Reject Advertisement"]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4 pt-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs leading-relaxed text-muted-foreground",
								children: [
									"Enter a clear explanation for rejecting ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
										"\"",
										rejectingAd.title,
										"\""
									] }),
									". The advertiser will see this message."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								value: rejectReason,
								onChange: (e) => setRejectReason(e.target.value),
								rows: 3,
								placeholder: "Reason for rejection (e.g. Violates advertising guidelines, misleading link...)",
								className: "w-full rounded-xl border border-border bg-card p-3 text-xs text-foreground outline-none focus:border-danger focus:ring-4 focus:ring-danger/10"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex cursor-pointer items-center gap-2 text-xs font-semibold text-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: autoRefundOnReject,
										onChange: (e) => setAutoRefundOnReject(e.target.checked),
										className: "size-4 rounded border-border accent-[oklch(0.42_0.083_244)]"
									}),
									"Automatically refund payment (",
									rejectingAd.paymentMethod === "gihanga_points" ? `${formatCount(rejectingAd.totalGpCost)} GP` : rwf(rejectingAd.totalRwfCost),
									")"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2 pt-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									className: "flex-1",
									onClick: () => setRejectingAd(null),
									children: "Cancel"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "destructive",
									className: "flex-1",
									disabled: rejectAd.isPending,
									onClick: handleRejectSubmit,
									children: "Confirm rejection"
								})]
							})
						]
					})]
				})
			})
		]
	});
}
//#endregion
export { StaffCampaignsPage as component };
