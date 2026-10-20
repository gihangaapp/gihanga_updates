import { o as __toESM } from "../_runtime.mjs";
import { r as cn, t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { E as Trash2, I as Sparkles, Kt as Grid3x3, Mn as CalendarDays, Qt as Film, Tt as MessageCircle, Ut as Heart, Y as Settings, an as EllipsisVertical, jt as Lock, st as Play, xn as CircleCheck } from "../_libs/lucide-react.mjs";
import { n as api, s as mediaUrl } from "./api-client-C-02deeD.mjs";
import { Bt as DialogContent, C as VerifiedBadge, F as useFollowUser, I as useFollowers, L as useFollowing, R as useFollowingSet, S as UserName, Ut as DialogHeader, Wt as DialogTitle, c as DropdownMenu, f as DropdownMenuTrigger, it as useUserProfile, j as useDeletePost, l as DropdownMenuContent, p as GAvatar, rt as useUserPosts, t as AppShell, u as DropdownMenuItem, v as Route$17, w as formatCount, z as useLikedPosts, zt as Dialog } from "./router-Dh25U3j0.mjs";
import { l as useAuth } from "./auth-context-Duh7Mq6E.mjs";
import { r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Progress } from "./progress-BaJBfUMd.mjs";
import { i as Trigger, n as Portal, r as Root2, t as Content2 } from "../_libs/radix-ui__react-popover.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profile._username-dvXzN8bj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Achievement Badge System — SVG icon set.
*
* Each badge renders as EITHER a filled (earned) or outlined (locked) icon,
* in its configured milestone color. Colors map to the app's existing theme
* tokens (danger / warning / info / success) so they automatically adapt to
* the light and dark themes — no hardcoded hex.
*
* Outlined icons use the SAME shape and dimensions as filled ones, just with
* a transparent interior and a colored stroke, so the locked/unlocked states
* are visually distinct but dimensionally consistent (per the wireframe and
* the accessibility spec — never use color alone to signal "earned").
*/
/** Resolves a milestone color to the app's theme token + a readable label. */
function resolveBadgeColor(color) {
	switch (color) {
		case "red": return {
			value: "var(--danger)",
			label: "red"
		};
		case "gold": return {
			value: "var(--warning)",
			label: "gold"
		};
		case "blue": return {
			value: "var(--info)",
			label: "blue"
		};
		case "green": return {
			value: "var(--success)",
			label: "green"
		};
	}
}
function BadgeIconSvg({ icon, color, filled, size = 36, className }) {
	const { value, label } = resolveBadgeColor(color);
	const stroke = value;
	const fill = filled ? value : "transparent";
	const strokeWidth = filled ? 0 : 2;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		width: size,
		height: size,
		viewBox: "0 0 48 48",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg",
		className: cn(className),
		role: "img",
		"aria-label": `${label} ${icon}${filled ? " — earned" : " — locked"}`,
		children: icon === "star" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M24 3.5l5.62 12.49 13.7 1.42-10.2 9.2 2.87 13.48L24 33.9l-11.99 6.19 2.87-13.48-10.2-9.2 13.7-1.42L24 3.5z",
			fill,
			stroke,
			strokeWidth,
			strokeLinejoin: "round"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M24 3.5L44.5 18 24 44.5 3.5 18 24 3.5z",
			fill,
			stroke,
			strokeWidth,
			strokeLinejoin: "round"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M3.5 18h41M24 3.5L13.5 18 24 44.5M24 3.5L34.5 18 24 44.5",
			stroke,
			strokeWidth: filled ? 1 : 1.2,
			strokeLinejoin: "round",
			opacity: filled ? .35 : .5
		})] })
	});
}
/**
* Achievement Badge detail panel — shown in a Radix Popover when a badge is
* tapped. Different content for locked vs. unlocked badges:
*
*   Locked  → name, requirement, current progress, remaining, progress bar,
*             motivational message.
*   Unlocked → name, category, "Achievement unlocked!", award date (if available).
*
* Progress values come entirely from the backend — the frontend never decides
* on its own whether a badge is earned or how close it is.
*/
function formatDate(iso) {
	if (!iso) return null;
	try {
		return new Date(iso).toLocaleDateString(void 0, {
			year: "numeric",
			month: "long",
			day: "numeric"
		});
	} catch {
		return null;
	}
}
var MOTIVATIONAL = [
	"You're getting closer to your next Gihanga achievement!",
	"Keep going — your community is growing.",
	"Every follower brings you one step closer.",
	"Your content is reaching more people every day."
];
function AchievementBadgeDetail({ badge, progress }) {
	const data = progress ?? badge;
	const earned = Boolean(data.earned);
	const { label: colorLabel } = resolveBadgeColor(data.color);
	const awardDate = formatDate(data.awardedAt ?? null);
	const metricLabel = data.metric === "followers" ? "eligible followers" : "eligible content views";
	if (earned) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "w-[280px] space-y-3 p-1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
					className: "size-5 shrink-0",
					style: { color: resolveBadgeColor(data.color).value }
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-sm font-bold leading-tight text-foreground",
						children: data.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-[11px] uppercase tracking-wide text-muted-foreground",
						children: [
							data.category === "stars" ? "Gihanga Star" : "Gihanga Diamond",
							" · ",
							colorLabel
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-lg bg-success/10 px-3 py-2 text-xs font-semibold text-success",
				children: "Achievement unlocked!"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs leading-relaxed text-muted-foreground",
				children: data.description
			}),
			awardDate && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-[11px] text-muted-foreground",
				children: ["Awarded on ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-semibold text-foreground",
					children: awardDate
				})]
			})
		]
	});
	const current = data.current ?? 0;
	const remaining = data.remaining ?? data.threshold;
	const pct = data.progressPct ?? (data.threshold ? Math.min(100, Math.round(current / data.threshold * 100)) : 0);
	const message = MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)] ?? MOTIVATIONAL[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "w-[280px] space-y-3 p-1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-5 shrink-0 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-sm font-bold leading-tight text-foreground",
						children: data.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-[11px] uppercase tracking-wide text-muted-foreground",
						children: [
							data.category === "stars" ? "Gihanga Star" : "Gihanga Diamond",
							" · ",
							colorLabel
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs leading-relaxed text-muted-foreground",
				children: [
					"Requirement:",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-semibold text-foreground",
						children: formatCount(data.threshold)
					}),
					" ",
					metricLabel
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between text-[11px] text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						formatCount(current),
						" / ",
						formatCount(data.threshold)
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [pct, "%"] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
					value: pct,
					className: "h-1.5"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-[11px] text-muted-foreground",
				children: [
					"Remaining: ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-semibold text-foreground",
						children: formatCount(remaining)
					}),
					" ",
					data.metric === "followers" ? "followers" : "views"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex items-start gap-1.5 text-[11px] italic leading-relaxed text-foreground/80",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
					className: "size-3.5 shrink-0 mt-0.5 text-warning",
					style: { color: resolveBadgeColor(data.color).value }
				}), message]
			})
		]
	});
}
var Popover = Root2;
var PopoverTrigger = Trigger;
var PopoverContent = import_react.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	align,
	sideOffset,
	className: cn("z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-popover-content-transform-origin)", className),
	...props
}) }));
PopoverContent.displayName = Content2.displayName;
/**
* Achievement Badge Row — renders ALL configured badges (locked + unlocked)
* in two visually distinct groups separated by a thin divider:
*
*   [★ Red  ★ Gold  ★ Blue]  │  [◆ Red  ◆ Green  ◆ Blue]
*        Stars (followers)          Diamonds (views)
*
* Each badge is a button that opens a Radix Popover with the detail panel.
* Locked badges are outlined silhouettes; unlocked badges are filled — but
* the earned/locked state is NEVER communicated by color alone (each badge
* also carries an accessible label and the popover states it explicitly).
*
* Placement: directly below the profile bio/stats, before the action buttons
* (matches the supplied wireframe). Responsive: wraps on small screens, never
* overflows horizontally.
*/
function BadgeButton({ badge, progress }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const { value: colorValue } = resolveBadgeColor(badge.color);
	const detailed = progress?.find((p) => p.achievementId === badge.achievementId);
	const thresholdLabel = badge.threshold >= 1e6 ? `${badge.threshold / 1e6}M` : badge.threshold >= 1e3 ? `${badge.threshold / 1e3}K` : String(badge.threshold);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				"aria-label": `${badge.name} — ${badge.earned ? "earned" : "locked"}: ${thresholdLabel} ${badge.metric}`,
				className: cn("press group flex flex-col items-center gap-1.5 rounded-xl px-2 py-1.5 outline-none", "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background", "transition-transform hover:-translate-y-0.5"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("grid place-items-center rounded-full p-0.5 transition-all", badge.earned && "drop-shadow-sm"),
					style: badge.earned ? { filter: `drop-shadow(0 2px 6px color-mix(in srgb, ${colorValue} 25%, transparent))` } : void 0,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeIconSvg, {
						icon: badge.icon,
						color: badge.color,
						filled: badge.earned,
						size: 38
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex flex-col items-center leading-none",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("text-[11px] font-extrabold tabular-nums", badge.earned ? "text-foreground" : "text-muted-foreground"),
						children: thresholdLabel
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[9px] uppercase tracking-wide text-muted-foreground",
						children: badge.metric === "followers" ? "followers" : "views"
					})]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
			align: "center",
			sideOffset: 8,
			className: "w-auto border-border bg-popover p-3 text-popover-foreground shadow-float",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AchievementBadgeDetail, {
				badge,
				progress: detailed
			})
		})]
	});
}
function BadgeSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center gap-1.5 px-2 py-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-[38px] animate-pulse rounded-full bg-muted" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-2.5 w-6 animate-pulse rounded bg-muted" })]
	});
}
function AchievementBadgeRow({ badges, progress, isLoading }) {
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center gap-2",
		"aria-busy": "true",
		"aria-label": "Loading achievements",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeSkeleton, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeSkeleton, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeSkeleton, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mx-1 h-8 w-px bg-border",
				"aria-hidden": true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeSkeleton, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeSkeleton, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeSkeleton, {})
		]
	});
	if (!badges || badges.length === 0) return null;
	const stars = badges.filter((b) => b.category === "stars");
	const diamonds = badges.filter((b) => b.category === "diamonds");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Achievement badges",
		className: "flex flex-wrap items-start gap-1.5",
		children: [
			stars.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap items-center gap-0.5",
				role: "group",
				"aria-label": "Gihanga Stars — follower milestones",
				children: stars.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeButton, {
					badge: b,
					progress
				}, b.achievementId))
			}),
			stars.length > 0 && diamonds.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mx-1 h-10 w-px self-center bg-border",
				"aria-hidden": true
			}),
			diamonds.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap items-center gap-0.5",
				role: "group",
				"aria-label": "Gihanga Diamonds — view milestones",
				children: diamonds.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeButton, {
					badge: b,
					progress
				}, b.achievementId))
			}),
			badges.some((b) => b.earned) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "sr-only",
				children: [
					"Earned:",
					" ",
					badges.filter((b) => b.earned).map((b) => b.name).join(", "),
					". Locked:",
					" ",
					badges.filter((b) => !b.earned).map((b) => `${b.name} (${formatCount(b.threshold)} ${b.metric})`).join(", "),
					"."
				]
			})
		]
	});
}
function useUserBadges(username) {
	return useQuery({
		queryKey: ["achievements", username],
		queryFn: () => api.get(`/achievements/${username}`),
		enabled: Boolean(username),
		staleTime: 6e4,
		retry: 1
	});
}
function useMyAchievementProgress(enabled = true) {
	return useQuery({
		queryKey: [
			"achievements",
			"me",
			"progress"
		],
		queryFn: () => api.get("/achievements/me/progress"),
		enabled,
		staleTime: 6e4,
		retry: 1
	});
}
var tabs = [
	{
		id: "posts",
		label: "Posts",
		icon: Grid3x3
	},
	{
		id: "reels",
		label: "Reels",
		icon: Film
	},
	{
		id: "likes",
		label: "Likes",
		icon: Heart
	}
];
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
function FollowListDialog({ username, tab, onOpenChange }) {
	const followers = useFollowers(tab === "followers" ? username : "");
	const following = useFollowing(tab === "following" ? username : "");
	const followUser = useFollowUser();
	const { data: followingSet } = useFollowingSet();
	const { user: me } = useAuth();
	const list = tab === "followers" ? followers.data?.users : following.data?.users;
	const isLoading = tab === "followers" ? followers.isLoading : following.isLoading;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: tab !== null,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-h-[70vh] overflow-y-auto sm:max-w-[420px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: tab === "followers" ? "Followers" : "Following" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-1",
				children: [
					isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "py-8 text-center text-sm text-muted-foreground",
						children: "Loading…"
					}),
					!isLoading && !list?.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "py-8 text-center text-sm text-muted-foreground",
						children: tab === "followers" ? "No followers yet." : "Not following anyone yet."
					}),
					list?.map((u) => {
						const isMe = me?.username === u.username;
						const isFollowing = followingSet?.has(u.username) ?? false;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 rounded-xl p-2 hover:bg-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/profile/$username",
								params: { username: u.username },
								className: "flex min-w-0 flex-1 items-center gap-3",
								onClick: () => onOpenChange(false),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GAvatar, {
									user: toDisplayUser(u),
									size: "sm"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserName, {
										user: toDisplayUser(u),
										className: "text-sm"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "block truncate text-xs text-muted-foreground",
										children: ["@", u.username]
									})]
								})]
							}), !isMe && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: isFollowing ? "soft" : "default",
								size: "sm",
								onClick: () => followUser.mutate({
									username: u.username,
									follow: !isFollowing
								}, { onError: (err) => toast.error(err.message || "Couldn't update follow status") }),
								children: isFollowing ? "Following" : "Follow"
							})]
						}, u._id);
					})
				]
			})]
		})
	});
}
function ProfileNotFound() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "surface-card mx-auto mt-10 max-w-md p-10 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mb-2 font-display text-xl font-bold",
				children: "Account not found"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-4 text-sm text-muted-foreground",
				children: "That handle doesn't exist on Gihanga yet."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "brand",
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/explore",
					children: "Discover creators"
				})
			})
		]
	}) });
}
function ProfilePage() {
	const { username } = Route$17.useParams();
	const { user: authUser } = useAuth();
	const { data, isLoading, isError } = useUserProfile(username);
	const [tab, setTab] = (0, import_react.useState)("posts");
	const [followTab, setFollowTab] = (0, import_react.useState)(null);
	const [deletingPostId, setDeletingPostId] = (0, import_react.useState)(null);
	const followUser = useFollowUser();
	const deletePost = useDeletePost();
	const isMe = authUser?.username === username;
	const badgesQuery = useUserBadges(username);
	const myProgressQuery = useMyAchievementProgress(isMe);
	const celebratedRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!isMe) return;
		const earned = new Set((badgesQuery.data?.badges ?? []).filter((b) => b.earned).map((b) => b.achievementId));
		if (celebratedRef.current === null) {
			celebratedRef.current = earned;
			return;
		}
		for (const id of earned) if (!celebratedRef.current.has(id)) {
			const badge = badgesQuery.data?.badges.find((b) => b.achievementId === id);
			if (badge) {
				const prefersReduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
				toast.success(`Achievement Unlocked! ${badge.name}`, {
					description: `You earned the ${badge.name} on Gihanga Updates.`,
					duration: prefersReduced ? 4e3 : 6e3
				});
			}
		}
		celebratedRef.current = earned;
	}, [badgesQuery.data, isMe]);
	const postsQuery = useUserPosts(username);
	const likesQuery = useLikedPosts(username, isMe && tab === "likes");
	const handleDelete = async (postId, e) => {
		if (e) e.stopPropagation();
		try {
			setDeletingPostId(postId);
			await deletePost.mutateAsync(postId);
			toast.success("Post deleted successfully");
		} catch (err) {
			toast.error(err.message || "Failed to delete post");
		} finally {
			setDeletingPostId(null);
		}
	};
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "py-16 text-center text-sm text-muted-foreground",
		children: "Loading profile…"
	}) });
	if (isError || !data?.user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileNotFound, {});
	const profile = data.user;
	const displayUser = {
		id: profile._id,
		name: profile.name,
		username: profile.username,
		bio: profile.bio,
		avatarHue: profile.avatarHue,
		avatarUrl: profile.avatarUrl,
		verified: profile.verified,
		creator: profile.isCreator,
		live: profile.isLive,
		followers: profile.followersCount,
		following: profile.followingCount,
		posts: profile.postsCount
	};
	const allPosts = postsQuery.data?.pages.flatMap((p) => p.posts) ?? [];
	const reelsList = allPosts.filter((p) => p.kind === "reel");
	const likesList = likesQuery.data?.posts ?? [];
	const grid = tab === "reels" ? reelsList : tab === "likes" ? likesList : allPosts;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-[900px] pb-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "surface-card relative mb-4 overflow-hidden rounded-3xl border border-border p-0 shadow-soft",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-32 w-full sm:h-44",
					style: { backgroundImage: `linear-gradient(120deg, oklch(0.42 0.11 ${displayUser.avatarHue}), oklch(0.72 0.12 ${displayUser.avatarHue + 30}))` }
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-4 pb-5 sm:px-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "-mt-12 flex items-end gap-4 sm:-mt-14",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-full ring-4 ring-card shadow-lg",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GAvatar, {
									user: displayUser,
									size: "xl",
									ring: displayUser.live ? "live" : displayUser.creator ? "creator" : "none"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "ml-auto flex gap-2 pb-1",
								children: isMe ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									asChild: true,
									className: "rounded-xl font-bold",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/settings",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-4 mr-1.5" }), " Edit profile"]
									})
								}), authUser?.isCreator && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "brand",
									asChild: true,
									className: "rounded-xl font-bold",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/studio",
										children: "Studio"
									})
								})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: profile.isFollowing ? "outline" : "brand",
									className: "rounded-xl font-bold",
									onClick: () => {
										const wasFollowing = profile.isFollowing;
										followUser.mutate({
											username,
											follow: !wasFollowing
										}, {
											onSuccess: () => toast.success(wasFollowing ? `Unfollowed @${username}` : `Following @${username}`),
											onError: (err) => toast.error(err.message || "Couldn't update follow status")
										});
									},
									children: profile.isFollowing ? "Following" : "Follow"
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "mt-3 flex items-center gap-2 font-display text-xl font-extrabold tracking-tight text-foreground",
							children: [
								displayUser.name,
								displayUser.verified && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VerifiedBadge, { className: "size-5" }),
								displayUser.creator && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-black uppercase text-amber-500 border border-amber-500/20",
									children: "Creator"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm font-medium text-muted-foreground",
							children: ["@", displayUser.username]
						}),
						displayUser.bio && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 max-w-xl text-sm leading-relaxed text-foreground/90",
							children: displayUser.bio
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center gap-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "size-3.5" }),
									"Joined",
									" ",
									new Date(profile.createdAt).toLocaleDateString(void 0, {
										month: "long",
										year: "numeric"
									})
								]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-4 flex gap-6",
							children: [
								{
									label: "Posts",
									value: profile.postsCount,
									onClick: void 0
								},
								{
									label: "Followers",
									value: profile.followersCount,
									onClick: () => setFollowTab("followers")
								},
								{
									label: "Following",
									value: profile.followingCount,
									onClick: () => setFollowTab("following")
								}
							].map((s) => s.onClick ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: s.onClick,
								className: "press text-left",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block font-display text-lg font-extrabold text-foreground",
									children: formatCount(s.value)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground hover:text-foreground",
									children: s.label
								})]
							}, s.label) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block font-display text-lg font-extrabold text-foreground",
								children: formatCount(s.value)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: s.label
							})] }, s.label))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AchievementBadgeRow, {
							badges: badgesQuery.data?.badges ?? [],
							progress: myProgressQuery.data?.progress ?? void 0,
							isLoading: badgesQuery.isLoading
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "surface-card mb-4 flex gap-1 rounded-2xl border border-border p-1 shadow-sm",
				children: tabs.map((t) => {
					if (t.id === "likes" && !isMe) return null;
					const count = t.id === "posts" ? allPosts.length : t.id === "reels" ? reelsList.length : likesList.length;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setTab(t.id),
						className: cn("press flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs sm:text-sm font-bold transition-all", t.id === tab ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-muted"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(t.icon, { className: "size-4" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.label }),
							count > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("rounded-full px-1.5 py-0.2 text-[10px] font-black", t.id === tab ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"),
								children: count
							})
						]
					}, t.id);
				})
			}),
			grid.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "surface-card rounded-3xl p-12 text-center text-muted-foreground border border-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-semibold",
					children: tab === "posts" ? "No posts shared yet." : tab === "reels" ? "No reels published yet." : "No liked posts yet."
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-3 sm:grid-cols-3",
				children: grid.map((item) => {
					const mediaSrc = mediaUrl(item.mediaUrl) || mediaUrl(item.thumbnailUrl);
					const isVideo = item.kind === "video" || item.kind === "reel" || Boolean(item.mediaUrl?.match(/\.(mp4|webm|mov)$/i));
					const isDeleting = deletingPostId === item._id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "group relative aspect-square overflow-hidden rounded-2xl bg-slate-900 border border-border/60 shadow-soft hover:shadow-hover transition-all",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.kind === "reel" ? "/reels" : "/post/$postId",
							params: { postId: item._id },
							className: "block size-full",
							children: [mediaSrc ? isVideo ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative size-full bg-black",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
									src: mediaSrc,
									poster: mediaUrl(item.thumbnailUrl),
									muted: true,
									playsInline: true,
									preload: "metadata",
									className: "size-full object-cover transition-transform duration-500 group-hover:scale-105"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "absolute top-2.5 right-2.5 grid size-6 place-items-center rounded-full bg-black/60 text-white backdrop-blur-md",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-3 fill-white ml-0.5" })
								})]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: mediaSrc,
								alt: item.body ? item.body.slice(0, 40) : "Post",
								loading: "lazy",
								onError: (e) => {
									const target = e.currentTarget;
									target.style.display = "none";
									const parent = target.parentElement;
									if (parent) parent.classList.add("bg-gradient-to-tr", "from-slate-900", "to-slate-800", "flex", "items-center", "justify-center", "p-4", "text-center");
								},
								className: "size-full object-cover transition-transform duration-500 group-hover:scale-105"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex size-full flex-col justify-between bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 p-4 text-white",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "line-clamp-4 text-xs font-semibold leading-relaxed",
									children: item.body || "Text post"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] text-white/60 font-bold uppercase tracking-wider",
									children: "Note"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "absolute inset-0 flex items-center justify-center gap-4 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 backdrop-blur-[2px] pointer-events-none",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1.5 text-xs font-extrabold text-white drop-shadow-md",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-4 fill-white" }), formatCount(item.likesCount || 0)]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1.5 text-xs font-extrabold text-white drop-shadow-md",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-4 fill-white" }), formatCount(item.commentsCount || 0)]
								})]
							})]
						}), isMe && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute top-2 right-2 z-20",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-label": "Post actions",
									className: "press grid size-7 place-items-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80 transition-colors",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EllipsisVertical, { className: "size-3.5" })
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuContent, {
								align: "end",
								className: "w-36",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
									disabled: isDeleting,
									onClick: (e) => handleDelete(item._id, e),
									className: "text-danger focus:bg-danger/10 focus:text-danger cursor-pointer font-bold",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5 mr-2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Delete" })]
								})
							})] })
						})]
					}, item._id);
				})
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FollowListDialog, {
		username,
		tab: followTab,
		onOpenChange: (open) => !open && setFollowTab(null)
	})] });
}
//#endregion
export { ProfilePage as component };
