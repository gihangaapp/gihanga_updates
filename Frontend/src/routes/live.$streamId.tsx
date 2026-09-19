import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Coins,
  DollarSign,
  Flag,
  Gift,
  Heart,
  LogIn,
  Mic,
  MicOff,
  MoreVertical,
  PhoneOff,
  Pin,
  Radio,
  Send,
  Settings2,
  Share2,
  ShieldBan,
  ShieldOff,
  SwitchCamera,
  Timer,
  Trash2,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  Reply,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { GAvatar, UserName } from "@/components/common/GAvatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import { formatCount } from "@/lib/format";
import {
  useLiveStream,
  useLiveChatHistory,
  useEndLive,
  useLiveHeartbeat,
  useSendGift,
  useMyWallet,
  useAddModerator,
  useMuteViewer,
  useBanViewer,
  useLiveEarnings,
  useReportLive,
  useUpdateLiveSettings,
  useInviteFollowers,
  GIFT_CATALOG,
  type LiveChatEntry,
  type LiveStreamData,
} from "@/hooks/use-live";
import { useFollowUser, useFollowingSet } from "@/hooks/use-social";
import { useToggleBlock, useBlockedSet } from "@/hooks/use-blocks";
import {
  useBrowserLiveRoom,
  useCoHostLiveRoom,
  useHostCoHostMesh,
  useViewerStreams,
  VIEWER_GRID_AVAILABLE,
  type CoHostRemoteStream,
} from "@/lib/live-room";
import { getLiveSocket } from "@/lib/socket-client";
import { useLiveVideoHealth } from "@/hooks/use-live-video-health";
import { VideoStatusOverlay, ConnectionQualityBanner } from "@/components/live/LiveOverlays";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/live/$streamId")({
  head: () => ({
    meta: [
      { title: "Live — Gihanga Updates" },
      { name: "description", content: "Watch a live stream on Gihanga Updates." },
    ],
  }),
  component: LiveRoomPage,
});

type Author = {
  _id: string;
  name: string;
  username: string;
  avatarHue: number;
  avatarUrl: string | null;
  verified: boolean;
  isCreator: boolean;
};

function toDisplayUser(u: Author) {
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
    posts: 0,
  };
}

function FloatingHearts({ burst }: { burst: number }) {
  const [hearts, setHearts] = useState<number[]>([]);
  useEffect(() => {
    if (!burst) return;
    const id = Date.now() + Math.random();
    setHearts((h) => [...h, id]);
    const t = window.setTimeout(() => setHearts((h) => h.filter((x) => x !== id)), 1800);
    return () => window.clearTimeout(t);
  }, [burst]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {hearts.map((id, i) => (
        <Heart
          key={id}
          className="absolute right-6 bottom-16 size-6 fill-danger text-danger opacity-90"
          style={{
            animation: "float-up 1.8s ease-out forwards",
            animationDelay: `${(i % 3) * 80}ms`,
          }}
        />
      ))}
      <style>{`@keyframes float-up { 0% { transform: translateY(0) translateX(0); opacity: 1; } 100% { transform: translateY(-180px) translateX(${Math.random() > 0.5 ? "-" : ""}30px); opacity: 0; } }`}</style>
    </div>
  );
}

