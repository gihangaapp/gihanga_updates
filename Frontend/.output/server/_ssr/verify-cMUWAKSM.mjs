import { o as __toESM } from "../_runtime.mjs";
import { r as cn, t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { G as ShieldCheck, jt as LoaderCircle } from "../_libs/lucide-react.mjs";
import { n as api } from "./api-client-C-02deeD.mjs";
import { l as useAuth } from "./auth-context-Duh7Mq6E.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as AuthLayout } from "./AuthLayout-DrXi0ryu.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/verify-cMUWAKSM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var LENGTH = 6;
function VerifyPage() {
	const navigate = useNavigate();
	const { user, updateConsumerProfile } = useAuth();
	const [digits, setDigits] = (0, import_react.useState)(Array(LENGTH).fill(""));
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [seconds, setSeconds] = (0, import_react.useState)(42);
	const [resending, setResending] = (0, import_react.useState)(false);
	const refs = (0, import_react.useRef)([]);
	(0, import_react.useEffect)(() => {
		if (user?.emailVerified) navigate({ to: user.onboarded ? "/" : "/interests" });
	}, [user, navigate]);
	(0, import_react.useEffect)(() => {
		if (seconds <= 0) return;
		const t = window.setTimeout(() => setSeconds((s) => s - 1), 1e3);
		return () => window.clearTimeout(t);
	}, [seconds]);
	const code = digits.join("");
	function setAt(i, value) {
		const clean = value.replace(/\D/g, "");
		if (!clean) {
			setDigits((d) => d.map((x, idx) => idx === i ? "" : x));
			return;
		}
		setDigits((d) => {
			const next = [...d];
			clean.split("").forEach((ch, k) => {
				if (i + k < LENGTH) next[i + k] = ch;
			});
			return next;
		});
		const target = Math.min(i + clean.length, 5);
		refs.current[target]?.focus();
	}
	function submit(e) {
		e.preventDefault();
		if (code.length < LENGTH) {
			setError("Enter all six digits.");
			return;
		}
		setError(null);
		setBusy(true);
		api.post("/auth/verify-email", { code }).then((data) => {
			setBusy(false);
			updateConsumerProfile(data.user);
			toast.success("Email verified", { description: "Let's tune your feed." });
			navigate({ to: data.user.onboarded ? "/" : "/interests" });
		}).catch((err) => {
			setBusy(false);
			setError(err?.message || "That code didn't work. Please try again.");
		});
	}
	function resend() {
		setResending(true);
		api.post("/auth/resend-verification").then(() => {
			setSeconds(42);
			toast.success("New code sent", { description: "Check your inbox." });
		}).catch((err) => {
			toast.error(err?.message || "Couldn't resend the code. Try again shortly.");
		}).finally(() => setResending(false));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthLayout, {
		title: "Verify your email",
		subtitle: `We sent a 6-digit code to ${user?.email || "your inbox"}. It expires in 10 minutes.`,
		back: {
			to: "/register",
			label: "Back to sign up"
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: submit,
			className: "space-y-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-between gap-2",
					onPaste: (e) => {
						e.preventDefault();
						setAt(0, e.clipboardData.getData("text"));
					},
					children: digits.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: (el) => {
							refs.current[i] = el;
						},
						value: d,
						inputMode: "numeric",
						autoComplete: "one-time-code",
						"aria-label": `Digit ${i + 1}`,
						maxLength: LENGTH,
						onChange: (e) => setAt(i, e.target.value),
						onKeyDown: (e) => {
							if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
							if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
							if (e.key === "ArrowRight" && i < 5) refs.current[i + 1]?.focus();
						},
						className: cn("h-14 w-full rounded-2xl border border-border bg-surface/80 text-center font-display text-xl font-bold outline-none transition-all", "focus:border-ring focus:shadow-glow", error && "border-danger")
					}, i))
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium text-danger",
					children: error
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "submit",
					variant: "brand",
					size: "lg",
					className: "w-full",
					disabled: busy,
					children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {}), busy ? "Verifying…" : "Verify and continue"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-center text-sm text-muted-foreground",
					children: seconds > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						"Resend code in ",
						seconds,
						"s"
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "font-semibold text-primary hover:underline disabled:opacity-60",
						onClick: resend,
						disabled: resending,
						children: resending ? "Sending…" : "Resend code"
					})
				})
			]
		})
	});
}
//#endregion
export { VerifyPage as component };
