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
 * Explicit mic constraints for every getUserMedia() call in this file.
 * Leaving `audio: true` as a bare boolean lets the browser pick its own
 * defaults, which is exactly what produced audible echo/feedback when a
 * host and a co-host tested from two devices near each other. Turning
 * these on explicitly is required, not optional, whenever two open mics
 * might be in the same room.
 */
const AUDIO_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

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
  const readyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        const offer = await negotiationPeer.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        await negotiationPeer.setLocalDescription(offer);
        socket.emit("live:webrtc:offer", {
          streamId,
          targetId: viewerId,
          description: negotiationPeer.localDescription,
        });
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Could not start live video.");
      }
    };

    const handleReady = ({ viewerId }: { viewerId: string }) => {
      if (!publish || cancelled || hostPeers.current.has(viewerId)) return;
      const hostPeer = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      hostPeers.current.set(viewerId, hostPeer);
      localRef.current
        ?.getTracks()
        .forEach((track) => hostPeer.addTrack(track, localRef.current as MediaStream));
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
    const handleOffer = async ({
      description,
      hostId,
    }: DescriptionPayload & { hostId: string }) => {
      if (publish || cancelled) return;
      try {
        targetPeerId.current = hostId;
        await peer.setRemoteDescription(description);
        for (const candidate of pendingCandidates.current.get(hostId) ?? [])
          await peer.addIceCandidate(candidate);
        pendingCandidates.current.delete(hostId);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        socket.emit("live:webrtc:answer", {
          streamId,
          targetId: hostId,
          description: peer.localDescription,
        });
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Could not join live video.");
      }
    };
    const handleAnswer = async ({
      description,
      viewerId,
    }: DescriptionPayload & { viewerId: string }) => {
      if (!publish || cancelled) return;
      const hostPeer = hostPeers.current.get(viewerId);
      if (!hostPeer) return;
      try {
        await hostPeer.setRemoteDescription(description);
        for (const candidate of pendingCandidates.current.get(viewerId) ?? [])
          await hostPeer.addIceCandidate(candidate);
        pendingCandidates.current.delete(viewerId);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Could not complete live video connection.");
      }
    };
    const handleCandidate = async ({
      candidate,
      senderId,
    }: CandidatePayload & { senderId: string }) => {
      if (!candidate || cancelled) return;
      const candidatePeer = publish ? hostPeers.current.get(senderId) : peer;
      if (!candidatePeer || (!publish && targetPeerId.current && targetPeerId.current !== senderId))
        return;
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
      if (candidate && targetPeerId.current)
        socket.emit("live:webrtc:ice", { streamId, targetId: targetPeerId.current, candidate });
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

    let announceReady: (() => void) | null = null;
    const start = async () => {
      if (publish) {
        if (!navigator.mediaDevices?.getUserMedia) {
          setError("Camera access is unavailable. Open the site over HTTPS or localhost.");
          return;
        }
        try {
          let media: MediaStream;
          try {
            media = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: AUDIO_CONSTRAINTS,
            });
          } catch {
            media = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          }
          if (cancelled) {
            media.getTracks().forEach((track) => track.stop());
            return;
          }
          localRef.current = media;
          setLocalStream(media);
          setConnected(true);
          setMicOn(media.getAudioTracks().length > 0);
          setCamOn(media.getVideoTracks().length > 0);
          // Each viewer gets its own host peer connection after announcing readiness.
        } catch (err: any) {
          if (!cancelled) setError(err?.message || "Allow camera access to start streaming.");
        }
      } else {
        // Viewer: delay the ready signal to ensure live:join is processed
        // by the server before we announce readiness for WebRTC.
        // Also always listen for connect to handle reconnections.
        announceReady = () => {
          if (readyTimerRef.current) window.clearTimeout(readyTimerRef.current);
          readyTimerRef.current = window.setTimeout(() => {
            if (!cancelled) socket.emit("live:webrtc:ready", { streamId });
          }, 600);
        };
        // Always register the connect listener (handles both initial + reconnection)
        socket.on("connect", announceReady);
        // If already connected, emit now (with delay)
        if (socket.connected) announceReady();
      }
    };
    void start();

    return () => {
      cancelled = true;
      if (readyTimerRef.current) {
        window.clearTimeout(readyTimerRef.current);
        readyTimerRef.current = null;
      }
      if (announceReady) socket.off("connect", announceReady);
      socket.off("live:webrtc:viewer-ready", handleReady);
      socket.off("live:webrtc:offer", handleOffer);
      socket.off("live:webrtc:answer", handleAnswer);
      socket.off("live:webrtc:ice", handleCandidate);
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
    void track
      .applyConstraints({ facingMode: current === "user" ? "environment" : "user" })
      .catch(() => {});
  }

  return {
    localStream,
    remoteStream,
    connected,
    error,
    micOn,
    camOn,
    toggleMic,
    toggleCamera,
    switchCamera,
  };
}

