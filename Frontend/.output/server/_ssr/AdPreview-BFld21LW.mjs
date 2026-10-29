import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { Dt as MessageCircle, X as Share2, qt as Heart, sn as ExternalLink } from "../_libs/lucide-react.mjs";
import { s as mediaUrl } from "./api-client-DZOxvrvB.mjs";
import { t as AdBadge } from "./AdBadge-CcJQZFFu.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AdPreview-BFld21LW.js
var import_jsx_runtime = require_jsx_runtime();
function AdPreview({ adType, placement, title, caption, ctaText = "Learn More", ctaUrl, mediaUrl: mediaUrl$1, thumbnailUrl, creatorName = "Your Brand", creatorUsername = "yourbrand" }) {
	const resolvedMedia = mediaUrl(mediaUrl$1) || mediaUrl$1;
	const resolvedThumbnail = mediaUrl(thumbnailUrl) || thumbnailUrl;
	if (placement === "story") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative mx-auto aspect-[9/16] w-full max-w-[260px] overflow-hidden rounded-3xl border border-border bg-slate-900 shadow-2xl",
		children: [
			resolvedMedia ? adType.includes("video") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
				src: resolvedMedia,
				poster: resolvedThumbnail,
				autoPlay: true,
				loop: true,
				muted: true,
				playsInline: true,
				className: "h-full w-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: resolvedMedia,
				alt: title,
				className: "h-full w-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid h-full w-full place-items-center bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-6 text-center text-xs text-muted-foreground",
				children: "Media preview will display here"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-x-0 top-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-3 text-white",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid size-8 place-items-center rounded-full bg-indigo-600 font-bold text-white text-xs",
							children: creatorName[0]?.toUpperCase()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-xs font-bold leading-tight",
								children: creatorName
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-[10px] text-white/70",
								children: ["@", creatorUsername]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdBadge, { variant: "glass" })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 text-white",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-bold text-sm line-clamp-1",
						children: title
					}),
					caption && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-white/80 line-clamp-2",
						children: caption
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex items-center justify-between rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-lg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: ctaText }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-3.5" })]
					})
				]
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "surface-card overflow-hidden border border-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between p-3.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid size-9 place-items-center rounded-full bg-indigo-600 font-bold text-white text-xs",
						children: creatorName[0]?.toUpperCase()
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-bold text-foreground",
							children: creatorName
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-[11px] text-muted-foreground",
							children: ["@", creatorUsername]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] text-muted-foreground",
						children: "Sponsored"
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdBadge, { variant: "glass" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative aspect-video w-full overflow-hidden bg-slate-900",
				children: resolvedMedia ? adType.includes("video") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
					src: resolvedMedia,
					poster: resolvedThumbnail,
					controls: true,
					muted: true,
					className: "h-full w-full object-cover"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: resolvedMedia,
					alt: title,
					className: "h-full w-full object-cover"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid h-full w-full place-items-center p-6 text-center text-xs text-muted-foreground",
					children: "No media attached yet"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between border-y border-border/60 bg-muted/30 px-4 py-2.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1 pr-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-xs font-bold text-foreground",
						children: title
					}), ctaUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-[10px] text-muted-foreground",
						children: ctaUrl
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex shrink-0 items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground",
					children: [ctaText, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-3" })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-3.5",
				children: [caption && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-foreground/90",
					children: caption
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 flex items-center justify-between text-muted-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-4" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-4" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-4" })
						]
					})
				})]
			})
		]
	});
}
//#endregion
export { AdPreview as t };
