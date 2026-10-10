import { o as __toESM } from "../_runtime.mjs";
import { r as cn, t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { I as Sparkles, In as BadgeCheck, Kt as Gift, Q as Search, nt as RotateCcw, y as UserCog } from "../_libs/lucide-react.mjs";
import { n as api } from "./api-client-C-02deeD.mjs";
import { Ft as DialogTitle, Mt as Dialog, Nt as DialogContent, Pt as DialogHeader, k as formatCount } from "./router-NU7wHj2a.mjs";
import { l as useAuth } from "./auth-context-Duh7Mq6E.mjs";
import { a as useQueryClient, n as useMutation, r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { r as hasPermission } from "./permissions-B9dpCwVw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/system.dashboard.accounts-gQ09bAY9.js
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
	active: "bg-success/10 text-success",
	limited: "bg-warning/10 text-warning",
	suspended: "bg-warning/15 text-warning",
	banned: "bg-rose-500/15 text-danger",
	review: "bg-muted text-muted-foreground"
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
				className: "h-8 w-36 rounded-lg border border-border bg-card px-2 text-xs text-foreground outline-none"
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
			className: "sm:max-w-[380px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: ["Grant bonus points ", user ? `to @${user.username}` : ""] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 px-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "number",
						min: 1,
						value: points,
						onChange: (e) => setPoints(e.target.value),
						className: "h-10 rounded-xl border border-border bg-elevated px-3.5 text-sm outline-none focus:border-ring"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: reason,
						onChange: (e) => setReason(e.target.value),
						placeholder: "Reason (optional)",
						className: "h-10 rounded-xl border border-border bg-elevated px-3.5 text-sm outline-none focus:border-ring"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "brand",
						disabled: !user || !Number(points) || grantPoints.isPending,
						onClick: () => user && grantPoints.mutate({
							id: user._id,
							points: Number(points),
							reason: reason.trim() || void 0
						}, {
							onSuccess: () => {
								toast.success(`Granted ${points} points to @${user.username}`);
								onOpenChange(false);
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
				className: "flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCog, { className: "size-6 text-info" }), " User Accounts"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Search accounts and manage verification, status and creator access."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex h-10 min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-border bg-card px-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: q,
						onChange: (e) => setQ(e.target.value),
						placeholder: "Search name, username, email…",
						className: "h-full flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					value: status,
					onChange: (e) => setStatus(e.target.value),
					className: "h-10 rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none",
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
						children: s
					}, s))]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-hidden rounded-2xl border border-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border bg-muted/40 text-left text-xs text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-3 font-semibold",
								children: "User"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-3 font-semibold",
								children: "Status"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-3 font-semibold",
								children: "Role"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-3 font-semibold",
								children: "Followers"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-3 font-semibold",
								children: "Actions"
							})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [
						isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: 5,
							className: "p-8 text-center text-muted-foreground",
							children: "Loading…"
						}) }),
						(data?.users ?? []).map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-white/5 last:border-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "p-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-semibold text-foreground",
										children: u.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted-foreground",
										children: [
											"@",
											u.username,
											" · ",
											u.email
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "p-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: cn("rounded-md px-1.5 py-0.5 text-[11px] font-bold capitalize", statusTone[u.status]),
										children: u.status
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "p-3 text-foreground/80",
									children: u.isCreator ? "Creator" : "User"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "p-3 text-foreground/80",
									children: formatCount(u.followersCount)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "p-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap gap-1.5",
										children: [
											canVerify && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "outline",
												className: "border-border text-foreground/90 hover:bg-muted",
												onClick: () => verify.mutate({ id: u._id }, { onSuccess: () => toast.success(`Verified @${u.username}`) }),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, { className: "size-3.5" })
											}),
											canMakeCreator && !u.isCreator && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "outline",
												className: "border-border text-foreground/90 hover:bg-muted",
												onClick: () => makeCreator.mutate({ id: u._id }, { onSuccess: () => toast.success(`@${u.username} is now a creator`) }),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3.5" })
											}),
											canGrantPoints && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "outline",
												className: "border-border text-foreground/90 hover:bg-muted",
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
												className: "border-border text-foreground/90 hover:bg-muted",
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
									})
								})
							]
						}, u._id)),
						!isLoading && !data?.users.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: 5,
							className: "p-8 text-center text-muted-foreground",
							children: "No accounts match."
						}) })
					] })]
				})
			}),
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
