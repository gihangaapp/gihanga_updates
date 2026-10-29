import { o as __toESM } from "../_runtime.mjs";
import { r as cn, t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { $ as Send, An as ChevronRight, At as MapPin, D as Trash2, Dt as MessageCircle, Ft as LoaderCircle, R as Sparkles, Rn as CalendarClock, T as TrendingUp, Ut as Image, Vn as Bookmark, X as Share2, a as X, ct as Plus, d as Video, g as UserPlus, jn as ChevronLeft, l as VolumeX, ln as Ellipsis, qn as ArrowUpRight, qt as Heart, sn as ExternalLink, st as Radio, u as Volume2 } from "../_libs/lucide-react.mjs";
import { c as mediaUrlWithAuth, n as api, s as mediaUrl } from "./api-client-DZOxvrvB.mjs";
import { $ as useStories, D as isRecentPostReady, I as useDeleteStory, K as useMarkStoryViewed, L as useExplore, O as openCreate, R as useFeed, T as consumeRecentPostHomeVisit, Y as useReplyToStory, Z as useSessionUser, _ as RECENT_POST_PIN_EVENT, c as DropdownMenu, d as DropdownMenuSeparator, et as useStoryReplies, f as DropdownMenuTrigger, g as LandingPage, h as Input, j as timeAgo, jt as useLiveStreams, k as readRecentPublishedPost, l as DropdownMenuContent, ot as useTrending, p as GAvatar, t as AppShell, u as DropdownMenuItem } from "./router-CrddKQ7E.mjs";
import { r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { l as useAuth } from "./auth-context-CuF8V2_l.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { t as AdBadge } from "./AdBadge-CcJQZFFu.mjs";
import { d as useRecordClick, f as useRecordImpression, o as useFeedAds } from "./use-ads-Fhv5Dm_N.mjs";
import { r as ShareSheet } from "./CommentSheet-CRzcye6U.mjs";
import { t as PostCard } from "./PostCard-Co-hfSpx.mjs";
import { t as PostSkeleton } from "./PostSkeleton-BQJvHS--.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-63Q7o_nW.js
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
	const replies = data?.replies ?? [];
	const handleSend = async () => {
		const msg = text.trim();
		if (!msg || sending) return;
		setSending(true);
		try {
			await replyToStory.mutateAsync({
				storyId,
				message: msg
			});
			setText("");
		} catch (err) {
			toast.error(err?.message || "Failed to send comment");
		} finally {
			setSending(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-[80] flex items-end justify-center sm:items-center",
		role: "dialog",
		"aria-label": `Comments on @${authorUsername}'s story`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			"aria-label": "Close comments",
			onClick: onClose,
			className: "absolute inset-0 bg-black/60 backdrop-blur-sm"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative z-10 flex h-[70dvh] w-full flex-col rounded-t-3xl border border-border bg-card text-card-foreground shadow-float sm:h-[60dvh] sm:max-w-md sm:rounded-3xl",
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
					className: "flex-1 space-y-4 overflow-y-auto px-4 py-3 no-scrollbar",
					children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-full items-center justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-6 animate-spin text-muted-foreground" })
					}) : replies.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
					}) : replies.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
					}, r._id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex shrink-0 items-center gap-2 border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
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
						className: "h-10 rounded-full"
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
function StoryViewer({ groups, startIndex, onClose }) {
	const { user } = useAuth();
	const [index, setIndex] = (0, import_react.useState)(startIndex);
	const [step, setStep] = (0, import_react.useState)(0);
	const [progress, setProgress] = (0, import_react.useState)(0);
	const progressRef = (0, import_react.useRef)(0);
	const [readyItemId, setReadyItemId] = (0, import_react.useState)(null);
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
		if (!replyText.trim() || !item?._id || !group) return;
		const msg = replyText.trim();
		setReplyText("");
		try {
			await replyToStory.mutateAsync({
				storyId: item._id,
				message: msg
			});
			toast.success(`Reply sent to @${group.author.username}!`);
		} catch (err) {
			toast.error(err.message || "Failed to send reply");
		}
	};
	const touchStartX = (0, import_react.useRef)(null);
	const touchEndX = (0, import_react.useRef)(null);
	const updateProgress = (0, import_react.useCallback)((value) => {
		const nextProgress = Math.max(0, Math.min(1, value));
		progressRef.current = nextProgress;
		setProgress(nextProgress);
	}, []);
	const group = groups[index];
	const item = group?.items[step];
	const count = Math.max(1, group?.items.length ?? 1);
	const duration = item?.duration ?? 4200;
	const isOwnStory = user?.username === group?.author?.username;
	const next = (0, import_react.useCallback)(() => {
		updateProgress(0);
		setReadyItemId(null);
		setStep((s) => {
			if (s + 1 < count) return s + 1;
			setIndex((i) => {
				if (i + 1 < groups.length) return i + 1;
				onClose();
				return i;
			});
			return 0;
		});
	}, [
		count,
		groups.length,
		onClose,
		updateProgress
	]);
	const prev = (0, import_react.useCallback)(() => {
		updateProgress(0);
		setReadyItemId(null);
		setStep((s) => {
			if (s > 0) return s - 1;
			setIndex((i) => {
				if (i > 0) return i - 1;
				return 0;
			});
			return 0;
		});
	}, [updateProgress]);
	const nextGroup = (0, import_react.useCallback)(() => {
		updateProgress(0);
		setReadyItemId(null);
		setStep(0);
		setIndex((i) => {
			if (i + 1 < groups.length) return i + 1;
			onClose();
			return i;
		});
	}, [
		groups.length,
		onClose,
		updateProgress
	]);
	const prevGroup = (0, import_react.useCallback)(() => {
		updateProgress(0);
		setReadyItemId(null);
		setStep(0);
		setIndex((i) => i > 0 ? i - 1 : 0);
	}, [updateProgress]);
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
		updateProgress(0);
	}, [
		index,
		step,
		item?._id,
		updateProgress
	]);
	(0, import_react.useEffect)(() => {
		if (item?._id && !item.mediaUrl?.trim()) setReadyItemId(item._id);
	}, [item?._id, item?.mediaUrl]);
	(0, import_react.useEffect)(() => {
		if (paused || !item?._id || readyItemId !== item._id) return;
		const video = videoRef.current;
		if (item?.mediaType === "video" && video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && !video.error) return;
		let cancelled = false;
		const startProgress = progressRef.current;
		const start = performance.now();
		const tick = (now) => {
			if (cancelled) return;
			const p = Math.min(1, startProgress + (now - start) / duration);
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
			if (raf.current) cancelAnimationFrame(raf.current);
		};
	}, [
		index,
		step,
		paused,
		next,
		duration,
		item?._id,
		item?.mediaType,
		readyItemId,
		updateProgress
	]);
	(0, import_react.useEffect)(() => {
		if (item?.mediaType === "video" && videoRef.current) {
			if (paused) videoRef.current.pause();
			else videoRef.current.play().catch(() => {});
		}
	}, [
		paused,
		index,
		step,
		item?.mediaType
	]);
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			if (e.key === "Escape") onClose();
			if (e.key === "ArrowRight") next();
			if (e.key === "ArrowLeft") prev();
		};
		window.addEventListener("keydown", onKey);
		document.body.style.overflow = "hidden";
		return () => {
			window.removeEventListener("keydown", onKey);
			document.body.style.overflow = "";
		};
	}, [
		next,
		prev,
		onClose
	]);
	if (!group || !item) return null;
	const image = mediaUrlWithAuth(item.mediaUrl);
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
		className: "fixed inset-0 z-50 flex items-center justify-center bg-black/92 p-0 sm:p-6 select-none",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": "Close stories",
				onClick: onClose,
				className: "press absolute top-4 right-4 z-50 grid size-10 place-items-center rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/30",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				onTouchStart: handleTouchStart,
				onTouchMove: handleTouchMove,
				onTouchEnd: handleTouchEnd,
				className: "relative h-full w-full overflow-hidden bg-black sm:h-[88vh] sm:w-[420px] sm:rounded-3xl shadow-float",
				children: [
					image && item.mediaType === "video" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
						ref: videoRef,
						src: image,
						autoPlay: true,
						muted,
						playsInline: true,
						preload: "auto",
						onLoadedData: () => setReadyItemId(item._id),
						onError: () => setReadyItemId(item._id),
						onEnded: next,
						onTimeUpdate: () => {
							if (videoRef.current && videoRef.current.duration) updateProgress(videoRef.current.currentTime / videoRef.current.duration);
						},
						className: "absolute inset-0 size-full object-contain bg-black"
					}) : image ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute inset-0 size-full overflow-hidden bg-black flex items-center justify-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute inset-0 size-full bg-cover bg-center filter blur-2xl opacity-50 scale-125",
							style: { backgroundImage: `url(${image})` },
							"aria-hidden": "true"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: image,
							alt: item.caption || "Story item",
							loading: "eager",
							decoding: "async",
							onLoad: () => setReadyItemId(item._id),
							onError: () => setReadyItemId(item._id),
							className: "relative z-10 size-full object-contain"
						})]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/80 transition-opacity", paused && "opacity-0") }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: cn("absolute inset-x-3 top-3 z-30 flex gap-1 transition-opacity", paused && "opacity-0"),
						children: Array.from({ length: count }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "h-[3px] flex-1 overflow-hidden rounded-full bg-white/30",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block h-full rounded-full bg-white transition-none",
								style: { width: `${i < step ? 100 : i === step ? progress * 100 : 0}%` }
							})
						}, i))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: cn("absolute inset-x-3 top-7 z-30 flex items-center gap-3 pt-2 text-white transition-opacity", paused && "opacity-0"),
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
								className: "text-xs text-white/70 shrink-0",
								children: timeAgo(item.createdAt)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": "View comments",
								onClick: () => setCommentsOpen(true),
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
									"aria-label": "Story options",
									className: "press grid size-8 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "size-4" })
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
								align: "end",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
									onClick: () => setShareOpen(true),
									children: "Share story"
								}), isOwnStory ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
									className: "text-danger focus:bg-danger/10 focus:text-danger",
									onClick: handleDeleteCurrentStory,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4 mr-1.5" }), "Delete story"]
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
						"aria-label": "Previous user story",
						onClick: (e) => {
							e.stopPropagation();
							prevGroup();
						},
						className: "press absolute left-2 top-1/2 -translate-y-1/2 z-40 hidden sm:grid size-9 place-items-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-5" })
					}),
					index < groups.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "Next user story",
						onClick: (e) => {
							e.stopPropagation();
							nextGroup();
						},
						className: "press absolute right-2 top-1/2 -translate-y-1/2 z-40 hidden sm:grid size-9 place-items-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
						className: "absolute inset-x-0 bottom-0 z-50 flex items-center gap-2 p-3 bg-gradient-to-t from-black/95 via-black/80 to-transparent",
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
							disabled: !replyText.trim(),
							className: "rounded-full shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" })
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShareSheet, {
				open: shareOpen,
				onOpenChange: setShareOpen,
				title: `Story by @${group.author.username}`,
				url: `${typeof window !== "undefined" ? window.location.origin : ""}/story/${item._id}`
			}),
			commentsOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoryComments, {
				storyId: item._id,
				authorUsername: group.author.username,
				onClose: () => setCommentsOpen(false)
			})
		]
	});
}
function StoryRail() {
	const { user: me } = useSessionUser();
	const { data } = useStories();
	const railRef = (0, import_react.useRef)(null);
	const [viewing, setViewing] = (0, import_react.useState)(null);
	if (!me) return null;
	const groups = data?.stories ?? [];
	const myGroupIndex = groups.findIndex((g) => g.author.username === me.username);
	const others = groups.filter((_, i) => i !== myGroupIndex);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Stories",
		className: "surface-card mb-4 p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref: railRef,
			className: "flex gap-4 overflow-x-auto pb-1 no-scrollbar",
			style: { scrollSnapType: "x proximity" },
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
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
						"aria-label": "Add to your story",
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
					children: "Your story"
				})]
			}), others.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
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
			}, group.author.username))]
		}), viewing !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoryViewer, {
			groups,
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
function FeedAdCard({ ad }) {
	const recordImpression = useRecordImpression();
	const recordClick = useRecordClick();
	(0, import_react.useEffect)(() => {
		if (ad._id) recordImpression.mutate(ad._id);
	}, [ad._id]);
	function handleCtaClick() {
		if (ad._id) recordClick.mutate(ad._id);
		if (ad.ctaUrl) window.open(ad.ctaUrl, "_blank", "noopener,noreferrer");
	}
	const creator = typeof ad.creator === "object" ? ad.creator : null;
	const creatorName = creator?.name || "Sponsored Partner";
	const creatorUsername = creator?.username || "sponsored";
	const resolvedMedia = mediaUrl(ad.mediaUrl) || ad.mediaUrl;
	const resolvedThumbnail = mediaUrl(ad.thumbnailUrl) || ad.thumbnailUrl;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "surface-card overflow-hidden border border-border/80 mb-4 rounded-2xl shadow-sm transition-all hover:border-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid size-10 place-items-center rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 font-bold text-white text-xs shadow-md",
						children: creatorName[0]?.toUpperCase()
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-bold text-sm text-foreground",
							children: creatorName
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs text-muted-foreground",
							children: ["@", creatorUsername]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] text-muted-foreground font-medium",
						children: "Sponsored Post"
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdBadge, { variant: "glass" })]
			}),
			ad.title && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "px-4 pb-2 font-bold text-base text-foreground",
				children: ad.title
			}),
			ad.caption && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-4 pb-3 text-xs text-foreground/90 leading-relaxed",
				children: ad.caption
			}),
			resolvedMedia && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative aspect-video w-full overflow-hidden bg-slate-950",
				children: ad.adType.includes("video") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
					src: resolvedMedia,
					poster: resolvedThumbnail,
					controls: true,
					muted: true,
					playsInline: true,
					className: "h-full w-full object-cover"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: resolvedMedia,
					alt: ad.title,
					className: "h-full w-full object-cover"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between border-y border-border/60 bg-muted/40 px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1 pr-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-xs font-extrabold text-foreground",
						children: ad.title
					}), ad.ctaUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-[10px] text-muted-foreground",
						children: ad.ctaUrl
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: handleCtaClick,
					className: "press flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: ad.ctaText || "Learn More" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-3.5" })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between p-3.5 text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "flex items-center gap-1.5 text-xs hover:text-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "flex items-center gap-1.5 text-xs hover:text-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "flex items-center gap-1.5 text-xs hover:text-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-4" })
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "text-xs hover:text-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, { className: "size-4" })
				})]
			})
		]
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
	const forYou = useFeed();
	const trending = useTrending();
	const explore = useExplore();
	const { data: feedAds = [] } = useFeedAds();
	const trendingEmpty = !trending.isLoading && (trending.data?.pages.flatMap((p) => p.posts).length ?? 0) === 0;
	const active = tab === "foryou" ? forYou : trendingEmpty ? explore : trending;
	const activePages = active.data?.pages;
	const posts = (0, import_react.useMemo)(() => {
		const next = (activePages?.flatMap((p) => p.posts) ?? []).slice();
		if (tab === "trending" && trendingEmpty) next.sort((a, b) => b.likesCount - a.likesCount);
		return next;
	}, [
		activePages,
		tab,
		trendingEmpty
	]);
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
			active.isLoading && displayedPosts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PostSkeleton, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PostSkeleton, {})] }) : displayedPosts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "py-16 text-center text-sm text-muted-foreground",
				children: "Nothing here yet — be the first to post something."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [displayedPosts.map((p, i) => {
				const adIndex = Math.floor(i / 4) % (feedAds.length || 1);
				const showAd = (i + 1) % 4 === 0 && feedAds.length > 0 && feedAds[adIndex];
				const currentAd = feedAds[adIndex];
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PostCard, {
					post: p,
					index: i
				}), showAd && currentAd && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeedAdCard, { ad: currentAd })] }, p._id);
			}), active.hasNextPage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-center py-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					onClick: () => active.fetchNextPage(),
					disabled: active.isFetchingNextPage,
					children: [active.isFetchingNextPage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), "Load more"]
				})
			})] })
		]
	}) });
}
//#endregion
export { RootIndexPage as component };
