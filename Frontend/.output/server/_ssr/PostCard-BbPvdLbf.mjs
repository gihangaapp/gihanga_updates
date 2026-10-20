import { o as __toESM } from "../_runtime.mjs";
import { r as cn, t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { Dt as MapPin, E as Trash2, En as ChevronLeft, Fn as Bookmark, J as Share2, Mt as LoaderCircle, Tn as ChevronRight, Tt as MessageCircle, Ut as Heart, Zt as Flag, _n as Clock, in as Ellipsis, l as VolumeX, nt as RotateCcw, q as ShieldAlert, st as Play, tn as EyeOff, u as Volume2, w as TriangleAlert, wt as MessageSquareHeart, xn as CircleCheck } from "../_libs/lucide-react.mjs";
import { n as api, s as mediaUrl } from "./api-client-C-02deeD.mjs";
import { Bt as DialogContent, C as VerifiedBadge, D as timeAgo, F as useFollowUser, Ht as DialogFooter, K as useRetryModeration, Q as useToggleBookmark, R as useFollowingSet, Rt as useIsMobile, Ut as DialogHeader, Vt as DialogDescription, Wt as DialogTitle, c as DropdownMenu, d as DropdownMenuSeparator, et as useToggleLike, f as DropdownMenuTrigger, j as useDeletePost, l as DropdownMenuContent, p as GAvatar, u as DropdownMenuItem, w as formatCount, zt as Dialog } from "./router-Dh25U3j0.mjs";
import { l as useAuth } from "./auth-context-Duh7Mq6E.mjs";
import { n as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as AnimatePresence } from "../_libs/framer-motion.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { a as useSubmitNotInterested, i as logRecommendationEvent, n as InlineComments, r as ShareSheet, t as CommentSheet } from "./CommentSheet-DdjnhY5b.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/PostCard-BbPvdLbf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUS_CONFIG = {
	processing: {
		label: "Checking your content",
		hint: "This is visible to you only while our safety systems review it.",
		icon: LoaderCircle,
		tone: "bg-primary/10 text-primary border-primary/20"
	},
	pending_review: {
		label: "Needs review",
		hint: "Our safety systems need a closer look — it will be reviewed before becoming visible to others.",
		icon: Clock,
		tone: "bg-warning/10 text-warning border-warning/25"
	},
	approved: {
		label: "Published",
		hint: "",
		icon: CircleCheck,
		tone: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
	},
	rejected: {
		label: "Could not be published",
		hint: "",
		icon: ShieldAlert,
		tone: "bg-danger/10 text-danger border-danger/25"
	},
	failed: {
		label: "Processing failed",
		hint: "Nothing was published. You can safely try again.",
		icon: TriangleAlert,
		tone: "bg-muted text-muted-foreground border-border"
	}
};
/**
* Non-graphic, user-safe moderation status chip + explanation.
* Mirrors the backend's `moderation.userMessage` when present — never
* thresholds, provider names or internal detail.
*/
function ModerationStatusBadge({ status, userMessage, onRetry, onAppeal, compact = false }) {
	const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.processing;
	const Icon = config.icon;
	if (compact) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", config.tone),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: cn("size-3", status === "processing" && "animate-spin") }), config.label]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("rounded-2xl border p-3 sm:p-4", config.tone),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: cn("size-4 shrink-0", status === "processing" && "animate-spin") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-bold",
					children: config.label
				})]
			}),
			(userMessage || config.hint) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs leading-relaxed opacity-90",
				children: userMessage || config.hint
			}),
			(status === "failed" || status === "rejected") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex flex-wrap gap-2",
				children: [status === "failed" && onRetry && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "outline",
					onClick: onRetry,
					children: "Try again"
				}), status === "rejected" && onAppeal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "outline",
					onClick: onAppeal,
					children: "Appeal this decision"
				})]
			})
		]
	});
}
var REPORT_REASONS = [
	"Nudity",
	"Violence",
	"Harassment",
	"Spam",
	"Misinformation",
	"Copyright",
	"Other"
];
/**
* REAL content report dialog — POST /api/v1/moderation/reports.
* Rate-limited server-side, deduplicated per reporter+target, and NEVER
* auto-removes content (reports only raise staff priority). The reporter's
* identity is not revealed to the reported user.
*/
function ReportDialog({ open, onOpenChange, targetType, targetId }) {
	const [reason, setReason] = (0, import_react.useState)("Nudity");
	const [details, setDetails] = (0, import_react.useState)("");
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const [done, setDone] = (0, import_react.useState)(false);
	const submit = useMutation({ mutationFn: () => api.post("/moderation/reports", {
		targetType,
		targetId,
		reason,
		details: details.trim() || void 0
	}) });
	async function handleSubmit() {
		setSubmitting(true);
		try {
			await submit.mutateAsync();
			setDone(true);
			toast.success("Report submitted — our moderation team will review it.");
			setTimeout(() => {
				onOpenChange(false);
				setDone(false);
				setDetails("");
				setReason("Nudity");
			}, 1200);
		} catch (err) {
			toast.error(err?.message || "Could not submit the report — please try again.");
		} finally {
			setSubmitting(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-md rounded-2xl p-0 gap-0 overflow-hidden",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
					className: "p-4 pb-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
						className: "flex items-center gap-2 text-base",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flag, { className: "size-4 text-danger" }),
							"Report this ",
							targetType === "user" ? "account" : targetType
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
						className: "text-xs",
						children: "Your report goes to our moderation team. Your identity is never shown to the person being reported. Reports never automatically remove content — a human reviews every case."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-4 pb-2 space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-1.5 text-xs font-bold text-foreground/80",
						children: "Why are you reporting?"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 gap-1.5",
						children: REPORT_REASONS.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setReason(r),
							className: `rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${reason === r ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground/70 hover:bg-muted"}`,
							children: r
						}, r))
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mb-1.5 text-xs font-bold text-foreground/80",
							children: ["Add details ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-normal text-muted-foreground",
								children: "(optional)"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							value: details,
							onChange: (e) => setDetails(e.target.value.slice(0, 300)),
							rows: 3,
							placeholder: "Anything that helps our moderators understand the issue…",
							className: "w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-right text-[10px] text-muted-foreground",
							children: [details.length, "/300"]
						})
					] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
					className: "flex-row gap-2 border-t border-border p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						className: "flex-1",
						onClick: () => onOpenChange(false),
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "flex-1",
						disabled: submitting || done,
						onClick: handleSubmit,
						children: done ? "Reported" : submitting ? "Sending…" : "Submit report"
					})]
				})
			]
		})
	});
}
/**
* Appeal a rejected moderation decision — POST /api/v1/moderation/appeals.
* One open appeal per record; author-only; critical-protocol records are
* non-appealable (the backend refuses with a generic message).
*/
function AppealDialog({ open, onOpenChange, recordId }) {
	const [statement, setStatement] = (0, import_react.useState)("");
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const submit = useMutation({ mutationFn: () => api.post("/moderation/appeals", {
		recordId,
		statement: statement.trim()
	}) });
	async function handleSubmit() {
		setSubmitting(true);
		try {
			await submit.mutateAsync();
			toast.success("Appeal submitted — we'll review it and notify you.");
			onOpenChange(false);
			setStatement("");
		} catch (err) {
			toast.error(err?.message || "Could not submit the appeal — please try again.");
		} finally {
			setSubmitting(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-md rounded-2xl p-0 gap-0 overflow-hidden",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
					className: "p-4 pb-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
						className: "flex items-center gap-2 text-base",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquareHeart, { className: "size-4 text-primary" }), "Appeal this decision"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
						className: "text-xs",
						children: "Tell us why you believe this content follows our guidelines. A human moderator — not an automated system — will review your appeal."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-4 pb-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						value: statement,
						onChange: (e) => setStatement(e.target.value.slice(0, 2e3)),
						rows: 5,
						placeholder: "For example: the image shows a medical procedure, a breastfeeding moment, or artwork shared for educational purposes…",
						className: "w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-right text-[10px] text-muted-foreground",
						children: [statement.length, "/2000 · at least 20 characters"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
					className: "flex-row gap-2 border-t border-border p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						className: "flex-1",
						onClick: () => onOpenChange(false),
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "flex-1",
						disabled: submitting || statement.trim().length < 20,
						onClick: handleSubmit,
						children: submitting ? "Sending…" : "Submit appeal"
					})]
				})
			]
		})
	});
}
/**
* B1 — Cloudinary delivery-URL transformation helper. Builds real srcset
* candidates with f_auto,q_auto,c_limit so the feed downloads exactly the
* pixels it needs. Falls back to undefined for local /uploads media (no CDN
* transformations there) and the caller uses the plain URL.
*/
var CLOUDINARY_URL_RE = /^(https:\/\/res\.cloudinary\.com\/[^/]+)\/(image|video)\/upload\/(?:[^/]+\/)?([^?#]+)$/;
/** True when the URL is a Cloudinary delivery URL we can transform. */
function isCdnUrl(url) {
	return Boolean(url && CLOUDINARY_URL_RE.test(url));
}
/**
* Returns the transformed URL, or undefined when the media isn't on a CDN.
* Photos: f_auto,q_auto,c_limit,w_<W>. Videos: f_auto,q_auto,vc_auto
* (via the caller's extras) — c_limit applies to images; for videos the
* caller passes what it needs.
*/
function cdnUrl(url, options) {
	if (!url) return void 0;
	const m = url.match(CLOUDINARY_URL_RE);
	if (!m) return void 0;
	const [, base, kind, asset] = m;
	return `${base}/${kind}/upload/${[
		`f_auto`,
		`q_auto`,
		...options.extra ?? [],
		`c_limit,w_${Math.round(options.width)}`
	].join(",")}/${asset}`;
}
/**
* Builds a full `srcset` attribute value for the given widths, e.g.
* "…w_480 480w, …w_800 800w, …w_1200 1200w". Returns undefined for
* non-CDN media (a srcset of identical URLs would be pointless).
*/
function cdnSrcSet(url, widths) {
	if (!url || !isCdnUrl(url)) return void 0;
	const entries = widths.map((w) => {
		const u = cdnUrl(url, { width: w });
		return u ? `${u} ${w}w` : void 0;
	}).filter(Boolean);
	return entries.length > 1 ? entries.join(", ") : void 0;
}
var FALLBACK_PLACEHOLDER = `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="#18181b"/></svg>`)}`;
var SRCSET_WIDTHS = [
	480,
	800,
	1200
];
function ResponsiveImage({ src, alt, blurDataUrl, aspectRatio, className, imgClassName, loading = "lazy", fetchPriority, sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px", onClick, fit = "cover", onMeasured }) {
	const [isLoaded, setIsLoaded] = (0, import_react.useState)(false);
	const [hasError, setHasError] = (0, import_react.useState)(false);
	const placeholder = blurDataUrl || FALLBACK_PLACEHOLDER;
	const srcSet = cdnSrcSet(src, SRCSET_WIDTHS);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative overflow-hidden bg-muted/40 select-none flex items-center justify-center", className),
		style: aspectRatio ? { aspectRatio: `${aspectRatio}` } : void 0,
		onClick,
		children: [
			fit === "contain" && !hasError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 size-full bg-cover bg-center blur-2xl scale-110 opacity-60",
				style: { backgroundImage: `url(${isLoaded ? src : placeholder})` },
				"aria-hidden": "true"
			}),
			!isLoaded && !hasError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: placeholder,
				alt: "",
				"aria-hidden": "true",
				className: "absolute inset-0 size-full object-cover filter blur-xl scale-110 opacity-70 transition-opacity duration-500"
			}),
			hasError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative z-10 grid size-full place-items-center bg-muted/60",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
					viewBox: "0 0 24 24",
					className: "size-8 text-muted-foreground/50",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "1.5",
					"aria-hidden": "true",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: "3",
						y: "3",
						width: "18",
						height: "18",
						rx: "2"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "m9 9 6 6M15 9l-6 6" })]
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src,
				alt,
				loading,
				fetchPriority,
				sizes: srcSet ? sizes : void 0,
				srcSet,
				onLoad: (e) => {
					setIsLoaded(true);
					const img = e.currentTarget;
					if (onMeasured && img.naturalWidth > 0 && img.naturalHeight > 0) onMeasured(img.naturalWidth, img.naturalHeight);
				},
				onError: () => {
					setHasError(true);
					setIsLoaded(true);
				},
				className: cn("relative z-10 transition-opacity duration-300", isLoaded ? "opacity-100" : "opacity-0", fit === "contain" ? "w-full h-full object-contain max-h-full" : "w-full h-full object-cover", imgClassName)
			})
		]
	});
}
var currentlyPlaying = null;
function claimPlayback(video) {
	if (currentlyPlaying && currentlyPlaying !== video) currentlyPlaying.pause();
	currentlyPlaying = video;
}
function releasePlayback(video) {
	if (currentlyPlaying === video) currentlyPlaying = null;
}
function ResponsiveVideo({ src, posterUrl, blurDataUrl, aspectRatio, autoPlay = true, loop = true, muted: initialMuted = true, className, videoClassName, onDoubleTap, playThreshold = .6, preloadRootMargin = "200% 0px", onMeasured }) {
	const containerRef = (0, import_react.useRef)(null);
	const videoRef = (0, import_react.useRef)(null);
	const [isPlaying, setIsPlaying] = (0, import_react.useState)(false);
	const [isMuted, setIsMuted] = (0, import_react.useState)(initialMuted);
	const [isLoading, setIsLoading] = (0, import_react.useState)(true);
	const [hasError, setHasError] = (0, import_react.useState)(false);
	const [nearViewport, setNearViewport] = (0, import_react.useState)(false);
	const [visibleRatio, setVisibleRatio] = (0, import_react.useState)(0);
	const lastTap = (0, import_react.useRef)(0);
	const reducedMotion = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
	const dataSaver = (typeof navigator !== "undefined" ? navigator.connection : void 0)?.saveData === true;
	const effectiveAutoPlay = autoPlay && !reducedMotion && !dataSaver;
	(0, import_react.useEffect)(() => {
		const el = containerRef.current;
		if (!el) return;
		const observer = new IntersectionObserver((entries) => {
			for (const entry of entries) setNearViewport(entry.isIntersecting);
		}, { rootMargin: preloadRootMargin });
		observer.observe(el);
		return () => observer.disconnect();
	}, [preloadRootMargin]);
	(0, import_react.useEffect)(() => {
		const el = containerRef.current;
		if (!el) return;
		const observer = new IntersectionObserver((entries) => {
			for (const entry of entries) setVisibleRatio(entry.intersectionRatio);
		}, { threshold: [
			0,
			.25,
			playThreshold,
			.75,
			1
		] });
		observer.observe(el);
		return () => observer.disconnect();
	}, [playThreshold]);
	(0, import_react.useEffect)(() => {
		const video = videoRef.current;
		if (!video || !src || !nearViewport) return;
		if (effectiveAutoPlay && visibleRatio >= playThreshold && !hasError) {
			claimPlayback(video);
			video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
		} else {
			video.pause();
			setIsPlaying(false);
			releasePlayback(video);
		}
	}, [
		visibleRatio,
		nearViewport,
		effectiveAutoPlay,
		src,
		hasError,
		playThreshold
	]);
	(0, import_react.useEffect)(() => {
		const video = videoRef.current;
		return () => {
			if (video) releasePlayback(video);
		};
	}, []);
	const handleContainerTap = () => {
		const now = Date.now();
		if (now - lastTap.current < 300 && onDoubleTap) onDoubleTap();
		else {
			const video = videoRef.current;
			if (video) {
				if (isPlaying) {
					video.pause();
					setIsPlaying(false);
				} else {
					claimPlayback(video);
					video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
				}
			}
		}
		lastTap.current = now;
	};
	const retry = () => {
		setHasError(false);
		setIsLoading(true);
		const video = videoRef.current;
		if (video) {
			video.load();
			video.play().catch(() => {});
		}
	};
	const optimizedSrc = nearViewport ? cdnUrl(src, {
		width: 1280,
		extra: ["vc_auto"]
	}) ?? src : void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: containerRef,
		role: "button",
		tabIndex: 0,
		onClick: handleContainerTap,
		onKeyDown: (e) => e.key === "Enter" && handleContainerTap(),
		"aria-label": "Video player — tap to play or pause",
		className: cn("relative overflow-hidden bg-black select-none flex items-center justify-center group", className),
		style: aspectRatio ? { aspectRatio: `${aspectRatio}` } : void 0,
		children: [
			(posterUrl || blurDataUrl) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 size-full bg-cover bg-center filter blur-2xl opacity-40 scale-125",
				style: { backgroundImage: `url(${posterUrl || blurDataUrl})` },
				"aria-hidden": "true"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
				ref: videoRef,
				src: optimizedSrc,
				poster: posterUrl,
				loop,
				muted: isMuted,
				playsInline: true,
				preload: visibleRatio > 0 ? "auto" : "metadata",
				"aria-label": "Video",
				onWaiting: () => setIsLoading(true),
				onCanPlay: () => setIsLoading(false),
				onLoadedMetadata: (e) => {
					setIsLoading(false);
					if (onMeasured && e.currentTarget.videoWidth > 0 && e.currentTarget.videoHeight > 0) onMeasured(e.currentTarget.videoWidth, e.currentTarget.videoHeight);
				},
				onPlaying: () => {
					setIsLoading(false);
					setIsPlaying(true);
				},
				onPause: () => setIsPlaying(false),
				onError: () => {
					if (nearViewport) {
						setHasError(true);
						setIsLoading(false);
					}
				},
				className: cn("relative z-10 size-full object-contain", videoClassName)
			}),
			isLoading && !hasError && nearViewport && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 z-20 grid place-items-center bg-black/20 backdrop-blur-xs",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-8 animate-spin text-white/80" })
			}),
			hasError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 z-20 grid place-items-center bg-black/50",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: (e) => {
						e.stopPropagation();
						retry();
					},
					className: "press flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-black",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" }), " Couldn't play — retry"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: (e) => {
					e.stopPropagation();
					setIsMuted((m) => !m);
				},
				"aria-label": isMuted ? "Unmute video" : "Mute video",
				className: "press absolute top-3 right-3 z-30 grid size-8 place-items-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80",
				children: isMuted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" })
			}),
			!isPlaying && !isLoading && !hasError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-0 z-20 grid place-items-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid size-12 place-items-center rounded-full bg-black/60 text-white backdrop-blur-md",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-6 fill-current ml-0.5" })
				})
			})
		]
	});
}
/**
* B1/B2 — best-fit media stage.
*
* The container height is the image's OWN height at container width, clamped
* to a sensible range: aspect ratio clamped to [4:5 portrait … 1.91:1
* landscape] and max height ≈ min(80dvh, 720px). Nothing important is ever
* cropped — when the ratio or the height clamp kicks in, the media renders
* object-contain over a blurred backdrop of itself. Space is reserved via
* aspect-ratio BEFORE load (zero layout shift), with a lazy natural-size
* fallback for legacy posts that never persisted their geometry.
*/
var RATIO_MIN = 4 / 5;
var RATIO_MAX = 1.91;
var DEFAULT_RATIO = 4 / 3;
function clampRatio(r) {
	if (!r || !Number.isFinite(r) || r <= 0) return void 0;
	return Math.min(RATIO_MAX, Math.max(RATIO_MIN, r));
}
function PostMediaCarousel({ mediaUrlString, thumbnailUrl, blurDataUrl, aspectRatio, mediaItems, kind, body, liked, onDoubleTapLike, priority = false }) {
	const [activeIdx, setActiveIdx] = (0, import_react.useState)(0);
	const [burst, setBurst] = (0, import_react.useState)(false);
	const lastTap = (0, import_react.useRef)(0);
	const touchStartX = (0, import_react.useRef)(null);
	const touchEndX = (0, import_react.useRef)(null);
	const [measuredRatio, setMeasuredRatio] = (0, import_react.useState)(void 0);
	const handleMeasured = (w, h) => {
		if (h > 0 && measuredRatio === void 0) setMeasuredRatio(w / h);
	};
	if (!mediaUrlString || kind === "text") return null;
	const rawUrls = mediaUrlString.split(",").map((s) => s.trim()).filter(Boolean);
	if (rawUrls.length === 0) return null;
	const activeRawUrl = rawUrls[activeIdx] ?? rawUrls[0];
	const activeFullUrl = mediaUrl(activeRawUrl);
	const firstItem = mediaItems?.find((m) => m.url === rawUrls[0]);
	const firstItemRatio = firstItem?.aspectRatio ?? (firstItem?.width && firstItem?.height ? firstItem.width / firstItem.height : void 0);
	const stageRatio = clampRatio(measuredRatio ?? aspectRatio ?? firstItemRatio) ?? DEFAULT_RATIO;
	const intrinsicRatio = measuredRatio ?? aspectRatio ?? mediaItems?.find((m) => m.url === activeRawUrl)?.aspectRatio ?? stageRatio ?? DEFAULT_RATIO;
	const needsContain = intrinsicRatio < RATIO_MIN || intrinsicRatio > RATIO_MAX;
	const handleMediaTap = () => {
		const now = Date.now();
		if (now - lastTap.current < 300) {
			if (onDoubleTapLike) onDoubleTapLike();
			setBurst(true);
			setTimeout(() => setBurst(false), 700);
		}
		lastTap.current = now;
	};
	const handleTouchStart = (e) => {
		touchStartX.current = e.targetTouches[0]?.clientX ?? 0;
		touchEndX.current = null;
	};
	const handleTouchMove = (e) => {
		touchEndX.current = e.targetTouches[0]?.clientX ?? 0;
	};
	const handleTouchEnd = () => {
		if (touchStartX.current === null || touchEndX.current === null) return;
		const diff = touchStartX.current - touchEndX.current;
		if (diff > 40 && activeIdx < rawUrls.length - 1) setActiveIdx((prev) => prev + 1);
		else if (diff < -40 && activeIdx > 0) setActiveIdx((prev) => prev - 1);
		touchStartX.current = null;
		touchEndX.current = null;
	};
	const isVideo = (url) => {
		return kind === "video" || kind === "reel" || /\.(mp4|mov|webm|m4v)$/i.test(url);
	};
	const currentIsVideo = activeFullUrl ? isVideo(activeFullUrl) : false;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "button",
		tabIndex: 0,
		onClick: handleMediaTap,
		onTouchStart: handleTouchStart,
		onTouchMove: handleTouchMove,
		onTouchEnd: handleTouchEnd,
		onKeyDown: (e) => e.key === "Enter" && onDoubleTapLike && onDoubleTapLike(),
		"aria-label": "Double tap to like or swipe to view next image",
		className: "relative mx-4 mb-3 w-[calc(100%-2rem)] overflow-hidden rounded-2xl bg-black select-none group flex items-center justify-center",
		style: {
			aspectRatio: `${stageRatio ?? DEFAULT_RATIO}`,
			maxHeight: "min(80dvh, 720px)"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, {
				mode: "wait",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
					initial: {
						opacity: 0,
						x: 20
					},
					animate: {
						opacity: 1,
						x: 0
					},
					exit: {
						opacity: 0,
						x: -20
					},
					transition: { duration: .2 },
					className: "relative h-full w-full overflow-hidden",
					children: currentIsVideo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveVideo, {
						src: activeFullUrl ?? "",
						posterUrl: mediaUrl(thumbnailUrl),
						blurDataUrl,
						onDoubleTap: onDoubleTapLike,
						onMeasured: handleMeasured,
						className: "h-full w-full",
						videoClassName: cn(needsContain ? "object-contain" : "object-cover")
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveImage, {
						src: activeFullUrl ?? "",
						alt: body || "Post media",
						blurDataUrl,
						onMeasured: handleMeasured,
						loading: priority ? "eager" : "lazy",
						fetchPriority: priority ? "high" : void 0,
						fit: needsContain ? "contain" : "cover",
						className: "h-full w-full"
					})
				}, activeRawUrl)
			}),
			rawUrls.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute top-3 right-3 z-10 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md",
					children: [
						activeIdx + 1,
						" / ",
						rawUrls.length
					]
				}),
				activeIdx > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "Previous image",
					onClick: (e) => {
						e.stopPropagation();
						setActiveIdx((prev) => prev - 1);
					},
					className: "press absolute left-2 top-1/2 -translate-y-1/2 z-10 grid size-8 place-items-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-5" })
				}),
				activeIdx < rawUrls.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "Next image",
					onClick: (e) => {
						e.stopPropagation();
						setActiveIdx((prev) => prev + 1);
					},
					className: "press absolute right-2 top-1/2 -translate-y-1/2 z-10 grid size-8 place-items-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-5" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5 rounded-full bg-black/40 px-2 py-1 backdrop-blur-sm",
					children: rawUrls.map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": `Go to slide ${i + 1}`,
						onClick: (e) => {
							e.stopPropagation();
							setActiveIdx(i);
						},
						className: cn("size-1.5 rounded-full transition-all press", i === activeIdx ? "bg-white w-3" : "bg-white/50 hover:bg-white/80")
					}, i))
				})
			] }),
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
			}) })
		]
	});
}
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
		live: author.isLive,
		followers: 0,
		following: 0,
		posts: 0
	};
}
function PostCard({ post, index = 0 }) {
	const [reportOpen, setReportOpen] = (0, import_react.useState)(false);
	const [appealOpen, setAppealOpen] = (0, import_react.useState)(false);
	const retryModeration = useRetryModeration();
	const { user } = useAuth();
	const isMobile = useIsMobile();
	const submitNotInterested = useSubmitNotInterested();
	const [commentsOpen, setCommentsOpen] = (0, import_react.useState)(false);
	const [inlineCommentsOpen, setInlineCommentsOpen] = (0, import_react.useState)(false);
	const [shareOpen, setShareOpen] = (0, import_react.useState)(false);
	const [isExpanded, setIsExpanded] = (0, import_react.useState)(false);
	const toggleLike = useToggleLike();
	const toggleBookmark = useToggleBookmark();
	const deletePost = useDeletePost();
	const followUser = useFollowUser();
	const { data: followingSet } = useFollowingSet();
	const isOwnPost = user?.username === post.author.username;
	const moderationState = isOwnPost && post.moderation && post.moderation.status !== "approved" ? post.moderation : void 0;
	const following = followingSet?.has(post.author.username) ?? post.followingAuthor;
	const handleLike = (0, import_react.useCallback)(() => {
		logRecommendationEvent({
			event: post.liked ? "post_unlike" : "post_like",
			targetKind: post.kind === "reel" ? "reel" : "post",
			targetId: post._id,
			creatorId: String(post.author._id ?? post.author),
			tags: post.tags
		});
		toggleLike.mutate(post._id);
	}, [
		toggleLike,
		post._id,
		post.liked,
		post.kind,
		post.author,
		post.tags
	]);
	const handleCommentClick = () => {
		if (isMobile) setCommentsOpen(true);
		else setInlineCommentsOpen((prev) => !prev);
	};
	const maxCharLimit = 160;
	const isLongCaption = post.body && post.body.length > maxCharLimit;
	const displayCaption = isLongCaption && !isExpanded ? `${post.body.slice(0, maxCharLimit)}…` : post.body;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.article, {
		initial: {
			opacity: 0,
			y: 14
		},
		whileInView: {
			opacity: 1,
			y: 0
		},
		viewport: {
			once: true,
			margin: "-40px"
		},
		transition: {
			duration: .4,
			ease: [
				.22,
				1,
				.36,
				1
			],
			delay: Math.min(index, 4) * .04
		},
		className: "surface-card mb-4 overflow-hidden border border-border bg-card shadow-soft",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center gap-3 p-4 pb-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/profile/$username",
						params: { username: post.author.username },
						className: "press",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GAvatar, {
							user: toDisplayUser(post.author),
							size: "md",
							ring: post.author.isLive ? "live" : "none"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex min-w-0 items-center gap-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/profile/$username",
									params: { username: post.author.username },
									className: "truncate text-[15px] font-bold hover:underline",
									children: post.author.name
								}),
								post.author.verified && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VerifiedBadge, {}),
								post.author.isCreator && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "shrink-0 rounded-md bg-primary-soft px-1.5 py-px text-[10px] font-bold tracking-wide text-primary uppercase",
									children: "Creator"
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "truncate",
									children: ["@", post.author.username]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"aria-hidden": true,
									children: "·"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "shrink-0",
									children: timeAgo(post.createdAt)
								}),
								post.location && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"aria-hidden": true,
										children: "·"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3 shrink-0 text-success" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "truncate",
										children: post.location
									})
								] })
							]
						})]
					}),
					!isOwnPost && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: following ? "soft" : "default",
						size: "sm",
						onClick: () => followUser.mutate({
							username: post.author.username,
							follow: !following
						}, { onError: (err) => toast.error(err.message || "Couldn't update follow status") }),
						children: following ? "Following" : "Follow"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon-sm",
							"aria-label": "Post options",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "size-5" })
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
						align: "end",
						className: "w-52",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
								onClick: () => toggleBookmark.mutate(post._id),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, { className: "size-4" }), post.bookmarked ? "Remove from saved" : "Save post"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
								onClick: () => setShareOpen(true),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-4" }), "Share post"]
							}),
							!isOwnPost && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
								onClick: () => {
									submitNotInterested.mutate({
										contentId: post._id,
										reason: "not_interested"
									}, { onSuccess: () => toast.success("Recorded. We will show less content like this.") });
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-4 text-muted-foreground" }), "Not interested"]
							}),
							isOwnPost ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
									className: "text-danger focus:bg-danger/10 focus:text-danger",
									onClick: () => {
										deletePost.mutate(post._id);
										toast.success("Post deleted");
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }), "Delete post"]
								}),
								moderationState?.status === "rejected" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
									onClick: () => setAppealOpen(true),
									children: "Appeal this decision"
								})
							] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
								className: "text-danger focus:bg-danger/10 focus:text-danger",
								onClick: () => setReportOpen(true),
								children: "Report"
							})] })
						]
					})] })
				]
			}),
			moderationState && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-4 pt-1 pb-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModerationStatusBadge, {
					status: moderationState.status,
					userMessage: moderationState.userMessage,
					onRetry: moderationState.status === "failed" ? () => retryModeration.mutate(post._id) : void 0,
					onAppeal: moderationState.status === "rejected" ? () => setAppealOpen(true) : void 0
				})
			}),
			post.body && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-4 pb-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-[15px] leading-relaxed text-foreground/90 whitespace-pre-wrap",
					children: [displayCaption, isLongCaption && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setIsExpanded((prev) => !prev),
						className: "ml-1 text-xs font-bold text-primary hover:underline",
						children: isExpanded ? "Show less" : "more"
					})]
				}), post.tags.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1.5 flex flex-wrap gap-x-2 text-[13px] font-semibold text-primary",
					children: post.tags.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/tag/$tag",
						params: { tag: t },
						className: "hover:underline",
						children: ["#", t]
					}, t))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PostMediaCarousel, {
				mediaUrlString: post.mediaUrl,
				thumbnailUrl: post.thumbnailUrl,
				blurDataUrl: post.blurDataUrl,
				aspectRatio: post.aspectRatio,
				mediaItems: post.media,
				kind: post.kind,
				body: post.body,
				liked: post.liked,
				onDoubleTapLike: handleLike,
				priority: index < 2
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between border-t border-border px-3 py-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: handleLike,
							"aria-label": "Like post",
							"aria-pressed": post.liked,
							className: cn("press flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors", post.liked ? "text-danger bg-danger/10" : "text-muted-foreground hover:bg-muted"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
								whileTap: { scale: 1.4 },
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: cn("size-4", post.liked && "fill-current") })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "tabular-nums",
								children: formatCount(post.likesCount)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: handleCommentClick,
							"aria-label": "Comment",
							className: cn("press flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors", inlineCommentsOpen ? "text-primary bg-primary-soft" : "text-muted-foreground hover:bg-muted hover:text-foreground"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "tabular-nums",
								children: formatCount(post.commentsCount)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setShareOpen(true),
							"aria-label": "Share",
							className: "press flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-4" }), post.sharesCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "tabular-nums",
								children: formatCount(post.sharesCount)
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						toggleBookmark.mutate(post._id);
						toast.success(post.bookmarked ? "Removed from bookmarks" : "Saved to bookmarks");
					},
					"aria-label": "Save post",
					"aria-pressed": post.bookmarked,
					className: cn("press flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors", post.bookmarked ? "text-primary bg-primary-soft font-bold" : "text-muted-foreground hover:bg-muted"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, { className: cn("size-4", post.bookmarked && "fill-current") })
				})]
			}),
			inlineCommentsOpen && !isMobile && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InlineComments, { post }),
			isMobile && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentSheet, {
				post,
				open: commentsOpen,
				onOpenChange: setCommentsOpen
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShareSheet, {
				open: shareOpen,
				onOpenChange: setShareOpen,
				title: `Post by @${post.author.username} on Gihanga Updates`,
				text: post.body,
				url: `${typeof window !== "undefined" ? window.location.origin : ""}/post/${post._id}`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportDialog, {
				open: reportOpen,
				onOpenChange: setReportOpen,
				targetType: "post",
				targetId: post._id
			}),
			moderationState?.record && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppealDialog, {
				open: appealOpen,
				onOpenChange: setAppealOpen,
				recordId: moderationState.record
			})
		]
	});
}
//#endregion
export { PostCard as t };
