import { o as __toESM } from "../_runtime.mjs";
import { r as cn, t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { G as ShieldCheck, W as ShieldMinus, _ as UserPlus } from "../_libs/lucide-react.mjs";
import { l as useAuth } from "./auth-context-Duh7Mq6E.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as ROLE_LABEL } from "./permissions-CGE25KsA.mjs";
import { a as useDemoteStaff, o as usePromoteStaff, r as useCreateStaff, u as useStaffList } from "./use-staff-management-DwJBpOj5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/system.dashboard.staff-Clk9j3da.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var roleTone = {
	moderator: "bg-info/10 text-info",
	admin: "bg-accent/15 text-accent",
	superadmin: "bg-warning/10 text-warning"
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
				className: "flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-6 text-warning" }), " Staff Management"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Promote existing accounts to Moderator or Admin, or remove staff access."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border bg-card p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-3 text-sm font-bold text-foreground",
					children: "Promote an account"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: identifier,
							onChange: (e) => setIdentifier(e.target.value),
							placeholder: "email or username",
							className: "h-10 min-w-[220px] flex-1 rounded-xl border border-border bg-card px-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: role,
							onChange: (e) => setRole(e.target.value),
							className: "h-10 rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "moderator",
								children: "Moderator"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "admin",
								children: "Admin"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "brand",
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
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "size-4" }), " Promote"]
						})
					]
				})]
			}),
			staffUser?.role === "superadmin" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: submitCreateStaff,
				className: "rounded-2xl border border-border bg-card p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-1 text-sm font-bold text-foreground",
						children: "Create a staff account"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-4 text-xs text-muted-foreground",
						children: "Create an account and sign in to its dashboard. Only superadmins can create staff accounts."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-2",
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
								className: "h-10 rounded-xl border border-border bg-card px-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
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
								className: "h-10 rounded-xl border border-border bg-card px-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
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
								className: "h-10 rounded-xl border border-border bg-card px-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
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
								placeholder: "Password (8+ characters)",
								autoComplete: "new-password",
								className: "h-10 rounded-xl border border-border bg-card px-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: newStaff.role,
								onChange: (e) => setNewStaff({
									...newStaff,
									role: e.target.value
								}),
								className: "h-10 rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none",
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
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "submit",
								variant: "brand",
								disabled: createStaff.isPending,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "size-4" }), createStaff.isPending ? "Creating account…" : "Create and open dashboard"]
							})
						]
					})
				]
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
								children: "Staff member"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-3 font-semibold",
								children: "Role"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-3 font-semibold",
								children: "Since"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "p-3 font-semibold",
								children: "Actions"
							})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						colSpan: 4,
						className: "p-8 text-center text-muted-foreground",
						children: "Loading…"
					}) }), (data?.staff ?? []).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-white/5 last:border-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-semibold text-foreground",
									children: s.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground",
									children: [
										"@",
										s.username,
										" · ",
										s.email
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "p-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("rounded-md px-1.5 py-0.5 text-[11px] font-bold", roleTone[s.role]),
									children: ROLE_LABEL[s.role]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "p-3 text-muted-foreground",
								children: new Date(s.createdAt).toLocaleDateString()
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "p-3",
								children: s.role !== "superadmin" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "outline",
									className: "border-border text-foreground/90 hover:bg-danger/10 hover:text-danger",
									onClick: () => demote.mutate(s._id, {
										onSuccess: () => toast.success(`Removed staff access for @${s.username}`),
										onError: (err) => toast.error(err.message || "Couldn't demote")
									}),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldMinus, { className: "size-3.5" }), " Demote"]
								})
							})
						]
					}, s._id))] })]
				})
			})
		]
	});
}
//#endregion
export { StaffManagementPage as component };
