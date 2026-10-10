import { o as __toESM, r as __exportAll$1 } from "../_runtime.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { n as buttonVariants, r as cn, t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime, a as Overlay2, c as Title2, d as DialogContent$1, f as DialogDescription$1, h as DialogTitle$1, i as Description2, l as Dialog$1, m as DialogPortal$1, n as Cancel, o as Portal2, p as DialogOverlay$1, r as Content2, s as Root2, t as Action, u as DialogClose } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as logo_default, t as Logo } from "./Logo-C5LwQkSU.mjs";
import { C as useRouter, _ as lazyRouteComponent, b as Link, d as Scripts, f as HeadContent, g as Outlet, h as createRouter, p as useRouterState, v as createFileRoute, x as useNavigate, y as createRootRouteWithContext } from "../_libs/@tanstack/react-router+[...].mjs";
import { $ as Scissors, A as TextAlignCenter, At as Lock, B as SlidersHorizontal, Bn as ArrowRight, Bt as House, C as Type, Cn as ChevronRight, Dn as ChartNoAxesColumn, E as Trash2, En as Check, Et as MapPin, F as Square, Fn as Ban, Ft as Laptop, G as ShieldCheck, Gt as Globe, H as Shield, Ht as Heart, I as Sparkles, In as BadgeCheck, It as Key, J as Share2, Jt as Flame, L as Smile, Lt as Info, Mt as Link$1, N as Sun, Nn as Bookmark, Nt as LayoutDashboard, O as TextAlignStart, Ot as LogOut, P as Star, Pn as Bell, Q as Search, Qt as Eye, Rn as AtSign, Rt as Image$1, S as Undo2, St as MessageSquare, T as TrendingUp, Tn as ChevronDown, Ut as Hash, Vn as ArrowLeft, Xt as Film, Y as Settings, Z as Send, _ as UserPlus, _t as Moon, a as X, an as Download, at as Radio, b as UserCheck, bt as Mic, c as Wallet, cn as Crop, d as Video, dt as Pause, en as ExternalLink, fn as Compass, ft as Palette, g as UserRound, gn as Circle, hn as Clock, ht as MoveLeft, i as ZapOff, in as Earth, it as RefreshCw, jt as LoaderCircle, k as TextAlignEnd, kn as Camera, ln as CreditCard, m as User, mn as CloudUpload, mt as MoveRight, n as ZoomIn, ot as Plus, p as Users, pt as Music2, r as Zap, sn as Database, st as Play, t as ZoomOut, tn as Eraser, tt as RotateCw, ut as PenTool, vn as CircleQuestionMark, vt as Monitor, w as TriangleAlert, wn as ChevronLeft, wt as MessageCircle, x as Upload, xn as CircleAlert, xt as MicOff, yn as CircleCheck, yt as Minus, z as SlidersVertical, zn as ArrowUpRight } from "../_libs/lucide-react.mjs";
import { n as api, s as mediaUrl, u as uploadFile } from "./api-client-C-02deeD.mjs";
import { l as useAuth, r as getSocket, t as AuthProvider } from "./auth-context-Duh7Mq6E.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { a as useQueryClient, i as QueryClientProvider, n as useMutation, r as useQuery, t as useInfiniteQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { t as Drawer } from "../_libs/vaul.mjs";
import { n as AnimatePresence } from "../_libs/framer-motion.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { i as SliderTrack, n as SliderRange, r as SliderThumb, t as Slider$1 } from "../_libs/@radix-ui/react-slider+[...].mjs";
import { a as Label2, c as Root2$1, d as SubTrigger2, f as Trigger, i as ItemIndicator2, l as Separator2, n as Content2$1, o as Portal2$1, r as Item2, s as RadioItem2, t as CheckboxItem2, u as SubContent2 } from "../_libs/@radix-ui/react-dropdown-menu+[...].mjs";
import { n as Theme, t as EmojiPicker$1 } from "../_libs/emoji-picker-react+flairup.mjs";
import { n as SwitchThumb, t as Switch$1 } from "../_libs/radix-ui__react-switch.mjs";
import { t as Root } from "../_libs/radix-ui__react-label.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dialog-Ds1Jg4kQ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Dialog = Dialog$1;
var DialogPortal = DialogPortal$1;
var DialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
	ref,
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props
}));
DialogOverlay.displayName = DialogOverlay$1.displayName;
var DialogContent = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
	ref,
	className: cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	})]
})] }));
DialogContent.displayName = DialogContent$1.displayName;
var DialogHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className),
	...props
});
DialogHeader.displayName = "DialogHeader";
var DialogFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
DialogFooter.displayName = "DialogFooter";
var DialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
	ref,
	className: cn("text-lg font-semibold leading-none tracking-tight", className),
	...props
}));
DialogTitle.displayName = DialogTitle$1.displayName;
var DialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
DialogDescription.displayName = DialogDescription$1.displayName;
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-BS6G260b.js
var router_BS6G260b_exports = /* @__PURE__ */ __exportAll$1({
	$: () => useLikedPosts,
	A: () => useStartLive,
	At: () => DrawerHeader,
	B: () => useReplyToStory,
	C: () => useLiveStreams,
	Ct: () => GAvatar,
	D: () => useSaveLiveKeywords,
	Dt: () => Drawer$1,
	E: () => useReportLive,
	Et: () => useIsMobile,
	F: () => formatCount,
	G: () => liveCaptureConstraints,
	H: () => LIVE_VIDEO_QUALITY,
	I: () => timeAgo,
	J: () => Switch,
	K: () => liveIceServers,
	L: () => openCreate,
	M: () => useMarkAllNotificationsRead,
	N: () => useMarkNotificationRead,
	O: () => useSendGift,
	Ot: () => DrawerContent,
	P: () => useNotifications,
	Q: () => useFeed,
	R: () => useDeleteStory,
	S: () => useLiveStream,
	St: () => Textarea,
	T: () => useMyWallet,
	Tt: () => VerifiedBadge,
	U: () => MESH_VIDEO_SEND_PARAMS,
	V: () => useStories,
	W: () => QUALITY_THRESHOLDS,
	X: () => useDeletePost,
	Y: () => useBookmarkedPosts,
	Z: () => useExplore,
	_: () => useLiveAlerts,
	_t: () => useFollowers,
	a: () => Route$19,
	at: () => useUserPosts,
	b: () => useLiveHeartbeat,
	bt: () => useToggleCommentLike,
	c: () => LandingPage,
	ct: () => DropdownMenuContent,
	d: () => GIFT_CATALOG,
	dt: () => DropdownMenuTrigger,
	et: () => useReelsFeed,
	f: () => useAddModerator,
	ft: () => useTrendingTags,
	g: () => useInviteFollowers,
	getRouter: () => getRouter,
	gt: () => useFollowUser,
	h: () => useForceEndLive,
	ht: () => useCreateComment,
	i: () => Route$18,
	it: () => useToggleLike,
	j: () => useUpdateLiveSettings,
	jt: () => DrawerTitle,
	k: () => useStaffLiveStreams,
	kt: () => DrawerDescription,
	l: () => AppShell,
	lt: () => DropdownMenuItem,
	m: () => useEndLive,
	mt: () => useComments,
	n: () => Route$14,
	nt: () => useTagPosts,
	o: () => Badge,
	ot: () => useSessionUser,
	p: () => useBanViewer,
	pt: () => Input,
	q: () => livePreviewConstraints,
	r: () => Route$17,
	rt: () => useToggleBookmark,
	s: () => Route$26,
	st: () => DropdownMenu,
	t: () => router_exports,
	tt: () => useSinglePost,
	u: () => useTheme,
	ut: () => DropdownMenuSeparator,
	v: () => useLiveChatHistory,
	vt: () => useFollowing,
	w: () => useMuteViewer,
	wt: () => UserName,
	x: () => useLiveKeywords,
	xt: () => useUserProfile,
	y: () => useLiveEarnings,
	yt: () => useFollowingSet,
	z: () => useMarkStoryViewed
});
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var styles_default = "/assets/styles-BVLTwO6-.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	const stack = error instanceof Error ? error.stack : void 0;
	window.__lovableReportRuntimeError?.({
		message,
		...stack !== void 0 && { stack },
		filename: window.location.pathname
	});
}
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
/**
* Mounted once near the root. Keeps every open tab/page in sync as other users
* like, comment, post or follow — no polling, no manual refresh needed.
*/
function RealtimeProvider({ children }) {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	(0, import_react.useEffect)(() => {
		if (!user) return;
		const socket = getSocket();
		if (!socket) return;
		const patchPost = (postId, patch) => {
			const entries = queryClient.getQueriesData({ queryKey: ["posts"] });
			for (const [key, data] of entries) {
				if (!data) continue;
				if (Array.isArray(data.pages)) queryClient.setQueryData(key, {
					...data,
					pages: data.pages.map((page) => ({
						...page,
						posts: page.posts.map((p) => p._id === postId ? {
							...p,
							...patch
						} : p)
					}))
				});
				else if (Array.isArray(data.posts)) queryClient.setQueryData(key, {
					...data,
					posts: data.posts.map((p) => p._id === postId ? {
						...p,
						...patch
					} : p)
				});
			}
		};
		const onPostUpdated = (payload) => {
			const { postId, ...patch } = payload;
			patchPost(postId, patch);
		};
		const onPostCreated = (post) => {
			for (const key of [["posts", "explore"], ["posts", "feed"]]) queryClient.setQueryData(key, (data) => {
				if (!data || !Array.isArray(data.pages) || data.pages.length === 0) return data;
				if (data.pages[0].posts.some((p) => p._id === post._id)) return data;
				const [first, ...rest] = data.pages;
				return {
					...data,
					pages: [{
						...first,
						posts: [post, ...first.posts]
					}, ...rest]
				};
			});
		};
		const onCommentCreated = (payload) => {
			queryClient.invalidateQueries({ queryKey: ["comments", payload.postId] });
		};
		const onFollowersChanged = (payload) => {
			queryClient.setQueryData(["profile", payload.username], (prev) => prev ? {
				...prev,
				user: {
					...prev.user,
					followersCount: payload.followersCount
				}
			} : prev);
		};
		const onNotification = () => {
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		};
		socket.on("post:updated", onPostUpdated);
		socket.on("post:created", onPostCreated);
		socket.on("comment:created", onCommentCreated);
		socket.on("user:followers-changed", onFollowersChanged);
		socket.on("notification:new", onNotification);
		return () => {
			socket.off("post:updated", onPostUpdated);
			socket.off("post:created", onPostCreated);
			socket.off("comment:created", onCommentCreated);
			socket.off("user:followers-changed", onFollowersChanged);
			socket.off("notification:new", onNotification);
		};
	}, [user, queryClient]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$40 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Gihanga Updates" },
			{
				name: "description",
				content: "A premium social platform for creators."
			},
			{
				name: "author",
				content: "Gihanga Updates"
			},
			{
				property: "og:title",
				content: "Gihanga Updates"
			},
			{
				property: "og:description",
				content: "A premium social platform for creators."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap"
			},
			{
				rel: "icon",
				href: "/favicon.ico",
				type: "image/x-icon"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$40.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RealtimeProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {
			position: "top-center",
			richColors: true,
			closeButton: true
		})] }) })
	});
}
var $$splitComponentImporter$36 = () => import("./routes-Dd17htLr.mjs");
var Route$39 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "Gihanga Updates — The Creative Platform for Rwanda" },
		{
			name: "description",
			content: "Follow creators, watch reels and stories, and keep up with what's happening across Rwanda on Gihanga Updates."
		},
		{
			property: "og:title",
			content: "Gihanga Updates — The Creative Platform for Rwanda"
		},
		{
			property: "og:description",
			content: "Follow creators, watch reels and stories, and keep up with what's happening across Rwanda on Gihanga Updates."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$36, "component")
});
var $$splitComponentImporter$35 = () => import("../_-56ItHrTW.mjs");
var Route$38 = createFileRoute("/$")({
	head: () => ({ meta: [
		{ title: "Page Not Found — Gihanga Updates" },
		{
			name: "description",
			content: "This Gihanga page has moved or never existed. Head back to the feed or explore what's trending."
		},
		{
			name: "robots",
			content: "noindex"
		},
		{
			property: "og:title",
			content: "Page Not Found — Gihanga Updates"
		},
		{
			property: "og:description",
			content: "This page has moved. Jump back into the feed."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$35, "component")
});
var $$splitComponentImporter$34 = () => import("./ads-EkYbjgdu.mjs");
var Route$37 = createFileRoute("/ads")({
	head: () => ({ meta: [
		{ title: "Ad Center — Gihanga Updates" },
		{
			name: "description",
			content: "Launch campaigns, pay with Real Money or Gihanga Points, choose feed or story placement, and track impressions, clicks and reach across Rwanda."
		},
		{
			property: "og:title",
			content: "Ad Center — Gihanga Updates"
		},
		{
			property: "og:description",
			content: "Create and manage promotional advertising campaigns on Gihanga Updates."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$34, "component")
});
var $$splitComponentImporter$33 = () => import("./bookmarks-gXFSrmrJ.mjs");
var Route$36 = createFileRoute("/bookmarks")({
	head: () => ({ meta: [
		{ title: "Bookmarks — Your Saved Gihanga Posts" },
		{
			name: "description",
			content: "Everything you saved on Gihanga, kept in one private collection you can revisit anytime."
		},
		{
			property: "og:title",
			content: "Bookmarks — Your Saved Gihanga Posts"
		},
		{
			property: "og:description",
			content: "Your private collection of saved Gihanga posts."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$33, "component")
});
var Drawer$1 = ({ shouldScaleBackground = true, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer.Root, {
	shouldScaleBackground,
	...props
});
Drawer$1.displayName = "Drawer";
Drawer.Trigger;
var DrawerPortal = Drawer.Portal;
Drawer.Close;
var DrawerOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer.Overlay, {
	ref,
	className: cn("fixed inset-0 z-50 bg-black/80", className),
	...props
}));
DrawerOverlay.displayName = Drawer.Overlay.displayName;
var DrawerContent = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DrawerPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawerOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Drawer.Content, {
	ref,
	className: cn("fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" }), children]
})] }));
DrawerContent.displayName = "DrawerContent";
var DrawerHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("grid gap-1.5 p-4 text-center sm:text-left", className),
	...props
});
DrawerHeader.displayName = "DrawerHeader";
var DrawerFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("mt-auto flex flex-col gap-2 p-4", className),
	...props
});
DrawerFooter.displayName = "DrawerFooter";
var DrawerTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer.Title, {
	ref,
	className: cn("text-lg font-semibold leading-none tracking-tight", className),
	...props
}));
DrawerTitle.displayName = Drawer.Title.displayName;
var DrawerDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer.Description, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
DrawerDescription.displayName = Drawer.Description.displayName;
var MOBILE_BREAKPOINT = 768;
function useIsMobile() {
	const [isMobile, setIsMobile] = import_react.useState(void 0);
	import_react.useEffect(() => {
		const mql = window.matchMedia(`(max-width: 767px)`);
		const onChange = () => {
			setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
		};
		mql.addEventListener("change", onChange);
		setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
		return () => mql.removeEventListener("change", onChange);
	}, []);
	return !!isMobile;
}
var sizes = {
	xs: "h-7 w-7 text-[10px]",
	sm: "h-9 w-9 text-xs",
	md: "h-11 w-11 text-sm",
	lg: "h-16 w-16 text-lg",
	xl: "h-24 w-24 text-2xl"
};
function initials(name) {
	if (!name) return "GU";
	return name.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}
