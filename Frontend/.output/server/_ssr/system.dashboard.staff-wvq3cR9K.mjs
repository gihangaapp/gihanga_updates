import { o as __toESM } from "../_runtime.mjs";
import { r as cn, t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { Jn as ArrowRight, K as ShieldMinus, g as UserPlus, p as Users, q as ShieldCheck } from "../_libs/lucide-react.mjs";
import { l as useAuth } from "./auth-context-CuF8V2_l.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { t as ROLE_LABEL } from "./permissions-CGE25KsA.mjs";
import { a as AdminEmptyState, d as AdminStatCard, g as AdminTh, h as AdminTd, i as AdminCardHeader, m as AdminTableWrap, n as AdminBadge, p as AdminTable, r as AdminCard, s as AdminPageHeader, t as AdminAvatar } from "./AdminUI-Cf1j1IrP.mjs";
import { a as useDemoteStaff, o as usePromoteStaff, r as useCreateStaff, u as useStaffList } from "./use-staff-management-92jpC5YJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/system.dashboard.staff-wvq3cR9K.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var roleTone = {
	moderator: "info",
	admin: "accent",
	superadmin: "warning"
};
function StaffManagementPage() {
	const navigate = useNavigate();
	const { staffUser, signInStaff } = useAuth();
	const { data, isLoading } = useStaffList();
	const promote = usePromoteStaff();
	const createStaff = useCreateStaff();
	const demote = useDemoteStaff();
	const [identifier, setIdentifier] = (0, import_react.useState)("");
	const [role, setRole] = (0, import_react.useState)("moderator");
	const [newStaff, setNewStaff] = (0, import_react.useState)({
		name: "",
		username: "",
		email: "",
		password: "",
		role: "moderator"
	});
	const staff = data?.staff ?? [];
	const counts = {
		total: staff.length,
		superadmins: staff.filter((s) => s.role === "superadmin").length,
		admins: staff.filter((s) => s.role === "admin").length,
		moderators: staff.filter((s) => s.role === "moderator").length
	};
	async function submitCreateStaff(e) {
		e.preventDefault();
		try {
			const result = await createStaff.mutateAsync({
				...newStaff,
				name: newStaff.name.trim(),
				username: newStaff.username.trim(),
				email: newStaff.email.trim()
			});
			signInStaff(result.tokens, result.user);
			toast.success(`Staff account created. Signed in as ${ROLE_LABEL[result.user.role]}.`);
			navigate({ to: "/system/dashboard" });
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Couldn't create staff account");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminPageHeader, {
				icon: ShieldCheck,
				title: "Staff Management",
				description: "Promote existing accounts to Moderator or Admin, register new staff, or remove access.",
				accent: "warning",
				action: staffUser?.role === "superadmin" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/system/register",
					className: "press gradient-brand flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-bold text-primary-foreground shadow-glow",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "size-4" }),
						" Register administrator",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3.5" })
					]
				}) : void 0
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-4 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatCard, {
						icon: Users,
						label: "Team members",
						value: counts.total,
						tone: "primary",
						delay: 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatCard, {
						icon: ShieldCheck,
						label: "Super Admins",
						value: counts.superadmins,
						tone: "warning",
						delay: .06
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatCard, {
						icon: ShieldCheck,
						label: "Admins",
						value: counts.admins,
						tone: "accent",
						delay: .12
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStatCard, {
						icon: ShieldCheck,
						label: "Moderators",
						value: counts.moderators,
						tone: "info",
						delay: .18
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 xl:grid-cols-[1fr_360px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminTableWrap, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "border-b border-border bg-muted/40 px-5 py-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCardHeader, {
						title: "Administration team",
						subtitle: "Every account with staff privileges"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminTable, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTh, {
						className: "min-w-[220px]",
						children: "Staff member"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTh, { children: "Role" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTh, { children: "Since" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTh, {
						className: "text-right",
						children: "Actions"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [
					isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						colSpan: 4,
						className: "p-10 text-center text-sm text-muted-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" }), "Loading team…"]
						})
					}) }),
					staff.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.tr, {
						initial: {
							opacity: 0,
							y: 6
						},
						animate: {
							opacity: 1,
							y: 0
						},
						transition: { delay: Math.min(i * .04, .3) },
						className: "transition-colors hover:bg-muted/30",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTd, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminAvatar, {
									name: s.name,
									hue: s.username.charCodeAt(0) * 7 % 360,
									size: "sm"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-semibold text-foreground",
										children: s.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "truncate text-xs text-muted-foreground",
										children: [
											"@",
											s.username,
											" · ",
											s.email
										]
									})]
								})]
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTd, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminBadge, {
								tone: roleTone[s.role] ?? "muted",
								dot: true,
								children: ROLE_LABEL[s.role]
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTd, {
								className: "text-muted-foreground",
								children: new Date(s.createdAt).toLocaleDateString(void 0, {
									year: "numeric",
									month: "short",
									day: "numeric"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTd, {
								className: "text-right",
								children: s.role !== "superadmin" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "outline",
									className: "border-border text-foreground/90 hover:bg-danger/10 hover:text-danger",
									onClick: () => demote.mutate(s._id, {
										onSuccess: () => toast.success(`Removed staff access for @${s.username}`),
										onError: (err) => toast.error(err.message || "Couldn't demote")
									}),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldMinus, { className: "size-3.5" }), " Remove access"]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: "Protected"
								})
							})
						]
					}, s._id)),
					!isLoading && !staff.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						colSpan: 4,
						className: "p-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminEmptyState, {
							icon: Users,
							title: "No staff accounts yet",
							description: "Promote an existing account or register a new administrator to get started."
						})
					}) })
				] })] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, {
						className: "p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCardHeader, {
							title: "Promote an account",
							subtitle: "Elevate an existing Gihanga user by email or username"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 space-y-2.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: identifier,
									onChange: (e) => setIdentifier(e.target.value),
									placeholder: "email or username",
									className: "h-10 w-full rounded-xl border border-border bg-elevated px-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid grid-cols-2 gap-2",
									children: ["moderator", "admin"].map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setRole(r),
										className: cn("h-10 rounded-xl border text-xs font-bold transition-colors", role === r ? "border-primary bg-primary-soft text-primary" : "border-border bg-elevated text-muted-foreground hover:text-foreground"),
										children: ROLE_LABEL[r]
									}, r))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "brand",
									className: "h-10 w-full",
									disabled: !identifier.trim() || promote.isPending,
									onClick: () => promote.mutate({
										identifier: identifier.trim(),
										role
									}, {
										onSuccess: () => {
											toast.success(`Promoted to ${ROLE_LABEL[role]}`);
											setIdentifier("");
										},
										onError: (err) => toast.error(err.message || "Couldn't promote that account")
									}),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "size-4" }),
										" Promote to ",
										ROLE_LABEL[role]
									]
								})
							]
						})]
					}), staffUser?.role === "superadmin" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminCard, {
						className: "p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCardHeader, {
								title: "Quick create",
								subtitle: "Prefer the guided experience? Use the full registration page."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/system/register",
								className: "press group mt-4 flex items-center justify-between gap-2 rounded-xl border border-primary/25 bg-primary-soft/40 px-4 py-3 text-xs font-bold text-primary transition-colors hover:bg-primary-soft/70",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "size-4" }), " Open registration form"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3.5 transition-transform group-hover:translate-x-0.5" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								onSubmit: submitCreateStaff,
								className: "mt-4 space-y-2.5 border-t border-border pt-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-semibold text-muted-foreground",
									children: "…or create inline with defaults:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-2.5 sm:grid-cols-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											required: true,
											minLength: 2,
											maxLength: 64,
											value: newStaff.name,
											onChange: (e) => setNewStaff({
												...newStaff,
												name: e.target.value
											}),
											placeholder: "Full name",
											autoComplete: "name",
											className: "h-10 rounded-xl border border-border bg-elevated px-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/60"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											required: true,
											minLength: 3,
											maxLength: 20,
											pattern: "[a-zA-Z0-9_]{3,20}",
											value: newStaff.username,
											onChange: (e) => setNewStaff({
												...newStaff,
												username: e.target.value
											}),
											placeholder: "Username",
											autoComplete: "username",
											className: "h-10 rounded-xl border border-border bg-elevated px-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/60"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											required: true,
											type: "email",
											value: newStaff.email,
											onChange: (e) => setNewStaff({
												...newStaff,
												email: e.target.value
											}),
											placeholder: "Email address",
											autoComplete: "email",
											className: "h-10 rounded-xl border border-border bg-elevated px-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/60"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											required: true,
											type: "password",
											minLength: 8,
											maxLength: 72,
											value: newStaff.password,
											onChange: (e) => setNewStaff({
												...newStaff,
												password: e.target.value
											}),
											placeholder: "Password (8+ chars)",
											autoComplete: "new-password",
											className: "h-10 rounded-xl border border-border bg-elevated px-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/60"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											value: newStaff.role,
											onChange: (e) => setNewStaff({
												...newStaff,
												role: e.target.value
											}),
											className: "h-10 rounded-xl border border-border bg-elevated px-3 text-sm text-foreground outline-none focus:border-primary/60",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "moderator",
													children: "Moderator"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "admin",
													children: "Admin"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "superadmin",
													children: "Super Admin"
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											type: "submit",
											variant: "outline",
											className: "border-primary/30 text-primary hover:bg-primary-soft",
											disabled: createStaff.isPending,
											children: createStaff.isPending ? "Creating…" : "Create"
										})
									]
								})]
							})
						]
					})]
				})]
			})
		]
	});
}
//#endregion
export { StaffManagementPage as component };
