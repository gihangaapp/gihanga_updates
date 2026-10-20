import { r as cn, t as Button } from "./button-CJVUuoS8.mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Logo } from "./Logo-C5LwQkSU.mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { N as Sun, Un as ArrowLeft, _t as Moon } from "../_libs/lucide-react.mjs";
import { Z as useTheme } from "./router-Dh25U3j0.mjs";
import { t as motion } from "../_libs/motion.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AuthLayout-cw0K42Ps.js
var import_jsx_runtime = require_jsx_runtime();
function AuthBackdrop() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"aria-hidden": true,
		className: "pointer-events-none fixed inset-0 overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "halo absolute -top-40 -left-32 size-[520px] rounded-full opacity-50 blur-3xl" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "gradient-brand absolute -right-40 -bottom-52 size-[560px] rounded-full opacity-25 blur-3xl" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,transparent,var(--color-background)_72%)]" })
		]
	});
}
function AuthLayout({ children, title, subtitle, back, wide }) {
	const { theme, toggle } = useTheme();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex min-h-screen flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthBackdrop, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "relative z-10 flex items-center gap-3 px-4 py-5 sm:px-8",
				children: [
					back ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon-sm",
						"aria-label": back.label,
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: back.to,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {})
						})
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/welcome",
						className: "press",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						className: "ml-auto",
						"aria-label": theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
						onClick: toggle,
						children: theme === "dark" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, {})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "relative z-10 flex flex-1 items-start justify-center px-4 pb-16 sm:items-center sm:px-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					initial: {
						opacity: 0,
						y: 18,
						scale: .985
					},
					animate: {
						opacity: 1,
						y: 0,
						scale: 1
					},
					transition: {
						duration: .45,
						ease: [
							.22,
							1,
							.36,
							1
						]
					},
					className: cn("glass w-full rounded-3xl p-6 shadow-float sm:p-8", wide ? "max-w-2xl" : "max-w-md"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-2xl font-extrabold tracking-tight sm:text-[28px]",
							children: title
						}),
						subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted-foreground",
							children: subtitle
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-6",
							children
						})
					]
				})
			})
		]
	});
}
//#endregion
export { AuthLayout as n, AuthBackdrop as t };
