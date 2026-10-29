import { o as __toESM } from "../_runtime.mjs";
import { t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { Qt as Gift, R as Sparkles, Wn as BadgeCheck, it as RotateCcw, p as Users, v as UserCog } from "../_libs/lucide-react.mjs";
import { n as api } from "./api-client-DZOxvrvB.mjs";
import { E as formatCount, Gt as DialogContent, Jt as DialogHeader, Wt as Dialog, Yt as DialogTitle } from "./router-CrddKQ7E.mjs";
import { a as useQueryClient, n as useMutation, r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { l as useAuth } from "./auth-context-CuF8V2_l.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { r as hasPermission } from "./permissions-CGE25KsA.mjs";
import { a as AdminEmptyState, c as AdminSearchInput, g as AdminTh, h as AdminTd, m as AdminTableWrap, n as AdminBadge, p as AdminTable, s as AdminPageHeader, t as AdminAvatar } from "./AdminUI-Cf1j1IrP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/system.dashboard.accounts-DRr64qdb.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useStaffAccounts(params) {
	const query = new URLSearchParams();
	if (params.q) query.set("q", params.q);
	if (params.status) query.set("status", params.status);
	if (params.page) query.set("page", String(params.page));
	return useQuery({
		queryKey: [
			"staff",
			"accounts",
			params
		],
		queryFn: () => api.get(`/system/users?${query}`, true)
	});
}
function useAccountAction(action) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, ...body }) => api.post(`/system/users/${id}/${action}`, body, true),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff", "accounts"] })
	});
}
var useVerifyAccount = () => useAccountAction("verify");
var useSuspendAccount = () => useAccountAction("suspend");
var useReinstateAccount = () => useAccountAction("reinstate");
var useBanAccount = () => useAccountAction("ban");
var useMakeCreator = () => useAccountAction("make-creator");
function useGrantPoints() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, points, reason }) => api.post(`/system/users/${id}/grant-points`, {
			points,
			reason
		}, true),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff", "accounts"] })
	});
}
var statusTone = {
	active: "success",
	limited: "warning",
	suspended: "warning",
	banned: "danger",
	review: "muted"
};
function ReasonPrompt({ label, onConfirm, danger }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [reason, setReason] = (0, import_react.useState)("");
	if (!open) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		size: "sm",
		variant: danger ? "destructive" : "outline",
		className: !danger ? "border-border text-foreground/90 hover:bg-muted" : void 0,
		onClick: () => setOpen(true),
		children: label
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-1.5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				autoFocus: true,
				value: reason,
				onChange: (e) => setReason(e.target.value),
				placeholder: "Reason…",
				className: "h-8 w-36 rounded-lg border border-border bg-card px-2 text-xs text-foreground outline-none focus:border-primary/60"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: danger ? "destructive" : "outline",
				className: !danger ? "border-border text-foreground/90" : void 0,
				disabled: !reason.trim(),
				onClick: () => {
					onConfirm(reason.trim());
					setOpen(false);
					setReason("");
				},
				children: "Confirm"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "ghost",
				className: "text-muted-foreground",
				onClick: () => setOpen(false),
				children: "Cancel"
			})
		]
	});
}
function GrantPointsDialog({ user, open, onOpenChange }) {
	const grantPoints = useGrantPoints();
	const [points, setPoints] = (0, import_react.useState)("100");
	const [reason, setReason] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-[400px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
				className: "flex items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-8 place-items-center rounded-lg bg-success/10 text-success",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gift, { className: "size-4" })
					}),
					"Grant bonus points ",
					user ? `to @${user.username}` : ""
				]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 px-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "mb-1.5 block text-xs font-bold tracking-wide text-muted-foreground uppercase",
						children: "Points"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "number",
						min: 1,
						value: points,
						onChange: (e) => setPoints(e.target.value),
						className: "h-11 w-full rounded-xl border border-border bg-elevated px-3.5 text-sm outline-none focus:border-ring focus:ring-4 focus:ring-primary/10"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "mb-1.5 block text-xs font-bold tracking-wide text-muted-foreground uppercase",
						children: "Reason (optional)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: reason,
						onChange: (e) => setReason(e.target.value),
						placeholder: "e.g. community contest prize",
						className: "h-11 w-full rounded-xl border border-border bg-elevated px-3.5 text-sm outline-none focus:border-ring focus:ring-4 focus:ring-primary/10"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "brand",
						className: "mt-1 h-11",
						disabled: !user || !Number(points) || grantPoints.isPending,
						onClick: () => user && grantPoints.mutate({
							id: user._id,
							points: Number(points),
							reason: reason.trim() || void 0
						}, {
							onSuccess: () => {
								toast.success(`Granted ${points} points to @${user.username}`);
								onOpenChange(false);
								setReason("");
							},
							onError: (err) => toast.error(err.message || "Failed to grant points")
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gift, { className: "size-4" }), " Grant points"]
					})
				]
			})]
		})
	});
}
function AccountsPage() {
	const { staffUser } = useAuth();
	const [q, setQ] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)("");
	const [grantTarget, setGrantTarget] = (0, import_react.useState)(null);
	const { data, isLoading } = useStaffAccounts({
		q: q || void 0,
		status: status || void 0
	});
	const canManage = hasPermission(staffUser, "accounts.suspend");
	const canVerify = hasPermission(staffUser, "accounts.verify");
	const canMakeCreator = hasPermission(staffUser, "accounts.makeCreator");
	const canGrantPoints = hasPermission(staffUser, "accounts.grantPoints");
	const verify = useVerifyAccount();
	const suspend = useSuspendAccount();
	const reinstate = useReinstateAccount();
	const ban = useBanAccount();
	const makeCreator = useMakeCreator();
	const users = data?.users ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminPageHeader, {
				icon: UserCog,
				title: "User Accounts",
				description: "Search accounts and manage verification, status and creator access.",
				accent: "primary"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminSearchInput, {
						value: q,
						onChange: setQ,
						placeholder: "Search name, username, email…",
						className: "min-w-[240px] flex-1"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: status,
							onChange: (e) => setStatus(e.target.value),
							className: "h-10 appearance-none rounded-xl border border-border bg-muted/50 pr-9 pl-4 text-sm font-medium text-foreground outline-none transition-colors focus:border-ring",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "All statuses"
							}), [
								"active",
								"limited",
								"suspended",
								"banned",
								"review"
							].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: s,
								children: s.charAt(0).toUpperCase() + s.slice(1)
							}, s))]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
							className: "pointer-events-none absolute top-1/2 right-3.5 size-3.5 -translate-y-1/2 text-muted-foreground",
							viewBox: "0 0 12 12",
							fill: "none",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
								d: "M2.5 4.5L6 8l3.5-3.5",
								stroke: "currentColor",
								strokeWidth: "1.6",
								strokeLinecap: "round",
								strokeLinejoin: "round"
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-xl bg-primary-soft px-3.5 py-2.5 text-xs font-bold text-primary tabular-nums",
						children: isLoading ? "…" : `${users.length} account${users.length === 1 ? "" : "s"}`
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTableWrap, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminTable, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTh, {
					className: "min-w-[220px]",
					children: "User"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTh, { children: "Status" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTh, { children: "Role" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTh, { children: "Followers" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTh, {
					className: "text-right",
					children: "Actions"
				})
			] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [
				isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					colSpan: 5,
					className: "p-10 text-center text-sm text-muted-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" }), "Loading accounts…"]
					})
				}) }),
				users.map((u, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.tr, {
					initial: {
						opacity: 0,
						y: 6
					},
					animate: {
						opacity: 1,
						y: 0
					},
					transition: { delay: Math.min(i * .03, .3) },
					className: "transition-colors hover:bg-muted/30",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTd, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminAvatar, {
								name: u.name,
								hue: u.username.charCodeAt(0) * 7 % 360,
								size: "sm"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "flex items-center gap-1.5 font-semibold text-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "truncate",
										children: u.name
									}), u.status === "active" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, { className: "size-3.5 shrink-0 text-primary" })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "truncate text-xs text-muted-foreground",
									children: [
										"@",
										u.username,
										" · ",
										u.email
									]
								})]
							})]
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTd, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminBadge, {
							tone: statusTone[u.status] ?? "muted",
							dot: true,
							children: u.status
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTd, { children: u.role !== "user" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminBadge, {
							tone: "accent",
							children: u.role
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[13px] text-foreground/80",
							children: u.isCreator ? "Creator" : "User"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTd, {
							className: "font-semibold text-foreground/80 tabular-nums",
							children: formatCount(u.followersCount)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTd, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap justify-end gap-1.5",
							children: [
								canVerify && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "outline",
									className: "border-border text-foreground/90 hover:bg-primary-soft hover:text-primary",
									title: "Verify account",
									onClick: () => verify.mutate({ id: u._id }, { onSuccess: () => toast.success(`Verified @${u.username}`) }),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, { className: "size-3.5" })
								}),
								canMakeCreator && !u.isCreator && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "outline",
									className: "border-border text-foreground/90 hover:bg-primary-soft hover:text-primary",
									title: "Make creator",
									onClick: () => makeCreator.mutate({ id: u._id }, { onSuccess: () => toast.success(`@${u.username} is now a creator`) }),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3.5" })
								}),
								canGrantPoints && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "outline",
									className: "border-border text-foreground/90 hover:bg-success/10 hover:text-success",
									title: "Grant points",
									onClick: () => setGrantTarget(u),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gift, { className: "size-3.5" })
								}),
								canManage && u.status === "active" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReasonPrompt, {
									label: "Suspend",
									onConfirm: (reason) => suspend.mutate({
										id: u._id,
										reason
									}, { onSuccess: () => toast.success(`Suspended @${u.username}`) })
								}),
								canManage && (u.status === "suspended" || u.status === "banned") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "outline",
									className: "border-border text-foreground/90 hover:bg-success/10 hover:text-success",
									title: "Reinstate",
									onClick: () => reinstate.mutate({ id: u._id }, { onSuccess: () => toast.success(`Reinstated @${u.username}`) }),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-3.5" })
								}),
								canManage && u.status !== "banned" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReasonPrompt, {
									danger: true,
									label: "Ban",
									onConfirm: (reason) => ban.mutate({
										id: u._id,
										reason
									}, { onSuccess: () => toast.success(`Banned @${u.username}`) })
								})
							]
						}) })
					]
				}, u._id)),
				!isLoading && !users.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					colSpan: 5,
					className: "p-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminEmptyState, {
						icon: Users,
						title: "No accounts match",
						description: "Try a different search term or clear the status filter."
					})
				}) })
			] })] }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GrantPointsDialog, {
				user: grantTarget,
				open: !!grantTarget,
				onOpenChange: (v) => !v && setGrantTarget(null)
			})
		]
	});
}
//#endregion
export { AccountsPage as component };
