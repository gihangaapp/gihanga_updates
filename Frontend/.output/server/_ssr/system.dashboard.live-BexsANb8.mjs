import { o as __toESM } from "../_runtime.mjs";
import { t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { Kt as Gift, _n as CircleStop, a as X, at as Radio, ot as Plus, p as Users, q as ShieldAlert } from "../_libs/lucide-react.mjs";
import { X as useForceEndLive, bt as useStaffLiveStreams, et as useLiveAlerts, gt as useSaveLiveKeywords, it as useLiveKeywords, k as formatCount } from "./router-NU7wHj2a.mjs";
import { i as getStaffSocket, l as useAuth } from "./auth-context-Duh7Mq6E.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { a as StaffPageHeader, i as StaffErrorState, n as StaffCard, o as StaffSkeletonRows, r as StaffEmptyState } from "./StaffUI-C6Ki33SI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/system.dashboard.live-BexsANb8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ForceEndButton({ id, username }) {
	const forceEnd = useForceEndLive();
	const [reason, setReason] = (0, import_react.useState)("");
	const [open, setOpen] = (0, import_react.useState)(false);
	if (!open) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		size: "sm",
		variant: "destructive",
		onClick: () => setOpen(true),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleStop, { className: "mr-1 size-3.5" }), "Force-End"]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-1.5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				autoFocus: true,
				value: reason,
				onChange: (e) => setReason(e.target.value),
				placeholder: "Reason…",
				className: "h-8 w-32 rounded-lg border border-border bg-elevated px-2 text-xs text-foreground outline-none"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "destructive",
				disabled: !reason.trim() || forceEnd.isPending,
				onClick: () => forceEnd.mutate({
					id,
					reason: reason.trim()
				}, {
					onSuccess: () => toast.error(`Live stream for @${username} was force-ended.`),
					onError: (err) => toast.error(err.message || "Couldn't force-end this stream")
				}),
				children: "Confirm"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "ghost",
				onClick: () => setOpen(false),
				children: "Cancel"
			})
		]
	});
}
function KeywordManager() {
	const { data } = useLiveKeywords();
	const saveKeywords = useSaveLiveKeywords();
	const [draft, setDraft] = (0, import_react.useState)("");
	const keywords = data?.keywords ?? [];
	function add() {
		const clean = draft.trim().toLowerCase();
		if (!clean || keywords.includes(clean)) return;
		saveKeywords.mutate([...keywords, clean]);
		setDraft("");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(StaffCard, {
		className: "p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-base font-bold text-foreground",
				children: "Live chat keyword alerts"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: "Messages containing any of these words are flagged and pushed to moderators in real time."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [keywords.map((kw) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1 text-xs font-semibold text-foreground",
					children: [kw, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": `Remove ${kw}`,
						onClick: () => saveKeywords.mutate(keywords.filter((k) => k !== kw)),
						className: "text-muted-foreground hover:text-danger",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3" })
					})]
				}, kw)), !keywords.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "No keywords configured yet."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: draft,
					onChange: (e) => setDraft(e.target.value),
					onKeyDown: (e) => e.key === "Enter" && add(),
					placeholder: "Add a keyword…",
					className: "h-9 flex-1 rounded-lg border border-border bg-elevated px-3 text-sm text-foreground outline-none"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "outline",
					onClick: add,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), " Add"]
				})]
			})
		]
	});
}
function LiveOversightPage() {
	const { staffUser } = useAuth();
	const { data, isLoading, isError, error, refetch } = useStaffLiveStreams();
	const { data: alertsData } = useLiveAlerts();
	const [liveViewerCounts, setLiveViewerCounts] = (0, import_react.useState)({});
	const streams = data?.streams ?? [];
	const alerts = alertsData?.alerts ?? [];
	(0, import_react.useEffect)(() => {
		if (!staffUser) return;
		const socket = getStaffSocket();
		if (!socket) return;
		const onAlert = (alert) => {
			toast.warning(`Flagged message from @${alert.sender?.username}`, { description: alert.body });
		};
		const onViewerCount = (payload) => {
			setLiveViewerCounts((prev) => ({
				...prev,
				[payload.streamId]: payload.viewerCount
			}));
		};
		socket.on("moderation:live-alert", onAlert);
		socket.on("live:viewer-count", onViewerCount);
		return () => {
			socket.off("moderation:live-alert", onAlert);
			socket.off("live:viewer-count", onViewerCount);
		};
	}, [staffUser]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StaffPageHeader, {
				icon: Radio,
				title: "Live Stream Oversight",
				description: "Monitor active live broadcasts and enforce safety guardrails in real time.",
				accent: "danger"
			}),
			isError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StaffErrorState, {
				message: error?.message || "Couldn't load live streams.",
				onRetry: () => refetch()
			}),
			isLoading && !isError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StaffSkeletonRows, { rows: 3 }),
			!isLoading && !isError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: [streams.map((s, i) => {
					const liveCount = liveViewerCounts[s._id] ?? s.viewerCount;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
						initial: {
							opacity: 0,
							y: 12
						},
						animate: {
							opacity: 1,
							y: 0
						},
						transition: {
							duration: .3,
							delay: i * .05
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(StaffCard, {
							className: "space-y-4 p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-1.5 rounded-lg border border-danger/30 bg-danger/10 px-2.5 py-1 text-xs font-bold text-danger",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-3.5 animate-pulse" }), " LIVE"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-1 text-xs font-semibold text-muted-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-3.5" }),
											" ",
											formatCount(liveCount),
											" watching"
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-base font-bold text-foreground",
									children: s.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground",
									children: [
										"Host: ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
											className: "text-foreground",
											children: ["@", s.host.username]
										}),
										" (",
										s.host.name,
										")"
									]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between border-t border-border pt-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-1 text-xs text-muted-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gift, { className: "size-3.5 text-warning" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
												className: "text-warning",
												children: [formatCount(s.totalGifts), " pts"]
											}),
											" in gifts"
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ForceEndButton, {
										id: s._id,
										username: s.host.username
									})]
								})
							]
						})
					}, s._id);
				}), !streams.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "sm:col-span-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StaffEmptyState, {
						icon: Radio,
						title: "No live streams right now",
						description: "Active broadcasts will show up here in real time."
					})
				})]
			}),
			alerts.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(StaffCard, {
				className: "border-warning/30 bg-warning/5 p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "flex items-center gap-2 font-display text-base font-bold text-warning",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "size-4" }), " Flagged chat messages"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-2",
					children: alerts.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-xl bg-card/80 p-3 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-semibold text-foreground",
								children: ["@", a.sender?.username]
							}),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted-foreground",
								children: [
									"in \"",
									a.stream?.title,
									"\":"
								]
							}),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-foreground/90",
								children: a.body
							})
						]
					}, a._id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeywordManager, {})
		]
	});
}
//#endregion
export { LiveOversightPage as component };