function ReportDialog({
  streamId,
  open,
  onOpenChange,
}: {
  streamId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const reportLive = useReportLive(streamId);
  const [reason, setReason] = useState("Harassment");
  const reasons = ["Harassment", "Spam", "Nudity", "Misinformation", "Violence", "Other"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle>Report this live stream</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2 px-1">
          {reasons.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setReason(r)}
              className={cn(
                "rounded-xl border px-3.5 py-2.5 text-left text-sm font-semibold",
                reason === r
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border text-muted-foreground",
              )}
            >
              {r}
            </button>
          ))}
          <Button
            variant="destructive"
            className="mt-2"
            onClick={() =>
              reportLive.mutate(
                { reason },
                {
                  onSuccess: () => {
                    onOpenChange(false);
                    toast.success("Report submitted — our team will review it");
                  },
                },
              )
            }
          >
            Submit report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AddModeratorDialog({
  streamId,
  asStaff,
  open,
  onOpenChange,
}: {
  streamId: string;
  asStaff: boolean;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const addMod = useAddModerator(streamId, asStaff);
  const [username, setUsername] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[360px]">
        <DialogHeader>
          <DialogTitle>Add a moderator</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 px-1">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            className="h-10 flex-1 rounded-xl border border-border bg-elevated px-3.5 text-sm outline-none focus:border-ring"
          />
          <Button
            variant="brand"
            onClick={() =>
              addMod.mutate(username.trim(), {
                onSuccess: () => {
                  toast.success(`@${username} can now moderate this stream`);
                  setUsername("");
                  onOpenChange(false);
                },
                onError: (err: Error) => toast.error(err.message || "Couldn't add moderator"),
              })
            }
            disabled={!username.trim() || addMod.isPending}
          >
            Add
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function JoinRequestDialog({
  request,
  onAccept,
  onReject,
}: {
  request: { requestorId: string; requestorSocketId: string; requestor: Author } | null;
  onAccept: (requestorId: string, requestorSocketId: string) => void;
  onReject: (requestorId: string) => void;
}) {
  if (!request) return null;
  return (
    <div className="pointer-events-auto absolute left-3 top-14 z-30 flex items-center gap-3 rounded-xl border border-white/20 bg-black/80 p-3 backdrop-blur-md lg:top-14">
      <GAvatar user={toDisplayUser(request.requestor)} size="md" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-white">{request.requestor.username}</p>
        <p className="text-xs text-white/70">wants to join your live</p>
      </div>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => onReject(request.requestorId)}
        className="shrink-0"
      >
        <X className="size-4" />
      </Button>
      <Button
        size="sm"
        variant="brand"
        onClick={() => onAccept(request.requestorId, request.requestorSocketId)}
        className="shrink-0"
      >
        <UserCheck className="size-4" /> Accept
      </Button>
    </div>
  );
}

/**
 * A2 — one tile component used for EVERY role's grid. `selfView` renders the
 * local camera (host/co-host); remote tiles render subscribed MediaStreams.
 * Audio for remote tiles follows the viewer's single sound toggle.
 */
function LiveVideoTile({
  stream,
  label,
  muted,
  showControls,
  micOn,
  camOn,
  onToggleMic,
  onToggleCam,
  onFlip,
  onLeave,
  selfView,
  health,
  dataSaver,
}: {
  stream: MediaStream | null;
  label?: string | undefined;
  muted?: boolean | undefined;
  showControls?: boolean | undefined;
  micOn?: boolean | undefined;
  camOn?: boolean | undefined;
  onToggleMic?: (() => void) | undefined;
  onToggleCam?: (() => void) | undefined;
  onFlip?: (() => void) | undefined;
  onLeave?: (() => void) | undefined;
  selfView?: boolean | undefined;
  health?: ReturnType<typeof useLiveVideoHealth> | undefined;
  dataSaver?: boolean | undefined;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream ?? null;
      videoRef.current.muted = muted ?? false;
    }
  }, [stream, muted]);

  return (
    <div className="relative min-h-0 overflow-hidden rounded-2xl bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted ?? false}
        className={cn(
          "absolute inset-0 size-full object-cover",
          // A6 data-saver: render at half size so adaptiveStream delivers a
          // lower simulcast layer (the element size drives the layer choice).
          dataSaver && "inset-1/4 size-1/2 object-contain",
          selfView && "scale-x-[-1]",
        )}
      />
      {label && (
        <span className="absolute bottom-2 left-2 z-10 rounded-md bg-black/60 px-2 py-0.5 text-xs font-bold text-white backdrop-blur">
          {label}
        </span>
      )}
      {health && <VideoStatusOverlay health={health} role={selfView ? "host" : "viewer"} />}
      {showControls && (
        <div className="absolute bottom-2 right-2 flex items-center gap-1.5 z-10">
          {onToggleMic && (
            <button
              onClick={onToggleMic}
              className="grid size-8 place-items-center rounded-full bg-black/50 text-white backdrop-blur"
            >
              {micOn ? <Mic className="size-3.5" /> : <MicOff className="size-3.5" />}
            </button>
          )}
          {onToggleCam && (
            <button
              onClick={onToggleCam}
              className="grid size-8 place-items-center rounded-full bg-black/50 text-white backdrop-blur"
            >
              {camOn ? <Video className="size-3.5" /> : <VideoOff className="size-3.5" />}
            </button>
          )}
          {onFlip && (
            <button
              onClick={onFlip}
              className="grid size-8 place-items-center rounded-full bg-black/50 text-white backdrop-blur"
            >
              <SwitchCamera className="size-3.5" />
            </button>
          )}
          {onLeave && (
            <button
              onClick={onLeave}
              className="grid size-8 place-items-center rounded-full bg-red-600/80 text-white backdrop-blur"
            >
              <PhoneOff className="size-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function LiveRoomPage() {
  const { streamId } = Route.useParams();
  const { user, staffUser } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading } = useLiveStream(streamId);
  const { data: chatHistory } = useLiveChatHistory(streamId);
  // A moderator/admin/superadmin can be the host with only a staff session
  // open (no consumer login) — fall back to staffUser for identity so
  // isHost/isMod still resolve, and route their mutations through the
  // staff-authenticated request when there's no consumer session.
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

  const [messages, setMessages] = useState<LiveChatEntry[]>([]);
  const [pinned, setPinned] = useState<LiveChatEntry | null>(null);
  const [draft, setDraft] = useState("");
  const [viewerCount, setViewerCount] = useState(0);
  const [reactionCount, setReactionCount] = useState(0);
  const [ended, setEnded] = useState<string | null>(null);
  const [giftPickerOpen, setGiftPickerOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [addModOpen, setAddModOpen] = useState(false);
  const [heartBurst, setHeartBurst] = useState(0);
  const [soundOn, setSoundOn] = useState(false);
  const [replyingTo, setReplyingTo] = useState<LiveChatEntry | null>(null);
  // Chat panel is expanded by default so comments are visible right away.
  // It auto-collapses once a co-host joins (2+ people live) to make room
  // for the split video grid, but the user can still expand/collapse it
  // manually at any time afterward.
  const [chatCollapsed, setChatCollapsed] = useState(false);
  const [chatAutoCollapsed, setChatAutoCollapsed] = useState(false);
  const [isCoHost, setIsCoHost] = useState(false);
  const [joinRequestPending, setJoinRequestPending] = useState(false);
  const [joinRequests, setJoinRequests] = useState<
    { requestorId: string; requestorSocketId: string; requestor: Author }[]
  >([]);
  const [coHostList, setCoHostList] = useState<Author[]>([]);
  const [timeWarning, setTimeWarning] = useState<number | null>(null);
  const [dataSaver, setDataSaver] = useState(false);
  // A5 — paid-interaction UI state
  const [paidConfirmOpen, setPaidConfirmOpen] = useState<null | "comment" | "reaction">(null);
  const [paidConfirmDontAsk, setPaidConfirmDontAsk] = useState(false);
  const [insufficientPoints, setInsufficientPoints] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const stream = data?.stream as LiveStreamData | undefined;
  const isHost = Boolean(
    activeIdentity &&
    stream &&
    (stream.host._id === activeIdentity.id ||
      stream.host.username.trim().toLowerCase() === activeIdentity.username.trim().toLowerCase()),
  );
  const isMod = Boolean(
    activeIdentity &&
    stream?.moderators?.some((m: Author) => m.username === activeIdentity.username),
  );
  const canModerate = isHost || isMod;
  const isOver = stream ? stream.status !== "live" || Boolean(ended) : false;

  // Moderator-only policy: paid interactions exist solely on streams hosted
  // by moderator/admin/superadmin accounts. Normal creators never see the
  // toggle, and the backend forces their streams free regardless.
  const isStaffHost = Boolean(
    stream?.host?.role === "moderator" ||
    stream?.host?.role === "admin" ||
    stream?.host?.role === "superadmin",
  );

  // A5 — paid interaction pricing (server-authoritative; UI only reflects it).
  const paid = stream?.paidInteractions;
  const paidEnabled = Boolean(
    paid?.enabled && !canModerate && activeIdentity && !isHost && !isCoHost,
  );
  const commentPrice = paid?.commentPrice ?? 0;
  const reactionPrice = paid?.reactionPrice ?? 0;
  const walletPoints = walletData?.wallet.kingdomPoints ?? 0;

  const {
    localStream,
    remoteStream,
    connected,
    error: browserError,
    micOn,
    camOn,
    qualitySamples: publisherQuality,
    toggleMic,
    toggleCamera,
    switchCamera,
  } = useBrowserLiveRoom({
    streamId,
    publish: isHost && !isCoHost,
    enabled: Boolean(stream) && !isOver && !isCoHost,
    hostId: stream?.host?._id ?? "",
    asStaff,
  });

  // Host-side co-host mesh: when host, connect to all accepted co-hosts
  const { coHostStreams: hostCoHostStreams, removeCoHostStream: hostRemoveCoHost } =
    useHostCoHostMesh({
      streamId,
      hostLocalStream: localStream,
      enabled: isHost && !isOver,
    });

  // Co-host mode: when viewer becomes co-host
  const coHostRoom = useCoHostLiveRoom({
    streamId,
    hostId: stream?.host?._id ?? "",
    myUserId: activeIdentity?.id ?? "",
    enabled: isCoHost && !isOver,
    asStaff,
  });

  // A2 — plain viewers' split-screen source: host + every accepted co-host.
  const coHostIds = useMemo(() => coHostList.map((c) => c._id), [coHostList]);
  const viewerRoom = useViewerStreams({
    streamId,
    hostId: stream?.host?._id ?? "",
    authorizedIds: [stream?.host?._id ?? "", ...coHostIds],
    enabled: Boolean(stream) && !isOver && !isHost && !isCoHost && Boolean(activeIdentity),
    asStaff,
  });

  const updateSettings = useUpdateLiveSettings(streamId, asStaff);
  const inviteFollowers = useInviteFollowers(streamId, asStaff);

  // Co-host streams: host sees hostCoHostStreams, co-host sees coHostRoom.coHostStreams,
  // and (A2) plain viewers on the LiveKit transport see viewerRoom.viewerStreams —
  // the SAME grid layout renders for every role.
  const allCoHostStreams: CoHostRemoteStream[] = isHost
    ? hostCoHostStreams
    : isCoHost
      ? coHostRoom.coHostStreams
      : VIEWER_GRID_AVAILABLE
        ? viewerRoom.viewerStreams
        : [];
  // For plain viewers the grid INCLUDES the host tile (all tiles are remote).
  const viewerGridTiles: CoHostRemoteStream[] = useMemo(() => {
    if (isHost || isCoHost) return [];
    if (!VIEWER_GRID_AVAILABLE) return [];
    return viewerRoom.viewerStreams;
  }, [isHost, isCoHost, viewerRoom.viewerStreams]);
  // Host/co-host tiles exclude self, so any entry means someone else joined.
  // The viewer grid INCLUDES the host tile itself, so it only counts as a
  // real split screen once there's the host PLUS at least one co-host (2+).
  // Otherwise a single-tile "grid" (just the host) was rendering as a
  // half-screen split with the other half black for every plain viewer.
  const hasCoHosts = allCoHostStreams.length > 0 || viewerGridTiles.length > 1;
  // True on-screen headcount, normalized across roles: host/co-host arrays
  // exclude self (add 1 back for the self tile rendered separately below);
  // the viewer array already includes every tile (host + co-hosts), so it's
  // used as-is. Drives the grid layout so viewers see the SAME 2/3/4+ split
  // shape as the broadcasters do.
  const liveGridTileCount = isHost || isCoHost ? allCoHostStreams.length + 1 : viewerGridTiles.length;

  // ── §8.2 fix: role/session values the socket handlers need, via refs so
  // the effect can keep its [streamId, navigate] deps without closing over
  // stale isHost/isCoHost/coHostRoom state (the old onCoHostLeft bug).
  const roleRef = useRef({ isHost, isCoHost, hostRemoveCoHost, activeIdentity, coHostRoom });
  roleRef.current = { isHost, isCoHost, hostRemoveCoHost, activeIdentity, coHostRoom };

  // A2 — late joiners: seed the co-host list from the stream document
  // (GET /live/:id already populates coHosts) and merge live events on top.
  useEffect(() => {
    if (stream?.coHosts) {
      setCoHostList((prev) => {
        const byId = new Map(prev.map((c) => [c._id, c]));
        for (const c of stream.coHosts ?? []) byId.set(c._id, c);
        return Array.from(byId.values());
      });
    }
  }, [stream?.coHosts]);

  // Auto-collapse the comments panel the first time a co-host joins (2+
  // streamers live) so the split video grid gets room; only collapse it
  // automatically once so a user re-expanding it isn't immediately
  // re-collapsed by this effect on the next render. A2: applies to viewers
  // too now that they see the same grid.
  useEffect(() => {
    if (hasCoHosts && !chatAutoCollapsed) {
      setChatCollapsed(true);
      setChatAutoCollapsed(true);
    } else if (!hasCoHosts && chatAutoCollapsed) {
      setChatAutoCollapsed(false);
    }
  }, [hasCoHosts, chatAutoCollapsed]);

  // The "main" video: host's local, co-host's local (self-view), or viewer's remote
  const activeMediaStream = isCoHost ? coHostRoom.localStream : isHost ? localStream : remoteStream;
  // Memoize the stream identity so the StableVideo component only re-renders
  // when the actual MediaStream object changes (not on every parent state update).
  const activeMediaStreamId = useMemo(() => activeMediaStream?.id ?? null, [activeMediaStream]);

  // Callback ref attaches the current stream as soon as the video node mounts.
  // Stabilized with useCallback so React does NOT call it with null on every parent re-render
  // (which would cause a brief black flash each time chat/likes update state).
  const setVideoRef = useCallback(
    (node: HTMLVideoElement | null) => {
      videoRef.current = node;
      if (node) {
        node.srcObject = activeMediaStream ?? null;
        node.muted = true; // Always start muted for autoplay; sound is toggled via ref
        node.volume = 1;
        // Mirror self-view for host and co-host
        node.style.transform = isHost || isCoHost ? "scaleX(-1)" : "";
      }
    },
    [activeMediaStream, isHost, isCoHost],
  );

  // A3 — the video-health state machine behind the main tile.
  const mainVideoHealth = useLiveVideoHealth({
    videoRef,
    connected,
    hasStream: Boolean(activeMediaStream),
    streamLive: Boolean(stream && stream.status === "live" && !ended),
    isViewer: !isHost && !isCoHost,
    reconnecting: false,
  });

  useEffect(() => {
    if (!videoRef.current) return;
    // Only update srcObject if the stream identity actually changed
    const currentStreamId = videoRef.current.srcObject as MediaStream | null;
    if ((currentStreamId?.id ?? null) !== activeMediaStreamId) {
      videoRef.current.srcObject = activeMediaStream ?? null;
    }
    // Control muted via ref only (not React prop) to prevent DOM thrashing / flash
    videoRef.current.muted = isHost || isCoHost || !soundOn;
    videoRef.current.volume = 1;
    videoRef.current.style.transform = isHost || isCoHost ? "scaleX(-1)" : "";
    if (activeMediaStream && soundOn && !isHost && !isCoHost) {
      videoRef.current.play().catch(() => {
        toast.error("Tap the sound button again to enable audio");
        setSoundOn(false);
      });
    }
  }, [activeMediaStream, activeMediaStreamId, isHost, isCoHost, soundOn]);

  useEffect(() => {
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

  useEffect(() => {
    if (chatHistory) {
      setMessages(chatHistory.messages);
      setPinned(chatHistory.pinned ?? null);
    }
  }, [chatHistory]);
  useEffect(() => {
    setViewerCount(stream?.viewerCount ?? 0);
    setReactionCount(stream?.reactionsCount ?? 0);
  }, [stream?.viewerCount, stream?.reactionsCount]);

  // A4 — remaining-time countdown (host badge + viewer subtle notice).
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  useEffect(() => {
    if (!stream?.maxEndsAt || stream.status !== "live") {
      setRemainingMs(null);
      return;
    }
    const target = new Date(stream.maxEndsAt).getTime();
    const tick = () => setRemainingMs(Math.max(0, target - Date.now()));
    tick();
    const t = window.setInterval(tick, 1_000);
    return () => window.clearInterval(t);
  }, [stream?.maxEndsAt, stream?.status]);

  // A4 — formatted remaining time for the host countdown badge.
  const remainingLabel = useMemo(() => {
    if (remainingMs == null || remainingMs <= 0) return null;
    const totalSec = Math.floor(remainingMs / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      : `${m}:${String(s).padStart(2, "0")}`;
  }, [remainingMs]);

  // heartbeat.mutate is read through a ref rather than a direct effect
  // dependency: mutate's identity isn't guaranteed stable across renders,
  // and this component re-renders often (stream/chat polling). Depending on
  // it directly re-ran this effect on unrelated re-renders, which fired the
  // cleanup below and sent a real "live:end" — silently ending the host's
  // broadcast (camera going off) even though they never left the page.
  const heartbeatMutateRef = useRef(heartbeat.mutate);
  heartbeatMutateRef.current = heartbeat.mutate;

  useEffect(() => {
    if (!isHost || isOver) return;

    const keepAlive = () => {
      getLiveSocket()?.emit("live:heartbeat", { streamId });
      heartbeatMutateRef.current(undefined, {
        onError: (error: Error) => {
          if (
            String(error?.message || "")
              .toLowerCase()
              .includes("ended")
          ) {
            setEnded("This stream has ended");
          }
        },
      });
    };
    keepAlive();
    const timer = window.setInterval(keepAlive, 20_000);
    return () => {
      window.clearInterval(timer);
      // Leaving this route or temporarily backgrounding the browser must not
      // end a broadcast. Only the explicit End stream action may do that.
    };
  }, [isHost, isOver, streamId]);

  useEffect(() => {
    const socket = getLiveSocket();
    if (!socket) return;
    const joinRoom = () => socket.emit("live:join", { streamId });
    if (socket.connected) joinRoom();
    else socket.once("connect", joinRoom);

    const onChat = (msg: LiveChatEntry) => {
      if (msg.stream !== streamId) return;
      setMessages((prev) => [...prev, msg]);
    };
    const onViewerCount = (p: { streamId: string; viewerCount: number }) => {
      if (p.streamId === streamId) setViewerCount(p.viewerCount);
    };
    const onEnded = (p: { streamId: string; reason?: string; forced?: boolean }) => {
      if (p.streamId !== streamId) return;
      setEnded(p.forced ? `Ended by a moderator: ${p.reason}` : p.reason || "Stream ended");
    };
    const onReaction = (p: { streamId: string; total?: number }) => {
      if (p.streamId !== streamId) return;
      setReactionCount((current) => (p.total == null ? current + 1 : Math.max(current, p.total)));
      setHeartBurst((n) => n + 1);
    };
    const onPinned = (p: { streamId: string; message: LiveChatEntry }) => {
      if (p.streamId === streamId) setPinned(p.message);
    };
    const onUnpinned = (p: { streamId: string }) => {
      if (p.streamId === streamId) setPinned(null);
    };
    const onDeleted = (p: { streamId: string; commentId: string }) => {
      if (p.streamId !== streamId) return;
      setMessages((prev) => prev.filter((m) => m._id !== p.commentId));
    };
    const onKicked = (p: { streamId: string }) => {
      if (p.streamId !== streamId) return;
      toast.error("You've been removed from this stream");
      navigate({ to: "/live" });
    };
    const onBanned = (p: { streamId: string }) => {
      if (p.streamId !== streamId) return;
      toast.error("You're banned from this stream");
      navigate({ to: "/live" });
    };
    const onChatBlocked = (p: { streamId: string; reason: string }) => {
      if (p.streamId === streamId) toast.error(p.reason);
    };
    // A4 — remaining-time warnings (30/5/1 minutes before the 5h cap).
    const onTimeWarning = (p: { streamId: string; minutesLeft: number }) => {
      if (p.streamId !== streamId) return;
      setTimeWarning(p.minutesLeft);
      window.setTimeout(() => setTimeWarning((w) => (w === p.minutesLeft ? null : w)), 30_000);
    };

    // A5 — precise payment failures: roll back optimistic UI, surface reason.
    const onPaymentFailed = (p: {
      streamId: string;
      kind: "comment" | "reaction" | string;
      reason: string;
      message: string;
    }) => {
      if (p.streamId !== streamId) return;
      if (p.reason === "insufficient") setInsufficientPoints(true);
      if (p.kind === "reaction") {
        setReactionCount((n) => Math.max(0, n - 1));
      }
      toast.error(p.message || "Payment failed");
    };

    // ── Co-host join-request listeners ──
    const onJoinRequest = (p: {
      streamId: string;
      requestorId: string;
      requestorSocketId: string;
      requestor: Author;
    }) => {
      if (p.streamId !== streamId) return;
      setJoinRequests((prev) => [
        ...prev,
        {
          requestorId: p.requestorId,
          requestorSocketId: p.requestorSocketId,
          requestor: p.requestor,
        },
      ]);
    };
    const onJoinAccepted = (p: { streamId: string }) => {
      if (p.streamId !== streamId) return;
      setJoinRequestPending(false);
      setIsCoHost((prev) => {
        if (prev) return prev; // already a co-host, ignore duplicate
        toast.success("You joined the live!");
        return true;
      });
    };
    const onJoinRejected = (p: { streamId: string; reason: string }) => {
      if (p.streamId !== streamId) return;
      setJoinRequestPending(false);
      toast.error(p.reason || "Your request was declined");
    };
    const onCoHostJoined = (p: { streamId: string; coHostId: string; coHost: Author | null }) => {
      if (p.streamId !== streamId) return;
      if (p.coHost) {
        setCoHostList((prev) => [...prev.filter((c) => c._id !== p.coHostId), p.coHost!]);
      }
    };
    // A2 — late-joiner snapshot: the full current co-host list on join.
    const onCoHostSnapshot = (p: { streamId: string; coHosts: Author[] }) => {
      if (p.streamId !== streamId) return;
      setCoHostList((prev) => {
        const byId = new Map(prev.map((c) => [c._id, c]));
        for (const c of p.coHosts ?? []) byId.set(c._id, c);
        return Array.from(byId.values());
      });
    };
    const onCoHostLeft = (p: { streamId: string; coHostId: string }) => {
      if (p.streamId !== streamId) return;
      setCoHostList((prev) => prev.filter((c) => c._id !== p.coHostId));
      // §8.2 — read the CURRENT role through the ref, not the stale closure.
      const role = roleRef.current;
      if (role.isHost) role.hostRemoveCoHost(p.coHostId);
      if (role.isCoHost) role.coHostRoom.removeCoHostStream(p.coHostId);
      // If the server actually evicted *us* (e.g. the disconnect grace period
      // ran out because we were genuinely offline), reflect that locally too
      // instead of leaving the UI stuck believing we're still a co-host.
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const visibleMessages = messages.filter((m) => !blockedSet?.has(m.sender.username));

  function startReply(comment: LiveChatEntry) {
    setReplyingTo(comment);
    // Focus the input (it will show the @username prefix)
  }

  // A5 — paid confirmation gate ("don't ask again" is per stream).
  const paidConfirmSkipKey = `gihanga:paid-confirm-skip:${streamId}`;
  const shouldConfirmPaid = (kind: "comment" | "reaction") => {
    try {
      if (sessionStorage.getItem(paidConfirmSkipKey) === "1") return false;
    } catch {
      /* private mode */
    }
    return !paidConfirmDontAsk || paidConfirmOpen !== null ? true : kind !== paidConfirmOpen;
  };

  function emitChat(body: string) {
    const socket = getLiveSocket();
    if (!socket) return;
    const idempotencyKey =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;
    const event = paidEnabled ? "live:paid-chat" : "live:chat";
    const payload = paidEnabled ? { streamId, body, idempotencyKey } : { streamId, body };
    const send = () => socket.emit(event, payload);
    if (socket.connected) send();
    else socket.once("connect", send);
  }

  function sendChat() {
    const body = draft.trim();
    if (!body || isOver) return;
    const socket = getLiveSocket();
    if (!socket) {
      toast.error("Sign in to join the live chat");
      return;
    }
    // A5 — confirm-once dialog before the first paid comment of the stream.
    if (paidEnabled && commentPrice > 0 && shouldConfirmPaid("comment")) {
      setPaidConfirmOpen("comment");
      return;
    }
    // Build the message body — prepend @reply if replying to a comment
    const replyPrefix = replyingTo ? `@${replyingTo.sender.username} ` : "";
    const fullBody = replyPrefix + body;
    emitChat(fullBody);
    setDraft("");
    setReplyingTo(null);
  }

  function emitReaction() {
    const socket = getLiveSocket();
    if (!socket) return;
    const idempotencyKey =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;
    const event = paidEnabled ? "live:paid-react" : "live:react";
    const payload = paidEnabled
      ? { streamId, kind: "heart", idempotencyKey }
      : { streamId, kind: "heart" };
    socket.emit(event, payload);
  }

  function sendReaction() {
    if (isOver) return;
    const socket = getLiveSocket();
    if (!socket) {
      toast.error("Sign in to react to this live");
      return;
    }
    // A5 — confirm-once dialog before the first paid reaction of the stream.
    if (paidEnabled && reactionPrice > 0 && shouldConfirmPaid("reaction")) {
      setPaidConfirmOpen("reaction");
      return;
    }
    // Optimistic UI — rolled back by the live:payment-failed listener.
    setReactionCount((n) => n + 1);
    setHeartBurst((n) => n + 1);
    emitReaction();
  }

  function confirmPaidInteraction() {
    const kind = paidConfirmOpen;
    setPaidConfirmOpen(null);
    if (paidConfirmDontAsk) {
      try {
        sessionStorage.setItem(paidConfirmSkipKey, "1");
      } catch {
        /* private mode */
      }
    }
    if (kind === "reaction") {
      setReactionCount((n) => n + 1);
      setHeartBurst((n) => n + 1);
      emitReaction();
    } else if (kind === "comment") {
      const body = draft.trim();
      if (!body) return;
      const replyPrefix = replyingTo ? `@${replyingTo.sender.username} ` : "";
      emitChat(replyPrefix + body);
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
      if (next)
        void videoRef.current.play().catch(() => {
          toast.error("Couldn't enable sound — try tapping again");
        });
    }
    // A2 — viewer audio must play from ALL tiles once sound is enabled.
    if (next) {
      document.querySelectorAll<HTMLVideoElement>("video[data-live-tile]").forEach((el) => {
        el.muted = false;
        el.volume = 1;
        void el.play().catch(() => {});
      });
    } else {
      document.querySelectorAll<HTMLVideoElement>("video[data-live-tile]").forEach((el) => {
        el.muted = true;
      });
    }
  }

  function handleEnd() {
    endLive.mutate(streamId, {
      onSuccess: () => {
        toast.success("Stream ended");
        navigate({ to: "/live" });
      },
      onError: (error: Error) => toast.error(error.message || "Couldn't end the stream"),
    });
  }

  function handleGift(giftId: (typeof GIFT_CATALOG)[number]["id"]) {
    sendGift.mutate(giftId, {
      onSuccess: (res) => {
        setGiftPickerOpen(false);
        toast.success(`Gift sent! ${res.remainingPoints} points left`);
      },
      onError: (err: Error) => toast.error(err.message || "Couldn't send that gift"),
    });
  }

  function shareStream() {
    const url = `${window.location.origin}/live/${streamId}`;
    if (navigator.share) {
      navigator
        .share({
          url,
          ...(stream?.title ? { title: stream.title } : {}),
        })
        .catch(() => {});
    } else {
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

  function acceptJoinRequest(requestorId: string, requestorSocketId: string) {
    const socket = getLiveSocket();
    if (!socket) return;
    socket.emit("live:accept-join-request", {
      streamId,
      viewerId: requestorId,
      viewerSocketId: requestorSocketId,
    });
    setJoinRequests((prev) => prev.filter((r) => r.requestorId !== requestorId));
    toast.success("Co-host accepted!");
  }

  function rejectJoinRequest(requestorId: string) {
    const socket = getLiveSocket();
    if (!socket) return;
    socket.emit("live:reject-join-request", { streamId, viewerId: requestorId });
    setJoinRequests((prev) => prev.filter((r) => r.requestorId !== requestorId));
  }

  function leaveCoHost() {
    const socket = getLiveSocket();
    if (socket) socket.emit("live:co-host:leave", { streamId });
    setIsCoHost(false);
    setJoinRequestPending(false);
    toast.success("You left the live");
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <p className="text-sm text-white/70">Loading stream…</p>
      </div>
    );
  }
  if (!stream) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black px-4 text-center">
        <h1 className="font-display text-xl font-bold text-white">Stream not found</h1>
        <Button variant="brand" asChild>
          <Link to="/live">Back to live streams</Link>
        </Button>
      </div>
    );
  }

  const following = followingSet?.has(stream.host.username) ?? false;
  const reachedCap = Boolean(ended && /5-hour|maximum duration/i.test(ended));

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-black lg:flex-row">
      <button
        type="button"
        onClick={() => navigate({ to: "/live" })}
        aria-label="Back to live streams"
        className="press absolute top-3 left-3 z-20 grid size-9 place-items-center rounded-full bg-black/50 text-white backdrop-blur"
      >
        <ArrowLeft className="size-5" />
      </button>

      <div className="relative w-full flex-1 bg-black lg:flex-none lg:basis-0 lg:grow-[3] lg:mr-1.5">
        <div className="relative size-full">
          {isOver ? (
            <div className="flex size-full flex-col items-center justify-center gap-2 text-white/70">
              <VideoOff className="size-10" />
              <p className="font-semibold">{ended || "This stream has ended"}</p>
              {reachedCap && (
                <p className="max-w-xs text-center text-sm text-white/60">
                  This stream reached the 5-hour limit
                </p>
              )}
              <div className="mt-2 flex items-center gap-2">
                <Button
                  variant="outline"
                  className="border-white/30 bg-white text-black hover:bg-white/90"
                  asChild
                >
                  <Link to="/live">Browse other streams</Link>
                </Button>
                {reachedCap && isHost && (
                  <Button variant="brand" asChild>
                    <Link to="/live">Start a new stream</Link>
                  </Button>
                )}
              </div>
            </div>
          ) : browserError ? (
            <div className="flex size-full flex-col items-center justify-center gap-2 p-6 text-center text-white/70">
              <VideoOff className="size-8 text-danger" />
              <p className="text-sm">{browserError}</p>
            </div>
          ) : (
            <>
              {/* ── Split-screen grid — THE SAME layout for host, co-hosts and
                  viewers (A2). Self view always renders LAST (bottom-most
                  slot); every other participant renders BEFORE it, so on each
                  person's own device their own camera sits at the bottom
                  while everyone else appears above/first — matches how the
                  reference app lays it out. For plain viewers every tile is
                  remote (no "You" tile).
                  The grid itself adapts to the participant count so it
                  never produces a tiny/unusable split:
                    2 people → even 50/50 split
                    3 people → 1 tile spans the full top row, 2 below
                    4+ people → even auto-fit grid that reflows when someone
                      leaves (no leftover black space) */}
              {hasCoHosts ? (
                <div
                  className={cn(
                    "grid h-full w-full gap-1.5 bg-black p-1.5",
                    // Host/co-host arrays exclude self (so + 1 below); the
                    // viewer array already includes the host tile itself —
                    // this normalizes both to the TRUE on-screen headcount
                    // so viewers get the same 2/3/4+ layouts as broadcasters.
                    liveGridTileCount === 2
                      ? "grid-cols-1 grid-rows-2 lg:grid-cols-2 lg:grid-rows-1"
                      : liveGridTileCount === 3
                        ? "grid-cols-2 grid-rows-2 [&>*:first-child]:col-span-2"
                        : "auto-rows-fr grid-cols-2",
                  )}
                >
                  {/* Every other participant, in the order they joined */}
                  {allCoHostStreams.map((cs) => {
                    const coHostInfo = coHostList.find((c) => c._id === cs.participantId);
                    const isHostTile = cs.participantId === stream.host._id;
                    return (
                      <LiveVideoTile
                        key={cs.participantId}
                        stream={cs.stream}
                        label={
                          coHostInfo?.username ?? (isHostTile ? stream.host.username : undefined)
                        }
                        muted={!soundOn}
                        dataSaver={dataSaver && !isHost && !isCoHost}
                      />
                    );
                  })}
                  {/* Self view — always last, so it sits in the bottom-most grid cell */}
                  {(isHost || isCoHost) && (
                    <div className="relative min-h-0 overflow-hidden rounded-2xl bg-black/40">
                      <video
                        ref={setVideoRef}
                        autoPlay
                        muted
                        playsInline
                        data-live-tile="self"
                        className="absolute inset-0 size-full object-cover"
                      />
                      <span className="absolute bottom-2 left-2 z-10 rounded-md bg-black/60 px-2 py-0.5 text-xs font-bold text-white backdrop-blur">
                        You
                      </span>
                      <VideoStatusOverlay
                        health={mainVideoHealth}
                        role={isHost ? "host" : "co-host"}
                      />
                    </div>
                  )}
                </div>
              ) : (
                /* ── Single video (no co-hosts) ── */
                <>
                  <video
                    ref={setVideoRef}
                    autoPlay
                    muted
                    playsInline
                    onClick={() => !isHost && !isCoHost && !soundOn && toggleSound()}
                    className={cn(
                      "absolute inset-0 size-full object-cover",
                      dataSaver && !isHost && !isCoHost && "inset-1/4 size-1/2 object-contain",
                    )}
                  />
                  {/* A3 — one overlay with distinct messages for every failure
                      mode; never rendered over healthy video. */}
                  <VideoStatusOverlay
                    health={mainVideoHealth}
                    role={isHost ? "host" : isCoHost ? "co-host" : "viewer"}
                  />
                </>
              )}
            </>
          )}

          <FloatingHearts burst={heartBurst} />

          {/* A6 — poor-connection banner with hysteresis (viewer wording).
               The streamer variant uses the publisher's uplink samples. */}
          {!isOver && !browserError && (
            <ConnectionQualityBanner
              samples={isHost || isCoHost ? publisherQuality : viewerRoom.qualitySamples}
              variant={isHost || isCoHost ? "broadcaster" : "viewer"}
              escalated={
                mainVideoHealth.state === "disconnected" || mainVideoHealth.state === "reconnecting"
              }
            />
          )}

          {/* ── Incoming co-host join requests (host only) ── */}
          {isHost && !isOver && joinRequests[0] && (
            <JoinRequestDialog
              request={joinRequests[0]}
              onAccept={acceptJoinRequest}
              onReject={rejectJoinRequest}
            />
          )}

          {!isOver && (
            <div className="absolute top-3 left-14 z-10 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-lg bg-danger px-2.5 py-1 text-xs font-bold text-white animate-pulse">
                <Radio className="size-3" /> LIVE
              </span>
              <span className="flex items-center gap-1 rounded-lg bg-black/60 px-2.5 py-1 text-xs font-bold text-white">
                <Users className="size-3" /> {formatCount(viewerCount)}
              </span>
              <span className="flex items-center gap-1 rounded-lg bg-black/60 px-2.5 py-1 text-xs font-bold text-white">
                <Heart className="size-3 fill-danger text-danger" /> {formatCount(reactionCount)}
              </span>
              {stream.totalGifts > 0 && (
                <span className="flex items-center gap-1 rounded-lg bg-amber-500/90 px-2.5 py-1 text-xs font-bold text-black">
                  <Gift className="size-3" /> {formatCount(stream.totalGifts)} pts
                </span>
              )}
              {/* A4 — host countdown badge / viewer subtle notice */}
              {isHost && remainingLabel && (
                <span
                  className={cn(
                    "flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold text-white",
                    remainingMs != null && remainingMs < 5 * 60_000
                      ? "bg-danger animate-pulse"
                      : "bg-black/60",
                  )}
                >
                  <Timer className="size-3" /> {remainingLabel}
                </span>
              )}
              {!isHost && timeWarning != null && (
                <span className="rounded-lg bg-black/60 px-2.5 py-1 text-xs font-bold text-white/80">
                  {timeWarning} min left
                </span>
              )}
            </div>
          )}

          {!isHost && !isCoHost && !isOver && (
            <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
              {/* A6 — Data saver: shrink the rendered element so adaptiveStream
                  pins a lower simulcast layer (halves data). */}
              <Button
                size="icon"
                variant={dataSaver ? "brand" : "secondary"}
                className="rounded-full"
                onClick={() => setDataSaver((v) => !v)}
                aria-pressed={dataSaver}
                aria-label={dataSaver ? "Disable data saver" : "Enable data saver"}
                title={
                  dataSaver ? "Data saver on — tap for full quality" : "Data saver — use less data"
                }
              >
                <Timer className="size-4" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="rounded-full"
                onClick={toggleSound}
                aria-label={soundOn ? "Mute live audio" : "Turn on live audio"}
                aria-pressed={soundOn}
              >
                {soundOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
              </Button>
            </div>
          )}

          {isHost && !isOver && (
            <div className="absolute top-16 right-3 z-20 flex items-center gap-2">
              <Button size="icon" variant="secondary" className="rounded-full" onClick={toggleMic}>
                {micOn ? <Mic className="size-4" /> : <MicOff className="size-4" />}
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="rounded-full"
                onClick={toggleCamera}
              >
                {camOn ? <Video className="size-4" /> : <VideoOff className="size-4" />}
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="rounded-full"
                onClick={switchCamera}
              >
                <SwitchCamera className="size-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleEnd}
                disabled={endLive.isPending}
              >
                <X className="size-4" /> {endLive.isPending ? "Ending…" : "End stream"}
              </Button>
            </div>
          )}

          {/* ── Co-host controls ── */}
          {isCoHost && !isOver && (
            <div className="absolute top-16 right-3 z-20 flex items-center gap-2">
              <Button
                size="icon"
                variant="secondary"
                className="rounded-full"
                onClick={coHostRoom.toggleMic}
              >
                {coHostRoom.micOn ? <Mic className="size-4" /> : <MicOff className="size-4" />}
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="rounded-full"
                onClick={coHostRoom.toggleCamera}
              >
                {coHostRoom.camOn ? <Video className="size-4" /> : <VideoOff className="size-4" />}
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="rounded-full"
                onClick={coHostRoom.flipCamera}
              >
                <SwitchCamera className="size-4" />
              </Button>
              <Button variant="destructive" size="sm" onClick={leaveCoHost}>
                <PhoneOff className="size-4" /> Leave
              </Button>
            </div>
          )}

          {/* Subtle video bottom gradient for visual depth (mobile only) */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] bg-gradient-to-t from-black/40 via-black/15 to-transparent h-28 lg:hidden" />
        </div>
      </div>

      {/* ── Chat / interaction panel ── */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex max-h-[36vh] flex-col lg:pointer-events-auto lg:static lg:h-full lg:max-h-none lg:w-[360px] lg:shrink-0 lg:border-l lg:border-white/10 lg:bg-black">
        <div
          className={cn(
            "pointer-events-auto flex flex-col lg:h-full lg:max-h-none lg:rounded-none lg:bg-transparent",
            // Collapsed (mobile): only the host row + toggle are visible, fully transparent.
            // Expanded (mobile): comments become visible, panel background fades from
            // transparent at the top to a low-opacity black near the input area.
            chatCollapsed
              ? "max-h-none bg-transparent"
              : "max-h-[36vh] bg-gradient-to-t from-black/60 via-black/20 to-transparent",
          )}
        >
          {/* PC chat header */}
          <header className="hidden border-b border-white/10 p-3 lg:flex lg:items-center lg:gap-2">
            <p className="text-sm font-bold text-white">Live chat</p>
          </header>

          {/* ── Host info row (avatar, name, title, three-dot menu, follow) ── */}
          <div className="flex items-center gap-2.5 px-3 py-2">
            <Link
              to="/profile/$username"
              params={{ username: stream.host.username }}
              className="shrink-0"
            >
              <GAvatar user={toDisplayUser(stream.host)} size="md" />
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <UserName
                  user={toDisplayUser(stream.host)}
                  className="min-w-0 truncate text-white [&>span]:text-white"
                />
              </div>
              <p className="truncate text-sm text-white/70">{stream.title}</p>
            </div>

            {/* Gift / Join — desktop inline; mobile is handled in the input row */}
            <div className="hidden items-center gap-1 lg:flex">
              {!isHost && !isOver && stream.giftsEnabled && (
                <Button variant="brand" size="sm" onClick={() => setGiftPickerOpen((v) => !v)}>
                  <Gift className="size-4" /> Gift
                </Button>
              )}
              {!isHost && !isCoHost && !isOver && activeIdentity && (
                <Button
                  variant="brand"
                  size="sm"
                  onClick={requestJoinLive}
                  disabled={joinRequestPending}
                >
                  {joinRequestPending ? (
                    <>
                      <Radio className="size-4 animate-pulse" /> Requesting…
                    </>
                  ) : (
                    <>
                      <LogIn className="size-4" /> Join
                    </>
                  )}
                </Button>
              )}
            </div>

            {!isHost && (
              <Button
                variant={following ? "soft" : "default"}
                size="sm"
                className="shrink-0"
                onClick={() =>
                  followUser.mutate({ username: stream.host.username, follow: !following })
                }
              >
                {following ? "Following" : "Follow"}
              </Button>
            )}

            {/* Three-dot actions menu — same row as host name/title on every
                screen size, including mobile, so it never gets pushed below. */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="More options"
                  className="shrink-0 text-white hover:bg-white/15 hover:text-white"
                >
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={shareStream}>
                  <Share2 className="size-4" /> Share live
                </DropdownMenuItem>
                {isHost && (
                  <DropdownMenuItem onClick={() => setAddModOpen(true)}>
                    <UserPlus className="size-4" /> Add moderator
                  </DropdownMenuItem>
                )}
                {isHost && (
                  <DropdownMenuItem
                    onClick={() =>
                      inviteFollowers.mutate(undefined, {
                        onSuccess: (r) => toast.success(`Invited ${r.invited} followers`),
                        onError: (err: Error) =>
                          toast.error(err.message || "Couldn't send invites"),
                      })
                    }
                    disabled={inviteFollowers.isPending}
                  >
                    <Send className="size-4" /> Invite followers
                  </DropdownMenuItem>
                )}
                {isHost && (
                  <DropdownMenuItem
                    onClick={() => {
                      updateSettings.mutate(
                        { giftsEnabled: !stream.giftsEnabled },
                        {
                          onSuccess: () =>
                            toast.success(
                              stream.giftsEnabled
                                ? "Gifts disabled for this stream"
                                : "Gifts enabled",
                            ),
                        },
                      );
                    }}
                  >
                    <Settings2 className="size-4" />{" "}
                    {stream.giftsEnabled ? "Disable gifts" : "Enable gifts"}
                  </DropdownMenuItem>
                )}
                {isHost && isStaffHost && (
                  <DropdownMenuItem
                    onClick={() => {
                      updateSettings.mutate(
                        { paidInteractions: { enabled: !stream.paidInteractions?.enabled } },
                        {
                          onSuccess: () =>
                            toast.success(
                              stream.paidInteractions?.enabled
                                ? "Paid interactions disabled"
                                : `Paid interactions enabled — ❤ ${paid?.reactionPrice ?? 1} pts, comments ${paid?.commentPrice ?? 5} pts`,
                            ),
                        },
                      );
                    }}
                  >
                    <Coins className="size-4" />{" "}
                    {stream.paidInteractions?.enabled
                      ? "Disable paid interactions"
                      : "Enable paid interactions"}
                  </DropdownMenuItem>
                )}
                {!isHost && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-danger" onClick={() => setReportOpen(true)}>
                      <Flag className="size-4" /> Report live
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Collapse/expand toggle — mobile only; comments panel is
                collapsed by default and the user can expand it to read
                comments, then collapse it again. */}
            <button
              type="button"
              onClick={() => setChatCollapsed((v) => !v)}
              aria-label={chatCollapsed ? "Expand live chat" : "Collapse live chat"}
              aria-expanded={!chatCollapsed}
              className="press grid size-8 shrink-0 place-items-center rounded-full bg-black/40 text-white lg:hidden"
            >
              {chatCollapsed ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </button>
          </div>

          {/* Pinned comment */}
          {pinned && (
            <div
              className={cn(
                "items-start gap-2 border-b border-white/10 bg-primary/20 p-2.5 text-xs lg:flex",
                chatCollapsed ? "hidden lg:flex" : "flex",
              )}
            >
              <Pin className="mt-0.5 size-3.5 shrink-0 text-primary" />
              <p className="min-w-0 flex-1 leading-snug">
                <span className="font-bold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]">
                  {pinned.sender.username}
                </span>{" "}
                <span className="text-white/80 [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]">
                  {pinned.body}
                </span>
              </p>
              {canModerate && (
                <button
                  type="button"
                  onClick={() =>
                    getLiveSocket()?.emit("live:unpin-comment", { streamId, commentId: pinned._id })
                  }
                  className="shrink-0 text-white/60 hover:text-white"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          )}
          {/* Chat messages — transparent background, text-only rows with a
              drop shadow for legibility over any video, matching the
              reference design. Collapsed by default on mobile (toggle
              above); always visible on desktop (lg+). */}
          <div
            className={cn(
              "min-h-0 flex-1 space-y-2.5 overflow-y-auto p-3",
              chatCollapsed ? "hidden lg:block" : "block",
            )}
          >
            {visibleMessages.length === 0 && (
              <p className="py-6 text-center text-xs text-white/60 [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]">
                Say hello 👋
              </p>
            )}
            {visibleMessages.map((m) => (
              <div key={m._id} className="group flex items-start gap-2 text-sm">
                <GAvatar user={toDisplayUser(m.sender)} size="xs" />
                <p className="min-w-0 flex-1 leading-snug break-words [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]">
                  <span className="font-bold text-white">{m.sender.username}</span>{" "}
                  {m.isGift ? (
                    <span className="font-semibold text-amber-400">
                      <Heart className="inline size-3.5 fill-amber-400" /> {m.body}
                    </span>
                  ) : (
                    <span className="text-white/90">{m.body}</span>
                  )}
                </p>
                {(canModerate || m.sender.username !== activeIdentity?.username) && !m.isGift && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        aria-label="Message options"
                        className="shrink-0 rounded p-0.5 text-white/60 opacity-0 group-hover:opacity-100 hover:text-white"
                      >
                        <MoreVertical className="size-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      {/* §8.4 — Reply available to host AND moderators (was
                          host-only, so mods could never reply). */}
                      {canModerate && (
                        <DropdownMenuItem onClick={() => startReply(m)}>
                          <Reply className="size-3.5" /> Reply
                        </DropdownMenuItem>
                      )}
                      {canModerate && (
                        <>
                          <DropdownMenuItem
                            onClick={() =>
                              getLiveSocket()?.emit("live:pin-comment", {
                                streamId,
                                commentId: m._id,
                              })
                            }
                          >
                            <Pin className="size-3.5" /> Pin
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-danger"
                            onClick={() =>
                              getLiveSocket()?.emit("live:delete-comment", {
                                streamId,
                                commentId: m._id,
                              })
                            }
                          >
                            <Trash2 className="size-3.5" /> Delete
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              muteViewer.mutate(m.sender._id, {
                                onSuccess: (r) =>
                                  toast.success(
                                    r.muted
                                      ? `Muted @${m.sender.username}`
                                      : `Unmuted @${m.sender.username}`,
                                  ),
                              })
                            }
                          >
                            <ShieldOff className="size-3.5" /> Mute
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-danger"
                            onClick={() =>
                              banViewer.mutate(m.sender._id, {
                                onSuccess: (r) =>
                                  toast.success(
                                    r.banned
                                      ? `Banned @${m.sender.username}`
                                      : `Unbanned @${m.sender.username}`,
                                  ),
                              })
                            }
                          >
                            <ShieldBan className="size-3.5" /> Ban
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      {m.sender.username !== activeIdentity?.username && (
                        <DropdownMenuItem
                          onClick={() =>
                            toggleBlock.mutate(
                              {
                                username: m.sender.username,
                                block: !blockedSet?.has(m.sender.username),
                              },
                              { onSuccess: () => toast.success(`Blocked @${m.sender.username}`) },
                            )
                          }
                        >
                          <UserMinus className="size-3.5" /> Block user
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Gift picker */}
          {giftPickerOpen && (
            <div className="grid grid-cols-4 gap-2 border-t border-white/10 bg-black/40 p-3 backdrop-blur-sm">
              {GIFT_CATALOG.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => handleGift(g.id)}
                  disabled={sendGift.isPending || (walletData?.wallet.kingdomPoints ?? 0) < g.cost}
                  className="press flex flex-col items-center gap-1 rounded-xl border border-white/20 bg-black/30 p-3 text-white hover:bg-white/10 disabled:opacity-40"
                >
                  <span className="text-2xl">{g.emoji}</span>
                  <span className="text-xs font-bold">{g.cost} pts</span>
                </button>
              ))}
            </div>
          )}

          {/* Host earnings (A5: includes paid-interaction breakdown) */}
          {isHost && (
            <div className="pointer-events-auto">
              <HostEarnings streamId={streamId} isOver={isOver} asStaff={asStaff} />
            </div>
          )}

          {/* ── Comment input row ── */}
          {!isOver && (
            <div className="flex items-center gap-1.5 border-t border-white/10 p-2.5">
              {replyingTo && (
                <div className="flex w-full items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-[11px] text-white/80">
                  <Reply className="size-3 shrink-0" />
                  <span>
                    Replying to <b>@{replyingTo.sender.username}</b>
                  </span>
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="ml-auto shrink-0 text-white/60 hover:text-white"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              )}
              {!replyingTo && (
                <>
                  {/* A5 — live wallet balance + price hints in the input row */}
                  {paidEnabled && (
                    <div className="flex w-full items-center justify-between gap-2 rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white/80">
                      <span className="flex items-center gap-1">
                        <Coins className="size-3 text-amber-400" />
                        {insufficientPoints ? (
                          <span className="text-danger">
                            Not enough points ({walletPoints}/{commentPrice}) —{" "}
                            <Link to="/wallet" className="underline">
                              Top up
                            </Link>
                          </span>
                        ) : (
                          `${walletPoints} pts`
                        )}
                      </span>
                      <span>
                        ❤ {reactionPrice} pts · comment {commentPrice} pts
                      </span>
                    </div>
                  )}
                  <input
                    value={draft}
                    onChange={(e) => {
                      setDraft(e.target.value);
                      setInsufficientPoints(false);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && sendChat()}
                    placeholder={paidEnabled ? `Comment · ${commentPrice} pts` : "Send a message…"}
                    className="h-9 min-w-0 flex-1 rounded-full border border-white/20 bg-white/10 px-3 text-sm text-white placeholder:text-white/50 outline-none focus:border-white/40"
                  />
                  {/* Tight cluster: Send / Gift / Join / Like — small gap between
                      them so the input keeps as much width as possible, while
                      still not touching each other. */}
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      size="icon"
                      variant="brand"
                      onClick={sendChat}
                      disabled={!draft.trim()}
                      className="shrink-0"
                      aria-label="Send message"
                    >
                      <Send className="size-4" />
                    </Button>
                    {/* Mobile: Gift + Join buttons inline */}
                    {!isHost && !isOver && stream.giftsEnabled && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-white hover:bg-white/15 lg:hidden"
                        onClick={() => setGiftPickerOpen((v) => !v)}
                        aria-label="Send gift"
                      >
                        <Gift className="size-4" />
                      </Button>
                    )}
                    {!isHost && !isCoHost && !isOver && activeIdentity && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-white hover:bg-white/15 lg:hidden"
                        onClick={requestJoinLive}
                        disabled={joinRequestPending}
                        aria-label="Request to join live"
                      >
                        {joinRequestPending ? (
                          <Radio className="size-4 animate-pulse" />
                        ) : (
                          <LogIn className="size-4" />
                        )}
                      </Button>
                    )}
                    {/* Like button — A5: shows the price when paid mode is on. */}
                    <button
                      type="button"
                      onClick={sendReaction}
                      aria-label={
                        paidEnabled ? `Send a like (${reactionPrice} points)` : "Send a like"
                      }
                      className="press flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-3 text-white size-9 justify-center"
                    >
                      <Heart className="size-4" />
                      {paidEnabled && reactionPrice > 0 && (
                        <span className="text-[10px] font-extrabold">{reactionPrice}</span>
                      )}
                    </button>
                  </div>
                </>
              )}
              {replyingTo && (
                <>
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendChat()}
                    placeholder={paidEnabled ? `Reply · ${commentPrice} pts` : ""}
                    autoFocus
                    className="h-9 min-w-0 flex-1 rounded-full border border-white/20 bg-white/10 px-3 text-sm text-white placeholder:text-white/50 outline-none focus:border-white/40"
                  />
                  <Button
                    size="icon"
                    variant="brand"
                    onClick={sendChat}
                    disabled={!draft.trim()}
                    className="shrink-0"
                    aria-label="Send reply"
                  >
                    <Send className="size-4" />
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* A5 — paid-interaction confirm-once dialog */}
      <Dialog open={paidConfirmOpen !== null} onOpenChange={(v) => !v && setPaidConfirmOpen(null)}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>
              {paidConfirmOpen === "reaction" ? "Send a paid like?" : "Send a paid comment?"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 px-1 text-sm">
            <p className="text-muted-foreground">
              Paid interactions cost Kingdom Points which go to the host.{" "}
              {paidConfirmOpen === "reaction"
                ? `Each like costs ${reactionPrice} point${reactionPrice === 1 ? "" : "s"}.`
                : `Each comment costs ${commentPrice} point${commentPrice === 1 ? "" : "s"}.`}{" "}
              Your balance: <b className="text-foreground">{walletPoints} pts</b>.
            </p>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={paidConfirmDontAsk}
                onChange={(e) => setPaidConfirmDontAsk(e.target.checked)}
                className="size-4 accent-primary"
              />
              Don't ask again for this stream
            </label>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setPaidConfirmOpen(null)}>
                Cancel
              </Button>
              <Button
                variant="brand"
                className="flex-1"
                disabled={
                  walletPoints < (paidConfirmOpen === "reaction" ? reactionPrice : commentPrice)
                }
                onClick={confirmPaidInteraction}
              >
                {paidConfirmOpen === "reaction"
                  ? `Like · ${reactionPrice} pts`
                  : `Send · ${commentPrice} pts`}
              </Button>
            </div>
            {walletPoints < (paidConfirmOpen === "reaction" ? reactionPrice : commentPrice) && (
              <p className="text-xs text-danger">
                Not enough Kingdom Points —{" "}
                <Link to="/wallet" className="underline">
                  top up your wallet
                </Link>
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ReportDialog streamId={streamId} open={reportOpen} onOpenChange={setReportOpen} />
      <AddModeratorDialog
        streamId={streamId}
        asStaff={asStaff}
        open={addModOpen}
        onOpenChange={setAddModOpen}
      />
    </div>
  );
}

function HostEarnings({
  streamId,
  isOver,
  asStaff,
}: {
  streamId: string;
  isOver: boolean;
  asStaff: boolean;
}) {
  const { data } = useLiveEarnings(streamId, true, asStaff);
  if (!data) return null;
  const paid = data.paidInteractions;
  const paidTotal = paid ? paid.likePoints + paid.commentPoints + paid.reactionPoints : 0;
  return (
    <div className="border-t border-border px-4 py-2.5 text-sm">
      <div className="flex items-center gap-2">
        <DollarSign className="size-4 text-success" />
        <span className="font-bold text-success">{formatCount(data.totalPoints)} points</span>
        <span className="text-muted-foreground">
          earned from {data.giftCount} gifts{isOver ? " this stream" : " so far"}
        </span>
      </div>
      {paid && paidTotal > 0 && (
        <p className="mt-1 text-xs text-muted-foreground">
          Paid interactions: {formatCount(paidTotal)} pts — {paid.likeCount} likes,{" "}
          {paid.commentCount} comments, {paid.reactionCount} reactions
        </p>
      )}
    </div>
  );
}
