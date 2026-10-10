import { o as __toESM } from "../_runtime.mjs";
import { t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { Dt as Mail, jt as LoaderCircle, q as ShieldAlert } from "../_libs/lucide-react.mjs";
import { n as api } from "./api-client-C-02deeD.mjs";
import { l as useAuth, o as isEmail } from "./auth-context-Duh7Mq6E.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as AuthLayout } from "./AuthLayout-D7hiqduU.mjs";
import { n as PasswordField, t as AuthField } from "./AuthFields-CwIm0Cxd.mjs";
import { n as SocialButtons, t as AuthDivider } from "./SocialButtons-CEw1_IBb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-CxWyNmZI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LoginPage() {
	const navigate = useNavigate();
	const { signInConsumer } = useAuth();
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [remember, setRemember] = (0, import_react.useState)(true);
	const [errors, setErrors] = (0, import_react.useState)({});
	const [isStaffNotice, setIsStaffNotice] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function submit(e) {
		e.preventDefault();
		setIsStaffNotice(false);
		const next = {};
		if (!isEmail(email)) next.email = "Enter a valid email address.";
		if (password.length < 6) next.password = "Password must be at least 6 characters.";
		setErrors(next);
		if (Object.keys(next).length) return;
		setBusy(true);
		try {
			const data = await api.post("/auth/login", {
				email,
				password
			});
			signInConsumer(data.tokens, data.user);
			if (!data.user.emailVerified) {
				toast("Verify your email to continue", { description: "We sent you a code when you signed up." });
				navigate({ to: "/verify" });
			} else {
				toast.success("Welcome back", { description: "You're signed in to Gihanga Updates." });
				navigate({ to: data.user.onboarded ? "/" : "/interests" });
			}
		} catch (err) {
			const message = err?.message || "Sign in failed. Please try again.";
			if (message.includes("/system") || message.includes("Staff")) {
				setIsStaffNotice(true);
				setErrors({ form: "Staff accounts must log in through the internal staff portal." });
			} else setErrors({ form: message });
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthLayout, {
		title: "Sign in",
		subtitle: "Your feed, your creators, exactly where you left it.",
		back: {
			to: "/welcome",
			label: "Back to welcome"
		},
		children: [
			errors.form && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-center justify-between rounded-xl bg-danger/10 border border-danger/20 p-3.5 text-xs font-semibold text-danger",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "size-4 shrink-0" }), errors.form]
				}), isStaffNotice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/system",
					className: "underline font-bold hover:opacity-80",
					children: "Go to /system"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: submit,
				className: "space-y-4",
				noValidate: true,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthField, {
						label: "Email",
						icon: Mail,
						type: "email",
						autoComplete: "email",
						placeholder: "you@example.com",
						value: email,
						error: errors.email,
						onChange: (e) => setEmail(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordField, {
						label: "Password",
						autoComplete: "current-password",
						placeholder: "••••••••",
						value: password,
						error: errors.password,
						onChange: (e) => setPassword(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex cursor-pointer items-center gap-2 text-sm text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: remember,
								onChange: (e) => setRemember(e.target.checked),
								className: "size-4 accent-primary"
							}), "Remember me"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/forgot-password",
							className: "text-sm font-semibold text-primary hover:underline",
							children: "Forgot password?"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "submit",
						variant: "brand",
						size: "lg",
						className: "w-full",
						disabled: busy,
						children: [busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "animate-spin" }), busy ? "Signing you in…" : "Sign in"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthDivider, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SocialButtons, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-6 text-center text-sm text-muted-foreground",
				children: [
					"New here?",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/register",
						className: "font-semibold text-primary hover:underline",
						children: "Create an account"
					})
				]
			})
		]
	});
}
//#endregion
export { LoginPage as component };
