import { o as __toESM } from "../_runtime.mjs";
import { r as cn, t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { Bn as ArrowRight, E as Trash2, I as Sparkles, Pt as Layers, Qt as Eye, Rt as Image, Vn as ArrowLeft, bn as CircleCheckBig, c as Wallet, dt as Pause, gt as MousePointerClick, hn as Clock, j as Target, jt as LoaderCircle, ot as Plus, pn as Coins, st as Play, w as TriangleAlert, x as Upload, xn as CircleAlert } from "../_libs/lucide-react.mjs";
import { s as mediaUrl, u as uploadFile } from "./api-client-C-02deeD.mjs";
import { Ft as DialogTitle, Mt as Dialog, Nt as DialogContent, Pt as DialogHeader, h as Input, k as formatCount, t as AppShell } from "./router-NU7wHj2a.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as AdBadge } from "./AdBadge-CcJQZFFu.mjs";
import { r as useWallet } from "./use-wallet-D-qVJYDE.mjs";
import { a as useDeleteAd, i as useCreateAd, l as usePayAdWithMoney, r as useCalculateAdPrice, s as useMyAds, t as useAdConfig, u as usePayAdWithPoints, y as useUpdateAd } from "./use-ads-B0t9iPcQ.mjs";
import { t as AdPreview } from "./AdPreview-D4iLI0ab.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ads-CIm9y_zu.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PointsCheckout({ open, onOpenChange, campaign, onSuccess }) {
	const { data: walletData, isLoading: walletLoading } = useWallet();
	const payWithPoints = usePayAdWithPoints();
	const walletPoints = walletData?.wallet?.kingdomPoints ?? 0;
	const requiredPoints = campaign.totalGpCost || 0;
	const remainingPoints = walletPoints - requiredPoints;
	const hasEnough = remainingPoints >= 0;
	function handlePay() {
		if (!hasEnough) {
			toast.error("Insufficient Gihanga Points");
			return;
		}
		const idempotencyKey = `gp_pay_${campaign._id}_${Date.now()}`;
		payWithPoints.mutate({
			id: campaign._id,
			idempotencyKey
		}, {
			onSuccess: () => {
				toast.success("Payment successful! Your ad is now pending review.");
				onSuccess();
				onOpenChange(false);
			},
			onError: (err) => {
				toast.error(err.message || "Points payment failed");
			}
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-[440px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "size-5 text-amber-500" }), "Pay with Gihanga Points"]
			}) }), walletLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-center py-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-6 animate-spin text-primary" })
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4 pt-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border bg-card p-4 space-y-2 text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Campaign:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-bold text-foreground",
									children: campaign.title
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Type & Placement:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "capitalize text-foreground",
									children: [
										campaign.adType.replace("_", " "),
										" · ",
										campaign.placement
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Advertising Minutes:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-bold text-foreground",
									children: [campaign.advertisingMinutes, " min"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between border-t border-border/60 pt-2 text-sm font-extrabold",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Required Points:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-amber-500",
									children: [formatCount(requiredPoints), " GP"]
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border bg-elevated p-4 space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Your Current Balance:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-bold text-foreground",
									children: [formatCount(walletPoints), " GP"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Cost:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-bold text-danger",
									children: [
										"-",
										formatCount(requiredPoints),
										" GP"
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between border-t border-border/60 pt-2 text-sm font-extrabold",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Balance After Payment:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: hasEnough ? "text-success" : "text-danger",
									children: [formatCount(Math.max(0, remainingPoints)), " GP"]
								})]
							})
						]
					}),
					!hasEnough && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-2.5 rounded-2xl bg-danger/10 p-3.5 text-xs text-danger font-medium",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-4 shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-bold",
							children: "Insufficient Gihanga Points"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-0.5 opacity-90",
							children: [
								"You need ",
								formatCount(Math.abs(remainingPoints)),
								" more GP to place this ad. Upload content, complete daily tasks, or choose Real Money."
							]
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "pt-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "brand",
							size: "lg",
							className: "w-full",
							disabled: !hasEnough || payWithPoints.isPending,
							onClick: handlePay,
							children: payWithPoints.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), " Deducting Points…"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								"Confirm & Pay ",
								formatCount(requiredPoints),
								" GP",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "ml-2 size-4" })
							] })
						})
					})
				]
			})]
		})
	});
}
function MoneyCheckout({ open, onOpenChange, campaign, onSuccess }) {
	const { data: walletData, isLoading: walletLoading } = useWallet();
	const payWithMoney = usePayAdWithMoney();
	const walletAvailable = walletData?.wallet?.available ?? 0;
	const requiredRwf = campaign.totalRwfCost || 0;
	const remainingRwf = walletAvailable - requiredRwf;
	const hasEnough = remainingRwf >= 0;
	function rwf(n) {
		return `${n.toLocaleString()} RWF`;
	}
	function handlePay() {
		if (!hasEnough) {
			toast.error("Insufficient wallet balance");
			return;
		}
		const idempotencyKey = `rwf_pay_${campaign._id}_${Date.now()}`;
		payWithMoney.mutate({
			id: campaign._id,
			idempotencyKey
		}, {
			onSuccess: () => {
				toast.success("Payment successful! Your ad is now pending review.");
				onSuccess();
				onOpenChange(false);
			},
			onError: (err) => {
				toast.error(err.message || "Payment failed");
			}
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-[440px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "size-5 text-primary" }), "Pay with Real Money (Wallet Balance)"]
			}) }), walletLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-center py-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-6 animate-spin text-primary" })
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4 pt-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border bg-card p-4 space-y-2 text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Campaign:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-bold text-foreground",
									children: campaign.title
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Type & Placement:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "capitalize text-foreground",
									children: [
										campaign.adType.replace("_", " "),
										" · ",
										campaign.placement
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Advertising Minutes:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-bold text-foreground",
									children: [campaign.advertisingMinutes, " min"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between border-t border-border/60 pt-2 text-sm font-extrabold",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total Cost:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-primary",
									children: rwf(requiredRwf)
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border bg-elevated p-4 space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Your Available Wallet Balance:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-bold text-foreground",
									children: rwf(walletAvailable)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Deduction:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-bold text-danger",
									children: ["-", rwf(requiredRwf)]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between border-t border-border/60 pt-2 text-sm font-extrabold",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Balance After Payment:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: hasEnough ? "text-success" : "text-danger",
									children: rwf(Math.max(0, remainingRwf))
								})]
							})
						]
					}),
					!hasEnough && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-2.5 rounded-2xl bg-danger/10 p-3.5 text-xs text-danger font-medium",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-4 shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-bold",
							children: "Insufficient Wallet Balance"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-0.5 opacity-90",
							children: [
								"You need ",
								rwf(Math.abs(remainingRwf)),
								" more in your wallet. Deposit funds via MTN Mobile Money or choose Gihanga Points."
							]
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "pt-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "brand",
							size: "lg",
							className: "w-full",
							disabled: !hasEnough || payWithMoney.isPending,
							onClick: handlePay,
							children: payWithMoney.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), " Processing Payment…"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								"Confirm & Pay ",
								rwf(requiredRwf),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "ml-2 size-4" })
							] })
						})
					})
				]
			})]
		})
	});
}
var STATUS_STYLE = {
	draft: "bg-muted text-muted-foreground",
	pending_payment: "bg-amber-500/15 text-amber-600",
	processing: "bg-amber-500/15 text-amber-600",
	paid: "bg-indigo-500/15 text-indigo-500",
	pending_review: "bg-amber-500/15 text-amber-600",
	approved: "bg-success/15 text-success",
	active: "bg-success/15 text-success font-extrabold animate-pulse",
	paused: "bg-muted text-muted-foreground",
	expired: "bg-primary-soft text-primary",
	rejected: "bg-danger/15 text-danger",
	cancelled: "bg-muted text-muted-foreground line-through",
	refund_pending: "bg-amber-500/15 text-amber-600",
	refunded: "bg-muted text-muted-foreground"
};
function AdCard({ campaign }) {
	const updateAd = useUpdateAd();
	const deleteAd = useDeleteAd();
	const [pointsModalOpen, setPointsModalOpen] = (0, import_react.useState)(false);
	const [moneyModalOpen, setMoneyModalOpen] = (0, import_react.useState)(false);
	const deliveryProgress = campaign.advertisingMinutes > 0 ? Math.min(100, campaign.advertisingMinutesDelivered / campaign.advertisingMinutes * 100) : 0;
	function rwf(n) {
		return `${n.toLocaleString()} RWF`;
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "surface-card overflow-hidden border border-border p-4 transition-all hover:border-border/80",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "truncate font-bold text-sm text-foreground",
							children: campaign.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdBadge, { variant: "glass" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-0.5 text-xs text-muted-foreground capitalize",
						children: [
							campaign.adType.replace("_", " "),
							" · ",
							campaign.placement,
							" placement"
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("shrink-0 rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider", STATUS_STYLE[campaign.status]),
					children: campaign.status.replace("_", " ")
				})]
			}),
			campaign.status === "rejected" && campaign.rejectionReason && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 rounded-xl bg-danger/10 p-3 text-xs text-danger border border-danger/20",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-bold block",
					children: "Rejection Reason:"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5",
					children: campaign.rejectionReason
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3.5 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-elevated p-2.5 text-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1.5",
					children: [campaign.paymentMethod === "gihanga_points" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "size-4 text-amber-500" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-semibold text-foreground",
						children: campaign.paymentMethod === "gihanga_points" ? "Gihanga Points" : "Real Money"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-bold",
					children: campaign.paymentMethod === "gihanga_points" ? `${formatCount(campaign.totalGpCost)} GP` : rwf(campaign.totalRwfCost)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3.5 grid grid-cols-4 gap-1.5 rounded-xl border border-border/60 bg-card p-2 text-center text-xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-center justify-center gap-1 font-extrabold text-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-3 text-primary" }),
							" ",
							formatCount(campaign.analytics?.impressions ?? 0)
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] text-muted-foreground",
						children: "Impressions"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-center justify-center gap-1 font-extrabold text-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MousePointerClick, { className: "size-3 text-primary" }),
							" ",
							formatCount(campaign.analytics?.clicks ?? 0)
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] text-muted-foreground",
						children: "Clicks"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-extrabold text-foreground",
						children: [campaign.analytics?.ctr ?? 0, "%"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] text-muted-foreground",
						children: "CTR"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-extrabold text-foreground",
						children: formatCount(campaign.analytics?.views ?? 0)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] text-muted-foreground",
						children: "Views"
					})] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-1 flex justify-between text-[11px] text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"Delivery Quota: ",
						campaign.advertisingMinutesDelivered,
						" / ",
						campaign.advertisingMinutes,
						" ",
						"min"
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-bold text-foreground",
						children: [Math.round(deliveryProgress), "%"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-2 overflow-hidden rounded-full bg-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "gradient-brand h-full transition-all duration-300",
						style: { width: `${deliveryProgress}%` }
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex items-center justify-between gap-2 border-t border-border/60 pt-3",
				children: [
					campaign.paymentStatus !== "paid" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-1 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "brand",
							className: "flex-1",
							onClick: () => setPointsModalOpen(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "mr-1 size-3.5" }), " Pay GP"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							className: "flex-1",
							onClick: () => setMoneyModalOpen(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "mr-1 size-3.5" }), " Pay Cash"]
						})]
					}),
					(campaign.status === "active" || campaign.status === "paused") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						className: "flex-1",
						disabled: updateAd.isPending,
						onClick: () => updateAd.mutate({
							id: campaign._id,
							status: campaign.status === "active" ? "paused" : "active"
						}),
						children: [campaign.status === "active" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "mr-1 size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "mr-1 size-3.5" }), campaign.status === "active" ? "Pause" : "Resume"]
					}),
					(campaign.paymentStatus !== "paid" || campaign.status === "rejected") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						className: "text-danger hover:bg-danger/10",
						disabled: deleteAd.isPending,
						onClick: () => {
							deleteAd.mutate(campaign._id);
							toast.success("Campaign removed");
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PointsCheckout, {
				open: pointsModalOpen,
				onOpenChange: setPointsModalOpen,
				campaign,
				onSuccess: () => {}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyCheckout, {
				open: moneyModalOpen,
				onOpenChange: setMoneyModalOpen,
				campaign,
				onSuccess: () => {}
			})
		]
	});
}
function AdWizard({ open, onOpenChange, onCreated }) {
	const { data: config } = useAdConfig();
	const { data: walletData } = useWallet();
	const createAd = useCreateAd();
	const [step, setStep] = (0, import_react.useState)(1);
	const [adType, setAdType] = (0, import_react.useState)("image");
	const [placement, setPlacement] = (0, import_react.useState)("feed");
	const [title, setTitle] = (0, import_react.useState)("");
	const [caption, setCaption] = (0, import_react.useState)("");
	const [ctaText, setCtaText] = (0, import_react.useState)("Learn More");
	const [ctaUrl, setCtaUrl] = (0, import_react.useState)("");
	const [mediaUrl$1, setMediaUrl] = (0, import_react.useState)("");
	const [thumbnailUrl, setThumbnailUrl] = (0, import_react.useState)("");
	const [videoDurationSeconds, setVideoDurationSeconds] = (0, import_react.useState)(void 0);
	const [isUploading, setIsUploading] = (0, import_react.useState)(false);
	const [campaignDurationDays, setCampaignDurationDays] = (0, import_react.useState)(7);
	const [advertisingMinutes, setAdvertisingMinutes] = (0, import_react.useState)(10);
	const { data: priceData, isLoading: priceLoading } = useCalculateAdPrice(advertisingMinutes, campaignDurationDays);
	function handleFileUpload(e) {
		const file = e.target.files?.[0];
		if (!file) return;
		const isVideo = file.type.startsWith("video/");
		const kind = isVideo ? "videos" : "photos";
		if (isVideo) setAdType(placement === "story" ? "story_video" : "video");
		else setAdType(placement === "story" ? "story_image" : "image");
		setIsUploading(true);
		uploadFile(kind, file).then((res) => {
			const absoluteUrl = mediaUrl(res.url) || res.url;
			setMediaUrl(absoluteUrl);
			toast.success("Media uploaded successfully!");
		}).catch((err) => {
			toast.error(err.message || "Failed to upload media");
		}).finally(() => setIsUploading(false));
	}
	function handleCreateDraft() {
		if (!title.trim()) {
			toast.error("Please enter a title for your campaign");
			return;
		}
		createAd.mutate({
			adType,
			placement,
			title: title.trim(),
			caption: caption.trim() || void 0,
			ctaText: ctaText.trim() || "Learn More",
			ctaUrl: ctaUrl.trim() || void 0,
			mediaUrl: mediaUrl$1 || void 0,
			mediaType: adType.includes("video") ? "video" : "image",
			videoDurationSeconds,
			thumbnailUrl: thumbnailUrl || void 0,
			campaignDurationDays,
			advertisingMinutes
		}, {
			onSuccess: (data) => {
				toast.success("Ad campaign created!");
				onCreated?.(data.campaign);
				onOpenChange(false);
			},
			onError: (err) => {
				toast.error(err.message || "Failed to create campaign");
			}
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-h-[90vh] overflow-y-auto sm:max-w-[760px] p-0 gap-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
				className: "p-6 pb-4 border-b border-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
						className: "flex items-center gap-2 font-display text-xl font-extrabold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-5 text-amber-500" }), "Advertise on Gihanga Updates"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-1 text-xs font-bold text-muted-foreground",
						children: [
							"Step ",
							step,
							" of 4"
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 flex h-1.5 w-full gap-1 overflow-hidden rounded-full bg-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-full bg-primary transition-all duration-300",
						style: { width: `${step / 4 * 100}%` }
					})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-6",
				children: [
					step === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-6 md:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-sm font-bold text-foreground",
									children: "1. Choose Content & Media"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "mb-1.5 block text-xs font-semibold text-muted-foreground",
									children: "Ad Title *"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: title,
									onChange: (e) => setTitle(e.target.value),
									placeholder: "e.g., New Summer Collection Launch"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "mb-1.5 block text-xs font-semibold text-muted-foreground",
									children: "Caption / Description"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									value: caption,
									onChange: (e) => setCaption(e.target.value),
									rows: 3,
									placeholder: "Write a brief description that engages your target audience...",
									className: "w-full rounded-xl border border-border bg-card p-3 text-xs text-foreground outline-none focus:border-primary"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "mb-1 block text-xs font-semibold text-muted-foreground",
										children: "Button Text"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: ctaText,
										onChange: (e) => setCtaText(e.target.value),
										placeholder: "Learn More"
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "mb-1 block text-xs font-semibold text-muted-foreground",
										children: "Destination Link URL"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: ctaUrl,
										onChange: (e) => setCtaUrl(e.target.value),
										placeholder: "https://..."
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "mb-1.5 block text-xs font-semibold text-muted-foreground",
									children: "Upload Image or Video"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 p-5 hover:bg-muted/60 transition-colors",
									children: [isUploading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 text-xs text-muted-foreground font-semibold",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin text-primary" }), " Uploading media to server..."]
									}) : mediaUrl$1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-center text-xs text-success font-semibold flex items-center gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { className: "size-4" }), " Media attached! Click to change."]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-col items-center gap-1 text-center text-xs text-muted-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-5 text-primary" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold text-foreground",
												children: "Click to upload media"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
												"Supports JPG, PNG, MP4, MOV (Max video length:",
												" ",
												config?.maxVideoDurationSeconds ?? 120,
												"s)"
											] })
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "file",
										accept: "image/*,video/*",
										onChange: handleFileUpload,
										className: "hidden"
									})]
								})] })
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mb-3 text-sm font-bold text-foreground",
							children: "Live Ad Preview"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdPreview, {
							adType,
							placement,
							title: title || "Your Campaign Title",
							caption,
							ctaText,
							ctaUrl,
							mediaUrl: mediaUrl$1,
							thumbnailUrl
						})] })]
					}),
					step === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-sm font-bold text-foreground",
								children: "2. Select Where Your Ad Will Appear"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-4 sm:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => {
										setPlacement("feed");
										setAdType(mediaUrl$1?.includes(".mp4") || mediaUrl$1?.includes(".mov") ? "video" : "image");
									},
									className: cn("flex flex-col gap-3 rounded-2xl border p-5 text-left transition-all", placement === "feed" ? "border-primary bg-primary-soft/30 shadow-md ring-2 ring-primary/20" : "border-border bg-card hover:bg-muted/40"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "grid size-10 place-items-center rounded-xl bg-primary/10 text-primary",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "size-5" })
										}), placement === "feed" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { className: "size-5 text-primary" })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
										className: "font-bold text-sm text-foreground",
										children: "In-Feed Advertisement"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-muted-foreground",
										children: "Appears organically in users' home feeds alongside creator posts marked clearly as \"Sponsored\". High visibility and engagement."
									})] })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => {
										setPlacement("story");
										setAdType(mediaUrl$1?.includes(".mp4") || mediaUrl$1?.includes(".mov") ? "story_video" : "story_image");
									},
									className: cn("flex flex-col gap-3 rounded-2xl border p-5 text-left transition-all", placement === "story" ? "border-primary bg-primary-soft/30 shadow-md ring-2 ring-primary/20" : "border-border bg-card hover:bg-muted/40"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "grid size-10 place-items-center rounded-xl bg-amber-500/10 text-amber-500",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, { className: "size-5" })
										}), placement === "story" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { className: "size-5 text-primary" })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
										className: "font-bold text-sm text-foreground",
										children: "Story Advertisement"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-muted-foreground",
										children: "Delivered full-screen between user stories with an interactive swipe-up call to action. Ideal for mobile immersion."
									})] })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 rounded-2xl border border-border bg-muted/20 p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
									className: "mb-3 text-xs font-bold text-muted-foreground",
									children: [
										"Placement Preview (",
										placement.toUpperCase(),
										")"
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdPreview, {
									adType,
									placement,
									title: title || "Your Campaign Title",
									caption,
									ctaText,
									ctaUrl,
									mediaUrl: mediaUrl$1,
									thumbnailUrl
								})]
							})
						]
					}),
					step === 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm font-bold text-foreground",
							children: "3. Duration & Advertising Minutes"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-6 md:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "mb-1.5 block text-xs font-semibold text-muted-foreground",
											children: "Advertising Minutes (Quota Purchased)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											min: config?.minMinutes ?? 1,
											max: config?.maxMinutes ?? 180,
											value: advertisingMinutes,
											onChange: (e) => setAdvertisingMinutes(Number(e.target.value))
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-[11px] text-muted-foreground",
											children: "1 advertising minute = 60 seconds of total active user view time delivered to your target audience."
										})
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "mb-1.5 block text-xs font-semibold text-muted-foreground",
											children: "Campaign Duration (Calendar Days)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											min: config?.minCampaignDays ?? 1,
											max: config?.maxCampaignDays ?? 30,
											value: campaignDurationDays,
											onChange: (e) => setCampaignDurationDays(Number(e.target.value))
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-[11px] text-muted-foreground",
											children: "The campaign will run over this period until your advertising minutes quota is fulfilled."
										})
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "mb-2 block text-xs font-bold text-foreground",
										children: "Quick Packages"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "grid grid-cols-3 gap-2",
										children: [
											10,
											30,
											60
										].map((mins) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => setAdvertisingMinutes(mins),
											className: cn("rounded-xl border p-2.5 text-center text-xs font-bold transition-all", advertisingMinutes === mins ? "border-primary bg-primary-soft text-primary" : "border-border text-muted-foreground hover:bg-muted"),
											children: [mins, " Minutes"]
										}, mins))
									})] })
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
									className: "font-bold text-sm text-foreground flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-4 text-primary" }), " Cost Summary & Rates"]
								}), priceLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex justify-center py-6",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-5 animate-spin text-primary" })
								}) : priceData ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-3 text-xs",
									children: [priceData.breakdown.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between border-b border-border/40 pb-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-muted-foreground",
											children: [item.line, ":"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold text-foreground",
											children: item.value
										})]
									}, i)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 grid grid-cols-2 gap-2 pt-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-xl bg-primary-soft/40 p-3 text-center",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] text-muted-foreground block font-bold",
												children: "Real Money Cost"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-display font-extrabold text-sm text-primary",
												children: [priceData.rwfTotal.toLocaleString(), " RWF"]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-xl bg-amber-500/10 p-3 text-center",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] text-muted-foreground block font-bold",
												children: "Gihanga Points Cost"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-display font-extrabold text-sm text-amber-500",
												children: [formatCount(priceData.gpTotal), " GP"]
											})]
										})]
									})]
								}) : null]
							})]
						})]
					}),
					step === 4 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm font-bold text-foreground",
							children: "4. Review Campaign & Create"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-6 md:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl border border-border bg-card p-5 space-y-3 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
										className: "font-bold text-sm text-foreground",
										children: "Campaign Summary"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground",
											children: "Title:"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-bold text-foreground",
											children: title
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground",
											children: "Placement:"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "capitalize font-bold text-foreground",
											children: placement
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground",
											children: "Advertising Minutes:"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-bold text-foreground",
											children: [advertisingMinutes, " min"]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground",
											children: "Calendar Duration:"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-bold text-foreground",
											children: [campaignDurationDays, " days"]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 rounded-xl border border-border/80 bg-elevated p-3 space-y-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-bold text-xs text-foreground block",
												children: "Payment Options Available:"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-muted-foreground text-[11px]",
												children: [
													"• Real Money: ",
													priceData?.rwfTotal.toLocaleString(),
													" RWF (Wallet Balance / MoMo)"
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-muted-foreground text-[11px]",
												children: [
													"• Gihanga Points: ",
													formatCount(priceData?.gpTotal ?? 0),
													" GP (Your Balance:",
													" ",
													formatCount(walletData?.wallet?.kingdomPoints ?? 0),
													" GP)"
												]
											})
										]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
								className: "mb-2 text-xs font-bold text-muted-foreground",
								children: "Final Ad Preview"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdPreview, {
								adType,
								placement,
								title,
								caption,
								ctaText,
								ctaUrl,
								mediaUrl: mediaUrl$1,
								thumbnailUrl
							})] })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex items-center justify-between border-t border-border pt-4",
						children: [step > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => setStep(step - 1),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "mr-1.5 size-4" }), " Back"]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {}), step < 4 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "brand",
							size: "sm",
							onClick: () => {
								if (step === 1 && !title.trim()) {
									toast.error("Please enter a campaign title");
									return;
								}
								setStep(step + 1);
							},
							children: ["Next Step ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "ml-1.5 size-4" })]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "brand",
							size: "lg",
							disabled: createAd.isPending,
							onClick: handleCreateDraft,
							children: createAd.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), " Creating Campaign…"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["Create & Proceed to Checkout", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "ml-2 size-4" })] })
						})]
					})
				]
			})]
		})
	});
}
function rwf(n) {
	return `${n.toLocaleString()} RWF`;
}
function AdsPage() {
	const { data: campaigns = [], isLoading } = useMyAds();
	const { data: config } = useAdConfig();
	const { data: walletData } = useWallet();
	const [wizardOpen, setWizardOpen] = (0, import_react.useState)(false);
	const [tab, setTab] = (0, import_react.useState)("all");
	const totalSpentRwf = campaigns.filter((c) => c.paymentMethod === "real_money" && c.paymentStatus === "paid").reduce((sum, c) => sum + (c.totalRwfCost || 0), 0);
	const totalPointsSpent = campaigns.filter((c) => c.paymentMethod === "gihanga_points" && c.paymentStatus === "paid").reduce((sum, c) => sum + (c.totalGpCost || 0), 0);
	const totalImpressions = campaigns.reduce((sum, c) => sum + (c.analytics?.impressions || 0), 0);
	const activeCount = campaigns.filter((c) => c.status === "active").length;
	const filteredCampaigns = campaigns.filter((c) => {
		if (tab === "all") return true;
		if (tab === "active") return c.status === "active";
		if (tab === "pending") return c.status === "pending_review" || c.status === "pending_payment";
		if (tab === "unpaid") return c.paymentStatus !== "paid";
		return true;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-[920px] space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "font-display text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-6 text-amber-500" }), " Advertising Center"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Promote your content, products, or brand across Rwanda using Real Money or Gihanga Points."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "brand",
					size: "lg",
					onClick: () => setWizardOpen(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1.5 size-5" }), " Create Campaign"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "surface-card p-4 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Target, { className: "mx-auto mb-1 size-5 text-primary" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-xl font-extrabold text-foreground",
								children: activeCount
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground font-medium",
								children: "Active Campaigns"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "surface-card p-4 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "mx-auto mb-1 size-5 text-primary" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-xl font-extrabold text-foreground",
								children: formatCount(totalImpressions)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground font-medium",
								children: "Total Impressions"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "surface-card p-4 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "mx-auto mb-1 size-5 text-amber-500" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-display text-xl font-extrabold text-foreground",
								children: [formatCount(totalPointsSpent), " GP"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground font-medium",
								children: "Points Spent"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "surface-card p-4 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "mx-auto mb-1 size-5 text-primary" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-xl font-extrabold text-foreground",
								children: rwf(totalSpentRwf)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground font-medium",
								children: "Cash Spent"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-transparent p-4 flex flex-wrap items-center justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid size-10 place-items-center rounded-2xl bg-amber-500/20 text-amber-500 font-bold",
						children: "GP"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-bold text-foreground",
						children: "Gihanga Points Advertising Enabled"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: [
							"Current Superadmin Rate:",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
								className: "text-foreground",
								children: [
									"1 Advertising Minute = ",
									formatCount(config?.gpPerMinute ?? 2e3),
									" GP"
								]
							}),
							" ",
							"or ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								className: "text-foreground",
								children: rwf(config?.rwfPerMinute ?? 2e3)
							})
						]
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-right text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted-foreground block",
						children: "Your Points Balance"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-display text-base font-extrabold text-amber-500",
						children: [formatCount(walletData?.wallet?.kingdomPoints ?? 0), " GP"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-1 rounded-2xl border border-border bg-card p-1",
				children: [
					{
						id: "all",
						label: "All Campaigns"
					},
					{
						id: "active",
						label: "Active"
					},
					{
						id: "pending",
						label: "Pending Review"
					},
					{
						id: "unpaid",
						label: "Unpaid Drafts"
					}
				].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setTab(t.id),
					className: cn("flex-1 rounded-xl px-3 py-2 text-xs font-bold transition-all", tab === t.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"),
					children: t.label
				}, t.id))
			}),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "py-12 text-center text-sm text-muted-foreground",
				children: "Loading your campaigns…"
			}) : filteredCampaigns.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface-card flex flex-col items-center gap-3 py-16 text-center border-dashed",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "size-10 text-muted-foreground/60" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-bold text-base text-foreground",
						children: "No campaigns found"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-md text-xs text-muted-foreground",
						children: "Launch your first advertisement to reach thousands of users across Rwanda in feed and story placements."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "brand",
						size: "sm",
						onClick: () => setWizardOpen(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 size-4" }), " Launch Campaign Now"]
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: filteredCampaigns.map((campaign) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdCard, { campaign }, campaign._id))
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdWizard, {
		open: wizardOpen,
		onOpenChange: setWizardOpen
	})] });
}
//#endregion
export { AdsPage as component };
