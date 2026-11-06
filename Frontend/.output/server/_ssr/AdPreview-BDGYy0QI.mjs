import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { Jt as ImageOff, Z as Share2, Zt as Heart, jt as MessageCircle, pn as ExternalLink } from "../_libs/lucide-react.mjs";
import { c as mediaUrlWithAuth, s as mediaUrl } from "./api-client-C-W0Sa9i.mjs";
import { t as AdBadge } from "./AdBadge-CcJQZFFu.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AdPreview-BDGYy0QI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function MissingMedia({ label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid h-full w-full place-items-center gap-2 bg-slate-900 p-5 text-center text-xs text-white/75",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageOff, { className: "size-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label })]
	});
}
function AdvertiserAvatar({ src, name, hue, sizeClass }) {
	const [failed, setFailed] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setFailed(false), [src]);
	const initials = name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "A";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `relative grid shrink-0 place-items-center overflow-hidden rounded-full text-xs font-bold text-white ${sizeClass}`,
		style: { background: `linear-gradient(140deg, oklch(0.5 0.11 ${hue}), oklch(0.74 0.1 ${hue + 24}))` },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"aria-hidden": "true",
			children: initials
		}), src && !failed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src,
			alt: name,
			className: "absolute inset-0 size-full object-cover",
			onError: () => setFailed(true)
		})]
	});
}
function AdPreview({ adType, placement, title, caption, ctaText = "Learn More", ctaUrl, mediaUrl: mediaUrl$1, mediaKey, thumbnailUrl, creatorName = "Account", creatorUsername = "account", creatorAvatarUrl, creatorAvatarHue = 250 }) {
	const mediaPath = mediaUrl$1 || (mediaKey ? `/api/v1/media/file/${mediaKey}` : void 0);
	const resolvedMedia = mediaUrlWithAuth(mediaUrl(mediaPath) || mediaPath);
	const resolvedThumbnail = mediaUrlWithAuth(mediaUrl(thumbnailUrl) || thumbnailUrl);
	const resolvedAvatar = mediaUrlWithAuth(mediaUrl(creatorAvatarUrl) || creatorAvatarUrl);
	const isVideo = adType.includes("video");
	const placementLabel = placement === "reels" ? "Deeds" : "Decisions";
	const [mediaFailed, setMediaFailed] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setMediaFailed(false);
	}, [resolvedMedia]);
	if (placement !== "feed") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative mx-auto aspect-[9/16] w-full max-w-[260px] overflow-hidden rounded-3xl border border-border bg-slate-900 shadow-2xl",
		children: [
			resolvedMedia && !mediaFailed ? isVideo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
				src: resolvedMedia,
				poster: resolvedThumbnail,
				controls: true,
				muted: true,
				playsInline: true,
				preload: "metadata",
				className: "h-full w-full object-cover",
				onError: () => setMediaFailed(true)
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: resolvedMedia,
				alt: title,
				decoding: "async",
				onError: () => setMediaFailed(true),
				className: "h-full w-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MissingMedia, { label: mediaFailed ? `Advertisement media could not be loaded. Check the upload or media permissions. (${placementLabel})` : `Upload media to preview this ${placementLabel} advertisement` }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-3 text-white",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdvertiserAvatar, {
							src: resolvedAvatar,
							name: creatorName,
							hue: creatorAvatarHue,
							sizeClass: "size-8"
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
				className: "pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 text-white",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "line-clamp-1 text-sm font-bold",
						children: title
					}),
					caption && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 line-clamp-2 text-xs text-white/80",
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
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdvertiserAvatar, {
						src: resolvedAvatar,
						name: creatorName,
						hue: creatorAvatarHue,
						sizeClass: "size-9"
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
				children: resolvedMedia && !mediaFailed ? isVideo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
					src: resolvedMedia,
					poster: resolvedThumbnail,
					controls: true,
					muted: true,
					playsInline: true,
					preload: "metadata",
					onError: () => setMediaFailed(true),
					className: "h-full w-full object-cover"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: resolvedMedia,
					alt: title,
					decoding: "async",
					onError: () => setMediaFailed(true),
					className: "h-full w-full object-cover"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MissingMedia, { label: mediaFailed ? "Advertisement media could not be loaded. Check the upload or media permissions." : "Upload media to preview this Feed advertisement" })
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
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex items-center gap-4 text-muted-foreground",
					"aria-hidden": "true",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-4" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-4" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-4" })
					]
				})]
			})
		]
	});
}
//#endregion
export { AdPreview as t };
