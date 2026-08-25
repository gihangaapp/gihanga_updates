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
  const pendingCandidates = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const targetPeerId = useRef<string | null>(null);
  const hostPeers = useRef<Map<string, RTCPeerConnection>>(new Map());
  const waitingViewerIds = useRef<Set<string>>(new Set());

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

    const sendOffer = async (viewerId: string, negotiationPeer: RTCPeerConnection = peer) => {
      if (cancelled || !publish || !viewerId || negotiationPeer.signalingState !== "stable") return;
      targetPeerId.current = viewerId;
      try {
        const offer = await negotiationPeer.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
        await negotiationPeer.setLocalDescription(offer);
        socket.emit("live:webrtc:offer", { streamId, targetId: viewerId, description: negotiationPeer.localDescription });
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Could not start live video.");
      }
    };

    const handleReady = ({ viewerId }: { viewerId: string }) => {
      if (!publish || cancelled || hostPeers.current.has(viewerId)) return;
      if (!localRef.current) {
        waitingViewerIds.current.add(viewerId);
        return;
      }
      const hostPeer = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      hostPeers.current.set(viewerId, hostPeer);
      localRef.current?.getTracks().forEach((track) => hostPeer.addTrack(track, localRef.current as MediaStream));
      hostPeer.onicecandidate = ({ candidate }) => {
        if (candidate) socket.emit("live:webrtc:ice", { streamId, targetId: viewerId, candidate });
      };
      hostPeer.onconnectionstatechange = () => {
        if (["failed", "disconnected", "closed"].includes(hostPeer.connectionState)) {
          hostPeers.current.delete(viewerId);
          hostPeer.close();
        }
      };
      void sendOffer(viewerId, hostPeer);
    };
    const handleOffer = async ({ description, hostId }: DescriptionPayload & { hostId: string }) => {
      if (publish || cancelled) return;
      try {
        targetPeerId.current = hostId;
        await peer.setRemoteDescription(description);
        for (const candidate of pendingCandidates.current.get(hostId) ?? []) await peer.addIceCandidate(candidate);
        pendingCandidates.current.delete(hostId);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        socket.emit("live:webrtc:answer", { streamId, targetId: hostId, description: peer.localDescription });
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Could not join live video.");
      }
    };
    const handleAnswer = async ({ description, viewerId }: DescriptionPayload & { viewerId: string }) => {
      if (!publish || cancelled) return;
      const hostPeer = hostPeers.current.get(viewerId);
      if (!hostPeer) return;
      try {
        await hostPeer.setRemoteDescription(description);
        for (const candidate of pendingCandidates.current.get(viewerId) ?? []) await hostPeer.addIceCandidate(candidate);
        pendingCandidates.current.delete(viewerId);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Could not complete live video connection.");
      }
    };
    const handleCandidate = async ({ candidate, senderId }: CandidatePayload & { senderId: string }) => {
      if (!candidate || cancelled) return;
      const candidatePeer = publish ? hostPeers.current.get(senderId) : peer;
      if (!candidatePeer || (!publish && targetPeerId.current && targetPeerId.current !== senderId)) return;
      if (candidatePeer.remoteDescription) {
        try {
          await candidatePeer.addIceCandidate(candidate);
        } catch {
          // A late candidate can be safely ignored after a peer disconnects.
        }
      } else {
        const queued = pendingCandidates.current.get(senderId) ?? [];
        queued.push(candidate);
        pendingCandidates.current.set(senderId, queued);
      }
    };

    peer.onicecandidate = ({ candidate }) => {
      if (candidate && targetPeerId.current) socket.emit("live:webrtc:ice", { streamId, targetId: targetPeerId.current, candidate });
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
    const handleSocketConnect = () => {
      if (!publish) socket.emit("live:webrtc:ready", { streamId });
      else waitingViewerIds.current.forEach((viewerId) => void handleReady({ viewerId }));
    };
    socket.on("connect", handleSocketConnect);

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
          // Each viewer gets its own host peer connection after announcing readiness.
          waitingViewerIds.current.forEach((viewerId) => {
            waitingViewerIds.current.delete(viewerId);
            handleReady({ viewerId });
          });
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
      socket.off("connect", handleSocketConnect);
      waitingViewerIds.current.clear();
      peer.close();
      hostPeers.current.forEach((hostPeer) => hostPeer.close());
      hostPeers.current.clear();
      localRef.current?.getTracks().forEach((track) => track.stop());
      localRef.current = null;
      targetPeerId.current = null;
      pendingCandidates.current.clear();
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