function GAvatar({ user, size = "md", ring, className }) {
	const resolvedUrl = user?.avatarUrl ? mediaUrl(user.avatarUrl) : void 0;
	const inner = resolvedUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: resolvedUrl,
		alt: user.name || "User avatar",
		loading: "lazy",
		className: cn("shrink-0 rounded-full object-cover object-center select-none overflow-hidden aspect-square", sizes[size], className)
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("grid shrink-0 place-items-center rounded-full font-display font-bold text-primary-foreground select-none aspect-square", sizes[size], className),
		style: { backgroundImage: `linear-gradient(140deg, oklch(0.5 0.11 ${user?.avatarHue ?? 250}), oklch(0.74 0.1 ${(user?.avatarHue ?? 250) + 24}))` },
		"aria-hidden": true,
		children: initials(user?.name || "")
	});
	if (!ring || ring === "none") return inner;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("grid place-items-center rounded-full p-[2.5px] shrink-0", ring === "story" && "story-ring", ring === "add" && "story-ring-add", ring === "live" && "bg-danger", ring === "seen" && "bg-border-strong"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "rounded-full bg-surface p-[2px] shrink-0 flex items-center justify-center",
			children: inner
		})
	});
}
function VerifiedBadge({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, {
		className: cn("size-4 shrink-0 fill-info text-info-foreground", className),
		"aria-label": "Verified account"
	});
}
function UserName({ user, className, showHandle }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("flex min-w-0 items-center gap-1", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "truncate font-semibold",
				children: user.name
			}),
			user.verified && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VerifiedBadge, {}),
			showHandle && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "truncate text-sm text-muted-foreground",
				children: ["@", user.username]
			})
		]
	});
}
var IMAGE_TYPES = /* @__PURE__ */ new Set([
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/gif"
]);
var VIDEO_TYPES = /* @__PURE__ */ new Set([
	"video/mp4",
	"video/webm",
	"video/quicktime"
]);
var MAX_IMAGE_BYTES = 15728640;
var MAX_VIDEO_BYTES = 209715200;
function validateFile(file, accept, maxDuration) {
	const isImage = IMAGE_TYPES.has(file.type);
	const isVideo = VIDEO_TYPES.has(file.type);
	if (!isImage && !isVideo) return `"${file.name}" is not a supported format. Use JPG, PNG, WEBP, MP4, or MOV.`;
	if (accept === "images" && !isImage) return `"${file.name}" is not an image. Please select a photo.`;
	if (accept === "videos" && !isVideo) return `"${file.name}" is not a video. Please select a video file.`;
	const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
	if (file.size > maxBytes) {
		const maxMB = Math.round(maxBytes / 1024 / 1024);
		return `"${file.name}" is too large (max ${maxMB}MB).`;
	}
	return null;
}
function createMediaFile(file) {
	return {
		id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
		file,
		previewUrl: URL.createObjectURL(file),
		isVideo: file.type.startsWith("video/")
	};
}
function MediaPicker({ accept = "all", multiple = false, maxFiles = 10, maxDurationSeconds, files, onChange, className, compact = false }) {
	const fileInputRef = (0, import_react.useRef)(null);
	const [isDragging, setIsDragging] = (0, import_react.useState)(false);
	const dragCounter = (0, import_react.useRef)(0);
	const acceptAttr = accept === "images" ? "image/jpeg,image/png,image/webp,image/gif" : accept === "videos" ? "video/mp4,video/webm,video/quicktime" : "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime";
	const processFiles = (0, import_react.useCallback)(async (incoming) => {
		const newFiles = [];
		const arr = Array.from(incoming);
		for (const file of arr) {
			if (files.length + newFiles.length >= maxFiles) {
				toast.error(`You can add up to ${maxFiles} items`);
				break;
			}
			const error = validateFile(file, accept);
			if (error) {
				toast.error(error);
				continue;
			}
			const mediaFile = createMediaFile(file);
			if (mediaFile.isVideo && maxDurationSeconds) {
				const duration = await getVideoDuration(file);
				if (duration > maxDurationSeconds) {
					toast.error(`"${file.name}" is ${Math.round(duration)}s — max ${maxDurationSeconds}s`);
					URL.revokeObjectURL(mediaFile.previewUrl);
					continue;
				}
				mediaFile.duration = duration;
			} else if (mediaFile.isVideo) mediaFile.duration = await getVideoDuration(file);
			newFiles.push(mediaFile);
		}
		if (newFiles.length > 0) {
			if (multiple) onChange([...files, ...newFiles]);
			else {
				files.forEach((f) => URL.revokeObjectURL(f.previewUrl));
				onChange(newFiles.slice(0, 1));
			}
		}
	}, [
		files,
		onChange,
		accept,
		multiple,
		maxFiles,
		maxDurationSeconds
	]);
	const handleDragEnter = (e) => {
		e.preventDefault();
		dragCounter.current++;
		setIsDragging(true);
	};
	const handleDragLeave = (e) => {
		e.preventDefault();
		dragCounter.current--;
		if (dragCounter.current === 0) setIsDragging(false);
	};
	const handleDrop = (e) => {
		e.preventDefault();
		dragCounter.current = 0;
		setIsDragging(false);
		if (e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files);
	};
	const handleFileInput = (e) => {
		if (e.target.files && e.target.files.length > 0) processFiles(e.target.files);
		e.target.value = "";
	};
	if (compact || files.length > 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		ref: fileInputRef,
		type: "file",
		accept: acceptAttr,
		multiple,
		className: "hidden",
		onChange: handleFileInput
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		type: "button",
		variant: "outline",
		className: cn("justify-start gap-2", className),
		onClick: () => fileInputRef.current?.click(),
		children: [accept === "videos" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { className: "size-4 text-accent" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image$1, { className: "size-4 text-info" }), files.length > 0 ? multiple ? "Add more media" : "Change media" : accept === "videos" ? "Choose a video" : "Choose photo or video"]
	})] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		ref: fileInputRef,
		type: "file",
		accept: acceptAttr,
		multiple,
		className: "hidden",
		onChange: handleFileInput
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
		onDragEnter: handleDragEnter,
		onDragOver: (e) => e.preventDefault(),
		onDragLeave: handleDragLeave,
		onDrop: handleDrop,
		onClick: () => fileInputRef.current?.click(),
		className: cn("relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-8 transition-colors", isDragging ? "border-primary bg-primary-soft/50" : "border-border hover:border-primary/50 hover:bg-muted/50", className),
		whileHover: { scale: 1.005 },
		whileTap: { scale: .995 },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("grid size-14 place-items-center rounded-2xl transition-colors", isDragging ? "bg-primary/20" : "bg-primary-soft"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: cn("size-7 transition-colors", isDragging ? "text-primary" : "text-primary/70") })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-bold text-foreground",
					children: isDragging ? "Drop your files here" : "Drag & drop or click to browse"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-muted-foreground",
					children: accept === "videos" ? "MP4, MOV • Max 200MB" : accept === "images" ? "JPG, PNG, WEBP • Max 15MB" : "Photos & Videos • JPG, PNG, WEBP, MP4, MOV"
				}),
				multiple && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-0.5 text-xs text-muted-foreground",
					children: [
						"Up to ",
						maxFiles,
						" files"
					]
				})
			]
		})]
	})] });
}
function getVideoDuration(file) {
	return new Promise((resolve) => {
		const video = document.createElement("video");
		video.preload = "metadata";
		const url = URL.createObjectURL(file);
		video.onloadedmetadata = () => {
			resolve(video.duration);
			URL.revokeObjectURL(url);
		};
		video.onerror = () => {
			resolve(0);
			URL.revokeObjectURL(url);
		};
		video.src = url;
	});
}
function MediaPreview({ files, selectedIndex, onSelect, onRemove, onReorder, className }) {
	if (files.length === 0) return null;
	const active = files[selectedIndex] ?? files[0] ?? {};
	const moveLeft = (index, e) => {
		e.stopPropagation();
		if (index === 0 || !onReorder) return;
		const next = [...files];
		const temp = next[index - 1];
		const cur = next[index];
		if (temp === void 0 || cur === void 0) return;
		next[index - 1] = cur;
		next[index] = temp;
		onReorder(next);
		if (selectedIndex === index) onSelect(index - 1);
		else if (selectedIndex === index - 1) onSelect(index);
	};
	const moveRight = (index, e) => {
		e.stopPropagation();
		if (index === files.length - 1 || !onReorder) return;
		const next = [...files];
		const temp = next[index + 1];
		const cur = next[index];
		if (temp === void 0 || cur === void 0) return;
		next[index + 1] = cur;
		next[index] = temp;
		onReorder(next);
		if (selectedIndex === index) onSelect(index + 1);
		else if (selectedIndex === index + 1) onSelect(index);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex flex-col gap-3", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative aspect-square w-full overflow-hidden rounded-2xl bg-black/90 shadow-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, {
					mode: "wait",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
						initial: { opacity: 0 },
						animate: { opacity: 1 },
						exit: { opacity: 0 },
						transition: { duration: .15 },
						className: "flex h-full w-full items-center justify-center",
						children: active.isVideo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
							src: active.previewUrl,
							controls: true,
							playsInline: true,
							className: "max-h-full max-w-full object-contain"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: active.previewUrl,
							alt: "Media preview",
							className: "max-h-full max-w-full object-contain"
						})
					}, active.id)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "Remove item",
					onClick: () => onRemove(selectedIndex),
					className: "press absolute top-3 right-3 grid size-9 place-items-center rounded-full bg-black/60 text-white backdrop-blur-md transition-colors hover:bg-black/80",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
				}),
				files.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute top-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white backdrop-blur-md",
					children: [
						selectedIndex + 1,
						" / ",
						files.length
					]
				})
			]
		}), files.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex gap-2 overflow-x-auto pb-1 no-scrollbar",
			children: files.map((file, idx) => {
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					onClick: () => onSelect(idx),
					className: cn("group relative size-16 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 transition-all", idx === selectedIndex ? "border-primary ring-2 ring-primary/30" : "border-transparent opacity-70 hover:opacity-100"),
					children: [file.isVideo ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative h-full w-full bg-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
							src: file.previewUrl,
							className: "h-full w-full object-cover"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute inset-0 grid place-items-center bg-black/30",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { className: "size-4 text-white" })
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: file.previewUrl,
						alt: "",
						className: "h-full w-full object-cover"
					}), onReorder && files.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/70 p-0.5 opacity-0 transition-opacity group-hover:opacity-100",
						children: [idx > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: (e) => moveLeft(idx, e),
							className: "rounded p-0.5 text-white hover:bg-white/20",
							title: "Move left",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoveLeft, { className: "size-3" })
						}), idx < files.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: (e) => moveRight(idx, e),
							className: "ml-auto rounded p-0.5 text-white hover:bg-white/20",
							title: "Move right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoveRight, { className: "size-3" })
						})]
					})]
				}, file.id);
			})
		})]
	});
}
var Slider = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Slider$1, {
	ref,
	className: cn("relative flex w-full touch-none select-none items-center", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderTrack, {
		className: "relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderRange, { className: "absolute h-full bg-primary" })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderThumb, { className: "block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" })]
}));
Slider.displayName = Slider$1.displayName;
function MediaEditor({ file, onSave, onCancel }) {
	const [rotation, setRotation] = (0, import_react.useState)(0);
	const [zoom, setZoom] = (0, import_react.useState)(1);
	const [aspectRatio, setAspectRatio] = (0, import_react.useState)("original");
	const [isProcessing, setIsProcessing] = (0, import_react.useState)(false);
	if (file.isVideo) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center justify-center p-6 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Video editing (crop/rotate) is only supported for photos."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "outline",
			className: "mt-4",
			onClick: onCancel,
			children: "Back"
		})]
	});
	const rotate = () => {
		setRotation((prev) => (prev + 90) % 360);
	};
	const handleApply = async () => {
		setIsProcessing(true);
		try {
			const editedBlob = await renderEditedImage(file.previewUrl, rotation, zoom, aspectRatio);
			const newFile = new File([editedBlob], file.file.name, { type: "image/jpeg" });
			const newPreview = URL.createObjectURL(newFile);
			onSave({
				...file,
				file: newFile,
				previewUrl: newPreview
			});
		} catch (err) {
			console.error("Failed to process edited image", err);
		} finally {
			setIsProcessing(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative aspect-square w-full overflow-hidden rounded-2xl bg-black/90 flex items-center justify-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative transition-transform duration-200 ease-out flex items-center justify-center",
					style: { transform: `rotate(${rotation}deg) scale(${zoom})` },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: file.previewUrl,
						alt: "Editing target",
						className: "max-h-[320px] max-w-full object-contain"
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center justify-center gap-2",
				children: [
					"original",
					"1:1",
					"4:5",
					"16:9"
				].map((ratio) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setAspectRatio(ratio),
					className: cn("rounded-lg px-3 py-1.5 text-xs font-semibold press", aspectRatio === ratio ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"),
					children: ratio.toUpperCase()
				}, ratio))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 rounded-2xl bg-surface p-4 border border-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs font-bold text-muted-foreground flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoomIn, { className: "size-4" }), " Zoom"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs font-medium text-muted-foreground",
							children: [Math.round(zoom * 100), "%"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
						value: [zoom],
						min: 1,
						max: 3,
						step: .05,
						onValueChange: (vals) => {
							const val = vals[0];
							if (val !== void 0) setZoom(val);
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between pt-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "outline",
							size: "sm",
							onClick: rotate,
							className: "gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCw, { className: "size-4" }), "Rotate 90°"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							size: "sm",
							onClick: () => {
								setRotation(0);
								setZoom(1);
								setAspectRatio("original");
							},
							className: "text-xs text-muted-foreground",
							children: "Reset"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-end gap-2 pt-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					onClick: onCancel,
					disabled: isProcessing,
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "brand",
					onClick: handleApply,
					disabled: isProcessing,
					children: [isProcessing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }), "Apply Changes"]
				})]
			})
		]
	});
}
function renderEditedImage(imageSrc, rotation, zoom, aspectRatio) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => {
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");
			if (!ctx) return reject("No 2d context");
			let width = img.width;
			let height = img.height;
			if (aspectRatio === "1:1") {
				const side = Math.min(width, height);
				width = side;
				height = side;
			} else if (aspectRatio === "4:5") {
				if (width / height > 4 / 5) width = height * (4 / 5);
				else height = width * (5 / 4);
			} else if (aspectRatio === "16:9") {
				if (width / height > 16 / 9) width = height * (16 / 9);
				else height = width * (9 / 16);
			}
			canvas.width = width;
			canvas.height = height;
			ctx.save();
			ctx.translate(canvas.width / 2, canvas.height / 2);
			ctx.rotate(rotation * Math.PI / 180);
			ctx.scale(zoom, zoom);
			ctx.drawImage(img, -img.width / 2, -img.height / 2);
			ctx.restore();
			canvas.toBlob((blob) => {
				if (blob) resolve(blob);
				else reject("Blob generation failed");
			}, "image/jpeg", .92);
		};
		img.onerror = (e) => reject(e);
		img.src = imageSrc;
	});
}
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		ref,
		...props
	});
});
Textarea.displayName = "Textarea";
function useComments(postId) {
	return useQuery({
		queryKey: ["comments", postId],
		queryFn: () => api.get(`/comments/post/${postId}`),
		enabled: Boolean(postId)
	});
}
function useCreateComment(postId) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input) => api.post(`/comments/post/${postId}`, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["comments", postId] });
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		}
	});
}
function useToggleCommentLike(postId) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (commentId) => api.post(`/likes/comment/${commentId}`),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["comments", postId] })
	});
}
function useFollowingSet() {
	const { user } = useAuth();
	return useQuery({
		queryKey: ["following-set"],
		queryFn: () => api.get("/follow/mine"),
		enabled: Boolean(user),
		select: (data) => new Set(data.usernames),
		staleTime: 3e4
	});
}
function useFollowUser() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ username, follow }) => follow ? api.post(`/follow/${username}`) : api.delete(`/follow/${username}`),
		onMutate: async ({ username, follow }) => {
			queryClient.setQueryData(["following-set"], (prev) => {
				const set = new Set(prev?.usernames ?? []);
				if (follow) set.add(username);
				else set.delete(username);
				return { usernames: Array.from(set) };
			});
			const entries = queryClient.getQueriesData({ queryKey: ["posts"] });
			for (const [key, data] of entries) {
				if (!data) continue;
				if (Array.isArray(data.pages)) queryClient.setQueryData(key, {
					...data,
					pages: data.pages.map((page) => ({
						...page,
						posts: page.posts.map((p) => p.author.username === username ? {
							...p,
							followingAuthor: follow
						} : p)
					}))
				});
				else if (Array.isArray(data.posts)) queryClient.setQueryData(key, {
					...data,
					posts: data.posts.map((p) => p.author.username === username ? {
						...p,
						followingAuthor: follow
					} : p)
				});
			}
			queryClient.setQueryData(["profile", username], (prev) => prev ? {
				...prev,
				user: {
					...prev.user,
					isFollowing: follow
				}
			} : prev);
		},
		onSuccess: (_data, { username }) => {
			queryClient.invalidateQueries({ queryKey: ["profile", username] });
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			queryClient.invalidateQueries({ queryKey: ["following-set"] });
			queryClient.invalidateQueries({ queryKey: ["followers"] });
			queryClient.invalidateQueries({ queryKey: ["following"] });
		},
		onError: () => {
			queryClient.invalidateQueries({ queryKey: ["following-set"] });
		}
	});
}
function useFollowers(username) {
	return useQuery({
		queryKey: ["followers", username],
		queryFn: () => api.get(`/follow/${username}/followers`),
		enabled: Boolean(username)
	});
}
function useFollowing(username) {
	return useQuery({
		queryKey: ["following", username],
		queryFn: () => api.get(`/follow/${username}/following`),
		enabled: Boolean(username)
	});
}
function useUserProfile(username) {
	return useQuery({
		queryKey: ["profile", username],
		queryFn: () => api.get(`/users/${username}`),
		enabled: Boolean(username)
	});
}
function CaptionEditor({ value, onChange, maxLength = 2200, placeholder = "Write a caption… Use #hashtags and @mentions", className }) {
	const { user } = useAuth();
	const [showEmojiPicker, setShowEmojiPicker] = (0, import_react.useState)(false);
	const [mentionQuery, setMentionQuery] = (0, import_react.useState)(null);
	const textareaRef = (0, import_react.useRef)(null);
	const { data: followingData } = useFollowing(user?.username ?? "");
	const followedUsers = followingData?.users ?? [];
	const suggestedFollowedUsers = mentionQuery !== null ? followedUsers.filter((u) => {
		const query = mentionQuery.toLowerCase();
		return u.username.toLowerCase().includes(query) || u.name.toLowerCase().includes(query);
	}) : [];
	const handleTextChange = (e) => {
		const val = e.target.value;
		onChange(val);
		const cursorPos = e.target.selectionStart;
		const mentionMatch = val.slice(0, cursorPos).match(/@(\w*)$/);
		if (mentionMatch && mentionMatch[1] !== void 0) setMentionQuery(mentionMatch[1]);
		else setMentionQuery(null);
	};
	const insertMention = (username) => {
		if (!textareaRef.current) return;
		const cursorPos = textareaRef.current.selectionStart;
		const textBeforeCursor = value.slice(0, cursorPos);
		const textAfterCursor = value.slice(cursorPos);
		onChange(textBeforeCursor.replace(/@\w*$/, `@${username} `) + textAfterCursor);
		setMentionQuery(null);
		textareaRef.current.focus();
	};
	const insertEmoji = (emoji) => {
		if (!textareaRef.current) return;
		const cursorPos = textareaRef.current.selectionStart;
		const textBeforeCursor = value.slice(0, cursorPos);
		const textAfterCursor = value.slice(cursorPos);
		onChange(textBeforeCursor + emoji + textAfterCursor);
		textareaRef.current.focus();
	};
	const insertHashtagSymbol = () => {
		if (!textareaRef.current) return;
		const cursorPos = textareaRef.current.selectionStart;
		const textBefore = value.slice(0, cursorPos);
		const textAfter = value.slice(cursorPos);
		onChange(textBefore + (textBefore.length > 0 && !textBefore.endsWith(" ") ? " #" : "#") + textAfter);
		textareaRef.current.focus();
	};
	const tags = Array.from(value.matchAll(/#(\w+)/g)).map((m) => m[1]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative flex flex-col gap-2", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					ref: textareaRef,
					value,
					onChange: handleTextChange,
					maxLength,
					placeholder,
					className: "min-h-[120px] resize-none border-0 bg-transparent p-0 text-[15px] leading-relaxed shadow-none focus-visible:ring-0"
				}), mentionQuery !== null && suggestedFollowedUsers.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute left-0 bottom-full z-50 mb-2 max-h-48 w-64 overflow-y-auto rounded-2xl border border-border bg-popover p-1.5 shadow-float no-scrollbar",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-2 py-1 text-[11px] font-bold text-muted-foreground uppercase",
						children: "People you follow"
					}), suggestedFollowedUsers.slice(0, 6).map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => insertMention(u.username),
						className: "press flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left text-xs hover:bg-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GAvatar, {
							user: u,
							size: "xs"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate font-bold text-foreground",
								children: u.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "truncate text-muted-foreground",
								children: ["@", u.username]
							})]
						})]
					}, u._id))]
				})]
			}),
			tags.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-1.5 pt-1",
				children: tags.map((t, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "rounded-md bg-primary-soft px-2 py-0.5 text-xs font-bold text-primary",
					children: ["#", t]
				}, `${t}_${idx}`))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between pt-2 border-t border-border/60",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: insertHashtagSymbol,
							className: "press flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hash, { className: "size-3.5 text-primary" }), "Hashtag"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								if (!textareaRef.current) return;
								const pos = textareaRef.current.selectionStart;
								onChange(value.slice(0, pos) + "@" + value.slice(pos));
								setMentionQuery("");
								textareaRef.current.focus();
							},
							className: "press flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AtSign, { className: "size-3.5 text-accent" }), "Mention"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setShowEmojiPicker((prev) => !prev),
							className: "press flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smile, { className: "size-3.5 text-warning" }), "Emoji"]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: cn("text-xs font-medium", value.length > maxLength * .9 ? "text-danger" : "text-muted-foreground"),
					children: [
						value.length,
						"/",
						maxLength
					]
				})]
			}),
			showEmojiPicker && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "w-full overflow-hidden rounded-2xl border border-border shadow-float mt-2 bg-popover z-40",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmojiPicker$1, {
					theme: Theme.DARK,
					width: "100%",
					height: 300,
					lazyLoadEmojis: true,
					searchPlaceHolder: "Search emoji...",
					onEmojiClick: (emojiData) => {
						insertEmoji(emojiData.emoji);
						setShowEmojiPicker(false);
					}
				})
			})
		]
	});
}
var AUDIENCES = [
	{
		id: "public",
		label: "Everyone",
		description: "Anyone on or off Gihanga",
		icon: Earth
	},
	{
		id: "followers",
		label: "Followers",
		description: "Only your confirmed followers",
		icon: Users
	},
	{
		id: "private",
		label: "Only me",
		description: "Visible only to you",
		icon: Lock
	}
];
function AudienceSelector({ value, onChange, compact = true, className }) {
	if (compact) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex items-center gap-1", className),
		children: AUDIENCES.map((a) => {
			const Icon = a.icon;
			const isSelected = value === a.id;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => onChange(a.id),
				className: cn("press flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors", isSelected ? "bg-primary-soft text-primary font-bold" : "text-muted-foreground hover:bg-muted"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3.5" }), a.label]
			}, a.id);
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex flex-col gap-2", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-bold text-muted-foreground uppercase",
			children: "Audience"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-2",
			children: AUDIENCES.map((a) => {
				const Icon = a.icon;
				const isSelected = value === a.id;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => onChange(a.id),
					className: cn("press flex items-center gap-3 rounded-2xl border p-3 text-left transition-all", isSelected ? "border-primary bg-primary-soft/30 text-foreground" : "border-border hover:bg-muted"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: cn("grid size-9 place-items-center rounded-xl", isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-bold",
							children: a.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: a.description
						})]
					})]
				}, a.id);
			})
		})]
	});
}
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		ref,
		...props
	});
});
Input.displayName = "Input";
var POPULAR_LOCATIONS = [
	"Kigali, Rwanda",
	"Musanze, Rwanda",
	"Rubavu, Rwanda",
	"Huye, Rwanda",
	"Nyamata, Rwanda",
	"Gisenyi, Rwanda",
	"Online / Global"
];
function LocationInput({ value, onChange, className }) {
	const [showSuggestions, setShowSuggestions] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative flex flex-col gap-2", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative flex items-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "absolute left-3 size-4 text-success" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value,
					onChange: (e) => onChange(e.target.value),
					onFocus: () => setShowSuggestions(true),
					onBlur: () => setTimeout(() => setShowSuggestions(false), 200),
					placeholder: "Add location (e.g. Kigali, Rwanda)",
					className: "h-10 pl-9 pr-8 text-sm"
				}),
				value && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => onChange(""),
					className: "absolute right-3 text-muted-foreground hover:text-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
				})
			]
		}), showSuggestions && !value && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute top-full left-0 z-50 mt-1 max-h-40 w-full overflow-y-auto rounded-xl border border-border bg-popover p-1.5 shadow-float no-scrollbar",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase",
				children: "Popular Places"
			}), POPULAR_LOCATIONS.map((loc) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => {
					onChange(loc);
					setShowSuggestions(false);
				},
				className: "press flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-foreground hover:bg-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3 text-success" }), loc]
			}, loc))]
		})]
	});
}
function useSearch$1(query) {
	return useQuery({
		queryKey: ["search", query],
		queryFn: () => api.get(`/search?q=${encodeURIComponent(query)}`),
		enabled: query.trim().length > 0
	});
}
function useTrendingTags() {
	return useQuery({
		queryKey: ["trending-tags"],
		queryFn: () => api.get("/search/trending")
	});
}
function useSuggestedUsers() {
	return useQuery({
		queryKey: ["suggested-users"],
		queryFn: () => api.get("/users/suggested")
	});
}
function TagPeopleInput({ taggedUsers, onChange, className }) {
	const [query, setQuery] = (0, import_react.useState)("");
	const [isOpen, setIsOpen] = (0, import_react.useState)(false);
	const { data: searchResults } = useSearch$1(query);
	const addTag = (username) => {
		if (!taggedUsers.includes(username)) onChange([...taggedUsers, username]);
		setQuery("");
		setIsOpen(false);
	};
	const removeTag = (username) => {
		onChange(taggedUsers.filter((u) => u !== username));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative flex flex-col gap-2", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative flex items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "absolute left-3 size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: query,
					onChange: (e) => {
						setQuery(e.target.value);
						setIsOpen(true);
					},
					onFocus: () => setIsOpen(true),
					placeholder: "Tag people by @username",
					className: "h-10 pl-9 text-sm"
				})]
			}),
			isOpen && query.trim().length > 0 && searchResults?.users && searchResults.users.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute top-full left-0 z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-2xl border border-border bg-popover p-1.5 shadow-float no-scrollbar",
				children: searchResults.users.map((user) => {
					const isAlreadyTagged = taggedUsers.includes(user.username);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						disabled: isAlreadyTagged,
						onClick: () => addTag(user.username),
						className: cn("press flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left text-xs hover:bg-muted", isAlreadyTagged && "opacity-50"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GAvatar, {
								user,
								size: "xs"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate font-bold text-foreground",
									children: user.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "truncate text-muted-foreground",
									children: ["@", user.username]
								})]
							}),
							isAlreadyTagged && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] text-muted-foreground",
								children: "Tagged"
							})
						]
					}, user._id);
				})
			}),
			taggedUsers.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-1.5 pt-1",
				children: taggedUsers.map((username) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground",
					children: [
						"@",
						username,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => removeTag(username),
							className: "hover:text-danger",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3" })
						})
					]
				}, username))
			})
		]
	});
}
function PostPreview({ user, caption, files, location, audience, onEdit, onPublish, isPublishing }) {
	const [activeMediaIndex, setActiveMediaIndex] = (0, import_react.useState)(0);
	const AudienceIcon = audience === "public" ? Earth : audience === "followers" ? Users : Lock;
	const currentMedia = files[activeMediaIndex];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-base font-bold",
					children: "Feed Preview"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary",
					children: "Preview Mode"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface-card overflow-hidden border border-border bg-card",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between p-4 border-b border-border/40",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GAvatar, {
								user,
								size: "md"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm font-bold text-foreground",
									children: user.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs text-muted-foreground",
									children: ["@", user.username]
								})]
							}), location && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1 text-xs text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3 text-success" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: location })]
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1 rounded-lg bg-muted px-2 py-1 text-[11px] font-semibold text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AudienceIcon, { className: "size-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "capitalize",
								children: audience
							})]
						})]
					}),
					files.length > 0 && currentMedia && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative aspect-square w-full bg-black flex items-center justify-center",
						children: [currentMedia.isVideo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
							src: currentMedia.previewUrl,
							controls: true,
							className: "max-h-full max-w-full object-contain"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: currentMedia.previewUrl,
							alt: "Post preview media",
							className: "max-h-full max-w-full object-contain"
						}), files.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							activeMediaIndex > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setActiveMediaIndex((prev) => prev - 1),
								className: "press absolute left-2 top-1/2 -translate-y-1/2 grid size-8 place-items-center rounded-full bg-black/60 text-white",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-5" })
							}),
							activeMediaIndex < files.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setActiveMediaIndex((prev) => prev + 1),
								className: "press absolute right-2 top-1/2 -translate-y-1/2 grid size-8 place-items-center rounded-full bg-black/60 text-white",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 rounded-full bg-black/50 px-2 py-1",
								children: files.map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `size-1.5 rounded-full transition-all ${i === activeMediaIndex ? "bg-white w-3" : "bg-white/50"}` }, i))
							})
						] })]
					}),
					caption.trim() && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-bold mr-1.5",
							children: user.username
						}), caption]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-4 px-4 py-3 border-t border-border/40 text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-5" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-5" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-5" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-auto text-xs font-semibold",
								children: "Just now"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between pt-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: onEdit,
					disabled: isPublishing,
					children: "Back to Edit"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "brand",
					onClick: onPublish,
					disabled: isPublishing,
					children: "Publish Post"
				})]
			})
		]
	});
}
var stageConfig = {
	preparing: {
		label: "Preparing media…",
		color: "text-info"
	},
	uploading: {
		label: "Uploading…",
		color: "text-primary"
	},
	processing: {
		label: "Processing…",
		sublabel: "This may take a moment for large files",
		color: "text-accent"
	},
	publishing: {
		label: "Publishing…",
		color: "text-primary"
	},
	completed: {
		label: "Published!",
		color: "text-success"
	},
	failed: {
		label: "Something went wrong",
		color: "text-danger"
	}
};
function UploadProgress({ stage, progress, error, onRetry, onCancel, onDone }) {
	const config = stageConfig[stage];
	const isActive = stage !== "completed" && stage !== "failed";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		exit: { opacity: 0 },
		className: "fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			initial: {
				scale: .92,
				opacity: 0
			},
			animate: {
				scale: 1,
				opacity: 1
			},
			transition: {
				type: "spring",
				damping: 25,
				stiffness: 350
			},
			className: "mx-4 flex w-full max-w-[360px] flex-col items-center gap-5 rounded-3xl border border-border bg-card p-8 shadow-float",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("grid size-16 place-items-center rounded-2xl", stage === "completed" && "bg-success/15", stage === "failed" && "bg-danger/15", isActive && "bg-primary-soft"),
					children: stage === "completed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
						initial: { scale: 0 },
						animate: { scale: 1 },
						transition: {
							type: "spring",
							damping: 12
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
							className: "size-8 text-success",
							strokeWidth: 3
						})
					}) : stage === "failed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-8 text-danger" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-8 animate-spin text-primary" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: cn("text-base font-bold", config.color),
							children: config.label
						}),
						config.sublabel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted-foreground",
							children: config.sublabel
						}),
						error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-danger",
							children: error
						})
					]
				}),
				stage === "uploading" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-2 overflow-hidden rounded-full bg-elevated",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
							className: "h-full rounded-full bg-primary",
							initial: { width: 0 },
							animate: { width: `${progress}%` },
							transition: {
								ease: "easeOut",
								duration: .3
							}
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1.5 text-center text-xs font-semibold text-muted-foreground",
						children: [progress, "%"]
					})]
				}),
				isActive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center gap-2",
					children: [
						"preparing",
						"uploading",
						"processing",
						"publishing"
					].map((s, i) => {
						const currentIdx = [
							"preparing",
							"uploading",
							"processing",
							"publishing"
						].indexOf(stage);
						const thisIdx = i;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("size-2 rounded-full transition-all duration-300", thisIdx < currentIdx && "bg-primary", thisIdx === currentIdx && "bg-primary scale-125", thisIdx > currentIdx && "bg-muted") }, s);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex w-full gap-2",
					children: [
						stage === "failed" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [onCancel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							className: "flex-1",
							onClick: onCancel,
							children: "Cancel"
						}), onRetry && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "brand",
							className: "flex-1",
							onClick: onRetry,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4" }), "Retry"]
						})] }),
						stage === "completed" && onDone && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "brand",
							className: "w-full",
							onClick: onDone,
							children: "Done"
						}),
						isActive && onCancel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							className: "mx-auto text-muted-foreground",
							onClick: onCancel,
							children: "Cancel"
						})
					]
				})
			]
		})
	});
}
var AlertDialog = Root2;
var AlertDialogPortal = Portal2;
var AlertDialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlay2, {
	className: cn("fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props,
	ref
}));
AlertDialogOverlay.displayName = Overlay2.displayName;
var AlertDialogContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	className: cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg", className),
	...props
})] }));
AlertDialogContent.displayName = Content2.displayName;
var AlertDialogHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-2 text-center sm:text-left", className),
	...props
});
AlertDialogHeader.displayName = "AlertDialogHeader";
var AlertDialogFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
AlertDialogFooter.displayName = "AlertDialogFooter";
var AlertDialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Title2, {
	ref,
	className: cn("text-lg font-semibold", className),
	...props
}));
AlertDialogTitle.displayName = Title2.displayName;
var AlertDialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Description2, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
AlertDialogDescription.displayName = Description2.displayName;
var AlertDialogAction = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
	ref,
	className: cn(buttonVariants(), className),
	...props
}));
AlertDialogAction.displayName = Action.displayName;
var AlertDialogCancel = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cancel, {
	ref,
	className: cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className),
	...props
}));
AlertDialogCancel.displayName = Cancel.displayName;
function UnsavedChangesGuard({ open, onSaveDraft, onDiscard, onContinue }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
		open,
		onOpenChange: (o) => !o && onContinue(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, {
			className: "max-w-[340px] rounded-3xl border-border bg-card p-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, {
				className: "text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, {
					className: "font-display text-lg font-extrabold tracking-tight",
					children: "Leave without saving?"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, {
					className: "text-sm text-muted-foreground",
					children: "You have unsaved changes. Would you like to save them as a draft?"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-col gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "brand",
						className: "w-full",
						onClick: onSaveDraft,
						children: "Save Draft"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						className: "w-full text-danger hover:bg-danger/10 hover:text-danger",
						onClick: onDiscard,
						children: "Discard"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							className: "w-full",
							onClick: onContinue,
							children: "Continue Editing"
						})
					})
				]
			})]
		})
	});
}
var STORAGE_KEY = "gihanga_drafts";
function generateId() {
	return `draft_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function readAll() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		return JSON.parse(raw);
	} catch {
		return [];
	}
}
function writeAll(drafts) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
	} catch {}
}
function saveDraft(data, existingId) {
	const drafts = readAll();
	const now = Date.now();
	if (existingId) {
		const idx = drafts.findIndex((d) => d.id === existingId);
		if (idx >= 0) {
			const existing = drafts[idx];
			if (existing) drafts[idx] = {
				...existing,
				data,
				updatedAt: now
			};
			writeAll(drafts);
			return existingId;
		}
	}
	const id = generateId();
	drafts.unshift({
		id,
		data,
		createdAt: now,
		updatedAt: now
	});
	if (drafts.length > 20) drafts.length = 20;
	writeAll(drafts);
	return id;
}
var DropdownMenu = Root2$1;
var DropdownMenuTrigger = Trigger;
var DropdownMenuSubTrigger = import_react.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SubTrigger2, {
	ref,
	className: cn("flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", inset && "pl-8", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "ml-auto" })]
}));
DropdownMenuSubTrigger.displayName = SubTrigger2.displayName;
var DropdownMenuSubContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubContent2, {
	ref,
	className: cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)", className),
	...props
}));
DropdownMenuSubContent.displayName = SubContent2.displayName;
var DropdownMenuContent = import_react.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal2$1, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2$1, {
	ref,
	sideOffset,
	className: cn("z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)", className),
	...props
}) }));
DropdownMenuContent.displayName = Content2$1.displayName;
var DropdownMenuItem = import_react.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0", inset && "pl-8", className),
	...props
}));
DropdownMenuItem.displayName = Item2.displayName;
var DropdownMenuCheckboxItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CheckboxItem2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }) })
	}), children]
}));
DropdownMenuCheckboxItem.displayName = CheckboxItem2.displayName;
var DropdownMenuRadioItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RadioItem2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: "h-2 w-2 fill-current" }) })
	}), children]
}));
DropdownMenuRadioItem.displayName = RadioItem2.displayName;
var DropdownMenuLabel = import_react.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label2, {
	ref,
	className: cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className),
	...props
}));
DropdownMenuLabel.displayName = Label2.displayName;
var DropdownMenuSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator2, {
	ref,
	className: cn("-mx-1 my-1 h-px bg-muted", className),
	...props
}));
DropdownMenuSeparator.displayName = Separator2.displayName;
var DropdownMenuShortcut = ({ className, ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("ml-auto text-xs tracking-widest opacity-60", className),
		...props
	});
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";
function useSessionUser() {
	const { user: authUser, loading, signOutConsumer } = useAuth();
	return {
		ready: !loading,
		signOut: signOutConsumer,
		user: authUser ? {
			id: authUser.id,
			name: authUser.name,
			username: authUser.username,
			bio: authUser.bio,
			avatarHue: authUser.avatarHue,
			avatarUrl: authUser.avatarUrl,
			creator: authUser.isCreator ?? false,
			verified: authUser.verified ?? false,
			live: authUser.isLive ?? false,
			followers: authUser.followersCount ?? 0,
			following: authUser.followingCount ?? 0,
			posts: authUser.postsCount ?? 0
		} : null
	};
}
function AccountMenu({ compact }) {
	const navigate = useNavigate();
	const { user, ready, signOut } = useSessionUser();
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "size-9 rounded-full bg-muted",
		"aria-hidden": true
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		variant: "brand",
		size: compact ? "pill" : "default",
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/welcome",
			children: "Sign in"
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			"aria-label": "Your account",
			className: "press",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GAvatar, {
				user,
				size: "sm",
				ring: "story"
			})
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
		align: "end",
		className: "w-56",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuLabel, {
				className: "leading-tight",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block truncate",
					children: user.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "block truncate text-xs font-normal text-muted-foreground",
					children: ["@", user.username]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/profile/$username",
					params: { username: user.username },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, {}), "Your profile"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/settings",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, {}), "Settings"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				onClick: () => {
					signOut();
					toast("Signed out");
					navigate({ to: "/welcome" });
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, {}), "Sign out"]
			})
		]
	})] });
}
function useCursoredPosts(key, endpoint, enabled = true) {
	return useInfiniteQuery({
		queryKey: ["posts", key],
		queryFn: ({ pageParam }) => api.get(`${endpoint}${pageParam ? `?before=${encodeURIComponent(pageParam)}` : ""}`),
		initialPageParam: void 0,
		getNextPageParam: (last) => last.nextCursor ?? void 0,
		enabled
	});
}
function useFeed() {
	const { user } = useAuth();
	return useInfiniteQuery({
		queryKey: [
			"posts",
			"feed",
			user?.id
		],
		queryFn: ({ pageParam }) => api.get(`/recommendations/for-you?limit=12${pageParam ? `&cursor=${encodeURIComponent(pageParam)}` : ""}`),
		initialPageParam: void 0,
		getNextPageParam: (last) => last.nextCursor ?? void 0,
		enabled: Boolean(user)
	});
}
function useExplore() {
	const { user } = useAuth();
	return useInfiniteQuery({
		queryKey: [
			"posts",
			"explore",
			user?.id
		],
		queryFn: ({ pageParam }) => api.get(`/recommendations/explore?limit=12${pageParam ? `&cursor=${encodeURIComponent(pageParam)}` : ""}`),
		initialPageParam: void 0,
		getNextPageParam: (last) => last.nextCursor ?? void 0
	});
}
function useReelsFeed() {
	const { user } = useAuth();
	return useInfiniteQuery({
		queryKey: [
			"posts",
			"reels",
			user?.id
		],
		queryFn: ({ pageParam }) => api.get(`/recommendations/reels?limit=10${pageParam ? `&cursor=${encodeURIComponent(pageParam)}` : ""}`),
		initialPageParam: void 0,
		getNextPageParam: (last) => last.nextCursor ?? void 0
	});
}
function useTagPosts(tag) {
	const query = useCursoredPosts(`tag:${tag}`, `/posts/tag/${encodeURIComponent(tag)}`, Boolean(tag));
	const meta = useQuery({
		queryKey: ["tag-meta", tag],
		queryFn: () => api.get(`/posts/tag/${encodeURIComponent(tag)}`),
		enabled: Boolean(tag)
	});
	return {
		...query,
		postsCount: meta.data?.postsCount ?? 0
	};
}
function useUserPosts(username) {
	return useCursoredPosts(`user:${username}`, `/posts/user/${encodeURIComponent(username)}`, Boolean(username));
}
function useLikedPosts(username, enabled) {
	return useQuery({
		queryKey: [
			"posts",
			"liked",
			username
		],
		queryFn: () => api.get(`/posts/user/${encodeURIComponent(username)}/liked`),
		enabled: enabled && Boolean(username)
	});
}
function useSinglePost(postId) {
	return useQuery({
		queryKey: [
			"posts",
			"single",
			postId
		],
		queryFn: () => api.get(`/posts/${encodeURIComponent(postId)}`),
		enabled: Boolean(postId)
	});
}
function useCreatePost() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input) => api.post("/posts", input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			queryClient.invalidateQueries({ queryKey: ["recommendations"] });
			queryClient.invalidateQueries({ queryKey: ["user-profile"] });
			queryClient.invalidateQueries({ queryKey: ["profile"] });
		}
	});
}
function useDeletePost() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id) => api.delete(`/posts/${id}`),
		onMutate: async (postId) => {
			await queryClient.cancelQueries({ queryKey: ["posts"] });
			await queryClient.cancelQueries({ queryKey: ["recommendations"] });
			const previous = queryClient.getQueriesData({ queryKey: ["posts"] });
			removePostEverywhere(queryClient, postId);
			return { previous };
		},
		onError: (_err, _postId, context) => {
			context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			queryClient.invalidateQueries({ queryKey: ["recommendations"] });
			queryClient.invalidateQueries({ queryKey: ["user-profile"] });
			queryClient.invalidateQueries({ queryKey: ["profile"] });
			queryClient.invalidateQueries({ queryKey: ["user-posts"] });
		}
	});
}
/** Optimistically toggles like on a post across every cached feed it appears in. */
function useToggleLike() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (postId) => api.post(`/likes/post/${postId}`),
		onMutate: async (postId) => {
			await queryClient.cancelQueries({ queryKey: ["posts"] });
			const previous = queryClient.getQueriesData({ queryKey: ["posts"] });
			updatePostEverywhere(queryClient, postId, (post) => ({
				...post,
				liked: !post.liked,
				likesCount: post.liked ? post.likesCount - 1 : post.likesCount + 1
			}));
			return { previous };
		},
		onError: (_err, _postId, context) => {
			context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
		}
	});
}
function useToggleBookmark() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (postId) => api.post(`/bookmarks/${postId}`),
		onMutate: async (postId) => {
			await queryClient.cancelQueries({ queryKey: ["posts"] });
			const previous = queryClient.getQueriesData({ queryKey: ["posts"] });
			updatePostEverywhere(queryClient, postId, (post) => ({
				...post,
				bookmarked: !post.bookmarked
			}));
			return { previous };
		},
		onError: (_err, _postId, context) => {
			context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
		},
		onSettled: () => queryClient.invalidateQueries({ queryKey: ["posts", "bookmarks"] })
	});
}
function useBookmarkedPosts() {
	return useQuery({
		queryKey: ["posts", "bookmarks"],
		queryFn: () => api.get("/bookmarks")
	});
}
/**
* Patches a post everywhere it's cached, across both shapes we use:
*  - paginated feeds: { pages: [{ posts: [...] }, ...] }
*  - flat lists (bookmarks, liked posts): { posts: [...] }
* Every "posts"-prefixed query used to be assumed paginated, which crashed
* (and silently killed the whole like/bookmark mutation) the moment a flat
* list like the bookmarks page had ever been fetched into cache.
*/
function updatePostEverywhere(queryClient, postId, updater) {
	const entries = [...queryClient.getQueriesData({ queryKey: ["posts"] }), ...queryClient.getQueriesData({ queryKey: ["recommendations"] })];
	for (const [key, data] of entries) {
		if (!data) continue;
		if (Array.isArray(data.pages)) queryClient.setQueryData(key, {
			...data,
			pages: data.pages.map((page) => ({
				...page,
				posts: page.posts.map((p) => p._id === postId ? updater(p) : p)
			}))
		});
		else if (Array.isArray(data.posts)) queryClient.setQueryData(key, {
			...data,
			posts: data.posts.map((p) => p._id === postId ? updater(p) : p)
		});
	}
}
function removePostEverywhere(queryClient, postId) {
	const entries = [...queryClient.getQueriesData({ queryKey: ["posts"] }), ...queryClient.getQueriesData({ queryKey: ["recommendations"] })];
	for (const [key, data] of entries) {
		if (!data) continue;
		if (Array.isArray(data.pages)) queryClient.setQueryData(key, {
			...data,
			pages: data.pages.map((page) => ({
				...page,
				posts: page.posts.filter((p) => p._id !== postId)
			}))
		});
		else if (Array.isArray(data.posts)) queryClient.setQueryData(key, {
			...data,
			posts: data.posts.filter((p) => p._id !== postId)
		});
	}
}
function PostCreator({ onClose }) {
	const navigate = useNavigate();
	const { user } = useSessionUser();
	const [files, setFiles] = (0, import_react.useState)([]);
	const [selectedIndex, setSelectedIndex] = (0, import_react.useState)(0);
	const [caption, setCaption] = (0, import_react.useState)("");
	const [location, setLocation] = (0, import_react.useState)("");
	const [audience, setAudience] = (0, import_react.useState)("public");
	const [commentsEnabled, setCommentsEnabled] = (0, import_react.useState)(true);
	const [taggedPeople, setTaggedPeople] = (0, import_react.useState)([]);
	const [step, setStep] = (0, import_react.useState)("compose");
	const [showUnsavedGuard, setShowUnsavedGuard] = (0, import_react.useState)(false);
	const [uploadStage, setUploadStage] = (0, import_react.useState)(null);
	const [uploadProgress, setUploadProgress] = (0, import_react.useState)(0);
	const [uploadError, setUploadError] = (0, import_react.useState)();
	const createPost = useCreatePost();
	const hasUnsavedContent = files.length > 0 || caption.trim().length > 0;
	const handleCloseRequest = () => {
		if (hasUnsavedContent && !uploadStage) setShowUnsavedGuard(true);
		else onClose();
	};
	const handleSaveDraft = () => {
		saveDraft({
			type: "post",
			caption,
			location,
			audience,
			commentsEnabled,
			media: files.map((f) => ({
				fileName: f.file.name,
				mimeType: f.file.type,
				isVideo: f.isVideo
			})),
			tags: Array.from(caption.matchAll(/#(\w+)/g)).map((m) => m[1]).filter((t) => t !== void 0),
			taggedPeople
		});
		toast.success("Draft saved");
		onClose();
	};
	const handleRemoveMedia = (index) => {
		const next = files.filter((_, i) => i !== index);
		const removed = files[index];
		if (removed) URL.revokeObjectURL(removed.previewUrl);
		setFiles(next);
		if (selectedIndex >= next.length) setSelectedIndex(Math.max(0, next.length - 1));
	};
	const handlePublish = async () => {
		if (!user) return;
		setUploadStage("preparing");
		setUploadProgress(0);
		setUploadError(void 0);
		try {
			let mediaUrl;
			let mediaKey;
			let isVideo = false;
			let firstWidth;
			let firstHeight;
			let firstRatio;
			let firstBlur;
			let thumbnailUrl;
			const mediaItems = [];
			if (files.length > 0) {
				setUploadStage("uploading");
				const uploadedUrls = [];
				isVideo = files[0]?.isVideo ?? false;
				for (let i = 0; i < files.length; i++) {
					const item = files[i];
					if (!item) continue;
					const kind = item.isVideo ? "videos" : "photos";
					const uploaded = await uploadFile(kind, item.file, (pct) => {
						setUploadProgress(Math.round((i + pct / 100) / files.length * 100));
					});
					uploadedUrls.push(uploaded.url);
					if (i === 0) {
						mediaKey = uploaded.key;
						firstWidth = uploaded.width;
						firstHeight = uploaded.height;
						firstRatio = uploaded.aspectRatio;
						firstBlur = uploaded.blurDataUrl;
						thumbnailUrl = uploaded.thumbnailUrl;
					}
					mediaItems.push({
						url: uploaded.url,
						width: uploaded.width,
						height: uploaded.height,
						aspectRatio: uploaded.aspectRatio,
						kind: item.isVideo ? "video" : "photo"
					});
				}
				mediaUrl = uploadedUrls.join(",");
			}
			setUploadStage("processing");
			await new Promise((r) => setTimeout(r, 400));
			setUploadStage("publishing");
			const tags = Array.from(caption.matchAll(/#(\w+)/g)).map((m) => m[1]).filter((t) => t !== void 0);
			await createPost.mutateAsync({
				kind: isVideo ? "video" : files.length > 0 ? "photo" : "text",
				body: caption.trim(),
				mediaUrl,
				mediaKey,
				thumbnailUrl,
				location: location.trim() || void 0,
				tags,
				audience,
				mediaWidth: firstWidth,
				mediaHeight: firstHeight,
				aspectRatio: firstRatio,
				blurDataUrl: firstBlur,
				media: mediaItems.length > 0 ? mediaItems : void 0
			});
			setUploadStage("completed");
			toast.success("Posted to your feed!");
			setTimeout(() => {
				onClose();
				navigate({ to: "/" });
			}, 1e3);
		} catch (err) {
			setUploadStage("failed");
			setUploadError(err?.message || "Failed to publish post. Please check your connection.");
		}
	};
	if (!user) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col max-w-[720px] mx-auto w-full overscroll-contain",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 items-center justify-between border-b border-border p-4 pb-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid size-9 place-items-center rounded-xl bg-primary-soft text-primary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-lg font-extrabold tracking-tight",
						children: "Create Post"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Share photos, videos or updates"
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [hasUnsavedContent && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: handleSaveDraft,
						children: "Save Draft"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: handleCloseRequest,
						className: "press grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 lg:p-5",
				children: step === "preview" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PostPreview, {
					user,
					caption,
					files,
					location,
					audience,
					onEdit: () => setStep("compose"),
					onPublish: handlePublish,
					isPublishing: uploadStage !== null
				}) : step === "edit-media" && files[selectedIndex] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaEditor, {
					file: files[selectedIndex],
					onSave: (edited) => {
						const next = [...files];
						next[selectedIndex] = edited;
						setFiles(next);
						setStep("compose");
					},
					onCancel: () => setStep("compose")
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-6 lg:grid-cols-12",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-col gap-4 lg:col-span-6",
						children: files.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaPreview, {
								files,
								selectedIndex,
								onSelect: setSelectedIndex,
								onRemove: handleRemoveMedia,
								onReorder: setFiles
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaPicker, {
									files,
									onChange: setFiles,
									multiple: true,
									compact: true
								}), !files[selectedIndex]?.isVideo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									variant: "outline",
									size: "sm",
									onClick: () => setStep("edit-media"),
									className: "gap-1.5 text-xs font-semibold",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crop, { className: "size-3.5" }), "Edit Image"]
								})]
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaPicker, {
							files,
							onChange: setFiles,
							multiple: true,
							accept: "all"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-4 lg:col-span-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GAvatar, {
										user,
										size: "sm"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm font-bold",
										children: user.name
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AudienceSelector, {
									value: audience,
									onChange: setAudience,
									compact: true
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaptionEditor, {
								value: caption,
								onChange: setCaption,
								placeholder: `What's the update, ${user.name.split(" ")[0]}?`,
								className: "rounded-2xl border border-border p-3 bg-surface"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-3 pt-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocationInput, {
									value: location,
									onChange: setLocation
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagPeopleInput, {
									taggedUsers: taggedPeople,
									onChange: setTaggedPeople
								})]
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "sticky bottom-0 shrink-0 border-t border-border bg-surface/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:static lg:border-t-0 lg:bg-transparent lg:p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "outline",
						size: "sm",
						onClick: () => setStep("preview"),
						disabled: files.length === 0 && !caption.trim(),
						className: "gap-1.5 flex-1 sm:flex-none",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4" }), "Preview"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "brand",
						size: "sm",
						disabled: files.length === 0 && !caption.trim(),
						onClick: handlePublish,
						className: "gap-1.5 flex-1 sm:flex-none",
						children: "Publish Post"
					})]
				})
			}),
			uploadStage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UploadProgress, {
				stage: uploadStage,
				progress: uploadProgress,
				error: uploadError,
				onRetry: handlePublish,
				onCancel: () => setUploadStage(null),
				onDone: () => {
					setUploadStage(null);
					onClose();
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnsavedChangesGuard, {
				open: showUnsavedGuard,
				onSaveDraft: handleSaveDraft,
				onDiscard: () => {
					setShowUnsavedGuard(false);
					onClose();
				},
				onContinue: () => setShowUnsavedGuard(false)
			})
		]
	});
}
var Switch = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch$1, {
	className: cn("peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input", className),
	...props,
	ref,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: cn("pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0") })
}));
Switch.displayName = Switch$1.displayName;
function VideoTrimmer({ videoUrl, duration, trimStart, trimEnd, onTrimChange }) {
	const videoRef = (0, import_react.useRef)(null);
	const [isPlaying, setIsPlaying] = (0, import_react.useState)(false);
	const [currentTime, setCurrentTime] = (0, import_react.useState)(trimStart);
	(0, import_react.useEffect)(() => {
		if (videoRef.current) videoRef.current.currentTime = trimStart;
	}, [trimStart]);
	const handleTimeUpdate = () => {
		if (!videoRef.current) return;
		const curr = videoRef.current.currentTime;
		setCurrentTime(curr);
		if (curr >= trimEnd) {
			videoRef.current.pause();
			setIsPlaying(false);
			videoRef.current.currentTime = trimStart;
		}
	};
	const togglePlay = () => {
		if (!videoRef.current) return;
		if (isPlaying) {
			videoRef.current.pause();
			setIsPlaying(false);
		} else {
			if (videoRef.current.currentTime >= trimEnd) videoRef.current.currentTime = trimStart;
			videoRef.current.play();
			setIsPlaying(true);
		}
	};
	const formatTime = (sec) => {
		const m = Math.floor(sec / 60);
		const s = Math.floor(sec % 60);
		return `${m}:${s < 10 ? "0" : ""}${s}`;
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4 rounded-2xl border border-border bg-card p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-1.5 text-xs font-bold text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scissors, { className: "size-4 text-accent" }), " Video Trimmer"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-xs font-mono font-bold text-muted-foreground",
					children: [
						formatTime(trimStart),
						" - ",
						formatTime(trimEnd),
						" (",
						Math.round(trimEnd - trimStart),
						"s)"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
				ref: videoRef,
				src: videoUrl,
				onTimeUpdate: handleTimeUpdate,
				className: "hidden"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between text-[11px] text-muted-foreground mb-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Start Point" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatTime(trimStart) })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
					value: [trimStart],
					min: 0,
					max: Math.max(0, trimEnd - 1),
					step: .5,
					onValueChange: (vals) => {
						const val = vals[0];
						if (val !== void 0) onTrimChange(val, trimEnd);
					}
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between text-[11px] text-muted-foreground mb-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "End Point" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatTime(trimEnd) })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
					value: [trimEnd],
					min: trimStart + 1,
					max: duration || 120,
					step: .5,
					onValueChange: (vals) => {
						const val = vals[0];
						if (val !== void 0) onTrimChange(trimStart, val);
					}
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: togglePlay,
				className: "press flex items-center justify-center gap-2 rounded-xl bg-muted py-2 text-xs font-bold hover:bg-muted/80",
				children: [isPlaying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), isPlaying ? "Pause Trim Preview" : "Play Trimmed Selection"]
			})
		]
	});
}
function CoverSelector({ videoUrl, duration, selectedTimestamp, onSelectTimestamp }) {
	const videoRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (videoRef.current) videoRef.current.currentTime = selectedTimestamp;
	}, [selectedTimestamp]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4 rounded-2xl border border-border bg-card p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-1.5 text-xs font-bold text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image$1, { className: "size-4 text-info" }), " Select Reel Cover Frame"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-xs font-mono font-semibold text-muted-foreground",
					children: [Math.floor(selectedTimestamp), "s"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative aspect-[9/16] max-h-56 w-full overflow-hidden rounded-xl bg-black flex items-center justify-center mx-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
					ref: videoRef,
					src: videoUrl,
					muted: true,
					playsInline: true,
					className: "h-full w-full object-cover"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
				value: [selectedTimestamp],
				min: 0,
				max: duration || 10,
				step: .2,
				onValueChange: (vals) => {
					const val = vals[0];
					if (val !== void 0) onSelectTimestamp(val);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] text-center text-muted-foreground",
				children: "Drag the slider to choose the frame that will be shown on your profile grid and reels tab."
			})
		]
	});
}
function ReelPreview({ user, videoUrl, caption, onEdit, onPublish, isPublishing }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4 max-w-[360px] mx-auto w-full",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-base font-bold",
					children: "Reel Preview"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent",
					children: "Vertical Mode"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative aspect-[9/16] w-full overflow-hidden rounded-3xl bg-black shadow-float",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
					src: videoUrl,
					controls: true,
					autoPlay: true,
					loop: true,
					playsInline: true,
					className: "h-full w-full object-cover"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute inset-x-0 bottom-0 flex items-end justify-between p-4 bg-gradient-to-t from-black/80 via-black/30 to-transparent pt-12",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2 max-w-[80%] text-white",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GAvatar, {
									user,
									size: "xs",
									ring: "story"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs font-bold",
									children: ["@", user.username]
								})]
							}),
							caption && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs leading-normal line-clamp-3 font-medium opacity-90",
								children: caption
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1 text-[11px] opacity-75",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music2, { className: "size-3 animate-spin" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Original audio - ", user.name] })]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-center gap-4 text-white",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-6" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] font-bold",
									children: "0"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-6" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] font-bold",
									children: "0"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-6" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] font-bold",
									children: "Share"
								})]
							})
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between pt-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: onEdit,
					disabled: isPublishing,
					children: "Edit Reel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "brand",
					onClick: onPublish,
					disabled: isPublishing,
					children: "Publish Reel"
				})]
			})
		]
	});
}
function ReelCreator({ onClose }) {
	const navigate = useNavigate();
	const { user } = useSessionUser();
	const [videoFile, setVideoFile] = (0, import_react.useState)(null);
	const [caption, setCaption] = (0, import_react.useState)("");
	const [location, setLocation] = (0, import_react.useState)("");
	const [audience, setAudience] = (0, import_react.useState)("public");
	const [commentsEnabled, setCommentsEnabled] = (0, import_react.useState)(true);
	const [taggedPeople, setTaggedPeople] = (0, import_react.useState)([]);
	const [step, setStep] = (0, import_react.useState)("select");
	const [trimStart, setTrimStart] = (0, import_react.useState)(0);
	const [trimEnd, setTrimEnd] = (0, import_react.useState)(120);
	const [coverTimestamp, setCoverTimestamp] = (0, import_react.useState)(0);
	const [showUnsavedGuard, setShowUnsavedGuard] = (0, import_react.useState)(false);
	const [uploadStage, setUploadStage] = (0, import_react.useState)(null);
	const [uploadProgress, setUploadProgress] = (0, import_react.useState)(0);
	const [uploadError, setUploadError] = (0, import_react.useState)();
	const createPost = useCreatePost();
	const handleVideoSelect = (files) => {
		if (files.length > 0) {
			const selected = files[0];
			if (selected) {
				setVideoFile(selected);
				setTrimStart(0);
				setTrimEnd(selected.duration || 120);
			}
			setCoverTimestamp(0);
			setStep("editor");
		}
	};
	const handleSaveDraft = () => {
		if (!videoFile) return;
		saveDraft({
			type: "reel",
			caption,
			location,
			audience,
			commentsEnabled,
			media: [{
				fileName: videoFile.file.name,
				mimeType: videoFile.file.type,
				isVideo: true
			}],
			trimStart,
			trimEnd,
			coverTimestamp,
			tags: Array.from(caption.matchAll(/#(\w+)/g)).map((m) => m[1]).filter((t) => t !== void 0),
			taggedPeople
		});
		toast.success("Reel saved to drafts");
		onClose();
	};
	const handlePublish = async () => {
		if (!user || !videoFile) return;
		setUploadStage("preparing");
		setUploadProgress(0);
		setUploadError(void 0);
		try {
			setUploadStage("uploading");
			const uploaded = await uploadFile("reels", videoFile.file, (pct) => setUploadProgress(pct));
			setUploadStage("processing");
			await new Promise((r) => setTimeout(r, 600));
			setUploadStage("publishing");
			const tags = Array.from(caption.matchAll(/#(\w+)/g)).map((m) => m[1]).filter((t) => t !== void 0);
			await createPost.mutateAsync({
				kind: "reel",
				body: caption.trim(),
				mediaUrl: uploaded.url,
				mediaKey: uploaded.key,
				location: location.trim() || void 0,
				tags,
				audience
			});
			setUploadStage("completed");
			toast.success("Reel published successfully!");
			setTimeout(() => {
				onClose();
				navigate({ to: "/reels" });
			}, 1e3);
		} catch (err) {
			setUploadStage("failed");
			setUploadError(err?.message || "Failed to upload reel.");
		}
	};
	if (!user) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5 p-5 max-w-[720px] mx-auto w-full",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between border-b border-border pb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid size-9 place-items-center rounded-xl bg-accent/20 text-accent",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { className: "size-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-lg font-extrabold tracking-tight",
						children: "Create Reel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Share short videos up to 2 minutes"
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [videoFile && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: handleSaveDraft,
						children: "Save Draft"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => {
							if (videoFile && !uploadStage) setShowUnsavedGuard(true);
							else onClose();
						},
						className: "press grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
					})]
				})]
			}),
			step === "preview" && videoFile ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReelPreview, {
				user,
				videoUrl: videoFile.previewUrl,
				caption,
				onEdit: () => setStep("editor"),
				onPublish: handlePublish,
				isPublishing: uploadStage !== null
			}) : !videoFile ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-6 py-8 items-center text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid size-20 place-items-center rounded-full bg-accent/15 text-accent animate-pulse",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Film, { className: "size-10" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-base font-bold",
						children: "Select a video for your Reel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground mt-1 max-w-sm",
						children: "Reels work best with portrait (9:16) videos up to 2 minutes long."
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-col sm:flex-row gap-3 w-full max-w-md",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaPicker, {
							accept: "videos",
							maxDurationSeconds: 120,
							files: [],
							onChange: handleVideoSelect,
							className: "flex-1 h-32"
						})
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-12",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-4 lg:col-span-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoTrimmer, {
						videoUrl: videoFile.previewUrl,
						duration: videoFile.duration || 120,
						trimStart,
						trimEnd,
						onTrimChange: (start, end) => {
							setTrimStart(start);
							setTrimEnd(end);
						}
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoverSelector, {
						videoUrl: videoFile.previewUrl,
						duration: videoFile.duration || 120,
						selectedTimestamp: coverTimestamp,
						onSelectTimestamp: setCoverTimestamp
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-4 lg:col-span-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GAvatar, {
									user,
									size: "xs"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-bold",
									children: user.name
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AudienceSelector, {
								value: audience,
								onChange: setAudience,
								compact: true
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaptionEditor, {
							value: caption,
							onChange: setCaption,
							placeholder: "Describe your reel. Use #tags to reach more people…",
							className: "rounded-2xl border border-border p-3 bg-surface"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocationInput, {
							value: location,
							onChange: setLocation
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagPeopleInput, {
							taggedUsers: taggedPeople,
							onChange: setTaggedPeople
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between rounded-xl border border-border/60 p-3 bg-surface",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold",
								children: "Allow comments"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
								checked: commentsEnabled,
								onCheckedChange: setCommentsEnabled
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between pt-4 border-t border-border mt-auto",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								onClick: () => setStep("preview"),
								className: "gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4" }), "Preview Reel"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "brand",
								onClick: handlePublish,
								children: "Publish Reel"
							})]
						})
					]
				})]
			}),
			uploadStage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UploadProgress, {
				stage: uploadStage,
				progress: uploadProgress,
				error: uploadError,
				onRetry: handlePublish,
				onCancel: () => setUploadStage(null),
				onDone: () => {
					setUploadStage(null);
					onClose();
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnsavedChangesGuard, {
				open: showUnsavedGuard,
				onSaveDraft: handleSaveDraft,
				onDiscard: () => {
					setShowUnsavedGuard(false);
					onClose();
				},
				onContinue: () => setShowUnsavedGuard(false)
			})
		]
	});
}
var STORY_FILTERS = [
	{
		id: "normal",
		name: "Normal",
		cssFilter: "none"
	},
	{
		id: "warm",
		name: "Warm",
		cssFilter: "sepia(0.25) saturate(1.2) contrast(1.05)"
	},
	{
		id: "cool",
		name: "Cool",
		cssFilter: "hue-rotate(180deg) saturate(1.1)"
	},
	{
		id: "vivid",
		name: "Vivid",
		cssFilter: "saturate(1.5) contrast(1.1)"
	},
	{
		id: "bw",
		name: "B&W",
		cssFilter: "grayscale(1) contrast(1.2)"
	},
	{
		id: "vintage",
		name: "Vintage",
		cssFilter: "sepia(0.4) contrast(0.9) brightness(1.1)"
	},
	{
		id: "blur",
		name: "Soft Blur",
		cssFilter: "blur(2px)"
	}
];
var STORY_FONTS = [
	{
		id: "classic",
		label: "CLASSIC",
		fontClass: "font-display font-extrabold"
	},
	{
		id: "modern",
		label: "MODERN",
		fontClass: "font-sans font-bold"
	},
	{
		id: "bold",
		label: "BOLD",
		fontClass: "font-display font-black tracking-tight"
	},
	{
		id: "serif",
		label: "ELEGANT",
		fontClass: "font-serif italic font-semibold"
	},
	{
		id: "mono",
		label: "TYPEWRITER",
		fontClass: "font-mono font-medium"
	},
	{
		id: "fun",
		label: "PLAYFUL",
		fontClass: "font-display font-extrabold tracking-wider uppercase"
	},
	{
		id: "minimal",
		label: "MINIMAL",
		fontClass: "font-sans font-medium uppercase tracking-widest text-xs"
	}
];
var STORY_TEXT_COLORS = [
	"#FFFFFF",
	"#000000",
	"#FF3B30",
	"#FF9500",
	"#FFCC00",
	"#34C759",
	"#00C7BE",
	"#30B0C7",
	"#32ADE6",
	"#007AFF",
	"#5856D6",
	"#AF52DE",
	"#FF2D55"
];
function StoryTextEditor({ onSave, onCancel, initialText }) {
	const [text, setText] = (0, import_react.useState)(initialText?.text || "");
	const [font, setFont] = (0, import_react.useState)(initialText?.font || "classic");
	const [fontSize, setFontSize] = (0, import_react.useState)(initialText?.fontSize || 28);
	const [color, setColor] = (0, import_react.useState)(initialText?.color || "#FFFFFF");
	const [bgColor, setBgColor] = (0, import_react.useState)(initialText?.bgColor || "transparent");
	const [alignment, setAlignment] = (0, import_react.useState)(initialText?.alignment || "center");
	const selectedFontObj = STORY_FONTS.find((f) => f.id === font) ?? STORY_FONTS[0];
	const handleDone = () => {
		if (!text.trim()) {
			onCancel();
			return;
		}
		onSave({
			id: initialText?.id || `txt_${Date.now()}`,
			text: text.trim(),
			font,
			fontSize,
			color,
			bgColor,
			alignment,
			x: initialText?.x || 50,
			y: initialText?.y || 50,
			rotation: initialText?.rotation || 0,
			scale: initialText?.scale || 1
		});
	};
	const cycleAlignment = () => {
		const alignments = [
			"left",
			"center",
			"right"
		];
		const next = alignments[(alignments.indexOf(alignment) + 1) % 3];
		if (next) setAlignment(next);
	};
	const cycleBgColor = () => {
		setBgColor((prev) => prev === "transparent" ? "rgba(0,0,0,0.75)" : prev === "rgba(0,0,0,0.75)" ? "rgba(255,255,255,0.9)" : "transparent");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 flex flex-col justify-between bg-black/85 p-4 backdrop-blur-xl select-none",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between z-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: cycleAlignment,
							className: "press grid size-9 place-items-center rounded-full bg-white/20 text-white hover:bg-white/30",
							children: [
								alignment === "left" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextAlignStart, { className: "size-4.5" }),
								alignment === "center" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextAlignCenter, { className: "size-4.5" }),
								alignment === "right" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextAlignEnd, { className: "size-4.5" })
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: cycleBgColor,
							className: cn("press flex size-9 items-center justify-center rounded-full border border-white/30 text-xs font-black transition-colors", bgColor !== "transparent" ? "bg-white text-black" : "bg-white/20 text-white"),
							children: "A"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center rounded-full border border-white/30 bg-black/60 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-white shadow-lg backdrop-blur-md",
						children: selectedFontObj?.label ?? ""
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: handleDone,
						className: "press rounded-full bg-white px-4 py-1.5 text-xs font-extrabold text-black shadow-lg hover:bg-white/90",
						children: "Done"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative flex flex-1 items-center justify-center py-6 px-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute left-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-20",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative h-48 w-1.5 rounded-full bg-white/30",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "range",
							min: 16,
							max: 56,
							step: 1,
							value: fontSize,
							onChange: (e) => setFontSize(Number(e.target.value)),
							className: "absolute inset-0 h-full w-full opacity-0 cursor-pointer [writing-mode:vertical-lr] [direction:rtl]"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute left-1/2 -translate-x-1/2 size-4 rounded-full bg-white shadow-md transition-all",
							style: { top: `${100 - (fontSize - 16) / 40 * 100}%` }
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					autoFocus: true,
					value: text,
					onChange: (e) => setText(e.target.value),
					placeholder: "YOUR STORY HERE",
					style: {
						color: bgColor === "rgba(255,255,255,0.9)" && color === "#FFFFFF" ? "#000000" : color,
						backgroundColor: bgColor,
						fontSize: `${fontSize}px`,
						textAlign: alignment
					},
					className: cn("w-full max-w-md resize-none border-0 bg-transparent p-4 leading-snug shadow-none focus:outline-none focus:ring-0 rounded-2xl transition-all", selectedFontObj?.fontClass ?? "")
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 z-10 pb-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-2 overflow-x-auto pb-1 no-scrollbar justify-center px-4",
					children: STORY_FONTS.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setFont(f.id),
						className: cn("press shrink-0 rounded-full px-3.5 py-1 text-[11px] font-extrabold tracking-wider transition-all", font === f.id ? "bg-white text-black scale-105 shadow-md" : "bg-white/20 text-white hover:bg-white/30"),
						children: f.label
					}, f.id))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-2.5 overflow-x-auto pb-1 no-scrollbar justify-center items-center px-4",
					children: STORY_TEXT_COLORS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setColor(c),
						className: cn("press size-7 shrink-0 rounded-full border-2 transition-transform", color === c ? "border-white scale-125 shadow-lg" : "border-transparent"),
						style: { backgroundColor: c }
					}, c))
				})]
			})
		]
	});
}
function StoryCanvas({ slide, stickers, drawingUrl, onUpdateTextPosition, onUpdateStickerPosition, onUpdateTextScale, onUpdateStickerScale, onSelectTextElement, onRemoveSticker, onRemoveTextElement }) {
	const containerRef = (0, import_react.useRef)(null);
	const [draggingId, setDraggingId] = (0, import_react.useState)(null);
	const [activeElementId, setActiveElementId] = (0, import_react.useState)(null);
	const activeFilterObj = STORY_FILTERS.find((f) => f.id === slide.filter) ?? STORY_FILTERS[0] ?? {
		id: "normal",
		label: "Normal",
		cssFilter: "none"
	};
	const handlePointerDown = (id, e) => {
		e.stopPropagation();
		setDraggingId(id);
		setActiveElementId(id);
		try {
			e.target.setPointerCapture(e.pointerId);
		} catch {}
	};
	const handlePointerMoveText = (id, e) => {
		if (draggingId !== id || !containerRef.current || !onUpdateTextPosition) return;
		const rect = containerRef.current.getBoundingClientRect();
		onUpdateTextPosition(id, Math.max(5, Math.min(95, (e.clientX - rect.left) / rect.width * 100)), Math.max(5, Math.min(95, (e.clientY - rect.top) / rect.height * 100)));
	};
	const handlePointerMoveSticker = (id, e) => {
		if (draggingId !== id || !containerRef.current || !onUpdateStickerPosition) return;
		const rect = containerRef.current.getBoundingClientRect();
		onUpdateStickerPosition(id, Math.max(5, Math.min(95, (e.clientX - rect.left) / rect.width * 100)), Math.max(5, Math.min(95, (e.clientY - rect.top) / rect.height * 100)));
	};
	const handlePointerUp = (e) => {
		if (draggingId) {
			setDraggingId(null);
			try {
				e.target.releasePointerCapture(e.pointerId);
			} catch {}
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: containerRef,
		onClick: () => setActiveElementId(null),
		className: "relative aspect-[9/16] h-full max-h-[640px] w-full overflow-hidden rounded-3xl shadow-2xl select-none bg-black",
		style: {
			background: slide.mediaThumbnail ? "black" : slide.background,
			filter: activeFilterObj.cssFilter
		},
		children: [
			slide.mediaThumbnail && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 flex items-center justify-center bg-black",
				children: slide.mediaIsVideo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
					src: slide.mediaThumbnail,
					autoPlay: true,
					muted: true,
					loop: true,
					playsInline: true,
					className: "h-full w-full object-cover"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: slide.mediaThumbnail,
					alt: "Story background",
					className: "h-full w-full object-cover"
				})
			}),
			drawingUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: drawingUrl,
				alt: "User drawing",
				className: "absolute inset-0 h-full w-full object-cover pointer-events-none z-10"
			}),
			slide.textElements.map((el) => {
				const fontObj = STORY_FONTS.find((f) => f.id === el.font) ?? STORY_FONTS[0];
				const isSelected = activeElementId === el.id;
				const currentScale = el.scale || 1;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					onPointerDown: (e) => handlePointerDown(el.id, e),
					onPointerMove: (e) => handlePointerMoveText(el.id, e),
					onPointerUp: handlePointerUp,
					onClick: (e) => {
						e.stopPropagation();
						setActiveElementId(el.id);
						if (onSelectTextElement) onSelectTextElement(el);
					},
					style: {
						left: `${el.x}%`,
						top: `${el.y}%`,
						transform: `translate(-50%, -50%) rotate(${el.rotation || 0}deg) scale(${currentScale})`,
						color: el.bgColor === "rgba(255,255,255,0.9)" && el.color === "#FFFFFF" ? "#000000" : el.color,
						backgroundColor: el.bgColor,
						fontSize: `${el.fontSize}px`,
						textAlign: el.alignment
					},
					className: cn("group absolute z-20 cursor-grab active:cursor-grabbing rounded-xl p-2.5 font-bold leading-snug drop-shadow-md touch-none max-w-[85%]", fontObj?.fontClass ?? "", isSelected && "ring-2 ring-white/80 shadow-2xl"),
					children: [el.text, isSelected && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute -bottom-9 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-slate-900/90 px-2 py-1 shadow-2xl backdrop-blur-md z-30",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: (e) => {
									e.stopPropagation();
									if (onUpdateTextScale) onUpdateTextScale(el.id, Math.max(.5, currentScale - .15));
								},
								className: "grid size-6 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20",
								title: "Make Smaller",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoomOut, { className: "size-3" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-[10px] font-bold text-white/70 px-1",
								children: [Math.round(currentScale * 100), "%"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: (e) => {
									e.stopPropagation();
									if (onUpdateTextScale) onUpdateTextScale(el.id, Math.min(2.5, currentScale + .15));
								},
								className: "grid size-6 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20",
								title: "Make Larger",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoomIn, { className: "size-3" })
							}),
							onRemoveTextElement && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: (e) => {
									e.stopPropagation();
									onRemoveTextElement(el.id);
								},
								className: "grid size-6 place-items-center rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30",
								title: "Delete",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3" })
							})
						]
					})]
				}, el.id);
			}),
			stickers.map((stk) => {
				const xPos = stk.x ?? 50;
				const yPos = stk.y ?? 50;
				const isSelected = activeElementId === stk.id;
				const currentScale = stk.scale || 1;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					onPointerDown: (e) => handlePointerDown(stk.id, e),
					onPointerMove: (e) => handlePointerMoveSticker(stk.id, e),
					onPointerUp: handlePointerUp,
					onClick: (e) => {
						e.stopPropagation();
						setActiveElementId(stk.id);
					},
					style: {
						left: `${xPos}%`,
						top: `${yPos}%`,
						transform: `translate(-50%, -50%) rotate(${stk.rotation || 0}deg) scale(${currentScale})`
					},
					className: cn("group absolute z-20 cursor-grab active:cursor-grabbing touch-none select-none p-1 rounded-2xl", isSelected && "ring-2 ring-white/80"),
					children: [stk.type === "emoji" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-6xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.7)]",
						children: stk.content
					}) : stk.type === "location" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-extrabold text-emerald-400 text-lg tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]",
						children: ["📍 ", stk.content]
					}) : stk.type === "mention" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-extrabold text-white text-xl tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]",
						children: stk.content
					}) : stk.type === "hashtag" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-extrabold text-sky-400 text-lg tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]",
						children: stk.content
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-extrabold text-white text-base tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]",
						children: stk.content
					}), isSelected && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute -bottom-9 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-slate-900/90 px-2 py-1 shadow-2xl backdrop-blur-md z-30",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: (e) => {
									e.stopPropagation();
									if (onUpdateStickerScale) onUpdateStickerScale(stk.id, Math.max(.4, currentScale - .15));
								},
								className: "grid size-6 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20",
								title: "Make Smaller",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoomOut, { className: "size-3" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-[10px] font-bold text-white/70 px-1",
								children: [Math.round(currentScale * 100), "%"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: (e) => {
									e.stopPropagation();
									if (onUpdateStickerScale) onUpdateStickerScale(stk.id, Math.min(2.5, currentScale + .15));
								},
								className: "grid size-6 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20",
								title: "Make Larger",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoomIn, { className: "size-3" })
							}),
							onRemoveSticker && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: (e) => {
									e.stopPropagation();
									onRemoveSticker(stk.id);
								},
								className: "grid size-6 place-items-center rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30",
								title: "Delete",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3" })
							})
						]
					})]
				}, stk.id);
			})
		]
	});
}
/**
* A1 — single source of truth for every tunable live-video quality constant.
* Change numbers here (or via VITE_* env) without touching transport code.
*
* Applied to BOTH transports: the LiveKit SFU path (livekit-live.ts) and the
* legacy browser mesh (browser-live.ts), plus useCameraPreview so what the
* host previews equals what is broadcast.
*/
function envNumber(name, fallback) {
	const raw = {
		"BASE_URL": "/",
		"DEV": false,
		"MODE": "production",
		"PROD": true,
		"SSR": true,
		"TSS_DEV_SERVER": "false",
		"TSS_DEV_SSR_STYLES_BASEPATH": "/",
		"TSS_DEV_SSR_STYLES_ENABLED": "true",
		"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
		"TSS_INLINE_CSS_ENABLED": "false",
		"TSS_ROUTER_BASEPATH": "",
		"TSS_SERVER_FN_BASE": "/_serverFn/"
	}[name];
	if (!raw) return fallback;
	const parsed = Number(raw);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
var isMobileViewport = () => typeof window !== "undefined" && (navigator.maxTouchPoints > 0 || "ontouchstart" in window) && window.matchMedia("(max-width: 767px)").matches;
var LIVE_VIDEO_QUALITY = {
	/**
	* Capture constraints. Desktop hosts aim for 1080p (with a graceful chain
	* down to 720p/360p via `ideal` + `min`); mobile defaults to 720p where
	* most front cameras top out anyway and bitrate budgets are tighter.
	*/
	capture: {
		desktop: {
			width: { ideal: 1920 },
			height: { ideal: 1080 }
		},
		mobile: {
			width: { ideal: 1280 },
			height: { ideal: 720 }
		},
		frameRate: {
			ideal: envNumber("VITE_LIVE_FPS", 30),
			max: 30
		},
		/** Absolute floor before we refuse to look worse than this. */
		min: {
			width: 640,
			height: 360
		}
	},
	/** 720p30 target bitrate (kbps) — the sweet spot for talking-head HD. */
	maxBitrateKbps: envNumber("VITE_LIVE_MAX_BITRATE_KBPS", 1800),
	maxBitrate: envNumber("VITE_LIVE_MAX_BITRATE_KBPS", 1800) * 1e3,
	/** Simulcast layers (LiveKit path) — low/mid/high. */
	simulcastLayers: [
		{
			scaleResolutionDownBy: 4,
			maxBitrate: 15e4
		},
		{
			scaleResolutionDownBy: 2,
			maxBitrate: 5e5
		},
		{
			scaleResolutionDownBy: 1,
			maxBitrate: envNumber("VITE_LIVE_MAX_BITRATE_KBPS", 1800) * 1e3
		}
	],
	/** Preferred codecs in order — VP8 first (best simulcast support), H264 fallback. */
	preferredCodecs: ["vp8", "h264"]
};
/** Full video MediaTrackConstraints for host/co-host capture. */
function liveCaptureConstraints() {
	const base = isMobileViewport() ? LIVE_VIDEO_QUALITY.capture.mobile : LIVE_VIDEO_QUALITY.capture.desktop;
	return {
		width: {
			ideal: base.width.ideal,
			min: LIVE_VIDEO_QUALITY.capture.min.width
		},
		height: {
			ideal: base.height.ideal,
			min: LIVE_VIDEO_QUALITY.capture.min.height
		},
		frameRate: { ...LIVE_VIDEO_QUALITY.capture.frameRate }
	};
}
/** Camera-preview constraints (same shape so preview == broadcast). */
function livePreviewConstraints(facingMode) {
	return {
		...liveCaptureConstraints(),
		facingMode
	};
}
/**
* A6 — connection-quality thresholds with hysteresis. The classifier is a
* pure function (live-quality.ts); these are its knobs.
* poor: sustained ≥ 6 s of (loss > 8% or RTT > 600 ms or bitrate < 150 kbps)
* recover: ≥ 8 s of all-good before the banner disappears.
*/
var QUALITY_THRESHOLDS = {
	poorLossPct: 8,
	poorRttMs: 600,
	poorBitrateKbps: 150,
	poorSustainMs: 6e3,
	recoverSustainMs: 8e3,
	/** Reconnecting longer than this escalates to the A3 black-screen overlay. */
	reconnectEscalateMs: 1e4
};
/**
* A1 mesh fallback — STUN-only (stun.l.google.com) fails on strict/mobile
* NATs. Optional TURN via VITE_TURN_URL / VITE_TURN_USERNAME /
* VITE_TURN_CREDENTIAL (names only in .env.example, never committed).
*/
function liveIceServers() {
	const servers = [{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] }];
	const turnUrl = {
		"BASE_URL": "/",
		"DEV": false,
		"MODE": "production",
		"PROD": true,
		"SSR": true,
		"TSS_DEV_SERVER": "false",
		"TSS_DEV_SSR_STYLES_BASEPATH": "/",
		"TSS_DEV_SSR_STYLES_ENABLED": "true",
		"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
		"TSS_INLINE_CSS_ENABLED": "false",
		"TSS_ROUTER_BASEPATH": "",
		"TSS_SERVER_FN_BASE": "/_serverFn/"
	}["VITE_TURN_URL"];
	const turnUsername = {
		"BASE_URL": "/",
		"DEV": false,
		"MODE": "production",
		"PROD": true,
		"SSR": true,
		"TSS_DEV_SERVER": "false",
		"TSS_DEV_SSR_STYLES_BASEPATH": "/",
		"TSS_DEV_SSR_STYLES_ENABLED": "true",
		"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
		"TSS_INLINE_CSS_ENABLED": "false",
		"TSS_ROUTER_BASEPATH": "",
		"TSS_SERVER_FN_BASE": "/_serverFn/"
	}["VITE_TURN_USERNAME"];
	const turnCredential = {
		"BASE_URL": "/",
		"DEV": false,
		"MODE": "production",
		"PROD": true,
		"SSR": true,
		"TSS_DEV_SERVER": "false",
		"TSS_DEV_SSR_STYLES_BASEPATH": "/",
		"TSS_DEV_SSR_STYLES_ENABLED": "true",
		"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
		"TSS_INLINE_CSS_ENABLED": "false",
		"TSS_ROUTER_BASEPATH": "",
		"TSS_SERVER_FN_BASE": "/_serverFn/"
	}["VITE_TURN_CREDENTIAL"];
	if (turnUrl) servers.push({
		urls: turnUrl.split(",").map((u) => u.trim()).filter(Boolean),
		...turnUsername ? { username: turnUsername } : {},
		...turnCredential ? { credential: turnCredential } : {}
	});
	return servers;
}
/** A1 mesh fallback — sender encoding parameters applied after negotiation. */
var MESH_VIDEO_SEND_PARAMS = {
	maxBitrate: envNumber("VITE_LIVE_MAX_BITRATE_KBPS", 1800) * 1e3,
	scaleResolutionDownBy: 1
};
/** B3 — camera permission/denied error → specific human message. */
function cameraErrorMessage(err) {
	switch (err instanceof DOMException ? err.name : "") {
		case "NotAllowedError": return "Camera access was blocked. Allow it in your browser settings, or pick something from your gallery below.";
		case "NotFoundError": return "No camera was found on this device. You can still upload photos & videos from your gallery or create a text story.";
		case "NotReadableError": return "Your camera is in use by another app. Close it and try again, or use the gallery instead.";
		case "OverconstrainedError": return "This device can't provide the requested camera mode. Try switching cameras.";
		default: return "The camera couldn't start. You can still use your gallery or create a text story.";
	}
}
/**
* B3 camera lifecycle:
*  - the stream is acquired ONCE (on mount) — switching Photo ↔ Video no
*    longer tears it down (no black flash, no repeated permission work);
*  - the audio track is added on demand via a second getUserMedia call when
*    the user first enters Video mode (a mic can't be attached to an
*    existing stream retroactively);
*  - only a facingMode change re-acquires;
*  - a black skeleton with "Starting camera…" renders at FIRST paint so the
*    story shell has its full height before the live video fades in.
*/
function StoryCamera({ onCaptureMedia, onOpenGallery, onOpenTextStory, onClose }) {
	const videoRef = (0, import_react.useRef)(null);
	const mediaStreamRef = (0, import_react.useRef)(null);
	const mediaRecorderRef = (0, import_react.useRef)(null);
	const recordedChunksRef = (0, import_react.useRef)([]);
	const wantAudioRef = (0, import_react.useRef)(false);
	const [hasPermission, setHasPermission] = (0, import_react.useState)(null);
	const [errorDetail, setErrorDetail] = (0, import_react.useState)(null);
	const [cameraReady, setCameraReady] = (0, import_react.useState)(false);
	const [facingMode, setFacingMode] = (0, import_react.useState)("user");
	const [flashOn, setFlashOn] = (0, import_react.useState)(false);
	const [mode, setMode] = (0, import_react.useState)("photo");
	const [isRecording, setIsRecording] = (0, import_react.useState)(false);
	const [recordingTime, setRecordingTime] = (0, import_react.useState)(0);
	const [hasAudio, setHasAudio] = (0, import_react.useState)(false);
	const timerRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		let isMounted = true;
		async function initCamera() {
			if (!navigator.mediaDevices?.getUserMedia) {
				setHasPermission(false);
				setErrorDetail("Camera access is unavailable. Open the site over HTTPS or localhost.");
				return;
			}
			if (mediaStreamRef.current) {
				mediaStreamRef.current.getTracks().forEach((track) => track.stop());
				mediaStreamRef.current = null;
			}
			setCameraReady(false);
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					video: livePreviewConstraints(facingMode),
					audio: false
				});
				if (!isMounted) {
					stream.getTracks().forEach((t) => t.stop());
					return;
				}
				mediaStreamRef.current = stream;
				setHasPermission(true);
				setErrorDetail(null);
				setHasAudio(false);
				if (videoRef.current) {
					videoRef.current.srcObject = stream;
					videoRef.current.onloadedmetadata = () => setCameraReady(true);
					videoRef.current.play().catch(() => {});
				}
			} catch (err) {
				if (!isMounted) return;
				setHasPermission(false);
				setErrorDetail(cameraErrorMessage(err));
			}
		}
		initCamera();
		return () => {
			isMounted = false;
			if (mediaStreamRef.current) {
				mediaStreamRef.current.getTracks().forEach((t) => t.stop());
				mediaStreamRef.current = null;
			}
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, [facingMode]);
	async function ensureAudioTrack() {
		if (wantAudioRef.current) return;
		wantAudioRef.current = true;
		const stream = mediaStreamRef.current;
		if (!stream) return;
		if (stream.getAudioTracks().length > 0) {
			setHasAudio(true);
			return;
		}
		try {
			(await navigator.mediaDevices.getUserMedia({ audio: {
				echoCancellation: true,
				noiseSuppression: true,
				autoGainControl: true
			} })).getAudioTracks().forEach((track) => stream.addTrack(track));
			setHasAudio(true);
		} catch {
			setHasAudio(false);
		}
	}
	const toggleFlash = async () => {
		if (!mediaStreamRef.current) return;
		const track = mediaStreamRef.current.getVideoTracks()[0];
		if (track && "applyConstraints" in track) try {
			await track.applyConstraints({ advanced: [{ torch: !flashOn }] });
			setFlashOn(!flashOn);
		} catch {
			setFlashOn(!flashOn);
		}
	};
	const toggleCameraFacing = () => {
		setFacingMode((prev) => prev === "user" ? "environment" : "user");
	};
	const capturePhoto = () => {
		const video = videoRef.current;
		if (!video) return;
		const canvas = document.createElement("canvas");
		canvas.width = video.videoWidth || 1080;
		canvas.height = video.videoHeight || 1920;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		if (facingMode === "user") {
			ctx.translate(canvas.width, 0);
			ctx.scale(-1, 1);
		}
		ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
		canvas.toBlob((blob) => {
			if (!blob) return;
			onCaptureMedia({
				file: new File([blob], `story_photo_${Date.now()}.jpg`, { type: "image/jpeg" }),
				previewUrl: URL.createObjectURL(blob),
				isVideo: false
			});
		}, "image/jpeg", .92);
	};
	const startRecording = () => {
		if (!mediaStreamRef.current) return;
		recordedChunksRef.current = [];
		try {
			const options = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? { mimeType: "video/webm;codecs=vp9" } : MediaRecorder.isTypeSupported("video/mp4") ? { mimeType: "video/mp4" } : void 0;
			const recorder = new MediaRecorder(mediaStreamRef.current, options);
			recorder.ondataavailable = (e) => {
				if (e.data.size > 0) recordedChunksRef.current.push(e.data);
			};
			recorder.onstop = () => {
				const blob = new Blob(recordedChunksRef.current, { type: recorder.mimeType || "video/mp4" });
				onCaptureMedia({
					file: new File([blob], `story_video_${Date.now()}.mp4`, { type: blob.type }),
					previewUrl: URL.createObjectURL(blob),
					isVideo: true
				});
			};
			recorder.start(500);
			mediaRecorderRef.current = recorder;
			setIsRecording(true);
			setRecordingTime(0);
			timerRef.current = setInterval(() => {
				setRecordingTime((prev) => {
					if (prev >= 15) {
						stopRecording();
						return 15;
					}
					return prev + 1;
				});
			}, 1e3);
		} catch (err) {
			console.error("[StoryCamera] MediaRecorder error:", err);
		}
	};
	const stopRecording = () => {
		if (timerRef.current) clearInterval(timerRef.current);
		if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") mediaRecorderRef.current.stop();
		setIsRecording(false);
	};
	const handleShutterClick = () => {
		if (mode === "photo") capturePhoto();
		else if (mode === "video") {
			if (isRecording) stopRecording();
			else ensureAudioTrack().then(startRecording);
		}
	};
	if (hasPermission === false) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex h-full w-full flex-col items-center justify-between bg-slate-950 p-6 pt-[max(1.5rem,env(safe-area-inset-top))] text-white",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex w-full justify-end",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onClose,
					className: "grid size-10 place-items-center rounded-full bg-white/10 text-white",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center text-center max-w-xs space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid size-16 place-items-center rounded-full bg-white/10 text-white/80",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "size-8" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-lg font-bold",
						children: "Camera Unavailable"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-white/70",
						children: errorDetail || "Camera access is disabled or unsupported on this device. You can still upload photos & videos from your gallery or create a text story."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2 w-full pt-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: onOpenGallery,
							className: "press flex h-11 items-center justify-center gap-2 rounded-2xl bg-white px-5 font-bold text-black shadow-lg",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image$1, { className: "size-4" }), "Choose from Gallery"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: onOpenTextStory,
							className: "press flex h-11 items-center justify-center gap-2 rounded-2xl bg-white/15 px-5 font-bold text-white hover:bg-white/20",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Type, { className: "size-4" }), "Create Text Story"]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex h-full w-full flex-col overflow-hidden bg-black text-white select-none",
		children: [
			!cameraReady && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-slate-950",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-8 animate-spin text-white/70" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold text-white/60",
						children: "Starting camera…"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute bottom-24 flex flex-col items-center gap-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: onOpenGallery,
							className: "press flex h-11 items-center gap-2 rounded-2xl bg-white/15 px-5 text-xs font-bold text-white backdrop-blur-md hover:bg-white/25",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image$1, { className: "size-4" }), " Use gallery instead"]
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
				ref: videoRef,
				autoPlay: true,
				playsInline: true,
				muted: true,
				className: cn("h-full w-full object-cover transition-transform duration-300", facingMode === "user" && "scale-x-[-1]", cameraReady ? "opacity-100" : "opacity-0"),
				style: { transitionProperty: "opacity, transform" }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-x-0 top-0 z-30 flex items-center justify-between p-4 pt-[max(1rem,env(safe-area-inset-top))] bg-gradient-to-b from-black/80 via-black/40 to-transparent",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onClose,
					className: "press grid size-10 place-items-center rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-6" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [
						mode === "video" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: cn("flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-bold text-white/80 backdrop-blur-md", hasAudio ? "text-emerald-300" : "text-amber-300"),
							title: hasAudio ? "Microphone active" : "No microphone — video will be silent",
							children: [hasAudio ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "size-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MicOff, { className: "size-3" }), hasAudio ? "Mic on" : "No mic"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: toggleFlash,
							className: "press grid size-10 place-items-center rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60",
							children: flashOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "size-5 text-amber-400 fill-amber-400" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZapOff, { className: "size-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: toggleCameraFacing,
							className: "press grid size-10 place-items-center rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-5" })
						})
					]
				})]
			}),
			isRecording && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute top-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 rounded-full bg-red-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-lg animate-pulse",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 rounded-full bg-white" }),
					"00:",
					recordingTime < 10 ? `0${recordingTime}` : recordingTime,
					" / 00:15"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-x-0 bottom-0 z-30 flex flex-col items-center p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-black/90 via-black/50 to-transparent gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex w-full items-center justify-between px-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onOpenGallery,
							className: "press grid size-12 place-items-center rounded-2xl bg-white/20 backdrop-blur-md text-white hover:bg-white/30",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image$1, { className: "size-6" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: handleShutterClick,
							disabled: !cameraReady,
							className: cn("press relative grid size-20 place-items-center rounded-full border-4 border-white transition-transform active:scale-90 disabled:opacity-50", isRecording ? "bg-red-600 border-red-500 scale-105" : "bg-white/30 hover:bg-white/40"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("rounded-full transition-all", isRecording ? "size-7 bg-white rounded-md" : "size-14 bg-white") })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: toggleCameraFacing,
							className: "press grid size-12 place-items-center rounded-2xl bg-white/20 backdrop-blur-md text-white hover:bg-white/30",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-6" })
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-6 pt-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								setMode("photo");
								if (isRecording) stopRecording();
							},
							className: cn("text-xs font-extrabold uppercase tracking-widest transition-colors", mode === "photo" ? "text-white scale-105" : "text-white/50 hover:text-white/80"),
							children: "Photo"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								setMode("video");
							},
							className: cn("text-xs font-extrabold uppercase tracking-widest transition-colors", mode === "video" ? "text-white scale-105" : "text-white/50 hover:text-white/80"),
							children: "Video"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onOpenTextStory,
							className: "text-xs font-extrabold uppercase tracking-widest text-white/50 hover:text-white/80",
							children: "Text"
						})
					]
				})]
			})
		]
	});
}
var STICKER_TYPES = [
	{
		id: "emoji",
		label: "Emoji",
		icon: Smile,
		color: "text-amber-400"
	},
	{
		id: "mention",
		label: "Mention",
		icon: AtSign,
		color: "text-indigo-400"
	},
	{
		id: "location",
		label: "Location",
		icon: MapPin,
		color: "text-emerald-400"
	},
	{
		id: "hashtag",
		label: "Hashtag",
		icon: Hash,
		color: "text-sky-400"
	},
	{
		id: "question",
		label: "Question",
		icon: CircleQuestionMark,
		color: "text-blue-400"
	},
	{
		id: "poll",
		label: "Poll",
		icon: ChartNoAxesColumn,
		color: "text-purple-400"
	},
	{
		id: "countdown",
		label: "Timer",
		icon: Clock,
		color: "text-rose-400"
	}
];
function StoryStickerPicker({ onSelectSticker, onClose }) {
	const [activeType, setActiveType] = (0, import_react.useState)("emoji");
	const [inputText, setInputText] = (0, import_react.useState)("");
	const [userSearchResults, setUserSearchResults] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		if (activeType !== "mention" || !inputText.trim()) {
			setUserSearchResults([]);
			return;
		}
		const query = inputText.replace(/^@/, "").trim();
		if (!query) return;
		let isMounted = true;
		const timer = setTimeout(async () => {
			try {
				const res = await api.get(`/search?q=${encodeURIComponent(query)}`);
				if (isMounted) setUserSearchResults(res?.users ?? []);
			} catch {
				if (isMounted) setUserSearchResults([]);
			}
		}, 300);
		return () => {
			isMounted = false;
			clearTimeout(timer);
		};
	}, [inputText, activeType]);
	const handleSelectMentionUser = (u) => {
		onSelectSticker({
			id: `stk_mention_${Date.now()}`,
			type: "mention",
			content: `@${u.username}`,
			x: 50,
			y: 50,
			extra: {
				userId: u._id,
				name: u.name
			}
		});
		onClose();
	};
	const handleCreateCustomSticker = () => {
		if (!inputText.trim()) return;
		let content = inputText.trim();
		if (activeType === "mention" && !content.startsWith("@")) content = `@${content}`;
		if (activeType === "hashtag" && !content.startsWith("#")) content = `#${content}`;
		onSelectSticker({
			id: `stk_${Date.now()}`,
			type: activeType,
			content,
			x: 50,
			y: 50
		});
		onClose();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4 rounded-3xl border border-white/20 bg-slate-950 p-5 shadow-2xl backdrop-blur-xl max-w-sm w-full mx-auto text-white select-none",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
					className: "font-display text-sm font-bold flex items-center gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4 text-amber-400" }), " Add Stickers"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onClose,
					className: "text-xs text-white/60 hover:text-white",
					children: "Cancel"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-1.5 overflow-x-auto pb-1 no-scrollbar",
				children: STICKER_TYPES.map((t) => {
					const Icon = t.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => {
							setActiveType(t.id);
							setInputText("");
						},
						className: cn("press flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold shrink-0 transition-all", activeType === t.id ? "bg-white text-slate-950 font-extrabold shadow-md" : "bg-white/10 text-white/70 hover:bg-white/20"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: cn("size-3.5", activeType === t.id ? "text-slate-950" : t.color) }), t.label]
					}, t.id);
				})
			}),
			activeType === "emoji" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "w-full h-[340px] flex flex-col overflow-hidden rounded-2xl border border-white/10 shadow-lg bg-slate-900",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmojiPicker$1, {
					theme: Theme.DARK,
					width: "100%",
					height: "100%",
					lazyLoadEmojis: true,
					searchPlaceHolder: "Search emoji...",
					onEmojiClick: (emojiData) => {
						onSelectSticker({
							id: `stk_${Date.now()}_${Math.random()}`,
							type: "emoji",
							content: emojiData.emoji,
							x: 50,
							y: 50
						});
						onClose();
					}
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 py-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "text",
						value: inputText,
						onChange: (e) => setInputText(e.target.value),
						placeholder: activeType === "mention" ? "Search @username..." : activeType === "location" ? "Enter location (e.g. Kigali, Rwanda)" : activeType === "hashtag" ? "Enter #hashtag" : activeType === "question" ? "Ask me anything..." : activeType === "poll" ? "Ask a question..." : "Countdown event...",
						className: "rounded-xl border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
					}),
					activeType === "mention" && userSearchResults.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-col gap-1 max-h-40 overflow-y-auto rounded-xl bg-white/10 p-2",
						children: userSearchResults.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => handleSelectMentionUser(u),
							className: "flex items-center gap-2.5 rounded-lg p-2 hover:bg-white/15 text-left transition-colors",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GAvatar, {
								user: u,
								size: "xs"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-xs font-bold leading-tight",
									children: u.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "truncate text-[10px] text-white/60",
									children: ["@", u.username]
								})]
							})]
						}, u._id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: handleCreateCustomSticker,
						disabled: !inputText.trim(),
						className: "press rounded-xl bg-white py-2.5 text-xs font-bold text-slate-950 shadow-lg disabled:opacity-40 hover:bg-white/90",
						children: "Add Sticker"
					})
				]
			})
		]
	});
}
var DRAW_COLORS = [
	"#FFFFFF",
	"#000000",
	"#FF3B30",
	"#FF9500",
	"#FFCC00",
	"#34C759",
	"#007AFF",
	"#AF52DE",
	"#FF2D55",
	"#00F5D4",
	"#FEE440"
];
function StoryDrawingTool({ onSave, onCancel, existingDrawing, slide }) {
	const canvasRef = (0, import_react.useRef)(null);
	const [tool, setTool] = (0, import_react.useState)("pen");
	const [color, setColor] = (0, import_react.useState)("#FFFFFF");
	const [strokeWidth, setStrokeWidth] = (0, import_react.useState)(6);
	const [isFilled, setIsFilled] = (0, import_react.useState)(false);
	const [isDrawing, setIsDrawing] = (0, import_react.useState)(false);
	const [startPos, setStartPos] = (0, import_react.useState)(null);
	const historyRef = (0, import_react.useRef)([]);
	const snapshotRef = (0, import_react.useRef)(null);
	const activeFilter = slide?.filter ? STORY_FILTERS.find((f) => f.id === slide.filter)?.cssFilter || "none" : "none";
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		canvas.width = 720;
		canvas.height = 1280;
		if (existingDrawing) {
			const img = new Image();
			img.onload = () => {
				ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
				saveHistoryState();
			};
			img.src = existingDrawing;
		} else saveHistoryState();
	}, []);
	const saveHistoryState = () => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		try {
			const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
			historyRef.current.push(data);
		} catch {}
	};
	const handleUndo = () => {
		if (historyRef.current.length <= 1) return;
		historyRef.current.pop();
		const previous = historyRef.current[historyRef.current.length - 1];
		const canvas = canvasRef.current;
		if (!canvas || !previous) return;
		const ctx = canvas.getContext("2d");
		if (ctx) ctx.putImageData(previous, 0, 0);
	};
	const getCanvasCoords = (e) => {
		const canvas = canvasRef.current;
		if (!canvas) return {
			x: 0,
			y: 0
		};
		const rect = canvas.getBoundingClientRect();
		const touch = "touches" in e ? e.touches[0] : void 0;
		const mouse = "clientX" in e ? e : void 0;
		const clientX = touch ? touch.clientX : mouse ? mouse.clientX : 0;
		const clientY = touch ? touch.clientY : mouse ? mouse.clientY : 0;
		return {
			x: (clientX - rect.left) / rect.width * canvas.width,
			y: (clientY - rect.top) / rect.height * canvas.height
		};
	};
	const startDrawing = (e) => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const { x, y } = getCanvasCoords(e);
		setIsDrawing(true);
		setStartPos({
			x,
			y
		});
		snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
		if (tool === "pen" || tool === "eraser") {
			ctx.beginPath();
			ctx.moveTo(x, y);
		}
	};
	const stopDrawing = () => {
		if (!isDrawing) return;
		setIsDrawing(false);
		setStartPos(null);
		snapshotRef.current = null;
		const canvas = canvasRef.current;
		if (canvas) {
			const ctx = canvas.getContext("2d");
			if (ctx) ctx.beginPath();
		}
		saveHistoryState();
	};
	const draw = (e) => {
		if (!isDrawing || !startPos) return;
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const { x, y } = getCanvasCoords(e);
		ctx.lineWidth = strokeWidth * 2.2;
		ctx.lineCap = "round";
		ctx.lineJoin = "round";
		if (tool === "pen") {
			ctx.globalCompositeOperation = "source-over";
			ctx.strokeStyle = color;
			ctx.lineTo(x, y);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(x, y);
		} else if (tool === "eraser") {
			ctx.globalCompositeOperation = "destination-out";
			ctx.lineTo(x, y);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(x, y);
		} else {
			if (snapshotRef.current) ctx.putImageData(snapshotRef.current, 0, 0);
			ctx.globalCompositeOperation = "source-over";
			ctx.strokeStyle = color;
			ctx.fillStyle = color;
			const width = x - startPos.x;
			const height = y - startPos.y;
			if (tool === "rectangle") {
				if (isFilled) ctx.fillRect(startPos.x, startPos.y, width, height);
				else ctx.strokeRect(startPos.x, startPos.y, width, height);
			} else if (tool === "circle") {
				const rx = Math.abs(width) / 2;
				const ry = Math.abs(height) / 2;
				const cx = startPos.x + width / 2;
				const cy = startPos.y + height / 2;
				ctx.beginPath();
				ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
				if (isFilled) ctx.fill();
				else ctx.stroke();
			} else if (tool === "line") {
				ctx.beginPath();
				ctx.moveTo(startPos.x, startPos.y);
				ctx.lineTo(x, y);
				ctx.stroke();
			} else if (tool === "arrow") {
				ctx.beginPath();
				ctx.moveTo(startPos.x, startPos.y);
				ctx.lineTo(x, y);
				ctx.stroke();
				const angle = Math.atan2(y - startPos.y, x - startPos.x);
				const headLen = ctx.lineWidth * 2.5;
				ctx.beginPath();
				ctx.moveTo(x, y);
				ctx.lineTo(x - headLen * Math.cos(angle - Math.PI / 6), y - headLen * Math.sin(angle - Math.PI / 6));
				ctx.lineTo(x - headLen * Math.cos(angle + Math.PI / 6), y - headLen * Math.sin(angle + Math.PI / 6));
				ctx.lineTo(x, y);
				ctx.fill();
			} else if (tool === "heart") drawHeart(ctx, startPos.x + width / 2, startPos.y + height / 2, Math.abs(width), isFilled);
			else if (tool === "star") drawStar(ctx, startPos.x + width / 2, startPos.y + height / 2, 5, Math.abs(width) / 2, Math.abs(width) / 4, isFilled);
		}
	};
	const drawHeart = (ctx, cx, cy, size, fill) => {
		ctx.save();
		ctx.beginPath();
		const topCurveHeight = size * .3;
		ctx.moveTo(cx, cy + size / 4);
		ctx.bezierCurveTo(cx, cy, cx - size / 2, cy, cx - size / 2, cy + topCurveHeight);
		ctx.bezierCurveTo(cx - size / 2, cy + (size + topCurveHeight) / 2, cx, cy + size / 2 + topCurveHeight, cx, cy + size / 2);
		ctx.bezierCurveTo(cx, cy + size / 2 + topCurveHeight, cx + size / 2, cy + (size + topCurveHeight) / 2, cx + size / 2, cy + topCurveHeight);
		ctx.bezierCurveTo(cx + size / 2, cy, cx, cy, cx, cy + size / 4);
		ctx.closePath();
		if (fill) ctx.fill();
		else ctx.stroke();
		ctx.restore();
	};
	const drawStar = (ctx, cx, cy, spikes, outerRadius, innerRadius, fill) => {
		let rot = Math.PI / 2 * 3;
		let x = cx;
		let y = cy;
		const step = Math.PI / spikes;
		ctx.beginPath();
		ctx.moveTo(cx, cy - outerRadius);
		for (let i = 0; i < spikes; i++) {
			x = cx + Math.cos(rot) * outerRadius;
			y = cy + Math.sin(rot) * outerRadius;
			ctx.lineTo(x, y);
			rot += step;
			x = cx + Math.cos(rot) * innerRadius;
			y = cy + Math.sin(rot) * innerRadius;
			ctx.lineTo(x, y);
			rot += step;
		}
		ctx.lineTo(cx, cy - outerRadius);
		ctx.closePath();
		if (fill) ctx.fill();
		else ctx.stroke();
	};
	const clearCanvas = () => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (ctx) {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			saveHistoryState();
		}
	};
	const handleDone = () => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		onSave(canvas.toDataURL("image/png"));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 flex flex-col justify-between bg-black/95 p-3 sm:p-4 backdrop-blur-2xl select-none text-white",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between z-10 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onCancel,
						className: "press grid size-9 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25",
						title: "Cancel",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar max-w-[280px]",
						children: [
							{
								id: "pen",
								label: "Pen",
								icon: PenTool
							},
							{
								id: "eraser",
								label: "Eraser",
								icon: Eraser
							},
							{
								id: "rectangle",
								label: "Square",
								icon: Square
							},
							{
								id: "circle",
								label: "Circle",
								icon: Circle
							},
							{
								id: "arrow",
								label: "Arrow",
								icon: ArrowUpRight
							},
							{
								id: "line",
								label: "Line",
								icon: Minus
							},
							{
								id: "heart",
								label: "Heart",
								icon: Heart
							},
							{
								id: "star",
								label: "Star",
								icon: Star
							}
						].map((t) => {
							const Icon = t.icon;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setTool(t.id),
								className: cn("press grid size-9 shrink-0 place-items-center rounded-xl transition-all", tool === t.id ? "bg-white text-slate-950 shadow-lg font-bold" : "bg-white/15 text-white hover:bg-white/25"),
								title: t.label,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4.5" })
							}, t.id);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5 sm:gap-2",
						children: [
							tool !== "pen" && tool !== "eraser" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setIsFilled(!isFilled),
								className: cn("press rounded-full border border-white/30 px-3 py-1.5 text-xs font-extrabold transition-all", isFilled ? "bg-white text-slate-950" : "bg-white/15 text-white"),
								children: isFilled ? "Fill" : "Outline"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: handleUndo,
								className: "press grid size-9 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25",
								title: "Undo",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Undo2, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: clearCanvas,
								className: "press grid size-9 place-items-center rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30",
								title: "Clear all",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "brand",
								size: "sm",
								onClick: handleDone,
								className: "rounded-full font-bold px-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4 mr-1" }), " Done"]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative flex-1 flex items-center justify-center p-2 overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative aspect-[9/16] h-full max-h-[680px] w-full overflow-hidden rounded-3xl shadow-2xl bg-black border border-white/20",
					style: {
						background: slide?.mediaThumbnail ? "black" : slide?.background || "#0c0c0e",
						filter: activeFilter
					},
					children: [slide?.mediaThumbnail && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0 flex items-center justify-center pointer-events-none",
						children: slide.mediaIsVideo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
							src: slide.mediaThumbnail,
							autoPlay: true,
							muted: true,
							loop: true,
							playsInline: true,
							className: "h-full w-full object-cover"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: slide.mediaThumbnail,
							alt: "",
							className: "h-full w-full object-cover"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
						ref: canvasRef,
						onMouseDown: startDrawing,
						onMouseUp: stopDrawing,
						onMouseMove: draw,
						onTouchStart: startDrawing,
						onTouchEnd: stopDrawing,
						onTouchMove: draw,
						className: "absolute inset-0 h-full w-full cursor-crosshair touch-none z-10"
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2.5 max-w-sm mx-auto w-full z-10 pb-1",
				children: [tool !== "eraser" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-2 justify-center overflow-x-auto no-scrollbar py-1",
					children: DRAW_COLORS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setColor(c),
						className: cn("press size-7 shrink-0 rounded-full border-2 transition-transform", color === c ? "border-white scale-125 shadow-lg ring-2 ring-white/50" : "border-transparent"),
						style: { backgroundColor: c }
					}, c))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 px-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-extrabold text-white shrink-0",
						children: "Thickness"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
						value: [strokeWidth],
						min: 2,
						max: 36,
						step: 1,
						onValueChange: (vals) => {
							const val = vals[0];
							if (val !== void 0) setStrokeWidth(val);
						}
					})]
				})]
			})
		]
	});
}
var STORY_BACKGROUND_PRESETS = [
	"linear-gradient(135deg, #FF512F, #DD2476)",
	"linear-gradient(135deg, #8A2387, #E94057, #F27121)",
	"linear-gradient(135deg, #00B4DB, #0083B0)",
	"linear-gradient(135deg, #11998e, #38ef7d)",
	"linear-gradient(135deg, #FC466B, #3F5EFB)",
	"linear-gradient(135deg, #0F2027, #203A43, #2C5364)",
	"linear-gradient(135deg, #FFE000, #799F0C)",
	"#000000",
	"#1E293B",
	"#475569",
	"#0F172A"
];
function StoryBackgroundPicker({ selectedBg, onSelectBg }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-2 rounded-2xl bg-black/60 p-3 backdrop-blur-md",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-1.5 text-xs font-bold text-white",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Palette, { className: "size-3.5" }), " Background Presets"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex gap-2 overflow-x-auto pb-1 no-scrollbar",
			children: STORY_BACKGROUND_PRESETS.map((preset, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => onSelectBg(preset),
				className: cn("press size-8 shrink-0 rounded-full border-2 transition-transform", selectedBg === preset ? "border-white scale-110" : "border-transparent"),
				style: { background: preset }
			}, idx))
		})]
	});
}
function StoryPreview({ user, slides, stickers, drawingUrl, onEdit, onPublish, isPublishing }) {
	const [activeSlideIndex, setActiveSlideIndex] = (0, import_react.useState)(0);
	const currentSlide = slides[activeSlideIndex] ?? slides[0] ?? {
		background: "#0c0c0e",
		textElements: [],
		filter: "normal"
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4 max-w-[360px] mx-auto w-full",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-base font-bold",
					children: "Story Preview"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "rounded-full bg-warning/20 px-3 py-1 text-xs font-semibold text-warning",
					children: "24h Expiry"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative aspect-[9/16] w-full overflow-hidden rounded-3xl bg-black shadow-float",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoryCanvas, {
						slide: currentSlide,
						stickers,
						drawingUrl
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute top-3 inset-x-3 z-30 flex gap-1",
						children: slides.map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-1 flex-1 overflow-hidden rounded-full bg-white/30",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `h-full bg-white transition-all ${i <= activeSlideIndex ? "w-full" : "w-0"}` })
						}, i))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute top-6 left-3 z-30 flex items-center gap-2 text-white",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GAvatar, {
								user,
								size: "xs",
								ring: "story"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-bold",
								children: user.username
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] opacity-75",
								children: "Just now"
							})
						]
					}),
					slides.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [activeSlideIndex > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setActiveSlideIndex((prev) => prev - 1),
						className: "press absolute left-2 top-1/2 z-30 -translate-y-1/2 grid size-8 place-items-center rounded-full bg-black/40 text-white",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-5" })
					}), activeSlideIndex < slides.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setActiveSlideIndex((prev) => prev + 1),
						className: "press absolute right-2 top-1/2 z-30 -translate-y-1/2 grid size-8 place-items-center rounded-full bg-black/40 text-white",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-5" })
					})] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between pt-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: onEdit,
					disabled: isPublishing,
					children: "Back to Edit"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "brand",
					onClick: onPublish,
					disabled: isPublishing,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" }), "Share Story"]
				})]
			})
		]
	});
}
function CloseFriendsModal({ onClose, onDone }) {
	const [followingUsers, setFollowingUsers] = (0, import_react.useState)([]);
	const [selectedIds, setSelectedIds] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [search, setSearch] = (0, import_react.useState)("");
	const [isLoading, setIsLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		async function loadFollowing() {
			try {
				const res = await api.get("/social/following");
				setFollowingUsers(res?.users ?? []);
			} catch {
				setFollowingUsers([]);
			} finally {
				setIsLoading(false);
			}
		}
		loadFollowing();
	}, []);
	const toggleSelect = (userId) => {
		const next = new Set(selectedIds);
		if (next.has(userId)) next.delete(userId);
		else next.add(userId);
		setSelectedIds(next);
	};
	const filtered = followingUsers.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.username.toLowerCase().includes(search.toLowerCase()));
	const handleSave = () => {
		onDone(Array.from(selectedIds));
		toast.success(`Close Friends list updated (${selectedIds.size} selected)`);
		onClose();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md select-none text-white",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-4 rounded-3xl border border-white/20 bg-slate-900 p-5 shadow-2xl max-w-sm w-full mx-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid size-8 place-items-center rounded-full bg-emerald-500 text-slate-950 font-bold",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-4 fill-slate-950" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-sm font-bold",
							children: "Close Friends"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-white/60",
							children: "Choose followers to share private stories"
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						className: "text-white/60 hover:text-white",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/50" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "text",
						value: search,
						onChange: (e) => setSearch(e.target.value),
						placeholder: "Search people you follow...",
						className: "w-full rounded-xl border border-white/15 bg-white/10 pl-9 pr-3 py-2 text-xs text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-1.5 max-h-64 overflow-y-auto no-scrollbar",
					children: [
						isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-center py-8 text-xs text-white/60 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin text-emerald-400" }), " Loading people you follow…"]
						}),
						!isLoading && filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "py-8 text-center text-xs text-white/50",
							children: "No people found in your following list."
						}),
						filtered.map((u) => {
							const selected = selectedIds.has(u._id);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => toggleSelect(u._id),
								className: cn("flex items-center justify-between rounded-2xl p-2.5 transition-colors text-left", selected ? "bg-emerald-500/20 border border-emerald-500/40" : "hover:bg-white/10"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2.5 min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GAvatar, {
										user: u,
										size: "xs"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "truncate text-xs font-bold leading-tight",
											children: u.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "truncate text-[10px] text-white/60",
											children: ["@", u.username]
										})]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: cn("grid size-6 place-items-center rounded-full border transition-all", selected ? "border-emerald-500 bg-emerald-500 text-slate-950" : "border-white/30"),
									children: selected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5 stroke-[3]" })
								})]
							}, u._id);
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "brand",
					onClick: handleSave,
					className: "w-full rounded-2xl font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950",
					children: [
						"Save Close Friends (",
						selectedIds.size,
						")"
					]
				})
			]
		})
	});
}
var NAMED_COLORS = {
	white: "#ffffff",
	black: "#000000",
	red: "#ff0000",
	green: "#008000",
	blue: "#0000ff",
	yellow: "#ffff00",
	orange: "#ffa500",
	purple: "#800080",
	pink: "#ffc0cb",
	transparent: "rgba(0,0,0,0)"
};
function normalizeColor(raw) {
	const token = raw.trim().toLowerCase();
	if (/^#[0-9a-f]{3}$/.test(token)) return `#${token[1]}${token[1]}${token[2]}${token[2]}${token[3]}${token[3]}`;
	if (/^#[0-9a-f]{6}$/.test(token)) return token;
	if (/^#[0-9a-f]{8}$/.test(token)) return token;
	if (/^rgba?\(/.test(token) && /\)$/.test(token)) return token;
	if (/^hsla?\(/.test(token) && /\)$/.test(token)) return token;
	if (NAMED_COLORS[token]) return NAMED_COLORS[token];
	return null;
}
/** Split a comma-separated list respecting parentheses nesting. */
function splitTopLevel(input) {
	const parts = [];
	let depth = 0;
	let current = "";
	for (const ch of input) {
		if (ch === "(") depth++;
		if (ch === ")") depth--;
		if (ch === "," && depth === 0) {
			parts.push(current);
			current = "";
		} else current += ch;
	}
	parts.push(current);
	return parts.map((p) => p.trim()).filter(Boolean);
}
/**
* Parses `linear-gradient(...)`. Returns null when the string isn't a
* parseable linear gradient (callers fall back to a solid color).
*/
function parseLinearGradient(css) {
	if (typeof css !== "string") return null;
	const match = css.trim().match(/^linear-gradient\((.*)\)$/i);
	if (!match || !match[1]) return null;
	const parts = splitTopLevel(match[1]);
	const firstPart = parts[0];
	if (!firstPart || parts.length < 2) return null;
	let angleDeg = 180;
	let start = 0;
	const first = firstPart.toLowerCase();
	if (/^-?\d*\.?\d+deg$/.test(first)) {
		angleDeg = parseFloat(first);
		start = 1;
	} else if (/^to\s+/.test(first)) {
		angleDeg = sideOrCornerToAngle(first);
		start = 1;
	}
	const stopTokens = parts.slice(start);
	if (stopTokens.length < 2) return null;
	const rawStops = [];
	for (const token of stopTokens) {
		const m = token.match(/^(.*?)(?:\s+([\d.]+)%)?$|^([\d.]+)%\s+(.*)$/);
		if (!m) return null;
		let colorRaw = m[1];
		let posRaw = m[2];
		if (m[3] !== void 0 && m[4] !== void 0) {
			posRaw = m[3];
			colorRaw = m[4];
		}
		const color = normalizeColor(colorRaw ?? "");
		if (!color) return null;
		rawStops.push({
			color,
			pos: posRaw !== void 0 && posRaw !== "" ? parseFloat(posRaw) / 100 : null
		});
	}
	const stops = [];
	const firstIdx = rawStops.findIndex((s) => s.pos !== null);
	if (firstIdx === -1) rawStops.forEach((s, i) => stops.push({
		color: s.color,
		pos: i / (rawStops.length - 1)
	}));
	else {
		for (let i = 0; i < firstIdx; i++) stops.push({
			color: rawStops[i].color,
			pos: 0
		});
		for (let i = firstIdx; i < rawStops.length; i++) {
			const s = rawStops[i];
			if (s.pos !== null) {
				stops.push({
					color: s.color,
					pos: s.pos
				});
				continue;
			}
			let next = i + 1;
			while (next < rawStops.length && rawStops[next].pos === null) next++;
			const nextPos = next < rawStops.length ? rawStops[next].pos : 1;
			const prevPos = stops.length > 0 ? stops[stops.length - 1].pos : 0;
			const span = Math.max(1, next - i);
			stops.push({
				color: s.color,
				pos: prevPos + (nextPos - prevPos) * (next - i) / span / (next - i)
			});
			stops[stops.length - 1].pos = prevPos + (nextPos - prevPos) / span;
			for (let j = i + 1; j < next; j++) stops.push({
				color: rawStops[j].color,
				pos: prevPos + (nextPos - prevPos) * (j - i + 1) / span
			});
			i = next - 1;
		}
		if (stops.length < rawStops.length + firstIdx) {}
	}
	return {
		angleDeg: (angleDeg % 360 + 360) % 360,
		stops
	};
}
function sideOrCornerToAngle(token) {
	switch (token.replace(/\s+/g, " ").trim()) {
		case "to top": return 0;
		case "to top right":
		case "to right top": return 45;
		case "to right": return 90;
		case "to bottom right":
		case "to right bottom": return 135;
		case "to bottom": return 180;
		case "to bottom left":
		case "to left bottom": return 225;
		case "to left": return 270;
		case "to top left":
		case "to left top": return 315;
		default: return 180;
	}
}
/**
* Canvas gradient endpoint math. CSS angles: 0deg = to top, clockwise. The
* gradient line passes through the centre in direction (sinθ, −cosθ) and is
* corner-fitted: its length is |W·sinθ| + |H·cosθ| (the same construction
* browsers use), so the endpoints may lie outside the box for diagonal
* angles — exactly matching what CSS paints.
*/
function gradientLineForAngle(angleDeg, width, height) {
	const theta = angleDeg * Math.PI / 180;
	const ux = Math.sin(theta);
	const uy = -Math.cos(theta);
	const cx = width / 2;
	const cy = height / 2;
	const half = (Math.abs(width * Math.sin(theta)) + Math.abs(height * Math.cos(theta))) / 2;
	return {
		x0: cx - ux * half,
		y0: cy - uy * half,
		x1: cx + ux * half,
		y1: cy + uy * half
	};
}
/** Fills a canvas context with the parsed gradient (or solid fallback). */
function paintBackground(ctx, background, width, height) {
	const parsed = parseLinearGradient(background);
	if (!parsed) {
		ctx.fillStyle = normalizeColor(background) ?? "#0c0c0e";
		ctx.fillRect(0, 0, width, height);
		return;
	}
	const { x0, y0, x1, y1 } = gradientLineForAngle(parsed.angleDeg, width, height);
	const grad = ctx.createLinearGradient(x0, y0, x1, y1);
	for (const stop of parsed.stops) grad.addColorStop(Math.min(1, Math.max(0, stop.pos)), stop.color);
	ctx.fillStyle = grad;
	ctx.fillRect(0, 0, width, height);
}
function useStories() {
	const { user } = useAuth();
	return useQuery({
		queryKey: ["stories"],
		queryFn: () => api.get("/stories"),
		enabled: Boolean(user),
		refetchInterval: 6e4
	});
}
function useCreateStory() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input) => api.post("/stories", input),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["stories"] })
	});
}
function useMarkStoryViewed() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (storyId) => api.post(`/stories/${storyId}/view`),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["stories"] })
	});
}
function useReplyToStory() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ storyId, message }) => api.post(`/stories/${storyId}/reply`, { message }),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] })
	});
}
function useDeleteStory() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (storyId) => api.delete(`/stories/${storyId}`),
		onMutate: async (storyId) => {
			await queryClient.cancelQueries({ queryKey: ["stories"] });
			const previous = queryClient.getQueryData(["stories"]);
			if (previous?.stories) queryClient.setQueryData(["stories"], { stories: previous.stories.map((group) => ({
				...group,
				items: group.items.filter((item) => item._id !== storyId)
			})).filter((group) => group.items.length > 0) });
			return { previous };
		},
		onError: (_err, _storyId, context) => {
			if (context?.previous) queryClient.setQueryData(["stories"], context.previous);
		},
		onSettled: () => queryClient.invalidateQueries({ queryKey: ["stories"] })
	});
}
function StoryCreator({ onClose }) {
	const navigate = useNavigate();
	const { user } = useSessionUser();
	const fileInputRef = (0, import_react.useRef)(null);
	const [view, setView] = (0, import_react.useState)("camera");
	const [activeModal, setActiveModal] = (0, import_react.useState)("none");
	const [slides, setSlides] = (0, import_react.useState)([{
		background: "#0c0c0e",
		textElements: [],
		filter: "normal"
	}]);
	const [activeSlideIndex, setActiveSlideIndex] = (0, import_react.useState)(0);
	const [stickers, setStickers] = (0, import_react.useState)([]);
	const [drawingUrl, setDrawingUrl] = (0, import_react.useState)();
	const [editingTextElement, setEditingTextElement] = (0, import_react.useState)();
	const [audience, setAudience] = (0, import_react.useState)("everyone");
	const [closeFriendIds, setCloseFriendIds] = (0, import_react.useState)([]);
	const [showUnsavedGuard, setShowUnsavedGuard] = (0, import_react.useState)(false);
	const [uploadStage, setUploadStage] = (0, import_react.useState)(null);
	const [uploadProgress, setUploadProgress] = (0, import_react.useState)(0);
	const [uploadError, setUploadError] = (0, import_react.useState)();
	const createStory = useCreateStory();
	const currentSlide = slides[activeSlideIndex] ?? slides[0] ?? {
		background: "#0c0c0e",
		textElements: [],
		filter: "normal"
	};
	const canvasStageRef = (0, import_react.useRef)(null);
	const handleCameraCapture = (captured) => {
		setSlides((prev) => {
			const next = [...prev];
			const base = next[activeSlideIndex] ?? {
				background: "#0c0c0e",
				textElements: [],
				filter: "normal"
			};
			next[activeSlideIndex] = {
				...base,
				mediaFileName: captured.file.name,
				mediaThumbnail: captured.previewUrl,
				mediaIsVideo: captured.isVideo,
				mediaFile: captured.file
			};
			return next;
		});
		setView("editor");
	};
	const handleFileSelect = (file) => {
		if (file.type.startsWith("video/")) {
			const tempVideo = document.createElement("video");
			tempVideo.preload = "metadata";
			tempVideo.src = URL.createObjectURL(file);
			tempVideo.onloadedmetadata = () => {
				URL.revokeObjectURL(tempVideo.src);
				if (tempVideo.duration > 120) {
					toast.error("Story videos must be 2 minutes or less");
					return;
				}
				const previewUrl = URL.createObjectURL(file);
				handleCameraCapture({
					file,
					previewUrl,
					isVideo: true
				});
			};
			tempVideo.onerror = () => {
				toast.error("Invalid or corrupted video file");
			};
		} else {
			const previewUrl = URL.createObjectURL(file);
			handleCameraCapture({
				file,
				previewUrl,
				isVideo: false
			});
		}
	};
	const handleSaveTextElement = (element) => {
		setSlides((prev) => {
			const next = [...prev];
			const base = next[activeSlideIndex] ?? {
				background: "#0c0c0e",
				textElements: [],
				filter: "normal"
			};
			const existingIdx = base.textElements.findIndex((t) => t.id === element.id);
			if (existingIdx >= 0) base.textElements[existingIdx] = element;
			else base.textElements.push(element);
			next[activeSlideIndex] = base;
			return next;
		});
		setActiveModal("none");
		setEditingTextElement(void 0);
	};
	const handleSaveDraft = () => {
		saveDraft({
			type: "story",
			slides
		});
		toast.success("Story saved to drafts");
		onClose();
	};
	const handlePublish = async (selectedAudience = audience) => {
		if (!user) return;
		setUploadStage("preparing");
		setUploadProgress(0);
		setUploadError(void 0);
		try {
			let finalMediaUrl = "";
			let mediaType = currentSlide.mediaIsVideo ? "video" : "image";
			if (currentSlide.mediaIsVideo && currentSlide.mediaFile) {
				setUploadStage("uploading");
				finalMediaUrl = (await uploadFile("stories", currentSlide.mediaFile, (pct) => setUploadProgress(pct))).url;
			} else {
				setUploadStage("uploading");
				const previewWidth = canvasStageRef.current?.getBoundingClientRect().width || 360;
				const canvasBlob = await compositeStoryToBlob(currentSlide, stickers, drawingUrl, previewWidth);
				const storyFile = new File([canvasBlob], `story_${Date.now()}.jpg`, { type: "image/jpeg" });
				finalMediaUrl = (await uploadFile("stories", storyFile, (pct) => setUploadProgress(pct))).url;
				mediaType = "image";
			}
			setUploadStage("publishing");
			await createStory.mutateAsync({
				mediaUrl: finalMediaUrl,
				mediaType,
				caption: currentSlide.textElements[0]?.text || void 0,
				audience: selectedAudience
			});
			setUploadStage("completed");
			toast.success(selectedAudience === "close_friends" ? "Shared with Close Friends!" : "Story shared with your followers!");
			setTimeout(() => {
				onClose();
				navigate({ to: "/" });
			}, 1e3);
		} catch (err) {
			setUploadStage("failed");
			setUploadError(err?.message || "Failed to share story.");
		}
	};
	if (!user) return null;
	if (view === "camera") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoryCamera, {
		onCaptureMedia: handleCameraCapture,
		onOpenGallery: () => fileInputRef.current?.click(),
		onOpenTextStory: () => setView("editor"),
		onClose
	});
	if (view === "preview") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full w-full flex-col items-center justify-center p-4 bg-slate-950 text-white",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoryPreview, {
			user,
			slides,
			stickers,
			drawingUrl,
			onEdit: () => setView("editor"),
			onPublish: () => handlePublish("everyone"),
			isPublishing: uploadStage !== null
		}), uploadStage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UploadProgress, {
			stage: uploadStage,
			progress: uploadProgress,
			error: uploadError,
			onRetry: () => handlePublish(audience),
			onCancel: () => setUploadStage(null),
			onDone: () => {
				setUploadStage(null);
				onClose();
			}
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex h-full w-full flex-col bg-slate-950 text-white overflow-hidden select-none",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: fileInputRef,
				type: "file",
				accept: "image/*,video/*",
				className: "hidden",
				onChange: (e) => {
					const f = e.target.files?.[0];
					if (f) handleFileSelect(f);
					e.target.value = "";
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-30 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						if (slides.some((s) => s.mediaFile || s.textElements.length > 0)) setShowUnsavedGuard(true);
						else onClose();
					},
					className: "press grid size-10 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-6" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => fileInputRef.current?.click(),
							className: "press flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/30 backdrop-blur-md",
							title: "Upload photo or video (max 2 mins)",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudUpload, { className: "size-4.5 text-sky-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Upload" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								setEditingTextElement(void 0);
								setActiveModal("text");
							},
							className: "press grid size-10 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md font-bold text-sm",
							title: "Add Text",
							children: "Aa"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setActiveModal("stickers"),
							className: "press grid size-10 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md",
							title: "Add Sticker",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smile, { className: "size-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setActiveModal("draw"),
							className: "press grid size-10 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md",
							title: "Drawing Tool",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenTool, { className: "size-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setActiveModal("background"),
							className: "press grid size-10 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md",
							title: "Background Preset",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Palette, { className: "size-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setActiveModal("effects"),
							className: "press grid size-10 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md text-amber-400",
							title: "Filters",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-5" })
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: canvasStageRef,
				className: "relative flex-1 flex items-center justify-center p-2 overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoryCanvas, {
					slide: currentSlide,
					stickers,
					drawingUrl,
					onUpdateTextPosition: (id, x, y) => {
						const next = [...slides];
						const target = (next[activeSlideIndex]?.textElements)?.find((t) => t.id === id);
						if (target) {
							target.x = x;
							target.y = y;
							setSlides(next);
						}
					},
					onUpdateStickerPosition: (id, x, y) => {
						setStickers((prev) => prev.map((s) => s.id === id ? {
							...s,
							x,
							y
						} : s));
					},
					onUpdateTextScale: (id, scale) => {
						const next = [...slides];
						const target = (next[activeSlideIndex]?.textElements)?.find((t) => t.id === id);
						if (target) {
							target.scale = scale;
							setSlides(next);
						}
					},
					onUpdateStickerScale: (id, scale) => {
						setStickers((prev) => prev.map((s) => s.id === id ? {
							...s,
							scale
						} : s));
					},
					onSelectTextElement: (el) => {
						setEditingTextElement(el);
						setActiveModal("text");
					},
					onRemoveTextElement: (id) => {
						const next = [...slides];
						const slide = next[activeSlideIndex];
						if (slide) slide.textElements = slide.textElements.filter((t) => t.id !== id);
						setSlides(next);
					},
					onRemoveSticker: (id) => setStickers(stickers.filter((s) => s.id !== id))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-30 flex flex-wrap items-center justify-between gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-black/95 via-black/60 to-transparent",
				children: [
					slides.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "absolute -top-8 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-[10px] font-bold text-white/70 backdrop-blur-md",
						children: [
							"Sharing slide ",
							activeSlideIndex + 1,
							" of ",
							slides.length
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => {
							setAudience("everyone");
							handlePublish("everyone");
						},
						className: "press flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/25 backdrop-blur-md",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GAvatar, {
							user,
							size: "xs"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Your Story" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setActiveModal("close_friends"),
						className: "press flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/25 backdrop-blur-md",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid size-5 place-items-center rounded-full bg-emerald-500 text-slate-950 font-bold",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-3 fill-slate-950" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Close Friends ", closeFriendIds.length > 0 ? `(${closeFriendIds.length})` : ""] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setView("preview"),
						className: "press flex items-center gap-1 rounded-full bg-white px-4 py-2 text-xs font-extrabold text-slate-950 shadow-lg hover:bg-white/90",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Sent to" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-bold",
							children: "›"
						})]
					})
				]
			}),
			activeModal === "text" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoryTextEditor, {
				initialText: editingTextElement,
				onSave: handleSaveTextElement,
				onCancel: () => {
					setActiveModal("none");
					setEditingTextElement(void 0);
				}
			}),
			activeModal === "stickers" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoryStickerPicker, {
					onSelectSticker: (stk) => setStickers([...stickers, stk]),
					onClose: () => setActiveModal("none")
				})
			}),
			activeModal === "draw" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoryDrawingTool, {
				existingDrawing: drawingUrl,
				slide: currentSlide,
				onSave: (url) => {
					setDrawingUrl(url);
					setActiveModal("none");
				},
				onCancel: () => setActiveModal("none")
			}),
			activeModal === "background" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed bottom-24 inset-x-4 z-50 max-w-sm mx-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoryBackgroundPicker, {
					selectedBg: currentSlide.background,
					onSelectBg: (bg) => {
						const next = [...slides];
						const slide = next[activeSlideIndex];
						if (slide) slide.background = bg;
						setSlides(next);
					}
				})
			}),
			activeModal === "close_friends" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloseFriendsModal, {
				onClose: () => setActiveModal("none"),
				onDone: (ids) => {
					setCloseFriendIds(ids);
					setAudience("close_friends");
					handlePublish("close_friends");
				}
			}),
			uploadStage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UploadProgress, {
				stage: uploadStage,
				progress: uploadProgress,
				error: uploadError,
				onRetry: () => handlePublish(audience),
				onCancel: () => setUploadStage(null),
				onDone: () => {
					setUploadStage(null);
					onClose();
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnsavedChangesGuard, {
				open: showUnsavedGuard,
				onSaveDraft: handleSaveDraft,
				onDiscard: () => {
					setShowUnsavedGuard(false);
					onClose();
				},
				onContinue: () => setShowUnsavedGuard(false)
			})
		]
	});
}
var STORY_EXPORT_W = 1080;
var STORY_EXPORT_H = 1920;
/** Maps the preview's font classes to canvas font stacks. */
function canvasFontFor(fontId, sizePx) {
	switch (fontId) {
		case "modern": return `700 ${sizePx}px "Manrope", ui-sans-serif, system-ui, sans-serif`;
		case "bold": return `900 ${sizePx}px "Sora", ui-sans-serif, system-ui, sans-serif`;
		case "serif": return `italic 600 ${sizePx}px Georgia, "Times New Roman", ui-serif, serif`;
		case "mono": return `500 ${sizePx}px "Courier New", ui-monospace, monospace`;
		case "fun": return `800 ${sizePx}px "Sora", ui-sans-serif, system-ui, sans-serif`;
		case "minimal": return `500 ${sizePx}px "Manrope", ui-sans-serif, system-ui, sans-serif`;
		default: return `800 ${sizePx}px "Sora", ui-sans-serif, system-ui, sans-serif`;
	}
}
function loadImage(url) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		if (!url.startsWith("blob:") && !url.startsWith("data:")) img.crossOrigin = "anonymous";
		img.onload = () => resolve(img);
		img.onerror = () => reject(/* @__PURE__ */ new Error(`Could not load story layer: ${url.slice(0, 60)}…`));
		img.src = url;
	});
}
function wrapText(ctx, text, maxWidth) {
	const lines = [];
	for (const paragraph of text.split("\n")) {
		const words = paragraph.split(" ");
		let line = "";
		for (const word of words) {
			const candidate = line ? `${line} ${word}` : word;
			if (ctx.measureText(candidate).width <= maxWidth || !line) line = candidate;
			else {
				lines.push(line);
				line = word;
			}
		}
		lines.push(line);
	}
	return lines;
}
async function compositeStoryToBlob(slide, stickers, drawingUrl, previewWidth) {
	const canvas = document.createElement("canvas");
	canvas.width = STORY_EXPORT_W;
	canvas.height = STORY_EXPORT_H;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("No canvas 2d context");
	try {
		await document.fonts?.ready;
	} catch {}
	const scale = STORY_EXPORT_W / Math.max(1, previewWidth);
	if (slide.mediaThumbnail) try {
		const bgImg = await loadImage(slide.mediaThumbnail);
		const imgRatio = bgImg.width / bgImg.height;
		const boxRatio = STORY_EXPORT_W / STORY_EXPORT_H;
		let dw = STORY_EXPORT_W;
		let dh = STORY_EXPORT_H;
		if (imgRatio > boxRatio) {
			dh = STORY_EXPORT_H;
			dw = dh * imgRatio;
		} else {
			dw = STORY_EXPORT_W;
			dh = dw / imgRatio;
		}
		const dx = (STORY_EXPORT_W - dw) / 2;
		const dy = (STORY_EXPORT_H - dh) / 2;
		ctx.drawImage(bgImg, dx, dy, dw, dh);
	} catch (err) {
		throw err instanceof Error ? err : /* @__PURE__ */ new Error("Story background failed to load");
	}
	else paintBackground(ctx, slide.background || "#0c0c0e", STORY_EXPORT_W, STORY_EXPORT_H);
	if (drawingUrl) try {
		const drawImg = await loadImage(drawingUrl);
		ctx.drawImage(drawImg, 0, 0, STORY_EXPORT_W, STORY_EXPORT_H);
	} catch (err) {
		console.warn("[StoryCreator] drawing layer skipped:", err);
	}
	for (const el of slide.textElements) {
		ctx.save();
		const posX = el.x / 100 * STORY_EXPORT_W;
		const posY = el.y / 100 * STORY_EXPORT_H;
		const scaleF = (el.scale || 1) * scale;
		ctx.translate(posX, posY);
		ctx.rotate((el.rotation || 0) * Math.PI / 180);
		const fontSize = Math.max(8, el.fontSize * scaleF);
		ctx.font = canvasFontFor(el.font, fontSize);
		ctx.textBaseline = "middle";
		const lines = wrapText(ctx, el.font === "fun" || el.font === "minimal" ? el.text.toUpperCase() : el.text, STORY_EXPORT_W * .85);
		const lineHeight = fontSize * 1.3;
		const padding = fontSize * .45;
		let minY = -(lines.length * lineHeight) / 2;
		for (const line of lines) {
			const y = minY + lineHeight / 2;
			if (el.bgColor && el.bgColor !== "transparent") {
				const w = ctx.measureText(line).width;
				const x0 = el.alignment === "left" ? 0 : el.alignment === "right" ? -w - padding : -w / 2 - padding;
				ctx.fillStyle = el.bgColor;
				const pillX = x0;
				const pillY = y - lineHeight / 2 - padding / 2;
				const pillW = w + padding * 2;
				const pillH = lineHeight + padding / 2;
				const r = pillH / 2;
				ctx.beginPath();
				ctx.roundRect?.(pillX, pillY, pillW, pillH, r);
				if (!ctx.roundRect) ctx.rect(pillX, pillY, pillW, pillH);
				ctx.fill();
			}
			ctx.fillStyle = el.color || "#FFFFFF";
			ctx.textAlign = el.alignment || "center";
			ctx.shadowColor = "rgba(0,0,0,0.45)";
			ctx.shadowBlur = fontSize * .18;
			ctx.shadowOffsetY = fontSize * .06;
			ctx.fillText(line, 0, y);
			ctx.shadowColor = "transparent";
			ctx.shadowBlur = 0;
			ctx.shadowOffsetY = 0;
			minY += lineHeight;
		}
		ctx.restore();
	}
	for (const stk of stickers) {
		ctx.save();
		const posX = (stk.x ?? 50) / 100 * STORY_EXPORT_W;
		const posY = (stk.y ?? 50) / 100 * STORY_EXPORT_H;
		const scaleF = (stk.scale || 1) * scale;
		ctx.translate(posX, posY);
		ctx.rotate((stk.rotation || 0) * Math.PI / 180);
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.shadowColor = "rgba(0,0,0,0.7)";
		ctx.shadowBlur = 12;
		ctx.shadowOffsetY = 4;
		if (stk.type === "emoji") {
			ctx.font = `400 ${Math.round(60 * scaleF)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
			ctx.fillText(stk.content, 0, 0);
		} else if (stk.type === "location") {
			ctx.font = `800 ${Math.round(18 * scaleF)}px "Manrope", sans-serif`;
			ctx.fillStyle = "#34d399";
			ctx.fillText(`📍 ${stk.content}`, 0, 0);
		} else if (stk.type === "mention") {
			ctx.font = `800 ${Math.round(20 * scaleF)}px "Manrope", sans-serif`;
			ctx.fillStyle = "#ffffff";
			ctx.fillText(stk.content, 0, 0);
		} else if (stk.type === "hashtag") {
			ctx.font = `800 ${Math.round(18 * scaleF)}px "Manrope", sans-serif`;
			ctx.fillStyle = "#38bdf8";
			ctx.fillText(stk.content, 0, 0);
		} else {
			ctx.font = `800 ${Math.round(16 * scaleF)}px "Manrope", sans-serif`;
			ctx.fillStyle = "#ffffff";
			ctx.fillText(stk.content, 0, 0);
		}
		ctx.restore();
	}
	return new Promise((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (blob) resolve(blob);
			else reject(/* @__PURE__ */ new Error("Story export failed — the canvas could not be encoded"));
		}, "image/jpeg", .92);
	});
}
var state = {
	open: false,
	mode: "post"
};
var listeners = /* @__PURE__ */ new Set();
var emit = () => listeners.forEach((l) => l());
var subscribe = (cb) => {
	listeners.add(cb);
	return () => listeners.delete(cb);
};
var snapshot = () => state;
function openCreate(mode = "post") {
	state = {
		open: true,
		mode
	};
	emit();
}
function closeCreate() {
	state = {
		...state,
		open: false
	};
	emit();
}
function CreateHost() {
	const s = (0, import_react.useSyncExternalStore)(subscribe, snapshot, snapshot);
	const isMobile = useIsMobile();
	const [mode, setMode] = (0, import_react.useState)("post");
	(0, import_react.useEffect)(() => {
		if (s.open) setMode(s.mode);
	}, [s.open, s.mode]);
	if (!s.open) return null;
	const content = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col min-h-0 h-full w-full bg-background",
		children: [mode !== "story" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex shrink-0 items-center justify-center gap-1 border-b border-border bg-surface p-2",
			children: [
				{
					id: "post",
					label: "Post",
					icon: Sparkles
				},
				{
					id: "reel",
					label: "Reel",
					icon: Video
				},
				{
					id: "story",
					label: "Story",
					icon: Radio
				}
			].map((t) => {
				const Icon = t.icon;
				const isActive = mode === t.id;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setMode(t.id),
					className: cn("press flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all", isActive ? "bg-primary-soft text-primary shadow-sm" : "text-muted-foreground hover:bg-muted"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), t.label]
				}, t.id);
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("flex-1 min-h-0", mode === "story" ? "overflow-hidden" : "overflow-y-auto no-scrollbar"),
			children: [
				mode === "post" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PostCreator, { onClose: closeCreate }),
				mode === "reel" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReelCreator, { onClose: closeCreate }),
				mode === "story" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoryCreator, { onClose: closeCreate })
			]
		})]
	});
	if (isMobile) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer$1, {
		open: s.open,
		onOpenChange: (o) => !o ? closeCreate() : null,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawerContent, {
			className: cn("p-0 overflow-hidden border-none", mode === "story" ? "h-[100dvh] max-h-[100dvh] rounded-none pb-[env(safe-area-inset-bottom)]" : "h-[96dvh] max-h-[96dvh] rounded-t-3xl"),
			children: content
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: s.open,
		onOpenChange: (o) => !o ? closeCreate() : null,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "h-[min(92dvh,900px)] max-h-[min(92dvh,900px)] max-w-[760px] overflow-hidden p-0 gap-0 rounded-3xl border-border",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, {
				className: "sr-only",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Content Creator" })
			}), content]
		})
	});
}
function BottomNav() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const { user } = useAuth();
	const profileLink = user?.username ? `/profile/${user.username}` : "/welcome";
	const items = [
		{
			label: "Home",
			icon: House,
			to: "/"
		},
		{
			label: "Live",
			icon: Radio,
			to: "/live"
		},
		{
			label: "Reels",
			icon: Film,
			to: "/reels"
		},
		{
			label: "Profile",
			icon: User,
			to: profileLink
		}
	];
	const leftItems = items.slice(0, 2);
	const rightItems = items.slice(2, 4);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-x-0 bottom-0 z-50 lg:hidden pointer-events-none",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative w-full h-[68px] pb-[env(safe-area-inset-bottom)] pointer-events-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
					className: "absolute inset-0 w-full h-full text-card fill-current drop-shadow-[0_-4px_16px_rgba(0,0,0,0.12)] dark:drop-shadow-[0_-6px_20px_rgba(0,0,0,0.45)]",
					preserveAspectRatio: "none",
					viewBox: "0 0 1000 160",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M 0,0 L 415,0 C 450,0 458,72 500,72 C 542,72 550,0 585,0 L 1000,0 L 1000,160 L 0,160 Z" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute left-1/2 -top-4 -translate-x-1/2 z-20",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "Create post",
						onClick: () => openCreate("post"),
						className: "press gradient-brand flex size-[52px] items-center justify-center rounded-full text-primary-foreground shadow-glow ring-[5px] ring-card transition-all active:scale-90",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
							className: "size-6 text-primary-foreground",
							strokeWidth: 3
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative z-10 flex h-full items-center justify-between px-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-1 items-center justify-around pr-3",
							children: leftItems.map((item) => {
								const active = pathname === item.to;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: item.to,
									className: cn("flex flex-col items-center gap-0.5 py-1 text-center transition-colors", active ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, {
										className: cn("size-[22px]", active && "fill-current"),
										strokeWidth: active ? 2.5 : 1.9
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: cn("text-[11px] leading-none tracking-tight", active ? "font-bold" : "font-medium"),
										children: item.label
									})]
								}, item.label);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-14 shrink-0" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-1 items-center justify-around pl-3",
							children: rightItems.map((item) => {
								const active = pathname === item.to;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: item.to,
									className: cn("flex flex-col items-center gap-0.5 py-1 text-center transition-colors", active ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, {
										className: cn("size-[22px]", active && "fill-current"),
										strokeWidth: active ? 2.5 : 1.9
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: cn("text-[11px] leading-none tracking-tight", active ? "font-bold" : "font-medium"),
										children: item.label
									})]
								}, item.label);
							})
						})
					]
				})
			]
		})
	});
}
function formatCount(n) {
	if (n >= 1e6) return `${(n / 1e6).toFixed(1).replace(/\.0$/, "")}M`;
	if (n >= 1e3) return `${(n / 1e3).toFixed(1).replace(/\.0$/, "")}K`;
	return String(n);
}
function timeAgo(date) {
	const then = new Date(date).getTime();
	const seconds = Math.max(0, Math.floor((Date.now() - then) / 1e3));
	if (seconds < 60) return "now";
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes}m`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h`;
	const days = Math.floor(hours / 24);
	if (days < 7) return `${days}d`;
	const weeks = Math.floor(days / 7);
	if (weeks < 5) return `${weeks}w`;
	const months = Math.floor(days / 30);
	if (months < 12) return `${months}mo`;
	return `${Math.floor(days / 365)}y`;
}
function toDisplayUser$1(u) {
	return {
		id: u._id,
		name: u.name,
		username: u.username,
		bio: "",
		avatarHue: u.avatarHue,
		avatarUrl: u.avatarUrl,
		verified: u.verified,
		creator: u.isCreator,
		live: u.isLive,
		followers: u.followersCount,
		following: 0,
		posts: 0
	};
}
function Panel({ title, icon: Icon, children, action, actionTo }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "surface-card p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "mb-3 flex items-center gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4 text-primary" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-bold tracking-tight",
					children: title
				}),
				action && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: actionTo ?? "/explore",
					className: "ml-auto text-xs font-semibold text-primary hover:underline",
					children: action
				})
			]
		}), children]
	});
}
function RightRail() {
	const { data: tagsData } = useTrendingTags();
	const { data: suggestedData } = useSuggestedUsers();
	const followUser = useFollowUser();
	const { data: followingSet } = useFollowingSet();
	const tags = (tagsData?.tags ?? []).slice(0, 5);
	const suggested = (suggestedData?.users ?? []).filter((u) => u.isCreator && u.role !== "admin" && u.role !== "superadmin" && u.role !== "moderator");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "sticky top-16 hidden h-[calc(100vh-4rem)] w-[336px] shrink-0 flex-col gap-4 overflow-y-auto px-4 py-5 no-scrollbar xl:flex",
		children: [
			tags.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Trending",
				icon: Flame,
				action: "Explore",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "flex flex-col",
					children: tags.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/tag/$tag",
						params: { tag: t.tag },
						className: "press group flex w-full items-center gap-3 rounded-xl px-1.5 py-2 text-left hover:bg-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "w-4 font-display text-sm font-bold text-muted-foreground",
							children: i + 1
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "block truncate text-sm font-bold",
								children: ["#", t.tag]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "block truncate text-xs text-muted-foreground",
								children: [formatCount(t.postsCount), " posts"]
							})]
						})]
					}) }, t.tag))
				})
			}),
			suggested.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Suggested creators",
				icon: Sparkles,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "flex flex-col gap-2.5",
					children: suggested.map((u) => {
						const following = followingSet?.has(u.username) ?? false;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/profile/$username",
									params: { username: u.username },
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GAvatar, {
										user: toDisplayUser$1(u),
										size: "sm"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserName, {
										user: toDisplayUser$1(u),
										className: "text-sm"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "block truncate text-xs text-muted-foreground",
										children: [formatCount(u.followersCount), " followers"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: following ? "soft" : "default",
									size: "sm",
									onClick: () => {
										followUser.mutate({
											username: u.username,
											follow: !following
										});
										if (!following) toast.success(`Following @${u.username}`);
									},
									className: "shrink-0",
									children: following ? "Following" : "Follow"
								})
							]
						}, u._id);
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "surface-card halo relative overflow-hidden p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mb-2 inline-block rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase",
						children: "Sponsored"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-base font-bold",
						children: "Grow with Gihanga Ads"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: "Reach viewers and creators across Rwanda with campaign budgets from 5,000 RWF."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						className: "mt-3",
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/ads",
							children: ["Start a campaign", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, {})]
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "px-1.5 pb-4 text-xs leading-relaxed text-muted-foreground",
				children: [
					"About · Help · Guidelines · Privacy · Terms",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
					"© 2026 Gihanga Updates"
				]
			})
		]
	});
}
var primaryNav = [
	{
		label: "Home",
		icon: House,
		to: "/"
	},
	{
		label: "Reels",
		icon: Film,
		to: "/reels"
	},
	{
		label: "Explore",
		icon: Compass,
		to: "/explore"
	},
	{
		label: "Search",
		icon: Search,
		to: "/explore"
	},
	{
		label: "Trending",
		icon: TrendingUp,
		to: "/explore"
	},
	{
		label: "Notifications",
		icon: Bell,
		to: "/notifications"
	},
	{
		label: "Live Streams",
		icon: Radio,
		to: "/live"
	},
	{
		label: "Bookmarks",
		icon: Bookmark,
		to: "/bookmarks"
	}
];
var secondaryNav = [
	{
		label: "Creator Studio",
		icon: LayoutDashboard,
		to: "/studio"
	},
	{
		label: "Wallet",
		icon: Wallet,
		to: "/wallet"
	},
	{
		label: "Profile",
		icon: User,
		to: "/profile"
	},
	{
		label: "Settings",
		icon: Settings,
		to: "/settings"
	}
];
function useNotifications() {
	const { user } = useAuth();
	return useQuery({
		queryKey: ["notifications"],
		queryFn: () => api.get("/notifications"),
		enabled: Boolean(user)
	});
}
function useUnreadNotificationCount() {
	const { data } = useNotifications();
	return data?.unreadCount ?? 0;
}
function useMarkNotificationRead() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id) => api.post(`/notifications/${id}/read`),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] })
	});
}
function useMarkAllNotificationsRead() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => api.post("/notifications/read-all"),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] })
	});
}
function useLiveStreams() {
	return useQuery({
		queryKey: ["live", "list"],
		queryFn: () => api.get("/live"),
		refetchInterval: 5e3
	});
}
function useLiveStream(id) {
	return useQuery({
		queryKey: [
			"live",
			"detail",
			id
		],
		queryFn: () => api.get(`/live/${id}`),
		enabled: Boolean(id),
		refetchInterval: 1e4
	});
}
function useLiveChatHistory(id) {
	return useQuery({
		queryKey: [
			"live",
			"chat-history",
			id
		],
		queryFn: () => api.get(`/live/${id}/chat`),
		enabled: Boolean(id)
	});
}
/**
* Starts a live stream. Pass `asStaff: true` when the broadcaster is a
* moderator/admin/superadmin going live with their staff session — the
* backend's `authenticateConsumerOrStaff` middleware accepts either token,
* so this only changes which access token gets sent.
*/
function useStartLive(asStaff = false) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input) => api.post("/live/start", input, asStaff),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["live"] })
	});
}
function useEndLive(asStaff = false) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id) => api.post(`/live/${id}/end`, void 0, asStaff),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["live"] })
	});
}
function useLiveHeartbeat(streamId, asStaff = false) {
	return useMutation({ mutationFn: () => api.post(`/live/${streamId}/heartbeat`, void 0, asStaff) });
}
var GIFT_CATALOG = [
	{
		id: "heart",
		label: "Heart",
		cost: 10,
		emoji: "❤️"
	},
	{
		id: "fire",
		label: "Fire",
		cost: 50,
		emoji: "🔥"
	},
	{
		id: "crown",
		label: "Crown",
		cost: 200,
		emoji: "👑"
	},
	{
		id: "rocket",
		label: "Rocket",
		cost: 500,
		emoji: "🚀"
	}
];
function useSendGift(streamId) {
	return useMutation({ mutationFn: (giftId) => api.post(`/live/${streamId}/gift`, { giftId }) });
}
function useMyWallet() {
	return useQuery({
		queryKey: ["wallet", "me"],
		queryFn: () => api.get("/wallet/me")
	});
}
function useAddModerator(streamId, asStaff = false) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (username) => api.post(`/live/${streamId}/moderators`, { username }, asStaff),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: [
			"live",
			"detail",
			streamId
		] })
	});
}
function useMuteViewer(streamId, asStaff = false) {
	return useMutation({ mutationFn: (userId) => api.post(`/live/${streamId}/viewers/${userId}/mute`, void 0, asStaff) });
}
function useBanViewer(streamId, asStaff = false) {
	return useMutation({ mutationFn: (userId) => api.post(`/live/${streamId}/viewers/${userId}/ban`, void 0, asStaff) });
}
function useLiveEarnings(streamId, enabled, asStaff = false) {
	return useQuery({
		queryKey: [
			"live",
			"earnings",
			streamId,
			asStaff
		],
		queryFn: () => api.get(`/live/${streamId}/earnings`, asStaff),
		enabled,
		refetchInterval: 15e3
	});
}
function useUpdateLiveSettings(streamId, asStaff = false) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input) => api.patch(`/live/${streamId}/settings`, input, asStaff),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: [
			"live",
			"detail",
			streamId
		] })
	});
}
function useInviteFollowers(streamId, asStaff = false) {
	return useMutation({ mutationFn: () => api.post(`/live/${streamId}/invite`, void 0, asStaff) });
}
function useReportLive(streamId) {
	return useMutation({ mutationFn: (input) => api.post(`/live/${streamId}/report`, input) });
}
function useStaffLiveStreams() {
	return useQuery({
		queryKey: [
			"staff",
			"live",
			"list"
		],
		queryFn: () => api.get("/system/live", true),
		refetchInterval: 15e3,
		retry: 1
	});
}
function useForceEndLive() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, reason }) => api.post(`/system/live/${id}/force-end`, { reason }, true),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff", "live"] })
	});
}
function useLiveAlerts() {
	return useQuery({
		queryKey: [
			"staff",
			"live",
			"alerts"
		],
		queryFn: () => api.get("/system/live/alerts", true)
	});
}
function useLiveKeywords() {
	return useQuery({
		queryKey: [
			"staff",
			"live",
			"keywords"
		],
		queryFn: () => api.get("/system/live/keywords", true)
	});
}
function useSaveLiveKeywords() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (keywords) => api.put("/system/live/keywords", { keywords }, true),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: [
			"staff",
			"live",
			"keywords"
		] })
	});
}
function comingSoon(item) {
	toast(`${item.label} arrives in Phase ${item.phase ?? 3}`, { description: "Phase 1 ships the design system and Home Feed." });
}
function NavRow({ item, active, user, badgeOverride }) {
	const badge = badgeOverride ?? item.badge;
	const body = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "relative",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, {
			className: cn("size-[22px] shrink-0", active && "text-primary"),
			strokeWidth: active ? 2.6 : 2
		}), !!badge && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "absolute -top-1.5 -right-2 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-danger-foreground",
			children: badge
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "truncate",
		children: item.label
	})] });
	const cls = cn("press flex w-full items-center gap-3.5 rounded-xl px-3 py-2.5 text-[15px] font-medium text-foreground/80 hover:bg-muted", active && "bg-primary-soft font-bold text-primary hover:bg-primary-soft");
	const linkTo = item.to === "/profile" && user?.username ? `/profile/${user.username}` : item.to;
	if (linkTo) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: linkTo,
		className: cls,
		children: body
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick: () => comingSoon(item),
		className: cls,
		children: body
	});
}
function SideNav() {
	const { user, signOut } = useSessionUser();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const unread = useUnreadNotificationCount();
	const { data: liveData } = useLiveStreams();
	const liveCount = liveData?.streams.length ?? 0;
	const badgeFor = (label) => {
		if (label === "Notifications") return unread;
		if (label === "Live Streams") return liveCount;
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col border-r border-border bg-sidebar px-4 py-5 lg:flex",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "press mb-6 px-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "flex flex-col gap-1",
				"aria-label": "Primary",
				children: primaryNav.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavRow, {
					item,
					active: item.to === pathname,
					user,
					badgeOverride: badgeFor(item.label)
				}, item.label))
			}),
			user?.creator ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "my-4 h-px bg-border" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "flex flex-col gap-1",
				"aria-label": "Creator",
				children: secondaryNav.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavRow, {
					item,
					active: item.to === pathname,
					user,
					badgeOverride: badgeFor(item.label)
				}, item.label))
			})] }) : null,
			user?.creator ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "brand",
				size: "lg",
				className: "mt-5 w-full",
				onClick: () => openCreate("post"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { strokeWidth: 3 }), "Create"]
			}) : null,
			user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-auto flex items-center gap-3 rounded-2xl border border-border bg-surface p-2.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GAvatar, {
						user,
						size: "sm"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block truncate text-sm font-bold",
							children: user.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "block truncate text-xs text-muted-foreground",
							children: [formatCount(user.followers), " followers"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon-sm",
						"aria-label": "Sign out",
						onClick: () => {
							signOut();
							toast("Signed out");
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, {})
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-auto rounded-2xl border border-border bg-surface p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-bold",
						children: "Join Gihanga Updates"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: "Create an account to post, follow and save."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "brand",
						className: "mt-3 w-full",
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/welcome",
							children: "Get started"
						})
					})
				]
			})
		]
	});
}
var KEY = "gihanga-theme";
function useTheme() {
	const [theme, setTheme] = (0, import_react.useState)("light");
	(0, import_react.useEffect)(() => {
		const initial = window.localStorage.getItem(KEY) ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
		setTheme(initial);
		document.documentElement.classList.toggle("dark", initial === "dark");
	}, []);
	const apply = (0, import_react.useCallback)((next) => {
		setTheme(next);
		document.documentElement.classList.toggle("dark", next === "dark");
		window.localStorage.setItem(KEY, next);
	}, []);
	return {
		theme,
		setTheme: apply,
		toggle: (0, import_react.useCallback)(() => apply(document.documentElement.classList.contains("dark") ? "light" : "dark"), [apply])
	};
}
function TopBar() {
	const { theme, toggle } = useTheme();
	const navigate = useNavigate();
	const unread = useUnreadNotificationCount();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "glass sticky top-0 z-40 border-b",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex h-16 max-w-[1600px] items-center gap-3 px-4 sm:px-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "lg:hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, { compact: true })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative hidden min-w-0 flex-1 max-w-lg md:block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "search",
						placeholder: "Search creators, hashtags, sounds…",
						onFocus: () => navigate({ to: "/explore" }),
						className: "h-11 w-full rounded-2xl border border-border bg-elevated pr-4 pl-10 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus:border-ring focus:bg-surface focus:shadow-soft"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "ml-auto flex items-center gap-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							className: "md:hidden",
							"aria-label": "Search",
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/explore",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							"aria-label": theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
							onClick: toggle,
							children: theme === "dark" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							className: "relative",
							"aria-label": "Notifications",
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/notifications",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, {}), unread > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "absolute top-1.5 right-1 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-danger-foreground",
									children: unread > 99 ? "99+" : unread
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountMenu, { compact: true })
						})
					]
				})
			]
		})
	});
}
function AppShell({ children }) {
	const navigate = useNavigate();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const { user, loading } = useAuth();
	(0, import_react.useEffect)(() => {
		if (loading || pathname.startsWith("/system")) return;
		if (!user) navigate({ to: "/welcome" });
		else if (!user.emailVerified) navigate({ to: "/verify" });
		else if (!user.onboarded) navigate({ to: "/interests" });
	}, [
		loading,
		user,
		pathname,
		navigate
	]);
	if (!loading && (!user || !user.emailVerified || !user.onboarded) && !pathname.startsWith("/system")) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen w-full",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SideNav, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-1 flex-col",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex w-full max-w-[1400px] flex-1 justify-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
						className: "min-w-0 flex-1 px-3 pt-4 pb-32 sm:px-5 lg:pb-10",
						children
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RightRail, {})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BottomNav, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateHost, {})
		]
	});
}
var Route$35 = createFileRoute("/explore")({
	head: () => ({ meta: [
		{ title: "Explore & Search — Creators, Trends & Reels | Gihanga" },
		{
			name: "description",
			content: "Search creators and user accounts, explore top 5 trending topics and watch fresh media from the Gihanga community."
		},
		{
			property: "og:title",
			content: "Explore & Search — Discover Creators & Trends | Gihanga"
		},
		{
			property: "og:description",
			content: "Search creators and users, browse top trending tags and fresh media on Gihanga."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: ExplorePage
});
function toDisplayUser(u) {
	return {
		id: u._id,
		name: u.name,
		username: u.username,
		bio: u.bio || "",
		avatarHue: u.avatarHue ?? 0,
		avatarUrl: u.avatarUrl || null,
		verified: Boolean(u.verified),
		creator: Boolean(u.isCreator),
		live: Boolean(u.isLive),
		followers: u.followersCount ?? 0,
		following: 0,
		posts: 0
	};
}
function ExplorePage() {
	const { user: currentUser } = useAuth();
	const [q, setQ] = (0, import_react.useState)("");
	const [activeTab, setActiveTab] = (0, import_react.useState)("all");
	const [userFilter, setUserFilter] = (0, import_react.useState)("all");
	const [visibleCount, setVisibleCount] = (0, import_react.useState)(24);
	const term = q.trim();
	const search = useSearch$1(term);
	const trending = useTrendingTags();
	const suggested = useSuggestedUsers();
	const explore = useExplore();
	const reelsFeed = useReelsFeed();
	const followUser = useFollowUser();
	const { data: followingSet } = useFollowingSet();
	const searchUsers = search.data?.users ?? [];
	const defaultSuggestedUsers = suggested.data?.users ?? [];
	const rawUsersList = term ? searchUsers : defaultSuggestedUsers;
	const filteredUsers = (0, import_react.useMemo)(() => {
		return rawUsersList.filter((u) => {
			if (userFilter === "creators") return u.isCreator;
			if (userFilter === "verified") return u.verified;
			return true;
		});
	}, [rawUsersList, userFilter]);
	const trendingTags = (trending.data?.tags ?? []).slice(0, 5);
	const mediaPosts = (activeTab === "reels" ? reelsFeed : explore).data?.pages.flatMap((p) => p.posts) ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-[1000px] space-y-6 pb-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid size-9 place-items-center rounded-xl bg-primary-soft text-primary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Compass, { className: "size-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-2xl font-black tracking-tight text-foreground sm:text-3xl",
						children: "Explore & Search"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground sm:text-sm",
					children: "Discover creators, top trending topics, and fresh media."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface-card relative flex items-center gap-3 rounded-2xl p-2 pl-4 shadow-soft border border-border focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 transition-all",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-5 shrink-0 text-primary" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: q,
						onChange: (e) => {
							setQ(e.target.value);
							setVisibleCount(24);
						},
						placeholder: "Search creator or user accounts by name, username or bio…",
						"aria-label": "Search creators and users",
						className: "h-11 min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground"
					}),
					q && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => {
							setQ("");
							setVisibleCount(24);
						},
						className: "press mr-2 grid size-7 place-items-center rounded-full bg-muted text-muted-foreground hover:text-foreground",
						title: "Clear search",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar",
				children: [
					{
						id: "all",
						label: "All",
						icon: Sparkles
					},
					{
						id: "creators",
						label: "Creators & Users",
						icon: Users
					},
					{
						id: "trending",
						label: "Trending Tags",
						icon: Flame
					},
					{
						id: "reels",
						label: "Fresh Media",
						icon: Play
					}
				].map((tab) => {
					const active = activeTab === tab.id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setActiveTab(tab.id),
						className: cn("press relative flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all", active ? "bg-primary text-primary-foreground shadow-md" : "bg-surface text-muted-foreground hover:bg-muted hover:text-foreground border border-border/60"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(tab.icon, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: tab.label })]
					}, tab.id);
				})
			}),
			(activeTab === "all" || activeTab === "creators" || term) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-4.5 text-primary" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display text-base font-extrabold tracking-tight text-foreground",
									children: term ? `Found ${filteredUsers.length} account${filteredUsers.length === 1 ? "" : "s"}` : "Suggested Creators & Accounts"
								}),
								filteredUsers.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-extrabold text-primary",
									children: filteredUsers.length
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1 bg-muted/60 p-1 rounded-xl w-fit",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => setUserFilter("all"),
									className: cn("rounded-lg px-2.5 py-1 text-xs font-bold transition-all", userFilter === "all" ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"),
									children: [
										"All (",
										rawUsersList.length,
										")"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setUserFilter("creators"),
									className: cn("rounded-lg px-2.5 py-1 text-xs font-bold transition-all", userFilter === "creators" ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"),
									children: "Creators"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setUserFilter("verified"),
									className: cn("rounded-lg px-2.5 py-1 text-xs font-bold transition-all", userFilter === "verified" ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"),
									children: "Verified"
								})
							]
						})]
					}),
					filteredUsers.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5",
						children: filteredUsers.slice(0, visibleCount).map((u) => {
							const isFollowing = followingSet?.has(u.username) ?? false;
							const isSelf = currentUser?.username === u.username;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "surface-card group relative flex flex-col justify-between rounded-2xl p-4 border border-border shadow-soft hover:border-primary/40 hover:shadow-hover transition-all duration-200",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-start justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
											to: "/profile/$username",
											params: { username: u.username },
											className: "flex items-center gap-3 min-w-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GAvatar, {
												user: toDisplayUser(u),
												size: "md",
												ring: u.isLive ? "live" : u.isCreator ? "creator" : "none"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "min-w-0 flex-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "truncate font-extrabold text-sm text-foreground group-hover:text-primary transition-colors",
														children: u.name
													}), u.verified && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VerifiedBadge, {})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "block truncate text-xs text-muted-foreground font-medium",
													children: ["@", u.username]
												})]
											})]
										}), !isSelf && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: isFollowing ? "soft" : "default",
											size: "sm",
											onClick: () => {
												followUser.mutate({
													username: u.username,
													follow: !isFollowing
												});
												if (!isFollowing) toast.success(`Following @${u.username}`);
											},
											className: cn("h-8 rounded-xl px-3 text-xs font-extrabold shrink-0 transition-transform active:scale-95", isFollowing ? "bg-muted text-foreground hover:bg-muted/80" : "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"),
											children: isFollowing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "flex items-center gap-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { className: "size-3.5" }), " Following"]
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "flex items-center gap-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "size-3.5" }), " Follow"]
											})
										})]
									}),
									u.bio && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2.5 line-clamp-2 text-xs text-muted-foreground leading-relaxed",
										children: u.bio
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 flex items-center justify-between pt-2 border-t border-border/50 text-[11px] text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-1.5 font-bold",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-foreground",
												children: formatCount(u.followersCount || 0)
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "followers" })]
										}), u.isCreator && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "rounded-md bg-amber-500/10 px-2 py-0.5 font-extrabold text-[10px] uppercase tracking-wider text-amber-500 border border-amber-500/20",
											children: "Creator"
										})]
									})
								]
							}, u._id);
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "surface-card rounded-2xl p-8 text-center text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "mx-auto mb-2 size-8 text-muted-foreground/50" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold",
							children: term ? `No creator or user accounts match “${q}”.` : "No accounts available."
						})]
					}),
					filteredUsers.length > visibleCount && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex justify-center pt-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => setVisibleCount((prev) => prev + 24),
							className: "rounded-xl font-bold gap-1.5",
							children: [
								"Show More (",
								filteredUsers.length - visibleCount,
								" remaining)"
							]
						})
					})
				]
			}),
			(activeTab === "all" || activeTab === "trending") && !term && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center justify-between border-b border-border pb-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, { className: "size-4.5 text-danger" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-base font-extrabold tracking-tight text-foreground",
								children: "Trending Now"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-full bg-danger/10 px-2 py-0.5 text-[10px] font-black uppercase text-danger",
								children: "Top 5 Tags"
							})
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
					children: [trendingTags.map((t, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/tag/$tag",
						params: { tag: t.tag },
						className: "surface-card lift group flex items-center gap-3.5 rounded-2xl p-3.5 border border-border hover:border-primary/50 transition-all",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: cn("grid size-10 shrink-0 place-items-center rounded-xl font-display text-base font-black shadow-md", idx === 0 ? "bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-extrabold" : idx === 1 ? "bg-gradient-to-tr from-slate-300 to-slate-100 text-slate-950 font-extrabold" : idx === 2 ? "bg-gradient-to-tr from-amber-700 to-amber-600 text-white font-extrabold" : "bg-primary-soft text-primary font-bold"),
								children: ["#", idx + 1]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "block truncate font-extrabold text-sm text-foreground group-hover:text-primary transition-colors",
									children: ["#", t.tag]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "block truncate text-xs text-muted-foreground font-medium",
									children: [formatCount(t.postsCount), " posts"]
								})]
							}),
							"trend" in t && t.trend > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1 text-xs font-bold text-success",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-3.5" }), t.trend]
							})
						]
					}, t.tag)), !trendingTags.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "col-span-full py-4 text-center text-xs text-muted-foreground",
						children: "No trending tags yet — post with a #hashtag to get on the leaderboard!"
					})]
				})]
			}),
			(activeTab === "all" || activeTab === "reels") && !term && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between border-b border-border pb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4.5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-base font-extrabold tracking-tight text-foreground",
							children: "Fresh Media"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/reels",
						className: "flex items-center gap-1 text-xs font-bold text-primary hover:underline",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Watch full screen" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3.5" })]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4",
					children: [mediaPosts.filter((p) => p.mediaUrl || p.thumbnailUrl).map((item, i) => {
						const mediaSrc = mediaUrl(item.mediaUrl) || mediaUrl(item.thumbnailUrl);
						const isVideo = item.kind === "video" || item.kind === "reel";
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: isVideo ? "/reels" : "/post/$postId",
							params: { postId: item._id },
							className: "press group relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted border border-border/50 shadow-soft",
							style: { animationDelay: `${i * 30}ms` },
							children: [
								isVideo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
									src: mediaSrc,
									poster: mediaUrl(item.thumbnailUrl),
									muted: true,
									playsInline: true,
									preload: "metadata",
									className: "size-full object-cover transition-transform duration-500 group-hover:scale-105"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: mediaSrc,
									alt: item.body ? item.body.slice(0, 40) : "Post media",
									loading: "lazy",
									onError: (e) => {
										const target = e.currentTarget;
										target.style.display = "none";
										const parent = target.parentElement;
										if (parent) parent.classList.add("bg-gradient-to-tr", "from-slate-900", "to-slate-800", "flex", "items-center", "justify-center");
									},
									className: "size-full object-cover transition-transform duration-500 group-hover:scale-105"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "absolute inset-x-0 top-0 bg-gradient-to-b from-black/70 via-black/20 to-transparent p-2.5 flex items-center gap-1.5 text-white",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GAvatar, {
										user: toDisplayUser(item.author),
										size: "xs"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "truncate text-[11px] font-bold drop-shadow-md",
										children: item.author.username
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2.5",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-1 text-[11px] font-extrabold text-white",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-3 fill-white" }), formatCount(item.viewsCount || item.likesCount || 0)]
									})
								})
							]
						}, item._id);
					}), !mediaPosts.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "col-span-full py-8 text-center text-xs text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image$1, { className: "mx-auto mb-2 size-6 text-muted-foreground/50" }), "No media posts available yet."]
					})]
				})]
			})
		]
	}) });
}
var $$splitComponentImporter$32 = () => import("./forgot-password-_IFNA_h2.mjs");
var Route$34 = createFileRoute("/forgot-password")({
	head: () => ({ meta: [
		{ title: "Reset your password — Gihanga Updates" },
		{
			name: "description",
			content: "Forgot your Gihanga Updates password? Enter your email and we'll send you a reset link."
		},
		{
			property: "og:title",
			content: "Reset your password — Gihanga Updates"
		},
		{
			property: "og:description",
			content: "Request a password reset link for your Gihanga Updates account."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$32, "component")
});
var $$splitComponentImporter$31 = () => import("./interests-0x1vuyj1.mjs");
var Route$33 = createFileRoute("/interests")({
	head: () => ({ meta: [
		{ title: "Pick your interests — Gihanga Updates" },
		{
			name: "description",
			content: "Choose the topics you care about so your Gihanga Updates feed feels right from day one."
		},
		{
			property: "og:title",
			content: "Pick your interests — Gihanga Updates"
		},
		{
			property: "og:description",
			content: "Tune your Gihanga Updates feed by picking topics you care about."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$31, "component")
});
var Heropage_image_default = "/assets/Heropage_image-D9IuWn3m.png";
var enable_section_default = "/assets/enable%20section-BMjT5lF0.png";
var Route$32 = createFileRoute("/landing")({
	head: () => ({ meta: [
		{ title: "Gihanga Updates — The Creative Platform for Rwanda" },
		{
			name: "description",
			content: "Join thousands of creators on Gihanga Updates. Share stories, reels, go live, and build your audience across Rwanda and East Africa."
		},
		{
			property: "og:title",
			content: "Gihanga Updates — The Creative Platform for Rwanda"
		},
		{
			property: "og:description",
			content: "Share stories, reels, and updates with creators shaping culture across Rwanda."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: LandingPage
});
var navLinks = [
	{
		label: "Creators",
		icon: Sparkles,
		href: "#creators"
	},
	{
		label: "Community",
		icon: Users,
		href: "#community"
	},
	{
		label: "Reels",
		icon: Film,
		href: "#reels"
	},
	{
		label: "Live",
		icon: Camera,
		href: "#live"
	},
	{
		label: "Wallet",
		icon: Wallet,
		href: "#wallet"
	},
	{
		label: "Get the App",
		icon: Globe,
		href: "#download"
	}
];
var exploreCategories = [
	"Music",
	"Comedy",
	"Dance",
	"Fashion",
	"Technology",
	"Photography",
	"Art & Design",
	"Food & Cooking",
	"Education",
	"Sports",
	"Travel",
	"Storytelling",
	"Business"
];
var discoverCategories = [
	"Top Creators",
	"Trending Reels",
	"Live Now",
	"New Voices",
	"Kigali Scene",
	"Culture & Heritage",
	"Fitness & Health",
	"Podcasts",
	"Beauty",
	"Motivation",
	"Gaming",
	"Music Production"
];
var enableSteps = [
	{
		number: "01",
		title: "Create your account.",
		body: "Sign up in seconds with your email or social accounts. No fees, ever."
	},
	{
		number: "02",
		title: "Build your profile.",
		body: "Add your bio, avatar, and links. Tell your story before you post one."
	},
	{
		number: "03",
		title: "Post your first update.",
		body: "Share a photo, reel, or story with your followers instantly."
	},
	{
		number: "04",
		title: "Go live anytime.",
		body: "Broadcast to your community in real-time with one tap."
	},
	{
		number: "05",
		title: "Grow your audience.",
		body: "Use hashtags, trends, and the explore page to reach new viewers."
	},
	{
		number: "06",
		title: "Earn with your content.",
		body: "Get paid in RWF through tips, ads revenue, and brand partnerships directly in your wallet."
	},
	{
		number: "07",
		title: "Connect & collaborate.",
		body: "Message creators, join communities, and build lasting relationships."
	}
];
var faqGeneral = [
	{
		q: "What is Gihanga Updates?",
		a: "Gihanga Updates is a social content platform built for creators and audiences in Rwanda and across East Africa. Share stories, reels, go live, and get paid for your creativity."
	},
	{
		q: "Is Gihanga Updates free to use?",
		a: "Yes! Creating an account, posting, watching, and engaging is completely free. Creators can also earn money through tips, ad revenue, and brand deals."
	},
	{
		q: "Who can become a creator?",
		a: "Anyone! Apply for creator status in your settings. Once approved, you unlock advanced analytics, scheduling, monetization tools, and more."
	},
	{
		q: "What content can I post?",
		a: "Photos, videos, stories, reels, text updates, and live streams. Express yourself however feels right."
	},
	{
		q: "Is my data safe?",
		a: "Absolutely. We use industry-standard encryption and give you granular privacy controls over who sees your content and profile."
	}
];
var faqCreators = [
	{
		q: "How do I earn money on Gihanga Updates?",
		a: "Creators earn through viewer tips (in RWF), ad revenue sharing, brand partnership deals, and premium content subscriptions."
	},
	{
		q: "How do payouts work?",
		a: "Earnings are tracked in your Wallet. Withdraw directly to your mobile money account or bank at any time."
	},
	{
		q: "Can I schedule posts?",
		a: "Yes! Creator accounts get access to the Studio with post scheduling, analytics dashboards, and draft management."
	},
	{
		q: "What are the community guidelines?",
		a: "We promote authentic, respectful content. Hate speech, harassment, and harmful content are not tolerated. Full guidelines are in our Terms of Service."
	},
	{
		q: "How do live streams work?",
		a: "Tap the Live button, set a title, and start broadcasting. Viewers can join, react, comment, and send tips in real-time."
	},
	{
		q: "Can I collaborate with other creators?",
		a: "Yes! You can tag, mention, and co-create content with other users. Collaboration features are built into the creator toolkit."
	}
];
var footerColumns = [
	{
		title: "General",
		links: [
			"Sign Up",
			"Help Center",
			"About",
			"Press",
			"Blog",
			"Careers",
			"Developers"
		]
	},
	{
		title: "Explore",
		links: [
			"Creators",
			"Reels",
			"Stories",
			"Live",
			"Trending",
			"Explore",
			"Hashtags"
		]
	},
	{
		title: "For Creators",
		links: [
			"Studio",
			"Analytics",
			"Wallet",
			"Ads",
			"Brand Deals"
		]
	},
	{
		title: "Resources",
		links: [
			"Community Guidelines",
			"Safety Center",
			"Terms of Service",
			"Privacy Policy",
			"Cookie Policy",
			"Accessibility"
		]
	}
];
function GetStartedButton({ to = "/register", className, size = "lg", children = "GET STARTED", variant = "brand" }) {
	const [isHovered, setIsHovered] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative inline-block select-none", className),
		onMouseEnter: () => setIsHovered(true),
		onMouseLeave: () => setIsHovered(false),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
			initial: false,
			animate: isHovered ? {
				y: "90%",
				opacity: 1,
				scale: 1
			} : {
				y: "15%",
				opacity: 0,
				scale: .75
			},
			transition: {
				type: "spring",
				stiffness: 350,
				damping: 26
			},
			className: "pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-0 z-0 flex flex-col items-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "size-10 sm:size-15 rounded-2xl   p-2  flex items-center justify-center -mt-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: logo_default,
					alt: "Gihanga Icon",
					className: "size-full object-contain"
				})
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: variant === "solid-blue" ? "default" : "brand",
			size: size === "md" ? "default" : size,
			className: cn("relative z-10 font-display font-extrabold tracking-widest uppercase transition-all duration-300 shadow-soft", isHovered && "-translate-y-0.5 shadow-md", variant === "solid-blue" && "bg-blue-600 hover:bg-blue-500 text-white"),
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to,
				children
			})
		})]
	});
}
function CategoryPill({ label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		className: "press rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-all hover:border-primary hover:bg-primary-soft hover:text-primary",
		children: label
	});
}
function FAQItem({ question, answer }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border-b border-border/60",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => setOpen(!open),
			className: "press flex w-full items-center justify-between gap-4 py-4 text-left",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[15px] font-semibold text-foreground",
				children: question
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "shrink-0 text-primary",
				children: open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("overflow-hidden transition-all duration-300", open ? "max-h-40 pb-4 opacity-100" : "max-h-0 opacity-0"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm leading-relaxed text-muted-foreground",
				children: answer
			})
		})]
	});
}
function LandingPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "hidden items-center gap-1 md:flex",
							children: navLinks.map((link) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: link.href,
								className: "press flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(link.icon, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] font-semibold",
									children: link.label
								})]
							}, link.label))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								asChild: true,
								className: "hidden sm:inline-flex",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/login",
									children: "Sign in"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "brand",
								size: "sm",
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/welcome",
									children: "Join now"
								})
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "relative overflow-hidden",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "gradient-brand pointer-events-none absolute -top-40 -left-32 size-[500px] rounded-full opacity-20 blur-3xl" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "halo pointer-events-none absolute -right-48 top-20 size-[600px] rounded-full opacity-30 blur-3xl" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto flex max-w-7xl flex-col items-center gap-12 px-5 py-16 sm:px-8 lg:flex-row lg:gap-16 lg:py-24",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative max-w-xl flex-1 text-center lg:text-left",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.h1, {
									initial: {
										opacity: 0,
										y: 24
									},
									animate: {
										opacity: 1,
										y: 0
									},
									transition: {
										duration: .6,
										ease: [
											.22,
											1,
											.36,
											1
										]
									},
									className: "font-display text-[40px] leading-[1.08] font-extrabold tracking-tight sm:text-[52px] lg:text-[56px]",
									children: ["Welcome to your ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-gradient-brand",
										children: "creative community"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.p, {
									initial: {
										opacity: 0,
										y: 20
									},
									animate: {
										opacity: 1,
										y: 0
									},
									transition: {
										duration: .5,
										delay: .1
									},
									className: "mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground lg:mx-0",
									children: "Stories, reels and updates from the creators shaping culture across Rwanda — with the tools to build an audience and get paid for it in RWF."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
									initial: {
										opacity: 0,
										y: 20
									},
									animate: {
										opacity: 1,
										y: 0
									},
									transition: {
										duration: .5,
										delay: .18
									},
									className: "mx-auto mt-8 flex max-w-sm flex-col gap-3.5 lg:mx-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GetStartedButton, {
											size: "lg",
											className: "w-full",
											children: "GET STARTED — IT'S FREE"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "outline",
											size: "lg",
											className: "w-full",
											asChild: true,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
												to: "/login",
												children: "Sign in with email"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-2 text-xs text-muted-foreground",
											children: [
												"By continuing you agree to our",
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
													href: "#",
													className: "font-semibold text-primary hover:underline",
													children: "Terms of Service"
												}),
												" ",
												"and",
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
													href: "#",
													className: "font-semibold text-primary hover:underline",
													children: "Privacy Policy"
												}),
												"."
											]
										})
									]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
							initial: {
								opacity: 0,
								scale: .95
							},
							animate: {
								opacity: 1,
								scale: 1
							},
							transition: {
								duration: .7,
								delay: .15,
								ease: [
									.22,
									1,
									.36,
									1
								]
							},
							className: "relative flex-1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: Heropage_image_default,
								alt: "Gihanga Updates — creative community illustration",
								className: "mx-auto max-h-[480px] w-full object-contain drop-shadow-xl"
							})
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				id: "creators",
				className: "border-t border-border/60 bg-muted/30 py-16 sm:py-20",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto max-w-7xl px-5 sm:px-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-20",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "max-w-xs shrink-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.h2, {
								initial: {
									opacity: 0,
									y: 16
								},
								whileInView: {
									opacity: 1,
									y: 0
								},
								viewport: { once: true },
								transition: { duration: .5 },
								className: "font-display text-[32px] leading-tight font-extrabold tracking-tight sm:text-[36px]",
								children: "Explore top Gihanga content"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm leading-relaxed text-muted-foreground",
								children: "Discover trending posts and creator spotlights — curated by topic and in one place."
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
							initial: { opacity: 0 },
							whileInView: { opacity: 1 },
							viewport: { once: true },
							transition: {
								duration: .5,
								delay: .1
							},
							className: "flex flex-1 flex-wrap gap-2.5",
							children: [exploreCategories.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryPill, { label: cat }, cat)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "press flex items-center gap-1.5 rounded-full border border-primary bg-primary-soft px-4 py-2 text-sm font-bold text-primary transition-all hover:bg-primary hover:text-primary-foreground",
								children: "Show all"
							})]
						})]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				id: "community",
				className: "border-t border-border/60 py-16 sm:py-20",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto max-w-7xl px-5 sm:px-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-20",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "max-w-xs shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.h2, {
								initial: {
									opacity: 0,
									y: 16
								},
								whileInView: {
									opacity: 1,
									y: 0
								},
								viewport: { once: true },
								transition: { duration: .5 },
								className: "font-display text-[32px] leading-tight font-extrabold tracking-tight sm:text-[36px]",
								children: "Find the right creator for you"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
							initial: { opacity: 0 },
							whileInView: { opacity: 1 },
							viewport: { once: true },
							transition: {
								duration: .5,
								delay: .1
							},
							className: "flex flex-1 flex-wrap gap-2.5",
							children: [discoverCategories.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryPill, { label: cat }, cat)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "press flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground transition-all hover:border-primary hover:text-primary",
								children: ["Show more", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-3.5" })]
							})]
						})]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				id: "reels",
				className: "border-t border-border/60 py-16 sm:py-24 relative overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-7xl px-5 sm:px-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: {
							opacity: 0,
							y: 20
						},
						whileInView: {
							opacity: 1,
							y: 0
						},
						viewport: { once: true },
						transition: { duration: .5 },
						className: "mb-14 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "font-display text-[36px] leading-tight font-extrabold tracking-tight sm:text-[48px]",
							children: [
								"Start ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-gradient-brand",
									children: "creating"
								}),
								" on Gihanga today."
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mx-auto mt-4 max-w-xl text-[15px] text-muted-foreground",
							children: "From your first post to your first payout — everything you need to build and grow your presence."
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-center gap-12 lg:flex-row lg:items-start lg:gap-20",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
							initial: {
								opacity: 0,
								x: -30
							},
							whileInView: {
								opacity: 1,
								x: 0
							},
							viewport: { once: true },
							transition: {
								duration: .6,
								delay: .1
							},
							className: "relative shrink-0 flex items-center justify-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "relative mx-auto max-w-[320px] bg-transparent",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: enable_section_default,
									alt: "Gihanga Updates app screen",
									className: "relative max-h-[540px] w-auto object-contain drop-shadow-2xl"
								})
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1",
							children: [enableSteps.map((step, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EnableStep, {
								step,
								index: i
							}, step.number)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
								initial: {
									opacity: 0,
									y: 12
								},
								whileInView: {
									opacity: 1,
									y: 0
								},
								viewport: { once: true },
								transition: {
									duration: .4,
									delay: .3
								},
								className: "mt-10 pb-6",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GetStartedButton, {
									size: "lg",
									to: "/register",
									children: "GET STARTED"
								})
							})]
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "border-y border-border/60 gradient-brand py-10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-8 px-5 sm:gap-16 sm:px-8",
					children: [
						{
							value: "50K+",
							label: "Active Creators"
						},
						{
							value: "1M+",
							label: "Monthly Views"
						},
						{
							value: "200K+",
							label: "Community Members"
						},
						{
							value: "RWF",
							label: "Payouts in Local Currency"
						}
					].map((stat) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: {
							opacity: 0,
							y: 10
						},
						whileInView: {
							opacity: 1,
							y: 0
						},
						viewport: { once: true },
						className: "text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-3xl font-extrabold text-white sm:text-4xl",
							children: stat.value
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs font-semibold tracking-wider text-white/80 uppercase",
							children: stat.label
						})]
					}, stat.label))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				id: "wallet",
				className: "py-16 sm:py-24",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto max-w-7xl px-5 sm:px-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-12 lg:flex-row lg:gap-20",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "shrink-0 lg:sticky lg:top-24 lg:self-start lg:w-64",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] font-bold tracking-[0.16em] text-muted-foreground uppercase",
									children: "FAQ"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-2 font-display text-[32px] leading-tight font-extrabold tracking-tight sm:text-[38px]",
									children: "Frequently asked questions"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-sm text-muted-foreground",
									children: "Everything you need to know about Gihanga Updates."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-6 pb-6",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GetStartedButton, {
										size: "sm",
										to: "/register",
										children: "GET STARTED"
									})
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mb-3 text-[11px] font-bold tracking-[0.16em] text-primary uppercase",
									children: "General"
								}),
								faqGeneral.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FAQItem, {
									question: item.q,
									answer: item.a
								}, item.q)),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mb-3 mt-10 text-[11px] font-bold tracking-[0.16em] text-primary uppercase",
									children: "For Creators"
								}),
								faqCreators.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FAQItem, {
									question: item.q,
									answer: item.a
								}, item.q))
							]
						})]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "border-t border-border/60 bg-muted/30 py-16 sm:py-20",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-3xl px-5 text-center sm:px-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.h2, {
							initial: {
								opacity: 0,
								y: 16
							},
							whileInView: {
								opacity: 1,
								y: 0
							},
							viewport: { once: true },
							className: "font-display text-[32px] font-extrabold tracking-tight sm:text-[42px]",
							children: [
								"Ready to share your ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-gradient-brand",
									children: "story"
								}),
								"?"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mx-auto mt-4 max-w-md text-[15px] text-muted-foreground",
							children: "Join thousands of creators already building their audience on Gihanga Updates. It's free, always."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center pb-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GetStartedButton, {
								size: "lg",
								to: "/register",
								children: "CREATE YOUR FREE ACCOUNT"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "lg",
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/login",
									children: "Sign in"
								})
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				id: "download",
				className: "border-t border-border/60 bg-card py-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-7xl px-5 sm:px-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-10 sm:flex-row sm:gap-16",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "shrink-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 max-w-[200px] text-xs leading-relaxed text-muted-foreground",
								children: "The creative platform for Rwanda and East Africa."
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid flex-1 grid-cols-2 gap-8 sm:grid-cols-4",
							children: footerColumns.map((col) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mb-3 text-sm font-bold text-foreground",
								children: col.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "flex flex-col gap-2",
								children: col.links.map((link) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "#",
									className: "text-xs text-muted-foreground transition-colors hover:text-foreground",
									children: link
								}) }, link))
							})] }, col.title))
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-[11px] text-muted-foreground sm:flex-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {
								compact: true,
								className: "opacity-50"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["© ", (/* @__PURE__ */ new Date()).getFullYear()] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap justify-center gap-4",
							children: [
								"About",
								"Accessibility",
								"Terms",
								"Privacy Policy",
								"Cookie Policy",
								"Community Guidelines"
							].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "#",
								className: "hover:text-foreground hover:underline",
								children: item
							}, item))
						})]
					})]
				})
			})
		]
	});
}
function EnableStep({ step, index }) {
	const [open, setOpen] = (0, import_react.useState)(index === 5);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
		initial: {
			opacity: 0,
			y: 10
		},
		whileInView: {
			opacity: 1,
			y: 0
		},
		viewport: { once: true },
		transition: {
			duration: .35,
			delay: index * .05
		},
		className: "border-b border-border/60",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => setOpen(!open),
			className: "press flex w-full items-center gap-4 py-4 text-left",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-display text-sm font-bold text-primary",
					children: step.number
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("flex-1 text-[15px] font-semibold", open ? "text-foreground" : "text-muted-foreground"),
					children: step.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "shrink-0 text-muted-foreground",
					children: open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("overflow-hidden transition-all duration-300", open ? "max-h-32 pb-4 opacity-100" : "max-h-0 opacity-0"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "pl-10 text-sm leading-relaxed text-muted-foreground",
				children: step.body
			})
		})]
	});
}
var $$splitComponentImporter$30 = () => import("./live-T7ydc7bA.mjs");
var Route$31 = createFileRoute("/live")({
	head: () => ({ meta: [
		{ title: "Live Streams — Gihanga Updates" },
		{
			name: "description",
			content: "Watch creators streaming live right now on Gihanga Updates, or start your own broadcast."
		},
		{
			property: "og:title",
			content: "Live Streams — Gihanga Updates"
		},
		{
			property: "og:description",
			content: "Watch live streams from creators on Gihanga Updates."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$30, "component")
});
var $$splitComponentImporter$29 = () => import("./login-PM4nvjzG.mjs");
var Route$30 = createFileRoute("/login")({
	head: () => ({ meta: [
		{ title: "Sign in — Gihanga Updates" },
		{
			name: "description",
			content: "Sign in to Gihanga Updates to pick up your feed and creator dashboard where you left off."
		},
		{
			property: "og:title",
			content: "Sign in — Gihanga Updates"
		},
		{
			property: "og:description",
			content: "Sign in to your Gihanga Updates account."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$29, "component")
});
var $$splitComponentImporter$28 = () => import("./notifications-Ite5grpr.mjs");
var Route$29 = createFileRoute("/notifications")({
	head: () => ({ meta: [
		{ title: "Notifications — Your Gihanga Activity" },
		{
			name: "description",
			content: "Likes, comments, mentions, new followers and live alerts from across your Gihanga network in one place."
		},
		{
			property: "og:title",
			content: "Notifications — Your Gihanga Activity"
		},
		{
			property: "og:description",
			content: "Likes, comments, mentions and follower activity from your Gihanga network."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$28, "component")
});
var $$splitComponentImporter$27 = () => import("./reels-KPIwnzyu.mjs");
var Route$28 = createFileRoute("/reels")({
	validateSearch: (search) => ({ ...typeof search["reel"] === "string" ? { reel: search["reel"] } : {} }),
	head: () => ({ meta: [
		{ title: "Reels — Short Video from Gihanga Creators" },
		{
			name: "description",
			content: "Scroll full-screen short videos from Gihanga creators: dance, street photography, workflows and more."
		},
		{
			property: "og:title",
			content: "Reels — Short Video from Gihanga Creators"
		},
		{
			property: "og:description",
			content: "Full-screen short video from the Gihanga creator community."
		},
		{
			property: "og:type",
			content: "video.other"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$27, "component")
});
/** B5 — key target ignore check: typing in inputs/sheets must not navigate. */
var $$splitComponentImporter$26 = () => import("./register-SD0pdWET.mjs");
var Route$27 = createFileRoute("/register")({
	head: () => ({ meta: [
		{ title: "Create your account — Gihanga Updates" },
		{
			name: "description",
			content: "Sign up for Gihanga Updates: your details, handle, profile picture, and follow top creators across Rwanda."
		},
		{
			property: "og:title",
			content: "Create your account — Gihanga Updates"
		},
		{
			property: "og:description",
			content: "Join Gihanga Updates and start sharing stories, reels and updates."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$26, "component")
});
var $$splitComponentImporter$25 = () => import("./reset-password-DPrUsqC_.mjs");
var Route$26 = createFileRoute("/reset-password")({
	validateSearch: (search) => ({
		token: typeof search["token"] === "string" ? search["token"] : "",
		email: typeof search["email"] === "string" ? search["email"] : ""
	}),
	head: () => ({ meta: [{ title: "Set a new password — Gihanga Updates" }, {
		name: "description",
		content: "Choose a new password for your Gihanga Updates account."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$25, "component")
});
var labelVariants = cva("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");
var Label = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
	ref,
	className: cn(labelVariants(), className),
	...props
}));
Label.displayName = Root.displayName;
var badgeVariants = cva("inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", {
	variants: { variant: {
		default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
		secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
		destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
		outline: "text-foreground"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
function useUserSettings() {
	return useQuery({
		queryKey: ["user-settings"],
		queryFn: async () => {
			return await api.get("/users/settings");
		}
	});
}
function useUpdateUserSettings() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (updates) => {
			return await api.patch("/users/settings", updates);
		},
		onSuccess: (data) => {
			queryClient.setQueryData(["user-settings"], (prev) => {
				if (!prev) return prev;
				return {
					...prev,
					settings: data.settings || prev.settings,
					user: data.user ? {
						...prev.user,
						...data.user
					} : prev.user
				};
			});
			queryClient.invalidateQueries({ queryKey: ["user-settings"] });
		},
		onError: () => {
			toast.error("Failed to save settings. Please try again.");
		}
	});
}
function useBlockedUsers() {
	return useQuery({
		queryKey: ["blocked-users"],
		queryFn: async () => {
			return (await api.get("/blocks/mine")).usernames || [];
		}
	});
}
function useToggleBlockUser() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (username) => {
			return api.post(`/blocks/${encodeURIComponent(username)}`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["blocked-users"] });
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		}
	});
}
function useChangePassword() {
	return useMutation({ mutationFn: async (data) => {
		return api.post("/users/settings/change-password", data);
	} });
}
function useRevokeAllSessions() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async () => {
			return api.post("/users/settings/sessions/revoke-all");
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["user-settings"] });
			toast.success("All other sessions logged out.");
		}
	});
}
function useRequestAccountData() {
	return useMutation({ mutationFn: async () => {
		return api.post("/users/settings/request-data");
	} });
}
function useDeactivateAccount() {
	return useMutation({ mutationFn: async (data) => {
		return api.post("/users/settings/deactivate", data);
	} });
}
function useDeleteAccount() {
	return useMutation({ mutationFn: async (data) => {
		return api.delete("/users/settings/account");
	} });
}
function SettingsSection({ title, description, icon: Icon, children, badge, danger }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: cn("surface-card rounded-3xl p-5 sm:p-6 border transition-all shadow-soft space-y-5", danger ? "border-danger/30 bg-danger/5" : "border-border"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between gap-3 border-b border-border/50 pb-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [Icon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("grid size-10 place-items-center rounded-2xl shadow-sm", danger ? "bg-danger/20 text-danger" : "bg-primary-soft text-primary"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: cn("font-display text-base font-extrabold tracking-tight", danger ? "text-danger" : "text-foreground"),
					children: title
				}), description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground mt-0.5",
					children: description
				})] })]
			}), badge && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-black uppercase text-primary border border-primary/20",
				children: badge
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-4",
			children
		})]
	});
}
function SettingsRow({ id, label, hint, icon: Icon, children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-1.5", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start gap-3 min-w-0 flex-1",
			children: [Icon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4.5 text-muted-foreground mt-0.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: id,
					className: "text-sm font-bold text-foreground cursor-pointer block truncate",
					children: label
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm font-bold text-foreground block truncate",
					children: label
				}), hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground leading-relaxed mt-0.5",
					children: hint
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "shrink-0 sm:self-center",
			children
		})]
	});
}
function SettingsToggle({ id, label, hint, checked, onChange, disabled, icon }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsRow, {
		id,
		label,
		hint,
		icon,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
			id,
			checked,
			onCheckedChange: onChange,
			disabled
		})
	});
}
function SettingsSelect({ label, hint, value, options, onChange, icon }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsRow, {
		label,
		hint,
		icon,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
			value,
			onChange: (e) => onChange(e.target.value),
			"aria-label": label,
			className: "h-9 rounded-xl bg-elevated border border-border px-3 text-xs font-bold text-foreground outline-none focus:ring-2 focus:ring-primary",
			children: options.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
				value: opt.value,
				children: opt.label
			}, opt.value))
		})
	});
}
var Route$25 = createFileRoute("/settings")({
	head: () => ({ meta: [
		{ title: "Settings — Manage Your Gihanga Account" },
		{
			name: "description",
			content: "Manage your Gihanga Updates account security, privacy, notifications, wallet, live streaming, and preferences."
		},
		{
			property: "og:title",
			content: "Settings — Gihanga Updates"
		},
		{
			property: "og:description",
			content: "Complete control center for your Gihanga Updates account."
		}
	] }),
	component: SettingsPage
});
var NAV_GROUPS = [
	{
		label: "Main",
		items: [
			{
				key: "overview",
				label: "Overview",
				icon: Sparkles,
				description: "Account summary, health check and quick shortcuts"
			},
			{
				key: "account",
				label: "Account",
				icon: User,
				description: "Personal details, username, email & phone"
			},
			{
				key: "profile",
				label: "Profile",
				icon: Camera,
				description: "Photo, bio, links, and creator customization"
			}
		]
	},
	{
		label: "Privacy & Security",
		items: [
			{
				key: "privacy",
				label: "Privacy",
				icon: Eye,
				description: "Account visibility, interaction limits, and activity status"
			},
			{
				key: "security",
				label: "Security",
				icon: Shield,
				badge: "Protected",
				description: "Password, 2FA, login devices, and security alerts"
			},
			{
				key: "blocked",
				label: "Blocked Accounts",
				icon: Ban,
				description: "Manage blocked users and restricted accounts"
			}
		]
	},
	{
		label: "Preferences",
		items: [
			{
				key: "notifications",
				label: "Notifications",
				icon: Bell,
				description: "Push, email, in-app alerts, and quiet hours"
			},
			{
				key: "feed",
				label: "Content & Feed",
				icon: SlidersHorizontal,
				description: "Sensitive filter, autoplay, and feed personalization"
			},
			{
				key: "messages",
				label: "Messages",
				icon: MessageSquare,
				description: "Direct message requests, receipts, and media download"
			},
			{
				key: "appearance",
				label: "Appearance",
				icon: Moon,
				description: "Dark mode, themes, density, and animation"
			},
			{
				key: "accessibility",
				label: "Accessibility",
				icon: SlidersVertical,
				description: "Reduced motion, text scaling, and contrast"
			},
			{
				key: "language",
				label: "Language & Region",
				icon: Globe,
				description: "Interface language, timezone, and currency"
			}
		]
	},
	{
		label: "Monetization & Creator",
		items: [
			{
				key: "creator",
				label: "Live & Creator",
				icon: Radio,
				badge: "Creator",
				description: "Streaming defaults, moderation, and replay storage"
			},
			{
				key: "wallet",
				label: "Wallet & Payments",
				icon: Wallet,
				description: "Gihanga Points, MTN MoMo, earnings, and payouts"
			},
			{
				key: "ads",
				label: "Ads & Promotions",
				icon: Zap,
				description: "Ad preferences, topic personalization, and boost limits"
			}
		]
	},
	{
		label: "System & Support",
		items: [
			{
				key: "storage",
				label: "Data & Storage",
				icon: Database,
				description: "Clear cached data, video usage, and export archive"
			},
			{
				key: "connected_apps",
				label: "Connected Apps",
				icon: Link$1,
				description: "Third-party integrations and active authorizations"
			},
			{
				key: "support",
				label: "Help & Support",
				icon: CircleQuestionMark,
				description: "Help center, report issues, and community guidelines"
			},
			{
				key: "about",
				label: "About",
				icon: Info,
				description: "Gihanga version, legal terms, and ecosystem info"
			},
			{
				key: "management",
				label: "Account Management",
				icon: Trash2,
				description: "Deactivate account, delete permanently, and session log out"
			}
		]
	}
];
function SettingsPage() {
	useNavigate();
	const { user: authUser, updateConsumerProfile, signOutConsumer } = useAuth();
	const { theme, setTheme } = useTheme();
	const { data: settingsPayload, isLoading } = useUserSettings();
	const updateSettings = useUpdateUserSettings();
	const [activeSection, setActiveSection] = (0, import_react.useState)("overview");
	const [searchQuery, setSearchQuery] = (0, import_react.useState)("");
	const [isMobileMenuOpen, setIsMobileMenuOpen] = (0, import_react.useState)(true);
	const user = (0, import_react.useMemo)(() => {
		if (settingsPayload?.user) return settingsPayload.user;
		if (authUser) return {
			id: authUser.id,
			name: authUser.name,
			username: authUser.username,
			email: authUser.email,
			avatarHue: authUser.avatarHue,
			avatarUrl: authUser.avatarUrl || null,
			bio: authUser.bio || "",
			role: authUser.role,
			isCreator: authUser.isCreator,
			verified: authUser.verified,
			emailVerified: authUser.emailVerified,
			followersCount: authUser.followersCount || 0,
			followingCount: authUser.followingCount || 0,
			postsCount: authUser.postsCount || 0,
			mtnMomoNumber: ""
		};
		return null;
	}, [settingsPayload?.user, authUser]);
	const settings = settingsPayload?.settings;
	const wallet = settingsPayload?.wallet;
	const searchResults = (0, import_react.useMemo)(() => {
		if (!searchQuery.trim()) return [];
		const query = searchQuery.toLowerCase();
		const results = [];
		NAV_GROUPS.forEach((g) => {
			g.items.forEach((item) => {
				if (item.label.toLowerCase().includes(query) || item.description.toLowerCase().includes(query) || g.label.toLowerCase().includes(query)) results.push({
					key: item.key,
					label: item.label,
					group: g.label,
					description: item.description
				});
			});
		});
		return results;
	}, [searchQuery]);
	const handleSelectSection = (key) => {
		setActiveSection(key);
		setIsMobileMenuOpen(false);
		window.scrollTo({
			top: 0,
			behavior: "smooth"
		});
	};
	const handleUpdate = async (updates) => {
		const res = await updateSettings.mutateAsync(updates);
		if (res.user && authUser) {
			const patch = {};
			for (const [key, value] of Object.entries(res.user)) if (value !== void 0) patch[key] = value;
			updateConsumerProfile({
				...authUser,
				...patch
			});
		}
		return res;
	};
	const currentNavGroup = NAV_GROUPS.find((g) => g.items.some((i) => i.key === activeSection));
	const currentNavItem = currentNavGroup?.items.find((i) => i.key === activeSection);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl font-black tracking-tight text-foreground md:text-3xl",
					children: "Settings & Privacy"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground md:text-sm mt-0.5",
					children: "Control your experience, security, and account preferences across Gihanga Updates."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative w-full sm:w-72",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "text",
							placeholder: "Search settings...",
							value: searchQuery,
							onChange: (e) => setSearchQuery(e.target.value),
							className: "pl-9 h-10 rounded-2xl bg-card border-border/80 text-xs font-semibold focus-visible:ring-primary shadow-xs"
						}),
						searchQuery && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setSearchQuery(""),
							className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
						})
					]
				})]
			}),
			searchQuery.trim().length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 rounded-3xl border border-primary/20 bg-card p-4 shadow-soft",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between border-b border-border/60 pb-2 mb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs font-bold text-muted-foreground uppercase tracking-wider",
						children: [
							"Matching Settings (",
							searchResults.length,
							")"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setSearchQuery(""),
						className: "text-xs text-primary font-bold hover:underline",
						children: "Clear"
					})]
				}), searchResults.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "py-6 text-center text-xs text-muted-foreground",
					children: [
						"No matching settings found for \"",
						searchQuery,
						"\"."
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-1 md:grid-cols-2 gap-2",
					children: searchResults.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => {
							handleSelectSection(item.key);
							setSearchQuery("");
						},
						className: "flex items-start gap-3 rounded-2xl p-3 text-left hover:bg-elevated/80 transition-all border border-transparent hover:border-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "size-8 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-bold text-foreground",
									children: item.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-md bg-elevated px-1.5 py-0.5 text-[10px] text-muted-foreground",
									children: item.group
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] text-muted-foreground line-clamp-1 mt-0.5",
								children: item.description
							})]
						})]
					}, item.key))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
						className: "hidden lg:block lg:col-span-4 sticky top-20 space-y-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "surface-card rounded-3xl p-4 border border-border shadow-soft space-y-5",
							children: NAV_GROUPS.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "px-3 text-[11px] font-black uppercase tracking-wider text-muted-foreground",
									children: group.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "space-y-0.5 pt-1",
									children: group.items.map((item) => {
										const Icon = item.icon;
										const isActive = activeSection === item.key;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => handleSelectSection(item.key),
											className: cn("w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all text-left group", isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground hover:bg-elevated hover:text-foreground"),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2.5 min-w-0",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: cn("size-4.5 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-primary-foreground" : "text-muted-foreground") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "truncate",
													children: item.label
												})]
											}), item.badge && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: cn("rounded-full px-2 py-0.5 text-[10px] font-extrabold", isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary"),
												children: item.badge
											})]
										}, item.key);
									})
								})]
							}, group.label))
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-3xl p-4 bg-elevated/60 border border-border/60 text-xs flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4 text-emerald-500" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Gihanga Shield Active" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: () => signOutConsumer(),
								className: "h-8 text-xs font-bold text-danger hover:bg-danger/10 hover:text-danger rounded-xl gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-3.5" }), "Sign Out"]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "lg:hidden col-span-1",
						children: !isMobileMenuOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-4 flex items-center justify-between rounded-2xl bg-card border border-border p-3 shadow-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setIsMobileMenuOpen(true),
								className: "flex items-center gap-2 text-xs font-bold text-primary hover:underline",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), "All Settings"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-black text-foreground",
								children: currentNavItem?.label
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-4",
							children: NAV_GROUPS.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "surface-card rounded-3xl p-4 border border-border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "px-2 text-[11px] font-black uppercase tracking-wider text-muted-foreground",
									children: group.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 divide-y divide-border/40",
									children: group.items.map((item) => {
										const Icon = item.icon;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => handleSelectSection(item.key),
											className: "w-full flex items-center justify-between gap-3 py-3 px-2 text-left hover:bg-elevated/50 rounded-xl transition-all",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-3 min-w-0",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "size-8 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" })
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "min-w-0",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "text-xs font-bold text-foreground flex items-center gap-2",
														children: [item.label, item.badge && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-extrabold text-primary",
															children: item.badge
														})]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-[11px] text-muted-foreground line-clamp-1",
														children: item.description
													})]
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4 text-muted-foreground shrink-0" })]
										}, item.key);
									})
								})]
							}, group.label))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
						className: cn("col-span-1 lg:col-span-8", isMobileMenuOpen ? "hidden lg:block" : "block"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-4 hidden lg:flex items-center gap-2 text-xs font-medium text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setActiveSection("overview"),
										className: "hover:text-primary transition-colors font-bold",
										children: "Settings"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "›" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: currentNavGroup?.label }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "›" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-bold text-foreground",
										children: currentNavItem?.label
									})
								]
							}),
							activeSection === "overview" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OverviewSection, {
								user,
								settings,
								wallet,
								onNavigate: handleSelectSection
							}),
							activeSection === "account" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountSection, {
								user,
								settings,
								onSave: handleUpdate
							}),
							activeSection === "profile" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileSection, {
								user,
								settings,
								onSave: handleUpdate
							}),
							activeSection === "privacy" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrivacySection, {
								settings,
								onSave: handleUpdate
							}),
							activeSection === "security" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SecuritySection, {
								settings,
								onSave: handleUpdate
							}),
							activeSection === "notifications" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationsSection, {
								settings,
								onSave: handleUpdate
							}),
							activeSection === "feed" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeedSection, {
								settings,
								onSave: handleUpdate
							}),
							activeSection === "messages" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessagesSection, {
								settings,
								onSave: handleUpdate
							}),
							activeSection === "creator" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreatorSection, {
								settings,
								onSave: handleUpdate
							}),
							activeSection === "wallet" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WalletSection, {
								settings,
								wallet,
								user
							}),
							activeSection === "ads" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdsSection, {
								settings,
								onSave: handleUpdate
							}),
							activeSection === "appearance" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppearanceSection, {
								settings,
								theme,
								setTheme,
								onSave: handleUpdate
							}),
							activeSection === "accessibility" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccessibilitySection, {
								settings,
								onSave: handleUpdate
							}),
							activeSection === "language" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LanguageSection, {
								settings,
								onSave: handleUpdate
							}),
							activeSection === "storage" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StorageSection, {
								settings,
								onSave: handleUpdate
							}),
							activeSection === "connected_apps" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectedAppsSection, {}),
							activeSection === "blocked" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BlockedAccountsSection, {}),
							activeSection === "support" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HelpSupportSection, {}),
							activeSection === "about" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AboutSection, {}),
							activeSection === "management" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountManagementSection, {})
						]
					})
				]
			})
		]
	}) });
}
function OverviewSection({ user, settings, wallet, onNavigate }) {
	const securityScore = (0, import_react.useMemo)(() => {
		let score = 1;
		if (user?.emailVerified) score += 1;
		if (settings?.phoneVerified || Boolean(user?.mtnMomoNumber)) score += 1;
		if (settings?.twoFactorEnabled) score += 1;
		if (settings?.activeSessions && settings.activeSessions.length > 0) score += 1;
		return score;
	}, [settings, user]);
	const pointsDisplay = wallet?.kingdomPoints ?? 0;
	const cashDisplay = wallet?.available ? `${wallet.available.toLocaleString()} RWF` : "0 RWF";
	const momoStatus = settings?.phoneVerified || Boolean(user?.mtnMomoNumber);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "surface-card rounded-3xl p-6 border border-border shadow-soft relative overflow-hidden bg-gradient-to-br from-card via-card to-primary/5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "size-16 shrink-0 relative",
							children: user?.avatarUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: mediaUrl(user.avatarUrl),
								alt: user?.name || "User avatar",
								className: "size-16 rounded-full object-cover object-center ring-4 ring-primary/20 shadow-md aspect-square"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GAvatar, {
								user: {
									id: user?.id || "me",
									name: user?.name || "Member",
									username: user?.username || "user",
									avatarHue: user?.avatarHue ?? 205,
									avatarUrl: null,
									creator: Boolean(user?.isCreator),
									verified: Boolean(user?.verified),
									live: false,
									followers: user?.followersCount || 0,
									following: user?.followingCount || 0,
									posts: user?.postsCount || 0
								},
								size: "lg",
								className: "size-16 ring-4 ring-primary/20 shadow-md aspect-square"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "font-display text-lg font-black text-foreground",
										children: user?.name || "Gihanga Member"
									}),
									user?.verified && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4 text-primary fill-primary/20" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "secondary",
										className: "text-[10px] font-black uppercase",
										children: settings?.creatorCategory || (user?.isCreator ? "Creator" : "Member")
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs font-medium text-muted-foreground mt-0.5",
								children: [
									"@",
									user?.username || "username",
									" • ",
									user?.email || "No email"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3 mt-2 text-[11px] text-muted-foreground font-semibold",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [user?.followersCount || 0, " followers"] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "•" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [user?.followingCount || 0, " following"] })
								]
							})
						] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 self-stretch sm:self-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => onNavigate("profile"),
							className: "flex-1 sm:flex-none rounded-xl font-bold text-xs h-9",
							children: "Edit Profile"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => onNavigate("account"),
							className: "flex-1 sm:flex-none rounded-xl font-bold text-xs h-9",
							children: "Account Info"
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface-card rounded-3xl p-5 border border-border shadow-soft space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "size-9 rounded-xl bg-emerald-500/10 text-emerald-500 grid place-items-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm font-extrabold text-foreground",
							children: "Security Health Indicator"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: securityScore >= 4 ? "✓ Your account security is strong" : "⚠ Action recommended to maximize protection"
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("rounded-full px-3 py-1 text-xs font-black", securityScore >= 4 ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border border-amber-500/20"),
						children: securityScore >= 4 ? "Protected" : "Action Needed"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl bg-elevated/70 p-3 text-center border border-border/40",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4 text-emerald-500 mx-auto mb-1" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] font-bold block text-foreground",
									children: "Password"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] text-muted-foreground",
									children: "Strong"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl bg-elevated/70 p-3 text-center border border-border/40",
							children: [
								user?.emailVerified ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4 text-emerald-500 mx-auto mb-1" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-4 text-amber-500 mx-auto mb-1" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] font-bold block text-foreground",
									children: "Email"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] text-muted-foreground",
									children: user?.emailVerified ? "Verified" : "Unverified"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl bg-elevated/70 p-3 text-center border border-border/40",
							children: [
								momoStatus ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4 text-emerald-500 mx-auto mb-1" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-4 text-amber-500 mx-auto mb-1" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] font-bold block text-foreground",
									children: "Phone"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] text-muted-foreground",
									children: momoStatus ? "Verified" : "Unverified"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl bg-elevated/70 p-3 text-center border border-border/40",
							children: [
								settings?.twoFactorEnabled ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4 text-emerald-500 mx-auto mb-1" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-4 text-amber-500 mx-auto mb-1" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] font-bold block text-foreground",
									children: "2-Factor Auth"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] text-muted-foreground",
									children: settings?.twoFactorEnabled ? "Active" : "Recommended"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl bg-elevated/70 p-3 text-center border border-border/40 col-span-2 sm:col-span-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Laptop, { className: "size-4 text-primary mx-auto mb-1" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] font-bold block text-foreground",
									children: "Active Devices"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-[10px] text-muted-foreground",
									children: [settings?.activeSessions?.length || 1, " Device(s)"]
								})
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 md:grid-cols-2 gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "surface-card rounded-3xl p-5 border border-border shadow-soft space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4.5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-sm font-extrabold text-foreground",
								children: "Privacy Summary"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => onNavigate("privacy"),
							className: "text-xs font-bold text-primary hover:underline",
							children: "Manage"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2 text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between py-1 border-b border-border/40",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Account Visibility"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-bold text-foreground",
									children: settings?.isPrivateAccount ? "Private" : "Public"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between py-1 border-b border-border/40",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Direct Messages"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-bold text-foreground capitalize",
									children: settings?.whoCanMessage || "Everyone"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between py-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Online Status"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-bold text-foreground",
									children: settings?.showOnlineStatus !== false ? "Visible" : "Hidden"
								})]
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "surface-card rounded-3xl p-5 border border-border shadow-soft space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "size-4.5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-sm font-extrabold text-foreground",
								children: "Gihanga Wallet"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => onNavigate("wallet"),
							className: "text-xs font-bold text-primary hover:underline",
							children: "Open Wallet"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2 text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between py-1 border-b border-border/40",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Points Balance"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-extrabold text-primary",
									children: [pointsDisplay, " Pts"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between py-1 border-b border-border/40",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Available Cash"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-bold text-foreground",
									children: cashDisplay
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between py-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "MTN MoMo Status"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("font-bold", momoStatus ? "text-emerald-500" : "text-amber-500"),
									children: momoStatus ? "✓ Verified" : "Not connected"
								})]
							})
						]
					})]
				})]
			})
		]
	});
}
function AccountSection({ user, settings, onSave }) {
	const [displayName, setDisplayName] = (0, import_react.useState)(user?.name || "");
	const [username, setUsername] = (0, import_react.useState)(user?.username || "");
	const [phone, setPhone] = (0, import_react.useState)(settings?.phone || user?.mtnMomoNumber || "");
	const [dob, setDob] = (0, import_react.useState)(settings?.dob || "1998-05-14");
	const [gender, setGender] = (0, import_react.useState)(settings?.gender || "prefer_not_to_say");
	const [isSaving, setIsSaving] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (user?.name) setDisplayName(user.name);
		if (user?.username) setUsername(user.username);
		if (settings?.phone || user?.mtnMomoNumber) setPhone(settings?.phone || user?.mtnMomoNumber || "");
		if (settings?.dob) setDob(settings.dob);
		if (settings?.gender) setGender(settings.gender);
	}, [user, settings]);
	const handleSaveAccountInfo = async () => {
		setIsSaving(true);
		try {
			await onSave({
				name: displayName.trim(),
				username: username.trim().toLowerCase(),
				phone: phone.trim(),
				dob,
				gender
			});
			toast.success("Account information updated successfully");
		} catch (err) {
			toast.error(err?.response?.data?.message || err?.message || "Failed to update account information");
		} finally {
			setIsSaving(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SettingsSection, {
			title: "Personal Information",
			description: "Review and update your core identity credentials and contact information.",
			icon: User,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 md:grid-cols-2 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs font-bold",
							children: "Display Name"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: displayName,
							placeholder: "Your full name",
							onChange: (e) => setDisplayName(e.target.value),
							className: "h-10 rounded-xl"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between items-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs font-bold",
								children: "Username"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] text-muted-foreground",
								children: "Permanent handle"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground",
								children: "@"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: username,
								placeholder: "username",
								onChange: (e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")),
								className: "pl-7 h-10 rounded-xl font-mono text-xs font-bold"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between items-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs font-bold",
									children: "Email Address"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("text-[10px] font-bold", user?.emailVerified ? "text-emerald-500" : "text-amber-500"),
									children: user?.emailVerified ? "✓ Verified" : "⚠ Unverified"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: user?.email || "",
								disabled: true,
								placeholder: "user@example.com",
								className: "h-10 rounded-xl bg-elevated/50 font-mono text-xs"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] text-muted-foreground",
								children: "Contact support to change your primary login email."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between items-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs font-bold",
								children: "Phone Number"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("text-[10px] font-bold", settings?.phoneVerified || Boolean(user?.mtnMomoNumber) ? "text-emerald-500" : "text-muted-foreground"),
								children: settings?.phoneVerified || Boolean(user?.mtnMomoNumber) ? "✓ Verified" : "Unverified"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: phone,
							placeholder: "+250 788 000 000",
							onChange: (e) => setPhone(e.target.value),
							className: "h-10 rounded-xl font-mono text-xs"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs font-bold",
							children: "Date of Birth"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "date",
							value: dob,
							onChange: (e) => setDob(e.target.value),
							className: "h-10 rounded-xl text-xs"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs font-bold",
							children: "Gender"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: gender,
							onChange: (e) => setGender(e.target.value),
							className: "w-full h-10 rounded-xl bg-elevated border border-border px-3 text-xs font-bold text-foreground outline-none focus:ring-2 focus:ring-primary",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "male",
									children: "Male"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "female",
									children: "Female"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "custom",
									children: "Custom / Non-binary"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "prefer_not_to_say",
									children: "Prefer not to say"
								})
							]
						})]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pt-4 flex justify-end gap-3 border-t border-border/40",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: handleSaveAccountInfo,
					disabled: isSaving,
					className: "rounded-xl font-bold text-xs h-9 px-5",
					children: isSaving ? "Saving..." : "Save Changes"
				})
			})]
		})
	});
}
function ProfileSection({ user, settings, onSave }) {
	const [name, setName] = (0, import_react.useState)(user?.name || "");
	const [bio, setBio] = (0, import_react.useState)(user?.bio || "");
	const [website, setWebsite] = (0, import_react.useState)(settings?.website || "");
	const [creatorCategory, setCreatorCategory] = (0, import_react.useState)(settings?.creatorCategory || "General Creator");
	const [avatarUrl, setAvatarUrl] = (0, import_react.useState)(user?.avatarUrl || "");
	const [isUploading, setIsUploading] = (0, import_react.useState)(false);
	const [isSaving, setIsSaving] = (0, import_react.useState)(false);
	const fileInputRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (user?.name) setName(user.name);
		if (user?.bio !== void 0) setBio(user.bio);
		if (user?.avatarUrl) setAvatarUrl(user.avatarUrl);
		if (settings?.website) setWebsite(settings.website);
		if (settings?.creatorCategory) setCreatorCategory(settings.creatorCategory);
	}, [user, settings]);
	const handleAvatarSelect = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setIsUploading(true);
		try {
			const res = await uploadFile("avatars", file);
			setAvatarUrl(res.url);
			await onSave({ avatarUrl: res.url });
			toast.success("Profile photo uploaded and updated!");
		} catch (err) {
			toast.error(err?.message || "Failed to upload photo.");
		} finally {
			setIsUploading(false);
		}
	};
	const handleSaveProfile = async () => {
		setIsSaving(true);
		try {
			await onSave({
				name: name.trim(),
				bio: bio.trim(),
				website: website.trim(),
				creatorCategory,
				avatarUrl
			});
			toast.success("Profile customization saved");
		} catch (err) {
			toast.error(err?.response?.data?.message || err?.message || "Failed to update profile");
		} finally {
			setIsSaving(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SettingsSection, {
			title: "Public Profile Customization",
			description: "This information will appear on your public creator card, posts, and search results.",
			icon: Camera,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col sm:flex-row items-center gap-6 rounded-2xl bg-elevated/40 p-4 border border-border/50",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative group size-20 shrink-0",
						children: [
							avatarUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: mediaUrl(avatarUrl),
								alt: name || "User avatar",
								className: "size-20 rounded-full object-cover object-center ring-4 ring-primary/20 shadow-md aspect-square"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GAvatar, {
								user: {
									id: user?.id || "me",
									name: name || user?.name || "Member",
									username: user?.username || "user",
									avatarHue: user?.avatarHue ?? 205,
									avatarUrl: null,
									creator: Boolean(user?.isCreator),
									verified: Boolean(user?.verified),
									live: false,
									followers: user?.followersCount || 0,
									following: user?.followingCount || 0,
									posts: user?.postsCount || 0
								},
								size: "xl",
								className: "size-20 ring-4 ring-primary/20 shadow-md aspect-square"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => fileInputRef.current?.click(),
								disabled: isUploading,
								className: "absolute inset-0 bg-black/50 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "size-5 mb-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[9px] font-bold",
									children: isUploading ? "..." : "Change"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								ref: fileInputRef,
								type: "file",
								accept: "image/*",
								className: "hidden",
								onChange: handleAvatarSelect
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 text-center sm:text-left space-y-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
								className: "text-sm font-extrabold text-foreground",
								children: name || user?.username || "Your Name"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground",
								children: ["@", user?.username || "username"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "pt-1 flex flex-wrap gap-2 justify-center sm:justify-start",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "sm",
									onClick: () => fileInputRef.current?.click(),
									disabled: isUploading,
									className: "h-8 rounded-xl text-xs font-bold",
									children: isUploading ? "Uploading..." : "Upload New Photo"
								})
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs font-bold",
								children: "Display Name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: name,
								placeholder: "Your public name",
								onChange: (e) => setName(e.target.value),
								className: "h-10 rounded-xl"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between items-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs font-bold",
									children: "Bio"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-[10px] text-muted-foreground",
									children: [bio.length, "/160"]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								value: bio,
								maxLength: 160,
								onChange: (e) => setBio(e.target.value),
								rows: 3,
								placeholder: "Tell the community about yourself, your art, or your business...",
								className: "w-full rounded-xl bg-elevated border border-border p-3 text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-primary"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 md:grid-cols-2 gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs font-bold",
									children: "Website / Link"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: website,
									placeholder: "https://example.com",
									onChange: (e) => setWebsite(e.target.value),
									className: "h-10 rounded-xl"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs font-bold",
									children: "Creator Category"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: creatorCategory,
									onChange: (e) => setCreatorCategory(e.target.value),
									className: "w-full h-10 rounded-xl bg-elevated border border-border px-3 text-xs font-bold text-foreground outline-none focus:ring-2 focus:ring-primary",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "General Creator",
											children: "General Creator"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "Music & Audio",
											children: "Music & Audio"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "Visual Art & Design",
											children: "Visual Art & Design"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "Tech & Innovation",
											children: "Tech & Innovation"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "News & Media",
											children: "News & Media"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "Fashion & Lifestyle",
											children: "Fashion & Lifestyle"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "Gaming & Esports",
											children: "Gaming & Esports"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "Business & Entrepreneurship",
											children: "Business & Entrepreneurship"
										})
									]
								})]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pt-4 flex justify-end gap-3 border-t border-border/40",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: handleSaveProfile,
						disabled: isSaving,
						className: "rounded-xl font-bold text-xs h-9 px-5",
						children: isSaving ? "Saving..." : "Save Profile"
					})
				})
			]
		})
	});
}
function PrivacySection({ settings, onSave }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SettingsSection, {
				title: "Account Visibility",
				description: "Choose who can discover your profile, watch your stories, and view your posts.",
				icon: Eye,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsToggle, {
					id: "isPrivateAccount",
					label: "Private Account",
					hint: "When enabled, only users you approve will be able to follow you and view your media.",
					checked: settings?.isPrivateAccount || false,
					onChange: (val) => onSave({ isPrivateAccount: val })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsSelect, {
					label: "Who can follow you",
					hint: "Control whether anyone can immediately follow or if you must review follow requests.",
					value: settings?.whoCanFollow || "everyone",
					options: [{
						value: "everyone",
						label: "Everyone (Instant Follow)"
					}, {
						value: "approval",
						label: "Requires Follow Approval"
					}],
					onChange: (val) => onSave({ whoCanFollow: val })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SettingsSection, {
				title: "Interactions & Mentions",
				description: "Manage permissions for commenting, direct messaging, and referencing your account.",
				icon: MessageSquare,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsSelect, {
						label: "Who can send you direct messages",
						hint: "Control who can start new chat conversations with you.",
						value: settings?.whoCanMessage || "everyone",
						options: [
							{
								value: "everyone",
								label: "Everyone"
							},
							{
								value: "followers",
								label: "Followers only"
							},
							{
								value: "following",
								label: "People you follow"
							},
							{
								value: "nobody",
								label: "Nobody"
							}
						],
						onChange: (val) => onSave({ whoCanMessage: val })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsSelect, {
						label: "Who can comment on your posts",
						hint: "Filter who is allowed to write replies and comments on your feed posts.",
						value: settings?.whoCanComment || "everyone",
						options: [
							{
								value: "everyone",
								label: "Everyone"
							},
							{
								value: "followers",
								label: "Followers only"
							},
							{
								value: "following",
								label: "People you follow"
							},
							{
								value: "nobody",
								label: "Nobody"
							}
						],
						onChange: (val) => onSave({ whoCanComment: val })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsSelect, {
						label: "Who can tag or mention you",
						hint: "Choose who can tag your @username in posts, reels, and stories.",
						value: settings?.whoCanMention || "everyone",
						options: [
							{
								value: "everyone",
								label: "Everyone"
							},
							{
								value: "followers",
								label: "Followers only"
							},
							{
								value: "following",
								label: "People you follow"
							},
							{
								value: "nobody",
								label: "Nobody"
							}
						],
						onChange: (val) => onSave({ whoCanMention: val })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsSelect, {
						label: "Remix & Duet Permissions",
						hint: "Allow creators to sample your audio clips and build reels using your content.",
						value: settings?.whoCanRemix || "everyone",
						options: [
							{
								value: "everyone",
								label: "Everyone"
							},
							{
								value: "followers",
								label: "Followers only"
							},
							{
								value: "nobody",
								label: "Nobody"
							}
						],
						onChange: (val) => onSave({ whoCanRemix: val })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SettingsSection, {
				title: "Activity & Presence",
				description: "Control what information is visible when you are active on Gihanga Updates.",
				icon: SlidersVertical,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsToggle, {
						id: "showOnlineStatus",
						label: "Show Online Status",
						hint: "Allow people you follow and message to see when you're currently active.",
						checked: settings?.showOnlineStatus !== false,
						onChange: (val) => onSave({ showOnlineStatus: val })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsToggle, {
						id: "showReadReceipts",
						label: "Show Read Receipts",
						hint: "Let chat participants know when you have read their messages.",
						checked: settings?.showReadReceipts !== false,
						onChange: (val) => onSave({ showReadReceipts: val })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsToggle, {
						id: "showTypingIndicator",
						label: "Show Typing Indicator",
						hint: "Display the typing bubble when you are writing a message.",
						checked: settings?.showTypingIndicator !== false,
						onChange: (val) => onSave({ showTypingIndicator: val })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsToggle, {
						id: "showLikedPosts",
						label: "Display Liked Posts on Profile",
						hint: "Allow other users to view your public Likes tab on your profile page.",
						checked: settings?.showLikedPosts !== false,
						onChange: (val) => onSave({ showLikedPosts: val })
					})
				]
			})
		]
	});
}
function SecuritySection({ settings, onSave }) {
	const [showPasswordModal, setShowPasswordModal] = (0, import_react.useState)(false);
	const [currentPassword, setCurrentPassword] = (0, import_react.useState)("");
	const [newPassword, setNewPassword] = (0, import_react.useState)("");
	const [confirmPassword, setConfirmPassword] = (0, import_react.useState)("");
	const [isChangingPassword, setIsChangingPassword] = (0, import_react.useState)(false);
	const changePasswordMutation = useChangePassword();
	const revokeSessionsMutation = useRevokeAllSessions();
	const handleChangePassword = async (e) => {
		e.preventDefault();
		if (newPassword !== confirmPassword) {
			toast.error("New passwords do not match");
			return;
		}
		if (newPassword.length < 8) {
			toast.error("New password must be at least 8 characters long");
			return;
		}
		setIsChangingPassword(true);
		try {
			await changePasswordMutation.mutateAsync({
				currentPassword,
				newPassword
			});
			toast.success("Password changed successfully");
			setShowPasswordModal(false);
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
		} catch (err) {
			toast.error(err?.response?.data?.message || "Failed to change password");
		} finally {
			setIsChangingPassword(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsSection, {
				title: "Login Credentials",
				description: "Keep your password strong and updated regularly to prevent unauthorized access.",
				icon: Key,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsRow, {
					label: "Account Password",
					hint: "Last changed 3 months ago. We recommend at least 10 characters with mixed symbols.",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => setShowPasswordModal(true),
						className: "rounded-xl text-xs font-bold",
						children: "Change Password"
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SettingsSection, {
				title: "Two-Factor Authentication (2FA)",
				description: "Protect your Gihanga account with an extra security layer upon login.",
				icon: Shield,
				badge: settings?.twoFactorEnabled ? "Active" : "Recommended",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsToggle, {
					id: "twoFactorEnabled",
					label: "Enable Two-Factor Authentication",
					hint: "Require a 6-digit confirmation code when signing in from an unrecognized browser or phone.",
					checked: settings?.twoFactorEnabled || false,
					onChange: (val) => onSave({ twoFactorEnabled: val })
				}), settings?.twoFactorEnabled && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsSelect, {
					label: "Preferred 2FA Method",
					hint: "Choose how you wish to receive your secondary security codes.",
					value: settings?.twoFactorMethod || "app",
					options: [
						{
							value: "app",
							label: "Authenticator App (Google Auth, Authy)"
						},
						{
							value: "email",
							label: "Email Verification Code"
						},
						{
							value: "sms",
							label: "SMS / Text Message"
						}
					],
					onChange: (val) => onSave({ twoFactorMethod: val })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsSection, {
				title: "Login Activity & Sessions",
				description: "Review all devices currently authenticated to your Gihanga Updates account.",
				icon: Laptop,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [settings?.activeSessions && settings.activeSessions.length > 0 ? settings.activeSessions.map((sess) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center justify-between p-3 rounded-2xl bg-elevated/60 border border-border/40",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Monitor, { className: "size-5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs font-bold text-foreground",
									children: [
										sess.device,
										" • ",
										sess.browser
									]
								}), sess.isCurrent && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full bg-emerald-500/10 text-emerald-500 px-2 py-0.5 text-[9px] font-extrabold",
									children: "This Device"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-[11px] text-muted-foreground mt-0.5",
								children: [
									sess.location,
									" • ",
									new Date(sess.lastActive).toLocaleDateString()
								]
							})] })]
						})
					}, sess.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center justify-between p-3 rounded-2xl bg-elevated/60 border border-border/40",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Monitor, { className: "size-5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-bold text-foreground",
									children: "Current Browser Session"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full bg-emerald-500/10 text-emerald-500 px-2 py-0.5 text-[9px] font-extrabold",
									children: "This Device"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] text-muted-foreground mt-0.5",
								children: "Kigali, Rwanda • Active now"
							})] })]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "pt-2 flex justify-end",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => revokeSessionsMutation.mutate(),
							disabled: revokeSessionsMutation.isPending,
							className: "rounded-xl text-xs font-bold text-danger hover:bg-danger/10 hover:text-danger",
							children: revokeSessionsMutation.isPending ? "Logging out..." : "Log Out All Other Devices"
						})
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SettingsSection, {
				title: "Security Alerts & Notifications",
				description: "Receive instant alerts when sensitive changes happen to your account.",
				icon: Bell,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsToggle, {
					id: "loginAlerts",
					label: "Unrecognized Device Logins",
					hint: "Send an alert when someone logs into your account from a new location.",
					checked: settings?.loginAlerts !== false,
					onChange: (val) => onSave({ loginAlerts: val })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsToggle, {
					id: "passwordChangeAlerts",
					label: "Password & Email Modifications",
					hint: "Alert you immediately if your credentials or recovery info are altered.",
					checked: settings?.passwordChangeAlerts !== false,
					onChange: (val) => onSave({ passwordChangeAlerts: val })
				})]
			}),
			showPasswordModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 bg-black/60 backdrop-blur-xs grid place-items-center p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-md surface-card rounded-3xl p-6 border border-border shadow-2xl space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-base font-extrabold text-foreground",
							children: "Change Password"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setShowPasswordModal(false),
							className: "text-muted-foreground hover:text-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleChangePassword,
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs font-bold",
									children: "Current Password"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "password",
									required: true,
									value: currentPassword,
									onChange: (e) => setCurrentPassword(e.target.value),
									className: "h-10 rounded-xl"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs font-bold",
									children: "New Password"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "password",
									required: true,
									value: newPassword,
									onChange: (e) => setNewPassword(e.target.value),
									className: "h-10 rounded-xl"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs font-bold",
									children: "Confirm New Password"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "password",
									required: true,
									value: confirmPassword,
									onChange: (e) => setConfirmPassword(e.target.value),
									className: "h-10 rounded-xl"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "pt-2 flex justify-end gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "outline",
									size: "sm",
									onClick: () => setShowPasswordModal(false),
									className: "rounded-xl text-xs font-bold",
									children: "Cancel"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									size: "sm",
									disabled: isChangingPassword,
									className: "rounded-xl text-xs font-bold",
									children: isChangingPassword ? "Updating..." : "Update Password"
								})]
							})
						]
					})]
				})
			})
		]
	});
}
function NotificationsSection({ settings, onSave }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SettingsSection, {
				title: "Push Notifications",
				description: "Choose which interactions trigger instant notifications on your device.",
				icon: Bell,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsToggle, {
						id: "pushLikes",
						label: "Likes & Reactions",
						hint: "When someone likes your post, reel, or comment.",
						checked: settings?.pushLikes !== false,
						onChange: (val) => onSave({ pushLikes: val })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsToggle, {
						id: "pushComments",
						label: "Comments & Replies",
						hint: "When someone leaves a comment on your content.",
						checked: settings?.pushComments !== false,
						onChange: (val) => onSave({ pushComments: val })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsToggle, {
						id: "pushFollows",
						label: "New Followers",
						hint: "When someone starts following your creator channel.",
						checked: settings?.pushFollows !== false,
						onChange: (val) => onSave({ pushFollows: val })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsToggle, {
						id: "pushMentions",
						label: "Mentions & Tags",
						hint: "When someone tags your @username in a caption or story.",
						checked: settings?.pushMentions !== false,
						onChange: (val) => onSave({ pushMentions: val })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsToggle, {
						id: "pushMessages",
						label: "Direct Messages",
						hint: "When you receive new private messages or chat requests.",
						checked: settings?.pushMessages !== false,
						onChange: (val) => onSave({ pushMessages: val })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsToggle, {
						id: "pushLive",
						label: "Live Streams",
						hint: "When creators you follow start a live broadcast.",
						checked: settings?.pushLive !== false,
						onChange: (val) => onSave({ pushLive: val })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SettingsSection, {
				title: "Quiet Hours Mode",
				description: "Mute non-urgent notifications during your resting hours.",
				icon: Clock,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsToggle, {
					id: "quietModeEnabled",
					label: "Enable Quiet Hours",
					hint: "Automatically mute sound and push alerts during your designated window.",
					checked: settings?.quietModeEnabled || false,
					onChange: (val) => onSave({ quietModeEnabled: val })
				}), settings?.quietModeEnabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-4 pt-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs font-bold",
							children: "Start Time"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "time",
							value: settings?.quietModeStart || "22:00",
							onChange: (e) => onSave({ quietModeStart: e.target.value }),
							className: "h-10 rounded-xl"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs font-bold",
							children: "End Time"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "time",
							value: settings?.quietModeEnd || "07:00",
							onChange: (e) => onSave({ quietModeEnd: e.target.value }),
							className: "h-10 rounded-xl"
						})]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SettingsSection, {
				title: "Email Notifications",
				description: "Stay informed about transactions, security updates, and creator digests.",
				icon: Globe,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsToggle, {
						id: "emailSecurity",
						label: "Security & Account Alerts",
						hint: "Critical account and payment notifications (recommended).",
						checked: settings?.emailSecurity !== false,
						onChange: (val) => onSave({ emailSecurity: val })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsToggle, {
						id: "emailTransactions",
						label: "Wallet & Financial Receipts",
						hint: "Receive emailed invoices for point purchases and MoMo withdrawals.",
						checked: settings?.emailTransactions !== false,
						onChange: (val) => onSave({ emailTransactions: val })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsToggle, {
						id: "emailDigest",
						label: "Weekly Creator Digest",
						hint: "A summary of your top performing posts, follower growth, and trending hashtags.",
						checked: settings?.emailDigest || false,
						onChange: (val) => onSave({ emailDigest: val })
					})
				]
			})
		]
	});
}
function FeedSection({ settings, onSave }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SettingsSection, {
			title: "Content Preferences & Filters",
			description: "Fine-tune your browsing experience and video playback options.",
			icon: SlidersHorizontal,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsSelect, {
					label: "Sensitive Content Filter",
					hint: "Control the amount of sensitive or age-restricted media displayed in your feed.",
					value: settings?.sensitiveContentFilter || "standard",
					options: [
						{
							value: "less",
							label: "Strict (Hide all sensitive material)"
						},
						{
							value: "standard",
							label: "Standard (Default protection)"
						},
						{
							value: "more",
							label: "Relaxed (Show all content)"
						}
					],
					onChange: (val) => onSave({ sensitiveContentFilter: val })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsSelect, {
					label: "Autoplay Videos & Reels",
					hint: "Choose under which network conditions videos automatically play in your feed.",
					value: settings?.autoplayVideos || "always",
					options: [
						{
							value: "always",
							label: "Always Autoplay (Wi-Fi + Cellular)"
						},
						{
							value: "wifi",
							label: "Only on Wi-Fi"
						},
						{
							value: "never",
							label: "Never Autoplay"
						}
					],
					onChange: (val) => onSave({ autoplayVideos: val })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsToggle, {
					id: "dataSaver",
					label: "Data Saver Mode",
					hint: "Stream lower resolution videos and compress images to conserve mobile data.",
					checked: settings?.dataSaver || false,
					onChange: (val) => onSave({ dataSaver: val })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsSelect, {
					label: "Preferred Video Quality",
					hint: "Set default stream resolution for reels and video broadcasts.",
					value: settings?.preferredVideoQuality || "auto",
					options: [
						{
							value: "auto",
							label: "Automatic (Optimized for speed)"
						},
						{
							value: "high",
							label: "High Definition (1080p)"
						},
						{
							value: "low",
							label: "Low Data (480p)"
						}
					],
					onChange: (val) => onSave({ preferredVideoQuality: val })
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SettingsSection, {
			title: "Feed Personalization",
			description: "Gihanga adapts to content you watch, like, and share.",
			icon: Sparkles,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsSelect, {
				label: "Default Feed View",
				hint: "Select the feed tab displayed by default when opening Gihanga Updates.",
				value: settings?.defaultFeed || "for_you",
				options: [{
					value: "for_you",
					label: "For You (Discovery & Recommended)"
				}, {
					value: "following",
					label: "Following (Accounts you follow)"
				}],
				onChange: (val) => onSave({ defaultFeed: val })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsToggle, {
				id: "hideSuggestedContent",
				label: "Reduce Suggested Posts",
				hint: "Prioritize posts strictly from people you follow in your main timeline.",
				checked: settings?.hideSuggestedContent || false,
				onChange: (val) => onSave({ hideSuggestedContent: val })
			})]
		})]
	});
}
function MessagesSection({ settings, onSave }) {
	const [newBlockedWord, setNewBlockedWord] = (0, import_react.useState)("");
	const blockedWords = settings?.blockedWords || [];
	const handleAddWord = (e) => {
		e.preventDefault();
		if (!newBlockedWord.trim()) return;
		const word = newBlockedWord.trim().toLowerCase();
		if (!blockedWords.includes(word)) onSave({ blockedWords: [...blockedWords, word] });
		setNewBlockedWord("");
	};
	const handleRemoveWord = (wordToRemove) => {
		onSave({ blockedWords: blockedWords.filter((w) => w !== wordToRemove) });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SettingsSection, {
			title: "Direct Messaging Controls",
			description: "Manage privacy, message requests, and chat behavior.",
			icon: MessageSquare,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsSelect, {
					label: "Message Requests",
					hint: "Who can send you incoming chat requests.",
					value: settings?.messageRequests || "everyone",
					options: [
						{
							value: "everyone",
							label: "Everyone"
						},
						{
							value: "followers",
							label: "Followers only"
						},
						{
							value: "following",
							label: "People you follow"
						},
						{
							value: "nobody",
							label: "Nobody"
						}
					],
					onChange: (val) => onSave({ messageRequests: val })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsToggle, {
					id: "msgReadReceipts",
					label: "Read Receipts",
					hint: "Show when you have viewed messages in direct conversations.",
					checked: settings?.readReceipts !== false,
					onChange: (val) => onSave({ readReceipts: val })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsToggle, {
					id: "msgTypingIndicator",
					label: "Typing Indicators",
					hint: "Display real-time typing indicators in chat rooms.",
					checked: settings?.typingIndicator !== false,
					onChange: (val) => onSave({ typingIndicator: val })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsSelect, {
					label: "Auto-Download Media",
					hint: "Automatically download incoming photos, audio clips, and documents.",
					value: settings?.autoDownloadMedia || "wifi",
					options: [
						{
							value: "always",
							label: "Always (Wi-Fi + Mobile)"
						},
						{
							value: "wifi",
							label: "Wi-Fi Only"
						},
						{
							value: "never",
							label: "Never (Manual Download)"
						}
					],
					onChange: (val) => onSave({ autoDownloadMedia: val })
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SettingsSection, {
			title: "Hidden Words & Comment Filter",
			description: "Messages and comments containing these words or phrases will be automatically filtered.",
			icon: Ban,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: handleAddWord,
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Add word or phrase to filter...",
					value: newBlockedWord,
					onChange: (e) => setNewBlockedWord(e.target.value),
					className: "h-10 rounded-xl text-xs"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					size: "sm",
					className: "rounded-xl font-bold text-xs",
					children: "Add Filter"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2 pt-2",
				children: blockedWords.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-muted-foreground",
					children: "No filtered words added yet."
				}) : blockedWords.map((word) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center gap-1.5 rounded-xl bg-elevated border border-border px-3 py-1 text-xs font-bold text-foreground",
					children: [word, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => handleRemoveWord(word),
						className: "text-muted-foreground hover:text-danger",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
					})]
				}, word))
			})]
		})]
	});
}
function CreatorSection({ settings, onSave }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SettingsSection, {
			title: "Live Broadcast Defaults",
			description: "Configure stream defaults, audience privacy, and replay archiving.",
			icon: Radio,
			badge: "Live Studio",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-xs font-bold",
						children: "Default Stream Title"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: settings?.defaultLiveTitle || "Live with Gihanga Community",
						onChange: (e) => onSave({ defaultLiveTitle: e.target.value }),
						className: "h-10 rounded-xl text-xs font-bold"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsSelect, {
					label: "Default Audience",
					hint: "Select who is invited when you begin a new live broadcast.",
					value: settings?.defaultLiveAudience || "public",
					options: [
						{
							value: "public",
							label: "Public (Open to everyone)"
						},
						{
							value: "followers",
							label: "Followers Only"
						},
						{
							value: "subscribers",
							label: "Subscribers / Top Supporters"
						}
					],
					onChange: (val) => onSave({ defaultLiveAudience: val })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsToggle, {
					id: "notifyFollowersOnLive",
					label: "Broadcast Notification",
					hint: "Send push alert to followers as soon as you go live.",
					checked: settings?.notifyFollowersOnLive !== false,
					onChange: (val) => onSave({ notifyFollowersOnLive: val })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsToggle, {
					id: "saveLiveReplays",
					label: "Save Live Replays",
					hint: "Automatically archive full broadcast recordings to your Creator Studio.",
					checked: settings?.saveLiveReplays !== false,
					onChange: (val) => onSave({ saveLiveReplays: val })
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SettingsSection, {
			title: "Chat Moderation",
			description: "Ensure a respectful and engaging atmosphere during your live streams.",
			icon: Shield,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsToggle, {
				id: "allowLiveComments",
				label: "Allow Live Chat",
				hint: "Enable real-time viewer messages during your broadcast.",
				checked: settings?.allowLiveComments !== false,
				onChange: (val) => onSave({ allowLiveComments: val })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsToggle, {
				id: "liveSlowMode",
				label: "Chat Slow Mode",
				hint: "Limit viewers to one message every 5 seconds to reduce spam.",
				checked: settings?.liveSlowMode || false,
				onChange: (val) => onSave({ liveSlowMode: val })
			})]
		})]
	});
}
function WalletSection({ settings, wallet, user }) {
	const points = wallet?.kingdomPoints ?? 0;
	const cash = wallet?.available ? `${wallet.available.toLocaleString()} RWF` : "0 RWF";
	const phone = settings?.phone || user?.mtnMomoNumber;
	const maskedPhone = (0, import_react.useMemo)(() => {
		if (!phone) return "No Mobile Money linked";
		const cleaned = phone.replace(/\s+/g, "");
		if (cleaned.length < 7) return cleaned;
		return `${cleaned.substring(0, 6)} •••• ${cleaned.substring(cleaned.length - 3)}`;
	}, [phone]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "surface-card rounded-3xl p-6 border border-border shadow-soft bg-gradient-to-br from-card to-primary/10 space-y-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-bold text-muted-foreground uppercase tracking-wider",
						children: "Total Creator Balance"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-baseline gap-2 mt-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-3xl font-black text-foreground",
							children: cash
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground mt-0.5",
						children: [
							"≈ ",
							points,
							" Gihanga Points available"
						]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "rounded-xl font-bold text-xs h-9",
						children: "Withdraw to MoMo"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						className: "rounded-xl font-bold text-xs h-9",
						children: "Add Points"
					})]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsSection, {
			title: "Connected Payment Methods",
			description: "Manage your payout channels and payment sources.",
			icon: CreditCard,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between p-4 rounded-2xl bg-elevated border border-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "size-10 rounded-xl bg-amber-500/20 text-amber-500 grid place-items-center font-black text-xs",
							children: "MTN"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-bold text-foreground",
								children: "MTN Mobile Money (Rwanda)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-full bg-emerald-500/10 text-emerald-500 px-2 py-0.5 text-[9px] font-extrabold",
								children: "Primary Payout"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-[11px] font-mono text-muted-foreground mt-0.5",
							children: [
								maskedPhone,
								" ",
								phone ? "• Verified" : ""
							]
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						className: "rounded-xl text-xs font-bold text-primary",
						children: "Manage"
					})]
				})
			})
		})]
	});
}
function AdsSection({ settings, onSave }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SettingsSection, {
			title: "Personal Advertising Preferences",
			description: "Control how advertising content is personalized to your interests.",
			icon: Zap,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsToggle, {
				id: "personalizedAds",
				label: "Personalized Ads",
				hint: "Allow Gihanga to tailor promoted posts based on your viewing history and creator interests.",
				checked: true,
				onChange: () => toast.info("Ad preferences saved")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsToggle, {
				id: "partnerAds",
				label: "Ecosystem Partner Offers",
				hint: "Receive discounts and promotions from vetted Rwandan creators and businesses.",
				checked: true,
				onChange: () => toast.info("Partner preferences saved")
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsSection, {
			title: "Creator Promotions & Boosts",
			description: "Monitor budget limits and point spending for boosted posts.",
			icon: Sparkles,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsRow, {
				label: "Promotions Balance",
				hint: "Use Gihanga Points to boost reels and reach wider audiences.",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					className: "rounded-xl text-xs font-bold",
					children: "Create Campaign"
				})
			})
		})]
	});
}
function AppearanceSection({ settings, theme, setTheme, onSave }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SettingsSection, {
			title: "Theme & Interface Styling",
			description: "Personalize the visual aesthetics of Gihanga Updates.",
			icon: Moon,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-xs font-bold",
						children: "Color Theme"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								setTheme("light");
								onSave({ theme: "light" });
							},
							className: cn("flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all", theme === "light" ? "border-primary bg-primary/10 ring-2 ring-primary/20" : "border-border bg-elevated hover:border-primary/50"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "size-5 text-amber-500" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-bold block text-foreground",
								children: "Light Mode"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] text-muted-foreground",
								children: "Clean daylight theme"
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								setTheme("dark");
								onSave({ theme: "dark" });
							},
							className: cn("flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all", theme === "dark" ? "border-primary bg-primary/10 ring-2 ring-primary/20" : "border-border bg-elevated hover:border-primary/50"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "size-5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-bold block text-foreground",
								children: "Dark Mode"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] text-muted-foreground",
								children: "Sleek obsidian night theme"
							})] })]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsSelect, {
					label: "Interface Density",
					hint: "Adjust padding and element sizes across lists and cards.",
					value: settings?.density || "comfortable",
					options: [{
						value: "comfortable",
						label: "Comfortable (Standard spacing)"
					}, {
						value: "compact",
						label: "Compact (Fit more on screen)"
					}],
					onChange: (val) => onSave({ density: val })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsSelect, {
					label: "Micro-Animations",
					hint: "Control spring physics and transition effects.",
					value: settings?.animations || "full",
					options: [{
						value: "full",
						label: "Full (Smooth spring animations)"
					}, {
						value: "reduced",
						label: "Reduced (Minimal transitions)"
					}],
					onChange: (val) => onSave({ animations: val })
				})
			]
		})
	});
}
function AccessibilitySection({ settings, onSave }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SettingsSection, {
			title: "Accessibility & Readability",
			description: "Make Gihanga Updates easier to navigate and read.",
			icon: SlidersVertical,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsToggle, {
					id: "reducedMotion",
					label: "Reduced Motion",
					hint: "Minimizes smooth page sliding and video background effects.",
					checked: settings?.reducedMotion || false,
					onChange: (val) => onSave({ reducedMotion: val })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsToggle, {
					id: "largerText",
					label: "Larger Typography",
					hint: "Increases font scaling across captions, comments, and navigation labels.",
					checked: settings?.largerText || false,
					onChange: (val) => onSave({ largerText: val })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsToggle, {
					id: "highContrast",
					label: "High Contrast Mode",
					hint: "Boosts text and border contrast for clearer visibility in bright environments.",
					checked: settings?.highContrast || false,
					onChange: (val) => onSave({ highContrast: val })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsToggle, {
					id: "captionsEnabled",
					label: "Closed Captions & Subtitles",
					hint: "Display automatic transcripts on video reels and creator streams.",
					checked: settings?.captionsEnabled !== false,
					onChange: (val) => onSave({ captionsEnabled: val })
				})
			]
		})
	});
}
function LanguageSection({ settings, onSave }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SettingsSection, {
			title: "Language & Regional Preferences",
			description: "Select your preferred language, date formats, and regional display units.",
			icon: Globe,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsSelect, {
					label: "Interface Language",
					hint: "The primary language used throughout Gihanga Updates.",
					value: settings?.language || "en",
					options: [
						{
							value: "en",
							label: "English (US)"
						},
						{
							value: "rw",
							label: "Ikinyarwanda"
						},
						{
							value: "fr",
							label: "Français"
						},
						{
							value: "sw",
							label: "Kiswahili"
						}
					],
					onChange: (val) => onSave({ language: val })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsSelect, {
					label: "Country / Region",
					hint: "Localizes trending topics, verified creator highlights, and currency.",
					value: settings?.region || "RW",
					options: [
						{
							value: "RW",
							label: "Rwanda"
						},
						{
							value: "KE",
							label: "Kenya"
						},
						{
							value: "UG",
							label: "Uganda"
						},
						{
							value: "TZ",
							label: "Tanzania"
						},
						{
							value: "CD",
							label: "DR Congo"
						},
						{
							value: "GLOBAL",
							label: "International / Global"
						}
					],
					onChange: (val) => onSave({ region: val })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsSelect, {
					label: "Timezone",
					hint: "Used for scheduling posts and calculating quiet hours.",
					value: settings?.timezone || "Africa/Kigali",
					options: [
						{
							value: "Africa/Kigali",
							label: "Kigali (CAT, GMT+2)"
						},
						{
							value: "Africa/Nairobi",
							label: "Nairobi (EAT, GMT+3)"
						},
						{
							value: "UTC",
							label: "Coordinated Universal Time (UTC)"
						}
					],
					onChange: (val) => onSave({ timezone: val })
				})
			]
		})
	});
}
function StorageSection({ settings, onSave }) {
	const [isClearingCache, setIsClearingCache] = (0, import_react.useState)(false);
	const requestDataMutation = useRequestAccountData();
	const handleClearCache = () => {
		setIsClearingCache(true);
		setTimeout(() => {
			onSave({ cacheClearedAt: (/* @__PURE__ */ new Date()).toISOString() });
			setIsClearingCache(false);
			toast.success("Cache cleared successfully (57.0 MB freed)");
		}, 600);
	};
	const handleDownloadData = async () => {
		try {
			const res = await requestDataMutation.mutateAsync();
			const blob = new Blob([JSON.stringify(res.exportData, null, 2)], { type: "application/json" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `gihanga-account-archive-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json`;
			a.click();
			URL.revokeObjectURL(url);
			toast.success("Account data archive downloaded");
		} catch {
			toast.error("Failed to generate account archive");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SettingsSection, {
			title: "Local Storage & Temporary Files",
			description: "Manage cached media, previews, and offline assets on this browser.",
			icon: Database,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4 rounded-2xl bg-elevated border border-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-bold text-muted-foreground block",
						children: "Cached Media"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-lg font-black text-foreground mt-1 block",
						children: "42.8 MB"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4 rounded-2xl bg-elevated border border-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-bold text-muted-foreground block",
						children: "App Assets"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-lg font-black text-foreground mt-1 block",
						children: "14.2 MB"
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsRow, {
				label: "Clear Local Cache",
				hint: "Clearing cache frees disk space without deleting any of your posts, messages, or account data.",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					onClick: handleClearCache,
					disabled: isClearingCache,
					className: "rounded-xl text-xs font-bold",
					children: isClearingCache ? "Clearing..." : "Clear Cache"
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsSection, {
			title: "Download Your Data Archive",
			description: "Request a machine-readable JSON copy of your profile, posts, settings, and interactions.",
			icon: Download,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsRow, {
				label: "Export Account Data",
				hint: "Generates a secure archive containing all data associated with your Gihanga Updates identity.",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: handleDownloadData,
					disabled: requestDataMutation.isPending,
					className: "rounded-xl text-xs font-bold gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3.5" }), requestDataMutation.isPending ? "Generating..." : "Download JSON Archive"]
				})
			})
		})]
	});
}
function ConnectedAppsSection() {
	const [apps, setApps] = (0, import_react.useState)([{
		id: "app-1",
		name: "Gihanga Creator Studio Desktop",
		permissions: "Stream keys, Live analytics, Story management",
		lastUsed: "2 hours ago"
	}, {
		id: "app-2",
		name: "Kigali Soundcloud Connector",
		permissions: "Audio snippet imports",
		lastUsed: "Yesterday"
	}]);
	const handleDisconnect = (id, name) => {
		setApps((prev) => prev.filter((a) => a.id !== id));
		toast.success(`Disconnected from ${name}`);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsSection, {
			title: "Authorized Applications",
			description: "Third-party applications and desktop tools with access to your Gihanga Updates account.",
			icon: Link$1,
			children: apps.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "py-8 text-center text-xs text-muted-foreground",
				children: "No third-party apps are currently connected to your account."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: apps.map((app) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between p-4 rounded-2xl bg-elevated border border-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							className: "text-xs font-extrabold text-foreground",
							children: app.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-[11px] text-muted-foreground mt-0.5",
							children: ["Permissions: ", app.permissions]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-[10px] text-muted-foreground/80 mt-1",
							children: ["Last active: ", app.lastUsed]
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => handleDisconnect(app.id, app.name),
						className: "rounded-xl text-xs font-bold text-danger hover:bg-danger/10 hover:text-danger",
						children: "Disconnect"
					})]
				}, app.id))
			})
		})
	});
}
function BlockedAccountsSection() {
	const { data: blockedUsernames, isLoading } = useBlockedUsers();
	const toggleBlock = useToggleBlockUser();
	const [filterQuery, setFilterQuery] = (0, import_react.useState)("");
	const filtered = (0, import_react.useMemo)(() => {
		if (!blockedUsernames) return [];
		if (!filterQuery.trim()) return blockedUsernames;
		return blockedUsernames.filter((u) => u.toLowerCase().includes(filterQuery.toLowerCase()));
	}, [blockedUsernames, filterQuery]);
	const handleUnblock = async (username) => {
		try {
			await toggleBlock.mutateAsync(username);
			toast.success(`Unblocked @${username}`);
		} catch {
			toast.error("Failed to unblock user");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SettingsSection, {
			title: "Blocked Accounts",
			description: "Blocked accounts cannot see your posts, send messages, or discover your profile.",
			icon: Ban,
			children: [blockedUsernames && blockedUsernames.length > 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				placeholder: "Search blocked users...",
				value: filterQuery,
				onChange: (e) => setFilterQuery(e.target.value),
				className: "h-10 rounded-xl text-xs mb-3"
			}), isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "py-8 text-center text-xs text-muted-foreground",
				children: "Loading blocked list..."
			}) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "py-8 text-center text-xs text-muted-foreground",
				children: filterQuery ? "No matching blocked users." : "You have not blocked any users."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-2",
				children: filtered.map((username) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between p-3 rounded-2xl bg-elevated border border-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GAvatar, {
							user: {
								id: username,
								name: username,
								username,
								avatarHue: 205,
								avatarUrl: null,
								creator: false,
								verified: false,
								live: false,
								followers: 0,
								following: 0,
								posts: 0
							},
							size: "sm",
							className: "size-8 aspect-square"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs font-bold text-foreground",
							children: ["@", username]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => handleUnblock(username),
						className: "rounded-xl text-xs font-bold",
						children: "Unblock"
					})]
				}, username))
			})]
		})
	});
}
function HelpSupportSection() {
	const [problemDescription, setProblemDescription] = (0, import_react.useState)("");
	const [isSubmitting, setIsSubmitting] = (0, import_react.useState)(false);
	const handleSubmitProblem = (e) => {
		e.preventDefault();
		if (!problemDescription.trim()) return;
		setIsSubmitting(true);
		setTimeout(() => {
			setIsSubmitting(false);
			setProblemDescription("");
			toast.success("Problem report sent to Gihanga Support team. Ticket #4921 opened.");
		}, 700);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsSection, {
			title: "Help Center & Community Guidelines",
			description: "Learn how to make the most of Gihanga Updates and maintain a positive community.",
			icon: CircleQuestionMark,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: "mailto:support@gihanga.rw",
					className: "p-4 rounded-2xl bg-elevated border border-border hover:border-primary/50 transition-all flex items-center justify-between group",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
						className: "text-xs font-extrabold text-foreground group-hover:text-primary",
						children: "Contact Support"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] text-muted-foreground mt-0.5",
						children: "support@gihanga.rw"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-4 text-muted-foreground group-hover:text-primary" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4 rounded-2xl bg-elevated border border-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
						className: "text-xs font-extrabold text-foreground",
						children: "Community Guidelines"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] text-muted-foreground mt-0.5",
						children: "Read our safety standards and content policy"
					})]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsSection, {
			title: "Report a Problem",
			description: "Encountering a bug, video loading issue, or payment concern? Let our engineering team know.",
			icon: TriangleAlert,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: handleSubmitProblem,
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					value: problemDescription,
					onChange: (e) => setProblemDescription(e.target.value),
					rows: 3,
					required: true,
					placeholder: "Briefly explain what went wrong...",
					className: "w-full rounded-xl bg-elevated border border-border p-3 text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-primary"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-end",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						size: "sm",
						disabled: isSubmitting,
						className: "rounded-xl font-bold text-xs",
						children: isSubmitting ? "Submitting..." : "Send Problem Report"
					})
				})]
			})
		})]
	});
}
function AboutSection() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsSection, {
			title: "About Gihanga Updates",
			description: "The next-generation pan-African digital creator & social networking platform.",
			icon: Info,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3 text-xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between py-2 border-b border-border/40",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: "Version"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono font-bold text-foreground",
							children: "v2.4.0 (Build 2026.09)"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between py-2 border-b border-border/40",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: "Engineering"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-bold text-foreground",
							children: "Gihanga Tech Lab • Kigali, Rwanda"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between py-2 border-b border-border/40",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: "Terms of Service"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-bold text-primary cursor-pointer hover:underline",
							children: "Read Terms"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: "Privacy Policy"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-bold text-primary cursor-pointer hover:underline",
							children: "Read Privacy Policy"
						})]
					})
				]
			})
		})
	});
}
function AccountManagementSection() {
	const navigate = useNavigate();
	const { signOutConsumer } = useAuth();
	const [showDeactivateModal, setShowDeactivateModal] = (0, import_react.useState)(false);
	const [showDeleteModal, setShowDeleteModal] = (0, import_react.useState)(false);
	const [deletePassword, setDeletePassword] = (0, import_react.useState)("");
	const [isDeleting, setIsDeleting] = (0, import_react.useState)(false);
	const deactivateMutation = useDeactivateAccount();
	const deleteMutation = useDeleteAccount();
	const handleDeactivate = async () => {
		try {
			await deactivateMutation.mutateAsync({});
			toast.success("Account temporarily deactivated");
			signOutConsumer();
			navigate({ to: "/login" });
		} catch {
			toast.error("Failed to deactivate account");
		}
	};
	const handleDeletePermanent = async (e) => {
		e.preventDefault();
		if (!deletePassword) {
			toast.error("Please enter your current password to confirm");
			return;
		}
		setIsDeleting(true);
		try {
			await deleteMutation.mutateAsync({ password: deletePassword });
			toast.success("Your Gihanga account has been permanently deleted");
			signOutConsumer();
			navigate({ to: "/register" });
		} catch (err) {
			toast.error(err?.response?.data?.message || "Incorrect password. Could not delete account.");
		} finally {
			setIsDeleting(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsSection, {
				title: "Session Termination",
				description: "Sign out from your active device or close all ongoing sessions.",
				icon: LogOut,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsRow, {
					label: "Sign Out of Current Session",
					hint: "You can log back in at any time with your credentials.",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => signOutConsumer(),
						className: "rounded-xl text-xs font-bold",
						children: "Sign Out"
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SettingsSection, {
				title: "Danger Zone: Account Closure",
				description: "Temporary deactivation or permanent deletion of your profile and data.",
				icon: Trash2,
				danger: true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsRow, {
					label: "Temporarily Deactivate Account",
					hint: "Hide your profile, posts, and comments until you log back in.",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => setShowDeactivateModal(true),
						className: "rounded-xl text-xs font-bold border-amber-500/30 text-amber-500 hover:bg-amber-500/10",
						children: "Deactivate"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsRow, {
					label: "Permanently Delete Account",
					hint: "Irreversible action: Deletes all posts, stories, reels, points, and chat records permanently.",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: () => setShowDeleteModal(true),
						className: "rounded-xl text-xs font-bold bg-danger hover:bg-danger/90 text-white",
						children: "Delete Account"
					})
				})]
			}),
			showDeactivateModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 bg-black/60 backdrop-blur-xs grid place-items-center p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-md surface-card rounded-3xl p-6 border border-border shadow-2xl space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-base font-extrabold text-foreground",
							children: "Deactivate Account?"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground leading-relaxed",
							children: "Your profile, posts, and followers will be temporarily hidden. You can reactivate your account at any time simply by logging back in."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "pt-2 flex justify-end gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => setShowDeactivateModal(false),
								className: "rounded-xl text-xs font-bold",
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								onClick: handleDeactivate,
								disabled: deactivateMutation.isPending,
								className: "rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white",
								children: deactivateMutation.isPending ? "Deactivating..." : "Confirm Deactivation"
							})]
						})
					]
				})
			}),
			showDeleteModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 bg-black/60 backdrop-blur-xs grid place-items-center p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-md surface-card rounded-3xl p-6 border border-danger/40 shadow-2xl space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-danger",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display text-base font-extrabold",
								children: "Permanent Account Deletion"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground leading-relaxed",
							children: [
								"This action ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									className: "text-danger",
									children: "CANNOT"
								}),
								" be undone. All your posts, followers, points balance, and messaging history will be erased from Gihanga Updates."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: handleDeletePermanent,
							className: "space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs font-bold",
									children: "Confirm Your Password"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "password",
									required: true,
									placeholder: "Enter current password...",
									value: deletePassword,
									onChange: (e) => setDeletePassword(e.target.value),
									className: "h-10 rounded-xl"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "pt-2 flex justify-end gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "outline",
									size: "sm",
									onClick: () => setShowDeleteModal(false),
									className: "rounded-xl text-xs font-bold",
									children: "Cancel"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									size: "sm",
									disabled: isDeleting,
									className: "rounded-xl text-xs font-bold bg-danger hover:bg-danger/90 text-white",
									children: isDeleting ? "Deleting..." : "Permanently Delete"
								})]
							})]
						})
					]
				})
			})
		]
	});
}
var $$splitComponentImporter$24 = () => import("./studio-CtuDXXV6.mjs");
var Route$24 = createFileRoute("/studio")({
	head: () => ({ meta: [
		{ title: "Creator Studio — Gihanga Updates" },
		{
			name: "description",
			content: "Track views, followers and earnings, manage scheduled posts and drafts, and understand your audience in Gihanga Creator Studio."
		},
		{
			property: "og:title",
			content: "Creator Studio — Gihanga Updates"
		},
		{
			property: "og:description",
			content: "Analytics, content management and audience insights for Gihanga creators."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$24, "component")
});
var $$splitComponentImporter$23 = () => import("./styleguide-CHO4DVyL.mjs");
var Route$23 = createFileRoute("/styleguide")({
	head: () => ({ meta: [
		{ title: "Design System — Gihanga Updates" },
		{
			name: "description",
			content: "The Gihanga Updates design system: Ocean Deep color tokens, Sora and Manrope typography, buttons, avatars, badges and loading states."
		},
		{
			property: "og:title",
			content: "Design System — Gihanga Updates"
		},
		{
			property: "og:description",
			content: "Ocean Deep color tokens, typography scale, and the reusable component library behind Gihanga Updates."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$23, "component")
});
var $$splitComponentImporter$22 = () => import("./verify-cMUWAKSM.mjs");
var Route$22 = createFileRoute("/verify")({
	head: () => ({ meta: [
		{ title: "Verify your email — Gihanga Updates" },
		{
			name: "description",
			content: "Enter the 6-digit code we sent to your email to confirm your Gihanga Updates account."
		},
		{
			property: "og:title",
			content: "Verify your email — Gihanga Updates"
		},
		{
			property: "og:description",
			content: "Confirm your email with a 6-digit code to finish setting up your account."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$22, "component")
});
var $$splitComponentImporter$21 = () => import("./wallet-cld_HYOR.mjs");
var Route$21 = createFileRoute("/wallet")({
	head: () => ({ meta: [
		{ title: "Wallet — Gihanga Updates" },
		{
			name: "description",
			content: "See your available balance, deposit or withdraw via MTN Mobile Money, and review every transaction."
		},
		{
			property: "og:title",
			content: "Wallet — Gihanga Updates"
		},
		{
			property: "og:description",
			content: "Balances, MoMo deposits/withdrawals, and transaction history."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$21, "component")
});
var $$splitComponentImporter$20 = () => import("./welcome-krFMrcG2.mjs");
var Route$20 = createFileRoute("/welcome")({
	head: () => ({ meta: [
		{ title: "Welcome to Gihanga Updates — Join the Creators" },
		{
			name: "description",
			content: "Create your Gihanga Updates account to follow creators, share stories and reels, and join the conversation across Rwanda."
		},
		{
			property: "og:title",
			content: "Welcome to Gihanga Updates — Join the Creators"
		},
		{
			property: "og:description",
			content: "Create your account and join thousands of creators on Gihanga Updates."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$20, "component")
});
var $$splitComponentImporter$19 = () => import("./live._streamId-CwSRZgp6.mjs");
var Route$19 = createFileRoute("/live/$streamId")({
	head: () => ({ meta: [{ title: "Live — Gihanga Updates" }, {
		name: "description",
		content: "Watch a live stream on Gihanga Updates."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$19, "component")
});
/**
* A2 — one tile component used for EVERY role's grid. `selfView` renders the
* local camera (host/co-host); remote tiles render subscribed MediaStreams.
* Audio for remote tiles follows the viewer's single sound toggle.
*/
var $$splitComponentImporter$18 = () => import("./post._postId-4v008O5F.mjs");
var Route$18 = createFileRoute("/post/$postId")({
	head: () => ({ meta: [{ title: "Post — Gihanga Updates" }, {
		name: "description",
		content: "View post and comments on Gihanga Updates."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$18, "component")
});
var $$splitComponentImporter$17 = () => import("./profile._username-BmDqm2se.mjs");
var Route$17 = createFileRoute("/profile/$username")({
	head: () => ({ meta: [{ title: "Profile — Gihanga Updates" }, {
		name: "description",
		content: "View this creator's posts, reels and activity on Gihanga Updates."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$17, "component")
});
var $$splitComponentImporter$16 = () => import("./system.index-BBaMh5QQ.mjs");
var Route$16 = createFileRoute("/system/")({
	head: () => ({ meta: [{ title: "Staff Console — Gihanga Updates" }, {
		name: "robots",
		content: "noindex"
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$16, "component")
});
var $$splitComponentImporter$15 = () => import("./system.dashboard-CFUl01eQ.mjs");
var Route$15 = createFileRoute("/system/dashboard")({ component: lazyRouteComponent($$splitComponentImporter$15, "component") });
var $$splitComponentImporter$14 = () => import("./tag._tag-C8jUSUh4.mjs");
var Route$14 = createFileRoute("/tag/$tag")({
	loader: ({ params }) => ({ tag: params.tag }),
	head: ({ loaderData }) => {
		const tag = loaderData?.tag ?? "explore";
		const title = `#${tag} — Gihanga Updates`;
		const description = `Top posts, reels and creators using #${tag} on Gihanga Updates.`;
		return { meta: [
			{ title },
			{
				name: "description",
				content: description
			},
			{
				property: "og:title",
				content: title
			},
			{
				property: "og:description",
				content: description
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary"
			}
		] };
	},
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
var $$splitComponentImporter$13 = () => import("./system.dashboard.index-agUof1gZ.mjs");
var Route$13 = createFileRoute("/system/dashboard/")({ component: lazyRouteComponent($$splitComponentImporter$13, "component") });
var $$splitComponentImporter$12 = () => import("./system.dashboard.accounts-A4AGwjPg.mjs");
var Route$12 = createFileRoute("/system/dashboard/accounts")({ component: lazyRouteComponent($$splitComponentImporter$12, "component") });
var $$splitComponentImporter$11 = () => import("./system.dashboard.achievements-B6-kHTzY.mjs");
var Route$11 = createFileRoute("/system/dashboard/achievements")({ component: lazyRouteComponent($$splitComponentImporter$11, "component") });
var $$splitComponentImporter$10 = () => import("./system.dashboard.activity-Dabzamzj.mjs");
var Route$10 = createFileRoute("/system/dashboard/activity")({ component: lazyRouteComponent($$splitComponentImporter$10, "component") });
var $$splitComponentImporter$9 = () => import("./system.dashboard.ad-settings-CKhknSSy.mjs");
var Route$9 = createFileRoute("/system/dashboard/ad-settings")({ component: lazyRouteComponent($$splitComponentImporter$9, "component") });
var $$splitComponentImporter$8 = () => import("./system.dashboard.audit-DU3jYgp-.mjs");
var Route$8 = createFileRoute("/system/dashboard/audit")({ component: lazyRouteComponent($$splitComponentImporter$8, "component") });
var $$splitComponentImporter$7 = () => import("./system.dashboard.campaigns-DL6uXzsw.mjs");
var Route$7 = createFileRoute("/system/dashboard/campaigns")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
var $$splitComponentImporter$6 = () => import("./system.dashboard.growth-BM8zMana.mjs");
var Route$6 = createFileRoute("/system/dashboard/growth")({ component: lazyRouteComponent($$splitComponentImporter$6, "component") });
var $$splitComponentImporter$5 = () => import("./system.dashboard.live-CMmMGGwu.mjs");
var Route$5 = createFileRoute("/system/dashboard/live")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import("./system.dashboard.moderation-4jbVIEQy.mjs");
var Route$4 = createFileRoute("/system/dashboard/moderation")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./system.dashboard.payments-BUwez8jA.mjs");
var Route$3 = createFileRoute("/system/dashboard/payments")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./system.dashboard.rewards-BngGBJ3F.mjs");
var Route$2 = createFileRoute("/system/dashboard/rewards")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./system.dashboard.settings-PJ3Rv-Ap.mjs");
var Route$1 = createFileRoute("/system/dashboard/settings")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./system.dashboard.staff-DQyEPc0_.mjs");
var Route = createFileRoute("/system/dashboard/staff")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var IndexRoute = Route$39.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$40
});
var SplatRoute = Route$38.update({
	id: "/$",
	path: "/$",
	getParentRoute: () => Route$40
});
var AdsRoute = Route$37.update({
	id: "/ads",
	path: "/ads",
	getParentRoute: () => Route$40
});
var BookmarksRoute = Route$36.update({
	id: "/bookmarks",
	path: "/bookmarks",
	getParentRoute: () => Route$40
});
var ExploreRoute = Route$35.update({
	id: "/explore",
	path: "/explore",
	getParentRoute: () => Route$40
});
var ForgotPasswordRoute = Route$34.update({
	id: "/forgot-password",
	path: "/forgot-password",
	getParentRoute: () => Route$40
});
var InterestsRoute = Route$33.update({
	id: "/interests",
	path: "/interests",
	getParentRoute: () => Route$40
});
var LandingRoute = Route$32.update({
	id: "/landing",
	path: "/landing",
	getParentRoute: () => Route$40
});
var LiveRoute = Route$31.update({
	id: "/live",
	path: "/live",
	getParentRoute: () => Route$40
});
var LoginRoute = Route$30.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => Route$40
});
var NotificationsRoute = Route$29.update({
	id: "/notifications",
	path: "/notifications",
	getParentRoute: () => Route$40
});
var ReelsRoute = Route$28.update({
	id: "/reels",
	path: "/reels",
	getParentRoute: () => Route$40
});
var RegisterRoute = Route$27.update({
	id: "/register",
	path: "/register",
	getParentRoute: () => Route$40
});
var ResetPasswordRoute = Route$26.update({
	id: "/reset-password",
	path: "/reset-password",
	getParentRoute: () => Route$40
});
var SettingsRoute = Route$25.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => Route$40
});
var StudioRoute = Route$24.update({
	id: "/studio",
	path: "/studio",
	getParentRoute: () => Route$40
});
var StyleguideRoute = Route$23.update({
	id: "/styleguide",
	path: "/styleguide",
	getParentRoute: () => Route$40
});
var VerifyRoute = Route$22.update({
	id: "/verify",
	path: "/verify",
	getParentRoute: () => Route$40
});
var WalletRoute = Route$21.update({
	id: "/wallet",
	path: "/wallet",
	getParentRoute: () => Route$40
});
var WelcomeRoute = Route$20.update({
	id: "/welcome",
	path: "/welcome",
	getParentRoute: () => Route$40
});
var LiveStreamIdRoute = Route$19.update({
	id: "/$streamId",
	path: "/$streamId",
	getParentRoute: () => LiveRoute
});
var PostPostIdRoute = Route$18.update({
	id: "/post/$postId",
	path: "/post/$postId",
	getParentRoute: () => Route$40
});
var ProfileUsernameRoute = Route$17.update({
	id: "/profile/$username",
	path: "/profile/$username",
	getParentRoute: () => Route$40
});
var SystemIndexRoute = Route$16.update({
	id: "/system/",
	path: "/system/",
	getParentRoute: () => Route$40
});
var SystemDashboardRoute = Route$15.update({
	id: "/system/dashboard",
	path: "/system/dashboard",
	getParentRoute: () => Route$40
});
var TagTagRoute = Route$14.update({
	id: "/tag/$tag",
	path: "/tag/$tag",
	getParentRoute: () => Route$40
});
var SystemDashboardIndexRoute = Route$13.update({
	id: "/",
	path: "/",
	getParentRoute: () => SystemDashboardRoute
});
var SystemDashboardAccountsRoute = Route$12.update({
	id: "/accounts",
	path: "/accounts",
	getParentRoute: () => SystemDashboardRoute
});
var SystemDashboardAchievementsRoute = Route$11.update({
	id: "/achievements",
	path: "/achievements",
	getParentRoute: () => SystemDashboardRoute
});
var SystemDashboardActivityRoute = Route$10.update({
	id: "/activity",
	path: "/activity",
	getParentRoute: () => SystemDashboardRoute
});
var SystemDashboardAdSettingsRoute = Route$9.update({
	id: "/ad-settings",
	path: "/ad-settings",
	getParentRoute: () => SystemDashboardRoute
});
var SystemDashboardAuditRoute = Route$8.update({
	id: "/audit",
	path: "/audit",
	getParentRoute: () => SystemDashboardRoute
});
var SystemDashboardCampaignsRoute = Route$7.update({
	id: "/campaigns",
	path: "/campaigns",
	getParentRoute: () => SystemDashboardRoute
});
var SystemDashboardGrowthRoute = Route$6.update({
	id: "/growth",
	path: "/growth",
	getParentRoute: () => SystemDashboardRoute
});
var SystemDashboardLiveRoute = Route$5.update({
	id: "/live",
	path: "/live",
	getParentRoute: () => SystemDashboardRoute
});
var SystemDashboardModerationRoute = Route$4.update({
	id: "/moderation",
	path: "/moderation",
	getParentRoute: () => SystemDashboardRoute
});
var SystemDashboardPaymentsRoute = Route$3.update({
	id: "/payments",
	path: "/payments",
	getParentRoute: () => SystemDashboardRoute
});
var SystemDashboardRewardsRoute = Route$2.update({
	id: "/rewards",
	path: "/rewards",
	getParentRoute: () => SystemDashboardRoute
});
var SystemDashboardSettingsRoute = Route$1.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => SystemDashboardRoute
});
var SystemDashboardStaffRoute = Route.update({
	id: "/staff",
	path: "/staff",
	getParentRoute: () => SystemDashboardRoute
});
var LiveRouteChildren = { LiveStreamIdRoute };
var LiveRouteWithChildren = LiveRoute._addFileChildren(LiveRouteChildren);
var SystemDashboardRouteChildren = {
	SystemDashboardAccountsRoute,
	SystemDashboardAchievementsRoute,
	SystemDashboardActivityRoute,
	SystemDashboardAdSettingsRoute,
	SystemDashboardAuditRoute,
	SystemDashboardCampaignsRoute,
	SystemDashboardGrowthRoute,
	SystemDashboardLiveRoute,
	SystemDashboardModerationRoute,
	SystemDashboardPaymentsRoute,
	SystemDashboardRewardsRoute,
	SystemDashboardSettingsRoute,
	SystemDashboardStaffRoute,
	SystemDashboardIndexRoute
};
var rootRouteChildren = {
	IndexRoute,
	SplatRoute,
	AdsRoute,
	BookmarksRoute,
	ExploreRoute,
	ForgotPasswordRoute,
	InterestsRoute,
	LandingRoute,
	LiveRoute: LiveRouteWithChildren,
	LoginRoute,
	NotificationsRoute,
	ReelsRoute,
	RegisterRoute,
	ResetPasswordRoute,
	SettingsRoute,
	StudioRoute,
	StyleguideRoute,
	VerifyRoute,
	WalletRoute,
	WelcomeRoute,
	PostPostIdRoute,
	ProfileUsernameRoute,
	SystemDashboardRoute: SystemDashboardRoute._addFileChildren(SystemDashboardRouteChildren),
	TagTagRoute,
	SystemIndexRoute
};
var routeTree = Route$40._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { useLikedPosts as $, liveCaptureConstraints as A, useUserPosts as At, useCreateComment as B, Route$19 as C, useTagPosts as Ct, UserName as D, useToggleLike as Dt, Textarea as E, useToggleCommentLike as Et, timeAgo as F, DialogTitle as Ft, useFeed as G, useDeleteStory as H, useAddModerator as I, useFollowing as J, useFollowUser as K, useBanViewer as L, livePreviewConstraints as M, Dialog as Mt, openCreate as N, DialogContent as Nt, VerifiedBadge as O, useTrendingTags as Ot, router_BS6G260b_exports as P, DialogHeader as Pt, useIsMobile as Q, useBookmarkedPosts as R, Route$18 as S, useStories as St, Switch as T, useToggleBookmark as Tt, useEndLive as U, useDeletePost as V, useExplore as W, useForceEndLive as X, useFollowingSet as Y, useInviteFollowers as Z, LandingPage as _, useSendGift as _t, DrawerDescription as a, useLiveStream as at, Route$14 as b, useStaffLiveStreams as bt, DropdownMenu as c, useMarkNotificationRead as ct, DropdownMenuSeparator as d, useMyWallet as dt, useLiveAlerts as et, DropdownMenuTrigger as f, useNotifications as ft, LIVE_VIDEO_QUALITY as g, useSaveLiveKeywords as gt, Input as h, useReportLive as ht, DrawerContent as i, useLiveKeywords as it, liveIceServers as j, useUserProfile as jt, formatCount as k, useUpdateLiveSettings as kt, DropdownMenuContent as l, useMarkStoryViewed as lt, GIFT_CATALOG as m, useReplyToStory as mt, Badge as n, useLiveEarnings as nt, DrawerHeader as o, useLiveStreams as ot, GAvatar as p, useReelsFeed as pt, useFollowers as q, Drawer$1 as r, useLiveHeartbeat as rt, DrawerTitle as s, useMarkAllNotificationsRead as st, AppShell as t, useLiveChatHistory as tt, DropdownMenuItem as u, useMuteViewer as ut, MESH_VIDEO_SEND_PARAMS as v, useSessionUser as vt, Route$26 as w, useTheme as wt, Route$17 as x, useStartLive as xt, QUALITY_THRESHOLDS as y, useSinglePost as yt, useComments as z };
