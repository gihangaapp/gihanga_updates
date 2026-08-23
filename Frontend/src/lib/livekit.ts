import { useEffect, useRef, useState } from "react";
import {
  Room,
  RoomEvent,
  Track,
  LocalVideoTrack,
  RemoteTrack,
  createLocalTracks,
  facingModeFromLocalTrack,
} from "livekit-client";

interface UseLiveKitOptions {
  url: string | null;
  token: string | null;
  /** true for the host (publish camera+mic), false for a viewer (subscribe only) */
  publish: boolean;
  enabled: boolean;
}

/**
 * Thin wrapper around the LiveKit client SDK. The browser connects directly
 * to the LiveKit media server (SFU) over WebRTC — none of this rides our
 * Express/Socket.IO server, which only ever issued the join token.
 */
export function useLiveKitRoom({ url, token, publish, enabled }: UseLiveKitOptions) {
  const [room, setRoom] = useState<Room | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const roomRef = useRef<Room | null>(null);

  useEffect(() => {
    if (!enabled || !url || !token) return;
    let cancelled = false;
    const r = new Room({ adaptiveStream: true, dynacast: true });
    roomRef.current = r;

    r.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
      if (track.kind === Track.Kind.Video || track.kind === Track.Kind.Audio) {
        setRemoteStream((prev) => {
          const ms = prev ?? new MediaStream();
          ms.addTrack(track.mediaStreamTrack);
          return ms;
        });
      }
    });
    r.on(RoomEvent.Disconnected, () => setConnected(false));

    r.connect(url, token)
      .then(async () => {
        if (cancelled) return;
        setConnected(true);
        setRoom(r);

        if (publish) {
          const tracks = await createLocalTracks({ audio: true, video: { facingMode: "user" } });
          if (cancelled) {
            tracks.forEach((t) => t.stop());
            return;
          }
          const ms = new MediaStream();
          for (const t of tracks) {
            await r.localParticipant.publishTrack(t);
            ms.addTrack(t.mediaStreamTrack);
          }
          setLocalStream(ms);
        }
      })
      .catch((err) => setError(err?.message || "Couldn't connect to the stream"));

    return () => {
      cancelled = true;
      r.disconnect();
      roomRef.current = null;
      setRoom(null);
      setConnected(false);
      setRemoteStream(null);
      setLocalStream(null);
    };
  }, [url, token, publish, enabled]);

  function toggleMic() {
    const r = roomRef.current;
    if (!r) return;
    const next = !micOn;
    r.localParticipant.setMicrophoneEnabled(next);
    setMicOn(next);
  }

  function toggleCamera() {
    const r = roomRef.current;
    if (!r) return;
    const next = !camOn;
    r.localParticipant.setCameraEnabled(next);
    setCamOn(next);
  }

  async function switchCamera() {
    const r = roomRef.current;
    if (!r) return;
    const pub = Array.from(r.localParticipant.videoTrackPublications.values())[0];
    const track = pub?.track as LocalVideoTrack | undefined;
    if (!track) return;
    const current = facingModeFromLocalTrack(track).facingMode;
    await track.restartTrack({ facingMode: current === "user" ? "environment" : "user" });
  }

  return { room, connected, error, localStream, remoteStream, micOn, camOn, toggleMic, toggleCamera, switchCamera };
}

/**
 * Standalone camera preview used before the host actually goes live —
 * doesn't touch LiveKit at all, just a local getUserMedia preview so the
 * creator can check their shot and toggle devices before broadcasting.
 */
export function useCameraPreview(enabled: boolean) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [facing, setFacing] = useState<"user" | "environment">("user");

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let current: MediaStream | null = null;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: facing }, audio: true })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        current = s;
        setStream(s);
      })
      .catch(() => setError("Couldn't access your camera/microphone. Check browser permissions."));

    return () => {
      cancelled = true;
      current?.getTracks().forEach((t) => t.stop());
    };
  }, [enabled, facing]);

  function toggleMic() {
    stream?.getAudioTracks().forEach((t) => (t.enabled = !micOn));
    setMicOn((v) => !v);
  }
  function toggleCam() {
    stream?.getVideoTracks().forEach((t) => (t.enabled = !camOn));
    setCamOn((v) => !v);
  }
  function flipCamera() {
    setFacing((f) => (f === "user" ? "environment" : "user"));
  }

  return { stream, error, micOn, camOn, toggleMic, toggleCam, flipCamera };
}
