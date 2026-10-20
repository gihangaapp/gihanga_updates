import { o as __toESM } from "../_runtime.mjs";
import { t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { Mt as LoaderCircle, Ot as Mail, xn as CircleCheck } from "../_libs/lucide-react.mjs";
import { n as api } from "./api-client-C-02deeD.mjs";
import { o as isEmail } from "./auth-context-Duh7Mq6E.mjs";
import { n as AuthLayout } from "./AuthLayout-cw0K42Ps.mjs";
import { t as AuthField } from "./AuthFields-CwIm0Cxd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/forgot-password-3rv0FiM-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ForgotPasswordPage() {
	const [email, setEmail] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)();
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [sent, setSent] = (0, import_react.useState)(false);
	function submit(e) {
		e.preventDefault();
		if (!isEmail(email)) {
			setError("Enter a valid email address.");
			return;
		}
		setError(void 0);
		setBusy(true);
		api.post("/auth/forgot-password", { email: email.trim() }).then(() => {
			setBusy(false);
			setSent(true);
		}).catch((err) => {
			setBusy(false);
			setError(err?.message || "Something went wrong. Please try again.");
		});
	}
	if (sent) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthLayout, {
		title: "Check your inbox",
		subtitle: `If an account exists for ${email}, a reset link is on its way.`,
		back: {
			to: "/login",
			label: "Back to sign in"
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-3 rounded-2xl bg-primary-soft p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "mt-0.5 size-5 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-foreground/80",
						children: "The link expires in 30 minutes. Didn't get it? Check spam, then try again."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "lg",
					className: "w-full",
					onClick: () => setSent(false),
					children: "Use a different email"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "brand",
					size: "lg",
					className: "w-full",
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/login",
						children: "Back to sign in"
					})
				})
			]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthLayout, {
		title: "Reset your password",
		subtitle: "We'll email you a secure link to set a new one.",
		back: {
			to: "/login",
			label: "Back to sign in"
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: submit,
			className: "space-y-5",
			noValidate: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthField, {
				label: "Email",
				icon: Mail,
				type: "email",
				autoComplete: "email",
				placeholder: "you@example.com",
				value: email,
				error,
				onChange: (e) => setEmail(e.target.value)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "submit",
				variant: "brand",
				size: "lg",
				className: "w-full",
				disabled: busy,
				children: [busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "animate-spin" }), busy ? "Sending link…" : "Send reset link"]
			})]
		})
	});
}
//#endregion
export { ForgotPasswordPage as component };
