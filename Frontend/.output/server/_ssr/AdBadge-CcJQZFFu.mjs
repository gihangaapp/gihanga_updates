import { r as cn } from "./button-CJVUuoS8.mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { I as Sparkles } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AdBadge-CcJQZFFu.js
var import_jsx_runtime = require_jsx_runtime();
function AdBadge({ className, variant = "glass" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide", variant === "glass" && "border border-amber-500/30 bg-amber-500/10 text-amber-500 backdrop-blur-sm", variant === "solid" && "bg-amber-500 text-black shadow-sm", variant === "outline" && "border border-amber-500 text-amber-500", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Sponsored" })]
	});
}
//#endregion
export { AdBadge as t };
