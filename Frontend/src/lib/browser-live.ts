import { useEffect, useRef, useState } from "react";
import { getLiveSocket } from "./socket-client";

interface BrowserLiveOptions {
  streamId: string;
  publish: boolean;
  enabled: boolean;
}

type CandidatePayload = { streamId: string; candidate: RTCIceCandidateInit };
type DescriptionPayload = { streamId: string; description: RTCSessionDescriptionInit };

/**
 * Browser-native WebRTC live video. Socket.IO is used only to exchange SDP and
 * ICE candidates; media flows directly between the host and viewers.
 * This deliberately has no hosted media-server dependency.
 */
export function useBrowserLiveRoom({ streamId, publish, enabled }: BrowserLiveOptions) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localRef = useRef<MediaStream | null>(null);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);

  useEffect(() => {
    if (!enabled || !streamId) return;
    const socket = getLiveSocket();
    if (!socket) {
      setError("Sign in to connect to live video.");
      return;
    }

    let cancelled = false;
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    peerRef.current = peer;
    setError(null);
    setConnected(false);

    const sendOffer = async () => {
      if (cancelled || !publish || peer.signalingState !== "stable") return;
      try {
        const offer = await peer.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
        await peer.setLocalDescription(offer);
        socket.emit("live:webrtc:offer", { streamId, description: peer.localDescription });
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Could not start live video.");
      }
    };

    const handleReady = () => void sendOffer();
    const handleOffer = async ({ description }: DescriptionPayload) => {
      if (publish || cancelled) return;
      try {
        await peer.setRemoteDescription(description);
        for (const candidate of pendingCandidates.current.splice(0)) await peer.addIceCandidate(candidate);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        socket.emit("live:webrtc:answer", { streamId, description: peer.localDescription });
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Could not join live video.");
      }
    };
    const handleAnswer = async ({ description }: DescriptionPayload) => {
      if (!publish || cancelled) return;
      try {
        await peer.setRemoteDescription(description);
        for (const candidate of pendingCandidates.current.splice(0)) await peer.addIceCandidate(candidate);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Could not complete live video connection.");
      }
    };
    const handleCandidate = async ({ candidate }: CandidatePayload) => {
      if (!candidate || cancelled) return;
      if (peer.remoteDescription) {
        try {
          await peer.addIceCandidate(candidate);
        } catch {
          // A late candidate can be safely ignored after a peer disconnects.
        }
      } else {
        pendingCandidates.current.push(candidate);
      }
    };

    peer.onicecandidate = ({ candidate }) => {
      if (candidate) socket.emit("live:webrtc:ice", { streamId, candidate });
    };
    peer.ontrack = ({ streams, track }) => {
      const incoming = streams[0] ?? new MediaStream([track]);
      setRemoteStream(incoming);
      setConnected(true);
    };
    peer.onconnectionstatechange = () => {
      if (peer.connectionState === "connected") setConnected(true);
      if (["failed", "disconnected", "closed"].includes(peer.connectionState)) setConnected(false);
    };

    socket.on("live:webrtc:viewer-ready", handleReady);
    socket.on("live:webrtc:offer", handleOffer);
    socket.on("live:webrtc:answer", handleAnswer);
    socket.on("live:webrtc:ice", handleCandidate);

    const start = async () => {
      if (publish) {
        if (!navigator.mediaDevices?.getUserMedia) {
          setError("Camera access is unavailable. Open the site over HTTPS or localhost.");
          return;
        }
        try {
          let media: MediaStream;
          try {
            media = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          } catch {
            media = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          }
          if (cancelled) {
            media.getTracks().forEach((track) => track.stop());
            return;
          }
          localRef.current = media;
          setLocalStream(media);
          setMicOn(media.getAudioTracks().length > 0);
          setCamOn(media.getVideoTracks().length > 0);
          media.getTracks().forEach((track) => peer.addTrack(track, media));
          await sendOffer();
        } catch (err: any) {
          if (!cancelled) setError(err?.message || "Allow camera access to start streaming.");
        }
      } else {
        socket.emit("live:webrtc:ready", { streamId });
      }
    };
    void start();

    return () => {
      cancelled = true;
      socket.off("live:webrtc:viewer-ready", handleReady);
      socket.off("live:webrtc:offer", handleOffer);
      socket.off("live:webrtc:answer", handleAnswer);
      socket.off("live:webrtc:ice", handleCandidate);
      peer.close();
      localRef.current?.getTracks().forEach((track) => track.stop());
      localRef.current = null;
      peerRef.current = null;
      setLocalStream(null);
      setRemoteStream(null);
      setConnected(false);
    };
  }, [streamId, publish, enabled]);

  function toggleMic() {
    localRef.current?.getAudioTracks().forEach((track) => (track.enabled = !micOn));
    setMicOn((value) => !value);
  }
  function toggleCamera() {
    localRef.current?.getVideoTracks().forEach((track) => (track.enabled = !camOn));
    setCamOn((value) => !value);
  }
  function switchCamera() {
    // A native WebRTC track can be restarted with a facing mode without a
    // media-server-specific API, keeping mobile camera switching lightweight.
    const track = localRef.current?.getVideoTracks()[0];
    if (!track) return;
    const current = track.getSettings().facingMode;
    void track.applyConstraints({ facingMode: current === "user" ? "environment" : "user" }).catch(() => {});
  }

  return { localStream, remoteStream, connected, error, micOn, camOn, toggleMic, toggleCamera, switchCamera };
}

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
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Camera access is unavailable. Open the site over HTTPS or localhost.");
      return;
    }
    setError(null);
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: facing }, audio: true })
      .catch(() => navigator.mediaDevices.getUserMedia({ video: true, audio: false }))
      .then((media) => {
        if (cancelled) {
          media.getTracks().forEach((track) => track.stop());
          return;
        }
        current = media;
        setStream(media);
        setMicOn(media.getAudioTracks().length > 0);
        setCamOn(media.getVideoTracks().length > 0);
      })
      .catch((err) => setError(err?.message || "Allow camera access to preview your stream."));
    return () => {
      cancelled = true;
      current?.getTracks().forEach((track) => track.stop());
    };
  }, [enabled, facing]);

  function toggleMic() {
    stream?.getAudioTracks().forEach((track) => (track.enabled = !micOn));
    setMicOn((value) => !value);
  }
  function toggleCam() {
    stream?.getVideoTracks().forEach((track) => (track.enabled = !camOn));
    setCamOn((value) => !value);
  }
  function flipCamera() {
    setFacing((value) => (value === "user" ? "environment" : "user"));
  }

  return { stream, error, micOn, camOn, facing, cameraDeviceId: stream?.getVideoTracks()[0]?.getSettings().deviceId ?? null, toggleMic, toggleCam, flipCamera };
}
