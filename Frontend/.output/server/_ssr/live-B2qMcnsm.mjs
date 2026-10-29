import { o as __toESM } from "../_runtime.mjs";
import { r as cn, t as Button } from "./button-CJVUuoS8.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { P as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { b as Link, g as Outlet, p as useRouterState, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { Ct as MicOff, P as SwitchCamera, Pt as Lock, Qt as Gift, St as Mic, d as Video, en as Flame, et as Search, f as VideoOff, lt as Play, p as Users, st as Radio } from "../_libs/lucide-react.mjs";
import { E as formatCount, Gt as DialogContent, Ht as Textarea, Jt as DialogHeader, Ut as useIsMobile, Wt as Dialog, Yt as DialogTitle, ft as useCameraPreview, h as Input, jt as useLiveStreams, p as GAvatar, t as AppShell, ut as MobileGoLive, zt as useStartLive } from "./router-CrddKQ7E.mjs";
import { l as useAuth, n as getLiveSocket } from "./auth-context-CuF8V2_l.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as useBrowserLiveRoom } from "./live-room-CYTaF0RZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/live-B2qMcnsm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function toDisplayUser(host) {
	return {
		id: host._id,
		name: host.name,
		username: host.username,
		bio: "",
		avatarHue: host.avatarHue,
		avatarUrl: host.avatarUrl,
		verified: host.verified,
		creator: host.isCreator,
		followers: host.followersCount,
		following: 0,
		posts: 0
	};
}
function LiveVideoPreview({ stream, enabled, asStaff, isOwnStream }) {
	const videoRef = (0, import_react.useRef)(null);
	const { localStream, remoteStream, connected, error: roomError } = useBrowserLiveRoom({
		streamId: stream._id,
		publish: isOwnStream,
		enabled,
		hostId: stream.host._id
	});
	const previewStream = isOwnStream ? localStream : remoteStream;
	const setVideoRef = (node) => {
		videoRef.current = node;
		if (node) node.srcObject = previewStream ?? null;
	};
	(0, import_react.useEffect)(() => {
		if (videoRef.current) videoRef.current.srcObject = previewStream ?? null;
		if (previewStream) videoRef.current?.play().catch(() => {});
	}, [previewStream]);
	(0, import_react.useEffect)(() => {
		if (!enabled) return;
		const socket = getLiveSocket();
		if (!socket) return;
		socket.emit("live:join", { streamId: stream._id });
		return () => {
			socket.emit("live:leave", { streamId: stream._id });
		};
	}, [enabled, stream._id]);
	const hasVideo = Boolean(previewStream?.getVideoTracks().length);
	const status = isOwnStream ? "This is your live — open it to manage and preview your broadcast" : !enabled ? "Sign in to watch this live video" : roomError ? `Live video unavailable: ${roomError}` : !connected ? "Connecting to the live camera…" : !hasVideo ? "Waiting for the host's video…" : "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: hasVideo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
		ref: setVideoRef,
		autoPlay: true,
		muted: true,
		playsInline: true,
		className: "size-full object-contain"
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex size-full flex-col items-center justify-center gap-3 text-white/80",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GAvatar, {
			user: toDisplayUser(stream.host),
			size: "xl"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-semibold",
			children: status
		})]
	}) });
}
function GoLiveDialog({ open, onOpenChange, asStaff }) {
	const navigate = useNavigate();
	const isMobile = useIsMobile();
	const startLive = useStartLive(asStaff);
	const [step, setStep] = (0, import_react.useState)("details");
	const [title, setTitle] = (0, import_react.useState)("");
	const [description, setDescription] = (0, import_react.useState)("");
	const [subsOnly, setSubsOnly] = (0, import_react.useState)(false);
	const videoRef = (0, import_react.useRef)(null);
	const { stream, error, micOn, camOn, cameraDeviceId, facing, toggleMic, toggleCam, flipCamera } = useCameraPreview(step === "preview");
	const setVideoRef = (node) => {
		videoRef.current = node;
		if (node && stream) node.srcObject = stream;
	};
	(0, import_react.useEffect)(() => {
		if (videoRef.current && stream) videoRef.current.srcObject = stream;
	}, [stream]);
	function reset() {
		setStep("details");
		setTitle("");
		setDescription("");
		setSubsOnly(false);
	}
	function goToPreview() {
		if (!title.trim()) {
			toast.error("Give your stream a title");
			return;
		}
		setStep("preview");
	}
	function goLive() {
		try {
			const videoTrack = stream?.getVideoTracks()[0];
			sessionStorage.setItem("gihanga_live_camera_preference", JSON.stringify({
				deviceId: cameraDeviceId,
				facingMode: videoTrack?.getSettings().facingMode ?? facing
			}));
		} catch {}
		startLive.mutate({
			title: title.trim(),
			description: description.trim() || void 0,
			subsOnly,
			giftsEnabled: true
		}, {
			onSuccess: (data) => {
				onOpenChange(false);
				reset();
				navigate({
					to: "/live/$streamId",
					params: { streamId: data.stream._id }
				});
			},
			onError: (err) => toast.error(err.message || "Couldn't start your stream")
		});
	}
	if (isMobile) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MobileGoLive, {
		open,
		onClose: () => onOpenChange(false),
		asStaff
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: (v) => {
			onOpenChange(v);
			if (!v) reset();
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-[440px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: step === "details" ? "Go live" : "Preview your camera" }) }), step === "details" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 px-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						value: title,
						onChange: (e) => setTitle(e.target.value),
						placeholder: "What are you streaming today?",
						maxLength: 200,
						className: "min-h-16 resize-none"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						value: description,
						onChange: (e) => setDescription(e.target.value),
						placeholder: "Add a description (optional)",
						maxLength: 1e3,
						className: "min-h-16 resize-none"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setSubsOnly((v) => !v),
						className: cn("flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-left text-sm font-semibold", subsOnly ? "border-primary bg-primary-soft text-primary" : "border-border text-muted-foreground"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-4" }), "Followers-only stream"]
					}),
					asStaff && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rounded-xl bg-primary-soft px-3.5 py-2.5 text-xs font-semibold text-primary",
						children: "Paid interactions are on for your stream: viewers spend Kingdom Points to like, comment and react, and you earn from each. You can adjust prices while live."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "brand",
						size: "lg",
						onClick: goToPreview,
						children: "Continue"
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 px-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative aspect-video overflow-hidden rounded-2xl bg-black",
						children: [error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex size-full items-center justify-center p-4 text-center text-sm text-white/70",
							children: error
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
							ref: setVideoRef,
							autoPlay: true,
							muted: true,
							playsInline: true,
							className: "size-full object-contain"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute inset-x-0 bottom-3 flex items-center justify-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "icon",
									variant: micOn ? "secondary" : "destructive",
									onClick: toggleMic,
									className: "rounded-full",
									children: micOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MicOff, { className: "size-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "icon",
									variant: camOn ? "secondary" : "destructive",
									onClick: toggleCam,
									className: "rounded-full",
									children: camOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoOff, { className: "size-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "icon",
									variant: "secondary",
									onClick: flipCamera,
									className: "rounded-full",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchCamera, { className: "size-4" })
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							className: "flex-1",
							onClick: () => setStep("details"),
							children: "Back"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "brand",
							className: "flex-1",
							onClick: goLive,
							disabled: startLive.isPending || !stream,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-4" }), startLive.isPending ? "Starting…" : "Start streaming"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-center text-xs text-muted-foreground",
						children: "We'll ask for camera and microphone access."
					})
				]
			})]
		})
	});
}
function LiveDiscoveryPage() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const isChildRoute = pathname.startsWith("/live/") && pathname !== "/live";
	const { user, staffUser } = useAuth();
	const navigate = useNavigate();
	const [searchQuery, setSearchQuery] = (0, import_react.useState)("");
	const [goLiveOpen, setGoLiveOpen] = (0, import_react.useState)(false);
	const { data, isLoading } = useLiveStreams();
	if (isChildRoute) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {});
	const canGoLive = Boolean(user?.isCreator || staffUser);
	const asStaff = !user && Boolean(staffUser);
	const streams = data?.streams ?? [];
	const activeIdentity = user ?? staffUser;
	const activeOwnStream = streams.find((candidate) => candidate.host.username === activeIdentity?.username);
	const visible = streams.filter((s) => !searchQuery || s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.host.name.toLowerCase().includes(searchQuery.toLowerCase()));
	const featured = visible[0];
	const rest = visible.slice(1);
	const featuredIsOwnStream = Boolean(featured && activeOwnStream?._id === featured._id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-[900px] space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl font-extrabold tracking-tight",
					children: "Live Streams"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 text-sm text-muted-foreground",
					children: "What's happening right now on Gihanga Updates"
				})] }), canGoLive && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "brand",
					onClick: () => activeOwnStream ? navigate({
						to: "/live/$streamId",
						params: { streamId: activeOwnStream._id }
					}) : setGoLiveOpen(true),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-4" }),
						" ",
						activeOwnStream ? "Manage live" : "Go Live"
					]
				})]
			}),
			isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "py-10 text-center text-sm text-muted-foreground",
				children: "Loading live streams…"
			}),
			!isLoading && !streams.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface-card flex flex-col items-center gap-2 py-16 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-8 text-muted-foreground" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-bold text-muted-foreground",
						children: "No one is live right now"
					}),
					canGoLive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "brand",
						size: "sm",
						onClick: () => activeOwnStream ? navigate({
							to: "/live/$streamId",
							params: { streamId: activeOwnStream._id }
						}) : setGoLiveOpen(true),
						children: activeOwnStream ? "Manage your live stream" : "Be the first to go live"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Check back soon, or follow creators to get notified."
					})
				]
			}),
			featured && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/live/$streamId",
				params: { streamId: featured._id },
				className: "surface-card group block cursor-pointer overflow-hidden p-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex aspect-video w-full items-center justify-center overflow-hidden bg-black",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveVideoPreview, {
							stream: featured,
							enabled: Boolean(activeIdentity),
							asStaff,
							isOwnStream: featuredIsOwnStream
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute top-3 left-3 flex items-center gap-2",
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
										formatCount(featured.viewerCount),
										" watching"
									]
								}),
								featured.totalGifts > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1 rounded-lg bg-amber-500/90 px-2.5 py-1 text-xs font-bold text-black",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gift, { className: "size-3" }),
										" ",
										formatCount(featured.totalGifts),
										" pts"
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute inset-x-0 bottom-0 flex items-end justify-between p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex items-center gap-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm leading-tight font-bold text-white",
									children: featured.host.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-0.5 text-xs text-white/70",
									children: ["@", featured.host.username]
								})] })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-white px-3 text-sm font-bold text-black transition-colors group-hover:bg-white/90",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-3.5 fill-black" }),
									" ",
									featuredIsOwnStream ? "Manage live" : "Watch Live"
								]
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-lg leading-snug font-bold",
						children: featured.title
					})
				})]
			}),
			streams.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 rounded-2xl border border-border bg-surface px-3.5 py-2.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4 shrink-0 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: searchQuery,
					onChange: (e) => setSearchQuery(e.target.value),
					placeholder: "Search live streams or creators…",
					className: "h-auto border-0 bg-transparent p-0 text-sm focus-visible:ring-0"
				})]
			}),
			rest.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
				children: rest.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "surface-card group overflow-hidden p-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/live/$streamId",
						params: { streamId: s._id },
						className: "block",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative flex aspect-video items-center justify-center overflow-hidden bg-black",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GAvatar, {
									user: toDisplayUser(s.host),
									size: "lg"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "absolute top-2 left-2 flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-1 rounded-md bg-danger px-1.5 py-0.5 text-[10px] font-bold text-white",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-2.5 animate-pulse" }), " LIVE"]
									}), s.subsOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-1 rounded-md bg-amber-500/90 px-1.5 py-0.5 text-[10px] font-bold text-black",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-2.5" }), " Followers only"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "absolute right-2 bottom-2 flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-2.5" }),
										" ",
										formatCount(s.viewerCount)
									]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-2 flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GAvatar, {
										user: toDisplayUser(s.host),
										size: "xs"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "truncate text-xs font-semibold",
											children: s.host.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "truncate text-[10px] text-muted-foreground",
											children: ["@", s.host.username]
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "line-clamp-2 text-sm leading-snug font-bold",
									children: s.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-1 text-[10px] text-muted-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gift, { className: "size-3 text-amber-400" }),
											" ",
											formatCount(s.totalGifts),
											" pts"
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex h-7 items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-[11px] font-bold text-primary-foreground transition-colors group-hover:bg-primary/90",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-3 fill-current" }), " Join"]
									})]
								})
							]
						})]
					})
				}, s._id))
			}),
			canGoLive && streams.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface-card flex flex-wrap items-center gap-4 p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, { className: "size-8 shrink-0 text-primary" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-bold",
							children: "Ready to go live?"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Share your moment with your followers in real time."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "brand",
						size: "sm",
						onClick: () => activeOwnStream ? navigate({
							to: "/live/$streamId",
							params: { streamId: activeOwnStream._id }
						}) : setGoLiveOpen(true),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-4" }),
							" ",
							activeOwnStream ? "Manage live" : "Go Live"
						]
					})
				]
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoLiveDialog, {
		open: goLiveOpen,
		onOpenChange: setGoLiveOpen,
		asStaff
	})] });
}
//#endregion
export { GoLiveDialog, LiveDiscoveryPage as component };
