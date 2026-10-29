import { t as Button } from "./button-CJVUuoS8.mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { Ft as LoaderCircle, Yn as ArrowLeft } from "../_libs/lucide-react.mjs";
import { Q as useSinglePost, b as Route$19, t as AppShell } from "./router-CrddKQ7E.mjs";
import { t as PostCard } from "./PostCard-Co-hfSpx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/post._postId-h6_Nn92r.js
var import_jsx_runtime = require_jsx_runtime();
function PostDetailPage() {
	const { postId } = Route$19.useParams();
	const { data, isLoading, isError } = useSinglePost(postId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-[620px] space-y-4 pb-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "sm",
					asChild: true,
					className: "rounded-xl font-bold",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4 mr-1.5" }), " Back"]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-lg font-extrabold tracking-tight text-foreground",
					children: "Post"
				})]
			}),
			isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-center gap-2 py-20 text-sm text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-5 animate-spin text-primary" }), " Loading post…"]
			}),
			isError || !isLoading && !data?.post ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface-card rounded-3xl p-10 text-center text-muted-foreground border border-border space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-semibold",
					children: "This post isn't available anymore."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "brand",
					size: "sm",
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						children: "Go back home"
					})
				})]
			}) : null,
			data?.post && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pt-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PostCard, { post: data.post })
			})
		]
	}) });
}
//#endregion
export { PostDetailPage as component };
