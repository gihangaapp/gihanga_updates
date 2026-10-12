import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  AlignLeft,
  Check,
  ChevronDown,
  Lock,
  Mic,
  MicOff,
  Radio,
  Settings,
  SwitchCamera,
  Users,
  Video,
  VideoOff,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth-context";
import { useCameraPreview } from "@/lib/live-room";
import { useStartLive } from "@/hooks/use-live";
import { cn } from "@/lib/utils";

type SheetKind = "none" | "title" | "audience" | "settings";

/**
 * Minimal, full-screen "Go live" screen for phones — camera fills the screen,
 * a slim tool rail on the left, audience pill, one big live button and a
 * 3-2-1 countdown. Desktop keeps the existing dialog (see GoLiveDialog).
 */
export function MobileGoLive({
  open,
  onClose,
  asStaff,
}: {
  open: boolean;
  onClose: () => void;
  asStaff: boolean;
}) {
  const navigate = useNavigate();
  const { user, staffUser } = useAuth();
  const me = (user ?? staffUser) as { name?: string; username?: string } | null | undefined;
  const startLive = useStartLive(asStaff);

  const [title, setTitle] = useState("");
  const [titleDraft, setTitleDraft] = useState("");
  const [description, setDescription] = useState("");
  const [subsOnly, setSubsOnly] = useState(false);
  const [sheet, setSheet] = useState<SheetKind>("none");
  const [countdown, setCountdown] = useState<number | null>(null);

  const { stream, error, micOn, camOn, cameraDeviceId, facing, toggleMic, toggleCam, flipCamera } =
    useCameraPreview(open);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const setVideoRef = useCallback(
    (node: HTMLVideoElement | null) => {
      videoRef.current = node;
      if (node && stream) node.srcObject = stream;
    },
    [stream],
  );
  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream]);

  const reset = useCallback(() => {
    setTitle("");
    setTitleDraft("");
    setDescription("");
    setSubsOnly(false);
    setSheet("none");
    setCountdown(null);
  }, []);

  const launch = useCallback(() => {
    try {
      const videoTrack = stream?.getVideoTracks()[0];
      sessionStorage.setItem(
        "gihanga_live_camera_preference",
        JSON.stringify({
          deviceId: cameraDeviceId,
          facingMode: videoTrack?.getSettings().facingMode ?? facing,
        }),
      );
    } catch {
      // Camera preference persistence is best-effort only.
    }
    startLive.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        subsOnly,
        giftsEnabled: true,
      },
      {
        onSuccess: (data) => {
          onClose();
          reset();
          navigate({ to: "/live/$streamId", params: { streamId: data.stream._id } });
        },
        onError: (err: any) => {
          setCountdown(null);
          toast.error(err.message || "Couldn't start your stream");
        },
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream, cameraDeviceId, facing, title, description, subsOnly]);

  // 3 → 2 → 1 → go live
  useEffect(() => {
    if (countdown == null) return;
    if (countdown === 0) {
      launch();
      return;
    }
    const t = window.setTimeout(() => setCountdown((c) => (c == null ? c : c - 1)), 1000);
    return () => window.clearTimeout(t);
  }, [countdown, launch]);

  if (!open) return null;

  function close() {
    onClose();
    reset();
  }

  function pressLive() {
    if (!title.trim()) {
      setTitleDraft(title);
      setSheet("title");
      toast.info("Add a title to go live");
      return;
    }
    if (!stream) return;
    setCountdown(3);
  }

  const initial = (me?.name ?? me?.username ?? "?").trim().charAt(0).toUpperCase();

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-black text-white">
      {/* ── Camera preview ── */}
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-b-[28px] bg-neutral-900">
        {error ? (
          <div className="flex size-full items-center justify-center p-8 text-center text-sm text-white/70">
            {error}
          </div>
        ) : (
          <video
            ref={setVideoRef}
            autoPlay
            muted
            playsInline
            className={cn(
              "absolute inset-0 size-full object-cover",
              facing === "user" && "scale-x-[-1]",
              !camOn && "opacity-0",
            )}
          />
        )}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/50 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Top bar */}
        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))]">
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="press grid size-10 place-items-center rounded-full text-white"
          >
            <X className="size-7" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={() => setSheet("settings")}
            aria-label="Live settings"
            className="press grid size-10 place-items-center rounded-full text-white"
          >
            <Settings className="size-6" strokeWidth={1.75} />
          </button>
        </div>

        {/* Left tool rail */}
        <div className="absolute top-1/2 left-3 z-10 flex -translate-y-1/2 flex-col gap-5">
          <RailButton
            label="Add a title"
            active={Boolean(title.trim())}
            onClick={() => {
              setTitleDraft(title);
              setSheet("title");
            }}
          >
            <AlignLeft className="size-6" strokeWidth={1.75} />
          </RailButton>
          <RailButton label="Audience" active={subsOnly} onClick={() => setSheet("audience")}>
            {subsOnly ? (
              <Lock className="size-6" strokeWidth={1.75} />
            ) : (
              <Users className="size-6" strokeWidth={1.75} />
            )}
          </RailButton>
        </div>

        {/* Title chip + audience pill */}
        <div className="absolute inset-x-0 bottom-4 z-10 flex flex-col items-center gap-2 px-6">
          {title.trim() && (
            <p className="max-w-full truncate rounded-full bg-black/45 px-3.5 py-1 text-sm font-semibold backdrop-blur">
              {title.trim()}
            </p>
          )}
          <button
            type="button"
            onClick={() => setSheet("audience")}
            className="press flex items-center gap-1.5 rounded-full bg-black/45 px-3.5 py-1.5 text-sm font-bold backdrop-blur"
          >
            {subsOnly ? <Lock className="size-4" /> : <Users className="size-4" />}
            {subsOnly ? "Followers" : "Everyone"}
            <ChevronDown className="size-4" />
          </button>
        </div>
      </div>

      {/* ── Bottom controls ── */}
      <div className="flex items-center justify-between px-8 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={toggleMic}
          aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
          className={cn(
            "press grid size-11 place-items-center rounded-full",
            micOn ? "bg-white/10 text-white" : "bg-danger text-white",
          )}
        >
          {micOn ? <Mic className="size-5" /> : <MicOff className="size-5" />}
        </button>

        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={pressLive}
            disabled={!stream || startLive.isPending}
            aria-label="Start live video"
            className="press grid size-[74px] place-items-center rounded-full border-4 border-white p-1 disabled:opacity-50"
          >
            <span className="grid size-full place-items-center rounded-full gradient-brand text-primary-foreground">
              <Radio className="size-8" strokeWidth={1.75} />
            </span>
          </button>
          <span className="text-xs font-extrabold tracking-[0.25em] uppercase">Live</span>
        </div>

        <button
          type="button"
          onClick={flipCamera}
          aria-label="Flip camera"
          className="press grid size-11 place-items-center rounded-full bg-white/10 text-white"
        >
          <SwitchCamera className="size-5" />
        </button>
      </div>

      {/* ── Sheets ── */}
      {sheet !== "none" && (
        <div className="absolute inset-0 z-20 flex items-end bg-black/40" onClick={() => setSheet("none")}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full rounded-t-3xl bg-neutral-900 px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/30" />

            {sheet === "title" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full gradient-brand text-base font-extrabold text-primary-foreground">
                    {initial}
                  </span>
                  <input
                    autoFocus
                    value={titleDraft}
                    onChange={(e) => setTitleDraft(e.target.value)}
                    maxLength={200}
                    placeholder="Add a title…"
                    className="min-w-0 flex-1 bg-transparent text-lg font-semibold text-white outline-none placeholder:text-white/60"
                  />
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={1000}
                  rows={2}
                  placeholder="Description (optional)"
                  className="w-full resize-none rounded-xl bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-white/50"
                />
                <p className="text-sm text-white/60">
                  Your followers and anyone watching will see this title.
                </p>
                <Button
                  variant="brand"
                  size="lg"
                  className="w-full rounded-xl"
                  disabled={!titleDraft.trim()}
                  onClick={() => {
                    setTitle(titleDraft.trim());
                    setSheet("none");
                  }}
                >
                  Add title
                </Button>
              </div>
            )}

            {sheet === "audience" && (
              <div className="space-y-1">
                <h2 className="pb-3 text-center text-lg font-bold">Audience</h2>
                <AudienceRow
                  icon={<Users className="size-5" />}
                  label="Everyone"
                  selected={!subsOnly}
                  onClick={() => {
                    setSubsOnly(false);
                    setSheet("none");
                  }}
                />
                <AudienceRow
                  icon={<Lock className="size-5" />}
                  label="Followers only"
                  hint="Only people who follow you can watch."
                  selected={subsOnly}
                  onClick={() => {
                    setSubsOnly(true);
                    setSheet("none");
                  }}
                />
              </div>
            )}

            {sheet === "settings" && (
              <div className="space-y-1">
                <div className="flex items-center justify-between pb-2">
                  <h2 className="text-lg font-bold">Live settings</h2>
                  <button
                    type="button"
                    onClick={() => setSheet("none")}
                    className="text-sm font-bold text-primary"
                  >
                    Done
                  </button>
                </div>
                <SettingRow
                  icon={micOn ? <Mic className="size-5" /> : <MicOff className="size-5" />}
                  label="Microphone"
                  checked={micOn}
                  onChange={toggleMic}
                />
                <SettingRow
                  icon={camOn ? <Video className="size-5" /> : <VideoOff className="size-5" />}
                  label="Camera"
                  checked={camOn}
                  onChange={toggleCam}
                />
                <SettingRow
                  icon={<Lock className="size-5" />}
                  label="Followers-only"
                  checked={subsOnly}
                  onChange={() => setSubsOnly((v) => !v)}
                />
                {asStaff && (
                  <p className="pt-2 text-xs text-white/60">
                    Viewers spend Kingdom Points to like, comment and react on your stream. You can
                    change prices while live.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 3-2-1 countdown ── */}
      {countdown != null && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-between bg-black py-[max(2rem,env(safe-area-inset-bottom))]">
          <span />
          <div className="relative grid size-24 place-items-center">
            <svg viewBox="0 0 100 100" className="absolute inset-0 size-full -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="white"
                strokeOpacity="0.5"
                strokeWidth="1.5"
                strokeDasharray="2 4"
              />
              <circle
                key={countdown}
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="289"
                strokeDashoffset="289"
                style={{ animation: "gihanga-count 1s linear forwards" }}
              />
            </svg>
            <span className="text-4xl font-light">{countdown === 0 ? "" : countdown}</span>
          </div>
          <button
            type="button"
            onClick={() => setCountdown(null)}
            className="press px-6 py-2 text-lg font-medium"
          >
            Cancel
          </button>
          <style>{"@keyframes gihanga-count{to{stroke-dashoffset:0}}"}</style>
        </div>
      )}
    </div>
  );
}

function RailButton({
  children,
  label,
  active,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "press relative grid size-10 place-items-center rounded-full text-white [filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.6))]",
        active && "text-primary",
      )}
    >
      {children}
      {active && <span className="absolute top-1 right-1 size-2 rounded-full bg-primary" />}
    </button>
  );
}

function AudienceRow({
  icon,
  label,
  hint,
  selected,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  hint?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="press flex w-full items-center gap-3 rounded-xl py-2.5 text-left"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white/10">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold">{label}</span>
        {hint && <span className="block text-sm text-white/60">{hint}</span>}
      </span>
      <span
        className={cn(
          "grid size-6 place-items-center rounded-full border-2",
          selected ? "border-primary bg-primary text-primary-foreground" : "border-white/40",
        )}
      >
        {selected && <Check className="size-3.5" strokeWidth={3} />}
      </span>
    </button>
  );
}

function SettingRow({
  icon,
  label,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center gap-3 border-t border-white/10 py-3">
      <span className="text-white/80">{icon}</span>
      <span className="flex-1 text-base font-medium">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
