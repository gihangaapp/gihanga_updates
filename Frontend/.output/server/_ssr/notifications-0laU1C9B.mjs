import { o as __toESM } from "../_runtime.mjs";
import { r as cn, t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { Bn as AtSign, I as Sparkles, In as Bell, Jt as Gift, St as MessageSquare, Ut as Heart, _ as UserPlus, at as Radio, cn as DollarSign, zn as Award } from "../_libs/lucide-react.mjs";
import { s as mediaUrl } from "./api-client-C-02deeD.mjs";
import { B as useMarkAllNotificationsRead, D as timeAgo, F as useFollowUser, R as useFollowingSet, U as useNotifications, V as useMarkNotificationRead, p as GAvatar, t as AppShell } from "./router-Dh25U3j0.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/notifications-0laU1C9B.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var iconFor = {
	like: {
		icon: Heart,
		tone: "bg-danger/12 text-danger"
	},
	comment: {
		icon: MessageSquare,
		tone: "bg-info/12 text-info"
	},
	follow: {
		icon: UserPlus,
		tone: "bg-success/12 text-success"
	},
	mention: {
		icon: AtSign,
		tone: "bg-accent/15 text-accent"
	},
	live: {
		icon: Radio,
		tone: "bg-danger/12 text-danger"
	},
	system: {
		icon: Sparkles,
		tone: "bg-primary-soft text-primary"
	},
	payment: {
		icon: DollarSign,
		tone: "bg-success/12 text-success"
	},
	reward: {
		icon: Gift,
		tone: "bg-accent/15 text-accent"
	},
	achievement: {
		icon: Award,
		tone: "primary"
	}
};
var tabs = [
	{
		id: "all",
		label: "All"
	},
	{
		id: "mentions",
		label: "Mentions"
	},
	{
		id: "follows",
		label: "Follows"
	}
];
function toDisplayUser(actor) {
	return {
		id: actor._id,
		name: actor.name,
		username: actor.username,
		bio: "",
		avatarHue: actor.avatarHue,
		avatarUrl: actor.avatarUrl,
		verified: actor.verified,
		creator: actor.isCreator,
		followers: 0,
		following: 0,
		posts: 0
	};
}
function NotificationsPage() {
	const [tab, setTab] = (0, import_react.useState)("all");
	const { data, isLoading } = useNotifications();
	const markAllRead = useMarkAllNotificationsRead();
	const markRead = useMarkNotificationRead();
	const followUser = useFollowUser();
	const { data: followingSet } = useFollowingSet();
	const list = (data?.notifications ?? []).filter((n) => tab === "mentions" ? n.kind === "mention" || n.kind === "comment" : tab === "follows" ? n.kind === "follow" : true);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-[640px]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl font-extrabold tracking-tight",
					children: "Notifications"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "sm",
					className: "ml-auto",
					onClick: () => {
						markAllRead.mutate();
						toast.success("All caught up");
					},
					children: "Mark all read"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "glass mb-4 flex gap-1 rounded-2xl border p-1",
				children: tabs.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setTab(t.id),
					className: cn("press flex-1 rounded-xl px-3 py-2 text-sm font-semibold", t.id === tab ? "bg-primary-soft text-primary" : "text-muted-foreground"),
					children: t.label
				}, t.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "surface-card divide-y divide-border overflow-hidden p-0",
				children: [
					isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "p-10 text-center text-sm text-muted-foreground",
						children: "Loading…"
					}),
					list.map((n) => {
						const meta = iconFor[n.kind];
						const postImage = n.relatedPost ? mediaUrl(n.relatedPost.thumbnailUrl || n.relatedPost.mediaUrl) : null;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							role: "button",
							tabIndex: 0,
							onClick: () => !n.read && markRead.mutate(n._id),
							className: cn("flex cursor-pointer items-start gap-3 p-4 transition-colors hover:bg-muted", !n.read && "bg-primary-soft/40"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("grid size-9 shrink-0 place-items-center rounded-full", meta.tone),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(meta.icon, { className: "size-4.5" })
								}),
								n.actor ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/profile/$username",
									params: { username: n.actor.username },
									className: "shrink-0",
									onClick: (e) => e.stopPropagation(),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GAvatar, {
										user: toDisplayUser(n.actor),
										size: "sm"
									})
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "min-w-0 flex-1 text-sm leading-snug",
									children: [
										n.actor && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-semibold",
											children: [n.actor.name, " "]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: n.actor ? "text-muted-foreground" : "",
											children: n.text
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "mt-0.5 block text-xs text-muted-foreground",
											children: [timeAgo(n.createdAt), " ago"]
										})
									]
								}),
								postImage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: postImage,
									alt: "",
									loading: "lazy",
									className: "size-12 shrink-0 rounded-lg object-cover"
								}) : n.kind === "follow" && n.actor ? followingSet?.has(n.actor.username) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "soft",
									disabled: true,
									children: "Following"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "brand",
									onClick: (e) => {
										e.stopPropagation();
										followUser.mutate({
											username: n.actor.username,
											follow: true
										});
										toast.success("Following");
									},
									children: "Follow back"
								}) : null
							]
						}) }, n._id);
					}),
					!isLoading && !list.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex flex-col items-center gap-2 p-10 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-8 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Nothing here yet."
						})]
					})
				]
			})
		]
	}) });
}
//#endregion
export { NotificationsPage as component };
