import { o as __toESM } from "../_runtime.mjs";
import { r as cn, t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { B as Smartphone, Nn as Check, Xn as ArrowDownLeft, a as X, c as Wallet, qn as ArrowUpRight } from "../_libs/lucide-react.mjs";
import { j as timeAgo } from "./router-CrddKQ7E.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { a as AdminEmptyState, l as AdminSegmented, n as AdminBadge, r as AdminCard, s as AdminPageHeader, u as AdminSkeletonRows } from "./AdminUI-Cf1j1IrP.mjs";
import { a as useStaffPayments, n as useRejectPayment, t as useApprovePayment } from "./use-staff-finance-WqTrFAxk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/system.dashboard.payments-DeavimJV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function rwf(n) {
	return `${Math.abs(n).toLocaleString()} RWF`;
}
function PaymentsPage() {
	const [tab, setTab] = (0, import_react.useState)("pending");
	const { data, isLoading } = useStaffPayments(tab);
	const approve = useApprovePayment();
	const rejectPayment = useRejectPayment();
	const [rejectingId, setRejectingId] = (0, import_react.useState)(null);
	const [reason, setReason] = (0, import_react.useState)("");
	const list = data?.transactions ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminPageHeader, {
				icon: Wallet,
				title: "Payments Queue",
				description: "Review and settle MTN Mobile Money deposits and withdrawals.",
				accent: "success"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminSegmented, {
				options: [
					{
						id: "pending",
						label: "Pending"
					},
					{
						id: "completed",
						label: "Completed"
					},
					{
						id: "failed",
						label: "Failed"
					},
					{
						id: "cancelled",
						label: "Cancelled"
					}
				],
				value: tab,
				onChange: setTab
			}),
			isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminSkeletonRows, { rows: 4 }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3.5",
				children: [list.map((tx, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
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
						delay: Math.min(i * .04, .4)
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, {
						className: "p-4 transition-shadow hover:shadow-float/50 sm:p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("grid size-11 shrink-0 place-items-center rounded-xl", tx.kind === "deposit" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"),
									children: tx.kind === "deposit" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDownLeft, { className: "size-4.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-4.5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "font-bold text-foreground",
											children: [
												tx.user?.name,
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-medium text-muted-foreground",
													children: ["@", tx.user?.username]
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "size-3" }),
												" ",
												tx.user?.mtnMomoNumber || tx.label
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-0.5 text-xs text-muted-foreground",
											children: [timeAgo(tx.createdAt), " ago"]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-right",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: cn("font-display text-lg font-extrabold tabular-nums", tx.kind === "deposit" ? "text-success" : "text-danger"),
										children: [tx.kind === "deposit" ? "+" : "−", rwf(tx.amount)]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminBadge, {
										tone: tx.status === "completed" ? "success" : tx.status === "failed" ? "danger" : tx.status === "cancelled" ? "muted" : "warning",
										dot: true,
										className: "mt-1",
										children: tx.status ?? tab
									})]
								})
							]
						}), tab === "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-wrap gap-2 border-t border-border pt-3.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								className: "flex-1 bg-success text-success-foreground hover:bg-success/90",
								onClick: () => approve.mutate(tx._id, {
									onSuccess: () => toast.success("Payment approved"),
									onError: (err) => toast.error(err.message || "Failed to approve")
								}),
								disabled: approve.isPending,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5" }), " Approve settlement"]
							}), rejectingId === tx._id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									autoFocus: true,
									value: reason,
									onChange: (e) => setReason(e.target.value),
									placeholder: "Reason…",
									className: "h-8 flex-1 rounded-lg border border-border bg-elevated px-2.5 text-xs text-foreground outline-none focus:border-danger/60"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "destructive",
									disabled: !reason.trim(),
									onClick: () => rejectPayment.mutate({
										id: tx._id,
										reason
									}, { onSuccess: () => {
										toast.error("Payment rejected");
										setRejectingId(null);
										setReason("");
									} }),
									children: "Confirm"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "ghost",
									className: "text-muted-foreground",
									onClick: () => setRejectingId(null),
									children: "Cancel"
								})
							] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "outline",
								className: "border-border text-foreground/80 hover:bg-danger/10 hover:text-danger",
								onClick: () => setRejectingId(tx._id),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" }), " Reject"]
							})]
						})]
					})
				}, tx._id)), !isLoading && !list.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminEmptyState, {
					icon: Wallet,
					title: `No ${tab} payments`,
					description: "Mobile money transactions will appear here as users deposit or withdraw."
				})]
			})
		]
	});
}
//#endregion
export { PaymentsPage as component };
