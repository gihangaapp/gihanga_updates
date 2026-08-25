import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  DollarSign,
  Flag,
  Gift,
  Heart,
  Mic,
  MicOff,
  MoreVertical,
  Pin,
  Radio,
  Send,
  Settings2,
  Share2,
  ShieldBan,
  ShieldOff,
  SwitchCamera,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
  Video,
  VideoOff,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
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
} from "@/hooks/use-live";
import { useFollowUser, useFollowingSet } from "@/hooks/use-social";
import { useToggleBlock, useBlockedSet } from "@/hooks/use-blocks";
import { useBrowserLiveRoom } from "@/lib/browser-live";
import { getLiveSocket } from "@/lib/socket-client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/live/$streamId")({
  head: () => ({
    meta: [{ title: "Live — Gihanga Updates" }, { name: "description", content: "Watch a live stream on Gihanga Updates." }],
  }),
  component: LiveRoomPage,
});

type Author = { _id: string; name: string; username: string; avatarHue: number; avatarUrl: string | null; verified: boolean; isCreator: boolean };

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

function ReportDialog({ streamId, open, onOpenChange }: { streamId: string; open: boolean; onOpenChange: (v: boolean) => void }) {
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
                reason === r ? "border-primary bg-primary-soft text-primary" : "border-border text-muted-foreground",
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

function AddModeratorDialog({ streamId, asStaff, open, onOpenChange }: { streamId: string; asStaff: boolean; open: boolean; onOpenChange: (v: boolean) => void }) {
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
                onError: (err: any) => toast.error(err.message || "Couldn't add moderator"),
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
  const chatEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const stream = data?.stream as any;
  const isHost = Boolean(
    activeIdentity &&
      stream &&
      (stream.host._id === activeIdentity.id ||
        stream.host.username.trim().toLowerCase() === activeIdentity.username.trim().toLowerCase()),
  );
  const isMod = Boolean(
    activeIdentity && stream?.moderators?.some((m: Author) => m.username === activeIdentity.username),
  );
  const canModerate = isHost || isMod;
  const isOver = stream ? stream.status !== "live" || Boolean(ended) : false;

  const {
    localStream,
    remoteStream,
    connected,
    error: browserError,
    micOn,
    camOn,
    toggleMic,
    toggleCamera,
    switchCamera,
  } = useBrowserLiveRoom({
    streamId,
    publish: isHost,
    enabled: Boolean(stream) && !isOver,
  });
  const updateSettings = useUpdateLiveSettings(streamId, asStaff);
  const inviteFollowers = useInviteFollowers(streamId, asStaff);

  const activeMediaStream = isHost ? localStream : remoteStream;
  // Callback ref attaches the current stream as soon as the video node mounts.
  const setVideoRef = (node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node) node.srcObject = activeMediaStream ?? null;
  };

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = activeMediaStream ?? null;
  }, [activeMediaStream]);

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
        onError: (error: any) => {
          if (String(error?.message || "").toLowerCase().includes("ended")) {
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
    socket.emit("live:join", { streamId });

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
    return () => {
      socket.emit("live:leave", { streamId });
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
    };
  }, [streamId, navigate]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const visibleMessages = messages.filter((m) => !blockedSet?.has(m.sender.username));

  function sendChat() {
    if (!draft.trim()) return;
    getLiveSocket()?.emit("live:chat", { streamId, body: draft.trim() });
    setDraft("");
  }

  function sendReaction() {
    if (isOver) return;
    getLiveSocket()?.emit("live:react", { streamId, kind: "heart" });
    setReactionCount((n) => n + 1);
    setHeartBurst((n) => n + 1);
  }

  function handleEnd() {
    endLive.mutate(streamId, {
      onSuccess: () => {
        toast.success("Stream ended");
        navigate({ to: "/live" });
      },
      onError: (error: any) => toast.error(error.message || "Couldn't end the stream"),
    });
  }

  function handleGift(giftId: (typeof GIFT_CATALOG)[number]["id"]) {
    sendGift.mutate(giftId, {
      onSuccess: (res) => {
        setGiftPickerOpen(false);
        toast.success(`Gift sent! ${res.remainingPoints} points left`);
      },
      onError: (err: any) => toast.error(err.message || "Couldn't send that gift"),
    });
  }

  function shareStream() {
    const url = `${window.location.origin}/live/${streamId}`;
    if (navigator.share) {
      navigator.share({ title: stream?.title, url }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url);
      toast.success("Link copied");
    }
  }

  if (isLoading) {
    return (
      <AppShell>
        <p className="py-16 text-center text-sm text-muted-foreground">Loading stream…</p>
      </AppShell>
    );
  }
  if (!stream) {
    return (
      <AppShell>
        <div className="surface-card mx-auto mt-10 max-w-md p-10 text-center">
          <h1 className="mb-2 font-display text-xl font-bold">Stream not found</h1>
          <Button variant="brand" asChild>
            <Link to="/live">Back to live streams</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const following = followingSet?.has(stream.host.username) ?? false;

  return (
    <AppShell>
      <div className="mx-auto grid w-full max-w-[1100px] gap-4 lg:grid-cols-[1fr_320px]">
        <div className="surface-card overflow-hidden p-0">
          <div className="relative aspect-video w-full bg-black">
            {isOver ? (
              <div className="flex size-full flex-col items-center justify-center gap-2 text-white/70">
                <VideoOff className="size-10" />
                <p className="font-semibold">{ended || "This stream has ended"}</p>
                <Button variant="outline" className="mt-2 border-white/30 text-white" asChild>
                  <Link to="/live">Browse other streams</Link>
                </Button>
              </div>
            ) : browserError ? (
              <div className="flex size-full flex-col items-center justify-center gap-2 p-6 text-center text-white/70">
                <VideoOff className="size-8 text-danger" />
                <p className="text-sm">{browserError}</p>
              </div>
            ) : (
              <>
                <video ref={setVideoRef} autoPlay muted={isHost} playsInline className="size-full object-contain" />
                {!connected && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 text-white/80">
                    <Video className="size-8 animate-pulse" />
                    <p className="text-sm">{isHost ? "Starting your camera…" : "Connecting to the stream…"}</p>
                  </div>
                )}
                {!isHost && connected && !remoteStream && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 text-white/80">
                    <Video className="size-8" />
                    <p className="text-sm">Waiting for the host's video…</p>
                  </div>
                )}
              </>
            )}

            <FloatingHearts burst={heartBurst} />

            {!isOver && (
              <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
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
              </div>
            )}

            {isHost && !isOver && (
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <Button size="icon" variant="secondary" className="rounded-full" onClick={toggleMic}>
                  {micOn ? <Mic className="size-4" /> : <MicOff className="size-4" />}
                </Button>
                <Button size="icon" variant="secondary" className="rounded-full" onClick={toggleCamera}>
                  {camOn ? <Video className="size-4" /> : <VideoOff className="size-4" />}
                </Button>
                <Button size="icon" variant="secondary" className="rounded-full" onClick={switchCamera}>
                  <SwitchCamera className="size-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={handleEnd} disabled={endLive.isPending}>
                  <X className="size-4" /> {endLive.isPending ? "Ending…" : "End stream"}
                </Button>
              </div>
            )}

            {!isOver && (
              <button
                type="button"
                onClick={sendReaction}
                aria-label="Send a like"
                className="press absolute right-3 bottom-3 grid size-11 place-items-center rounded-full bg-white/15 text-white backdrop-blur"
              >
                <Heart className="size-5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 p-4">
            <Link to="/profile/$username" params={{ username: stream.host.username }}>
              <GAvatar user={toDisplayUser(stream.host)} size="md" />
            </Link>
            <div className="min-w-0 flex-1">
              <UserName user={toDisplayUser(stream.host)} />
              <p className="truncate text-sm text-muted-foreground">{stream.title}</p>
            </div>

            {!isHost && (
              <Button
                variant={following ? "soft" : "default"}
                size="sm"
                onClick={() => followUser.mutate({ username: stream.host.username, follow: !following })}
              >
                {following ? "Following" : "Follow"}
              </Button>
            )}

            {!isHost && !isOver && stream.giftsEnabled && (
              <Button variant="brand" size="sm" onClick={() => setGiftPickerOpen((v) => !v)}>
                <Gift className="size-4" /> Gift
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label="More options">
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
                        onError: (err: any) => toast.error(err.message || "Couldn't send invites"),
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
                            toast.success(stream.giftsEnabled ? "Gifts disabled for this stream" : "Gifts enabled"),
                        },
                      );
                    }}
                  >
                    <Settings2 className="size-4" /> {stream.giftsEnabled ? "Disable gifts" : "Enable gifts"}
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
          </div>

          {isHost && (
            <HostEarnings streamId={streamId} isOver={isOver} asStaff={asStaff} />
          )}

          {giftPickerOpen && (
            <div className="grid grid-cols-4 gap-2 border-t border-border p-4">
              {GIFT_CATALOG.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => handleGift(g.id)}
                  disabled={sendGift.isPending || (walletData?.wallet.kingdomPoints ?? 0) < g.cost}
                  className="press flex flex-col items-center gap-1 rounded-xl border border-border p-3 hover:bg-muted disabled:opacity-40"
                >
                  <span className="text-2xl">{g.emoji}</span>
                  <span className="text-xs font-bold">{g.cost} pts</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="surface-card flex max-h-[70vh] flex-col p-0 lg:max-h-[600px]">
          <header className="border-b border-border p-3">
            <p className="text-sm font-bold">Live chat</p>
          </header>

          {pinned && (
            <div className="flex items-start gap-2 border-b border-border bg-primary-soft/50 p-2.5 text-xs">
              <Pin className="mt-0.5 size-3.5 shrink-0 text-primary" />
              <p className="min-w-0 flex-1 leading-snug">
                <span className="font-bold">{pinned.sender.username}</span>{" "}
                <span className="text-foreground/80">{pinned.body}</span>
              </p>
              {canModerate && (
                <button
                  type="button"
                  onClick={() => getLiveSocket()?.emit("live:unpin-comment", { streamId, commentId: pinned._id })}
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          )}

          <div className="flex-1 space-y-2.5 overflow-y-auto p-3">
            {visibleMessages.length === 0 && (
              <p className="py-6 text-center text-xs text-muted-foreground">Say hello 👋</p>
            )}
            {visibleMessages.map((m) => (
              <div key={m._id} className="group flex items-start gap-2 text-sm">
                <GAvatar user={toDisplayUser(m.sender)} size="xs" />
                <p className="min-w-0 flex-1 leading-snug break-words">
                  <span className="font-bold">{m.sender.username}</span>{" "}
                  {m.isGift ? (
                    <span className="font-semibold text-amber-500">
                      <Heart className="inline size-3.5 fill-amber-500" /> {m.body}
                    </span>
                  ) : (
                    <span className="text-foreground/85">{m.body}</span>
                  )}
                </p>
                {(canModerate || m.sender.username !== activeIdentity?.username) && !m.isGift && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        aria-label="Message options"
                        className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground"
                      >
                        <MoreVertical className="size-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      {canModerate && (
                        <>
                          <DropdownMenuItem
                            onClick={() => getLiveSocket()?.emit("live:pin-comment", { streamId, commentId: m._id })}
                          >
                            <Pin className="size-3.5" /> Pin
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-danger"
                            onClick={() => getLiveSocket()?.emit("live:delete-comment", { streamId, commentId: m._id })}
                          >
                            <Trash2 className="size-3.5" /> Delete
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              muteViewer.mutate(m.sender._id, {
                                onSuccess: (r) => toast.success(r.muted ? `Muted @${m.sender.username}` : `Unmuted @${m.sender.username}`),
                              })
                            }
                          >
                            <ShieldOff className="size-3.5" /> Mute
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-danger"
                            onClick={() =>
                              banViewer.mutate(m.sender._id, {
                                onSuccess: (r) => toast.success(r.banned ? `Banned @${m.sender.username}` : `Unbanned @${m.sender.username}`),
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
                              { username: m.sender.username, block: !blockedSet?.has(m.sender.username) },
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
          {!isOver && (
            <div className="flex items-center gap-2 border-t border-border p-3">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChat()}
                placeholder="Send a message…"
                className="h-10 flex-1 rounded-full border border-border bg-elevated px-3.5 text-sm outline-none focus:border-ring"
              />
              <Button size="icon" variant="brand" onClick={sendChat} disabled={!draft.trim()}>
                <Send className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <ReportDialog streamId={streamId} open={reportOpen} onOpenChange={setReportOpen} />
      <AddModeratorDialog streamId={streamId} asStaff={asStaff} open={addModOpen} onOpenChange={setAddModOpen} />
    </AppShell>
  );
}

function HostEarnings({ streamId, isOver, asStaff }: { streamId: string; isOver: boolean; asStaff: boolean }) {
  const { data } = useLiveEarnings(streamId, true, asStaff);
  if (!data) return null;
  return (
    <div className="flex items-center gap-2 border-t border-border px-4 py-2.5 text-sm">
      <DollarSign className="size-4 text-success" />
      <span className="font-bold text-success">{formatCount(data.totalPoints)} points</span>
      <span className="text-muted-foreground">earned from {data.giftCount} gifts{isOver ? " this stream" : " so far"}</span>
    </div>
  );
}
