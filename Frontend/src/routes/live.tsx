import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Flame, Gift, Lock, Mic, MicOff, Play, Radio, Search, SwitchCamera, Users, Video, VideoOff } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { GAvatar } from "@/components/common/GAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import { useCameraPreview, useLiveKitRoom } from "@/lib/livekit";
import { formatCount } from "@/lib/format";
import {
  useLiveKitConfig,
  useLiveKitToken,
  useLiveStreams,
  useStartLive,
  type LiveStreamData,
} from "@/hooks/use-live";
import { getLiveSocket } from "@/lib/socket-client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/live")({
  head: () => ({
    meta: [
      { title: "Live Streams — Gihanga Updates" },
      {
        name: "description",
        content: "Watch creators streaming live right now on Gihanga Updates, or start your own broadcast.",
      },
      { property: "og:title", content: "Live Streams — Gihanga Updates" },
      { property: "og:description", content: "Watch live streams from creators on Gihanga Updates." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LiveDiscoveryPage,
});

function toDisplayUser(host: LiveStreamData["host"]) {
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
    posts: 0,
  };
}

function LiveVideoPreview({
  stream,
  enabled,
  asStaff,
  isOwnStream,
}: {
  stream: LiveStreamData;
  enabled: boolean;
  asStaff: boolean;
  isOwnStream: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { data: kitConfig } = useLiveKitConfig();
  const { data: tokenData, isLoading: tokenLoading, error: tokenError } = useLiveKitToken(
    stream._id,
    enabled && (kitConfig?.liveKitConfigured ?? false),
    asStaff,
  );
  const { remoteStream, connected, error: roomError } = useLiveKitRoom({
    url: tokenData?.livekitUrl ?? null,
    token: tokenData?.livekitToken ?? null,
    publish: false,
    enabled: Boolean(tokenData?.livekitToken),
  });

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = remoteStream ?? null;
  }, [remoteStream]);

  useEffect(() => {
    if (!enabled || !tokenData?.livekitToken) return;
    const socket = getLiveSocket();
    if (!socket) return;
    socket.emit("live:join", { streamId: stream._id });
    return () => {
      socket.emit("live:leave", { streamId: stream._id });
    };
  }, [enabled, stream._id, tokenData?.livekitToken]);

  const hasVideo = Boolean(remoteStream?.getVideoTracks().length);
  const status = isOwnStream
    ? "This is your live — open it to manage and preview your broadcast"
    : !enabled
      ? "Sign in to watch this live video"
      : !kitConfig?.liveKitConfigured
        ? "Live video is not configured on the server"
        : tokenError || roomError
          ? `Live video unavailable: ${(tokenError as any)?.message || roomError || "connection failed"}`
          : tokenLoading || !connected
            ? "Connecting to the live camera…"
            : !hasVideo
              ? "Waiting for the host's video…"
              : "";

  return (
    <>
      {hasVideo ? (
        <video ref={videoRef} autoPlay muted playsInline className="size-full object-contain" />
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-3 text-white/80">
          <GAvatar user={toDisplayUser(stream.host)} size="xl" />
          <p className="text-xs font-semibold">{status}</p>
        </div>
      )}
    </>
  );
}

function GoLiveDialog({ open, onOpenChange, asStaff }: { open: boolean; onOpenChange: (v: boolean) => void; asStaff: boolean }) {
  const navigate = useNavigate();
  const startLive = useStartLive(asStaff);
  const [step, setStep] = useState<"details" | "preview">("details");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subsOnly, setSubsOnly] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { stream, error, micOn, camOn, cameraDeviceId, facing, toggleMic, toggleCam, flipCamera } =
    useCameraPreview(step === "preview");

  useEffect(() => {
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
      sessionStorage.setItem(
        "gihanga_live_camera_preference",
        JSON.stringify({ deviceId: cameraDeviceId, facingMode: videoTrack?.getSettings().facingMode ?? facing }),
      );
    } catch {
      // Camera preference persistence is best-effort only.
    }
    startLive.mutate(
      { title: title.trim(), description: description.trim() || undefined, subsOnly, giftsEnabled: true },
      {
        onSuccess: (data) => {
          onOpenChange(false);
          reset();
          navigate({ to: "/live/$streamId", params: { streamId: data.stream._id } });
        },
        onError: (err: any) => toast.error(err.message || "Couldn't start your stream"),
      },
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{step === "details" ? "Go live" : "Preview your camera"}</DialogTitle>
        </DialogHeader>

        {step === "details" ? (
          <div className="flex flex-col gap-3 px-1">
            <Textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What are you streaming today?"
              maxLength={200}
              className="min-h-16 resize-none"
            />
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description (optional)"
              maxLength={1000}
              className="min-h-16 resize-none"
            />
            <button
              type="button"
              onClick={() => setSubsOnly((v) => !v)}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-left text-sm font-semibold",
                subsOnly ? "border-primary bg-primary-soft text-primary" : "border-border text-muted-foreground",
              )}
            >
              <Lock className="size-4" />
              Followers-only stream
            </button>
            <Button variant="brand" size="lg" onClick={goToPreview}>
              Continue
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 px-1">
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">
              {error ? (
                <div className="flex size-full items-center justify-center p-4 text-center text-sm text-white/70">
                  {error}
                </div>
              ) : (
                <video ref={videoRef} autoPlay muted playsInline className="size-full object-contain" />
              )}
              <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-2">
                <Button size="icon" variant={micOn ? "secondary" : "destructive"} onClick={toggleMic} className="rounded-full">
                  {micOn ? <Mic className="size-4" /> : <MicOff className="size-4" />}
                </Button>
                <Button size="icon" variant={camOn ? "secondary" : "destructive"} onClick={toggleCam} className="rounded-full">
                  {camOn ? <Video className="size-4" /> : <VideoOff className="size-4" />}
                </Button>
                <Button size="icon" variant="secondary" onClick={flipCamera} className="rounded-full">
                  <SwitchCamera className="size-4" />
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep("details")}>
                Back
              </Button>
              <Button variant="brand" className="flex-1" onClick={goLive} disabled={startLive.isPending || !stream}>
                <Radio className="size-4" />
                {startLive.isPending ? "Starting…" : "Start streaming"}
              </Button>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              We'll ask for camera and microphone access.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function LiveDiscoveryPage() {
  const { user, staffUser } = useAuth();
  const navigate = useNavigate();
  // A moderator/admin/superadmin can go live too — even with only their
  // staff session open, no consumer login needed.
  const canGoLive = Boolean(user?.isCreator || staffUser);
  const asStaff = !user && Boolean(staffUser);
  const [searchQuery, setSearchQuery] = useState("");
  const [goLiveOpen, setGoLiveOpen] = useState(false);
  const { data, isLoading } = useLiveStreams();

  const streams = data?.streams ?? [];
  const activeIdentity = user ?? staffUser;
  const activeOwnStream = streams.find((candidate) => candidate.host.username === activeIdentity?.username);
  const visible = streams.filter(
    (s) =>
      !searchQuery ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.host.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const featured = visible[0];
  const rest = visible.slice(1);
  const featuredIsOwnStream = Boolean(featured && activeOwnStream?._id === featured._id);

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[900px] space-y-6">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight">Live Streams</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">What's happening right now on Gihanga Updates</p>
          </div>
          {canGoLive && (
            <Button
              variant="brand"
              onClick={() =>
                activeOwnStream
                  ? navigate({ to: "/live/$streamId", params: { streamId: activeOwnStream._id } })
                  : setGoLiveOpen(true)
              }
            >
              <Radio className="size-4" /> {activeOwnStream ? "Manage live" : "Go Live"}
            </Button>
          )}
        </header>

        {isLoading && <p className="py-10 text-center text-sm text-muted-foreground">Loading live streams…</p>}

        {!isLoading && !streams.length && (
          <div className="surface-card flex flex-col items-center gap-2 py-16 text-center">
            <Radio className="size-8 text-muted-foreground" />
            <p className="font-bold text-muted-foreground">No one is live right now</p>
            {canGoLive ? (
              <Button
                variant="brand"
                size="sm"
                onClick={() =>
                  activeOwnStream
                    ? navigate({ to: "/live/$streamId", params: { streamId: activeOwnStream._id } })
                    : setGoLiveOpen(true)
                }
              >
                {activeOwnStream ? "Manage your live stream" : "Be the first to go live"}
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">Check back soon, or follow creators to get notified.</p>
            )}
          </div>
        )}

        {featured && (
          <Link
            to="/live/$streamId"
            params={{ streamId: featured._id }}
            className="surface-card group block cursor-pointer overflow-hidden p-0"
          >
            <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden bg-black">
              <LiveVideoPreview
                stream={featured}
                enabled={Boolean(activeIdentity) && !featuredIsOwnStream}
                asStaff={asStaff}
                isOwnStream={featuredIsOwnStream}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-lg bg-danger px-2.5 py-1 text-xs font-bold text-white animate-pulse">
                  <Radio className="size-3" /> LIVE
                </span>
                <span className="flex items-center gap-1 rounded-lg bg-black/60 px-2.5 py-1 text-xs font-bold text-white">
                  <Users className="size-3" /> {formatCount(featured.viewerCount)} watching
                </span>
                {featured.totalGifts > 0 && (
                  <span className="flex items-center gap-1 rounded-lg bg-amber-500/90 px-2.5 py-1 text-xs font-bold text-black">
                    <Gift className="size-3" /> {formatCount(featured.totalGifts)} pts
                  </span>
                )}
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm leading-tight font-bold text-white">{featured.host.name}</p>
                    <p className="mt-0.5 text-xs text-white/70">@{featured.host.username}</p>
                  </div>
                </div>
                <Button size="sm" className="gap-1.5 bg-white font-bold text-black hover:bg-white/90">
                  <Play className="size-3.5 fill-black" /> Watch Live
                </Button>
              </div>
            </div>
            <div className="p-4">
              <p className="font-display text-lg leading-snug font-bold">{featured.title}</p>
            </div>
          </Link>
        )}

        {streams.length > 0 && (
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-3.5 py-2.5">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search live streams or creators…"
              className="h-auto border-0 bg-transparent p-0 text-sm focus-visible:ring-0"
            />
          </div>
        )}

        {rest.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((s) => (
              <li key={s._id} className="surface-card group overflow-hidden p-0">
                <Link to="/live/$streamId" params={{ streamId: s._id }} className="block">
                  <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-black">
                    <GAvatar user={toDisplayUser(s.host)} size="lg" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="flex items-center gap-1 rounded-md bg-danger px-1.5 py-0.5 text-[10px] font-bold text-white">
                        <Radio className="size-2.5 animate-pulse" /> LIVE
                      </span>
                      {s.subsOnly && (
                        <span className="flex items-center gap-1 rounded-md bg-amber-500/90 px-1.5 py-0.5 text-[10px] font-bold text-black">
                          <Lock className="size-2.5" /> Followers only
                        </span>
                      )}
                    </div>
                    <span className="absolute right-2 bottom-2 flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      <Users className="size-2.5" /> {formatCount(s.viewerCount)}
                    </span>
                  </div>
                  <div className="p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <GAvatar user={toDisplayUser(s.host)} size="xs" />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold">{s.host.name}</p>
                        <p className="truncate text-[10px] text-muted-foreground">@{s.host.username}</p>
                      </div>
                    </div>
                    <p className="line-clamp-2 text-sm leading-snug font-bold">{s.title}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Gift className="size-3 text-amber-400" /> {formatCount(s.totalGifts)} pts
                      </span>
                      <Button size="sm" variant="brand" className="h-7 px-3 text-[11px] font-bold">
                        <Play className="size-3 fill-current" /> Join
                      </Button>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {canGoLive && streams.length > 0 && (
          <div className="surface-card flex flex-wrap items-center gap-4 p-5">
            <Flame className="size-8 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="font-bold">Ready to go live?</p>
              <p className="text-sm text-muted-foreground">Share your moment with your followers in real time.</p>
            </div>
            <Button
              variant="brand"
              size="sm"
              onClick={() =>
                activeOwnStream
                  ? navigate({ to: "/live/$streamId", params: { streamId: activeOwnStream._id } })
                  : setGoLiveOpen(true)
              }
            >
              <Radio className="size-4" /> {activeOwnStream ? "Manage live" : "Go Live"}
            </Button>
          </div>
        )}
      </div>
      <GoLiveDialog open={goLiveOpen} onOpenChange={setGoLiveOpen} asStaff={asStaff} />
    </AppShell>
  );
}
