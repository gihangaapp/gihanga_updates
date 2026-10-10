import { o as __toESM } from "../_runtime.mjs";
import { t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { jt as LoaderCircle, q as ShieldAlert, yn as CircleCheck } from "../_libs/lucide-react.mjs";
import { n as api } from "./api-client-C-02deeD.mjs";
import { w as Route$26 } from "./router-NU7wHj2a.mjs";
import { s as passwordScore } from "./auth-context-Duh7Mq6E.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as AuthLayout } from "./AuthLayout-D7hiqduU.mjs";
import { n as PasswordField, r as PasswordStrength } from "./AuthFields-CwIm0Cxd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reset-password-D6osKZh0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ResetPasswordPage() {
	const { token, email } = Route$26.useSearch();
	const navigate = useNavigate();
	const [password, setPassword] = (0, import_react.useState)("");
	const [confirm, setConfirm] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)();
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [done, setDone] = (0, import_react.useState)(false);
	if (!token || !email) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthLayout, {
		title: "Invalid reset link",
		subtitle: "This password reset link is missing information.",
		back: {
			to: "/forgot-password",
			label: "Request a new link"
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start gap-3 rounded-2xl bg-danger/10 p-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "mt-0.5 size-5 shrink-0 text-danger" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-foreground/80",
				children: "Open this page from the link in the password reset email, or request a new one."
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "brand",
			size: "lg",
			className: "mt-5 w-full",
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/forgot-password",
				children: "Request a new link"
			})
		})]
	});
	if (done) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthLayout, {
		title: "Password updated",
		subtitle: "You can now sign in with your new password.",
		back: {
			to: "/login",
			label: "Back to sign in"
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start gap-3 rounded-2xl bg-primary-soft p-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "mt-0.5 size-5 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-foreground/80",
				children: "Your password has been reset successfully."
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "brand",
			size: "lg",
			className: "mt-5 w-full",
			onClick: () => navigate({ to: "/login" }),
			children: "Sign in"
		})]
	});
	function submit(e) {
		e.preventDefault();
		if (passwordScore(password) < 2) {
			setError("Choose a stronger password.");
			return;
		}
		if (password !== confirm) {
			setError("Passwords don't match.");
			return;
		}
		setError(void 0);
		setBusy(true);
		api.post("/auth/reset-password", {
			token,
			email,
			password
		}).then(() => {
			setBusy(false);
			setDone(true);
			toast.success("Password reset");
		}).catch((err) => {
			setBusy(false);
			setError(err?.message || "This reset link is invalid or has expired.");
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthLayout, {
		title: "Set a new password",
		subtitle: `Choose a new password for ${email}.`,
		back: {
			to: "/login",
			label: "Back to sign in"
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: submit,
			className: "space-y-5",
			noValidate: true,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordField, {
						label: "New password",
						placeholder: "••••••••",
						autoComplete: "new-password",
						value: password,
						onChange: (e) => setPassword(e.target.value)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordStrength, { value: password })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordField, {
					label: "Confirm password",
					placeholder: "••••••••",
					autoComplete: "new-password",
					value: confirm,
					error,
					onChange: (e) => setConfirm(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "submit",
					variant: "brand",
					size: "lg",
					className: "w-full",
					disabled: busy,
					children: [busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "animate-spin" }), busy ? "Updating…" : "Update password"]
				})
			]
		})
	});
}
//#endregion
export { ResetPasswordPage as component };
