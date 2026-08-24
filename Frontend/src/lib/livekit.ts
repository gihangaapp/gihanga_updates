import { useEffect, useRef, useState } from "react";
import {
  Room,
  RoomEvent,
  DefaultReconnectPolicy,
  Track,
  LocalVideoTrack,
  RemoteTrack,
  createLocalTracks,
  facingModeFromLocalTrack,
  type VideoCaptureOptions,
} from "livekit-client";

interface UseLiveKitOptions {
  url: string | null;
  token: string | null;
  /** true for the host (publish camera+mic), false for a viewer (subscribe only) */
  publish: boolean;
  enabled: boolean;
}

/**
 * Attaches a MediaStream to a <video> element and actually starts playback.
 *
 * The `autoPlay` attribute alone is not enough: Chrome/Safari block autoplay
 * of a stream that carries *unmuted* audio, the play() promise rejects, no
 * frames are ever decoded and the viewer just sees a black rectangle even
 * though media is flowing. So we always start muted, kick off play()
 * ourselves, and only then restore the requested audio state — falling back
 * to muted playback if the browser still refuses.
 */
export function attachStreamToVideo(
  video: HTMLVideoElement | null,
  stream: MediaStream | null,
  options: { muted?: boolean } = {},
) {
  if (!video) return;
  if (video.srcObject !== stream) video.srcObject = stream;
  if (!stream) return;
  video.playsInline = true;
  video.autoplay = true;
  const wantMuted = options.muted ?? false;
  // Start muted so autoplay is always permitted, then unmute if allowed.
  video.muted = true;
  const start = video.play();
  const finish = () => {
    if (!wantMuted) {
      video.muted = false;
      const retry = video.play();
      if (retry && typeof retry.catch === "function") {
        retry.catch(() => {
          // Browser refused unmuted playback — keep the picture and let the
          // user unmute with a gesture instead of showing a black screen.
          video.muted = true;
          void video.play().catch(() => undefined);
        });
      }
    }
  };
  if (start && typeof start.then === "function") {
    start.then(finish).catch(() => {
      video.muted = true;
      void video.play().catch(() => undefined);
    });
  } else {
    finish();
  }
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
  const [retryTick, setRetryTick] = useState(0);
  const roomRef = useRef<Room | null>(null);
  const localTracksRef = useRef<Array<{ stop: () => void }>>([]);
  const retryCountRef = useRef(0);
  const connectionKeyRef = useRef("");

  useEffect(() => {
    if (!enabled || !url || !token) return;
    let cancelled = false;
    const connectionKey = `${url}|${token}|${publish}`;
    if (connectionKeyRef.current !== connectionKey) {
      connectionKeyRef.current = connectionKey;
      retryCountRef.current = 0;
    }
    let roomConnected = false;
    let retryTimer: number | undefined;
    setError(null);
    const r = new Room({
      // adaptiveStream MUST stay off here: it decides whether a remote video
      // track is visible by inspecting the elements the SDK itself attached
      // via track.attach(). We render media by assigning a MediaStream to our
      // own <video srcObject>, so the SDK sees zero attached elements, treats
      // the track as invisible and pauses it — the viewer gets audio and a
      // permanently black picture.
      adaptiveStream: false,
      dynacast: true,
      reconnectPolicy: new DefaultReconnectPolicy([0, 1000, 3000, 10000, 30000]),
    });
    roomRef.current = r;

    r.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
      if (track.kind === Track.Kind.Video || track.kind === Track.Kind.Audio) {
        setRemoteStream((prev) => {
          const next = new MediaStream(prev?.getTracks() ?? []);
          if (!next.getTracks().some((item) => item.id === track.mediaStreamTrack.id)) {
            next.addTrack(track.mediaStreamTrack);
          }
          return next;
        });
      }
    });
    r.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
      setRemoteStream((prev) => {
        if (!prev) return null;
        const next = new MediaStream(prev.getTracks().filter((item) => item.id !== track.mediaStreamTrack.id));
        return next.getTracks().length > 0 ? next : null;
      });
    });
    r.on(RoomEvent.Reconnecting, () => setConnected(false));
    r.on(RoomEvent.Reconnected, () => {
      setConnected(true);
      setError(null);
      syncLocalStream();
    });
    // The host's own preview must always mirror the tracks LiveKit is really
    // publishing. Toggling the camera or flipping to the front/back lens
    // replaces the underlying MediaStreamTrack, so a preview built once at
    // publish time ends up holding a stopped track — a black self-view while
    // viewers still see video. Re-derive it from the live publications.
    r.on(RoomEvent.LocalTrackPublished, () => syncLocalStream());
    r.on(RoomEvent.LocalTrackUnpublished, () => syncLocalStream());
    r.on(RoomEvent.TrackMuted, () => syncLocalStream());
    r.on(RoomEvent.TrackUnmuted, () => syncLocalStream());
    r.on(RoomEvent.Disconnected, () => {
      setConnected(false);
      setRemoteStream(null);
      setLocalStream(null);
    });

    r.connect(url, token, {
      maxRetries: 3,
      websocketTimeout: 15_000,
      peerConnectionTimeout: 20_000,
    })
      .then(async () => {
        if (cancelled) return;
        setConnected(true);
        setRoom(r);
        roomConnected = true;

        if (publish) {
          let tracks;
          let preferredVideo: VideoCaptureOptions = { facingMode: "user" };
          try {
            const savedPreference = JSON.parse(sessionStorage.getItem("gihanga_live_camera_preference") || "null");
            // A saved deviceId can point at a camera that belonged to a
            // different browser/machine (or was unplugged) — validate it's
            // still present before pinning to it, otherwise
            // { deviceId: { exact } } throws OverconstrainedError and we'd
            // rely purely on the catch-fallback below to recover.
            let savedDeviceStillPresent = false;
            if (savedPreference?.deviceId && navigator.mediaDevices?.enumerateDevices) {
              try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                savedDeviceStillPresent = devices.some(
                  (d) => d.kind === "videoinput" && d.deviceId === savedPreference.deviceId,
                );
              } catch {
                // Enumeration can fail before permission is granted; fall through safely.
              }
            }
            if (savedPreference?.deviceId && savedDeviceStillPresent) {
              preferredVideo = { deviceId: { exact: savedPreference.deviceId } };
            } else if (savedPreference?.facingMode) {
              preferredVideo = { facingMode: savedPreference.facingMode };
            }
          } catch {
            // Ignore an unavailable or malformed browser session preference.
          }
          try {
            // Try the creator's selected camera first, then fall back to a
            // browser-friendly default if that device was disconnected.
            tracks = await createLocalTracks({ audio: true, video: preferredVideo });
          } catch {
            try {
              tracks = await createLocalTracks({ audio: true, video: true });
            } catch {
              // Keep camera-only broadcasts usable when microphone permission
              // is denied or the device has no microphone.
              tracks = await createLocalTracks({ audio: false, video: true });
            }
          }
          if (cancelled) {
            tracks.forEach((t) => t.stop());
            return;
          }
          localTracksRef.current = tracks;
          setMicOn(tracks.some((track) => track.kind === Track.Kind.Audio));
          setCamOn(tracks.some((track) => track.kind === Track.Kind.Video));
          for (const t of tracks) {
            await r.localParticipant.publishTrack(t);
          }
          syncLocalStream();
        }
      })
      .catch((err) => {
        if (cancelled) return;
        const message = err?.message || "Couldn't connect to the stream";
        setError(message);
        // Retry regardless of whether the room itself connected — a
        // publish-step failure (camera busy, permission race, transient
        // getUserMedia error) previously left the host silently connected
        // as a subscriber with no outgoing video, since this guard only
        // retried pre-connection failures. Cap retries either way so a hard
        // permission denial doesn't loop forever.
        if (retryCountRef.current < 4) {
          retryCountRef.current += 1;
          retryTimer = window.setTimeout(() => {
            if (!cancelled) setRetryTick((tick) => tick + 1);
          }, 4000);
        }
      });

    return () => {
      cancelled = true;
      if (retryTimer) window.clearTimeout(retryTimer);
      r.disconnect();
      localTracksRef.current.forEach((track) => track.stop());
      localTracksRef.current = [];
      roomRef.current = null;
      setRoom(null);
      setConnected(false);
      setRemoteStream(null);
      setLocalStream(null);
      setMicOn(true);
      setCamOn(true);
    };
  }, [url, token, publish, enabled, retryTick]);

  function retryConnection() {
    retryCountRef.current = 0;
    setError(null);
    setRetryTick((tick) => tick + 1);
  }

  /**
   * Rebuilds the host's self-preview MediaStream from whatever the local
   * participant is publishing right now (function declaration so the connect
   * effect above can call it — declarations hoist).
   */
  function syncLocalStream() {
    const r = roomRef.current;
    if (!r) {
      setLocalStream(null);
      return;
    }
    const ms = new MediaStream();
    r.localParticipant.trackPublications.forEach((pub) => {
      const mediaTrack = pub.track?.mediaStreamTrack;
      if (mediaTrack && mediaTrack.readyState === "live") ms.addTrack(mediaTrack);
    });
    setLocalStream(ms.getTracks().length > 0 ? ms : null);
  }

  async function toggleMic() {
    const r = roomRef.current;
    if (!r) return;
    const next = !micOn;
    setMicOn(next);
    try {
      await r.localParticipant.setMicrophoneEnabled(next);
    } catch {
      setMicOn(!next);
    }
    syncLocalStream();
  }

  async function toggleCamera() {
    const r = roomRef.current;
    if (!r) return;
    const next = !camOn;
    setCamOn(next);
    try {
      await r.localParticipant.setCameraEnabled(next);
    } catch {
      setCamOn(!next);
    }
    // Re-enabling the camera creates a brand new track: without this the
    // preview would keep pointing at the stopped one and stay black.
    syncLocalStream();
  }

  async function switchCamera() {
    const r = roomRef.current;
    if (!r) return;
    const pub = Array.from(r.localParticipant.videoTrackPublications.values())[0];
    const track = pub?.track as LocalVideoTrack | undefined;
    if (!track) return;

    try {
      const cameras = (await navigator.mediaDevices?.enumerateDevices?.() ?? []).filter(
        (device) => device.kind === "videoinput" && device.deviceId,
      );
      const currentDeviceId = track.mediaStreamTrack.getSettings().deviceId;
      const currentIndex = cameras.findIndex((device) => device.deviceId === currentDeviceId);
      const nextDevice = cameras[(currentIndex + 1) % cameras.length];
      if (nextDevice?.deviceId && cameras.length > 1) {
        await track.restartTrack({ deviceId: nextDevice.deviceId });
        syncLocalStream();
        return;
      }
    } catch {
      // Fall through to facing-mode switching for browsers that do not expose
      // device enumeration or reject a device-specific restart.
    }

    const current = facingModeFromLocalTrack(track).facingMode;
    await track.restartTrack({ facingMode: current === "user" ? "environment" : "user" });
    syncLocalStream();
  }

  return {
    room,
    connected,
    error,
    localStream,
    remoteStream,
    micOn,
    camOn,
    retryConnection,
    toggleMic,
    toggleCamera,
    switchCamera,
  };
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
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [cameraDeviceId, setCameraDeviceId] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let current: MediaStream | null = null;
    setError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Camera access is unavailable here. Open the site on HTTPS or localhost and allow camera permissions.");
      return;
    }

    const video = cameraDeviceId ? { deviceId: { exact: cameraDeviceId } } : { facingMode: facing };
    navigator.mediaDevices
      .getUserMedia({ video, audio: true })
      .catch(() => navigator.mediaDevices.getUserMedia({ video: true, audio: true }))
      .catch(() => navigator.mediaDevices.getUserMedia({ video: true, audio: false }))
      .then(async (s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        current = s;
        setMicOn(s.getAudioTracks().length > 0);
        setCamOn(s.getVideoTracks().length > 0);
        setStream(s);
        try {
          const devices = (await navigator.mediaDevices.enumerateDevices()).filter(
            (device) => device.kind === "videoinput" && device.deviceId,
          );
          if (!cancelled) setCameraDevices(devices);
        } catch {
          // Device enumeration is optional; the active default camera still works.
        }
      })
      .catch(() => setError("Couldn't access your camera/microphone. Check browser permissions and try again."));

    return () => {
      cancelled = true;
      current?.getTracks().forEach((t) => t.stop());
    };
  }, [enabled, facing, cameraDeviceId]);

  function toggleMic() {
    stream?.getAudioTracks().forEach((t) => (t.enabled = !micOn));
    setMicOn((v) => !v);
  }
  function toggleCam() {
    stream?.getVideoTracks().forEach((t) => (t.enabled = !camOn));
    setCamOn((v) => !v);
  }
  function flipCamera() {
    if (cameraDevices.length > 1) {
      const activeDeviceId = stream?.getVideoTracks()[0]?.getSettings().deviceId ?? cameraDeviceId;
      const currentIndex = cameraDevices.findIndex((device) => device.deviceId === activeDeviceId);
      const next = cameraDevices[(currentIndex + 1) % cameraDevices.length];
      if (next?.deviceId) {
        setCameraDeviceId(next.deviceId);
        return;
      }
    }
    setCameraDeviceId(null);
    setFacing((f) => (f === "user" ? "environment" : "user"));
  }

  const activeVideoTrack = stream?.getVideoTracks()[0];
  const activeCameraDeviceId = activeVideoTrack?.getSettings().deviceId ?? cameraDeviceId;
  const activeFacingMode = activeVideoTrack?.getSettings().facingMode ?? facing;

  return {
    stream,
    error,
    micOn,
    camOn,
    cameraDeviceId: activeCameraDeviceId,
    facing: activeFacingMode,
    toggleMic,
    toggleCam,
    flipCamera,
  };
}
