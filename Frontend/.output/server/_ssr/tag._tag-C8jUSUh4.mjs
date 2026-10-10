import { o as __toESM } from "../_runtime.mjs";
import { r as cn, t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { Jt as Flame, T as TrendingUp, Ut as Hash, jt as LoaderCircle } from "../_libs/lucide-react.mjs";
import { Ct as useTagPosts, Ot as useTrendingTags, b as Route$14, k as formatCount, t as AppShell } from "./router-BS6G260b.mjs";
import { t as PostCard } from "./PostCard-Wz4-zHQN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tag._tag-C8jUSUh4.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var tabs = ["All", "Reels"];
function TagPage() {
	const { tag } = Route$14.useLoaderData();
	const [tab, setTab] = (0, import_react.useState)("All");
	const { data, isLoading, postsCount, fetchNextPage, hasNextPage, isFetchingNextPage } = useTagPosts(tag);
	const trending = useTrendingTags();
	const allPosts = data?.pages.flatMap((p) => p.posts) ?? [];
	const list = tab === "Reels" ? allPosts.filter((p) => p.kind === "reel") : allPosts;
	const relatedTags = (trending.data?.tags ?? []).filter((t) => t.tag.toLowerCase() !== tag.toLowerCase());
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-[640px]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "surface-card mb-4 flex flex-wrap items-center gap-4 p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "gradient-brand grid size-16 shrink-0 place-items-center rounded-2xl",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hash, {
						className: "size-8 text-primary-foreground",
						strokeWidth: 2.6
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "truncate font-display text-2xl font-extrabold tracking-tight",
						children: ["#", tag]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted-foreground",
						children: [formatCount(postsCount), " posts"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "glass mb-4 flex gap-1 rounded-2xl border p-1",
				children: tabs.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setTab(t),
					className: cn("press flex-1 rounded-xl py-2 text-sm font-semibold", t === tab ? "bg-primary-soft text-primary" : "text-muted-foreground"),
					children: t
				}, t))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4",
				children: [
					isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), " Loading posts…"]
					}),
					!isLoading && list.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "py-16 text-center text-sm text-muted-foreground",
						children: [
							"No posts with #",
							tag,
							" yet."
						]
					}),
					list.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PostCard, { post: p }, p._id)),
					hasNextPage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex justify-center py-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							onClick: () => fetchNextPage(),
							disabled: isFetchingNextPage,
							children: [isFetchingNextPage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), "Load more"]
						})
					})
				]
			}),
			relatedTags.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "surface-card mt-4 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "mb-3 flex items-center gap-2 font-display text-base font-bold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, { className: "size-4 text-primary" }), " Related tags"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "flex flex-wrap gap-2",
					children: relatedTags.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/tag/$tag",
						params: { tag: t.tag },
						className: "press flex items-center gap-1.5 rounded-full bg-elevated px-3 py-1.5 text-xs font-semibold hover:bg-muted",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-3.5 text-success" }),
							"#",
							t.tag
						]
					}) }, t.tag))
				})]
			})
		]
	}) });
}
//#endregion
export { TagPage as component };
