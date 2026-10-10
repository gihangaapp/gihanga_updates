import { o as __toESM } from "../_runtime.mjs";
import { r as cn, t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { Hn as ArrowDownLeft, Kt as Gift, R as Smartphone, hn as Clock, pn as Coins, zn as ArrowUpRight } from "../_libs/lucide-react.mjs";
import { F as timeAgo, Ft as DialogTitle, Mt as Dialog, Nt as DialogContent, Pt as DialogHeader, h as Input, k as formatCount, t as AppShell } from "./router-NU7wHj2a.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as useWithdraw, i as useWalletTransactions, n as useDeposit, r as useWallet, t as useConvertPoints } from "./use-wallet-D-qVJYDE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/wallet-BK-q4aNu.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function rwf(n) {
	return `${n.toLocaleString()} RWF`;
}
var KIND_META = {
	deposit: {
		icon: ArrowDownLeft,
		tone: "text-success bg-success/10"
	},
	payout: {
		icon: ArrowUpRight,
		tone: "text-danger bg-danger/10"
	},
	gift: {
		icon: Gift,
		tone: "text-amber-500 bg-amber-500/10"
	},
	bonus: {
		icon: Coins,
		tone: "text-primary bg-primary-soft"
	},
	earning: {
		icon: Coins,
		tone: "text-success bg-success/10"
	},
	fee: {
		icon: ArrowUpRight,
		tone: "text-muted-foreground bg-muted"
	}
};
function TransactionRow({ tx }) {
	const meta = KIND_META[tx.kind] ?? KIND_META["fee"];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "flex items-center gap-3 border-b border-border py-3 last:border-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("grid size-9 shrink-0 place-items-center rounded-full", meta.tone),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(meta.icon, { className: "size-4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "truncate text-sm font-semibold",
					children: tx.label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "flex items-center gap-1.5 text-xs text-muted-foreground",
					children: [tx.status === "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-3" }), tx.status === "pending" ? "Pending" : timeAgo(tx.createdAt)]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: cn("shrink-0 text-sm font-bold tabular-nums", tx.amount >= 0 ? "text-success" : "text-foreground"),
				children: [tx.amount >= 0 ? "+" : "", formatCount(Math.abs(tx.amount))]
			})
		]
	});
}
function DepositWithdrawDialog({ mode, open, onOpenChange }) {
	const [amount, setAmount] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const deposit = useDeposit();
	const withdraw = useWithdraw();
	const busy = mode === "deposit" ? deposit.isPending : withdraw.isPending;
	function submit() {
		const numericAmount = Number(amount);
		if (!numericAmount || numericAmount <= 0) {
			toast.error("Enter a valid amount");
			return;
		}
		if (!phone.trim()) {
			toast.error("Enter your MTN Mobile Money number");
			return;
		}
		(mode === "deposit" ? deposit : withdraw).mutate({
			amount: numericAmount,
			phoneNumber: phone.trim()
		}, {
			onSuccess: (data) => {
				toast.success(mode === "deposit" ? "Deposit requested" : "Withdrawal requested", { description: data.message });
				onOpenChange(false);
				setAmount("");
				setPhone("");
			},
			onError: (err) => toast.error(err.message || "Request failed")
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-[380px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: mode === "deposit" ? "Deposit via MTN MoMo" : "Withdraw via MTN MoMo" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 px-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "mb-1.5 block text-xs font-semibold text-muted-foreground",
						children: "Amount (RWF)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "number",
						value: amount,
						onChange: (e) => setAmount(e.target.value),
						placeholder: "5,000"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "mb-1.5 block text-xs font-semibold text-muted-foreground",
						children: "MTN Mobile Money number"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: phone,
						onChange: (e) => setPhone(e.target.value),
						placeholder: "+250 78 000 0000"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "brand",
						size: "lg",
						onClick: submit,
						disabled: busy,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "size-4" }), busy ? "Sending…" : mode === "deposit" ? "Request deposit" : "Request withdrawal"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: mode === "deposit" ? "You'll get a prompt on your phone to approve the payment." : "Funds are held until MTN confirms the transfer."
					})
				]
			})]
		})
	});
}
function ConvertPointsDialog({ open, onOpenChange, rate }) {
	const [points, setPoints] = (0, import_react.useState)("");
	const convert = useConvertPoints();
	const numericPoints = Number(points) || 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-[360px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Convert Kingdom Points to cash" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 px-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "number",
						value: points,
						onChange: (e) => setPoints(e.target.value),
						placeholder: "Points to convert"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted-foreground",
						children: [
							"= ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								className: "text-foreground",
								children: rwf(numericPoints / rate)
							}),
							" at ",
							rate,
							" ",
							"points per RWF"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "brand",
						disabled: !numericPoints || convert.isPending,
						onClick: () => convert.mutate(numericPoints, {
							onSuccess: () => {
								toast.success("Converted to your available balance");
								onOpenChange(false);
								setPoints("");
							},
							onError: (err) => toast.error(err.message || "Conversion failed")
						}),
						children: "Convert"
					})
				]
			})]
		})
	});
}
function WalletPage() {
	const { data, isLoading } = useWallet();
	const { data: txData } = useWalletTransactions();
	const [dialogMode, setDialogMode] = (0, import_react.useState)(null);
	const [convertOpen, setConvertOpen] = (0, import_react.useState)(false);
	const wallet = data?.wallet;
	const transactions = txData?.transactions ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto w-full max-w-[720px] space-y-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-extrabold tracking-tight",
				children: "Wallet"
			}), isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "py-10 text-center text-sm text-muted-foreground",
				children: "Loading your wallet…"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				wallet?.frozen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-2xl bg-danger/10 px-4 py-3 text-sm font-semibold text-danger",
					children: "Your wallet is frozen. Deposits and withdrawals are disabled — contact support."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "surface-card gradient-brand p-6 text-primary-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm opacity-80",
							children: "Available balance"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-4xl font-extrabold",
							children: rwf(wallet?.available ?? 0)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-wrap gap-4 text-sm opacity-90",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Pending: ", rwf(wallet?.pending ?? 0)] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Lifetime: ", rwf(wallet?.lifetime ?? 0)] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "secondary",
								className: "flex-1",
								onClick: () => setDialogMode("deposit"),
								disabled: wallet?.frozen,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDownLeft, { className: "size-4" }), " Deposit"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "secondary",
								className: "flex-1",
								onClick: () => setDialogMode("withdraw"),
								disabled: wallet?.frozen,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-4" }), " Withdraw"]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "surface-card flex items-center gap-4 p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-12 shrink-0 place-items-center rounded-full bg-amber-500/15 text-amber-500",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "size-6" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-display text-xl font-extrabold",
								children: [formatCount(wallet?.kingdomPoints ?? 0), " pts"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Kingdom Points from gifts, likes, uploads and referrals"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => setConvertOpen(true),
							children: "Convert"
						})
					]
				}),
				(!data?.momo.depositConfigured || !data?.momo.withdrawConfigured) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-2xl bg-muted px-4 py-3 text-xs text-muted-foreground",
					children: "MTN MoMo isn't fully connected on this server yet, so deposits/withdrawals are held as pending transactions for admin review instead of an instant phone prompt."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "surface-card p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-1 text-sm font-bold",
						children: "Transaction history"
					}), transactions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "py-8 text-center text-sm text-muted-foreground",
						children: "No transactions yet."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: transactions.map((tx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TransactionRow, { tx }, tx._id)) })]
				})
			] })]
		}),
		dialogMode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DepositWithdrawDialog, {
			mode: dialogMode,
			open: Boolean(dialogMode),
			onOpenChange: (v) => !v && setDialogMode(null)
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConvertPointsDialog, {
			open: convertOpen,
			onOpenChange: setConvertOpen,
			rate: data?.pointsToCashRate ?? 100
		})
	] });
}
//#endregion
export { WalletPage as component };
