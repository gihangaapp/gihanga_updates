import { o as __toESM } from "../_runtime.mjs";
import { r as cn, t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { S as useSearch, b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { $ as Send, D as Trash2, Dt as MessageCircle, Ft as LoaderCircle, In as Camera, Mn as ChevronDown, Vn as Bookmark, X as Share2, Yn as ArrowLeft, ht as Music2, kn as ChevronUp, l as VolumeX, lt as Play, ot as RefreshCw, qt as Heart, u as Volume2, un as EllipsisVertical } from "../_libs/lucide-react.mjs";
import { s as mediaUrl } from "./api-client-DZOxvrvB.mjs";
import { E as formatCount, F as useDeletePost, H as useFollowingSet, J as useReelsFeed, O as openCreate, at as useToggleLike, p as GAvatar, rt as useToggleBookmark, t as AppShell, w as VerifiedBadge, z as useFollowUser } from "./router-CrddKQ7E.mjs";
import { l as useAuth } from "./auth-context-CuF8V2_l.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as AnimatePresence } from "../_libs/framer-motion.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { i as logRecommendationEvent, r as ShareSheet, t as CommentSheet } from "./CommentSheet-CRzcye6U.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reels-BVJv3zgW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* B5.8 — Reels scroll machinery (pure, DOM-free).
*
* The reel feed previously "danced": programmatic `scrollIntoView` raced the
* mandatory CSS scroll-snap, scrolled page-level ancestors, and a rAF handler
* flipped the active index (and thus the windowed DOM) mid-animation. The
* rules below are the fixed contract the reels route now follows:
*
*  1. The ONLY thing that ever scrolls is the snap container itself, always
*     to an EXACT card multiple (`index * clientHeight`) — never
*     `scrollIntoView` (which also scrolls every scrollable ancestor,
*     including the page) and never a non-snap target.
*  2. The active index is derived from scroll GEOMETRY and committed only
*     once scrolling has SETTLED — no state flips mid-flight.
*  3. Wheel/trackpad is owned by us (preventDefault) and grouped into
*     gestures: one navigation per gesture, re-armed only after a quiet
*     period, so native snap and inertia tails can never fight us.
*
* Everything here is pure so the gesture grouping and index math are covered
* by unit tests (tests/reel-scroll.test.ts) without a browser.
*/
/** Clamp a reel index to the list bounds. */
function clampReelIndex(idx, count) {
	if (!Number.isFinite(idx)) return 0;
	if (count <= 0) return 0;
	return Math.max(0, Math.min(count - 1, Math.round(idx)));
}
/**
* Nearest reel index for a scroll position. With every card exactly one
* viewport tall (h-full children of a definite-height flex scroller), the
* nearest card is simply `round(scrollTop / clientHeight)`.
*/
function reelIndexFromScroll(scrollTop, clientHeight) {
	if (!Number.isFinite(scrollTop) || !Number.isFinite(clientHeight) || clientHeight <= 0) return 0;
	return Math.max(0, Math.round(scrollTop / clientHeight));
}
/** Wheel deltas below this per-event magnitude are drift/jitter noise. */
var WHEEL_EVENT_EPSILON = 8;
/** A gesture must accumulate this much (pixel-mode) delta to navigate. */
var WHEEL_NAV_THRESHOLD = 60;
/**
* Groups a stream of wheel deltas into gestures.
*
* - Deltas accumulate (signed) until they cross `WHEEL_NAV_THRESHOLD`; the
*   FIRST crossing of a gesture emits exactly one `nav` in the accumulated
*   direction and disarms.
* - While disarmed, every further delta is ignored — this swallows trackpad
*   inertia tails (decaying deltas of the same flick) which previously caused
*   the skip-a-video-then-snap-back behaviour.
* - Re-arm happens ONLY via `rearm()` — the caller invokes it after
*   `WHEEL_SILENCE_MS` without wheel events, so one physical gesture always
*   means one navigation, and a held/continuous stream never turbo-scrolls.
*/
var ReelWheelArbiter = class {
	armed = true;
	total = 0;
	/** Feed one normalised (pixel-mode) wheel delta. */
	onWheelDelta(delta, _now) {
		if (!Number.isFinite(delta) || Math.abs(delta) < WHEEL_EVENT_EPSILON) return { ignore: true };
		if (!this.armed) {
			this.total += delta;
			return { ignore: true };
		}
		this.total += delta;
		if (Math.abs(this.total) >= WHEEL_NAV_THRESHOLD) {
			const dir = this.total > 0 ? 1 : -1;
			this.total = 0;
			this.armed = false;
			return { nav: dir };
		}
		return { ignore: true };
	}
	/** True while a navigation from this gesture has already fired. */
	get isDisarmed() {
		return !this.armed;
	}
	/** Call after `WHEEL_SILENCE_MS` without wheel events. */
	rearm() {
		this.armed = true;
		this.total = 0;
	}
};
/** Normalise a WheelEvent delta to pixel units (Firefox line/page modes). */
function normaliseWheelDelta(deltaY, deltaMode, viewportHeight) {
	if (deltaMode === 1) return deltaY * 16;
	if (deltaMode === 2) return deltaY * Math.max(1, viewportHeight);
	return deltaY;
}
function toDisplayUser(author) {
	const a = typeof author === "object" && author !== null ? author : {};
	return {
		id: typeof a["_id"] === "string" ? a["_id"] : "unknown",
		name: typeof a["name"] === "string" ? a["name"] : "Creator",
		username: typeof a["username"] === "string" ? a["username"] : "creator",
		bio: "",
		avatarHue: typeof a["avatarHue"] === "number" ? a["avatarHue"] : 0,
		avatarUrl: a["avatarUrl"] ?? null,
		verified: Boolean(a["verified"]),
		creator: Boolean(a["isCreator"]),
		live: Boolean(a["isLive"]),
		followers: typeof a["followersCount"] === "number" ? a["followersCount"] : 0,
		following: 0,
		posts: 0
	};
}
function ReelCard({ reel, isActive, isNeighbor, isMuted, onToggleMute }) {
	const { user } = useAuth();
	const [playing, setPlaying] = (0, import_react.useState)(true);
	const [isExpanded, setIsExpanded] = (0, import_react.useState)(false);
	const [commentsOpen, setCommentsOpen] = (0, import_react.useState)(false);
	const [shareOpen, setShareOpen] = (0, import_react.useState)(false);
	const [moreOpen, setMoreOpen] = (0, import_react.useState)(false);
	const [burst, setBurst] = (0, import_react.useState)(false);
	const [hasError, setHasError] = (0, import_react.useState)(false);
	const [isLoading, setIsLoading] = (0, import_react.useState)(true);
	const videoRef = (0, import_react.useRef)(null);
	const lastTap = (0, import_react.useRef)(0);
	const toggleLike = useToggleLike();
	const toggleBookmark = useToggleBookmark();
	const deletePost = useDeletePost();
	const followUser = useFollowUser();
	const { data: followingSet } = useFollowingSet();
	const authorObj = typeof reel.author === "object" ? reel.author : null;
	const authorUsername = authorObj?.username || "creator";
	const authorName = authorObj?.name || "Creator";
	const authorAvatar = authorObj?.avatarUrl;
	const isOwn = user?.username === authorUsername;
	const following = followingSet?.has(authorUsername) ?? Boolean(reel.followingAuthor);
	const mediaSrc = mediaUrl(reel.mediaUrl);
	const attachSrc = (isActive || isNeighbor) && !hasError;
	(0, import_react.useEffect)(() => {
		const video = videoRef.current;
		if (!video) return;
		if (isActive && !hasError) {
			video.muted = isMuted;
			video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
		} else {
			video.pause();
			video.muted = true;
			setPlaying(false);
		}
	}, [
		isActive,
		hasError,
		isMuted
	]);
	(0, import_react.useEffect)(() => {
		if (isActive && videoRef.current && !hasError) videoRef.current.play().catch(() => {});
	}, [isActive, hasError]);
	const handleLike = (0, import_react.useCallback)(() => {
		logRecommendationEvent({
			event: reel.liked ? "reel_unlike" : "reel_like",
			targetKind: "reel",
			targetId: reel._id,
			creatorId: String(authorObj?._id ?? reel.author),
			tags: Array.isArray(reel.tags) ? reel.tags : []
		});
		toggleLike.mutate(reel._id);
	}, [
		toggleLike,
		reel._id,
		reel.liked,
		authorObj?._id,
		reel.author,
		reel.tags
	]);
	const togglePlay = () => {
		if (!videoRef.current || hasError) return;
		if (playing) {
			videoRef.current.pause();
			setPlaying(false);
		} else videoRef.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
	};
	const handleMediaTap = () => {
		const now = Date.now();
		if (now - lastTap.current < 300) {
			if (!reel.liked) handleLike();
			setBurst(true);
			setTimeout(() => setBurst(false), 700);
		} else togglePlay();
		lastTap.current = now;
	};
	const maxCharLimit = 90;
	const bodyText = reel.body || "";
	const isLongCaption = bodyText.length > maxCharLimit;
	const displayCaption = isLongCaption && !isExpanded ? `${bodyText.slice(0, maxCharLimit)}…` : bodyText;
	const primaryTag = (Array.isArray(reel.tags) ? reel.tags : [])[0] || "REELS";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		"data-reel-id": reel._id,
		className: "relative flex h-full w-full shrink-0 flex-col justify-center overflow-hidden rounded-3xl bg-black select-none shadow-float max-lg:rounded-none max-lg:shadow-none",
		children: [
			mediaSrc && attachSrc ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
				ref: videoRef,
				src: mediaSrc,
				poster: mediaUrl(reel.thumbnailUrl),
				autoPlay: isActive,
				loop: true,
				muted: isMuted || !isActive,
				playsInline: true,
				preload: isActive ? "auto" : "metadata",
				onLoadedData: () => setIsLoading(false),
				onError: () => {
					setIsLoading(false);
					setHasError(true);
				},
				onClick: handleMediaTap,
				onContextMenu: (e) => e.preventDefault(),
				className: "size-full cursor-pointer object-contain"
			}) : hasError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center text-white",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-semibold",
					children: "Unable to play this Reel."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					onClick: () => {
						setHasError(false);
						setIsLoading(true);
						if (videoRef.current) videoRef.current.load();
					},
					className: "gap-2 border-white/30 text-white hover:bg-white/20",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4" }), " Retry"]
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex h-full w-full items-center justify-center bg-black/80",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music2, { className: "size-8 animate-pulse text-white/20" })
			}),
			isLoading && attachSrc && !hasError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 grid place-items-center bg-black/40 pointer-events-none",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-8 animate-spin text-white" })
			}),
			!playing && !isLoading && !hasError && isActive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				onClick: togglePlay,
				className: "absolute inset-0 grid place-items-center cursor-pointer bg-black/20",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
					initial: {
						scale: .8,
						opacity: 0
					},
					animate: {
						scale: 1,
						opacity: 1
					},
					className: "grid size-16 place-items-center rounded-full bg-black/50 text-white backdrop-blur-md",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-8 fill-white ml-1" })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: burst && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
				initial: {
					scale: .3,
					opacity: 0
				},
				animate: {
					scale: [
						.3,
						1.25,
						1
					],
					opacity: [
						0,
						1,
						0
					]
				},
				exit: { opacity: 0 },
				transition: {
					duration: .7,
					times: [
						0,
						.4,
						1
					]
				},
				className: "pointer-events-none absolute inset-0 z-20 grid place-items-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-24 fill-danger text-danger drop-shadow-2xl" })
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/35 to-transparent" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-x-0 top-0 z-20 flex items-center justify-between p-4 max-lg:pt-[max(1rem,env(safe-area-inset-top))] bg-gradient-to-b from-black/70 via-black/30 to-transparent",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						"aria-label": "Back to home",
						className: "press grid size-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md lg:hidden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-xl font-extrabold text-white drop-shadow-md tracking-tight",
						children: "Reels"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": isMuted ? "Unmute sound" : "Mute sound",
						onClick: onToggleMute,
						className: "press grid size-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60",
						children: isMuted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4.5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => openCreate("reel"),
						className: "press grid size-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60",
						title: "Create Reel",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "size-5" })
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute right-3 bottom-16 max-lg:bottom-[max(2.5rem,env(safe-area-inset-bottom))] z-20 flex flex-col items-center gap-5 text-white",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"data-reel-action": "like",
						onClick: handleLike,
						className: "press flex flex-col items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("grid size-11 place-items-center rounded-full bg-black/40 backdrop-blur-md transition-colors", reel.liked && "bg-danger/20 text-danger"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, {
								className: cn("size-6", reel.liked && "fill-danger text-danger"),
								strokeWidth: 2
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11px] font-extrabold text-white drop-shadow-md",
							children: formatCount(reel.likesCount || 0)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setCommentsOpen(true),
						className: "press flex flex-col items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-11 place-items-center rounded-full bg-black/40 backdrop-blur-md",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, {
								className: "size-6 text-white",
								strokeWidth: 2
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11px] font-extrabold text-white drop-shadow-md",
							children: formatCount(reel.commentsCount || 0)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setShareOpen(true),
						className: "press flex flex-col items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-11 place-items-center rounded-full bg-black/40 backdrop-blur-md",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, {
								className: "size-6 text-white",
								strokeWidth: 2
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11px] font-extrabold text-white drop-shadow-md",
							children: reel.sharesCount && reel.sharesCount > 0 ? formatCount(reel.sharesCount) : ""
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setMoreOpen(true),
						className: "press flex flex-col items-center gap-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-11 place-items-center rounded-full bg-black/40 backdrop-blur-md",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EllipsisVertical, {
								className: "size-6 text-white",
								strokeWidth: 2
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "relative mt-2 size-10 rounded-xl overflow-hidden border-2 border-white/80 shadow-lg bg-gradient-to-tr from-indigo-600 via-violet-600 to-primary flex items-center justify-center animate-spin [animation-duration:8s] motion-reduce:animate-none",
						children: authorAvatar ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: mediaUrl(authorAvatar),
							alt: "",
							className: "size-full object-cover"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music2, { className: "size-5 text-white" })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-x-0 bottom-0 z-20 p-5 pr-20 max-lg:pb-[max(1.25rem,env(safe-area-inset-bottom))] text-white space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold text-white backdrop-blur-md border border-white/20",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music2, { className: "size-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate max-w-[160px] uppercase tracking-wider text-[10px]",
							children: primaryTag
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2.5 pt-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/profile/$username",
							params: { username: authorUsername },
							className: "press flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GAvatar, {
									user: toDisplayUser(reel.author),
									size: "sm"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm font-extrabold text-white truncate hover:underline",
									children: authorUsername
								}),
								authorObj?.verified && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VerifiedBadge, {})
							]
						}), !isOwn && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => followUser.mutate({
								username: authorUsername,
								follow: !following
							}, { onError: (err) => toast.error(err.message || "Couldn't update follow status") }),
							className: cn("rounded-xl border px-3 py-1 text-xs font-bold transition-all shadow-md", following ? "border-white/30 bg-white/10 text-white backdrop-blur-md" : "border-white bg-white text-slate-950 hover:bg-white/90"),
							children: following ? "Following" : "Follow"
						})]
					}),
					bodyText && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "max-w-md text-xs leading-relaxed text-white/95 drop-shadow-md",
						children: [displayCaption, isLongCaption && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setIsExpanded((prev) => !prev),
							className: "ml-1 text-xs font-extrabold text-white hover:underline",
							children: isExpanded ? "Show less" : "more"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 text-[11px] text-white/80 pt-1 font-medium",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "↗" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "truncate",
								children: ["Original audio — ", authorName]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "truncate text-white/70",
								children: ["✨ ", primaryTag]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentSheet, {
				post: reel,
				open: commentsOpen,
				onOpenChange: setCommentsOpen
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShareSheet, {
				open: shareOpen,
				onOpenChange: setShareOpen,
				title: `Reel by @${authorUsername} on Gihanga Updates`,
				text: reel.body,
				url: `${typeof window !== "undefined" ? window.location.origin : ""}/post/${reel._id}`
			}),
			moreOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				onClick: () => setMoreOpen(false),
				className: "fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm max-sm:p-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					onClick: (e) => e.stopPropagation(),
					className: "w-full max-w-sm rounded-3xl border border-white/20 bg-slate-900 p-4 text-white shadow-2xl space-y-2 max-sm:max-w-none max-sm:rounded-b-none max-sm:pb-[max(1rem,env(safe-area-inset-bottom))]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								toggleBookmark.mutate(reel._id);
								setMoreOpen(false);
								toast.success(reel.bookmarked ? "Removed from bookmarks" : "Saved to bookmarks");
							},
							className: "flex w-full items-center gap-3 rounded-2xl p-3 text-xs font-bold hover:bg-white/10",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, { className: "size-4.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: reel.bookmarked ? "Remove from bookmarks" : "Save to bookmarks" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								setMoreOpen(false);
								setShareOpen(true);
							},
							className: "flex w-full items-center gap-3 rounded-2xl p-3 text-xs font-bold hover:bg-white/10",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-4.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Share Reel" })]
						}),
						isOwn && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								setMoreOpen(false);
								deletePost.mutate(reel._id);
								toast.success("Reel deleted");
							},
							className: "flex w-full items-center gap-3 rounded-2xl p-3 text-xs font-bold text-red-400 hover:bg-red-500/10",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Delete Reel" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setMoreOpen(false),
							className: "w-full rounded-2xl bg-white/10 py-2.5 text-xs font-bold text-white hover:bg-white/20",
							children: "Cancel"
						})
					]
				})
			})
		]
	});
}
/** B5 — key target ignore check: typing in inputs/sheets must not navigate. */
function shouldIgnoreReelKeys() {
	const active = document.activeElement;
	if (active instanceof HTMLElement && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.tagName === "SELECT" || active.isContentEditable)) return true;
	return Boolean(document.querySelector("[role='dialog'][data-state='open'], [data-state='open'] > .fixed"));
}
function ReelsPage() {
	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useReelsFeed();
	const reels = (0, import_react.useMemo)(() => data?.pages.flatMap((p) => p.posts) ?? [], [data]);
	const [activeReelIndex, setActiveReelIndex] = (0, import_react.useState)(0);
	const [isMuted, setIsMuted] = (0, import_react.useState)(false);
	const navigate = useNavigate();
	const { reel: deepLinkReel } = useSearch({ from: "/reels" });
	const containerRef = (0, import_react.useRef)(null);
	const activeIndexRef = (0, import_react.useRef)(0);
	const reelsLengthRef = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		activeIndexRef.current = activeReelIndex;
	}, [activeReelIndex]);
	(0, import_react.useEffect)(() => {
		reelsLengthRef.current = reels.length;
	}, [reels.length]);
	(0, import_react.useEffect)(() => {
		const root = document.documentElement;
		root.classList.add("reels-page-scroll-lock");
		return () => {
			root.classList.remove("reels-page-scroll-lock");
		};
	}, []);
	const goToReelImpl = (0, import_react.useCallback)((idx) => {
		const container = containerRef.current;
		if (!container) return;
		const target = clampReelIndex(idx, reelsLengthRef.current);
		container.scrollTo({
			top: target * container.clientHeight,
			behavior: "smooth"
		});
	}, []);
	/** Step one reel from the CURRENT GEOMETRY (never a stale React state),
	* so chained input mid-animation retargets correctly. */
	const navigateStep = (0, import_react.useCallback)((dir) => {
		const container = containerRef.current;
		if (!container || reelsLengthRef.current === 0) return;
		const target = clampReelIndex(reelIndexFromScroll(container.scrollTop, container.clientHeight) + dir, reelsLengthRef.current);
		container.scrollTo({
			top: target * container.clientHeight,
			behavior: "smooth"
		});
	}, []);
	const navigateStepRef = (0, import_react.useRef)(navigateStep);
	(0, import_react.useEffect)(() => {
		navigateStepRef.current = navigateStep;
	}, [navigateStep]);
	const deepLinkHandled = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		if (deepLinkHandled.current || !deepLinkReel || reels.length === 0) return;
		const idx = reels.findIndex((r) => r._id === deepLinkReel);
		if (idx >= 0) {
			deepLinkHandled.current = true;
			setActiveReelIndex(idx);
			requestAnimationFrame(() => {
				const container = containerRef.current;
				if (container) container.scrollTo({
					top: clampReelIndex(idx, reelsLengthRef.current) * container.clientHeight,
					behavior: "auto"
				});
			});
		}
	}, [deepLinkReel, reels]);
	(0, import_react.useEffect)(() => {
		const container = containerRef.current;
		if (!container) return;
		let settleTimer;
		let lastScrollAt = 0;
		const commitIndex = () => {
			const idx = clampReelIndex(reelIndexFromScroll(container.scrollTop, container.clientHeight), reelsLengthRef.current);
			if (idx !== activeIndexRef.current) {
				activeIndexRef.current = idx;
				setActiveReelIndex(idx);
			}
		};
		const scheduleSettle = (delay) => {
			if (settleTimer !== void 0) window.clearTimeout(settleTimer);
			settleTimer = window.setTimeout(() => {
				settleTimer = void 0;
				commitIndex();
			}, delay);
		};
		const onScroll = () => {
			lastScrollAt = Date.now();
			scheduleSettle(140);
		};
		const onScrollEnd = () => scheduleSettle(0);
		container.addEventListener("scroll", onScroll, { passive: true });
		const supportsScrollEnd = "onscrollend" in window;
		if (supportsScrollEnd) container.addEventListener("scrollend", onScrollEnd);
		const resizeObserver = new ResizeObserver(() => {
			if (Date.now() - lastScrollAt < 180) return;
			const expected = activeIndexRef.current * container.clientHeight;
			if (Math.abs(container.scrollTop - expected) > 1) container.scrollTop = expected;
		});
		resizeObserver.observe(container);
		return () => {
			container.removeEventListener("scroll", onScroll);
			if (supportsScrollEnd) container.removeEventListener("scrollend", onScrollEnd);
			if (settleTimer !== void 0) window.clearTimeout(settleTimer);
			resizeObserver.disconnect();
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (hasNextPage && !isFetchingNextPage && reels.length > 0 && activeReelIndex >= reels.length - 3) fetchNextPage();
	}, [
		activeReelIndex,
		reels.length,
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage
	]);
	const goToReel = (0, import_react.useCallback)((idx) => {
		if (idx < 0 || idx >= reelsLengthRef.current) return;
		goToReelImpl(idx);
	}, [goToReelImpl]);
	(0, import_react.useEffect)(() => {
		const onKeyUpCooldown = { last: 0 };
		const onKeyDown = (e) => {
			if (shouldIgnoreReelKeys()) return;
			if (reelsLengthRef.current === 0) return;
			const now = Date.now();
			if ([
				"ArrowDown",
				"ArrowUp",
				"j",
				"k",
				"PageDown",
				"PageUp"
			].includes(e.key)) {
				if (now - onKeyUpCooldown.last < 120) {
					e.preventDefault();
					return;
				}
				onKeyUpCooldown.last = now;
			}
			switch (e.key) {
				case "ArrowDown":
				case "j":
				case "PageDown":
					e.preventDefault();
					navigateStep(1);
					break;
				case "ArrowUp":
				case "k":
				case "PageUp":
					e.preventDefault();
					navigateStep(-1);
					break;
				case "m":
				case "M":
					setIsMuted((prev) => !prev);
					break;
				case " ": {
					e.preventDefault();
					const target = (containerRef.current?.querySelectorAll("article[data-reel-id]")[activeReelIndex])?.querySelector("video");
					if (target instanceof HTMLVideoElement) {
						if (target.paused) target.play().catch(() => {});
						else target.pause();
					}
					break;
				}
				case "l":
				case "L":
					(containerRef.current?.querySelectorAll("article[data-reel-id]")[activeReelIndex])?.querySelector("[data-reel-action=\"like\"]")?.click();
					break;
				case "Escape": navigate({
					to: "/",
					replace: true
				});
			}
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [
		activeReelIndex,
		navigateStep,
		navigate
	]);
	(0, import_react.useEffect)(() => {
		containerRef.current?.focus?.();
	}, []);
	(0, import_react.useEffect)(() => {
		const container = containerRef.current;
		if (!container) return;
		const arbiter = new ReelWheelArbiter();
		let silenceTimer;
		const onWheel = (e) => {
			if (shouldIgnoreReelKeys()) return;
			if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
			e.preventDefault();
			if (silenceTimer !== void 0) window.clearTimeout(silenceTimer);
			silenceTimer = window.setTimeout(() => {
				silenceTimer = void 0;
				arbiter.rearm();
			}, 150);
			const dy = normaliseWheelDelta(e.deltaY, e.deltaMode, container.clientHeight);
			const decision = arbiter.onWheelDelta(dy, performance.now());
			if ("nav" in decision) navigateStepRef.current(decision.nav);
		};
		container.addEventListener("wheel", onWheel, { passive: false });
		return () => {
			container.removeEventListener("wheel", onWheel);
			if (silenceTimer !== void 0) window.clearTimeout(silenceTimer);
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		immersiveMobile: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto flex h-[calc(100dvh-9rem)] w-full max-w-[460px] flex-col max-lg:fixed max-lg:inset-0 max-lg:z-40 max-lg:h-dvh max-lg:max-w-none max-lg:bg-black",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative min-h-0 flex-1",
				children: [
					reels.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute -right-14 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-2 lg:flex",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: activeReelIndex === 0,
							onClick: () => goToReel(activeReelIndex - 1),
							className: "press grid size-11 place-items-center rounded-full bg-surface border border-border shadow-soft text-foreground disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-ring",
							title: "Previous Reel (↑ / k)",
							"aria-label": "Previous reel",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "size-6" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: activeReelIndex === reels.length - 1,
							onClick: () => goToReel(activeReelIndex + 1),
							className: "press grid size-11 place-items-center rounded-full bg-surface border border-border shadow-soft text-foreground disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-ring",
							title: "Next Reel (↓ / j)",
							"aria-label": "Next reel",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-6" })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						ref: containerRef,
						tabIndex: -1,
						"aria-label": "Reels player — use arrow keys or j and k to navigate",
						className: "flex h-full w-full flex-col overflow-y-auto no-scrollbar overscroll-contain",
						style: { scrollSnapType: "y mandatory" },
						children: [
							isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex h-full items-center justify-center gap-2 text-sm text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-5 animate-spin text-primary" }), " Loading reels…"]
							}),
							!isLoading && reels.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "surface-card m-4 rounded-3xl p-8 text-center text-muted-foreground space-y-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-10 mx-auto text-muted-foreground/40" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-semibold",
										children: "No reels yet — be the first to post one!"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "brand",
										size: "sm",
										onClick: () => openCreate("reel"),
										children: "Create a Reel"
									})
								]
							}),
							reels.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-full w-full shrink-0 p-1 pb-2 max-lg:p-0",
								style: {
									scrollSnapAlign: "start",
									scrollSnapStop: "always"
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReelCard, {
									reel: r,
									isActive: i === activeReelIndex,
									isNeighbor: Math.abs(i - activeReelIndex) === 1,
									isMuted,
									onToggleMute: () => setIsMuted((prev) => !prev)
								})
							}, r._id)),
							isFetchingNextPage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex h-20 items-center justify-center gap-2 text-xs text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), " Loading more…"]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"aria-live": "polite",
						className: "sr-only",
						children: reels[activeReelIndex] ? `Reel ${activeReelIndex + 1} of ${reels.length} by @${reels[activeReelIndex]?.author?.username ?? "creator"}` : ""
					})
				]
			})
		})
	});
}
//#endregion
export { ReelsPage as component };
