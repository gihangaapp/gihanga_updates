import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Logo } from "./Logo-C5LwQkSU.mjs";
import { x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { Cn as CircleAlert, G as ShieldCheck, Mt as LoaderCircle, N as Sun, _t as Moon } from "../_libs/lucide-react.mjs";
import { n as api } from "./api-client-C-02deeD.mjs";
import { Z as useTheme } from "./router-Dh25U3j0.mjs";
import { l as useAuth } from "./auth-context-Duh7Mq6E.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { t as ROLE_LABEL } from "./permissions-CGE25KsA.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/system.index-B-ljA90j.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function StaffLoginPage() {
	const navigate = useNavigate();
	const { signInStaff } = useAuth();
	const { theme, toggle } = useTheme();
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function submit(e) {
		e.preventDefault();
		setError(null);
		setBusy(true);
		try {
			const data = await api.post("/system/auth/login", {
				email,
				password
			}, true);
			signInStaff(data.tokens, data.user);
			toast.success(`Welcome back, ${data.user.name}`, { description: `Signed in as ${ROLE_LABEL[data.user.role] ?? data.user.role}` });
			navigate({ to: "/system/dashboard" });
		} catch (err) {
			setError(err?.message || "Invalid staff credentials.");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-0 opacity-60 dark:opacity-40",
				style: { backgroundImage: "radial-gradient(circle at 20% 20%, oklch(0.62 0.13 205 / 0.16), transparent 42%), radial-gradient(circle at 80% 0%, oklch(0.7 0.13 190 / 0.14), transparent 45%), radial-gradient(circle at 50% 100%, oklch(0.55 0.12 250 / 0.12), transparent 50%)" }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-0 opacity-[0.05]",
				style: {
					backgroundImage: "linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)",
					backgroundSize: "44px 44px"
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": "Toggle theme",
				onClick: toggle,
				className: "press absolute top-5 right-5 grid size-10 place-items-center rounded-xl border border-border bg-card/70 text-muted-foreground backdrop-blur",
				children: theme === "dark" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "size-4.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "size-4.5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
				initial: {
					opacity: 0,
					y: 16
				},
				animate: {
					opacity: 1,
					y: 0
				},
				transition: {
					duration: .5,
					ease: [
						.22,
						1,
						.36,
						1
					]
				},
				className: "relative w-full max-w-[400px]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-8 flex flex-col items-center gap-3 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
								initial: {
									scale: .8,
									opacity: 0
								},
								animate: {
									scale: 1,
									opacity: 1
								},
								transition: {
									duration: .4,
									delay: .1
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {
									compact: true,
									className: "scale-125"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 flex items-center gap-1.5 text-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "font-display text-lg font-extrabold tracking-tight",
									children: "Staff Console"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "Moderator · Admin · Super Admin access only"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
						onSubmit: submit,
						className: "rounded-2xl border border-border bg-card/70 p-6 shadow-2xl backdrop-blur-xl",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									htmlFor: "staff-email",
									className: "mb-1.5 block text-xs font-semibold text-muted-foreground",
									children: "Staff email"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "staff-email",
									type: "email",
									required: true,
									autoComplete: "username",
									value: email,
									onChange: (e) => setEmail(e.target.value),
									placeholder: "you@gihanga.rw",
									className: "h-11 w-full rounded-xl border border-border bg-elevated px-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-ring"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									htmlFor: "staff-password",
									className: "mb-1.5 block text-xs font-semibold text-muted-foreground",
									children: "Password"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "staff-password",
									type: "password",
									required: true,
									autoComplete: "current-password",
									value: password,
									onChange: (e) => setPassword(e.target.value),
									placeholder: "••••••••",
									className: "h-11 w-full rounded-xl border border-border bg-elevated px-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-ring"
								})] }),
								error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
									initial: {
										opacity: 0,
										height: 0
									},
									animate: {
										opacity: 1,
										height: "auto"
									},
									className: "flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-xs text-danger",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "mt-0.5 size-3.5 shrink-0" }), error]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "submit",
									disabled: busy,
									className: "gradient-brand flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-transform active:scale-[0.98] disabled:opacity-60",
									children: [busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), busy ? "Signing in…" : "Sign in to console"]
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-5 text-center text-xs text-muted-foreground",
						children: "Regular Gihanga Updates accounts can't sign in here — this console is for platform staff only."
					})
				]
			})
		]
	});
}
//#endregion
export { StaffLoginPage as component };