/* -------------------------------------------------------------------------- */
/*  Co-host WebRTC mesh: when a viewer is accepted as co-host, this hook     */
/*  manages their local media + bidirectional peer connections to every       */
/*  other participant (host + existing co-hosts).                             */
/* -------------------------------------------------------------------------- */

export interface CoHostRemoteStream {
  participantId: string;
  stream: MediaStream;
}

interface CoHostOptions {
  streamId: string;
  /** The host's userId */
  hostId: string;
  /** The current user's userId (the co-host) */
  myUserId: string;
  enabled: boolean;
}

export function useCoHostLiveRoom({ streamId, hostId, myUserId, enabled }: CoHostOptions) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [coHostStreams, setCoHostStreams] = useState<CoHostRemoteStream[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  // Refs that survive re-renders without restarting the effect
  const localRef = useRef<MediaStream | null>(null);
  // Map: targetSocketId -> RTCPeerConnection  (one per other participant)
  const meshPeers = useRef<Map<string, RTCPeerConnection>>(new Map());
  // Map: targetSocketId -> [queued ICE candidates]
  const pendingIce = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  // Map: participantId -> socketId (to map participantId to socketId)
  const participantSockets = useRef<Map<string, string>>(new Map());
  // Map: socketId -> participantId
  const socketParticipants = useRef<Map<string, string>>(new Map());
  const streamsMap = useRef<Map<string, MediaStream>>(new Map());
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (!enabled || !streamId) return;
    const socket = getLiveSocket();
    if (!socket) {
      setError("Sign in to join as co-host.");
      return;
    }

    cancelledRef.current = false;
    setError(null);

    /** Create a new PeerConnection to a specific target socket */
    const createMeshPeer = (targetSocketId: string) => {
      if (meshPeers.current.has(targetSocketId)) return meshPeers.current.get(targetSocketId)!;
      const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      meshPeers.current.set(targetSocketId, pc);
      // Add local tracks so this is BIDIRECTIONAL
      localRef.current
        ?.getTracks()
        .forEach((track) => pc.addTrack(track, localRef.current as MediaStream));

      pc.onicecandidate = ({ candidate }) => {
        if (candidate) {
          const pId = socketParticipants.current.get(targetSocketId);
          socket.emit("live:webrtc:co-host:ice", {
            streamId,
            targetId: targetSocketId,
            candidate,
            participantId: pId,
          });
        }
      };

      pc.ontrack = ({ streams, track }) => {
        const incoming = streams[0] ?? new MediaStream([track]);
        const pId = socketParticipants.current.get(targetSocketId);
        if (!pId) return;
        streamsMap.current.set(pId, incoming);
        setCoHostStreams(
          Array.from(streamsMap.current.entries()).map(([pid, str]) => ({
            participantId: pid,
            stream: str,
          })),
        );
        setConnected(true);
      };

      pc.onconnectionstatechange = () => {
        if (["failed", "disconnected", "closed"].includes(pc.connectionState)) {
          meshPeers.current.delete(targetSocketId);
          pc.close();
        }
      };

      return pc;
    };

    /** When another participant announces ready, we create a peer and send them an offer */
    const handleCoHostReady = ({
      participantId,
      participantSocketId,
    }: {
      streamId: string;
      participantId: string;
      participantSocketId: string;
    }) => {
      if (cancelledRef.current) return;
      if (participantId === myUserId) return; // skip self
      // Store mappings
      participantSockets.current.set(participantId, participantSocketId);
      socketParticipants.current.set(participantSocketId, participantId);
      // Create peer and send offer
      const pc = createMeshPeer(participantSocketId);
      if (pc.signalingState !== "stable") return;
      pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true })
        .then((offer) => pc.setLocalDescription(offer))
        .then(() => {
          socket.emit("live:webrtc:co-host:offer", {
            streamId,
            targetId: participantSocketId,
            description: pc.localDescription,
            participantId: myUserId,
          });
        })
        .catch((err: any) => {
          if (!cancelledRef.current) setError(err?.message || "Could not connect to co-host.");
        });
    };

    /** Receive an offer from another participant — create peer, add tracks, send answer */
    const handleCoHostOffer = async ({
      senderId,
      senderParticipantId,
      description,
    }: {
      streamId: string;
      senderId: string;
      senderParticipantId: string;
      description: RTCSessionDescriptionInit;
    }) => {
      if (cancelledRef.current) return;
      if (senderParticipantId === myUserId) return;
      participantSockets.current.set(senderParticipantId, senderId);
      socketParticipants.current.set(senderId, senderParticipantId);
      const pc = createMeshPeer(senderId);
      try {
        await pc.setRemoteDescription(description);
        for (const c of pendingIce.current.get(senderId) ?? []) await pc.addIceCandidate(c);
        pendingIce.current.delete(senderId);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("live:webrtc:co-host:answer", {
          streamId,
          targetId: senderId,
          description: pc.localDescription,
          participantId: myUserId,
        });
      } catch (err: any) {
        if (!cancelledRef.current) setError(err?.message || "Could not connect to co-host.");
      }
    };

    /** Receive an answer to our offer */
    const handleCoHostAnswer = async ({
      senderId,
      description,
    }: {
      streamId: string;
      senderId: string;
      description: RTCSessionDescriptionInit;
    }) => {
      if (cancelledRef.current) return;
      const pc = meshPeers.current.get(senderId);
      if (!pc) return;
      try {
        await pc.setRemoteDescription(description);
        for (const c of pendingIce.current.get(senderId) ?? []) await pc.addIceCandidate(c);
        pendingIce.current.delete(senderId);
      } catch (err: any) {
        if (!cancelledRef.current)
          setError(err?.message || "Could not complete co-host connection.");
      }
    };

    /** Receive ICE candidate from another participant */
    const handleCoHostIce = async ({
      senderId,
      candidate,
    }: {
      streamId: string;
      senderId: string;
      candidate: RTCIceCandidateInit;
    }) => {
      if (!candidate || cancelledRef.current) return;
      const pc = meshPeers.current.get(senderId);
      if (!pc) return;
      if (pc.remoteDescription) {
        try {
          await pc.addIceCandidate(candidate);
        } catch {
          /* late candidate */
        }
      } else {
        const queued = pendingIce.current.get(senderId) ?? [];
        queued.push(candidate);
        pendingIce.current.set(senderId, queued);
      }
    };

    socket.on("live:co-host:webrtc-ready", handleCoHostReady);
    socket.on("live:webrtc:co-host:offer", handleCoHostOffer);
    socket.on("live:webrtc:co-host:answer", handleCoHostAnswer);
    socket.on("live:webrtc:co-host:ice", handleCoHostIce);

    // Acquire local media
    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: AUDIO_CONSTRAINTS })
        .catch(() => navigator.mediaDevices.getUserMedia({ video: true, audio: false }))
        .then((media) => {
          if (cancelledRef.current) {
            media.getTracks().forEach((t) => t.stop());
            return;
          }
          localRef.current = media;
          setLocalStream(media);
          setMicOn(media.getAudioTracks().length > 0);
          setCamOn(media.getVideoTracks().length > 0);
          setConnected(true);
          // Announce to the room that we're ready for mesh connections
          socket.emit("live:co-host:webrtc-ready", { streamId });
        })
        .catch((err: any) => {
          if (!cancelledRef.current)
            setError(err?.message || "Allow camera access to join as co-host.");
        });
    } else {
      setError("Camera access is unavailable. Open the site over HTTPS or localhost.");
    }

    return () => {
      cancelledRef.current = true;
      socket.off("live:co-host:webrtc-ready", handleCoHostReady);
      socket.off("live:webrtc:co-host:offer", handleCoHostOffer);
      socket.off("live:webrtc:co-host:answer", handleCoHostAnswer);
      socket.off("live:webrtc:co-host:ice", handleCoHostIce);
      meshPeers.current.forEach((pc) => pc.close());
      meshPeers.current.clear();
      localRef.current?.getTracks().forEach((t) => t.stop());
      localRef.current = null;
      participantSockets.current.clear();
      socketParticipants.current.clear();
      streamsMap.current.clear();
      pendingIce.current.clear();
      setLocalStream(null);
      setCoHostStreams([]);
      setConnected(false);
      setError(null);
    };
  }, [streamId, hostId, myUserId, enabled]);

  function toggleMic() {
    localRef.current?.getAudioTracks().forEach((track) => (track.enabled = !micOn));
    setMicOn((v) => !v);
  }
  function toggleCamera() {
    localRef.current?.getVideoTracks().forEach((track) => (track.enabled = !camOn));
    setCamOn((v) => !v);
  }
  function flipCamera() {
    const track = localRef.current?.getVideoTracks()[0];
    if (!track) return;
    const current = track.getSettings().facingMode;
    void track
      .applyConstraints({ facingMode: current === "user" ? "environment" : "user" })
      .catch(() => {});
  }

  function removeCoHostStream(participantId: string) {
    streamsMap.current.delete(participantId);
    setCoHostStreams(
      Array.from(streamsMap.current.entries()).map(([pid, str]) => ({
        participantId: pid,
        stream: str,
      })),
    );
  }

  return {
    localStream,
    coHostStreams,
    connected,
    error,
    micOn,
    camOn,
    toggleMic,
    toggleCamera,
    flipCamera,
    removeCoHostStream,
  };
}

