import { o as __toESM } from "../_runtime.mjs";
import { r as cn, t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { Dn as Coins, Nn as CircleX, V as Smartphone, ir as ArrowUpRight, kn as Clock, nn as Gift, sr as ArrowDownLeft } from "../_libs/lucide-react.mjs";
import { n as api } from "./api-client-C-W0Sa9i.mjs";
import { a as useQueryClient, n as useMutation, r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { E as formatCount, Kt as Dialog, N as timeAgo, S as RwandaPhoneInput, Xt as DialogHeader, Zt as DialogTitle, k as normalizeRwandaPhone, qt as DialogContent, t as AppShell } from "./router-BDN0UH9I.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/wallet-BrmFjGnN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useWallet() {
	return useQuery({
		queryKey: ["wallet", "me"],
		queryFn: () => api.get("/wallet/me"),
		refetchInterval: 8e3
	});
}
function useWalletTransactions() {
	const queryClient = useQueryClient();
	return useQuery({
		queryKey: ["wallet", "transactions"],
		queryFn: async () => {
			let result = await api.get("/wallet/transactions");
			const cutoff = Date.now() - 864e5;
			const pendingMomo = result.transactions.filter((tx) => tx.provider === "MTN_MOMO" && tx.status === "pending" && Boolean(tx.momoReferenceId) && new Date(tx.createdAt).getTime() >= cutoff).slice(0, 5);
			if (pendingMomo.length > 0) {
				if ((await Promise.allSettled(pendingMomo.map((tx) => api.get(`/wallet/momo/status/${encodeURIComponent(tx._id)}`)))).some((check) => check.status === "fulfilled")) {
					result = await api.get("/wallet/transactions");
					await queryClient.invalidateQueries({ queryKey: ["wallet", "me"] });
				}
			}
			return result;
		},
		refetchInterval: (query) => {
			return (query.state.data?.transactions ?? []).some((tx) => tx.provider === "MTN_MOMO" && tx.status === "pending" && Boolean(tx.momoReferenceId) && new Date(tx.createdAt).getTime() >= Date.now() - 864e5) ? 5e3 : 2e4;
		}
	});
}
function useDeposit() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input) => api.post("/wallet/deposit", {
			...input,
			idempotencyKey: crypto.randomUUID()
		}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["wallet"] });
		}
	});
}
function useWithdraw() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input) => api.post("/wallet/withdraw", {
			...input,
			idempotencyKey: crypto.randomUUID()
		}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["wallet"] });
		}
	});
}
function useConvertPoints() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (points) => api.post("/wallet/convert-points", { points }),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wallet"] })
	});
}
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
	const unit = [
		"gift",
		"bonus",
		"live_like",
		"live_comment",
		"live_reaction",
		"ad_points_payment",
		"ad_points_refund"
	].includes(tx.kind) || tx.kind === "fee" && !/^Bought .* Kingdom Points$/i.test(tx.label) ? "pts" : "RWF";
	const isPending = tx.status === "pending" || tx.status === "created";
	const isFailed = tx.status === "failed";
	const isInactive = tx.status === "cancelled" || tx.status === "expired";
	const StatusIcon = isPending ? Clock : isFailed || isInactive ? CircleX : meta.icon;
	const iconTone = isPending ? "text-amber-500 bg-amber-500/10" : isFailed ? "text-danger bg-danger/10" : isInactive ? "text-muted-foreground bg-muted" : meta.tone;
	const statusText = isPending ? tx.status === "created" ? "Processing" : "Pending" : isFailed ? "Failed — no money added" : tx.status === "cancelled" ? "Cancelled" : tx.status === "expired" ? "Expired" : timeAgo(tx.createdAt);
	const amountPrefix = tx.status !== "completed" ? "" : tx.amount >= 0 ? "+" : "−";
	const amountTone = isFailed ? "text-danger" : isPending || isInactive ? "text-muted-foreground" : tx.amount >= 0 ? "text-success" : "text-foreground";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "flex items-center gap-3 border-b border-border py-3 last:border-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("grid size-9 shrink-0 place-items-center rounded-full", iconTone),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusIcon, { className: "size-4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "truncate text-sm font-semibold",
					children: tx.label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: cn("flex items-center gap-1.5 text-xs", isFailed ? "text-danger" : isPending ? "text-amber-600" : "text-muted-foreground"),
					children: statusText
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: cn("shrink-0 text-sm font-bold tabular-nums", amountTone),
				children: [
					amountPrefix,
					formatCount(Math.abs(tx.amount)),
					" ",
					unit
				]
			})
		]
	});
}
function DepositWithdrawDialog({ mode, open, onOpenChange }) {
	const [amount, setAmount] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("+250 7");
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
		const mutation = mode === "deposit" ? deposit : withdraw;
		let normalizedPhone;
		try {
			normalizedPhone = normalizeRwandaPhone(phone);
		} catch {
			toast.error("Enter a valid Rwanda number, for example +250 788 123 456");
			return;
		}
		mutation.mutate({
			amount: numericAmount,
			phoneNumber: normalizedPhone
		}, {
			onSuccess: (data) => {
				toast.success(mode === "deposit" ? "Deposit requested" : "Withdrawal requested", { description: data.message });
				onOpenChange(false);
				setAmount("");
				setPhone("+250 7");
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
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RwandaPhoneInput, {
						value: phone,
						onValueChange: setPhone,
						placeholder: "+250 7XX XXX XXX"
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
						children: mode === "deposit" ? "The request will remain pending while MTN processes it. Your RWF balance changes only after the payment status is verified." : "Funds are held until MTN confirms the transfer."
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
				!data?.momo.depositConfigured && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-2xl bg-muted px-4 py-3 text-xs text-muted-foreground",
					children: "MTN MoMo Collections is not configured yet. Deposits will remain pending for admin review instead of sending an instant phone prompt."
				}),
				data?.momo.depositConfigured && !data?.momo.withdrawConfigured && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-2xl bg-muted px-4 py-3 text-xs text-muted-foreground",
					children: "MTN MoMo deposits are connected. Withdrawals are not configured yet and remain unavailable for automatic payout."
				}),
				data?.momo.depositConfigured && data?.momo.withdrawConfigured && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-2xl bg-muted px-4 py-3 text-xs text-muted-foreground",
					children: "MTN MoMo Collections and Disbursements are connected."
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
