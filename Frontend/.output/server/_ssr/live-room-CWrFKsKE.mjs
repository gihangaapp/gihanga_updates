import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { a as getConsumerAccessToken, n as api, o as getStaffAccessToken } from "./api-client-C-02deeD.mjs";
import { A as liveCaptureConstraints, M as livePreviewConstraints, g as LIVE_VIDEO_QUALITY, j as liveIceServers, v as MESH_VIDEO_SEND_PARAMS, y as QUALITY_THRESHOLDS } from "./router-NU7wHj2a.mjs";
import { n as getLiveSocket } from "./auth-context-Duh7Mq6E.mjs";
import { i as Track, n as Room, r as RoomEvent, t as AudioPresets } from "../_libs/livekit-client.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/live-room-CWrFKsKE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
/**
* Explicit mic constraints for every getUserMedia() call in this file.
* Leaving `audio: true` as a bare boolean lets the browser pick its own
* defaults, which is exactly what produced audible echo/feedback when a
* host and a co-host tested from two devices near each other. Turning
* these on explicitly is required, not optional, whenever two open mics
* might be in the same room.
*/
var AUDIO_CONSTRAINTS$1 = {
	echoCancellation: true,
	noiseSuppression: true,
	autoGainControl: true
};
/**
* A1 — mesh bitrate shaping. LiveKit publishers get simulcast + explicit
* encoding at publish time; the mesh path gets the equivalent via
* RTCRtpSender.setParameters (maxBitrate + no downscaling at the source).
* Applied after tracks are added; failures are non-fatal (some browsers
* reject setParameters mid-negotiation — the default encoder still works).
*/
async function applyMeshVideoBitrate(pc) {
	try {
		for (const sender of pc.getSenders()) {
			if (sender.track?.kind !== "video") continue;
			const params = sender.getParameters();
			if (!params.encodings || params.encodings.length === 0) params.encodings = [{}];
			const primary = params.encodings[0];
			if (primary) {
				primary.maxBitrate = MESH_VIDEO_SEND_PARAMS.maxBitrate;
				primary.scaleResolutionDownBy = MESH_VIDEO_SEND_PARAMS.scaleResolutionDownBy;
			}
			await sender.setParameters(params);
		}
	} catch {}
}
/**
* A6 — mesh connection-quality sampling: poll one PeerConnection's stats
* every 2 s and feed loss/rtt/bitrate into the shared pure classifier.
*/
function startMeshQualityPolling(pc, onSample) {
	let lastBytes = null;
	const timer = setInterval(() => {
		pc.getStats().then((report) => {
			const at = Date.now();
			let loss;
			let rttMs;
			let bitrateKbps;
			let inbound = 0;
			let outbound = 0;
			report.forEach((raw) => {
				const s = raw;
				if (raw.type === "remote-inbound-rtp" || raw.type === "inbound-rtp") {
					const lost = Number(s["packetsLost"] ?? 0);
					const total = lost + Number(s["packetsReceived"] ?? 0);
					if (total > 0) loss = lost / total;
					const rt = s["roundTripTime"];
					if (typeof rt === "number") rttMs = rt * 1e3;
					const br = s["bytesReceived"];
					if (typeof br === "number") inbound += br;
				}
				if (raw.type === "outbound-rtp") {
					const bs = s["bytesSent"];
					if (typeof bs === "number") outbound += bs;
				}
				if (raw.type === "candidate-pair") {
					const crt = s["currentRoundTripTime"];
					if (typeof crt === "number") rttMs = crt * 1e3;
				}
			});
			const prev = lastBytes;
			lastBytes = {
				inbound,
				outbound,
				at
			};
			if (prev) {
				const sec = (at - prev.at) / 1e3;
				const bytesDelta = Math.max(0, inbound + outbound - prev.inbound - prev.outbound);
				if (sec > 0) bitrateKbps = bytesDelta * 8 / 1e3 / sec;
			}
			onSample({
				at,
				...loss !== void 0 ? { loss } : {},
				...rttMs !== void 0 ? { rttMs } : {},
				...bitrateKbps !== void 0 ? { bitrateKbps } : {},
				online: true
			});
		}).catch(() => {});
	}, 2e3);
	return () => clearInterval(timer);
}
/**
* Browser-native WebRTC live video. Socket.IO is used only to exchange SDP and
* ICE candidates; media flows directly between the host and viewers.
* This deliberately has no hosted media-server dependency.
*/
function useBrowserLiveRoom$1({ streamId, publish, enabled }) {
	const [localStream, setLocalStream] = (0, import_react.useState)(null);
	const [remoteStream, setRemoteStream] = (0, import_react.useState)(null);
	const [connected, setConnected] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [micOn, setMicOn] = (0, import_react.useState)(true);
	const [camOn, setCamOn] = (0, import_react.useState)(true);
	const [qualitySamples, setQualitySamples] = (0, import_react.useState)([]);
	const peerRef = (0, import_react.useRef)(null);
	const localRef = (0, import_react.useRef)(null);
	const pendingCandidates = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const targetPeerId = (0, import_react.useRef)(null);
	const hostPeers = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const readyTimerRef = (0, import_react.useRef)(null);
	const qualityStoppers = (0, import_react.useRef)([]);
	(0, import_react.useEffect)(() => {
		if (!enabled || !streamId) return;
		const socket = getLiveSocket();
		if (!socket) {
			setError("Sign in to connect to live video.");
			return;
		}
		let cancelled = false;
		const peer = new RTCPeerConnection({ iceServers: liveIceServers() });
		peerRef.current = peer;
		setError(null);
		setConnected(false);
		qualityStoppers.current.push(startMeshQualityPolling(peer, (sample) => setQualitySamples((prev) => [...prev.slice(-31), sample])));
		const sendOffer = async (viewerId, negotiationPeer = peer) => {
			if (cancelled || !publish || !viewerId || negotiationPeer.signalingState !== "stable") return;
			targetPeerId.current = viewerId;
			try {
				const offer = await negotiationPeer.createOffer({
					offerToReceiveAudio: true,
					offerToReceiveVideo: true
				});
				await negotiationPeer.setLocalDescription(offer);
				socket.emit("live:webrtc:offer", {
					streamId,
					targetId: viewerId,
					description: negotiationPeer.localDescription
				});
			} catch (err) {
				if (!cancelled) setError(err?.message || "Could not start live video.");
			}
		};
		const handleReady = ({ viewerId }) => {
			if (!publish || cancelled || hostPeers.current.has(viewerId)) return;
			const hostPeer = new RTCPeerConnection({ iceServers: liveIceServers() });
			hostPeers.current.set(viewerId, hostPeer);
			localRef.current?.getTracks().forEach((track) => hostPeer.addTrack(track, localRef.current));
			applyMeshVideoBitrate(hostPeer);
			qualityStoppers.current.push(startMeshQualityPolling(hostPeer, (sample) => setQualitySamples((prev) => [...prev.slice(-31), sample])));
			hostPeer.onicecandidate = ({ candidate }) => {
				if (candidate) socket.emit("live:webrtc:ice", {
					streamId,
					targetId: viewerId,
					candidate
				});
			};
			hostPeer.onconnectionstatechange = () => {
				if ([
					"failed",
					"disconnected",
					"closed"
				].includes(hostPeer.connectionState)) {
					hostPeers.current.delete(viewerId);
					hostPeer.close();
				}
			};
			sendOffer(viewerId, hostPeer);
		};
		const handleOffer = async ({ description, hostId }) => {
			if (publish || cancelled) return;
			try {
				targetPeerId.current = hostId;
				await peer.setRemoteDescription(description);
				for (const candidate of pendingCandidates.current.get(hostId) ?? []) await peer.addIceCandidate(candidate);
				pendingCandidates.current.delete(hostId);
				const answer = await peer.createAnswer();
				await peer.setLocalDescription(answer);
				socket.emit("live:webrtc:answer", {
					streamId,
					targetId: hostId,
					description: peer.localDescription
				});
			} catch (err) {
				if (!cancelled) setError(err?.message || "Could not join live video.");
			}
		};
		const handleAnswer = async ({ description, viewerId }) => {
			if (!publish || cancelled) return;
			const hostPeer = hostPeers.current.get(viewerId);
			if (!hostPeer) return;
			try {
				await hostPeer.setRemoteDescription(description);
				for (const candidate of pendingCandidates.current.get(viewerId) ?? []) await hostPeer.addIceCandidate(candidate);
				pendingCandidates.current.delete(viewerId);
			} catch (err) {
				if (!cancelled) setError(err?.message || "Could not complete live video connection.");
			}
		};
		const handleCandidate = async ({ candidate, senderId }) => {
			if (!candidate || cancelled) return;
			const candidatePeer = publish ? hostPeers.current.get(senderId) : peer;
			if (!candidatePeer || !publish && targetPeerId.current && targetPeerId.current !== senderId) return;
			if (candidatePeer.remoteDescription) try {
				await candidatePeer.addIceCandidate(candidate);
			} catch {}
			else {
				const queued = pendingCandidates.current.get(senderId) ?? [];
				queued.push(candidate);
				pendingCandidates.current.set(senderId, queued);
			}
		};
		peer.onicecandidate = ({ candidate }) => {
			if (candidate && targetPeerId.current) socket.emit("live:webrtc:ice", {
				streamId,
				targetId: targetPeerId.current,
				candidate
			});
		};
		peer.ontrack = ({ streams, track }) => {
			const incoming = streams[0] ?? new MediaStream([track]);
			setRemoteStream(incoming);
			setConnected(true);
		};
		peer.onconnectionstatechange = () => {
			if (peer.connectionState === "connected") setConnected(true);
			if ([
				"failed",
				"disconnected",
				"closed"
			].includes(peer.connectionState)) setConnected(false);
		};
		socket.on("live:webrtc:viewer-ready", handleReady);
		socket.on("live:webrtc:offer", handleOffer);
		socket.on("live:webrtc:answer", handleAnswer);
		socket.on("live:webrtc:ice", handleCandidate);
		let announceReady = null;
		const start = async () => {
			if (publish) {
				if (!navigator.mediaDevices?.getUserMedia) {
					setError("Camera access is unavailable. Open the site over HTTPS or localhost.");
					return;
				}
				try {
					let media;
					try {
						media = await navigator.mediaDevices.getUserMedia({
							video: liveCaptureConstraints(),
							audio: AUDIO_CONSTRAINTS$1
						});
					} catch {
						media = await navigator.mediaDevices.getUserMedia({
							video: true,
							audio: false
						});
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
				} catch (err) {
					if (!cancelled) setError(err?.message || "Allow camera access to start streaming.");
				}
			} else {
				announceReady = () => {
					if (readyTimerRef.current) window.clearTimeout(readyTimerRef.current);
					readyTimerRef.current = window.setTimeout(() => {
						if (!cancelled) socket.emit("live:webrtc:ready", { streamId });
					}, 600);
				};
				socket.on("connect", announceReady);
				if (socket.connected) announceReady();
			}
		};
		start();
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
			qualityStoppers.current.forEach((stop) => stop());
			qualityStoppers.current = [];
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
	}, [
		streamId,
		publish,
		enabled
	]);
	function toggleMic() {
		localRef.current?.getAudioTracks().forEach((track) => track.enabled = !micOn);
		setMicOn((value) => !value);
	}
	function toggleCamera() {
		localRef.current?.getVideoTracks().forEach((track) => track.enabled = !camOn);
		setCamOn((value) => !value);
	}
	function switchCamera() {
		const track = localRef.current?.getVideoTracks()[0];
		if (!track) return;
		const current = track.getSettings().facingMode;
		track.applyConstraints({ facingMode: current === "user" ? "environment" : "user" }).catch(() => {});
	}
	return {
		localStream,
		remoteStream,
		connected,
		error,
		micOn,
		camOn,
		qualitySamples,
		toggleMic,
		toggleCamera,
		switchCamera
	};
}
function useCoHostLiveRoom$1({ streamId, hostId, myUserId, enabled }) {
	const [localStream, setLocalStream] = (0, import_react.useState)(null);
	const [coHostStreams, setCoHostStreams] = (0, import_react.useState)([]);
	const [connected, setConnected] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [micOn, setMicOn] = (0, import_react.useState)(true);
	const [camOn, setCamOn] = (0, import_react.useState)(true);
	const [qualitySamples, setQualitySamples] = (0, import_react.useState)([]);
	const localRef = (0, import_react.useRef)(null);
	const meshPeers = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const pendingIce = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const participantSockets = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const socketParticipants = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const streamsMap = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const cancelledRef = (0, import_react.useRef)(false);
	const qualityStoppers = (0, import_react.useRef)([]);
	(0, import_react.useEffect)(() => {
		if (!enabled || !streamId) return;
		const socket = getLiveSocket();
		if (!socket) {
			setError("Sign in to join as co-host.");
			return;
		}
		cancelledRef.current = false;
		setError(null);
		/** Create a new PeerConnection to a specific target socket */
		const createMeshPeer = (targetSocketId) => {
			if (meshPeers.current.has(targetSocketId)) return meshPeers.current.get(targetSocketId);
			const pc = new RTCPeerConnection({ iceServers: liveIceServers() });
			meshPeers.current.set(targetSocketId, pc);
			localRef.current?.getTracks().forEach((track) => pc.addTrack(track, localRef.current));
			applyMeshVideoBitrate(pc);
			qualityStoppers.current.push(startMeshQualityPolling(pc, (sample) => setQualitySamples((prev) => [...prev.slice(-31), sample])));
			pc.onicecandidate = ({ candidate }) => {
				if (candidate) {
					const pId = socketParticipants.current.get(targetSocketId);
					socket.emit("live:webrtc:co-host:ice", {
						streamId,
						targetId: targetSocketId,
						candidate,
						participantId: pId
					});
				}
			};
			pc.ontrack = ({ streams, track }) => {
				const incoming = streams[0] ?? new MediaStream([track]);
				const pId = socketParticipants.current.get(targetSocketId);
				if (!pId) return;
				streamsMap.current.set(pId, incoming);
				setCoHostStreams(Array.from(streamsMap.current.entries()).map(([pid, str]) => ({
					participantId: pid,
					stream: str
				})));
				setConnected(true);
			};
			pc.onconnectionstatechange = () => {
				if ([
					"failed",
					"disconnected",
					"closed"
				].includes(pc.connectionState)) {
					meshPeers.current.delete(targetSocketId);
					pc.close();
				}
			};
			return pc;
		};
		/** When another participant announces ready, we create a peer and send them an offer */
		const handleCoHostReady = ({ participantId, participantSocketId }) => {
			if (cancelledRef.current) return;
			if (participantId === myUserId) return;
			participantSockets.current.set(participantId, participantSocketId);
			socketParticipants.current.set(participantSocketId, participantId);
			const pc = createMeshPeer(participantSocketId);
			if (pc.signalingState !== "stable") return;
			pc.createOffer({
				offerToReceiveAudio: true,
				offerToReceiveVideo: true
			}).then((offer) => pc.setLocalDescription(offer)).then(() => {
				socket.emit("live:webrtc:co-host:offer", {
					streamId,
					targetId: participantSocketId,
					description: pc.localDescription,
					participantId: myUserId
				});
			}).catch((err) => {
				if (!cancelledRef.current) setError(err?.message || "Could not connect to co-host.");
			});
		};
		/** Receive an offer from another participant — create peer, add tracks, send answer */
		const handleCoHostOffer = async ({ senderId, senderParticipantId, description }) => {
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
					participantId: myUserId
				});
			} catch (err) {
				if (!cancelledRef.current) setError(err?.message || "Could not connect to co-host.");
			}
		};
		/** Receive an answer to our offer */
		const handleCoHostAnswer = async ({ senderId, description }) => {
			if (cancelledRef.current) return;
			const pc = meshPeers.current.get(senderId);
			if (!pc) return;
			try {
				await pc.setRemoteDescription(description);
				for (const c of pendingIce.current.get(senderId) ?? []) await pc.addIceCandidate(c);
				pendingIce.current.delete(senderId);
			} catch (err) {
				if (!cancelledRef.current) setError(err?.message || "Could not complete co-host connection.");
			}
		};
		/** Receive ICE candidate from another participant */
		const handleCoHostIce = async ({ senderId, candidate }) => {
			if (!candidate || cancelledRef.current) return;
			const pc = meshPeers.current.get(senderId);
			if (!pc) return;
			if (pc.remoteDescription) try {
				await pc.addIceCandidate(candidate);
			} catch {}
			else {
				const queued = pendingIce.current.get(senderId) ?? [];
				queued.push(candidate);
				pendingIce.current.set(senderId, queued);
			}
		};
		socket.on("live:co-host:webrtc-ready", handleCoHostReady);
		socket.on("live:webrtc:co-host:offer", handleCoHostOffer);
		socket.on("live:webrtc:co-host:answer", handleCoHostAnswer);
		socket.on("live:webrtc:co-host:ice", handleCoHostIce);
		if (navigator.mediaDevices?.getUserMedia) navigator.mediaDevices.getUserMedia({
			video: liveCaptureConstraints(),
			audio: AUDIO_CONSTRAINTS$1
		}).catch(() => navigator.mediaDevices.getUserMedia({
			video: true,
			audio: false
		})).then((media) => {
			if (cancelledRef.current) {
				media.getTracks().forEach((t) => t.stop());
				return;
			}
			localRef.current = media;
			setLocalStream(media);
			setMicOn(media.getAudioTracks().length > 0);
			setCamOn(media.getVideoTracks().length > 0);
			setConnected(true);
			socket.emit("live:co-host:webrtc-ready", { streamId });
		}).catch((err) => {
			if (!cancelledRef.current) setError(err?.message || "Allow camera access to join as co-host.");
		});
		else setError("Camera access is unavailable. Open the site over HTTPS or localhost.");
		return () => {
			cancelledRef.current = true;
			qualityStoppers.current.forEach((stop) => stop());
			qualityStoppers.current = [];
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
	}, [
		streamId,
		hostId,
		myUserId,
		enabled
	]);
	function toggleMic() {
		localRef.current?.getAudioTracks().forEach((track) => track.enabled = !micOn);
		setMicOn((v) => !v);
	}
	function toggleCamera() {
		localRef.current?.getVideoTracks().forEach((track) => track.enabled = !camOn);
		setCamOn((v) => !v);
	}
	function flipCamera() {
		const track = localRef.current?.getVideoTracks()[0];
		if (!track) return;
		const current = track.getSettings().facingMode;
		track.applyConstraints({ facingMode: current === "user" ? "environment" : "user" }).catch(() => {});
	}
	function removeCoHostStream(participantId) {
		streamsMap.current.delete(participantId);
		setCoHostStreams(Array.from(streamsMap.current.entries()).map(([pid, str]) => ({
			participantId: pid,
			stream: str
		})));
	}
	return {
		localStream,
		coHostStreams,
		connected,
		error,
		micOn,
		camOn,
		qualitySamples,
		toggleMic,
		toggleCamera,
		flipCamera,
		removeCoHostStream
	};
}
function useHostCoHostMesh$1({ streamId, hostLocalStream, enabled }) {
	const [coHostStreams, setCoHostStreams] = (0, import_react.useState)([]);
	const meshPeers = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const pendingIce = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const participantSockets = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const socketParticipants = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const streamsMap = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const localRef = (0, import_react.useRef)(hostLocalStream);
	(0, import_react.useEffect)(() => {
		localRef.current = hostLocalStream;
	}, [hostLocalStream]);
	(0, import_react.useEffect)(() => {
		if (!enabled || !streamId) return;
		const socket = getLiveSocket();
		if (!socket) return;
		const createMeshPeer = (targetSocketId) => {
			if (meshPeers.current.has(targetSocketId)) return meshPeers.current.get(targetSocketId);
			const pc = new RTCPeerConnection({ iceServers: liveIceServers() });
			meshPeers.current.set(targetSocketId, pc);
			localRef.current?.getTracks().forEach((track) => pc.addTrack(track, localRef.current));
			pc.onicecandidate = ({ candidate }) => {
				if (candidate) {
					const pId = socketParticipants.current.get(targetSocketId);
					socket.emit("live:webrtc:co-host:ice", {
						streamId,
						targetId: targetSocketId,
						candidate,
						participantId: pId
					});
				}
			};
			pc.ontrack = ({ streams, track }) => {
				const incoming = streams[0] ?? new MediaStream([track]);
				const pId = socketParticipants.current.get(targetSocketId);
				if (!pId) return;
				streamsMap.current.set(pId, incoming);
				setCoHostStreams(Array.from(streamsMap.current.entries()).map(([pid, str]) => ({
					participantId: pid,
					stream: str
				})));
			};
			pc.onconnectionstatechange = () => {
				if ([
					"failed",
					"disconnected",
					"closed"
				].includes(pc.connectionState)) {
					meshPeers.current.delete(targetSocketId);
					pc.close();
				}
			};
			return pc;
		};
		const sendOfferTo = (participantId, participantSocketId, pc) => {
			if (pc.signalingState !== "stable") return;
			pc.createOffer({
				offerToReceiveAudio: true,
				offerToReceiveVideo: true
			}).then((offer) => pc.setLocalDescription(offer)).then(() => {
				socket.emit("live:webrtc:co-host:offer", {
					streamId,
					targetId: participantSocketId,
					description: pc.localDescription,
					participantId
				});
			}).catch(() => {});
		};
		const handleCoHostReady = ({ participantId, participantSocketId }) => {
			participantSockets.current.set(participantId, participantSocketId);
			socketParticipants.current.set(participantSocketId, participantId);
			const pc = createMeshPeer(participantSocketId);
			if (!localRef.current || localRef.current.getTracks().length === 0) {
				let attempts = 0;
				const waitForLocalMedia = () => {
					attempts += 1;
					if (localRef.current && localRef.current.getTracks().length > 0) {
						localRef.current.getTracks().forEach((track) => {
							if (!pc.getSenders().some((s) => s.track === track)) pc.addTrack(track, localRef.current);
						});
						sendOfferTo(participantId, participantSocketId, pc);
					} else if (attempts < 20) window.setTimeout(waitForLocalMedia, 250);
				};
				waitForLocalMedia();
				return;
			}
			sendOfferTo(participantId, participantSocketId, pc);
		};
		const handleCoHostOffer = async ({ senderId, senderParticipantId, description }) => {
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
					participantId: senderParticipantId
				});
			} catch {}
		};
		const handleCoHostAnswer = async ({ senderId, description }) => {
			const pc = meshPeers.current.get(senderId);
			if (!pc) return;
			try {
				await pc.setRemoteDescription(description);
				for (const c of pendingIce.current.get(senderId) ?? []) await pc.addIceCandidate(c);
				pendingIce.current.delete(senderId);
			} catch {}
		};
		const handleCoHostIce = async ({ senderId, candidate }) => {
			if (!candidate) return;
			const pc = meshPeers.current.get(senderId);
			if (!pc) return;
			if (pc.remoteDescription) try {
				await pc.addIceCandidate(candidate);
			} catch {}
			else {
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
	function removeCoHostStream(participantId) {
		streamsMap.current.delete(participantId);
		setCoHostStreams(Array.from(streamsMap.current.entries()).map(([pid, str]) => ({
			participantId: pid,
			stream: str
		})));
	}
	return {
		coHostStreams,
		removeCoHostStream
	};
}
function useCameraPreview(enabled) {
	const [stream, setStream] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [micOn, setMicOn] = (0, import_react.useState)(true);
	const [camOn, setCamOn] = (0, import_react.useState)(true);
	const [facing, setFacing] = (0, import_react.useState)("user");
	(0, import_react.useEffect)(() => {
		if (!enabled) return;
		let cancelled = false;
		let current = null;
		if (!navigator.mediaDevices?.getUserMedia) {
			setError("Camera access is unavailable. Open the site over HTTPS or localhost.");
			return;
		}
		setError(null);
		navigator.mediaDevices.getUserMedia({
			video: livePreviewConstraints(facing),
			audio: AUDIO_CONSTRAINTS$1
		}).catch(() => navigator.mediaDevices.getUserMedia({
			video: true,
			audio: false
		})).then((media) => {
			if (cancelled) {
				media.getTracks().forEach((track) => track.stop());
				return;
			}
			current = media;
			setStream(media);
			setMicOn(media.getAudioTracks().length > 0);
			setCamOn(media.getVideoTracks().length > 0);
		}).catch((err) => setError(err?.message || "Allow camera access to preview your stream."));
		return () => {
			cancelled = true;
			current?.getTracks().forEach((track) => track.stop());
		};
	}, [enabled, facing]);
	function toggleMic() {
		stream?.getAudioTracks().forEach((track) => track.enabled = !micOn);
		setMicOn((value) => !value);
	}
	function toggleCam() {
		stream?.getVideoTracks().forEach((track) => track.enabled = !camOn);
		setCamOn((value) => !value);
	}
	function flipCamera() {
		setFacing((value) => value === "user" ? "environment" : "user");
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
		flipCamera
	};
}
/**
* LiveKit Cloud SFU transport — drop-in replacement for browser-live.ts.
*
* The video pipe here is headless/track-level ONLY (Room + track attach via
* plain MediaStreams) — no LiveKit pre-built UI components — so the existing
* live page layout, video elements, controls and styling are preserved
* pixel-for-pixel. Every hook below mirrors the exact return shape of its
* browser-live.ts counterpart; the only change for consumers is the stream
* SOURCE: one host upload into LiveKit Cloud, fanned out by the SFU to every
* viewer, instead of one RTCPeerConnection per viewer.
*
* Chat, reactions, gifts, viewer counts, co-host REQUESTS and moderation all
* stay on the existing Socket.IO backend — LiveKit carries video/audio only.
*
* A1 (quality): capture is constrained (720p30 ideal, 360p floor; 1080p
* desktop), publishing uses simulcast layers + explicit videoEncoding +
* degradationPreference "maintain-resolution", and dynacast is on so the
* SFU drops/raises layers per-viewer as their bandwidth allows.
*
* A2 (split screen for every role): viewers subscribe to the host AND every
* accepted co-host (de-duplicated per user via the deterministic
* earliest-joined rule), exposed through useLivekitViewerStreams.
*
* A6 (connection quality): ConnectionQualityChanged / Reconnecting /
* Reconnected / Disconnected + periodic getStats are surfaced through a
* subscription API the live page feeds into the pure classifier.
*/
/**
* Explicit mic constraints for the host/co-host getUserMedia() call — kept
* identical to browser-live.ts: these are required (not optional) whenever
* two open mics might be in the same room (host + co-host), or the result is
* audible echo/feedback.
*/
var AUDIO_CONSTRAINTS = {
	echoCancellation: true,
	noiseSuppression: true,
	autoGainControl: true
};
/** LiveKit identities are "<userId>:<connectionId>" — map back to the user. */
function identityPrefix(identity) {
	return identity.split(":")[0] ?? identity;
}
function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
var TOKEN_FETCH_ATTEMPTS = 3;
/**
* Fetch a LiveKit join token from the backend, with retries on transient
* failures. Render's free web service spins down after inactivity and
* cold-starts on the next request, so the very first "go live" or "join"
* after an idle period can hit a slow/waking backend — without retry that
* would surface as a silent black screen instead of connecting.
* Auth-shaped errors (401/403/banned/ended) are terminal and re-thrown.
*/
async function fetchLiveKitToken(streamId, asStaff) {
	let lastError = null;
	for (let attempt = 1; attempt <= TOKEN_FETCH_ATTEMPTS; attempt++) try {
		return await api.get(`/live/${streamId}/livekit-token`, asStaff);
	} catch (err) {
		lastError = err;
		const message = String(err?.message ?? "");
		if (/authentication|banned|ended|not found|not configured|5-hour limit/i.test(message)) throw err;
		if (attempt < TOKEN_FETCH_ATTEMPTS) await delay(1500 * attempt);
	}
	throw lastError;
}
/**
* One LiveKit connection per stream+role. Hosts' useLivekitLiveRoom and
* useLivekitHostCoHostMesh share the SAME publisher connection (one camera,
* one upload); co-hosts and plain viewers get their own. Hooks read state
* through listeners so shared sessions stay consistent for every consumer.
*/
var LiveKitSession = class {
	room;
	streamId;
	wantPublish = false;
	hostId = null;
	asStaff = false;
	startPromise = null;
	tornDown = false;
	myPrefix = null;
	localMedia = null;
	connected = false;
	error = null;
	micOn = true;
	camOn = true;
	/** A6 — connection-level signals for the poor-connection banner. */
	reconnecting = false;
	localVideo = null;
	localAudio = null;
	remoteStreams = /* @__PURE__ */ new Map();
	stateListeners = /* @__PURE__ */ new Set();
	remoteListeners = /* @__PURE__ */ new Set();
	qualityListeners = /* @__PURE__ */ new Set();
	statsTimer = null;
	constructor(streamId) {
		this.streamId = streamId;
		this.room = new Room({
			adaptiveStream: true,
			dynacast: true
		});
		this.wireRoomEvents();
	}
	onState(listener) {
		this.stateListeners.add(listener);
		listener();
		return () => {
			this.stateListeners.delete(listener);
		};
	}
	onRemote(listener) {
		this.remoteListeners.add(listener);
		listener();
		return () => {
			this.remoteListeners.delete(listener);
		};
	}
	/** A6 — subscribe to connection-quality samples (loss/rtt/bitrate/reconnecting). */
	onQuality(listener) {
		this.qualityListeners.add(listener);
		return () => {
			this.qualityListeners.delete(listener);
		};
	}
	notifyState() {
		this.stateListeners.forEach((listener) => listener());
	}
	notifyRemote() {
		this.remoteListeners.forEach((listener) => listener());
	}
	emitQuality(sample) {
		if (this.tornDown) return;
		this.qualityListeners.forEach((listener) => listener(sample));
	}
	/** The subscribed remote stream belonging to a user (by identity prefix). */
	findRemoteByUser(userId) {
		if (!userId) return null;
		for (const [identity, stream] of this.remoteStreams) if (identityPrefix(identity) === userId) return stream;
		return null;
	}
	/** All subscribed remote participants, optionally excluding one user (self). */
	listRemoteByUser(excludeUserId) {
		const out = [];
		this.remoteStreams.forEach((stream, identity) => {
			const prefix = identityPrefix(identity);
			if (excludeUserId && prefix === excludeUserId) return;
			out.push({
				participantId: prefix,
				stream
			});
		});
		return out;
	}
	/**
	* A2 — host + every accepted co-host, in stable join order, one stream per
	* USER (earliest connection wins when the same user has two connections).
	* This is what plain viewers render as their split-screen grid.
	*/
	listViewerStreams(authorizedUserIds) {
		const perUser = /* @__PURE__ */ new Map();
		this.remoteStreams.forEach((stream, identity) => {
			const prefix = identityPrefix(identity);
			if (authorizedUserIds && !authorizedUserIds.has(prefix)) return;
			const joinedAt = Array.from(this.room.remoteParticipants.values()).find((p) => identityPrefix(p.identity) === prefix)?.joinedAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
			const existing = perUser.get(prefix);
			if (!existing || joinedAt < existing.joinedAt) perUser.set(prefix, {
				joinedAt,
				entry: {
					participantId: prefix,
					stream
				}
			});
		});
		return Array.from(perUser.values()).sort((a, b) => a.joinedAt - b.joinedAt).map(({ entry }) => entry);
	}
	/** Host-side removal (co-host left / was evicted) — mirrors the mesh API. */
	removeRemoteByUser(userId) {
		let changed = false;
		Array.from(this.remoteStreams.keys()).forEach((identity) => {
			if (identityPrefix(identity) === userId) {
				this.remoteStreams.delete(identity);
				changed = true;
			}
		});
		if (changed) this.notifyRemote();
	}
	toggleMic() {
		if (this.localAudio) {
			if (this.micOn) this.localAudio.mute().catch(() => {});
			else this.localAudio.unmute().catch(() => {});
		}
		this.micOn = !this.micOn;
		this.notifyState();
	}
	toggleCamera() {
		if (this.localVideo) {
			if (this.camOn) this.localVideo.mute().catch(() => {});
			else this.localVideo.unmute().catch(() => {});
		}
		this.camOn = !this.camOn;
		this.notifyState();
	}
	switchCamera() {
		const track = this.localVideo?.mediaStreamTrack;
		if (!track) return;
		const current = track.getSettings().facingMode;
		track.applyConstraints({ facingMode: current === "user" ? "environment" : "user" }).catch(() => {});
	}
	/** Idempotent. The FIRST caller fixes the session's role (publish or not). */
	start(options) {
		if (this.startPromise) return this.startPromise;
		this.wantPublish = options.publish;
		this.hostId = options.hostId ?? null;
		this.asStaff = options.asStaff ?? false;
		this.startPromise = this.run().catch((err) => {
			const message = err instanceof Error && err.message ? err.message : "Could not start the live video connection.";
			this.fail(message);
		});
		return this.startPromise;
	}
	fail(message) {
		if (this.tornDown) return;
		this.error = message;
		this.connected = false;
		this.stopLocalMedia();
		this.teardownConnection();
		this.notifyState();
	}
	async run() {
		if (this.wantPublish) {
			if (!navigator.mediaDevices?.getUserMedia) {
				this.fail("Camera access is unavailable. Open the site over HTTPS or localhost.");
				return;
			}
			let media;
			try {
				media = await navigator.mediaDevices.getUserMedia({
					video: liveCaptureConstraints(),
					audio: AUDIO_CONSTRAINTS
				});
			} catch {
				media = await navigator.mediaDevices.getUserMedia({
					video: true,
					audio: false
				});
			}
			if (this.tornDown) {
				media.getTracks().forEach((track) => track.stop());
				return;
			}
			this.localMedia = media;
			this.micOn = media.getAudioTracks().length > 0;
			this.camOn = media.getVideoTracks().length > 0;
			this.connected = true;
			this.notifyState();
		}
		const { url, token } = await fetchLiveKitToken(this.streamId, this.asStaff);
		if (this.tornDown) return;
		const wsUrl = url || {
			"BASE_URL": "/",
			"DEV": false,
			"MODE": "production",
			"PROD": true,
			"SSR": true,
			"TSS_DEV_SERVER": "false",
			"TSS_DEV_SSR_STYLES_BASEPATH": "/",
			"TSS_DEV_SSR_STYLES_ENABLED": "true",
			"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
			"TSS_INLINE_CSS_ENABLED": "false",
			"TSS_ROUTER_BASEPATH": "",
			"TSS_SERVER_FN_BASE": "/_serverFn/"
		}["VITE_LIVEKIT_URL"] || "";
		if (!wsUrl) {
			this.fail("Live video service URL is missing.");
			return;
		}
		await this.room.connect(wsUrl, token, { autoSubscribe: false });
		if (this.tornDown) return;
		this.myPrefix = identityPrefix(this.room.localParticipant.identity);
		if (this.wantPublish) {
			const videoTrack = this.localMedia?.getVideoTracks()[0];
			const audioTrack = this.localMedia?.getAudioTracks()[0];
			if (videoTrack) {
				const publication = await this.room.localParticipant.publishTrack(videoTrack, {
					simulcast: true,
					videoEncoding: {
						maxBitrate: LIVE_VIDEO_QUALITY.maxBitrate,
						maxFramerate: 30
					},
					videoCodec: LIVE_VIDEO_QUALITY.preferredCodecs[0],
					degradationPreference: "maintain-resolution",
					source: Track.Source.Camera
				});
				this.localVideo = publication.track ?? null;
			}
			if (audioTrack) {
				const publication = await this.room.localParticipant.publishTrack(audioTrack, {
					audioPreset: AudioPresets.speech,
					source: Track.Source.Microphone
				});
				this.localAudio = publication.track ?? null;
			}
			if (this.tornDown) return;
			this.notifyState();
		} else this.refreshSubscriptions();
		this.startStatsPolling();
	}
	/**
	* A2 subscription policy. Publishers subscribe to every other publisher
	* (all co-hosts). Viewers subscribe to the host AND every ACCEPTED
	* co-host (authorization list passed in via setViewerAuthorization);
	* multiple connections of the same user are de-duplicated deterministically
	* by the earliest-joined rule (listViewerStreams above).
	*/
	viewerAuthorized = null;
	setViewerAuthorization(userIds) {
		this.viewerAuthorized = userIds ? new Set(userIds) : null;
		if (!this.wantPublish) this.refreshSubscriptions();
	}
	refreshSubscriptions() {
		const remotes = Array.from(this.room.remoteParticipants.values());
		if (this.wantPublish) {
			remotes.forEach((p) => this.applySubscription(p, identityPrefix(p.identity) !== this.myPrefix));
			return;
		}
		if (this.viewerAuthorized) {
			const authorized = this.viewerAuthorized;
			const perUser = /* @__PURE__ */ new Map();
			remotes.forEach((p) => {
				const prefix = identityPrefix(p.identity);
				if (prefix === this.myPrefix) return;
				if (!authorized.has(prefix)) return;
				const joinedAt = p.joinedAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
				const existing = perUser.get(prefix);
				if (!existing || joinedAt < existing.joinedAt) perUser.set(prefix, {
					participant: p,
					joinedAt
				});
			});
			remotes.forEach((p) => {
				const prefix = identityPrefix(p.identity);
				const chosen = perUser.get(prefix)?.participant;
				this.applySubscription(p, chosen === p);
			});
			return;
		}
		const hostRemotes = this.hostId ? remotes.filter((p) => identityPrefix(p.identity) === this.hostId) : [];
		hostRemotes.sort((a, b) => (a.joinedAt?.getTime() ?? 0) - (b.joinedAt?.getTime() ?? 0));
		remotes.forEach((p) => {
			const isHostEarliest = hostRemotes[0] === p;
			this.applySubscription(p, Boolean(isHostEarliest));
		});
	}
	applySubscription(participant, want) {
		participant.trackPublications.forEach((publication) => {
			if (publication.isSubscribed !== want) publication.setSubscribed(want);
		});
	}
	/** Rebuild one participant's MediaStream from its subscribed tracks. */
	rebuildRemote(identity) {
		const participant = this.room.remoteParticipants.get(identity);
		if (!participant) {
			this.remoteStreams.delete(identity);
			return;
		}
		const tracks = [];
		participant.trackPublications.forEach((publication) => {
			if (publication.isSubscribed && publication.track) tracks.push(publication.track.mediaStreamTrack);
		});
		if (tracks.length === 0) {
			this.remoteStreams.delete(identity);
			return;
		}
		this.remoteStreams.set(identity, new MediaStream(tracks));
	}
	startStatsPolling() {
		if (this.statsTimer) return;
		this.statsTimer = setInterval(() => {
			this.sampleStats();
		}, 2e3);
	}
	async sampleStats() {
		if (this.tornDown) return;
		const at = Date.now();
		if (this.reconnecting) {
			this.emitQuality({
				at,
				online: false
			});
			return;
		}
		if (this.wantPublish) {
			try {
				const statsList = this.localVideo ? await this.localVideo.getSenderStats() : [];
				const s = statsList.find((x) => x.rid === "q") ?? statsList[0];
				if (s) {
					const packets = (s.packetsSent ?? 0) + (s.packetsLost ?? 0);
					const loss = packets > 0 ? (s.packetsLost ?? 0) / packets : 0;
					let bitrateKbps;
					if (typeof s.bytesSent === "number") {
						const prev = this.lastSenderBytes;
						if (prev && s.bytesSent >= prev.bytes) {
							const sec = (at - prev.at) / 1e3;
							if (sec > 0) bitrateKbps = (s.bytesSent - prev.bytes) * 8 / 1e3 / sec;
						}
						this.lastSenderBytes = {
							bytes: s.bytesSent,
							at
						};
					}
					this.emitQuality({
						at,
						loss,
						...typeof s.roundTripTime === "number" ? { rttMs: s.roundTripTime * 1e3 } : {},
						...bitrateKbps !== void 0 ? { bitrateKbps } : {},
						online: true
					});
					return;
				}
			} catch {}
			this.emitQuality({
				at,
				online: true
			});
			return;
		}
		try {
			let receiverStats;
			for (const participant of this.room.remoteParticipants.values()) {
				for (const publication of participant.trackPublications.values()) if (publication.isSubscribed && publication.kind === Track.Kind.Video && publication.track) {
					receiverStats = await publication.track.getReceiverStats();
					break;
				}
				if (receiverStats) break;
			}
			if (receiverStats) {
				const packets = (receiverStats.packetsReceived ?? 0) + (receiverStats.packetsLost ?? 0);
				const loss = packets > 0 ? (receiverStats.packetsLost ?? 0) / packets : 0;
				let bitrateKbps;
				if (typeof receiverStats.bytesReceived === "number") {
					const prev = this.lastReceiverBytes;
					if (prev && receiverStats.bytesReceived >= prev.bytes) {
						const sec = (at - prev.at) / 1e3;
						if (sec > 0) bitrateKbps = (receiverStats.bytesReceived - prev.bytes) * 8 / 1e3 / sec;
					}
					this.lastReceiverBytes = {
						bytes: receiverStats.bytesReceived,
						at
					};
				}
				this.emitQuality({
					at,
					loss,
					...bitrateKbps !== void 0 ? { bitrateKbps } : {},
					online: true
				});
				return;
			}
		} catch {}
		this.emitQuality({
			at,
			online: true
		});
	}
	lastSenderBytes = null;
	lastReceiverBytes = null;
	wireRoomEvents() {
		this.room.on(RoomEvent.Connected, () => {
			if (this.tornDown) return;
			this.connected = true;
			this.notifyState();
		});
		this.room.on(RoomEvent.Disconnected, () => {
			if (this.tornDown) return;
			this.connected = false;
			this.notifyState();
		});
		this.room.on(RoomEvent.Reconnecting, () => {
			if (this.tornDown) return;
			this.reconnecting = true;
			this.emitQuality({
				at: Date.now(),
				online: false
			});
			this.notifyState();
		});
		this.room.on(RoomEvent.Reconnected, () => {
			if (this.tornDown) return;
			this.reconnecting = false;
			this.connected = true;
			this.refreshSubscriptions();
			this.notifyState();
		});
		this.room.on(RoomEvent.SignalReconnecting, () => {
			if (this.tornDown) return;
			this.reconnecting = true;
			this.notifyState();
		});
		this.room.on(RoomEvent.ConnectionQualityChanged, (quality, participant) => {
			if (this.tornDown) return;
			if (participant.isLocal) {
				const poor = quality === "poor" || quality === "lost";
				this.emitQuality({
					at: Date.now(),
					online: quality !== "lost",
					...poor ? { rttMs: QUALITY_THRESHOLDS.poorRttMs + 50 } : {}
				});
			}
		});
		this.room.on(RoomEvent.ParticipantConnected, () => {
			if (this.tornDown) return;
			this.refreshSubscriptions();
		});
		this.room.on(RoomEvent.TrackPublished, (_publication, _participant) => {
			if (this.tornDown) return;
			this.refreshSubscriptions();
		});
		this.room.on(RoomEvent.TrackSubscribed, (_track, _publication, participant) => {
			if (this.tornDown) return;
			this.rebuildRemote(participant.identity);
			this.notifyRemote();
		});
		this.room.on(RoomEvent.TrackUnsubscribed, (_track, _publication, participant) => {
			if (this.tornDown) return;
			this.rebuildRemote(participant.identity);
			this.notifyRemote();
		});
		this.room.on(RoomEvent.TrackUnpublished, (_publication, participant) => {
			if (this.tornDown) return;
			this.rebuildRemote(participant.identity);
		});
		this.room.on(RoomEvent.ParticipantDisconnected, (participant) => {
			if (this.tornDown) return;
			if (this.remoteStreams.delete(participant.identity)) this.notifyRemote();
			this.refreshSubscriptions();
		});
	}
	stopLocalMedia() {
		this.localMedia?.getTracks().forEach((track) => track.stop());
		this.localMedia = null;
		this.localVideo = null;
		this.localAudio = null;
	}
	teardownConnection() {
		if (this.statsTimer) {
			clearInterval(this.statsTimer);
			this.statsTimer = null;
		}
		try {
			this.room.disconnect();
		} catch {}
	}
	/** Final teardown once no hook references the session anymore. */
	teardown() {
		this.tornDown = true;
		this.stopLocalMedia();
		this.teardownConnection();
		this.stateListeners.clear();
		this.remoteListeners.clear();
		this.qualityListeners.clear();
		this.remoteStreams.clear();
		this.lastSenderBytes = null;
		this.lastReceiverBytes = null;
	}
};
var sessions = /* @__PURE__ */ new Map();
var TEARDOWN_DELAY_MS = 750;
function sessionKey(streamId, wantPublish) {
	return `${streamId}::${wantPublish ? "pub" : "sub"}`;
}
function acquireSession(streamId, wantPublish) {
	const key = sessionKey(streamId, wantPublish);
	let entry = sessions.get(key);
	if (!entry) {
		entry = {
			session: new LiveKitSession(streamId),
			refs: 0,
			releaseTimer: null
		};
		sessions.set(key, entry);
	}
	if (entry.releaseTimer) {
		clearTimeout(entry.releaseTimer);
		entry.releaseTimer = null;
	}
	entry.refs += 1;
	return entry.session;
}
function releaseSession(streamId, wantPublish) {
	const key = sessionKey(streamId, wantPublish);
	const entry = sessions.get(key);
	if (!entry) return;
	entry.refs -= 1;
	if (entry.refs > 0) return;
	entry.releaseTimer = setTimeout(() => {
		sessions.delete(key);
		entry.session.teardown();
	}, TEARDOWN_DELAY_MS);
}
function useLivekitLiveRoom({ streamId, publish, enabled, hostId = "", asStaff = false }) {
	const [localStream, setLocalStream] = (0, import_react.useState)(null);
	const [remoteStream, setRemoteStream] = (0, import_react.useState)(null);
	const [connected, setConnected] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [micOn, setMicOn] = (0, import_react.useState)(true);
	const [camOn, setCamOn] = (0, import_react.useState)(true);
	const [qualitySamples, setQualitySamples] = (0, import_react.useState)([]);
	const sessionRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!enabled || !streamId) return;
		if (!(asStaff ? Boolean(getStaffAccessToken()) : Boolean(getConsumerAccessToken()))) {
			setError("Sign in to connect to live video.");
			return;
		}
		const session = acquireSession(streamId, publish);
		sessionRef.current = session;
		const offState = session.onState(() => {
			setLocalStream(session.localMedia);
			setConnected(session.connected);
			setError(session.error);
			setMicOn(session.micOn);
			setCamOn(session.camOn);
		});
		const offRemote = session.onRemote(() => {
			if (publish) return;
			const found = hostId ? session.findRemoteByUser(hostId) : null;
			setRemoteStream(found ? new MediaStream(found.getTracks()) : null);
		});
		const offQuality = session.onQuality((sample) => {
			setQualitySamples((prev) => [...prev.slice(-31), sample]);
		});
		session.start({
			publish,
			hostId,
			asStaff
		});
		return () => {
			offState();
			offRemote();
			offQuality();
			sessionRef.current = null;
			releaseSession(streamId, publish);
		};
	}, [
		streamId,
		publish,
		enabled,
		hostId,
		asStaff
	]);
	function toggleMic() {
		sessionRef.current?.toggleMic();
	}
	function toggleCamera() {
		sessionRef.current?.toggleCamera();
	}
	function switchCamera() {
		sessionRef.current?.switchCamera();
	}
	return {
		localStream,
		remoteStream,
		connected,
		error,
		micOn,
		camOn,
		qualitySamples,
		toggleMic,
		toggleCamera,
		switchCamera
	};
}
function useLivekitCoHostRoom({ streamId, hostId, myUserId, enabled, asStaff = false }) {
	const [localStream, setLocalStream] = (0, import_react.useState)(null);
	const [coHostStreams, setCoHostStreams] = (0, import_react.useState)([]);
	const [connected, setConnected] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [micOn, setMicOn] = (0, import_react.useState)(true);
	const [camOn, setCamOn] = (0, import_react.useState)(true);
	const [qualitySamples, setQualitySamples] = (0, import_react.useState)([]);
	const sessionRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!enabled || !streamId) return;
		if (!(asStaff ? Boolean(getStaffAccessToken()) : Boolean(getConsumerAccessToken()))) {
			setError("Sign in to join as co-host.");
			return;
		}
		const session = acquireSession(streamId, true);
		sessionRef.current = session;
		const offState = session.onState(() => {
			setLocalStream(session.localMedia);
			setConnected(session.connected);
			setError(session.error);
			setMicOn(session.micOn);
			setCamOn(session.camOn);
		});
		const offRemote = session.onRemote(() => {
			setCoHostStreams(session.listRemoteByUser(myUserId || null));
		});
		const offQuality = session.onQuality((sample) => {
			setQualitySamples((prev) => [...prev.slice(-31), sample]);
		});
		session.start({
			publish: true,
			hostId,
			asStaff: Boolean(asStaff)
		});
		return () => {
			offState();
			offRemote();
			offQuality();
			sessionRef.current = null;
			releaseSession(streamId, true);
		};
	}, [
		streamId,
		hostId,
		myUserId,
		enabled,
		asStaff
	]);
	function toggleMic() {
		sessionRef.current?.toggleMic();
	}
	function toggleCamera() {
		sessionRef.current?.toggleCamera();
	}
	function flipCamera() {
		sessionRef.current?.switchCamera();
	}
	function removeCoHostStream(participantId) {
		sessionRef.current?.removeRemoteByUser(participantId);
	}
	return {
		localStream,
		coHostStreams,
		connected,
		error,
		micOn,
		camOn,
		qualitySamples,
		toggleMic,
		toggleCamera,
		flipCamera,
		removeCoHostStream
	};
}
function useLivekitHostCoHostMesh({ streamId, enabled }) {
	const [coHostStreams, setCoHostStreams] = (0, import_react.useState)([]);
	const sessionRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!enabled || !streamId) return;
		const session = acquireSession(streamId, true);
		sessionRef.current = session;
		const offRemote = session.onRemote(() => {
			setCoHostStreams(session.listRemoteByUser(null));
		});
		return () => {
			offRemote();
			sessionRef.current = null;
			releaseSession(streamId, true);
		};
	}, [streamId, enabled]);
	function removeCoHostStream(participantId) {
		sessionRef.current?.removeRemoteByUser(participantId);
	}
	return {
		coHostStreams,
		removeCoHostStream
	};
}
/**
* A2 — the plain viewer's split-screen source: the host AND every accepted
* co-host, stable join order, one tile per user. The live page passes the
* authorization list (host + coHostList ids) so the SFU subscription policy
* and the UI can never disagree about who is on screen.
*/
function useLivekitViewerStreams({ streamId, hostId, authorizedIds, enabled, asStaff = false }) {
	const [viewerStreams, setViewerStreams] = (0, import_react.useState)([]);
	const [connected, setConnected] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [qualitySamples, setQualitySamples] = (0, import_react.useState)([]);
	const sessionRef = (0, import_react.useRef)(null);
	const authorizedKey = authorizedIds.join(",");
	(0, import_react.useEffect)(() => {
		if (!enabled || !streamId) return;
		if (!(asStaff ? Boolean(getStaffAccessToken()) : Boolean(getConsumerAccessToken()))) {
			setError("Sign in to connect to live video.");
			return;
		}
		const session = acquireSession(streamId, false);
		sessionRef.current = session;
		const offState = session.onState(() => {
			setConnected(session.connected);
			setError(session.error);
		});
		const offRemote = session.onRemote(() => {
			const allowed = /* @__PURE__ */ new Set([hostId, ...authorizedKey.split(",").filter(Boolean)]);
			setViewerStreams(session.listViewerStreams(allowed));
		});
		const offQuality = session.onQuality((sample) => {
			setQualitySamples((prev) => [...prev.slice(-31), sample]);
		});
		session.setViewerAuthorization([hostId, ...authorizedKey.split(",").filter(Boolean)]);
		session.start({
			publish: false,
			hostId,
			asStaff
		});
		return () => {
			offState();
			offRemote();
			offQuality();
			sessionRef.current = null;
			releaseSession(streamId, false);
		};
	}, [
		streamId,
		hostId,
		authorizedKey,
		enabled,
		asStaff
	]);
	return {
		viewerStreams,
		connected,
		error,
		qualitySamples
	};
}
/**
* Transport dispatcher for the live video pipe.
*
*   VITE_USE_LIVEKIT=true  → LiveKit Cloud SFU (livekit-live.ts)
*   VITE_USE_LIVEKIT=false → original browser-native WebRTC mesh (browser-live.ts)
*
* Vite statically replaces import.meta.env at build time, so the flag is a
* build-time constant. Both hooks below are still CALLED unconditionally
* (rules-of-hooks safe) — the disabled one simply receives enabled:false and
* its effect no-ops, so only one transport ever connects. Rollback is: flip
* the env var and rebuild; nothing else changes. Once LiveKit is confirmed
* stable this flag can stay as a permanent safety switch or be removed —
* the project owner decides.
*
* A2 note: the viewer-facing split-screen grid (host + co-host tiles) is
* implemented on the LiveKit path — an SFU can fan every publisher out to
* every subscriber. The legacy mesh has no server to fan out co-host video
* to plain viewers, so useViewerStreams returns an empty grid there and the
* live page shows the classic host-only view (explicitly guarded, as the
* architecture allows; enable VITE_USE_LIVEKIT + LIVEKIT_* for full grids).
*
* The exported hook names intentionally match browser-live.ts one-for-one so
* consumers swap transports by changing ONLY this import path — zero JSX,
* styling or layout changes anywhere.
*/
var USE_LIVEKIT = {
	"BASE_URL": "/",
	"DEV": false,
	"MODE": "production",
	"PROD": true,
	"SSR": true,
	"TSS_DEV_SERVER": "false",
	"TSS_DEV_SSR_STYLES_BASEPATH": "/",
	"TSS_DEV_SSR_STYLES_ENABLED": "true",
	"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
	"TSS_INLINE_CSS_ENABLED": "false",
	"TSS_ROUTER_BASEPATH": "",
	"TSS_SERVER_FN_BASE": "/_serverFn/"
}["VITE_USE_LIVEKIT"] === "true";
/** True when the viewer split-screen grid is available (SFU only). */
var VIEWER_GRID_AVAILABLE = USE_LIVEKIT;
function useBrowserLiveRoom(options) {
	const mesh = useBrowserLiveRoom$1({
		streamId: options.streamId,
		publish: options.publish,
		enabled: USE_LIVEKIT ? false : options.enabled
	});
	const livekit = useLivekitLiveRoom({
		streamId: options.streamId,
		publish: options.publish,
		enabled: USE_LIVEKIT ? options.enabled : false,
		hostId: options.hostId,
		asStaff: Boolean(options.asStaff)
	});
	return USE_LIVEKIT ? livekit : mesh;
}
function useCoHostLiveRoom(options) {
	const mesh = useCoHostLiveRoom$1({
		streamId: options.streamId,
		hostId: options.hostId,
		myUserId: options.myUserId,
		enabled: USE_LIVEKIT ? false : options.enabled
	});
	const livekit = useLivekitCoHostRoom({
		streamId: options.streamId,
		hostId: options.hostId,
		myUserId: options.myUserId,
		enabled: USE_LIVEKIT ? options.enabled : false,
		asStaff: options.asStaff
	});
	return USE_LIVEKIT ? livekit : mesh;
}
function useHostCoHostMesh(options) {
	const mesh = useHostCoHostMesh$1({
		streamId: options.streamId,
		hostLocalStream: options.hostLocalStream,
		enabled: USE_LIVEKIT ? false : options.enabled
	});
	const livekit = useLivekitHostCoHostMesh({
		streamId: options.streamId,
		hostLocalStream: options.hostLocalStream,
		enabled: USE_LIVEKIT ? options.enabled : false
	});
	return USE_LIVEKIT ? livekit : mesh;
}
/**
* A2 — plain viewers' split-screen source (host + every accepted co-host).
* LiveKit: real tiles in stable join order. Mesh: guarded — returns an empty
* list and the live page falls back to the classic host-only view.
*/
function useViewerStreams(options) {
	const livekit = useLivekitViewerStreams({
		streamId: options.streamId,
		hostId: options.hostId,
		authorizedIds: options.authorizedIds,
		enabled: USE_LIVEKIT ? options.enabled : false,
		asStaff: Boolean(options.asStaff)
	});
	return USE_LIVEKIT ? livekit : {
		viewerStreams: [],
		connected: false,
		error: null,
		qualitySamples: []
	};
}
//#endregion
export { useHostCoHostMesh as a, useCoHostLiveRoom as i, useBrowserLiveRoom as n, useViewerStreams as o, useCameraPreview as r, VIEWER_GRID_AVAILABLE as t };
