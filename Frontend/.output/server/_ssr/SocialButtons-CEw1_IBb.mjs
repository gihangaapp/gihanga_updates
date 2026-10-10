import { t as Button } from "./button-CJVUuoS8.mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/SocialButtons-CEw1_IBb.js
var import_jsx_runtime = require_jsx_runtime();
function GoogleMark() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 24 24",
		className: "size-4",
		"aria-hidden": true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			fill: "currentColor",
			d: "M12 11v3.2h5.3c-.2 1.4-1.6 4.1-5.3 4.1-3.2 0-5.8-2.6-5.8-5.8S8.8 6.7 12 6.7c1.8 0 3 .8 3.7 1.4l2.5-2.4C16.6 4.2 14.5 3.3 12 3.3 7.2 3.3 3.3 7.2 3.3 12s3.9 8.7 8.7 8.7c5 0 8.4-3.5 8.4-8.5 0-.6-.1-1-.2-1.2H12Z"
		})
	});
}
function AppleMark() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 24 24",
		className: "size-4",
		"aria-hidden": true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			fill: "currentColor",
			d: "M16.4 12.8c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.7-1.8-3.3-1.8-1.4-.1-2.6.8-3.3.8-.7 0-1.7-.8-2.9-.8-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.7 1.1 8.9.8 1.1 1.7 2.3 2.9 2.2 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.2 0 2-1.1 2.8-2.2.6-.9.9-1.7 1.1-2.2-2.1-.8-2.7-2.8-2.7-3.7ZM14.3 5.9c.6-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.1 1.8-1 2.9 1.1.1 2.2-.6 2.8-1.4Z"
		})
	});
}
function SocialButtons({ mode = "in" }) {
	const label = mode === "in" ? "Sign in" : "Sign up";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-2.5 sm:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "outline",
			size: "lg",
			onClick: () => toast(`${label} with Google`, { description: "Social auth is mocked in this build." }),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoogleMark, {}), "Google"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "outline",
			size: "lg",
			onClick: () => toast(`${label} with Apple`, { description: "Social auth is mocked in this build." }),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppleMark, {}), "Apple"]
		})]
	});
}
function AuthDivider({ label = "or" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "my-5 flex items-center gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs font-semibold tracking-wide text-muted-foreground uppercase",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" })
		]
	});
}
//#endregion
export { SocialButtons as n, AuthDivider as t };
