import { useEffect, useRef, useState } from "react";
import {
  Camera,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Type,
  X,
  Zap,
  ZapOff,
  MicOff,
  Mic,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { livePreviewConstraints } from "@/lib/live-video-config";

export interface CapturedMedia {
  file: File;
  previewUrl: string;
  isVideo: boolean;
}

interface StoryCameraProps {
  onCaptureMedia: (media: CapturedMedia) => void;
  onOpenGallery: () => void;
  onOpenTextStory: () => void;
  onClose: () => void;
}

/** B3 — camera permission/denied error → specific human message. */
function cameraErrorMessage(err: unknown): string {
  const name = err instanceof DOMException ? err.name : "";
  switch (name) {
    case "NotAllowedError":
      return "Camera access was blocked. Allow it in your browser settings, or pick something from your gallery below.";
    case "NotFoundError":
      return "No camera was found on this device. You can still upload photos & videos from your gallery or create a text story.";
    case "NotReadableError":
      return "Your camera is in use by another app. Close it and try again, or use the gallery instead.";
    case "OverconstrainedError":
      return "This device can't provide the requested camera mode. Try switching cameras.";
    default:
      return "The camera couldn't start. You can still use your gallery or create a text story.";
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
export function StoryCamera({
  onCaptureMedia,
  onOpenGallery,
  onOpenTextStory,
  onClose,
}: StoryCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const wantAudioRef = useRef(false);

  // hasPermission === null → the camera is still STARTING (skeleton state).
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [flashOn, setFlashOn] = useState(false);
  const [mode, setMode] = useState<"photo" | "video" | "text">("photo");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasAudio, setHasAudio] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Acquire the camera (re-runs ONLY when facingMode changes) ────────────
  useEffect(() => {
    let isMounted = true;

    async function initCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setHasPermission(false);
        setErrorDetail("Camera access is unavailable. Open the site over HTTPS or localhost.");
        return;
      }

      // Stop previous tracks (facing-mode switch only).
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      setCameraReady(false);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: livePreviewConstraints(facingMode),
          // Audio is requested lazily on Video mode (see ensureAudioTrack).
          audio: false,
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
          // Fade the live video in once real frames exist — the skeleton
          // (below) covers the same area until then, so no layout jump.
          videoRef.current.onloadedmetadata = () => setCameraReady(true);
          videoRef.current.play().catch(() => {});
        }
      } catch (err) {
        if (!isMounted) return;
        setHasPermission(false);
        setErrorDetail(cameraErrorMessage(err));
      }
    }

    void initCamera();

    return () => {
      isMounted = false;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [facingMode]);

  // ── Lazy audio: attach a mic track the FIRST time Video mode is used ────
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
      const audio = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      // Merge the mic track into the existing stream — no camera re-acquire.
      audio.getAudioTracks().forEach((track) => stream.addTrack(track));
      setHasAudio(true);
    } catch {
      // Video recording without audio is fine — don't block the user.
      setHasAudio(false);
    }
  }

  // Toggle Torch/Flash if supported
  const toggleFlash = async () => {
    if (!mediaStreamRef.current) return;
    const track = mediaStreamRef.current.getVideoTracks()[0];
    if (track && "applyConstraints" in track) {
      try {
        await track.applyConstraints({
          advanced: [{ torch: !flashOn }],
        } as MediaTrackConstraints & { advanced: [{ torch: boolean }] });
        setFlashOn(!flashOn);
      } catch {
        setFlashOn(!flashOn);
      }
    }
  };

  // Switch between front/back camera (the ONLY path that re-acquires)
  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  // Capture Photo Snapshot
  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1080;
    canvas.height = video.videoHeight || 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Flip horizontal if front camera for natural selfie orientation
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `story_photo_${Date.now()}.jpg`, { type: "image/jpeg" });
        const previewUrl = URL.createObjectURL(blob);
        onCaptureMedia({ file, previewUrl, isVideo: false });
      },
      "image/jpeg",
      0.92,
    );
  };

  // Video Recording Controls
  const startRecording = () => {
    if (!mediaStreamRef.current) return;
    recordedChunksRef.current = [];

    try {
      const options = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? { mimeType: "video/webm;codecs=vp9" }
        : MediaRecorder.isTypeSupported("video/mp4")
          ? { mimeType: "video/mp4" }
          : undefined;

      const recorder = new MediaRecorder(mediaStreamRef.current, options);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: recorder.mimeType || "video/mp4",
        });
        const file = new File([blob], `story_video_${Date.now()}.mp4`, { type: blob.type });
        const previewUrl = URL.createObjectURL(blob);
        onCaptureMedia({ file, previewUrl, isVideo: true });
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
      }, 1000);
    } catch (err) {
      console.error("[StoryCamera] MediaRecorder error:", err);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleShutterClick = () => {
    if (mode === "photo") {
      capturePhoto();
    } else if (mode === "video") {
      if (isRecording) {
        stopRecording();
      } else {
        void ensureAudioTrack().then(startRecording);
      }
    }
  };

  if (hasPermission === false) {
    return (
      <div className="relative flex h-full w-full flex-col items-center justify-between bg-slate-950 p-6 pt-[max(1.5rem,env(safe-area-inset-top))] text-white">
        {/* Top bar */}
        <div className="flex w-full justify-end">
          <button
            type="button"
            onClick={onClose}
            className="grid size-10 place-items-center rounded-full bg-white/10 text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Permission Denied / No Camera Message — specific per error (B3) */}
        <div className="flex flex-col items-center text-center max-w-xs space-y-4">
          <div className="grid size-16 place-items-center rounded-full bg-white/10 text-white/80">
            <Camera className="size-8" />
          </div>
          <h3 className="font-display text-lg font-bold">Camera Unavailable</h3>
          <p className="text-xs text-white/70">
            {errorDetail ||
              "Camera access is disabled or unsupported on this device. You can still upload photos & videos from your gallery or create a text story."}
          </p>
          <div className="flex flex-col gap-2 w-full pt-2">
            <button
              type="button"
              onClick={onOpenGallery}
              className="press flex h-11 items-center justify-center gap-2 rounded-2xl bg-white px-5 font-bold text-black shadow-lg"
            >
              <ImageIcon className="size-4" />
              Choose from Gallery
            </button>
            <button
              type="button"
              onClick={onOpenTextStory}
              className="press flex h-11 items-center justify-center gap-2 rounded-2xl bg-white/15 px-5 font-bold text-white hover:bg-white/20"
            >
              <Type className="size-4" />
              Create Text Story
            </button>
          </div>
        </div>

        <div />
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-black text-white select-none">
      {/* B3 — skeleton at FIRST paint: a black stage with a spinner occupies
          the exact same area the live video will, so the modal has its
          definite height immediately and the video simply fades in. */}
      {!cameraReady && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-slate-950">
          <Loader2 className="size-8 animate-spin text-white/70" />
          <p className="text-xs font-semibold text-white/60">Starting camera…</p>
          <div className="absolute bottom-24 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={onOpenGallery}
              className="press flex h-11 items-center gap-2 rounded-2xl bg-white/15 px-5 text-xs font-bold text-white backdrop-blur-md hover:bg-white/25"
            >
              <ImageIcon className="size-4" /> Use gallery instead
            </button>
          </div>
        </div>
      )}

      {/* Live Video Viewport */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={cn(
          "h-full w-full object-cover transition-transform duration-300",
          facingMode === "user" && "scale-x-[-1]",
          cameraReady ? "opacity-100" : "opacity-0",
        )}
        style={{ transitionProperty: "opacity, transform" }}
      />

      {/* Top Bar Controls matching screenshot */}
      <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between p-4 pt-[max(1rem,env(safe-area-inset-top))] bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <button
          type="button"
          onClick={onClose}
          className="press grid size-10 place-items-center rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60"
        >
          <X className="size-6" />
        </button>

        <div className="flex items-center gap-3">
          {mode === "video" && (
            <span
              className={cn(
                "flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-bold text-white/80 backdrop-blur-md",
                hasAudio ? "text-emerald-300" : "text-amber-300",
              )}
              title={hasAudio ? "Microphone active" : "No microphone — video will be silent"}
            >
              {hasAudio ? <Mic className="size-3" /> : <MicOff className="size-3" />}
              {hasAudio ? "Mic on" : "No mic"}
            </span>
          )}
          <button
            type="button"
            onClick={toggleFlash}
            className="press grid size-10 place-items-center rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60"
          >
            {flashOn ? (
              <Zap className="size-5 text-amber-400 fill-amber-400" />
            ) : (
              <ZapOff className="size-5" />
            )}
          </button>
          <button
            type="button"
            onClick={toggleCameraFacing}
            className="press grid size-10 place-items-center rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60"
          >
            <RefreshCw className="size-5" />
          </button>
        </div>
      </div>

      {/* Live Video Recording Timer Badge */}
      {isRecording && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 rounded-full bg-red-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-lg animate-pulse">
          <span className="size-2 rounded-full bg-white" />
          00:{recordingTime < 10 ? `0${recordingTime}` : recordingTime} / 00:15
        </div>
      )}

      {/* Bottom Control Bar matching design reference */}
      <div className="absolute inset-x-0 bottom-0 z-30 flex flex-col items-center p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-black/90 via-black/50 to-transparent gap-4">
        {/* Main Controls Row (Gallery, Shutter Button, Flip Camera) */}
        <div className="flex w-full items-center justify-between px-6">
          {/* Gallery Launcher — never blocked on camera readiness (B3) */}
          <button
            type="button"
            onClick={onOpenGallery}
            className="press grid size-12 place-items-center rounded-2xl bg-white/20 backdrop-blur-md text-white hover:bg-white/30"
          >
            <ImageIcon className="size-6" />
          </button>

          {/* Shutter / Capture Button */}
          <button
            type="button"
            onClick={handleShutterClick}
            disabled={!cameraReady}
            className={cn(
              "press relative grid size-20 place-items-center rounded-full border-4 border-white transition-transform active:scale-90 disabled:opacity-50",
              isRecording ? "bg-red-600 border-red-500 scale-105" : "bg-white/30 hover:bg-white/40",
            )}
          >
            <span
              className={cn(
                "rounded-full transition-all",
                isRecording ? "size-7 bg-white rounded-md" : "size-14 bg-white",
              )}
            />
          </button>

          {/* Camera Flip Button */}
          <button
            type="button"
            onClick={toggleCameraFacing}
            className="press grid size-12 place-items-center rounded-2xl bg-white/20 backdrop-blur-md text-white hover:bg-white/30"
          >
            <RefreshCw className="size-6" />
          </button>
        </div>

        {/* Bottom Mode Switcher Row — switching modes no longer re-requests
            the camera (the stream persists; audio attaches on Video). */}
        <div className="flex items-center gap-6 pt-1">
          <button
            type="button"
            onClick={() => {
              setMode("photo");
              if (isRecording) stopRecording();
            }}
            className={cn(
              "text-xs font-extrabold uppercase tracking-widest transition-colors",
              mode === "photo" ? "text-white scale-105" : "text-white/50 hover:text-white/80",
            )}
          >
            Photo
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("video");
            }}
            className={cn(
              "text-xs font-extrabold uppercase tracking-widest transition-colors",
              mode === "video" ? "text-white scale-105" : "text-white/50 hover:text-white/80",
            )}
          >
            Video
          </button>

          <button
            type="button"
            onClick={onOpenTextStory}
            className="text-xs font-extrabold uppercase tracking-widest text-white/50 hover:text-white/80"
          >
            Text
          </button>
        </div>
      </div>
    </div>
  );
}
