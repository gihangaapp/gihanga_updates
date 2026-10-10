import { o as __toESM } from "../_runtime.mjs";
import { r as cn, t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { D as Timer, E as Trash2, Ht as Heart, J as Share2, K as ShieldBan, Kt as Gift, M as SwitchCamera, Sn as ChevronUp, Tn as ChevronDown, U as ShieldOff, V as Signal, Vn as ArrowLeft, X as Settings2, Yt as Flag, Z as Send, _ as UserPlus, a as X, at as Radio, b as UserCheck, bt as Mic, ct as Pin, d as Video, f as VideoOff, it as RefreshCw, jt as LoaderCircle, kt as LogIn, l as VolumeX, lt as PhoneOff, o as Wifi, on as DollarSign, p as Users, pn as Coins, rn as EllipsisVertical, rt as Reply, s as WifiOff, u as Volume2, v as UserMinus, w as TriangleAlert, xt as MicOff } from "../_libs/lucide-react.mjs";
import { n as api } from "./api-client-C-02deeD.mjs";
import { C as Route$19, D as UserName, Ft as DialogTitle, I as useAddModerator, K as useFollowUser, L as useBanViewer, Mt as Dialog, Nt as DialogContent, Pt as DialogHeader, U as useEndLive, Y as useFollowingSet, Z as useInviteFollowers, _t as useSendGift, at as useLiveStream, c as DropdownMenu, d as DropdownMenuSeparator, dt as useMyWallet, f as DropdownMenuTrigger, ht as useReportLive, k as formatCount, kt as useUpdateLiveSettings, l as DropdownMenuContent, m as GIFT_CATALOG, nt as useLiveEarnings, p as GAvatar, rt as useLiveHeartbeat, tt as useLiveChatHistory, u as DropdownMenuItem, ut as useMuteViewer, y as QUALITY_THRESHOLDS } from "./router-NU7wHj2a.mjs";
import { l as useAuth, n as getLiveSocket } from "./auth-context-Duh7Mq6E.mjs";
import { a as useQueryClient, n as useMutation, r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as useHostCoHostMesh, i as useCoHostLiveRoom, n as useBrowserLiveRoom, o as useViewerStreams, t as VIEWER_GRID_AVAILABLE } from "./live-room-CWrFKsKE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/live._streamId-Br_52mxp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useBlockedSet() {
	const { user } = useAuth();
	return useQuery({
		queryKey: ["blocked-set"],
		queryFn: () => api.get("/blocks/mine"),
		enabled: Boolean(user),
		select: (data) => new Set(data.usernames),
		staleTime: 3e4
	});
}
function useToggleBlock() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ username, block }) => api.post(`/blocks/${username}`),
		onMutate: async ({ username, block }) => {
			queryClient.setQueryData(["blocked-set"], (prev) => {
				const set = new Set(prev?.usernames ?? []);
				if (block) set.add(username);
				else set.delete(username);
				return { usernames: Array.from(set) };
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["blocked-set"] });
			queryClient.invalidateQueries({ queryKey: ["following-set"] });
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		}
	});
}
var DEFAULTS = {
	stallThresholdMs: 3e3,
	hostLeftThresholdMs: 12e3,
	debounceMs: 400
};
function useLiveVideoHealth(options) {
	const { videoRef, connected, hasStream, remoteTrackMuted = false, reconnecting = false, streamLive, isViewer, stallThresholdMs = DEFAULTS.stallThresholdMs, hostLeftThresholdMs = DEFAULTS.hostLeftThresholdMs, debounceMs = DEFAULTS.debounceMs } = options;
	const [state, setState] = (0, import_react.useState)("connecting");
	const [playBlocked, setPlayBlocked] = (0, import_react.useState)(false);
	const lastFrameAtRef = (0, import_react.useRef)(Date.now());
	const stalledSinceRef = (0, import_react.useRef)(null);
	const hostAbsentSinceRef = (0, import_react.useRef)(null);
	const streamRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const video = videoRef.current;
		if (video) streamRef.current = video.srcObject;
	}, [
		videoRef,
		hasStream,
		connected
	]);
	const retry = (0, import_react.useCallback)(() => {
		const video = videoRef.current;
		if (!video) return;
		setPlayBlocked(false);
		stalledSinceRef.current = null;
		lastFrameAtRef.current = Date.now();
		if (streamRef.current) video.srcObject = streamRef.current;
		video.play().catch(() => setPlayBlocked(true));
		setState((s) => s === "no-frames" || s === "disconnected" ? "connecting" : s);
	}, [videoRef]);
	(0, import_react.useEffect)(() => {
		const video = videoRef.current;
		if (!video) return;
		const onPlayFailure = () => setPlayBlocked(true);
		const attempt = video.play();
		if (attempt) attempt.catch(onPlayFailure);
		const handler = () => setPlayBlocked(false);
		video.addEventListener("playing", handler);
		return () => video.removeEventListener("playing", handler);
	}, [
		videoRef,
		hasStream,
		connected
	]);
	(0, import_react.useEffect)(() => {
		const video = videoRef.current;
		if (!video) return;
		const markFrame = () => {
			lastFrameAtRef.current = Date.now();
			stalledSinceRef.current = null;
		};
		let rvfcId = 0;
		const useRvfc = typeof video.requestVideoFrameCallback === "function";
		if (useRvfc) {
			const v = video;
			const loop = () => {
				markFrame();
				rvfcId = v.requestVideoFrameCallback(loop);
			};
			rvfcId = v.requestVideoFrameCallback(loop);
		}
		const timer = window.setInterval(() => {
			const now = Date.now();
			if (video.currentTime > 0 && !video.paused && video.readyState >= 2) markFrame();
			if (hasStream && connected) {
				if (now - lastFrameAtRef.current > stallThresholdMs && !video.paused) {
					if (stalledSinceRef.current === null) stalledSinceRef.current = now;
				} else stalledSinceRef.current = null;
			} else {
				lastFrameAtRef.current = now;
				stalledSinceRef.current = null;
			}
			if (isViewer && streamLive && connected && !hasStream) {
				if (hostAbsentSinceRef.current === null) hostAbsentSinceRef.current = now;
			} else hostAbsentSinceRef.current = null;
		}, 500);
		return () => {
			window.clearInterval(timer);
			if (useRvfc) video.cancelVideoFrameCallback?.(rvfcId);
		};
	}, [
		videoRef,
		hasStream,
		connected,
		isViewer,
		streamLive,
		stallThresholdMs
	]);
	(0, import_react.useEffect)(() => {
		if (state !== "no-frames") return;
		const t = window.setTimeout(() => retry(), 2500);
		return () => window.clearTimeout(t);
	}, [state, retry]);
	const computeTarget = (0, import_react.useCallback)(() => {
		if (reconnecting) return "reconnecting";
		if (!connected) return "connecting";
		if (playBlocked) return "autoplay-blocked";
		if (!streamLive) return "disconnected";
		if (isViewer && !hasStream) {
			if (hostAbsentSinceRef.current !== null && Date.now() - hostAbsentSinceRef.current > hostLeftThresholdMs) return "host-left";
			return "waiting-host";
		}
		if (!hasStream) return "waiting-host";
		if (remoteTrackMuted) return "host-camera-off";
		if (stalledSinceRef.current !== null && Date.now() - stalledSinceRef.current > 1200) return "no-frames";
		return "ok";
	}, [
		connected,
		hasStream,
		isViewer,
		playBlocked,
		reconnecting,
		remoteTrackMuted,
		streamLive,
		hostLeftThresholdMs
	]);
	(0, import_react.useEffect)(() => {
		const target = computeTarget();
		if (target === state) return;
		if (target === "ok") {
			setState("ok");
			return;
		}
		const t = window.setTimeout(() => {
			setState(computeTarget() === "ok" ? "ok" : computeTarget());
		}, debounceMs);
		return () => window.clearTimeout(t);
	}, [
		computeTarget,
		state,
		debounceMs
	]);
	return {
		state,
		message: {
			connecting: "Connecting to the stream…",
			"waiting-host": "Waiting for the host's video…",
			"host-camera-off": "Host turned their camera off",
			"no-frames": "Video isn't loading — retrying…",
			"autoplay-blocked": "Tap to play",
			reconnecting: "Reconnecting…",
			disconnected: "Connection lost",
			"host-left": "Host left — waiting for them to return",
			ok: ""
		}[state],
		canRetry: state === "no-frames" || state === "disconnected" || state === "autoplay-blocked",
		retry
	};
}
var DEFAULT_QUALITY_THRESHOLDS = {
	poorLossPct: 8,
	poorRttMs: 600,
	poorBitrateKbps: 150,
	poorSustainMs: 6e3,
	recoverSustainMs: 8e3
};
function createQualityState(now = 0) {
	return {
		level: "good",
		streakSince: now,
		samples: []
	};
}
function sampleIsPoor(sample, t) {
	if (sample.online === false) return true;
	if (typeof sample.loss === "number" && Number.isFinite(sample.loss)) {
		if (sample.loss * 100 > t.poorLossPct) return true;
	}
	if (typeof sample.rttMs === "number" && Number.isFinite(sample.rttMs)) {
		if (sample.rttMs > t.poorRttMs) return true;
	}
	if (typeof sample.bitrateKbps === "number" && Number.isFinite(sample.bitrateKbps)) {
		if (sample.bitrateKbps < t.poorBitrateKbps && sample.bitrateKbps > 0) return true;
	}
	return false;
}
/**
* Feed one sample; returns the (possibly unchanged) state. Pure: returns a
* new state object, never mutates the input.
*/
function pushSample(state, sample, thresholds = DEFAULT_QUALITY_THRESHOLDS) {
	const samples = [...state.samples, sample].slice(-32);
	const poor = sampleIsPoor(sample, thresholds);
	const streakSince = (state.level === "good" ? poor !== true : poor !== false) ? sample.at : state.streakSince;
	let level = state.level;
	if (state.level === "good" && poor) {
		if (sample.at - streakSince >= thresholds.poorSustainMs) level = "poor";
	} else if (state.level === "poor" && !poor) {
		if (sample.at - streakSince >= thresholds.recoverSustainMs) level = "good";
	}
	return {
		level,
		streakSince,
		samples
	};
}
/**
* Convenience: run a whole history at once (used by tests and by callers
* that collect stats in batches).
*/
function classifyHistory(samples, thresholds = DEFAULT_QUALITY_THRESHOLDS) {
	return samples.reduce((state, sample) => pushSample(state, sample, thresholds), createQualityState());
}
/**
* Soft hint from navigator.connection — never flips the level alone, but a
* 2g/saveData connection pre-disposes to poor so the banner appears a
* little earlier rather than late.
*/
function networkHintLooksPoor(hint) {
	if (hint.saveData === true) return true;
	if (hint.effectiveType === "2g" || hint.effectiveType === "slow-2g") return true;
	if (typeof hint.downlink === "number" && hint.downlink > 0 && hint.downlink < .25) return true;
	return false;
}
/**
* A3 — the single overlay used by every live <video>. Driven by
* useLiveVideoHealth(); never rendered when state === "ok"; role="status"
* for screen readers; debouncing happens in the hook so it never flickers.
*/
function VideoStatusOverlay({ health, role }) {
	if (health.state === "ok") return null;
	const message = health.state === "disconnected" ? role === "viewer" ? "Connection lost" : "Your broadcast connection was lost" : health.state === "reconnecting" ? role === "viewer" ? "Reconnecting…" : "Your connection dropped — reconnecting…" : health.state === "host-left" ? "Host left — waiting for them to return" : health.state === "no-frames" ? "Video isn't loading — retrying…" : health.state === "autoplay-blocked" ? "Tap to play" : health.state === "host-camera-off" ? role === "viewer" ? "Host turned their camera off" : "Your camera is off" : health.state === "waiting-host" ? role === "viewer" ? "Waiting for the host's video…" : "Waiting for your broadcast to start…" : role === "viewer" ? "Connecting to the stream…" : "Starting your camera…";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "status",
		"aria-live": "polite",
		className: cn("absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/60 px-6 text-center backdrop-blur-[2px]", health.state === "autoplay-blocked" && "cursor-pointer"),
		onClick: health.state === "autoplay-blocked" || health.state === "disconnected" ? health.retry : void 0,
		children: [
			health.state === "connecting" || health.state === "reconnecting" || health.state === "no-frames" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-8 animate-pulse text-white/80" }) : health.state === "disconnected" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WifiOff, { className: "size-8 text-danger" }) : health.state === "host-camera-off" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Signal, { className: "size-8 text-white/80" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-8 text-white/80" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-semibold text-white/90 [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]",
				children: message
			}),
			(health.state === "disconnected" || health.state === "no-frames") && health.canRetry && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: (e) => {
					e.stopPropagation();
					health.retry();
				},
				className: "press mt-1 flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-black hover:bg-white/90",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3.5" }), " Retry"]
			}),
			health.state === "autoplay-blocked" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs text-white/60",
				children: "Your browser blocked autoplay — tap anywhere to start the video"
			})
		]
	});
}
/**
* A6 — the non-blocking poor-connection banner with hysteresis. Shows for
* sustained poor quality, auto-dismisses after sustained recovery. Never
* covers the video controls; sits at the top of the stream area.
*/
function ConnectionQualityBanner({ samples, variant, escalated }) {
	const [hint, setHint] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const nav = navigator;
		const update = () => setHint(networkHintLooksPoor(nav.connection ?? {}));
		update();
		nav.connection?.addEventListener?.("change", update);
		return () => nav.connection?.removeEventListener?.("change", update);
	}, []);
	const poor = classifyHistory(samples, QUALITY_THRESHOLDS).level === "poor" || hint && samples.length === 0;
	const [offline, setOffline] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const on = () => setOffline(false);
		const off = () => setOffline(true);
		window.addEventListener("online", on);
		window.addEventListener("offline", off);
		return () => {
			window.removeEventListener("online", on);
			window.removeEventListener("offline", off);
		};
	}, []);
	if (!poor && !offline || escalated) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "status",
		className: cn("pointer-events-none absolute inset-x-3 top-28 z-20 mx-auto flex w-fit items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold backdrop-blur-md", offline ? "border-danger/40 bg-danger/20 text-white" : "border-amber-400/40 bg-amber-500/20 text-amber-100"),
		children: [offline ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WifiOff, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, { className: "size-3.5 animate-pulse" }), offline ? "You're offline — reconnecting…" : variant === "viewer" ? "Poor connection — try moving to a new location or switching networks." : "Your connection is weak — viewers may see lag."]
	});
}
function toDisplayUser(u) {
	return {
		id: u._id,
		name: u.name,
		username: u.username,
		bio: "",
		avatarHue: u.avatarHue,
		avatarUrl: u.avatarUrl,
		verified: u.verified,
		creator: u.isCreator,
		followers: 0,
		following: 0,
		posts: 0
	};
}
function FloatingHearts({ burst }) {
	const [hearts, setHearts] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		if (!burst) return;
		const id = Date.now() + Math.random();
		setHearts((h) => [...h, id]);
		const t = window.setTimeout(() => setHearts((h) => h.filter((x) => x !== id)), 1800);
		return () => window.clearTimeout(t);
	}, [burst]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute inset-0 overflow-hidden",
		children: [hearts.map((id, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, {
			className: "absolute right-6 bottom-16 size-6 fill-danger text-danger opacity-90",
			style: {
				animation: "float-up 1.8s ease-out forwards",
				animationDelay: `${i % 3 * 80}ms`
			}
		}, id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: `@keyframes float-up { 0% { transform: translateY(0) translateX(0); opacity: 1; } 100% { transform: translateY(-180px) translateX(${Math.random() > .5 ? "-" : ""}30px); opacity: 0; } }` })]
	});
}
function ReportDialog({ streamId, open, onOpenChange }) {
	const reportLive = useReportLive(streamId);
	const [reason, setReason] = (0, import_react.useState)("Harassment");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-[380px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Report this live stream" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2 px-1",
				children: [[
					"Harassment",
					"Spam",
					"Nudity",
					"Misinformation",
					"Violence",
					"Other"
				].map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setReason(r),
					className: cn("rounded-xl border px-3.5 py-2.5 text-left text-sm font-semibold", reason === r ? "border-primary bg-primary-soft text-primary" : "border-border text-muted-foreground"),
					children: r
				}, r)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "destructive",
					className: "mt-2",
					onClick: () => reportLive.mutate({ reason }, { onSuccess: () => {
						onOpenChange(false);
						toast.success("Report submitted — our team will review it");
					} }),
					children: "Submit report"
				})]
			})]
		})
	});
}
function AddModeratorDialog({ streamId, asStaff, open, onOpenChange }) {
	const addMod = useAddModerator(streamId, asStaff);
	const [username, setUsername] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-[360px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Add a moderator" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2 px-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: username,
					onChange: (e) => setUsername(e.target.value),
					placeholder: "username",
					className: "h-10 flex-1 rounded-xl border border-border bg-elevated px-3.5 text-sm outline-none focus:border-ring"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "brand",
					onClick: () => addMod.mutate(username.trim(), {
						onSuccess: () => {
							toast.success(`@${username} can now moderate this stream`);
							setUsername("");
							onOpenChange(false);
						},
						onError: (err) => toast.error(err.message || "Couldn't add moderator")
					}),
					disabled: !username.trim() || addMod.isPending,
					children: "Add"
				})]
			})]
		})
	});
}
function JoinRequestDialog({ request, onAccept, onReject }) {
	if (!request) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-auto absolute left-3 top-14 z-30 flex items-center gap-3 rounded-xl border border-white/20 bg-black/80 p-3 backdrop-blur-md lg:top-14",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GAvatar, {
				user: toDisplayUser(request.requestor),
				size: "md"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "truncate text-sm font-bold text-white",
					children: request.requestor.username
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-white/70",
					children: "wants to join your live"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "destructive",
				onClick: () => onReject(request.requestorId),
				className: "shrink-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				variant: "brand",
				onClick: () => onAccept(request.requestorId, request.requestorSocketId),
				className: "shrink-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { className: "size-4" }), " Accept"]
			})
		]
	});
}
/**
* A2 — one tile component used for EVERY role's grid. `selfView` renders the
* local camera (host/co-host); remote tiles render subscribed MediaStreams.
* Audio for remote tiles follows the viewer's single sound toggle.
*/
function LiveVideoTile({ stream, label, muted, showControls, micOn, camOn, onToggleMic, onToggleCam, onFlip, onLeave, selfView, health, dataSaver }) {
	const videoRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (videoRef.current) {
			videoRef.current.srcObject = stream ?? null;
			videoRef.current.muted = muted ?? false;
		}
	}, [stream, muted]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-h-0 overflow-hidden rounded-2xl bg-black",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
				ref: videoRef,
				autoPlay: true,
				playsInline: true,
				muted: muted ?? false,
				className: cn("absolute inset-0 size-full object-cover", dataSaver && "inset-1/4 size-1/2 object-contain", selfView && "scale-x-[-1]")
			}),
			label && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute bottom-2 left-2 z-10 rounded-md bg-black/60 px-2 py-0.5 text-xs font-bold text-white backdrop-blur",
				children: label
			}),
			health && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoStatusOverlay, {
				health,
				role: selfView ? "host" : "viewer"
			}),
			showControls && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute bottom-2 right-2 flex items-center gap-1.5 z-10",
				children: [
					onToggleMic && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onToggleMic,
						className: "grid size-8 place-items-center rounded-full bg-black/50 text-white backdrop-blur",
						children: micOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MicOff, { className: "size-3.5" })
					}),
					onToggleCam && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onToggleCam,
						className: "grid size-8 place-items-center rounded-full bg-black/50 text-white backdrop-blur",
						children: camOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoOff, { className: "size-3.5" })
					}),
					onFlip && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onFlip,
						className: "grid size-8 place-items-center rounded-full bg-black/50 text-white backdrop-blur",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchCamera, { className: "size-3.5" })
					}),
					onLeave && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onLeave,
						className: "grid size-8 place-items-center rounded-full bg-red-600/80 text-white backdrop-blur",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhoneOff, { className: "size-3.5" })
					})
				]
			})
		]
	});
}
function LiveRoomPage() {
	const { streamId } = Route$19.useParams();
	const { user, staffUser } = useAuth();
	const navigate = useNavigate();
	const { data, isLoading } = useLiveStream(streamId);
	const { data: chatHistory } = useLiveChatHistory(streamId);
	const activeIdentity = user ?? staffUser;
	const asStaff = !user && Boolean(staffUser);
	const endLive = useEndLive(asStaff);
	const heartbeat = useLiveHeartbeat(streamId, asStaff);
	const sendGift = useSendGift(streamId);
	const { data: walletData } = useMyWallet();
	const followUser = useFollowUser();
	const { data: followingSet } = useFollowingSet();
	const toggleBlock = useToggleBlock();
	const { data: blockedSet } = useBlockedSet();
	const muteViewer = useMuteViewer(streamId, asStaff);
	const banViewer = useBanViewer(streamId, asStaff);
	const [messages, setMessages] = (0, import_react.useState)([]);
	const [pinned, setPinned] = (0, import_react.useState)(null);
	const [draft, setDraft] = (0, import_react.useState)("");
	const [viewerCount, setViewerCount] = (0, import_react.useState)(0);
	const [reactionCount, setReactionCount] = (0, import_react.useState)(0);
	const [ended, setEnded] = (0, import_react.useState)(null);
	const [giftPickerOpen, setGiftPickerOpen] = (0, import_react.useState)(false);
	const [reportOpen, setReportOpen] = (0, import_react.useState)(false);
	const [addModOpen, setAddModOpen] = (0, import_react.useState)(false);
	const [heartBurst, setHeartBurst] = (0, import_react.useState)(0);
	const [soundOn, setSoundOn] = (0, import_react.useState)(false);
	const [replyingTo, setReplyingTo] = (0, import_react.useState)(null);
	const [chatCollapsed, setChatCollapsed] = (0, import_react.useState)(false);
	const [chatAutoCollapsed, setChatAutoCollapsed] = (0, import_react.useState)(false);
	const [isCoHost, setIsCoHost] = (0, import_react.useState)(false);
	const [joinRequestPending, setJoinRequestPending] = (0, import_react.useState)(false);
	const [joinRequests, setJoinRequests] = (0, import_react.useState)([]);
	const [coHostList, setCoHostList] = (0, import_react.useState)([]);
	const [timeWarning, setTimeWarning] = (0, import_react.useState)(null);
	const [dataSaver, setDataSaver] = (0, import_react.useState)(false);
	const [paidConfirmOpen, setPaidConfirmOpen] = (0, import_react.useState)(null);
	const [paidConfirmDontAsk, setPaidConfirmDontAsk] = (0, import_react.useState)(false);
	const [insufficientPoints, setInsufficientPoints] = (0, import_react.useState)(false);
	const chatEndRef = (0, import_react.useRef)(null);
	const videoRef = (0, import_react.useRef)(null);
	const stream = data?.stream;
	const isHost = Boolean(activeIdentity && stream && (stream.host._id === activeIdentity.id || stream.host.username.trim().toLowerCase() === activeIdentity.username.trim().toLowerCase()));
	const isMod = Boolean(activeIdentity && stream?.moderators?.some((m) => m.username === activeIdentity.username));
	const canModerate = isHost || isMod;
	const isOver = stream ? stream.status !== "live" || Boolean(ended) : false;
	const isStaffHost = Boolean(stream?.host?.role === "moderator" || stream?.host?.role === "admin" || stream?.host?.role === "superadmin");
	const paid = stream?.paidInteractions;
	const paidEnabled = Boolean(paid?.enabled && !canModerate && activeIdentity && !isHost && !isCoHost);
	const commentPrice = paid?.commentPrice ?? 0;
	const reactionPrice = paid?.reactionPrice ?? 0;
	const walletPoints = walletData?.wallet.kingdomPoints ?? 0;
	const { localStream, remoteStream, connected, error: browserError, micOn, camOn, qualitySamples: publisherQuality, toggleMic, toggleCamera, switchCamera } = useBrowserLiveRoom({
		streamId,
		publish: isHost && !isCoHost,
		enabled: Boolean(stream) && !isOver && !isCoHost,
		hostId: stream?.host?._id ?? "",
		asStaff
	});
	const { coHostStreams: hostCoHostStreams, removeCoHostStream: hostRemoveCoHost } = useHostCoHostMesh({
		streamId,
		hostLocalStream: localStream,
		enabled: isHost && !isOver
	});
	const coHostRoom = useCoHostLiveRoom({
		streamId,
		hostId: stream?.host?._id ?? "",
		myUserId: activeIdentity?.id ?? "",
		enabled: isCoHost && !isOver,
		asStaff
	});
	const coHostIds = (0, import_react.useMemo)(() => coHostList.map((c) => c._id), [coHostList]);
	const viewerRoom = useViewerStreams({
		streamId,
		hostId: stream?.host?._id ?? "",
		authorizedIds: [stream?.host?._id ?? "", ...coHostIds],
		enabled: Boolean(stream) && !isOver && !isHost && !isCoHost && Boolean(activeIdentity),
		asStaff
	});
	const updateSettings = useUpdateLiveSettings(streamId, asStaff);
	const inviteFollowers = useInviteFollowers(streamId, asStaff);
	const allCoHostStreams = isHost ? hostCoHostStreams : isCoHost ? coHostRoom.coHostStreams : VIEWER_GRID_AVAILABLE ? viewerRoom.viewerStreams : [];
	const viewerGridTiles = (0, import_react.useMemo)(() => {
		if (isHost || isCoHost) return [];
		if (!VIEWER_GRID_AVAILABLE) return [];
		return viewerRoom.viewerStreams;
	}, [
		isHost,
		isCoHost,
		viewerRoom.viewerStreams
	]);
	const hasCoHosts = allCoHostStreams.length > 0 || viewerGridTiles.length > 1;
	const liveGridTileCount = isHost || isCoHost ? allCoHostStreams.length + 1 : viewerGridTiles.length;
	const roleRef = (0, import_react.useRef)({
		isHost,
		isCoHost,
		hostRemoveCoHost,
		activeIdentity,
		coHostRoom
	});
	roleRef.current = {
		isHost,
		isCoHost,
		hostRemoveCoHost,
		activeIdentity,
		coHostRoom
	};
	(0, import_react.useEffect)(() => {
		if (stream?.coHosts) setCoHostList((prev) => {
			const byId = new Map(prev.map((c) => [c._id, c]));
			for (const c of stream.coHosts ?? []) byId.set(c._id, c);
			return Array.from(byId.values());
		});
	}, [stream?.coHosts]);
	(0, import_react.useEffect)(() => {
		if (hasCoHosts && !chatAutoCollapsed) {
			setChatCollapsed(true);
			setChatAutoCollapsed(true);
		} else if (!hasCoHosts && chatAutoCollapsed) setChatAutoCollapsed(false);
	}, [hasCoHosts, chatAutoCollapsed]);
	const activeMediaStream = isCoHost ? coHostRoom.localStream : isHost ? localStream : remoteStream;
	const activeMediaStreamId = (0, import_react.useMemo)(() => activeMediaStream?.id ?? null, [activeMediaStream]);
	const setVideoRef = (0, import_react.useCallback)((node) => {
		videoRef.current = node;
		if (node) {
			node.srcObject = activeMediaStream ?? null;
			node.muted = true;
			node.volume = 1;
			node.style.transform = isHost || isCoHost ? "scaleX(-1)" : "";
		}
	}, [
		activeMediaStream,
		isHost,
		isCoHost
	]);
	const mainVideoHealth = useLiveVideoHealth({
		videoRef,
		connected,
		hasStream: Boolean(activeMediaStream),
		streamLive: Boolean(stream && stream.status === "live" && !ended),
		isViewer: !isHost && !isCoHost,
		reconnecting: false
	});
	(0, import_react.useEffect)(() => {
		if (!videoRef.current) return;
		if ((videoRef.current.srcObject?.id ?? null) !== activeMediaStreamId) videoRef.current.srcObject = activeMediaStream ?? null;
		videoRef.current.muted = isHost || isCoHost || !soundOn;
		videoRef.current.volume = 1;
		videoRef.current.style.transform = isHost || isCoHost ? "scaleX(-1)" : "";
		if (activeMediaStream && soundOn && !isHost && !isCoHost) videoRef.current.play().catch(() => {
			toast.error("Tap the sound button again to enable audio");
			setSoundOn(false);
		});
	}, [
		activeMediaStream,
		activeMediaStreamId,
		isHost,
		isCoHost,
		soundOn
	]);
	(0, import_react.useEffect)(() => {
		setMessages([]);
		setPinned(null);
		setViewerCount(0);
		setReactionCount(0);
		setEnded(null);
		setSoundOn(false);
		setIsCoHost(false);
		setJoinRequestPending(false);
		setJoinRequests([]);
		setCoHostList([]);
		setTimeWarning(null);
		setInsufficientPoints(false);
	}, [streamId]);
	(0, import_react.useEffect)(() => {
		if (chatHistory) {
			setMessages(chatHistory.messages);
			setPinned(chatHistory.pinned ?? null);
		}
	}, [chatHistory]);
	(0, import_react.useEffect)(() => {
		setViewerCount(stream?.viewerCount ?? 0);
		setReactionCount(stream?.reactionsCount ?? 0);
	}, [stream?.viewerCount, stream?.reactionsCount]);
	const [remainingMs, setRemainingMs] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!stream?.maxEndsAt || stream.status !== "live") {
			setRemainingMs(null);
			return;
		}
		const target = new Date(stream.maxEndsAt).getTime();
		const tick = () => setRemainingMs(Math.max(0, target - Date.now()));
		tick();
		const t = window.setInterval(tick, 1e3);
		return () => window.clearInterval(t);
	}, [stream?.maxEndsAt, stream?.status]);
	const remainingLabel = (0, import_react.useMemo)(() => {
		if (remainingMs == null || remainingMs <= 0) return null;
		const totalSec = Math.floor(remainingMs / 1e3);
		const h = Math.floor(totalSec / 3600);
		const m = Math.floor(totalSec % 3600 / 60);
		const s = totalSec % 60;
		return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
	}, [remainingMs]);
	const heartbeatMutateRef = (0, import_react.useRef)(heartbeat.mutate);
	heartbeatMutateRef.current = heartbeat.mutate;
	(0, import_react.useEffect)(() => {
		if (!isHost || isOver) return;
		const keepAlive = () => {
			getLiveSocket()?.emit("live:heartbeat", { streamId });
			heartbeatMutateRef.current(void 0, { onError: (error) => {
				if (String(error?.message || "").toLowerCase().includes("ended")) setEnded("This stream has ended");
			} });
		};
		keepAlive();
		const timer = window.setInterval(keepAlive, 2e4);
		return () => {
			window.clearInterval(timer);
		};
	}, [
		isHost,
		isOver,
		streamId
	]);
	(0, import_react.useEffect)(() => {
		const socket = getLiveSocket();
		if (!socket) return;
		const joinRoom = () => socket.emit("live:join", { streamId });
		if (socket.connected) joinRoom();
		else socket.once("connect", joinRoom);
		const onChat = (msg) => {
			if (msg.stream !== streamId) return;
			setMessages((prev) => [...prev, msg]);
		};
		const onViewerCount = (p) => {
			if (p.streamId === streamId) setViewerCount(p.viewerCount);
		};
		const onEnded = (p) => {
			if (p.streamId !== streamId) return;
			setEnded(p.forced ? `Ended by a moderator: ${p.reason}` : p.reason || "Stream ended");
		};
		const onReaction = (p) => {
			if (p.streamId !== streamId) return;
			setReactionCount((current) => p.total == null ? current + 1 : Math.max(current, p.total));
			setHeartBurst((n) => n + 1);
		};
		const onPinned = (p) => {
			if (p.streamId === streamId) setPinned(p.message);
		};
		const onUnpinned = (p) => {
			if (p.streamId === streamId) setPinned(null);
		};
		const onDeleted = (p) => {
			if (p.streamId !== streamId) return;
			setMessages((prev) => prev.filter((m) => m._id !== p.commentId));
		};
		const onKicked = (p) => {
			if (p.streamId !== streamId) return;
			toast.error("You've been removed from this stream");
			navigate({ to: "/live" });
		};
		const onBanned = (p) => {
			if (p.streamId !== streamId) return;
			toast.error("You're banned from this stream");
			navigate({ to: "/live" });
		};
		const onChatBlocked = (p) => {
			if (p.streamId === streamId) toast.error(p.reason);
		};
		const onTimeWarning = (p) => {
			if (p.streamId !== streamId) return;
			setTimeWarning(p.minutesLeft);
			window.setTimeout(() => setTimeWarning((w) => w === p.minutesLeft ? null : w), 3e4);
		};
		const onPaymentFailed = (p) => {
			if (p.streamId !== streamId) return;
			if (p.reason === "insufficient") setInsufficientPoints(true);
			if (p.kind === "reaction") setReactionCount((n) => Math.max(0, n - 1));
			toast.error(p.message || "Payment failed");
		};
		const onJoinRequest = (p) => {
			if (p.streamId !== streamId) return;
			setJoinRequests((prev) => [...prev, {
				requestorId: p.requestorId,
				requestorSocketId: p.requestorSocketId,
				requestor: p.requestor
			}]);
		};
		const onJoinAccepted = (p) => {
			if (p.streamId !== streamId) return;
			setJoinRequestPending(false);
			setIsCoHost((prev) => {
				if (prev) return prev;
				toast.success("You joined the live!");
				return true;
			});
		};
		const onJoinRejected = (p) => {
			if (p.streamId !== streamId) return;
			setJoinRequestPending(false);
			toast.error(p.reason || "Your request was declined");
		};
		const onCoHostJoined = (p) => {
			if (p.streamId !== streamId) return;
			if (p.coHost) setCoHostList((prev) => [...prev.filter((c) => c._id !== p.coHostId), p.coHost]);
		};
		const onCoHostSnapshot = (p) => {
			if (p.streamId !== streamId) return;
			setCoHostList((prev) => {
				const byId = new Map(prev.map((c) => [c._id, c]));
				for (const c of p.coHosts ?? []) byId.set(c._id, c);
				return Array.from(byId.values());
			});
		};
		const onCoHostLeft = (p) => {
			if (p.streamId !== streamId) return;
			setCoHostList((prev) => prev.filter((c) => c._id !== p.coHostId));
			const role = roleRef.current;
			if (role.isHost) role.hostRemoveCoHost(p.coHostId);
			if (role.isCoHost) role.coHostRoom.removeCoHostStream(p.coHostId);
			if (role.activeIdentity && p.coHostId === role.activeIdentity.id) {
				setIsCoHost(false);
				setJoinRequestPending(false);
			}
		};
		socket.on("live:chat", onChat);
		socket.on("live:viewer-count", onViewerCount);
		socket.on("live:ended", onEnded);
		socket.on("live:reaction", onReaction);
		socket.on("live:comment-pinned", onPinned);
		socket.on("live:comment-unpinned", onUnpinned);
		socket.on("live:comment-deleted", onDeleted);
		socket.on("live:kicked", onKicked);
		socket.on("live:banned", onBanned);
		socket.on("live:chat-blocked", onChatBlocked);
		socket.on("live:time-warning", onTimeWarning);
		socket.on("live:payment-failed", onPaymentFailed);
		socket.on("live:join-request", onJoinRequest);
		socket.on("live:join-request-accepted", onJoinAccepted);
		socket.on("live:join-request-rejected", onJoinRejected);
		socket.on("live:co-host:joined", onCoHostJoined);
		socket.on("live:co-host:snapshot", onCoHostSnapshot);
		socket.on("live:co-host:left", onCoHostLeft);
		return () => {
			if (socket.connected) socket.emit("live:leave", { streamId });
			socket.off("connect", joinRoom);
			socket.off("live:chat", onChat);
			socket.off("live:viewer-count", onViewerCount);
			socket.off("live:ended", onEnded);
			socket.off("live:reaction", onReaction);
			socket.off("live:comment-pinned", onPinned);
			socket.off("live:comment-unpinned", onUnpinned);
			socket.off("live:comment-deleted", onDeleted);
			socket.off("live:kicked", onKicked);
			socket.off("live:banned", onBanned);
			socket.off("live:chat-blocked", onChatBlocked);
			socket.off("live:time-warning", onTimeWarning);
			socket.off("live:payment-failed", onPaymentFailed);
			socket.off("live:join-request", onJoinRequest);
			socket.off("live:join-request-accepted", onJoinAccepted);
			socket.off("live:join-request-rejected", onJoinRejected);
			socket.off("live:co-host:joined", onCoHostJoined);
			socket.off("live:co-host:snapshot", onCoHostSnapshot);
			socket.off("live:co-host:left", onCoHostLeft);
		};
	}, [streamId, navigate]);
	(0, import_react.useEffect)(() => {
		chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages.length]);
	const visibleMessages = messages.filter((m) => !blockedSet?.has(m.sender.username));
	function startReply(comment) {
		setReplyingTo(comment);
	}
	const paidConfirmSkipKey = `gihanga:paid-confirm-skip:${streamId}`;
	const shouldConfirmPaid = (kind) => {
		try {
			if (sessionStorage.getItem(paidConfirmSkipKey) === "1") return false;
		} catch {}
		return !paidConfirmDontAsk || paidConfirmOpen !== null ? true : kind !== paidConfirmOpen;
	};
	function emitChat(body) {
		const socket = getLiveSocket();
		if (!socket) return;
		const idempotencyKey = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
		const event = paidEnabled ? "live:paid-chat" : "live:chat";
		const payload = paidEnabled ? {
			streamId,
			body,
			idempotencyKey
		} : {
			streamId,
			body
		};
		const send = () => socket.emit(event, payload);
		if (socket.connected) send();
		else socket.once("connect", send);
	}
	function sendChat() {
		const body = draft.trim();
		if (!body || isOver) return;
		if (!getLiveSocket()) {
			toast.error("Sign in to join the live chat");
			return;
		}
		if (paidEnabled && commentPrice > 0 && shouldConfirmPaid("comment")) {
			setPaidConfirmOpen("comment");
			return;
		}
		emitChat((replyingTo ? `@${replyingTo.sender.username} ` : "") + body);
		setDraft("");
		setReplyingTo(null);
	}
	function emitReaction() {
		const socket = getLiveSocket();
		if (!socket) return;
		const idempotencyKey = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
		const event = paidEnabled ? "live:paid-react" : "live:react";
		const payload = paidEnabled ? {
			streamId,
			kind: "heart",
			idempotencyKey
		} : {
			streamId,
			kind: "heart"
		};
		socket.emit(event, payload);
	}
	function sendReaction() {
		if (isOver) return;
		if (!getLiveSocket()) {
			toast.error("Sign in to react to this live");
			return;
		}
		if (paidEnabled && reactionPrice > 0 && shouldConfirmPaid("reaction")) {
			setPaidConfirmOpen("reaction");
			return;
		}
		setReactionCount((n) => n + 1);
		setHeartBurst((n) => n + 1);
		emitReaction();
	}
	function confirmPaidInteraction() {
		const kind = paidConfirmOpen;
		setPaidConfirmOpen(null);
		if (paidConfirmDontAsk) try {
			sessionStorage.setItem(paidConfirmSkipKey, "1");
		} catch {}
		if (kind === "reaction") {
			setReactionCount((n) => n + 1);
			setHeartBurst((n) => n + 1);
			emitReaction();
		} else if (kind === "comment") {
			const body = draft.trim();
			if (!body) return;
			emitChat((replyingTo ? `@${replyingTo.sender.username} ` : "") + body);
			setDraft("");
			setReplyingTo(null);
		}
	}
	function toggleSound() {
		if (isHost) return;
		const next = !soundOn;
		setSoundOn(next);
		if (videoRef.current) {
			videoRef.current.muted = !next;
			videoRef.current.volume = 1;
			if (next) videoRef.current.play().catch(() => {
				toast.error("Couldn't enable sound — try tapping again");
			});
		}
		if (next) document.querySelectorAll("video[data-live-tile]").forEach((el) => {
			el.muted = false;
			el.volume = 1;
			el.play().catch(() => {});
		});
		else document.querySelectorAll("video[data-live-tile]").forEach((el) => {
			el.muted = true;
		});
	}
	function handleEnd() {
		endLive.mutate(streamId, {
			onSuccess: () => {
				toast.success("Stream ended");
				navigate({ to: "/live" });
			},
			onError: (error) => toast.error(error.message || "Couldn't end the stream")
		});
	}
	function handleGift(giftId) {
		sendGift.mutate(giftId, {
			onSuccess: (res) => {
				setGiftPickerOpen(false);
				toast.success(`Gift sent! ${res.remainingPoints} points left`);
			},
			onError: (err) => toast.error(err.message || "Couldn't send that gift")
		});
	}
	function shareStream() {
		const url = `${window.location.origin}/live/${streamId}`;
		if (navigator.share) navigator.share({
			url,
			...stream?.title ? { title: stream.title } : {}
		}).catch(() => {});
		else {
			navigator.clipboard?.writeText(url);
			toast.success("Link copied");
		}
	}
	function requestJoinLive() {
		if (!activeIdentity || isHost || isCoHost || isOver) return;
		const socket = getLiveSocket();
		if (!socket) {
			toast.error("Sign in to request to join");
			return;
		}
		setJoinRequestPending(true);
		socket.emit("live:join-request", { streamId });
		toast.info("Request sent to the host");
	}
	function acceptJoinRequest(requestorId, requestorSocketId) {
		const socket = getLiveSocket();
		if (!socket) return;
		socket.emit("live:accept-join-request", {
			streamId,
			viewerId: requestorId,
			viewerSocketId: requestorSocketId
		});
		setJoinRequests((prev) => prev.filter((r) => r.requestorId !== requestorId));
		toast.success("Co-host accepted!");
	}
	function rejectJoinRequest(requestorId) {
		const socket = getLiveSocket();
		if (!socket) return;
		socket.emit("live:reject-join-request", {
			streamId,
			viewerId: requestorId
		});
		setJoinRequests((prev) => prev.filter((r) => r.requestorId !== requestorId));
	}
	function leaveCoHost() {
		const socket = getLiveSocket();
		if (socket) socket.emit("live:co-host:leave", { streamId });
		setIsCoHost(false);
		setJoinRequestPending(false);
		toast.success("You left the live");
	}
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center bg-black",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-white/70",
			children: "Loading stream…"
		})
	});
	if (!stream) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black px-4 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-xl font-bold text-white",
			children: "Stream not found"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "brand",
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/live",
				children: "Back to live streams"
			})
		})]
	});
	const following = followingSet?.has(stream.host.username) ?? false;
	const reachedCap = Boolean(ended && /5-hour|maximum duration/i.test(ended));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 flex flex-col overflow-hidden bg-black lg:flex-row",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => navigate({ to: "/live" }),
				"aria-label": "Back to live streams",
				className: "press absolute top-3 left-3 z-20 grid size-9 place-items-center rounded-full bg-black/50 text-white backdrop-blur",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative w-full flex-1 bg-black lg:flex-none lg:basis-0 lg:grow-[3] lg:mr-1.5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative size-full",
					children: [
						isOver ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex size-full flex-col items-center justify-center gap-2 text-white/70",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoOff, { className: "size-10" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-semibold",
									children: ended || "This stream has ended"
								}),
								reachedCap && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "max-w-xs text-center text-sm text-white/60",
									children: "This stream reached the 5-hour limit"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "outline",
										className: "border-white/30 bg-white text-black hover:bg-white/90",
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/live",
											children: "Browse other streams"
										})
									}), reachedCap && isHost && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "brand",
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/live",
											children: "Start a new stream"
										})
									})]
								})
							]
						}) : browserError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex size-full flex-col items-center justify-center gap-2 p-6 text-center text-white/70",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoOff, { className: "size-8 text-danger" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm",
								children: browserError
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: hasCoHosts ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: cn("grid h-full w-full gap-1.5 bg-black p-1.5", liveGridTileCount === 2 ? "grid-cols-1 grid-rows-2 lg:grid-cols-2 lg:grid-rows-1" : liveGridTileCount === 3 ? "grid-cols-2 grid-rows-2 [&>*:first-child]:col-span-2" : "auto-rows-fr grid-cols-2"),
							children: [allCoHostStreams.map((cs) => {
								const coHostInfo = coHostList.find((c) => c._id === cs.participantId);
								const isHostTile = cs.participantId === stream.host._id;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveVideoTile, {
									stream: cs.stream,
									label: coHostInfo?.username ?? (isHostTile ? stream.host.username : void 0),
									muted: !soundOn,
									dataSaver: dataSaver && !isHost && !isCoHost
								}, cs.participantId);
							}), (isHost || isCoHost) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative min-h-0 overflow-hidden rounded-2xl bg-black/40",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
										ref: setVideoRef,
										autoPlay: true,
										muted: true,
										playsInline: true,
										"data-live-tile": "self",
										className: "absolute inset-0 size-full object-cover"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "absolute bottom-2 left-2 z-10 rounded-md bg-black/60 px-2 py-0.5 text-xs font-bold text-white backdrop-blur",
										children: "You"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoStatusOverlay, {
										health: mainVideoHealth,
										role: isHost ? "host" : "co-host"
									})
								]
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
							ref: setVideoRef,
							autoPlay: true,
							muted: true,
							playsInline: true,
							onClick: () => !isHost && !isCoHost && !soundOn && toggleSound(),
							className: cn("absolute inset-0 size-full object-cover", dataSaver && !isHost && !isCoHost && "inset-1/4 size-1/2 object-contain")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoStatusOverlay, {
							health: mainVideoHealth,
							role: isHost ? "host" : isCoHost ? "co-host" : "viewer"
						})] }) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FloatingHearts, { burst: heartBurst }),
						!isOver && !browserError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectionQualityBanner, {
							samples: isHost || isCoHost ? publisherQuality : viewerRoom.qualitySamples,
							variant: isHost || isCoHost ? "broadcaster" : "viewer",
							escalated: mainVideoHealth.state === "disconnected" || mainVideoHealth.state === "reconnecting"
						}),
						isHost && !isOver && joinRequests[0] && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JoinRequestDialog, {
							request: joinRequests[0],
							onAccept: acceptJoinRequest,
							onReject: rejectJoinRequest
						}),
						!isOver && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute top-3 left-14 z-10 flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1.5 rounded-lg bg-danger px-2.5 py-1 text-xs font-bold text-white animate-pulse",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-3" }), " LIVE"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1 rounded-lg bg-black/60 px-2.5 py-1 text-xs font-bold text-white",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-3" }),
										" ",
										formatCount(viewerCount)
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1 rounded-lg bg-black/60 px-2.5 py-1 text-xs font-bold text-white",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-3 fill-danger text-danger" }),
										" ",
										formatCount(reactionCount)
									]
								}),
								stream.totalGifts > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1 rounded-lg bg-amber-500/90 px-2.5 py-1 text-xs font-bold text-black",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gift, { className: "size-3" }),
										" ",
										formatCount(stream.totalGifts),
										" pts"
									]
								}),
								isHost && remainingLabel && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: cn("flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold text-white", remainingMs != null && remainingMs < 3e5 ? "bg-danger animate-pulse" : "bg-black/60"),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Timer, { className: "size-3" }),
										" ",
										remainingLabel
									]
								}),
								!isHost && timeWarning != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "rounded-lg bg-black/60 px-2.5 py-1 text-xs font-bold text-white/80",
									children: [timeWarning, " min left"]
								})
							]
						}),
						!isHost && !isCoHost && !isOver && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute top-3 right-3 z-20 flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "icon",
								variant: dataSaver ? "brand" : "secondary",
								className: "rounded-full",
								onClick: () => setDataSaver((v) => !v),
								"aria-pressed": dataSaver,
								"aria-label": dataSaver ? "Disable data saver" : "Enable data saver",
								title: dataSaver ? "Data saver on — tap for full quality" : "Data saver — use less data",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Timer, { className: "size-4" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "icon",
								variant: "secondary",
								className: "rounded-full",
								onClick: toggleSound,
								"aria-label": soundOn ? "Mute live audio" : "Turn on live audio",
								"aria-pressed": soundOn,
								children: soundOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" })
							})]
						}),
						isHost && !isOver && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute top-16 right-3 z-20 flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "icon",
									variant: "secondary",
									className: "rounded-full",
									onClick: toggleMic,
									children: micOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MicOff, { className: "size-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "icon",
									variant: "secondary",
									className: "rounded-full",
									onClick: toggleCamera,
									children: camOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoOff, { className: "size-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "icon",
									variant: "secondary",
									className: "rounded-full",
									onClick: switchCamera,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchCamera, { className: "size-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "destructive",
									size: "sm",
									onClick: handleEnd,
									disabled: endLive.isPending,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }),
										" ",
										endLive.isPending ? "Ending…" : "End stream"
									]
								})
							]
						}),
						isCoHost && !isOver && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute top-16 right-3 z-20 flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "icon",
									variant: "secondary",
									className: "rounded-full",
									onClick: coHostRoom.toggleMic,
									children: coHostRoom.micOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MicOff, { className: "size-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "icon",
									variant: "secondary",
									className: "rounded-full",
									onClick: coHostRoom.toggleCamera,
									children: coHostRoom.camOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoOff, { className: "size-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "icon",
									variant: "secondary",
									className: "rounded-full",
									onClick: coHostRoom.flipCamera,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchCamera, { className: "size-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "destructive",
									size: "sm",
									onClick: leaveCoHost,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhoneOff, { className: "size-4" }), " Leave"]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-x-0 bottom-0 z-[5] bg-gradient-to-t from-black/40 via-black/15 to-transparent h-28 lg:hidden" })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-x-0 bottom-0 z-10 flex max-h-[36vh] flex-col lg:pointer-events-auto lg:static lg:h-full lg:max-h-none lg:w-[360px] lg:shrink-0 lg:border-l lg:border-white/10 lg:bg-black",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("pointer-events-auto flex flex-col lg:h-full lg:max-h-none lg:rounded-none lg:bg-transparent", chatCollapsed ? "max-h-none bg-transparent" : "max-h-[36vh] bg-gradient-to-t from-black/60 via-black/20 to-transparent"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
							className: "hidden border-b border-white/10 p-3 lg:flex lg:items-center lg:gap-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-bold text-white",
								children: "Live chat"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2.5 px-3 py-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/profile/$username",
									params: { username: stream.host.username },
									className: "shrink-0",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GAvatar, {
										user: toDisplayUser(stream.host),
										size: "md"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex items-center gap-1.5",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserName, {
											user: toDisplayUser(stream.host),
											className: "min-w-0 truncate text-white [&>span]:text-white"
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-sm text-white/70",
										children: stream.title
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "hidden items-center gap-1 lg:flex",
									children: [!isHost && !isOver && stream.giftsEnabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "brand",
										size: "sm",
										onClick: () => setGiftPickerOpen((v) => !v),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gift, { className: "size-4" }), " Gift"]
									}), !isHost && !isCoHost && !isOver && activeIdentity && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "brand",
										size: "sm",
										onClick: requestJoinLive,
										disabled: joinRequestPending,
										children: joinRequestPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-4 animate-pulse" }), " Requesting…"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogIn, { className: "size-4" }), " Join"] })
									})]
								}),
								!isHost && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: following ? "soft" : "default",
									size: "sm",
									className: "shrink-0",
									onClick: () => followUser.mutate({
										username: stream.host.username,
										follow: !following
									}),
									children: following ? "Following" : "Follow"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "icon-sm",
										"aria-label": "More options",
										className: "shrink-0 text-white hover:bg-white/15 hover:text-white",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EllipsisVertical, { className: "size-4" })
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
									align: "end",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
											onClick: shareStream,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-4" }), " Share live"]
										}),
										isHost && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
											onClick: () => setAddModOpen(true),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "size-4" }), " Add moderator"]
										}),
										isHost && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
											onClick: () => inviteFollowers.mutate(void 0, {
												onSuccess: (r) => toast.success(`Invited ${r.invited} followers`),
												onError: (err) => toast.error(err.message || "Couldn't send invites")
											}),
											disabled: inviteFollowers.isPending,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" }), " Invite followers"]
										}),
										isHost && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
											onClick: () => {
												updateSettings.mutate({ giftsEnabled: !stream.giftsEnabled }, { onSuccess: () => toast.success(stream.giftsEnabled ? "Gifts disabled for this stream" : "Gifts enabled") });
											},
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { className: "size-4" }),
												" ",
												stream.giftsEnabled ? "Disable gifts" : "Enable gifts"
											]
										}),
										isHost && isStaffHost && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
											onClick: () => {
												updateSettings.mutate({ paidInteractions: { enabled: !stream.paidInteractions?.enabled } }, { onSuccess: () => toast.success(stream.paidInteractions?.enabled ? "Paid interactions disabled" : `Paid interactions enabled — ❤ ${paid?.reactionPrice ?? 1} pts, comments ${paid?.commentPrice ?? 5} pts`) });
											},
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "size-4" }),
												" ",
												stream.paidInteractions?.enabled ? "Disable paid interactions" : "Enable paid interactions"
											]
										}),
										!isHost && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
											className: "text-danger",
											onClick: () => setReportOpen(true),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flag, { className: "size-4" }), " Report live"]
										})] })
									]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setChatCollapsed((v) => !v),
									"aria-label": chatCollapsed ? "Expand live chat" : "Collapse live chat",
									"aria-expanded": !chatCollapsed,
									className: "press grid size-8 shrink-0 place-items-center rounded-full bg-black/40 text-white lg:hidden",
									children: chatCollapsed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-4" })
								})
							]
						}),
						pinned && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: cn("items-start gap-2 border-b border-white/10 bg-primary/20 p-2.5 text-xs lg:flex", chatCollapsed ? "hidden lg:flex" : "flex"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pin, { className: "mt-0.5 size-3.5 shrink-0 text-primary" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "min-w-0 flex-1 leading-snug",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-bold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]",
											children: pinned.sender.username
										}),
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-white/80 [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]",
											children: pinned.body
										})
									]
								}),
								canModerate && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => getLiveSocket()?.emit("live:unpin-comment", {
										streamId,
										commentId: pinned._id
									}),
									className: "shrink-0 text-white/60 hover:text-white",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: cn("min-h-0 flex-1 space-y-2.5 overflow-y-auto p-3", chatCollapsed ? "hidden lg:block" : "block"),
							children: [
								visibleMessages.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "py-6 text-center text-xs text-white/60 [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]",
									children: "Say hello 👋"
								}),
								visibleMessages.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "group flex items-start gap-2 text-sm",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GAvatar, {
											user: toDisplayUser(m.sender),
											size: "xs"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "min-w-0 flex-1 leading-snug break-words [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-bold text-white",
													children: m.sender.username
												}),
												" ",
												m.isGift ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-semibold text-amber-400",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "inline size-3.5 fill-amber-400" }),
														" ",
														m.body
													]
												}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-white/90",
													children: m.body
												})
											]
										}),
										(canModerate || m.sender.username !== activeIdentity?.username) && !m.isGift && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
											asChild: true,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												"aria-label": "Message options",
												className: "shrink-0 rounded p-0.5 text-white/60 opacity-0 group-hover:opacity-100 hover:text-white",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EllipsisVertical, { className: "size-3.5" })
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
											align: "end",
											className: "w-44",
											children: [
												canModerate && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
													onClick: () => startReply(m),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reply, { className: "size-3.5" }), " Reply"]
												}),
												canModerate && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
														onClick: () => getLiveSocket()?.emit("live:pin-comment", {
															streamId,
															commentId: m._id
														}),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pin, { className: "size-3.5" }), " Pin"]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
														className: "text-danger",
														onClick: () => getLiveSocket()?.emit("live:delete-comment", {
															streamId,
															commentId: m._id
														}),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" }), " Delete"]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
														onClick: () => muteViewer.mutate(m.sender._id, { onSuccess: (r) => toast.success(r.muted ? `Muted @${m.sender.username}` : `Unmuted @${m.sender.username}`) }),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldOff, { className: "size-3.5" }), " Mute"]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
														className: "text-danger",
														onClick: () => banViewer.mutate(m.sender._id, { onSuccess: (r) => toast.success(r.banned ? `Banned @${m.sender.username}` : `Unbanned @${m.sender.username}`) }),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldBan, { className: "size-3.5" }), " Ban"]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {})
												] }),
												m.sender.username !== activeIdentity?.username && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
													onClick: () => toggleBlock.mutate({
														username: m.sender.username,
														block: !blockedSet?.has(m.sender.username)
													}, { onSuccess: () => toast.success(`Blocked @${m.sender.username}`) }),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserMinus, { className: "size-3.5" }), " Block user"]
												})
											]
										})] })
									]
								}, m._id)),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: chatEndRef })
							]
						}),
						giftPickerOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-4 gap-2 border-t border-white/10 bg-black/40 p-3 backdrop-blur-sm",
							children: GIFT_CATALOG.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => handleGift(g.id),
								disabled: sendGift.isPending || (walletData?.wallet.kingdomPoints ?? 0) < g.cost,
								className: "press flex flex-col items-center gap-1 rounded-xl border border-white/20 bg-black/30 p-3 text-white hover:bg-white/10 disabled:opacity-40",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-2xl",
									children: g.emoji
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs font-bold",
									children: [g.cost, " pts"]
								})]
							}, g.id))
						}),
						isHost && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "pointer-events-auto",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HostEarnings, {
								streamId,
								isOver,
								asStaff
							})
						}),
						!isOver && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1.5 border-t border-white/10 p-2.5",
							children: [
								replyingTo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex w-full items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-[11px] text-white/80",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reply, { className: "size-3 shrink-0" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Replying to ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: ["@", replyingTo.sender.username] })] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setReplyingTo(null),
											className: "ml-auto shrink-0 text-white/60 hover:text-white",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3" })
										})
									]
								}),
								!replyingTo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									paidEnabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex w-full items-center justify-between gap-2 rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white/80",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "size-3 text-amber-400" }), insufficientPoints ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-danger",
												children: [
													"Not enough points (",
													walletPoints,
													"/",
													commentPrice,
													") —",
													" ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
														to: "/wallet",
														className: "underline",
														children: "Top up"
													})
												]
											}) : `${walletPoints} pts`]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
											"❤ ",
											reactionPrice,
											" pts · comment ",
											commentPrice,
											" pts"
										] })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: draft,
										onChange: (e) => {
											setDraft(e.target.value);
											setInsufficientPoints(false);
										},
										onKeyDown: (e) => e.key === "Enter" && sendChat(),
										placeholder: paidEnabled ? `Comment · ${commentPrice} pts` : "Send a message…",
										className: "h-9 min-w-0 flex-1 rounded-full border border-white/20 bg-white/10 px-3 text-sm text-white placeholder:text-white/50 outline-none focus:border-white/40"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex shrink-0 items-center gap-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "icon",
												variant: "brand",
												onClick: sendChat,
												disabled: !draft.trim(),
												className: "shrink-0",
												"aria-label": "Send message",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" })
											}),
											!isHost && !isOver && stream.giftsEnabled && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "ghost",
												size: "icon",
												className: "shrink-0 text-white hover:bg-white/15 lg:hidden",
												onClick: () => setGiftPickerOpen((v) => !v),
												"aria-label": "Send gift",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gift, { className: "size-4" })
											}),
											!isHost && !isCoHost && !isOver && activeIdentity && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "ghost",
												size: "icon",
												className: "shrink-0 text-white hover:bg-white/15 lg:hidden",
												onClick: requestJoinLive,
												disabled: joinRequestPending,
												"aria-label": "Request to join live",
												children: joinRequestPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-4 animate-pulse" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogIn, { className: "size-4" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												onClick: sendReaction,
												"aria-label": paidEnabled ? `Send a like (${reactionPrice} points)` : "Send a like",
												className: "press flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-3 text-white size-9 justify-center",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-4" }), paidEnabled && reactionPrice > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-[10px] font-extrabold",
													children: reactionPrice
												})]
											})
										]
									})
								] }),
								replyingTo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: draft,
									onChange: (e) => setDraft(e.target.value),
									onKeyDown: (e) => e.key === "Enter" && sendChat(),
									placeholder: paidEnabled ? `Reply · ${commentPrice} pts` : "",
									autoFocus: true,
									className: "h-9 min-w-0 flex-1 rounded-full border border-white/20 bg-white/10 px-3 text-sm text-white placeholder:text-white/50 outline-none focus:border-white/40"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "icon",
									variant: "brand",
									onClick: sendChat,
									disabled: !draft.trim(),
									className: "shrink-0",
									"aria-label": "Send reply",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" })
								})] })
							]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: paidConfirmOpen !== null,
				onOpenChange: (v) => !v && setPaidConfirmOpen(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[360px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: paidConfirmOpen === "reaction" ? "Send a paid like?" : "Send a paid comment?" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3 px-1 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-muted-foreground",
								children: [
									"Paid interactions cost Kingdom Points which go to the host.",
									" ",
									paidConfirmOpen === "reaction" ? `Each like costs ${reactionPrice} point${reactionPrice === 1 ? "" : "s"}.` : `Each comment costs ${commentPrice} point${commentPrice === 1 ? "" : "s"}.`,
									" ",
									"Your balance: ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", {
										className: "text-foreground",
										children: [walletPoints, " pts"]
									}),
									"."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center gap-2 text-xs text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: paidConfirmDontAsk,
									onChange: (e) => setPaidConfirmDontAsk(e.target.checked),
									className: "size-4 accent-primary"
								}), "Don't ask again for this stream"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									className: "flex-1",
									onClick: () => setPaidConfirmOpen(null),
									children: "Cancel"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "brand",
									className: "flex-1",
									disabled: walletPoints < (paidConfirmOpen === "reaction" ? reactionPrice : commentPrice),
									onClick: confirmPaidInteraction,
									children: paidConfirmOpen === "reaction" ? `Like · ${reactionPrice} pts` : `Send · ${commentPrice} pts`
								})]
							}),
							walletPoints < (paidConfirmOpen === "reaction" ? reactionPrice : commentPrice) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-danger",
								children: [
									"Not enough Kingdom Points —",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/wallet",
										className: "underline",
										children: "top up your wallet"
									})
								]
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportDialog, {
				streamId,
				open: reportOpen,
				onOpenChange: setReportOpen
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddModeratorDialog, {
				streamId,
				asStaff,
				open: addModOpen,
				onOpenChange: setAddModOpen
			})
		]
	});
}
function HostEarnings({ streamId, isOver, asStaff }) {
	const { data } = useLiveEarnings(streamId, true, asStaff);
	if (!data) return null;
	const paid = data.paidInteractions;
	const paidTotal = paid ? paid.likePoints + paid.commentPoints + paid.reactionPoints : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border-t border-border px-4 py-2.5 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "size-4 text-success" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-bold text-success",
					children: [formatCount(data.totalPoints), " points"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-muted-foreground",
					children: [
						"earned from ",
						data.giftCount,
						" gifts",
						isOver ? " this stream" : " so far"
					]
				})
			]
		}), paid && paidTotal > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-1 text-xs text-muted-foreground",
			children: [
				"Paid interactions: ",
				formatCount(paidTotal),
				" pts — ",
				paid.likeCount,
				" likes,",
				" ",
				paid.commentCount,
				" comments, ",
				paid.reactionCount,
				" reactions"
			]
		})]
	});
}
//#endregion
export { LiveRoomPage as component };
