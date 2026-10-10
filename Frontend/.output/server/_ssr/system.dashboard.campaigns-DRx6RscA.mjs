import { o as __toESM } from "../_runtime.mjs";
import { r as cn, t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { En as Check, I as Sparkles, Qt as Eye, a as X, c as Wallet, dt as Pause, nt as RotateCcw, pn as Coins, st as Play, w as TriangleAlert } from "../_libs/lucide-react.mjs";
import { Ft as DialogTitle, Mt as Dialog, Nt as DialogContent, Pt as DialogHeader, k as formatCount } from "./router-NU7wHj2a.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { _ as useStaffAds, c as usePauseAd, g as useStaffAdSummary, h as useResumeAd, m as useRejectAd, n as useApproveAd, p as useRefundAd } from "./use-ads-B0t9iPcQ.mjs";
import { t as AdPreview } from "./AdPreview-D4iLI0ab.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/system.dashboard.campaigns-DRx6RscA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function rwf(n) {
	return `${n.toLocaleString()} RWF`;
}
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
				className: "font-display text-2xl font-bold tracking-tight text-foreground flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-6 text-amber-500" }), " Advertising Campaigns Oversight"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Review submitted sponsored ads, inspect media and links, approve/reject with audit logs, manage pauses, and process refunds."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border bg-card p-4 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground font-semibold block",
							children: "Total Campaigns"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-xl font-extrabold text-foreground",
							children: summary?.totalCampaigns ?? 0
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border bg-card p-4 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground font-semibold block",
							children: "Pending Review"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-xl font-extrabold text-amber-500",
							children: summary?.pendingReview ?? 0
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border bg-card p-4 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground font-semibold block",
							children: "Active Live"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-xl font-extrabold text-success",
							children: summary?.activeCampaigns ?? 0
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border bg-card p-4 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground font-semibold block",
							children: "Total Points Spent"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-display text-xl font-extrabold text-amber-500",
							children: [formatCount(summary?.totalPointsSpent ?? 0), " GP"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border bg-card p-4 text-center col-span-2 sm:col-span-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground font-semibold block",
							children: "Real Money Revenue"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-xl font-extrabold text-primary",
							children: rwf(summary?.totalRwfRevenue ?? 0)
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-1 rounded-2xl border border-border bg-card p-1",
				children: [
					{
						id: void 0,
						label: "All"
					},
					{
						id: "pending_review",
						label: "Pending Review"
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
				].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setTab(s.id),
					className: cn("flex-1 rounded-xl px-3 py-2 text-xs font-bold capitalize transition-all", tab === s.id ? "bg-indigo-600 text-white shadow-sm" : "text-muted-foreground hover:bg-muted"),
					children: s.label
				}, s.id ?? "all"))
			}),
			isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "py-12 text-center text-sm text-muted-foreground",
				children: "Loading campaigns…"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "overflow-hidden rounded-3xl border border-border bg-card shadow-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "divide-y divide-border/60",
					children: campaigns.map((c) => {
						const creator = typeof c.creator === "object" ? c.creator : null;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "p-5 space-y-4 hover:bg-muted/20 transition-colors",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-start justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
												className: "font-bold text-base text-foreground truncate",
												children: c.title
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-bold uppercase text-foreground/90",
												children: c.status.replace("_", " ")
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-0.5 text-xs text-muted-foreground",
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
													className: "capitalize font-semibold",
													children: c.adType.replace("_", " ")
												}),
												" ",
												"· ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "capitalize font-semibold",
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
										className: "flex items-center gap-2 rounded-2xl bg-elevated px-3 py-1.5 text-xs font-semibold",
										children: [c.paymentMethod === "gihanga_points" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "size-4 text-amber-500" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [formatCount(c.totalGpCost), " GP"] })] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: rwf(c.totalRwfCost) })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "ml-1 rounded-md bg-success/15 px-1.5 py-0.5 text-[10px] uppercase font-bold text-success",
											children: c.paymentStatus
										})]
									})]
								}),
								c.rejectionReason && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "rounded-xl bg-danger/10 p-2.5 text-xs text-danger border border-danger/20",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Rejection Reason:" }),
										" ",
										c.rejectionReason
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-3 text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex gap-4 text-muted-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
												"Impressions:",
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
													className: "text-foreground",
													children: formatCount(c.analytics?.impressions ?? 0)
												})
											] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
												"Clicks:",
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
													className: "text-foreground",
													children: formatCount(c.analytics?.clicks ?? 0)
												})
											] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["CTR: ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
												className: "text-foreground",
												children: [c.analytics?.ctr ?? 0, "%"]
											})] })
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												variant: "outline",
												onClick: () => setPreviewAd(c),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "mr-1 size-3.5" }), " Preview Ad"]
											}),
											c.status === "pending_review" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												className: "bg-emerald-600 text-white hover:bg-emerald-500",
												disabled: approveAd.isPending,
												onClick: () => handleApprove(c._id),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mr-1 size-3.5" }), " Approve"]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												variant: "destructive",
												onClick: () => setRejectingAd(c),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "mr-1 size-3.5" }), " Reject"]
											})] }),
											c.status === "active" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												variant: "outline",
												onClick: () => pauseAd.mutate(c._id),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "mr-1 size-3.5" }), " Pause"]
											}),
											c.status === "paused" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												variant: "outline",
												onClick: () => resumeAd.mutate(c._id),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "mr-1 size-3.5" }), " Resume"]
											}),
											c.paymentStatus === "paid" && c.status !== "refunded" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												variant: "ghost",
												className: "text-amber-500 hover:bg-amber-500/10",
												onClick: () => handleRefund(c._id),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "mr-1 size-3.5" }), " Refund"]
											})
										]
									})]
								})
							]
						}, c._id);
					})
				}), !isLoading && !campaigns.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "py-16 text-center text-sm text-muted-foreground",
					children: "No campaigns match this filter."
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
						className: "text-danger flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-5" }), " Reject Advertisement"]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4 pt-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground",
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
								className: "w-full rounded-xl border border-border bg-card p-3 text-xs text-foreground outline-none focus:border-danger"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: autoRefundOnReject,
										onChange: (e) => setAutoRefundOnReject(e.target.checked),
										className: "rounded border-border"
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
									children: "Confirm Rejection"
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
