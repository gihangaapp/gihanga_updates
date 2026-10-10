import { o as __toESM } from "../_runtime.mjs";
import { r as cn, t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { Nn as Bookmark, Wt as Grid3x3, zt as ImageOff } from "../_libs/lucide-react.mjs";
import { s as mediaUrl } from "./api-client-C-02deeD.mjs";
import { D as UserName, F as timeAgo, R as useBookmarkedPosts, Tt as useToggleBookmark, k as formatCount, p as GAvatar, t as AppShell } from "./router-BS6G260b.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/bookmarks-gXFSrmrJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function toDisplayUser(author) {
	return {
		id: author._id,
		name: author.name,
		username: author.username,
		bio: "",
		avatarHue: author.avatarHue,
		avatarUrl: author.avatarUrl,
		verified: author.verified,
		creator: author.isCreator,
		followers: 0,
		following: 0,
		posts: 0
	};
}
function BookmarksPage() {
	const [view, setView] = (0, import_react.useState)("list");
	const { data, isLoading } = useBookmarkedPosts();
	const toggleBookmark = useToggleBookmark();
	const items = data?.posts ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-[680px]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex items-center gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl font-extrabold tracking-tight",
					children: "Saved"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "rounded-full bg-primary-soft px-2.5 py-1 text-xs font-bold text-primary",
					children: items.length
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "glass ml-auto flex gap-1 rounded-xl border p-1",
					children: ["list", "grid"].map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": `${v} view`,
						onClick: () => setView(v),
						className: cn("press grid size-8 place-items-center rounded-lg", view === v ? "bg-primary-soft text-primary" : "text-muted-foreground"),
						children: v === "list" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid3x3, { className: "size-4" })
					}, v))
				})
			]
		}), isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "p-10 text-center text-sm text-muted-foreground",
			children: "Loading your saved posts…"
		}) : !items.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "surface-card flex flex-col items-center gap-3 p-12 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageOff, { className: "size-8 text-muted-foreground" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Nothing saved yet. Tap the bookmark icon on any post."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "brand",
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/explore",
						children: "Explore posts"
					})
				})
			]
		}) : view === "grid" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 gap-2 sm:grid-cols-3",
			children: items.map((p) => {
				const image = mediaUrl(p.mediaUrl);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative aspect-square overflow-hidden rounded-2xl bg-elevated",
					children: image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: image,
						alt: p.body.slice(0, 60),
						loading: "lazy",
						className: "size-full object-cover"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "p-3 text-xs leading-snug",
						children: p.body
					})
				}, p._id);
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "flex flex-col gap-3",
			children: items.map((p) => {
				const image = mediaUrl(p.mediaUrl);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "surface-card lift flex gap-3 p-3",
					children: [
						image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: image,
							alt: p.body.slice(0, 60),
							loading: "lazy",
							className: "size-20 shrink-0 rounded-xl object-cover"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "gradient-brand grid size-20 shrink-0 place-items-center rounded-xl font-display text-lg font-bold text-primary-foreground",
							children: "G"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/profile/$username",
									params: { username: p.author.username },
									className: "press flex items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GAvatar, {
											user: toDisplayUser(p.author),
											size: "xs"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserName, {
											user: toDisplayUser(p.author),
											className: "text-xs"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-xs text-muted-foreground",
											children: ["· ", timeAgo(p.createdAt)]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 line-clamp-2 text-sm leading-snug",
									children: p.body
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-xs text-muted-foreground",
									children: [
										formatCount(p.likesCount),
										" likes · ",
										formatCount(p.commentsCount),
										" comments"
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": "Remove from saved",
							onClick: () => {
								toggleBookmark.mutate(p._id);
								toast.success("Removed from saved");
							},
							className: "press h-fit rounded-full p-2 text-primary hover:bg-muted",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, { className: "size-5 fill-primary" })
						})
					]
				}, p._id);
			})
		})]
	}) });
}
//#endregion
export { BookmarksPage as component };
