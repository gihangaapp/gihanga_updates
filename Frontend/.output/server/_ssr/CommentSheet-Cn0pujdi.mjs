import { o as __toESM } from "../_runtime.mjs";
import { r as cn, t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { Tn as Copy, Un as Check, Z as Share2, Zt as Heart, jt as MessageCircle, pn as ExternalLink, tt as Send, wn as CornerDownRight, zt as LoaderCircle } from "../_libs/lucide-react.mjs";
import { l as useAuth } from "./auth-context-CsN3soau.mjs";
import { E as formatCount, F as useComments, Gt as useIsMobile, I as useCreateComment, Kt as Dialog, N as timeAgo, Xt as DialogHeader, Zt as DialogTitle, a as DrawerDescription, i as DrawerContent, o as DrawerHeader, p as GAvatar, qt as DialogContent, r as Drawer$1, s as DrawerTitle, st as useToggleCommentLike } from "./router-BDN0UH9I.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/CommentSheet-Cn0pujdi.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ShareSheet({ open, onOpenChange, title = "Check this out on Gihanga Updates", text, url, onShare }) {
	const isMobile = useIsMobile();
	const [copied, setCopied] = (0, import_react.useState)(false);
	const targetUrl = url || (typeof window !== "undefined" ? window.location.href : "");
	const handleCopyLink = async () => {
		try {
			await navigator.clipboard.writeText(targetUrl);
			onShare?.();
			setCopied(true);
			toast.success("Link copied to clipboard!");
			setTimeout(() => setCopied(false), 2e3);
		} catch {
			toast.error("Could not copy the link");
		}
	};
	const handleNativeShare = async () => {
		if (navigator.share) try {
			await navigator.share({
				title,
				text: text || title,
				url: targetUrl
			});
			onShare?.();
			onOpenChange(false);
		} catch (err) {
			if (err.name !== "AbortError") toast.error("Share failed");
		}
		else handleCopyLink();
	};
	const shareLinks = [
		{
			name: "WhatsApp",
			icon: MessageCircle,
			color: "bg-emerald-600 text-white",
			href: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} ${targetUrl}`)}`
		},
		{
			name: "Twitter / X",
			icon: ExternalLink,
			color: "bg-black text-white dark:bg-white dark:text-black",
			href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(targetUrl)}`
		},
		{
			name: "Telegram",
			icon: Send,
			color: "bg-sky-500 text-white",
			href: `https://t.me/share/url?url=${encodeURIComponent(targetUrl)}&text=${encodeURIComponent(title)}`
		}
	];
	const content = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5 p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 rounded-2xl border border-border bg-surface p-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "text",
					readOnly: true,
					value: targetUrl,
					className: "flex-1 min-w-0 bg-transparent px-2 text-xs font-medium text-foreground truncate focus:outline-none"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "brand",
					size: "sm",
					onClick: handleCopyLink,
					className: "shrink-0 gap-1.5",
					children: [copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" }), copied ? "Copied" : "Copy"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center justify-around gap-2 pt-2",
				children: shareLinks.map((item) => {
					const Icon = item.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: item.href,
						target: "_blank",
						rel: "noopener noreferrer",
						onClick: () => {
							onShare?.();
							onOpenChange(false);
						},
						className: "press flex flex-col items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: `grid size-12 place-items-center rounded-2xl ${item.color} shadow-sm`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11px] font-semibold text-muted-foreground",
							children: item.name
						})]
					}, item.name);
				})
			}),
			typeof navigator !== "undefined" && "share" in navigator && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				className: "w-full justify-center gap-2 mt-2",
				onClick: handleNativeShare,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-4 text-primary" }), "More Share Options"]
			})
		]
	});
	if (isMobile) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer$1, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DrawerContent, {
			className: "p-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawerHeader, {
				className: "border-b border-border px-5 py-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawerTitle, {
					className: "font-display text-base font-bold text-center",
					children: "Share"
				})
			}), content]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-[420px] p-0 rounded-3xl gap-0 border-border",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, {
				className: "border-b border-border px-5 py-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					className: "font-display text-base font-bold",
					children: "Share Content"
				})
			}), content]
		})
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
function InlineComments({ post }) {
	const { data, isLoading } = useComments(post._id);
	const createComment = useCreateComment(post._id);
	const { user } = useAuth();
	const [draft, setDraft] = (0, import_react.useState)("");
	const [replyTo, setReplyTo] = (0, import_react.useState)(null);
	const [pendingComment, setPendingComment] = (0, import_react.useState)(null);
	const handleSubmit = () => {
		const body = draft.trim();
		if (!body || createComment.isPending) return;
		setPendingComment({
			body,
			...replyTo ? { replyName: replyTo.name } : {}
		});
		setDraft("");
		createComment.mutate({
			body,
			parent: replyTo?.id
		}, {
			onSuccess: (result) => {
				setPendingComment(null);
				setReplyTo(null);
				if (result.pendingNotice) toast.info(result.pendingNotice);
			},
			onError: (err) => {
				setPendingComment(null);
				setDraft(body);
				toast.error(err.message || "Couldn't post comment");
			}
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col border-t border-border/80 bg-surface/50 p-4 gap-4 animate-fade-in",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-3.5 max-h-80 overflow-y-auto no-scrollbar pr-1",
			children: [pendingComment && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PendingComment, {
				body: pendingComment.body,
				replyName: pendingComment.replyName,
				user
			}), isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-center py-6 text-xs text-muted-foreground gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin text-primary" }), " Loading comments…"]
			}) : !data?.comments || data.comments.length === 0 ? !pendingComment && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-center py-4 text-xs text-muted-foreground",
				children: "No comments yet. Be the first to comment!"
			}) : data.comments.map((comment) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentRow, {
				comment,
				postId: post._id,
				onReply: (id, name) => setReplyTo({
					id,
					name
				})
			}, comment._id))]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pt-2 border-t border-border/60",
			children: [replyTo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-2 flex items-center justify-between text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Replying to ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
					className: "text-foreground",
					children: ["@", replyTo.name]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "text-danger hover:underline font-bold",
					onClick: () => setReplyTo(null),
					children: "Cancel"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "text",
					value: draft,
					disabled: createComment.isPending,
					onChange: (e) => setDraft(e.target.value),
					onKeyDown: (e) => e.key === "Enter" && handleSubmit(),
					placeholder: replyTo ? `Reply to ${replyTo.name}…` : "Add a comment…",
					className: "h-10 min-w-0 flex-1 rounded-full border border-border bg-elevated px-4 text-xs outline-none focus:border-primary disabled:opacity-60"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "brand",
					onClick: handleSubmit,
					disabled: !draft.trim() || createComment.isPending,
					className: "rounded-full shrink-0",
					children: createComment.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 animate-spin" }), " Sending…"] }) : "Post"
				})]
			})]
		})]
	});
}
function CommentSheet({ post, open, onOpenChange }) {
	const isMobile = useIsMobile();
	const { data, isLoading } = useComments(open ? post._id : "");
	const createComment = useCreateComment(post._id);
	const { user } = useAuth();
	const inputRef = (0, import_react.useRef)(null);
	const [viewportHeight, setViewportHeight] = (0, import_react.useState)(() => typeof window !== "undefined" ? window.visualViewport?.height ?? window.innerHeight : 640);
	const [keyboardInset, setKeyboardInset] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		if (!open || !isMobile || typeof window === "undefined") return;
		const viewport = window.visualViewport;
		const updateViewport = () => {
			const height = viewport?.height ?? window.innerHeight;
			setViewportHeight(height);
			const inset = Math.max(0, window.innerHeight - height - (viewport?.offsetTop ?? 0));
			setKeyboardInset(inset > 120 ? inset : 0);
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
	}, [open, isMobile]);
	const [draft, setDraft] = (0, import_react.useState)("");
	const [replyTo, setReplyTo] = (0, import_react.useState)(null);
	const [pendingComment, setPendingComment] = (0, import_react.useState)(null);
	const handleSubmit = () => {
		const body = draft.trim();
		if (!body || createComment.isPending) return;
		setPendingComment({
			body,
			...replyTo ? { replyName: replyTo.name } : {}
		});
		setDraft("");
		createComment.mutate({
			body,
			parent: replyTo?.id
		}, {
			onSuccess: (result) => {
				setPendingComment(null);
				setReplyTo(null);
				if (result.pendingNotice) toast.info(result.pendingNotice);
			},
			onError: (err) => {
				setPendingComment(null);
				setDraft(body);
				toast.error(err.message || "Couldn't post comment");
			}
		});
	};
	const content = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 w-full flex-col",
		style: { height: isMobile ? `${Math.max(180, Math.min(viewportHeight * .68, 600))}px` : "min(75vh, 640px)" },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 no-scrollbar",
			children: [pendingComment && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PendingComment, {
				body: pendingComment.body,
				replyName: pendingComment.replyName,
				user
			}), isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center justify-center py-12 text-sm text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-6 animate-spin text-primary mb-2" }), "Loading comments…"]
			}) : !data?.comments || data.comments.length === 0 ? !pendingComment && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center justify-center py-12 text-center text-sm text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-bold text-foreground mb-1",
					children: "No comments yet"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs",
					children: "Be the first to share your thoughts!"
				})]
			}) : data.comments.map((comment) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentRow, {
				comment,
				postId: post._id,
				onReply: (id, name) => setReplyTo({
					id,
					name
				})
			}, comment._id))]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border-t border-border bg-surface p-4",
			children: [replyTo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-2 flex items-center justify-between text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Replying to ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
					className: "text-foreground",
					children: ["@", replyTo.name]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "text-danger hover:underline font-bold",
					onClick: () => setReplyTo(null),
					children: "Cancel"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref: inputRef,
					type: "text",
					value: draft,
					disabled: createComment.isPending,
					onChange: (e) => setDraft(e.target.value),
					onKeyDown: (e) => e.key === "Enter" && handleSubmit(),
					onFocus: () => window.setTimeout(() => inputRef.current?.scrollIntoView({
						block: "nearest",
						behavior: "smooth"
					}), 100),
					placeholder: replyTo ? `Reply to ${replyTo.name}…` : "Add a comment…",
					className: "h-11 min-w-0 flex-1 rounded-full border border-border bg-elevated px-4 text-sm outline-none focus:border-primary disabled:opacity-60"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "icon",
					variant: "brand",
					onClick: handleSubmit,
					disabled: !draft.trim() || createComment.isPending,
					className: "rounded-full shrink-0",
					children: createComment.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" })
				})]
			})]
		})]
	});
	if (isMobile) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer$1, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DrawerContent, {
			style: {
				bottom: keyboardInset > 0 ? `${keyboardInset}px` : "0px",
				maxHeight: `${Math.max(250, viewportHeight - 8)}px`
			},
			className: "overflow-hidden rounded-t-3xl p-0 max-h-[85dvh]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DrawerHeader, {
				className: "border-b border-border px-5 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawerTitle, {
					className: "font-display text-base font-bold text-center",
					children: "Comments"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DrawerDescription, {
					className: "text-center text-xs",
					children: [
						formatCount(post.commentsCount),
						" comments on @",
						post.author.username,
						"'s post"
					]
				})]
			}), content]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-[480px] p-0 rounded-3xl gap-0 border-border overflow-hidden",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, {
				className: "border-b border-border px-5 py-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					className: "font-display text-base font-bold",
					children: "Comments"
				})
			}), content]
		})
	});
}
function PendingComment({ body, replyName, user }) {
	if (!user) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-start gap-3 opacity-90",
		"aria-live": "polite",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GAvatar, {
			user,
			size: "xs"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 flex-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-bold text-foreground",
							children: user.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-[11px] text-muted-foreground",
							children: ["@", user.username]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1 text-[11px] text-primary",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3 animate-spin" }), " Sending…"]
						})
					]
				}),
				replyName && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-0.5 text-[11px] text-muted-foreground",
					children: ["Replying to @", replyName]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 whitespace-pre-wrap break-words text-xs leading-relaxed text-foreground/90",
					children: body
				})
			]
		})]
	});
}
function CommentRow({ comment, postId, onReply, depth = 0 }) {
	const toggleLike = useToggleCommentLike(postId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex items-start gap-3", depth > 0 && "ml-7 mt-3 border-l-2 border-border/40 pl-3"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GAvatar, {
			user: toDisplayUser(comment.author),
			size: "xs"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 flex-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate text-xs font-bold text-foreground",
							children: comment.author.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-[11px] text-muted-foreground",
							children: ["@", comment.author.username]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"aria-hidden": true,
							className: "text-[11px] text-muted-foreground",
							children: "·"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11px] text-muted-foreground",
							children: timeAgo(comment.createdAt)
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap",
					children: comment.body
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-1.5 flex items-center gap-4 text-[11px] font-semibold text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: cn("press flex items-center gap-1 hover:text-danger disabled:opacity-50", comment.liked && "text-danger"),
						"aria-label": comment.liked ? "Unlike comment" : "Like comment",
						"aria-pressed": comment.liked,
						disabled: toggleLike.isPending,
						onClick: () => toggleLike.mutate(comment._id, { onError: (err) => toast.error(err.message || "Couldn't like comment") }),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: cn("size-3", comment.liked && "fill-current") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatCount(comment.likesCount) })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "press flex items-center gap-1 hover:text-primary",
						onClick: () => onReply(comment._id, comment.author.username),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CornerDownRight, { className: "size-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Reply" })]
					})]
				}),
				comment.replies?.map((reply) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentRow, {
					comment: reply,
					postId,
					onReply,
					depth: depth + 1
				}, reply._id))
			]
		})]
	});
}
//#endregion
export { InlineComments as n, ShareSheet as r, CommentSheet as t };
