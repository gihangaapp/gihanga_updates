import { o as __toESM } from "../_runtime.mjs";
import { r as cn, t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { S as useNavigate, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { Bn as ChevronRight, E as TrendingUp, Jn as CalendarClock, O as Trash2, Pt as MapPin, Vn as ChevronLeft, a as X, d as Video, g as UserPlus, hn as Ellipsis, ir as ArrowUpRight, jt as MessageCircle, l as VolumeX, lt as Radio, pn as ExternalLink, qt as Image, tt as Send, u as Volume2, ut as Plus, z as Sparkles, zt as LoaderCircle } from "../_libs/lucide-react.mjs";
import { c as mediaUrlWithAuth, n as api, s as mediaUrl } from "./api-client-C-W0Sa9i.mjs";
import { r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { l as useAuth } from "./auth-context-CsN3soau.mjs";
import { $ as useSessionUser, A as openCreate, B as useFeed, D as isRecentPostReady, J as useMarkStoryViewed, N as timeAgo, Pt as useLiveStreams, R as useDeleteStory, T as consumeRecentPostHomeVisit, Z as useReplyToStory, c as DropdownMenu, d as DropdownMenuSeparator, f as DropdownMenuTrigger, g as RECENT_POST_PIN_EVENT, h as LandingPage, j as readRecentPublishedPost, l as DropdownMenuContent, lt as useTrending, nt as useStoryReplies, p as GAvatar, t as AppShell, tt as useStories, u as DropdownMenuItem, z as useExplore } from "./router-BDN0UH9I.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { t as AdBadge } from "./AdBadge-CcJQZFFu.mjs";
import { T as useStoryAds, d as useFeedAds, g as useRecordView, h as useRecordImpression, m as useRecordClick, r as useAdFeedback } from "./use-ads-Bg4PdVDV.mjs";
import { r as ShareSheet } from "./CommentSheet-Cn0pujdi.mjs";
import { t as PostCard } from "./PostCard-C_dGpJWB.mjs";
import { t as FeedAdCard } from "./FeedAdCard-DRWvBXs3.mjs";
import { t as PostSkeleton } from "./PostSkeleton-BQJvHS--.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-B-qSvPMw.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function toDisplayUser$1(user) {
	return {
		id: user._id,
		name: user.name,
		username: user.username,
		bio: "",
		avatarHue: user.avatarHue,
		avatarUrl: user.avatarUrl,
		verified: user.verified,
		creator: user.isCreator,
		live: false,
		followers: 0,
		following: 0,
		posts: 0
	};
}
/**
* Comment thread for a story. Comments are stored through the story reply
* endpoint (story_reply records tied to the story), so the sheet lists the
* full thread and posts new comments via the same endpoint.
*/
function StoryComments({ storyId, authorUsername, onClose }) {
	const { user: me } = useSessionUser();
	const { data, isLoading } = useStoryReplies(storyId);
	const replyToStory = useReplyToStory();
	const [text, setText] = (0, import_react.useState)("");
	const [sending, setSending] = (0, import_react.useState)(false);
	const [pendingReply, setPendingReply] = (0, import_react.useState)(null);
	const [viewportHeight, setViewportHeight] = (0, import_react.useState)(() => typeof window !== "undefined" ? window.visualViewport?.height ?? window.innerHeight : 640);
	const [viewportOffsetTop, setViewportOffsetTop] = (0, import_react.useState)(0);
	const [isMobile, setIsMobile] = (0, import_react.useState)(() => typeof window !== "undefined" && window.innerWidth < 640);
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined") return;
		const viewport = window.visualViewport;
		const updateViewport = () => {
			setViewportHeight(viewport?.height ?? window.innerHeight);
			setViewportOffsetTop(viewport?.offsetTop ?? 0);
			setIsMobile(window.innerWidth < 640);
		};
		updateViewport();
		viewport?.addEventListener("resize", updateViewport);
		viewport?.addEventListener("scroll", updateViewport);
		window.addEventListener("resize", updateViewport);
		return () => {
			viewport?.removeEventListener("resize", updateViewport);
			viewport?.removeEventListener("scroll", updateViewport);
			window.removeEventListener("resize", updateViewport);
		};
	}, []);
	const replies = data?.replies ?? [];
	const handleSend = async () => {
		const msg = text.trim();
		if (!msg || sending) return;
		setSending(true);
		setText("");
		setPendingReply(msg);
		try {
			await replyToStory.mutateAsync({
				storyId,
				message: msg
			});
			setPendingReply(null);
		} catch (err) {
			setPendingReply(null);
			setText(msg);
			toast.error(err?.message || "Failed to send comment");
		} finally {
			setSending(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-x-0 top-0 z-[80] flex items-end justify-center sm:items-center",
		style: {
			top: `${viewportOffsetTop}px`,
			height: `${viewportHeight}px`
		},
		role: "dialog",
		"aria-modal": "true",
		"aria-label": `Comments on @${authorUsername}'s story`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			"aria-label": "Close comments",
			onClick: onClose,
			className: "absolute inset-0 bg-black/60 backdrop-blur-sm"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative z-10 flex w-full flex-col overflow-hidden rounded-t-3xl border border-border bg-card text-card-foreground shadow-float sm:max-w-md sm:rounded-3xl",
			style: {
				height: isMobile ? `${Math.max(220, Math.min(viewportHeight * .78, 680))}px` : "min(60vh, 640px)",
				maxHeight: `${viewportHeight}px`
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex shrink-0 items-center justify-between border-b border-border px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-sm font-extrabold",
						children: "Comments"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						className: "press grid size-8 place-items-center rounded-full bg-muted text-foreground hover:bg-muted/70",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-3 no-scrollbar",
					children: isLoading && !pendingReply ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-full items-center justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-6 animate-spin text-muted-foreground" })
					}) : replies.length === 0 && !pendingReply ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex h-full flex-col items-center justify-center gap-2 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold",
							children: "No comments yet"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								"Be the first to comment on @",
								authorUsername,
								"'s story."
							]
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [pendingReply && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-2.5 opacity-85",
						"aria-live": "polite",
						children: [me ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GAvatar, {
							user: me,
							size: "xs"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-6 shrink-0 rounded-full bg-muted" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs leading-snug",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-bold",
										children: me?.username ?? "you"
									}),
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-foreground/90",
										children: pendingReply
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3 animate-spin" }), " Sending…"]
							})]
						})]
					}), replies.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-2.5",
						children: [r.user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GAvatar, {
							user: toDisplayUser$1(r.user),
							size: "xs"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-6 shrink-0 rounded-full bg-muted" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs leading-snug",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-bold",
										children: r.user?.username ?? "someone"
									}),
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-foreground/90",
										children: r.text.replace(/^replied to your story:\s*/i, "")
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-0.5 text-[10px] text-muted-foreground",
								children: timeAgo(r.createdAt)
							})]
						})]
					}, r._id))] })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex shrink-0 items-center gap-2 border-t border-border bg-card p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: text,
						onChange: (e) => setText(e.target.value),
						onKeyDown: (e) => {
							if (e.key === "Enter" && !e.nativeEvent.isComposing) {
								e.preventDefault();
								handleSend();
							}
						},
						maxLength: 500,
						placeholder: me ? `Comment as ${me.username}…` : "Add a comment…",
						className: "h-10 min-w-0 flex-1 rounded-full"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "icon-sm",
						variant: "brand",
						onClick: () => void handleSend(),
						disabled: !text.trim() || sending,
						className: "shrink-0 rounded-full",
						children: sending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" })
					})]
				})
			]
		})]
	});
}
var IMAGE_AD_DURATION_MS = 6e3;
function StoryAdOverlay({ ad, onClose }) {
	const recordImpression = useRecordImpression();
	const recordClick = useRecordClick();
	const recordView = useRecordView();
	const feedback = useAdFeedback();
	const impressionMutate = (0, import_react.useRef)(recordImpression.mutate);
	const viewMutate = (0, import_react.useRef)(recordView.mutate);
	impressionMutate.current = recordImpression.mutate;
	viewMutate.current = recordView.mutate;
	const [mediaReady, setMediaReady] = (0, import_react.useState)(false);
	const [progress, setProgress] = (0, import_react.useState)(0);
	const [pageVisible, setPageVisible] = (0, import_react.useState)(() => typeof document === "undefined" || document.visibilityState !== "hidden");
	const [hidden, setHidden] = (0, import_react.useState)(false);
	const [mediaFailed, setMediaFailed] = (0, import_react.useState)(false);
	const [avatarFailed, setAvatarFailed] = (0, import_react.useState)(false);
	const videoRef = (0, import_react.useRef)(null);
	const videoWasPlayingWhenHidden = (0, import_react.useRef)(false);
	const impressionSent = (0, import_react.useRef)(false);
	const viewSent = (0, import_react.useRef)(false);
	const elapsedMs = (0, import_react.useRef)(0);
	const lastTick = (0, import_react.useRef)(null);
	const creator = typeof ad.creator === "object" ? ad.creator : null;
	const creatorName = creator?.name || "Sponsored Partner";
	const creatorUsername = creator?.username || "sponsored";
	const creatorAvatar = mediaUrlWithAuth(mediaUrl(creator?.avatarUrl) || creator?.avatarUrl);
	const mediaPath = ad.mediaUrl || (ad.mediaKey ? `/api/v1/media/file/${ad.mediaKey}` : void 0);
	const resolvedMedia = mediaUrlWithAuth(mediaUrl(mediaPath) || mediaPath);
	const resolvedThumbnail = mediaUrlWithAuth(mediaUrl(ad.thumbnailUrl) || ad.thumbnailUrl);
	(0, import_react.useEffect)(() => {
		setMediaFailed(false);
		setAvatarFailed(false);
	}, [
		ad._id,
		resolvedMedia,
		creatorAvatar
	]);
	const isVideo = Boolean(ad.mediaType === "video" || ad.adType.includes("video"));
	(0, import_react.useEffect)(() => {
		const updateVisibility = () => {
			const visible = document.visibilityState !== "hidden";
			setPageVisible(visible);
			const video = videoRef.current;
			if (!visible && video && !video.ended && (!video.paused || video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA)) {
				videoWasPlayingWhenHidden.current = true;
				if (!video.paused) video.pause();
			} else if (visible && videoWasPlayingWhenHidden.current && video) {
				videoWasPlayingWhenHidden.current = false;
				video.play().catch(() => {});
			}
		};
		document.addEventListener("visibilitychange", updateVisibility);
		updateVisibility();
		return () => document.removeEventListener("visibilitychange", updateVisibility);
	}, []);
	const recordImpressionOnce = (0, import_react.useCallback)(() => {
		if (impressionSent.current || !ad._id) return;
		impressionSent.current = true;
		impressionMutate.current(ad._id);
	}, [ad._id]);
	(0, import_react.useEffect)(() => {
		if (mediaReady && pageVisible) recordImpressionOnce();
	}, [
		mediaReady,
		pageVisible,
		recordImpressionOnce
	]);
	const finishAd = (0, import_react.useCallback)(() => {
		if (!viewSent.current && impressionSent.current && ad._id) {
			viewSent.current = true;
			const videoSeconds = videoRef.current?.currentTime;
			const seconds = Math.max(1, Math.floor(Number.isFinite(videoSeconds) ? videoSeconds ?? 0 : elapsedMs.current / 1e3));
			viewMutate.current({
				adId: ad._id,
				seconds
			});
		}
		onClose?.();
	}, [ad._id, onClose]);
	(0, import_react.useEffect)(() => {
		if (!mediaReady || isVideo || !pageVisible) {
			lastTick.current = null;
			return;
		}
		const timer = window.setInterval(() => {
			const now = performance.now();
			if (lastTick.current !== null) elapsedMs.current += Math.max(0, now - lastTick.current);
			lastTick.current = now;
			const next = Math.min(1, elapsedMs.current / IMAGE_AD_DURATION_MS);
			setProgress(next);
			if (next >= 1) finishAd();
		}, 100);
		return () => window.clearInterval(timer);
	}, [
		mediaReady,
		isVideo,
		pageVisible,
		finishAd
	]);
	const handleImageLoad = async (event) => {
		const image = event.currentTarget;
		if (!image.naturalWidth) return;
		try {
			await image.decode();
		} catch {}
		if (!image.isConnected) return;
		setMediaReady(true);
	};
	const handleVideoPlaying = () => {
		setMediaReady(true);
	};
	const handleCtaClick = () => {
		if (ad._id) recordClick.mutate(ad._id);
		const destination = ad.ctaUrl || `${window.location.origin}/profile/${encodeURIComponent(creatorUsername)}`;
		window.open(destination, "_blank", "noopener,noreferrer");
	};
	const handleHide = () => {
		feedback.mutate({
			id: ad._id,
			action: "hide"
		}, {
			onSuccess: () => {
				setHidden(true);
				toast.success("This ad will be hidden from your future ad delivery.");
				onClose?.();
			},
			onError: (error) => toast.error(error.message || "Could not hide this advertisement")
		});
	};
	const handleReport = () => {
		feedback.mutate({
			id: ad._id,
			action: "report",
			reason: "Reported from Decisions"
		}, {
			onSuccess: () => toast.success("Advertisement reported to the moderation team."),
			onError: (error) => toast.error(error.message || "Could not report this advertisement")
		});
	};
	if (hidden) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-full w-full overflow-hidden bg-slate-950 text-white",
		children: [
			resolvedMedia && !mediaFailed ? isVideo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
				ref: videoRef,
				src: resolvedMedia,
				poster: resolvedThumbnail,
				autoPlay: true,
				muted: true,
				playsInline: true,
				preload: "metadata",
				onPlaying: handleVideoPlaying,
				onError: () => setMediaFailed(true),
				onTimeUpdate: (event) => {
					const video = event.currentTarget;
					if (pageVisible && !video.paused && Number.isFinite(video.duration) && video.duration > 0) setProgress(video.currentTime / video.duration);
				},
				onEnded: finishAd,
				className: "h-full w-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: resolvedMedia,
				alt: ad.title,
				decoding: "async",
				onLoad: handleImageLoad,
				onError: () => setMediaFailed(true),
				className: "h-full w-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid h-full w-full place-items-center bg-gradient-to-br from-indigo-950 via-slate-900 to-black p-6 text-center text-sm font-bold",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: ad.title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-normal text-white/70",
						children: mediaFailed ? "Advertisement media is temporarily unavailable" : "Sponsored advertisement"
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-x-3 top-3 z-30 h-[3px] overflow-hidden rounded-full bg-white/35",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-full origin-left rounded-full bg-white transition-none",
					style: { width: `${Math.max(0, Math.min(1, progress)) * 100}%` }
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-4 pt-7",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 items-center gap-2.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-indigo-600 text-xs font-bold text-white shadow-md",
								children: creatorAvatar && !avatarFailed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: creatorAvatar,
									alt: creatorName,
									onError: () => setAvatarFailed(true),
									className: "size-full object-cover"
								}) : creatorName[0]?.toUpperCase()
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-xs font-bold leading-tight",
									children: creatorName
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "truncate text-[10px] text-white/70",
									children: ["@", creatorUsername]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdBadge, { variant: "glass" })
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex shrink-0 items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": "Advertisement options",
								className: "grid size-8 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "size-4" })
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
							align: "end",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
									onClick: () => toast.info("This sponsored placement is part of an approved campaign that matches the current Decisions placement and its audience settings."),
									children: "Why am I seeing this ad?"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
									onClick: handleHide,
									children: "Hide this ad"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
									onClick: handleReport,
									children: "Report ad"
								})
							]
						})] }), onClose && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: finishAd,
							"aria-label": "Skip advertisement",
							className: "grid size-8 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-x-0 bottom-0 z-20 space-y-3 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "line-clamp-2 text-base font-extrabold",
						children: ad.title
					}),
					ad.caption && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "line-clamp-3 text-xs leading-relaxed text-white/80",
						children: ad.caption
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: handleCtaClick,
						className: "press flex w-full items-center justify-between rounded-2xl bg-primary px-4 py-3 text-xs font-bold text-primary-foreground shadow-xl transition-all hover:bg-primary/90",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: ad.ctaText || "Learn More" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-4" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-center text-[10px] text-white/65",
						children: "Sponsored · Swipe or tap X to continue"
					})
				]
			})
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
function StoryViewer({ groups, ads = [], startIndex, onClose }) {
	const { user } = useAuth();
	const [index, setIndex] = (0, import_react.useState)(startIndex);
	const [step, setStep] = (0, import_react.useState)(0);
	const [showingAdIndex, setShowingAdIndex] = (0, import_react.useState)(null);
	const storyGroupsSinceAd = (0, import_react.useRef)(0);
	const nextStoryAdIndex = (0, import_react.useRef)(0);
	const progressRef = (0, import_react.useRef)(0);
	const progressFillRef = (0, import_react.useRef)(null);
	const [readyItemId, setReadyItemId] = (0, import_react.useState)(null);
	const [videoPlayingItemId, setVideoPlayingItemId] = (0, import_react.useState)(null);
	const [videoFailedItemId, setVideoFailedItemId] = (0, import_react.useState)(null);
	const [pageVisible, setPageVisible] = (0, import_react.useState)(() => typeof document === "undefined" || document.visibilityState !== "hidden");
	const activeItemIdRef = (0, import_react.useRef)(null);
	const [paused, setPaused] = (0, import_react.useState)(false);
	const [muted, setMuted] = (0, import_react.useState)(false);
	const [replyText, setReplyText] = (0, import_react.useState)("");
	const [shareOpen, setShareOpen] = (0, import_react.useState)(false);
	const [commentsOpen, setCommentsOpen] = (0, import_react.useState)(false);
	const videoRef = (0, import_react.useRef)(null);
	const raf = (0, import_react.useRef)(null);
	const markViewed = useMarkStoryViewed();
	const deleteStory = useDeleteStory();
	const replyToStory = useReplyToStory();
	const handleSendReply = async () => {
		if (!replyText.trim() || !item?._id || !group || replyToStory.isPending) return;
		const msg = replyText.trim();
		setReplyText("");
		try {
			await replyToStory.mutateAsync({
				storyId: item._id,
				message: msg
			});
			toast.success(`Reply sent to @${group.author.username}!`);
		} catch (err) {
			setReplyText(msg);
			toast.error(err.message || "Failed to send reply");
		}
	};
	const touchStartX = (0, import_react.useRef)(null);
	const touchEndX = (0, import_react.useRef)(null);
	const updateProgress = (0, import_react.useCallback)((value) => {
		const nextProgress = Math.max(0, Math.min(1, value));
		progressRef.current = nextProgress;
		progressFillRef.current?.style.setProperty("transform", `scaleX(${nextProgress})`);
	}, []);
	const group = groups[index];
	const item = group?.items[step];
	const itemId = item?._id ?? null;
	activeItemIdRef.current = itemId;
	const count = Math.max(1, group?.items.length ?? 1);
	const duration = item?.mediaType === "video" ? item?.duration ?? 4200 : 8e3;
	const isOwnStory = user?.username === group?.author?.username;
	const resetStoryPlayback = (0, import_react.useCallback)(() => {
		if (raf.current !== null) cancelAnimationFrame(raf.current);
		raf.current = null;
		updateProgress(0);
		setReadyItemId(null);
		setVideoPlayingItemId(null);
		setVideoFailedItemId(null);
	}, [updateProgress]);
	const continueAfterAd = (0, import_react.useCallback)(() => {
		setShowingAdIndex(null);
		resetStoryPlayback();
		setStep(0);
		setIndex((current) => Math.min(current + 1, Math.max(0, groups.length - 1)));
	}, [groups.length, resetStoryPlayback]);
	const shouldShowStoryAd = (0, import_react.useCallback)(() => {
		if (ads.length === 0) return false;
		storyGroupsSinceAd.current += 1;
		if (storyGroupsSinceAd.current < 3) return false;
		storyGroupsSinceAd.current = 0;
		if (nextStoryAdIndex.current >= ads.length) return false;
		setShowingAdIndex(nextStoryAdIndex.current);
		nextStoryAdIndex.current += 1;
		return true;
	}, [ads.length]);
	const next = (0, import_react.useCallback)(() => {
		resetStoryPlayback();
		if (step + 1 < count) {
			setStep(step + 1);
			return;
		}
		if (index + 1 < groups.length) {
			if (shouldShowStoryAd()) return;
			setIndex(index + 1);
			setStep(0);
			return;
		}
		onClose();
	}, [
		step,
		count,
		index,
		groups.length,
		onClose,
		resetStoryPlayback,
		shouldShowStoryAd
	]);
	const prev = (0, import_react.useCallback)(() => {
		if (step > 0) {
			resetStoryPlayback();
			setStep(step - 1);
		} else if (index > 0) {
			resetStoryPlayback();
			setIndex(index - 1);
			setStep(0);
		}
	}, [
		step,
		index,
		resetStoryPlayback
	]);
	const nextGroup = (0, import_react.useCallback)(() => {
		if (index + 1 >= groups.length) {
			onClose();
			return;
		}
		resetStoryPlayback();
		if (shouldShowStoryAd()) return;
		setStep(0);
		setIndex(index + 1);
	}, [
		index,
		groups.length,
		onClose,
		resetStoryPlayback,
		shouldShowStoryAd
	]);
	const prevGroup = (0, import_react.useCallback)(() => {
		if (index === 0) return;
		resetStoryPlayback();
		setStep(0);
		setIndex(index - 1);
	}, [index, resetStoryPlayback]);
	const handleTouchStart = (e) => {
		touchStartX.current = e.targetTouches[0]?.clientX ?? 0;
		touchEndX.current = null;
		setPaused(true);
	};
	const handleTouchMove = (e) => {
		touchEndX.current = e.targetTouches[0]?.clientX ?? 0;
	};
	const handleTouchEnd = () => {
		setPaused(false);
		if (touchStartX.current === null || touchEndX.current === null) return;
		const diff = touchStartX.current - touchEndX.current;
		if (diff > 45) nextGroup();
		else if (diff < -45) prevGroup();
		touchStartX.current = null;
		touchEndX.current = null;
	};
	(0, import_react.useEffect)(() => {
		if (item && !item.viewedByMe) markViewed.mutate(item._id);
	}, [item?._id]);
	(0, import_react.useEffect)(() => {
		const updateVisibility = () => setPageVisible(document.visibilityState !== "hidden");
		document.addEventListener("visibilitychange", updateVisibility);
		updateVisibility();
		return () => document.removeEventListener("visibilitychange", updateVisibility);
	}, []);
	(0, import_react.useEffect)(() => {
		if (itemId && !item?.mediaUrl?.trim()) {
			setReadyItemId(itemId);
			if (item.mediaType === "video") setVideoFailedItemId(itemId);
		}
	}, [
		itemId,
		item?.mediaUrl,
		item?.mediaType
	]);
	(0, import_react.useEffect)(() => {
		if (showingAdIndex !== null || paused || !pageVisible || !itemId || readyItemId !== itemId) return;
		if (item?.mediaType === "video" && videoFailedItemId !== itemId) {
			if (videoPlayingItemId !== itemId) return;
			const video = videoRef.current;
			if (!video) return;
			let cancelled = false;
			const tick = () => {
				if (cancelled) return;
				if (video.paused || video.ended || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
					raf.current = null;
					return;
				}
				if (Number.isFinite(video.duration) && video.duration > 0) updateProgress(video.currentTime / video.duration);
				raf.current = requestAnimationFrame(tick);
			};
			raf.current = requestAnimationFrame(tick);
			return () => {
				cancelled = true;
				if (raf.current !== null) cancelAnimationFrame(raf.current);
				raf.current = null;
			};
		}
		let cancelled = false;
		let elapsed = 0;
		let previousFrame = performance.now();
		const startProgress = progressRef.current;
		const tick = (now) => {
			if (cancelled) return;
			elapsed += Math.max(0, now - previousFrame);
			previousFrame = now;
			const p = Math.min(1, startProgress + elapsed / duration);
			updateProgress(p);
			if (p >= 1) {
				next();
				return;
			}
			raf.current = requestAnimationFrame(tick);
		};
		raf.current = requestAnimationFrame(tick);
		return () => {
			cancelled = true;
			if (raf.current !== null) cancelAnimationFrame(raf.current);
			raf.current = null;
		};
	}, [
		index,
		step,
		showingAdIndex,
		paused,
		pageVisible,
		next,
		duration,
		itemId,
		item?.mediaType,
		readyItemId,
		videoPlayingItemId,
		videoFailedItemId,
		updateProgress
	]);
	(0, import_react.useEffect)(() => {
		if (item?.mediaType !== "video" || !itemId) return;
		const video = videoRef.current;
		if (!video) return;
		let cancelled = false;
		if (showingAdIndex !== null || paused || !pageVisible) {
			video.pause();
			return () => {
				cancelled = true;
			};
		}
		video.play().catch(() => {
			if (cancelled || activeItemIdRef.current !== itemId) return;
			if (!muted) setMuted(true);
			else {
				setVideoFailedItemId(itemId);
				setReadyItemId(itemId);
			}
		});
		return () => {
			cancelled = true;
		};
	}, [
		paused,
		pageVisible,
		muted,
		index,
		step,
		item?.mediaType,
		itemId,
		showingAdIndex
	]);
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			if (e.key === "Escape") {
				if (commentsOpen) {
					setCommentsOpen(false);
					setPaused(false);
				} else if (shareOpen) setShareOpen(false);
				else onClose();
				return;
			}
			if (commentsOpen || shareOpen || showingAdIndex !== null) return;
			if (e.key === "ArrowRight") next();
			if (e.key === "ArrowLeft") prev();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [
		next,
		prev,
		onClose,
		commentsOpen,
		shareOpen,
		showingAdIndex
	]);
	(0, import_react.useEffect)(() => {
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = previousOverflow;
		};
	}, []);
	if (!group || !item) return null;
	if (showingAdIndex !== null && ads[showingAdIndex]) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-[60] flex h-[100dvh] items-center justify-center overflow-hidden bg-black/95 p-0 sm:p-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "relative h-[100dvh] w-full overflow-hidden bg-black sm:h-[88vh] sm:max-h-[900px] sm:w-[420px] sm:rounded-3xl shadow-float",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoryAdOverlay, {
				ad: ads[showingAdIndex],
				onClose: continueAfterAd
			})
		})
	});
	const image = mediaUrlWithAuth(item.mediaUrl);
	const storyItemId = item._id;
	const handleImageLoad = async (event) => {
		const element = event.currentTarget;
		if (!element.naturalWidth) return;
		try {
			await element.decode();
		} catch {}
		if (!element.isConnected || element.currentSrc && element.currentSrc !== image) return;
		if (activeItemIdRef.current === storyItemId) setReadyItemId(storyItemId);
	};
	const handleImageError = () => {
		if (activeItemIdRef.current === storyItemId) setReadyItemId(storyItemId);
	};
	const handleDeleteCurrentStory = () => {
		if (!item) return;
		deleteStory.mutate(item._id);
		toast.success("Story deleted");
		if (group.items.length <= 1) {
			if (groups.length <= 1) onClose();
			else nextGroup();
		} else next();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-[60] flex h-[100dvh] items-center justify-center overflow-hidden bg-black/95 p-0 sm:p-6 select-none",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": "Close decisions",
				onClick: onClose,
				className: "press absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-[70] grid size-10 place-items-center rounded-full bg-black/55 text-white shadow-lg ring-1 ring-white/20 backdrop-blur-md transition hover:bg-white/25 sm:fixed sm:right-5 sm:top-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				onTouchStart: handleTouchStart,
				onTouchMove: handleTouchMove,
				onTouchEnd: handleTouchEnd,
				className: "relative h-[100dvh] w-full overflow-hidden bg-black sm:h-[88vh] sm:max-h-[900px] sm:w-[420px] sm:rounded-3xl shadow-float",
				children: [
					image && item.mediaType === "video" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
						ref: videoRef,
						src: image,
						autoPlay: true,
						muted,
						playsInline: true,
						preload: "auto",
						onPlaying: () => {
							if (activeItemIdRef.current !== storyItemId) return;
							setReadyItemId(storyItemId);
							setVideoFailedItemId(null);
							setVideoPlayingItemId(storyItemId);
						},
						onWaiting: () => setVideoPlayingItemId((current) => current === storyItemId ? null : current),
						onStalled: () => setVideoPlayingItemId((current) => current === storyItemId ? null : current),
						onPause: () => setVideoPlayingItemId((current) => current === storyItemId ? null : current),
						onError: () => {
							if (activeItemIdRef.current !== storyItemId) return;
							setVideoPlayingItemId(null);
							setVideoFailedItemId(storyItemId);
							setReadyItemId(storyItemId);
						},
						onEnded: () => {
							if (activeItemIdRef.current === storyItemId && !paused && pageVisible) next();
						},
						onTimeUpdate: () => {
							const video = videoRef.current;
							if (activeItemIdRef.current === storyItemId && video && Number.isFinite(video.duration) && video.duration > 0) updateProgress(video.currentTime / video.duration);
						},
						className: "absolute inset-0 size-full object-contain bg-black"
					}, storyItemId) : image ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute inset-0 size-full overflow-hidden bg-black flex items-center justify-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute inset-0 size-full bg-cover bg-center filter blur-2xl opacity-50 scale-125",
							style: { backgroundImage: `url(${image})` },
							"aria-hidden": "true"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: image,
							alt: item.caption || "Decision item",
							loading: "eager",
							decoding: "async",
							onLoad: handleImageLoad,
							onError: handleImageError,
							className: "relative z-10 size-full object-contain"
						}, storyItemId)]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/80 transition-opacity", paused && "opacity-0") }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: cn("absolute left-3 right-14 top-[max(0.75rem,env(safe-area-inset-top))] z-30 flex gap-1 transition-opacity sm:inset-x-3 sm:top-3", paused && "opacity-0"),
						children: Array.from({ length: count }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "h-[3px] flex-1 overflow-hidden rounded-full bg-white/30",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								ref: i === step ? progressFillRef : null,
								className: "block h-full w-full rounded-full bg-white transition-none",
								style: {
									transform: `scaleX(${i < step ? 1 : i === step ? progressRef.current : 0})`,
									transformOrigin: "left center"
								}
							})
						}, i))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: cn("absolute inset-x-3 top-[calc(3.5rem+env(safe-area-inset-top))] z-30 flex items-center gap-2 pt-1 text-white transition-opacity sm:top-7 sm:gap-3 sm:pt-2", paused && "opacity-0"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GAvatar, {
								user: toDisplayUser(group.author),
								size: "sm",
								ring: "story"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/profile/$username",
								params: { username: group.author.username },
								className: "min-w-0 flex-1 text-sm font-bold text-white hover:underline truncate",
								children: group.author.username
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden shrink-0 text-xs text-white/70 sm:inline",
								children: timeAgo(item.createdAt)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": "View comments",
								onClick: () => {
									setPaused(true);
									setCommentsOpen(true);
								},
								className: "press grid size-8 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-4" })
							}),
							item.mediaType === "video" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setMuted((m) => !m),
								className: "press grid size-8 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md",
								children: muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-label": "Decision options",
									className: "press grid size-8 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "size-4" })
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
								align: "end",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
									onClick: () => setShareOpen(true),
									children: "Share decision"
								}), isOwnStory ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
									className: "text-danger focus:bg-danger/10 focus:text-danger",
									onClick: handleDeleteCurrentStory,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4 mr-1.5" }), "Delete decision"]
								})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
									onClick: () => toast.success("Report sent to moderation"),
									children: "Report"
								})]
							})] })
						]
					}),
					item.caption && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "absolute bottom-20 left-4 right-4 z-30 text-sm font-medium text-white drop-shadow-md",
						children: item.caption
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute inset-0 z-20 flex",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-full w-1/2 cursor-pointer",
							onClick: prev,
							onMouseDown: () => setPaused(true),
							onMouseUp: () => setPaused(false)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-full w-1/2 cursor-pointer",
							onClick: next,
							onMouseDown: () => setPaused(true),
							onMouseUp: () => setPaused(false)
						})]
					}),
					index > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "Previous user decision",
						onClick: (e) => {
							e.stopPropagation();
							prevGroup();
						},
						className: "press absolute left-2 top-1/2 -translate-y-1/2 z-40 hidden sm:grid size-9 place-items-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-5" })
					}),
					index < groups.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "Next user decision",
						onClick: (e) => {
							e.stopPropagation();
							nextGroup();
						},
						className: "press absolute right-2 top-1/2 -translate-y-1/2 z-40 hidden sm:grid size-9 place-items-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
						className: "absolute inset-x-0 bottom-0 z-50 flex items-center gap-2 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: replyText,
							onChange: (e) => setReplyText(e.target.value),
							onKeyDown: (e) => e.key === "Enter" && handleSendReply(),
							onFocus: () => setPaused(true),
							onBlur: () => setPaused(false),
							placeholder: `Reply to @${group.author.username}…`,
							className: "h-10 rounded-full border-white/20 bg-white/10 text-xs text-white placeholder:text-white/60 focus:border-white focus:bg-white/20 z-50"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "icon-sm",
							variant: "brand",
							onClick: handleSendReply,
							disabled: !replyText.trim() || replyToStory.isPending,
							className: "rounded-full shrink-0",
							children: replyToStory.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-4 animate-spin rounded-full border-2 border-current border-r-transparent" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" })
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShareSheet, {
				open: shareOpen,
				onOpenChange: setShareOpen,
				title: `Decision by @${group.author.username}`,
				url: `${typeof window !== "undefined" ? window.location.origin : ""}/story/${item._id}`
			}),
			commentsOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoryComments, {
				storyId: item._id,
				authorUsername: group.author.username,
				onClose: () => {
					setCommentsOpen(false);
					setPaused(false);
				}
			})
		]
	});
}
function StoryRail() {
	const { user: me } = useSessionUser();
	const { data, isLoading } = useStories();
	const { data: storyAds = [] } = useStoryAds();
	const railRef = (0, import_react.useRef)(null);
	const [viewing, setViewing] = (0, import_react.useState)(null);
	if (!me) return null;
	const groups = data?.stories ?? [];
	const myGroupIndex = groups.findIndex((g) => g.author.username === me.username);
	const others = groups.filter((_, i) => i !== myGroupIndex);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Decisions",
		className: "surface-card mb-4 p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref: railRef,
			className: "flex gap-4 overflow-x-auto pb-1 no-scrollbar",
			style: { scrollSnapType: "x proximity" },
			children: [
				isLoading && Array.from({ length: 6 }, (_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex w-[72px] shrink-0 flex-col items-center gap-1.5",
					"aria-hidden": "true",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "shimmer size-16 rounded-full bg-muted" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "shimmer h-2.5 w-14 rounded-full bg-muted" })]
				}, `story-skeleton-${index}`)),
				!isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => myGroupIndex >= 0 ? setViewing(myGroupIndex) : openCreate("story"),
					className: "press flex w-[72px] shrink-0 flex-col items-center gap-1.5",
					style: { scrollSnapAlign: "start" },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GAvatar, {
							user: me,
							size: "lg",
							ring: myGroupIndex >= 0 ? groups[myGroupIndex]?.seen ? "seen" : "story" : "add"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							role: "button",
							"aria-label": "Add to your decision",
							onClick: (e) => {
								e.stopPropagation();
								openCreate("story");
							},
							className: "gradient-brand absolute -right-0.5 -bottom-0.5 grid size-6 place-items-center rounded-full ring-3 ring-card",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
								className: "size-3.5 text-primary-foreground",
								strokeWidth: 3.5
							})
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "w-full truncate text-center text-[11px] font-semibold",
						children: "Your decision"
					})]
				}),
				!isLoading && others.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setViewing(groups.findIndex((g) => g.author.username === group.author.username)),
					className: "press flex w-[72px] shrink-0 flex-col items-center gap-1.5",
					style: { scrollSnapAlign: "start" },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GAvatar, {
							user: {
								id: group.author._id,
								name: group.author.name,
								username: group.author.username,
								bio: "",
								avatarHue: group.author.avatarHue,
								avatarUrl: group.author.avatarUrl,
								verified: group.author.verified,
								creator: group.author.isCreator,
								live: group.author.isLive,
								followers: 0,
								following: 0,
								posts: 0
							},
							size: "lg",
							ring: group.author.isLive ? "live" : group.seen ? "seen" : "story"
						}), group.author.isLive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-md bg-danger px-1.5 py-px text-[9px] font-bold tracking-wide text-danger-foreground",
							children: "LIVE"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("w-full truncate text-center text-[11px]", group.seen ? "text-muted-foreground" : "font-semibold"),
						children: group.author.username
					})]
				}, group.author.username))
			]
		}), viewing !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoryViewer, {
			groups,
			ads: storyAds,
			startIndex: viewing,
			onClose: () => setViewing(null)
		})]
	});
}
var actions = [
	{
		label: "Photo",
		icon: Image,
		tone: "text-info",
		mode: "post"
	},
	{
		label: "Video",
		icon: Video,
		tone: "text-accent",
		mode: "reel"
	},
	{
		label: "Go live",
		icon: Radio,
		tone: "text-danger",
		to: "/live"
	},
	{
		label: "Schedule",
		icon: CalendarClock,
		tone: "text-warning",
		mode: "post"
	},
	{
		label: "Place",
		icon: MapPin,
		tone: "text-success",
		mode: "post"
	}
];
function Composer() {
	const navigate = useNavigate();
	const { user } = useSessionUser();
	if (!user) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "surface-card mb-4 p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GAvatar, {
					user,
					size: "md"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => openCreate("post"),
					className: "press h-11 min-w-0 flex-1 rounded-2xl bg-elevated px-4 text-left text-sm text-muted-foreground hover:bg-muted",
					children: [
						"What's the update, ",
						user.name.split(" ")[0],
						"?"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "brand",
					className: "hidden sm:inline-flex",
					onClick: () => openCreate("post"),
					children: "Post"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3 flex items-center gap-1 overflow-x-auto border-t border-border pt-3 no-scrollbar",
			children: actions.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => a.to ? navigate({ to: a.to }) : openCreate(a.mode ?? "post"),
				className: "press flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-semibold text-muted-foreground hover:bg-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(a.icon, { className: `size-4 ${a.tone}` }), a.label]
			}, a.label))
		})]
	});
}
function RootIndexPage() {
	const { user, loading } = useAuth();
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-8 animate-spin text-primary" })
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LandingPage, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HomeFeed, {});
}
var tabs = [{
	id: "foryou",
	label: "For you",
	icon: Sparkles
}, {
	id: "trending",
	label: "Trending",
	icon: TrendingUp
}];
/**
* Mobile/tablet discovery strip (hidden on xl+, where the right rail already
* shows trending): a swipeable banner carousel that scrolls horizontally with
* snap, so it never pushes the feed.
*/
function MobileDiscovery() {
	const { data: liveData } = useLiveStreams();
	const liveStreams = liveData?.streams ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mb-4 space-y-3 xl:hidden",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "-mx-3 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-px-3 px-3 pb-1 no-scrollbar [touch-action:pan-x_pan-y] sm:-mx-5 sm:px-5",
			children: [
				liveStreams.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/live",
					className: "surface-card press flex w-[82%] max-w-[360px] shrink-0 snap-start items-center gap-3 p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-10 shrink-0 place-items-center rounded-2xl bg-danger/10 text-danger",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-5 animate-pulse" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "block truncate font-display text-sm font-bold",
								children: [liveStreams.length, " live now"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate text-xs text-muted-foreground",
								children: liveStreams[0]?.title
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-4 shrink-0 text-muted-foreground" })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/explore",
					className: "surface-card press hidden w-[82%] max-w-[360px] shrink-0 snap-start items-center gap-3 p-4 sm:flex",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-10 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate font-display text-sm font-bold",
								children: "What's trending"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate text-xs text-muted-foreground",
								children: "Top topics and fresh media from the community"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-4 shrink-0 text-muted-foreground" })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/ads",
					className: "surface-card press hidden w-[82%] max-w-[360px] shrink-0 snap-start items-center gap-3 p-4 sm:flex",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-10 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate font-display text-sm font-bold",
								children: "Grow with Gihanga Ads"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate text-xs text-muted-foreground",
								children: "Campaigns from 5,000 RWF"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-4 shrink-0 text-muted-foreground" })
					]
				})
			]
		})
	});
}
function HomeFeed() {
	const { user } = useAuth();
	const [tab, setTab] = (0, import_react.useState)("foryou");
	const [recentPostPin, setRecentPostPin] = (0, import_react.useState)(() => user?.id ? readRecentPublishedPost(user.id) : null);
	const pinVisitConsumed = (0, import_react.useRef)(false);
	const loadMoreRef = (0, import_react.useRef)(null);
	const pendingPinId = recentPostPin && !isRecentPostReady(recentPostPin.post) ? recentPostPin.postId : "";
	const pendingPinStatus = useQuery({
		queryKey: [
			"posts",
			"recent-pin-status",
			user?.id,
			pendingPinId
		],
		queryFn: ({ signal }) => api.get(`/posts/${encodeURIComponent(pendingPinId)}`, false, signal),
		enabled: Boolean(user?.id && pendingPinId),
		staleTime: 0,
		refetchInterval: (query) => {
			const post = query.state.data?.post;
			if (!post) return query.state.error ? false : 5e3;
			if (post.status === "published" || [
				"approved",
				"rejected",
				"pending_review",
				"failed"
			].includes(post.moderation?.status ?? "")) return false;
			return 5e3;
		}
	});
	const forYou = useFeed(tab === "foryou");
	const trending = useTrending(tab === "trending");
	const trendingEmpty = tab === "trending" && trending.isFetched && (trending.data?.pages.flatMap((p) => p.posts).length ?? 0) === 0;
	const explore = useExplore(trendingEmpty);
	const { data: feedAds = [] } = useFeedAds();
	const active = tab === "foryou" ? forYou : trendingEmpty ? explore : trending;
	const activeFeedRef = (0, import_react.useRef)(active);
	activeFeedRef.current = active;
	const activePages = active.data?.pages;
	const posts = (0, import_react.useMemo)(() => activePages?.flatMap((page) => page.posts) ?? [], [activePages]);
	(0, import_react.useEffect)(() => {
		if (!user?.id) {
			setRecentPostPin(null);
			return;
		}
		const handlePinUpdate = (event) => {
			if (event.detail?.userId !== user.id) return;
			pinVisitConsumed.current = false;
			setRecentPostPin(readRecentPublishedPost(user.id));
		};
		window.addEventListener(RECENT_POST_PIN_EVENT, handlePinUpdate);
		setRecentPostPin(readRecentPublishedPost(user.id));
		return () => window.removeEventListener(RECENT_POST_PIN_EVENT, handlePinUpdate);
	}, [user?.id]);
	(0, import_react.useEffect)(() => {
		if (!user?.id || !recentPostPin || pinVisitConsumed.current) return;
		const feedVersion = posts.find((post) => post._id === recentPostPin.postId && isRecentPostReady(post));
		const checkedVersion = pendingPinStatus.data?.post?._id === recentPostPin.postId && isRecentPostReady(pendingPinStatus.data.post) ? pendingPinStatus.data.post : null;
		const postToPin = feedVersion ?? checkedVersion ?? (isRecentPostReady(recentPostPin.post) ? recentPostPin.post : null);
		if (!postToPin) return;
		pinVisitConsumed.current = true;
		setRecentPostPin(consumeRecentPostHomeVisit(user.id, postToPin));
	}, [
		user?.id,
		recentPostPin,
		posts,
		pendingPinStatus.data
	]);
	const displayedPosts = (0, import_react.useMemo)(() => {
		if (!recentPostPin) return posts;
		const feedVersion = posts.find((post) => post._id === recentPostPin.postId && isRecentPostReady(post));
		const checkedVersion = pendingPinStatus.data?.post?._id === recentPostPin.postId && isRecentPostReady(pendingPinStatus.data.post) ? pendingPinStatus.data.post : null;
		const pinned = feedVersion ?? checkedVersion ?? (isRecentPostReady(recentPostPin.post) ? recentPostPin.post : null);
		if (!pinned) return posts;
		return [pinned, ...posts.filter((post) => post._id !== pinned._id)];
	}, [
		posts,
		recentPostPin,
		pendingPinStatus.data
	]);
	(0, import_react.useEffect)(() => {
		const sentinel = loadMoreRef.current;
		if (!sentinel || !active.hasNextPage) return;
		const observer = new IntersectionObserver((entries) => {
			if (!entries.some((entry) => entry.isIntersecting)) return;
			const feed = activeFeedRef.current;
			if (feed.hasNextPage && !feed.isFetchingNextPage) feed.fetchNextPage().catch(() => void 0);
		}, {
			root: null,
			rootMargin: "1400px 0px",
			threshold: 0
		});
		observer.observe(sentinel);
		return () => observer.disconnect();
	}, [
		active.hasNextPage,
		active.data?.pages.length,
		tab,
		trendingEmpty
	]);
	const isFollowingAnyone = forYou.data?.pages[0]?.isFollowingAnyone ?? true;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-[620px]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "sr-only",
				children: "Gihanga Updates home feed"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "glass no-scrollbar max-lg:hidden sticky top-16 z-30 -mx-3 mb-4 flex snap-x gap-1 overflow-x-auto overscroll-x-contain rounded-none border-b px-3 py-2 [touch-action:pan-x_pan-y] sm:-mx-5 sm:px-5 lg:static lg:mx-0 lg:rounded-2xl lg:border lg:px-2",
				children: tabs.map((t) => {
					const isActive = t.id === tab;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setTab(t.id),
						"aria-current": isActive,
						className: cn("press relative flex min-w-[140px] flex-1 shrink-0 snap-start items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold", isActive ? "text-primary" : "text-muted-foreground hover:bg-muted"),
						children: [
							isActive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
								layoutId: "feed-tab",
								transition: {
									type: "spring",
									stiffness: 420,
									damping: 34
								},
								className: "absolute inset-0 rounded-xl bg-primary-soft"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(t.icon, { className: "relative size-4" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "relative",
								children: t.label
							})
						]
					}, t.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MobileDiscovery, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoryRail, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Composer, {}),
			tab === "foryou" && !isFollowingAnyone && !forYou.isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface-card mb-4 flex items-center gap-3 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "size-5 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold",
						children: "Follow creators to build your feed"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Your posts still show here — head to Explore to find people to follow."
					})]
				})]
			}),
			active.isLoading && displayedPosts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PostSkeleton, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PostSkeleton, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PostSkeleton, {})
			] }) : displayedPosts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "py-16 text-center text-sm text-muted-foreground",
				children: "Nothing here yet — be the first to post something."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				displayedPosts.map((p, i) => {
					const adIndex = Math.floor((i + 1) / 6) - 1;
					const showAd = (i + 1) % 6 === 0 && adIndex >= 0 && adIndex < feedAds.length;
					const currentAd = showAd ? feedAds[adIndex] : void 0;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PostCard, {
						post: p,
						index: i
					}), showAd && currentAd && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeedAdCard, { ad: currentAd }, currentAd._id)] }, p._id);
				}),
				active.isFetchingNextPage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PostSkeleton, {}),
				active.hasNextPage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					ref: loadMoreRef,
					className: "flex min-h-14 items-center justify-center gap-2 py-4 text-xs text-muted-foreground",
					"aria-live": "polite",
					"aria-busy": active.isFetchingNextPage,
					children: active.isFetchingNextPage ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Loading more posts…" })] }) : active.isFetchNextPageError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "rounded-full px-3 py-1.5 font-semibold text-primary transition-colors hover:bg-primary/10",
						onClick: () => void active.fetchNextPage(),
						children: "Couldn’t load more posts. Try again"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "sr-only",
						children: "More posts load automatically as you scroll."
					})
				})
			] })
		]
	}) });
}
//#endregion
export { RootIndexPage as component };
