import { o as __toESM } from "../_runtime.mjs";
import { t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { B as Smile, Jt as ImageOff, Z as Share2, Zt as Heart, h as UserRound, hn as Ellipsis, jt as MessageCircle, pn as ExternalLink, tt as Send, zt as LoaderCircle } from "../_libs/lucide-react.mjs";
import { c as mediaUrlWithAuth, s as mediaUrl } from "./api-client-C-W0Sa9i.mjs";
import { l as useAuth } from "./auth-context-CsN3soau.mjs";
import { E as formatCount, Kt as Dialog, N as timeAgo, Wt as Textarea, Xt as DialogHeader, Zt as DialogTitle, c as DropdownMenu, f as DropdownMenuTrigger, l as DropdownMenuContent, qt as DialogContent, u as DropdownMenuItem } from "./router-BDN0UH9I.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as AdBadge } from "./AdBadge-CcJQZFFu.mjs";
import { S as useShareAd, g as useRecordView, h as useRecordImpression, i as useAdReaction, l as useCreateAdComment, m as useRecordClick, r as useAdFeedback, t as useAdComments } from "./use-ads-Bg4PdVDV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/FeedAdCard-DRWvBXs3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdCommentsDialog({ adId, adTitle, open, onOpenChange }) {
	const { user, staffUser } = useAuth();
	const canComment = Boolean(user || staffUser);
	const { data, isLoading, isError } = useAdComments(adId, open);
	const createComment = useCreateAdComment(adId);
	const [draft, setDraft] = (0, import_react.useState)("");
	const submit = () => {
		const body = draft.trim();
		if (!body || createComment.isPending) return;
		if (!canComment) {
			toast.info("Sign in to comment on advertisements.");
			return;
		}
		createComment.mutate(body, {
			onSuccess: (result) => {
				setDraft("");
				if (result.pendingNotice) toast.info(result.pendingNotice);
				else toast.success("Comment posted.");
			},
			onError: (error) => toast.error(error.message || "Could not post your comment")
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "flex max-h-[85dvh] flex-col gap-3 overflow-hidden sm:max-w-[520px]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-5 text-primary" }), " Comments"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: [
						"Conversation on “",
						adTitle,
						"”"
					]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-h-0 flex-1 space-y-3 overflow-y-auto pr-1",
					children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), " Loading comments…"]
					}) : isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "py-8 text-center text-sm text-muted-foreground",
						children: "Comments could not be loaded. Close and reopen to try again."
					}) : !data?.comments.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "py-10 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "mx-auto mb-2 size-8 text-muted-foreground/50" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold",
								children: "No comments yet"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Be the first to start the conversation."
							})
						]
					}) : data.comments.map((comment) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "flex gap-2.5 rounded-xl bg-muted/40 p-3",
						children: [comment.author.avatarUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: comment.author.avatarUrl,
							alt: "",
							className: "size-8 shrink-0 rounded-full object-cover"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, { className: "size-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-x-2 gap-y-0.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs font-bold",
										children: comment.author.name || `@${comment.author.username}`
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-[10px] text-muted-foreground",
										children: ["@", comment.author.username]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-[10px] text-muted-foreground",
										children: ["· ", timeAgo(comment.createdAt)]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 whitespace-pre-wrap break-words text-sm",
								children: comment.body
							})]
						})]
					}, comment._id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "shrink-0 border-t border-border pt-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						value: draft,
						onChange: (event) => setDraft(event.target.value),
						placeholder: canComment ? "Write a comment…" : "Sign in to comment…",
						maxLength: 1e3,
						rows: 2,
						disabled: !canComment || createComment.isPending,
						className: "resize-none text-sm",
						onKeyDown: (event) => {
							if (event.key === "Enter" && !event.shiftKey) {
								event.preventDefault();
								submit();
							}
						}
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] text-muted-foreground",
							children: "Comments may be reviewed before appearing publicly."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							onClick: submit,
							disabled: !draft.trim() || createComment.isPending || !canComment,
							children: [createComment.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-1 size-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "mr-1 size-3.5" }), "Post"]
						})]
					})]
				})
			]
		})
	});
}
function FeedAdCard({ ad, variant = "feed", isActive = true }) {
	const recordImpression = useRecordImpression();
	const recordClick = useRecordClick();
	const recordView = useRecordView();
	const feedback = useAdFeedback();
	const updateReaction = useAdReaction();
	const shareAd = useShareAd();
	const { user, staffUser } = useAuth();
	const canInteract = Boolean(user || staffUser);
	const [commentsOpen, setCommentsOpen] = (0, import_react.useState)(false);
	const [mediaFailed, setMediaFailed] = (0, import_react.useState)(false);
	const [avatarFailed, setAvatarFailed] = (0, import_react.useState)(false);
	const reelVideoRef = (0, import_react.useRef)(null);
	const impressionMutate = (0, import_react.useRef)(recordImpression.mutate);
	const viewMutate = (0, import_react.useRef)(recordView.mutate);
	impressionMutate.current = recordImpression.mutate;
	viewMutate.current = recordView.mutate;
	const [hidden, setHidden] = (0, import_react.useState)(false);
	const articleRef = (0, import_react.useRef)(null);
	const impressionSent = (0, import_react.useRef)(false);
	const accumulatedVisibleMs = (0, import_react.useRef)(0);
	const visibleSince = (0, import_react.useRef)(null);
	const viewReported = (0, import_react.useRef)(false);
	const intersectionVisible = (0, import_react.useRef)(false);
	const reportView = (0, import_react.useCallback)(() => {
		if (!ad._id || viewReported.current) return;
		const currentVisibleMs = visibleSince.current === null ? 0 : Date.now() - visibleSince.current;
		const seconds = Math.floor((accumulatedVisibleMs.current + currentVisibleMs) / 1e3);
		if (seconds < 1) return;
		viewReported.current = true;
		visibleSince.current = null;
		viewMutate.current({
			adId: ad._id,
			seconds
		});
	}, [ad._id]);
	(0, import_react.useEffect)(() => {
		const element = articleRef.current;
		if (!element || typeof IntersectionObserver === "undefined") return;
		const observer = new IntersectionObserver(([entry]) => {
			if (!entry) return;
			const isVisible = entry.isIntersecting && entry.intersectionRatio >= .5;
			intersectionVisible.current = isVisible;
			if (isVisible && document.visibilityState !== "hidden") {
				if (!impressionSent.current && ad._id) {
					impressionSent.current = true;
					impressionMutate.current(ad._id);
				}
				if (visibleSince.current === null) visibleSince.current = Date.now();
			} else if (visibleSince.current !== null) {
				accumulatedVisibleMs.current += Math.max(0, Date.now() - visibleSince.current);
				visibleSince.current = null;
				reportView();
			}
		}, { threshold: [
			0,
			.5,
			1
		] });
		observer.observe(element);
		const onVisibility = () => {
			if (document.visibilityState === "hidden" && visibleSince.current !== null) {
				accumulatedVisibleMs.current += Math.max(0, Date.now() - visibleSince.current);
				visibleSince.current = null;
				reportView();
			} else if (document.visibilityState !== "hidden" && intersectionVisible.current) {
				if (!impressionSent.current && ad._id) {
					impressionSent.current = true;
					impressionMutate.current(ad._id);
				}
				if (visibleSince.current === null && !viewReported.current) visibleSince.current = Date.now();
			}
		};
		document.addEventListener("visibilitychange", onVisibility);
		return () => {
			observer.disconnect();
			document.removeEventListener("visibilitychange", onVisibility);
			if (visibleSince.current !== null) {
				accumulatedVisibleMs.current += Math.max(0, Date.now() - visibleSince.current);
				visibleSince.current = null;
			}
			reportView();
		};
	}, [ad._id, reportView]);
	function handleCtaClick() {
		if (ad._id) recordClick.mutate(ad._id);
		const destination = ad.ctaUrl || `${window.location.origin}/profile/${encodeURIComponent(creatorUsername)}`;
		window.open(destination, "_blank", "noopener,noreferrer");
	}
	function runReaction(reaction) {
		if (!canInteract) {
			toast.info("Sign in to react to advertisements.");
			return;
		}
		updateReaction.mutate({
			adId: ad._id,
			reaction
		}, { onError: (error) => toast.error(error.message || "Could not update your reaction") });
	}
	function handleFeedback(action) {
		feedback.mutate({
			id: ad._id,
			action,
			reason: action === "report" ? "Reported from Feed" : void 0
		}, {
			onSuccess: () => {
				if (action === "hide") setHidden(true);
				toast.success(action === "hide" ? "This advertisement will be hidden from your future ad delivery." : "Advertisement reported to the moderation team.");
			},
			onError: (error) => toast.error(error.message || "Could not save advertisement feedback")
		});
	}
	const creator = typeof ad.creator === "object" ? ad.creator : null;
	const creatorName = creator?.name || "Sponsored Partner";
	const creatorUsername = creator?.username || "sponsored";
	const creatorAvatar = mediaUrlWithAuth(mediaUrl(creator?.avatarUrl) || creator?.avatarUrl);
	const mediaPath = ad.mediaUrl || (ad.mediaKey ? `/api/v1/media/file/${ad.mediaKey}` : void 0);
	const resolvedMedia = mediaUrlWithAuth(mediaUrl(mediaPath) || mediaPath);
	const resolvedThumbnail = mediaUrlWithAuth(mediaUrl(ad.thumbnailUrl) || ad.thumbnailUrl);
	const isVideo = ad.mediaType === "video" || ad.adType.includes("video");
	(0, import_react.useEffect)(() => {
		setMediaFailed(false);
		setAvatarFailed(false);
	}, [
		ad._id,
		resolvedMedia,
		creatorAvatar
	]);
	(0, import_react.useEffect)(() => {
		if (variant !== "reel") return;
		const video = reelVideoRef.current;
		if (!video) return;
		if (isActive) video.play().catch(() => void 0);
		else video.pause();
	}, [
		variant,
		isActive,
		resolvedMedia
	]);
	if (hidden) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		ref: articleRef,
		className: variant === "reel" ? "relative h-full w-full overflow-hidden rounded-3xl border border-white/10 bg-black text-white shadow-float max-lg:rounded-none" : "surface-card mb-4 overflow-hidden rounded-2xl border border-border/80 shadow-sm transition-all hover:border-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: variant === "reel" ? "absolute inset-x-0 top-0 z-20 flex items-center justify-between bg-gradient-to-b from-black/85 via-black/35 to-transparent p-4 text-white" : "flex items-center justify-between p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-xs font-bold text-white shadow-md",
						children: creatorAvatar && !avatarFailed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: creatorAvatar,
							alt: creatorName,
							onError: () => setAvatarFailed(true),
							className: "size-full object-cover"
						}) : creatorName[0]?.toUpperCase()
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `truncate text-sm font-bold ${variant === "reel" ? "text-white" : "text-foreground"}`,
								children: creatorName
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: `truncate text-xs ${variant === "reel" ? "text-white/75" : "text-muted-foreground"}`,
								children: ["@", creatorUsername]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: `text-[11px] font-medium ${variant === "reel" ? "text-white/75" : "text-muted-foreground"}`,
							children: "Sponsored"
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdBadge, { variant: "glass" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": "Advertisement options",
							className: `grid size-8 place-items-center rounded-full ${variant === "reel" ? "text-white hover:bg-white/15" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "size-4" })
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
						align: "end",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
								onClick: () => toast.info("This sponsored placement is part of an approved campaign that matches the current Feed placement and its audience settings."),
								children: "Why am I seeing this ad?"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
								onClick: () => handleFeedback("hide"),
								children: "Hide this ad"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
								onClick: () => handleFeedback("report"),
								children: "Report ad"
							})
						]
					})] })]
				})]
			}),
			variant === "feed" && ad.title && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "px-4 pb-2 text-base font-bold text-foreground",
				children: ad.title
			}),
			variant === "feed" && ad.caption && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-4 pb-3 text-xs leading-relaxed text-foreground/90",
				children: ad.caption
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: variant === "reel" ? "absolute inset-0 h-full w-full overflow-hidden bg-slate-950" : "relative aspect-video w-full overflow-hidden bg-slate-950",
				children: resolvedMedia && !mediaFailed ? isVideo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
					ref: reelVideoRef,
					src: resolvedMedia,
					poster: resolvedThumbnail,
					controls: variant === "feed",
					autoPlay: variant === "reel" && isActive,
					muted: true,
					playsInline: true,
					preload: variant === "reel" ? isActive ? "auto" : "none" : "metadata",
					onError: () => setMediaFailed(true),
					className: "h-full w-full object-cover"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: resolvedMedia,
					alt: ad.title,
					loading: "lazy",
					decoding: "async",
					onError: () => setMediaFailed(true),
					className: "h-full w-full object-cover"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid h-full w-full place-items-center gap-2 text-center text-xs text-white/75",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageOff, { className: "size-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: mediaFailed ? "Advertisement media is temporarily unavailable" : "Advertisement media unavailable" })]
				})
			}),
			variant === "reel" && (ad.title || ad.caption) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-x-0 bottom-28 z-10 bg-gradient-to-t from-black/80 to-transparent px-5 pb-3 pt-12 text-white",
				children: [ad.title && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-base font-extrabold",
					children: ad.title
				}), ad.caption && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 line-clamp-3 text-xs text-white/85",
					children: ad.caption
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: variant === "reel" ? "absolute inset-x-4 bottom-16 z-20 flex items-center justify-between gap-2 rounded-xl bg-primary px-3 py-2.5 text-primary-foreground shadow-xl" : "flex items-center justify-between border-y border-border/60 bg-muted/40 px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1 pr-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: `truncate text-xs font-extrabold ${variant === "reel" ? "text-white" : "text-foreground"}`,
						children: ad.title
					}), ad.ctaUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: `truncate text-[10px] ${variant === "reel" ? "text-white/70" : "text-muted-foreground"}`,
						children: ad.ctaUrl
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: handleCtaClick,
					className: variant === "reel" ? "press flex w-full items-center justify-between gap-2 text-xs font-bold" : "press flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: ad.ctaText || "Learn More" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-3.5" })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: variant === "reel" ? "absolute inset-x-3 bottom-2 z-20 flex flex-wrap items-center justify-between gap-2 text-white" : "flex flex-wrap items-center justify-between gap-2 border-t border-border/60 px-3.5 py-3 text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							"aria-pressed": Boolean(ad.viewerReaction),
							disabled: updateReaction.isPending,
							onClick: () => runReaction(ad.viewerReaction === "like" ? null : "like"),
							className: `press inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors ${variant === "reel" ? "hover:bg-white/15" : "hover:bg-muted"} ${ad.viewerReaction ? "text-rose-500" : variant === "reel" ? "text-white" : "text-muted-foreground"}`,
							children: [updateReaction.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: `size-4 ${ad.viewerReaction ? "fill-current" : ""}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatCount(ad.analytics?.likes ?? 0) })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: `press inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors ${variant === "reel" ? "text-white hover:bg-white/15" : "hover:bg-muted"}`,
								"aria-label": "Choose a reaction",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smile, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "React" })]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuContent, {
							align: "start",
							children: [
								["like", "👍 Like"],
								["love", "❤️ Love"],
								["care", "🤗 Care"],
								["haha", "😂 Haha"],
								["wow", "😮 Wow"],
								["sad", "😢 Sad"],
								["angry", "😡 Angry"]
							].map(([reaction, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
								onClick: () => runReaction(ad.viewerReaction === reaction ? null : reaction),
								children: label
							}, reaction))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setCommentsOpen(true),
							className: `press inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors ${variant === "reel" ? "text-white hover:bg-white/15" : "hover:bg-muted"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatCount(ad.commentsCount ?? ad.analytics?.comments ?? 0) })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							disabled: shareAd.isPending,
							onClick: async () => {
								if (!canInteract) {
									toast.info("Sign in to share advertisements.");
									return;
								}
								const profileUrl = `${window.location.origin}/profile/${encodeURIComponent(creatorUsername)}`;
								const shareUrl = ad.ctaUrl || profileUrl;
								try {
									if (navigator.share) await navigator.share({
										title: ad.title,
										text: ad.caption || `Check out ${creatorName} on Gihanga Updates`,
										url: shareUrl
									});
									else if (navigator.clipboard?.writeText) {
										await navigator.clipboard.writeText(shareUrl);
										toast.success("Advertisement link copied");
									} else {
										toast.error("Sharing is not available in this browser");
										return;
									}
									shareAd.mutate(ad._id, { onError: (error) => toast.error(error.message || "Share could not be recorded") });
								} catch (error) {
									if (error?.name !== "AbortError") toast.error(error?.message || "Could not share this advertisement");
								}
							},
							className: `press inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors disabled:opacity-50 ${variant === "reel" ? "text-white hover:bg-white/15" : "hover:bg-muted"}`,
							children: [shareAd.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Share" })]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: variant === "reel" ? "text-[10px] font-medium text-white/70" : "text-[10px] font-medium text-muted-foreground",
					children: "Sponsored"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdCommentsDialog, {
				adId: ad._id,
				adTitle: ad.title,
				open: commentsOpen,
				onOpenChange: setCommentsOpen
			})
		]
	});
}
//#endregion
export { FeedAdCard as t };
