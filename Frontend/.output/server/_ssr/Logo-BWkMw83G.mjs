import { r as cn } from "./button-CJVUuoS8.mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/logo-CPnzYLe7.js
var logo_default = "/assets/logo-DsDyB9Dx.png";
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/Logo-BWkMw83G.js
var import_jsx_runtime = require_jsx_runtime();
function Logo({ className, compact }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("flex items-center gap-2.5", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: logo_default,
			alt: "Gihanga Updates Logo",
			className: "size-9 shrink-0 object-contain rounded-xl shadow-glow"
		}), !compact && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "min-w-0 leading-none",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block font-display text-[15px] font-extrabold tracking-tight text-foreground",
				children: "Gihanga"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase",
				children: "Updates"
			})]
		})]
	});
}
//#endregion
export { logo_default as n, Logo as t };
