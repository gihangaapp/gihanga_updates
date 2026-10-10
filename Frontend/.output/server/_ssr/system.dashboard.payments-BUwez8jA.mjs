import { o as __toESM } from "../_runtime.mjs";
import { r as cn, t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { En as Check, Hn as ArrowDownLeft, R as Smartphone, a as X, zn as ArrowUpRight } from "../_libs/lucide-react.mjs";
import { F as timeAgo } from "./router-BS6G260b.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as useStaffPayments, n as useRejectPayment, t as useApprovePayment } from "./use-staff-finance-CuzUXoO4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/system.dashboard.payments-BUwez8jA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function rwf(n) {
	return `${Math.abs(n).toLocaleString()} RWF`;
}
function PaymentsPage() {
	const [tab, setTab] = (0, import_react.useState)("pending");
	const { data, isLoading } = useStaffPayments(tab);
	const approve = useApprovePayment();
	const [rejectingId, setRejectingId] = (0, import_react.useState)(null);
	const [reason, setReason] = (0, import_react.useState)("");
	const list = data?.transactions ?? [];
	const rejectPayment = useRejectPayment();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-bold tracking-tight text-foreground",
				children: "Payments Queue"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Review and settle MTN Mobile Money deposits and withdrawals."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-1 rounded-2xl border border-border bg-card p-1",
				children: [
					"pending",
					"completed",
					"failed",
					"cancelled"
				].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setTab(t),
					className: cn("flex-1 rounded-xl px-3 py-2 text-xs font-bold capitalize", tab === t ? "bg-indigo-600 text-foreground" : "text-muted-foreground"),
					children: t
				}, t))
			}),
			isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "py-10 text-center text-sm text-muted-foreground",
				children: "Loading…"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [list.map((tx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border bg-card p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("grid size-10 shrink-0 place-items-center rounded-full", tx.kind === "deposit" ? "bg-success/10 text-success" : "bg-rose-500/15 text-danger"),
								children: tx.kind === "deposit" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDownLeft, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "font-semibold text-foreground",
										children: [
											tx.user?.name,
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-muted-foreground",
												children: ["@", tx.user?.username]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "flex items-center gap-1 text-xs text-muted-foreground",
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
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: cn("font-display text-lg font-extrabold", tx.kind === "deposit" ? "text-success" : "text-danger"),
								children: rwf(tx.amount)
							})
						]
					}), tab === "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex gap-2 border-t border-border pt-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							className: "flex-1 bg-emerald-600 text-foreground hover:bg-emerald-500",
							onClick: () => approve.mutate(tx._id, { onSuccess: () => toast.success("Payment approved") }),
							disabled: approve.isPending,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5" }), " Approve"]
						}), rejectingId === tx._id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							autoFocus: true,
							value: reason,
							onChange: (e) => setReason(e.target.value),
							placeholder: "Reason…",
							className: "h-8 flex-1 rounded-lg border border-border bg-elevated px-2 text-xs text-foreground outline-none"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							className: "bg-danger text-foreground hover:bg-danger/90",
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
						})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							className: "border-border text-foreground/80",
							onClick: () => setRejectingId(tx._id),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" }), " Reject"]
						})]
					})]
				}, tx._id)), !isLoading && !list.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-3xl border border-border bg-muted/40 p-12 text-center text-muted-foreground",
					children: [
						"No ",
						tab,
						" payments."
					]
				})]
			})
		]
	});
}
//#endregion
export { PaymentsPage as component };