/* -------------------------------------------------------------------------- */
/*  Host-side co-host mesh: manages peer connections FROM the host TO each   */
/*  co-host (bidirectional). Called in addition to useBrowserLiveRoom.        */
/* -------------------------------------------------------------------------- */

export function useHostCoHostMesh({
  streamId,
  hostLocalStream,
  enabled,
}: {
  streamId: string;
  hostLocalStream: MediaStream | null;
  enabled: boolean;
}) {
  const [coHostStreams, setCoHostStreams] = useState<CoHostRemoteStream[]>([]);
  const meshPeers = useRef<Map<string, RTCPeerConnection>>(new Map());
  const pendingIce = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const participantSockets = useRef<Map<string, string>>(new Map());
  const socketParticipants = useRef<Map<string, string>>(new Map());
  const streamsMap = useRef<Map<string, MediaStream>>(new Map());
  const localRef = useRef<MediaStream | null>(hostLocalStream);

  // Keep localRef in sync
  useEffect(() => {
    localRef.current = hostLocalStream;
  }, [hostLocalStream]);

  useEffect(() => {
    if (!enabled || !streamId) return;
    const socket = getLiveSocket();
    if (!socket) return;

    const createMeshPeer = (targetSocketId: string): RTCPeerConnection => {
      if (meshPeers.current.has(targetSocketId)) return meshPeers.current.get(targetSocketId)!;
      const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      meshPeers.current.set(targetSocketId, pc);
      localRef.current
        ?.getTracks()
        .forEach((track) => pc.addTrack(track, localRef.current as MediaStream));

      pc.onicecandidate = ({ candidate }) => {
        if (candidate) {
          const pId = socketParticipants.current.get(targetSocketId);
          socket.emit("live:webrtc:co-host:ice", {
            streamId,
            targetId: targetSocketId,
            candidate,
            participantId: pId,
          });
        }
      };

      pc.ontrack = ({ streams, track }) => {
        const incoming = streams[0] ?? new MediaStream([track]);
        const pId = socketParticipants.current.get(targetSocketId);
        if (!pId) return;
        streamsMap.current.set(pId, incoming);
        setCoHostStreams(
          Array.from(streamsMap.current.entries()).map(([pid, str]) => ({
            participantId: pid,
            stream: str,
          })),
        );
      };

      pc.onconnectionstatechange = () => {
        if (["failed", "disconnected", "closed"].includes(pc.connectionState)) {
          meshPeers.current.delete(targetSocketId);
          pc.close();
        }
      };

      return pc;
    };

    const sendOfferTo = (
      participantId: string,
      participantSocketId: string,
      pc: RTCPeerConnection,
    ) => {
      if (pc.signalingState !== "stable") return;
      pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true })
        .then((offer) => pc.setLocalDescription(offer))
        .then(() => {
          // Host doesn't need participantId in offer (they are the host), but include for consistency
          socket.emit("live:webrtc:co-host:offer", {
            streamId,
            targetId: participantSocketId,
            description: pc.localDescription,
            participantId,
          });
        })
        .catch(() => {});
    };

    const handleCoHostReady = ({
      participantId,
      participantSocketId,
    }: {
      streamId: string;
      participantId: string;
      participantSocketId: string;
    }) => {
      participantSockets.current.set(participantId, participantSocketId);
      socketParticipants.current.set(participantSocketId, participantId);
      const pc = createMeshPeer(participantSocketId);
      // The host's own camera/mic can still be initializing (getUserMedia is
      // async) when a co-host announces readiness. Sending an offer with zero
      // tracks would connect with no audio/video and nothing here ever
      // renegotiates, so the co-host would be stuck silent permanently.
      // Wait for local tracks to actually exist before offering, retrying
      // briefly rather than giving up.
      if (!localRef.current || localRef.current.getTracks().length === 0) {
        let attempts = 0;
        const waitForLocalMedia = () => {
          attempts += 1;
          if (localRef.current && localRef.current.getTracks().length > 0) {
            localRef.current.getTracks().forEach((track) => {
              const alreadyAdded = pc.getSenders().some((s) => s.track === track);
              if (!alreadyAdded) pc.addTrack(track, localRef.current as MediaStream);
            });
            sendOfferTo(participantId, participantSocketId, pc);
          } else if (attempts < 20) {
            window.setTimeout(waitForLocalMedia, 250);
          }
        };
        waitForLocalMedia();
        return;
      }
      sendOfferTo(participantId, participantSocketId, pc);
    };

    const handleCoHostOffer = async ({
      senderId,
      senderParticipantId,
      description,
    }: {
      streamId: string;
      senderId: string;
      senderParticipantId: string;
      description: RTCSessionDescriptionInit;
    }) => {
      participantSockets.current.set(senderParticipantId, senderId);
      socketParticipants.current.set(senderId, senderParticipantId);
      const pc = createMeshPeer(senderId);
      try {
        await pc.setRemoteDescription(description);
        for (const c of pendingIce.current.get(senderId) ?? []) await pc.addIceCandidate(c);
        pendingIce.current.delete(senderId);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("live:webrtc:co-host:answer", {
          streamId,
          targetId: senderId,
          description: pc.localDescription,
          participantId: senderParticipantId,
        });
      } catch {
        /* ignore */
      }
    };

    const handleCoHostAnswer = async ({
      senderId,
      description,
    }: {
      streamId: string;
      senderId: string;
      description: RTCSessionDescriptionInit;
    }) => {
      const pc = meshPeers.current.get(senderId);
      if (!pc) return;
      try {
        await pc.setRemoteDescription(description);
        for (const c of pendingIce.current.get(senderId) ?? []) await pc.addIceCandidate(c);
        pendingIce.current.delete(senderId);
      } catch {
        /* ignore */
      }
    };

    const handleCoHostIce = async ({
      senderId,
      candidate,
    }: {
      streamId: string;
      senderId: string;
      candidate: RTCIceCandidateInit;
    }) => {
      if (!candidate) return;
      const pc = meshPeers.current.get(senderId);
      if (!pc) return;
      if (pc.remoteDescription) {
        try {
          await pc.addIceCandidate(candidate);
        } catch {
          /* late */
        }
      } else {
        const queued = pendingIce.current.get(senderId) ?? [];
        queued.push(candidate);
        pendingIce.current.set(senderId, queued);
      }
    };

    socket.on("live:co-host:webrtc-ready", handleCoHostReady);
    socket.on("live:webrtc:co-host:offer", handleCoHostOffer);
    socket.on("live:webrtc:co-host:answer", handleCoHostAnswer);
    socket.on("live:webrtc:co-host:ice", handleCoHostIce);

    return () => {
      socket.off("live:co-host:webrtc-ready", handleCoHostReady);
      socket.off("live:webrtc:co-host:offer", handleCoHostOffer);
      socket.off("live:webrtc:co-host:answer", handleCoHostAnswer);
      socket.off("live:webrtc:co-host:ice", handleCoHostIce);
      meshPeers.current.forEach((pc) => pc.close());
      meshPeers.current.clear();
      participantSockets.current.clear();
      socketParticipants.current.clear();
      streamsMap.current.clear();
      pendingIce.current.clear();
      setCoHostStreams([]);
    };
  }, [streamId, enabled]);

  function removeCoHostStream(participantId: string) {
    streamsMap.current.delete(participantId);
    setCoHostStreams(
      Array.from(streamsMap.current.entries()).map(([pid, str]) => ({
        participantId: pid,
        stream: str,
      })),
    );
  }

  return { coHostStreams, removeCoHostStream };
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
      .getUserMedia({ video: { facingMode: facing }, audio: AUDIO_CONSTRAINTS })
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

  return {
    stream,
    error,
    micOn,
    camOn,
    facing,
    cameraDeviceId: stream?.getVideoTracks()[0]?.getSettings().deviceId ?? null,
    toggleMic,
    toggleCam,
    flipCamera,
  };
}
