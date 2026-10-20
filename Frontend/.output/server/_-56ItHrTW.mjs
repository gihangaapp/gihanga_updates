import { t as Button } from "./_ssr/button-CJVUuoS8.mjs";
import { P as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Logo } from "./_ssr/Logo-C5LwQkSU.mjs";
import { b as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { Vt as House, mn as Compass } from "./_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_-56ItHrTW.js
var import_jsx_runtime = require_jsx_runtime();
function CatchAllPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-screen place-items-center px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "surface-card animate-fade-up flex max-w-md flex-col items-center gap-4 p-10 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-6xl font-extrabold tracking-tight text-primary",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-xl font-bold",
					children: "This page slipped off the feed"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "The link is broken or the post was removed. Everything else is still right here."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-1 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "brand",
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "size-4" }), "Back to feed"]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/explore",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Compass, { className: "size-4" }), "Explore"]
						})
					})]
				})
			]
		})
	});
}
//#endregion
export { CatchAllPage as component };
