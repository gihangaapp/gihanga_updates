import { o as __toESM } from "../_runtime.mjs";
import { r as cn } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { en as Eye, tn as EyeOff } from "../_libs/lucide-react.mjs";
import { c as strengthLabels, s as passwordScore } from "./auth-context-Duh7Mq6E.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AuthFields-CwIm0Cxd.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AuthField({ label, icon: Icon, error, hint, className, id, ...props }) {
	const autoId = import_react.useId();
	const fieldId = id ?? autoId;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1.5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				htmlFor: fieldId,
				className: "block text-xs font-bold tracking-wide uppercase text-muted-foreground",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative",
				children: [Icon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					id: fieldId,
					"aria-invalid": !!error,
					className: cn("h-12 w-full rounded-2xl border border-border bg-surface/80 px-4 text-sm outline-none transition-all placeholder:text-muted-foreground", "focus:border-ring focus:bg-surface focus:shadow-glow", Icon && "pl-10", error && "border-danger", className),
					...props
				})]
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium text-danger",
				children: error
			}) : hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: hint
			}) : null
		]
	});
}
function PasswordField({ label, error, hint, value, ...props }) {
	const [show, setShow] = import_react.useState(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthField, {
			...props,
			value,
			label,
			error,
			hint,
			type: show ? "text" : "password",
			className: "pr-12"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => setShow((s) => !s),
			"aria-label": show ? "Hide password" : "Show password",
			className: "press absolute top-[30px] right-3 grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted",
			children: show ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4" })
		})]
	});
}
function PasswordStrength({ value }) {
	const score = passwordScore(value);
	const tone = score <= 1 ? "bg-danger" : score === 2 ? "bg-warning" : score === 3 ? "bg-info" : "bg-success";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex gap-1.5",
			children: [
				0,
				1,
				2,
				3
			].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("h-1.5 flex-1 rounded-full transition-colors", value && i < score ? tone : "bg-border") }, i))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted-foreground",
			children: value ? strengthLabels[score] : "Use 8+ characters with a number and a symbol."
		})]
	});
}
function StepProgress({ step, total }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-6 space-y-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between text-xs font-semibold text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
				"Step ",
				step,
				" of ",
				total
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [Math.round(step / total * 100), "%"] })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-1.5 overflow-hidden rounded-full bg-border",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "gradient-brand h-full rounded-full transition-[width] duration-500 ease-out",
				style: { width: `${step / total * 100}%` }
			})
		})]
	});
}
//#endregion
export { StepProgress as i, PasswordField as n, PasswordStrength as r, AuthField as t };
