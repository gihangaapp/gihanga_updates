import { useEffect, useRef, useState } from "react";
import {
  Room,
  RoomEvent,
  Track,
  AudioPresets,
  type LocalAudioTrack,
  type LocalVideoTrack,
  type RemoteParticipant,
  type RemoteTrack,
  type RemoteTrackPublication,
  type RemoteVideoTrack,
} from "livekit-client";
import { api, getConsumerAccessToken, getStaffAccessToken } from "./api-client";
import type { CoHostRemoteStream } from "./browser-live";
import {
  LIVE_VIDEO_QUALITY,
  liveCaptureConstraints,
  QUALITY_THRESHOLDS,
} from "./live-video-config";
import type { QualitySample } from "./live-quality";

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
const AUDIO_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

/** LiveKit identities are "<userId>:<connectionId>" — map back to the user. */
function identityPrefix(identity: string): string {
  return identity.split(":")[0] ?? identity;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const TOKEN_FETCH_ATTEMPTS = 3;

/**
 * Fetch a LiveKit join token from the backend, with retries on transient
 * failures. Render's free web service spins down after inactivity and
 * cold-starts on the next request, so the very first "go live" or "join"
 * after an idle period can hit a slow/waking backend — without retry that
 * would surface as a silent black screen instead of connecting.
 * Auth-shaped errors (401/403/banned/ended) are terminal and re-thrown.
 */
async function fetchLiveKitToken(
  streamId: string,
  asStaff: boolean,
): Promise<{ url: string; token: string }> {
  let lastError: unknown = null;
  for (let attempt = 1; attempt <= TOKEN_FETCH_ATTEMPTS; attempt++) {
    try {
      return await api.get<{ url: string; token: string }>(
        `/live/${streamId}/livekit-token`,
        asStaff,
      );
    } catch (err) {
      lastError = err;
      const message = String((err as Error)?.message ?? "");
      if (/authentication|banned|ended|not found|not configured|5-hour limit/i.test(message))
        throw err;
      if (attempt < TOKEN_FETCH_ATTEMPTS) await delay(1500 * attempt);
    }
  }
  throw lastError;
}

type StateListener = () => void;
type RemoteListener = () => void;
type QualityListener = (sample: QualitySample) => void;

interface SessionStartOptions {
  publish: boolean;
  hostId?: string | undefined;
  asStaff?: boolean | undefined;
}

/**
 * One LiveKit connection per stream+role. Hosts' useLivekitLiveRoom and
 * useLivekitHostCoHostMesh share the SAME publisher connection (one camera,
 * one upload); co-hosts and plain viewers get their own. Hooks read state
 * through listeners so shared sessions stay consistent for every consumer.
 */
class LiveKitSession {
  readonly room: Room;
  private readonly streamId: string;

  private wantPublish = false;
  private hostId: string | null = null;
  private asStaff = false;
  private startPromise: Promise<void> | null = null;
  private tornDown = false;
  private myPrefix: string | null = null;

  // State slices the hooks consume.
  localMedia: MediaStream | null = null;
  connected = false;
  error: string | null = null;
  micOn = true;
  camOn = true;
  /** A6 — connection-level signals for the poor-connection banner. */
  reconnecting = false;

  private localVideo: LocalVideoTrack | null = null;
  private localAudio: LocalAudioTrack | null = null;

  // identity -> MediaStream of currently subscribed remote tracks.
  private readonly remoteStreams = new Map<string, MediaStream>();
  private readonly stateListeners = new Set<StateListener>();
  private readonly remoteListeners = new Set<RemoteListener>();
  private readonly qualityListeners = new Set<QualityListener>();
  private statsTimer: ReturnType<typeof setInterval> | null = null;

  constructor(streamId: string) {
    this.streamId = streamId;
    // adaptiveStream right-sizes video to the attached element; dynacast (A1)
    // lets the SFU pause/resume simulcast layers per-subscriber bandwidth, so
    // a viewer on a strong connection gets the high layer and a throttled one
    // steps down WITHOUT the host re-encoding anything.
    this.room = new Room({ adaptiveStream: true, dynacast: true });
    this.wireRoomEvents();
  }

  // ── Hook-facing listeners ────────────────────────────────────────────────

  onState(listener: StateListener): () => void {
    this.stateListeners.add(listener);
    listener(); // immediate current snapshot for late subscribers
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  onRemote(listener: RemoteListener): () => void {
    this.remoteListeners.add(listener);
    listener();
    return () => {
      this.remoteListeners.delete(listener);
    };
  }

  /** A6 — subscribe to connection-quality samples (loss/rtt/bitrate/reconnecting). */
  onQuality(listener: QualityListener): () => void {
    this.qualityListeners.add(listener);
    return () => {
      this.qualityListeners.delete(listener);
    };
  }

  private notifyState() {
    this.stateListeners.forEach((listener) => listener());
  }

  private notifyRemote() {
    this.remoteListeners.forEach((listener) => listener());
  }

  private emitQuality(sample: QualitySample) {
    if (this.tornDown) return;
    this.qualityListeners.forEach((listener) => listener(sample));
  }

  /** The subscribed remote stream belonging to a user (by identity prefix). */
  findRemoteByUser(userId: string): MediaStream | null {
    if (!userId) return null;
    for (const [identity, stream] of this.remoteStreams) {
      if (identityPrefix(identity) === userId) return stream;
    }
    return null;
  }

  /** All subscribed remote participants, optionally excluding one user (self). */
  listRemoteByUser(excludeUserId: string | null): CoHostRemoteStream[] {
    const out: CoHostRemoteStream[] = [];
    this.remoteStreams.forEach((stream, identity) => {
      const prefix = identityPrefix(identity);
      if (excludeUserId && prefix === excludeUserId) return;
      out.push({ participantId: prefix, stream });
    });
    return out;
  }

  /**
   * A2 — host + every accepted co-host, in stable join order, one stream per
   * USER (earliest connection wins when the same user has two connections).
   * This is what plain viewers render as their split-screen grid.
   */
  listViewerStreams(authorizedUserIds: Set<string> | null): CoHostRemoteStream[] {
    const perUser = new Map<string, { joinedAt: number; entry: CoHostRemoteStream }>();
    this.remoteStreams.forEach((stream, identity) => {
      const prefix = identityPrefix(identity);
      if (authorizedUserIds && !authorizedUserIds.has(prefix)) return;
      const participant = Array.from(this.room.remoteParticipants.values()).find(
        (p) => identityPrefix(p.identity) === prefix,
      );
      const joinedAt = participant?.joinedAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const existing = perUser.get(prefix);
      if (!existing || joinedAt < existing.joinedAt) {
        perUser.set(prefix, { joinedAt, entry: { participantId: prefix, stream } });
      }
    });
    return Array.from(perUser.values())
      .sort((a, b) => a.joinedAt - b.joinedAt)
      .map(({ entry }) => entry);
  }

  /** Host-side removal (co-host left / was evicted) — mirrors the mesh API. */
  removeRemoteByUser(userId: string) {
    let changed = false;
    Array.from(this.remoteStreams.keys()).forEach((identity) => {
      if (identityPrefix(identity) === userId) {
        this.remoteStreams.delete(identity);
        changed = true;
      }
    });
    if (changed) this.notifyRemote();
  }

  // ── Controls (mirror browser-live.ts semantics) ──────────────────────────

  toggleMic() {
    // LiveKit mute()/unmute() also signals state to the SFU and subscribers,
    // so viewers genuinely see/hear the muted state rather than silent frames.
    if (this.localAudio) {
      if (this.micOn) void this.localAudio.mute().catch(() => {});
      else void this.localAudio.unmute().catch(() => {});
    }
    this.micOn = !this.micOn;
    this.notifyState();
  }

  toggleCamera() {
    if (this.localVideo) {
      if (this.camOn) void this.localVideo.mute().catch(() => {});
      else void this.localVideo.unmute().catch(() => {});
    }
    this.camOn = !this.camOn;
    this.notifyState();
  }

  switchCamera() {
    // Same approach as the mesh: a restart-free facingMode flip on the raw
    // track. LiveKit keeps publishing the same track; the SFU just forwards
    // the newly framed video to everyone.
    const track = this.localVideo?.mediaStreamTrack;
    if (!track) return;
    const current = track.getSettings().facingMode;
    void track
      .applyConstraints({ facingMode: current === "user" ? "environment" : "user" })
      .catch(() => {});
  }

  // ── Connection lifecycle ─────────────────────────────────────────────────

  /** Idempotent. The FIRST caller fixes the session's role (publish or not). */
  start(options: SessionStartOptions): Promise<void> {
    if (this.startPromise) return this.startPromise;
    this.wantPublish = options.publish;
    this.hostId = options.hostId ?? null;
    this.asStaff = options.asStaff ?? false;
    this.startPromise = this.run().catch((err) => {
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Could not start the live video connection.";
      this.fail(message);
    });
    return this.startPromise;
  }

  private fail(message: string) {
    if (this.tornDown) return;
    this.error = message;
    this.connected = false;
    this.stopLocalMedia();
    this.teardownConnection();
    this.notifyState();
  }

  private async run(): Promise<void> {
    // 1) Camera/mic first for publishers — mirrors the mesh flow: the local
    //    preview appears before any signaling and the permission prompt shows
    //    immediately. Same audio:false fallback as browser-live.ts.
    //    A1: constrained capture (720p30 ideal, 360p floor, 1080p desktop).
    if (this.wantPublish) {
      if (!navigator.mediaDevices?.getUserMedia) {
        this.fail("Camera access is unavailable. Open the site over HTTPS or localhost.");
        return;
      }
      let media: MediaStream;
      try {
        media = await navigator.mediaDevices.getUserMedia({
          video: liveCaptureConstraints(),
          audio: AUDIO_CONSTRAINTS,
        });
      } catch {
        media = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
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

    // 2) Mint a short-lived join token via the backend (retries absorb Render
    //    cold starts). The backend decides canPublish from host/co-host state
    //    and clamps the TTL to the stream's remaining 5h-cap time.
    const { url, token } = await fetchLiveKitToken(this.streamId, this.asStaff);
    if (this.tornDown) return;

    const wsUrl = url || import.meta.env["VITE_LIVEKIT_URL"] || "";
    if (!wsUrl) {
      this.fail("Live video service URL is missing.");
      return;
    }

    // 3) Connect straight to LiveKit Cloud — media never touches Render.
    //    autoSubscribe:false + refreshSubscriptions() below implement the
    //    role-based track policy instead of blanket subscription.
    await this.room.connect(wsUrl, token, { autoSubscribe: false });
    if (this.tornDown) return;
    this.myPrefix = identityPrefix(this.room.localParticipant.identity);

    // 4) Publishers push their existing tracks into the room; viewers pick
    //    the host's + co-hosts' tracks per the subscription policy.
    if (this.wantPublish) {
      const videoTrack = this.localMedia?.getVideoTracks()[0];
      const audioTrack = this.localMedia?.getAudioTracks()[0];
      if (videoTrack) {
        // A1 — publish with simulcast + explicit encoding. The defaults give
        // 180p/360p additional layers with our 720p primary; explicit
        // videoEncoding pins the top layer's bitrate. degradationPreference
        // "maintain-resolution" keeps a talking-head stream sharp (drop
        // frames) instead of blurry (drop resolution) under pressure.
        const publication = await this.room.localParticipant.publishTrack(videoTrack, {
          simulcast: true,
          videoEncoding: {
            maxBitrate: LIVE_VIDEO_QUALITY.maxBitrate,
            maxFramerate: 30,
          },
          videoCodec: LIVE_VIDEO_QUALITY.preferredCodecs[0],
          degradationPreference: "maintain-resolution",
          source: Track.Source.Camera,
        });
        this.localVideo = (publication.track as LocalVideoTrack | undefined) ?? null;
      }
      if (audioTrack) {
        const publication = await this.room.localParticipant.publishTrack(audioTrack, {
          audioPreset: AudioPresets.speech,
          source: Track.Source.Microphone,
        });
        this.localAudio = (publication.track as LocalAudioTrack | undefined) ?? null;
      }
      if (this.tornDown) return;
      this.notifyState();
    } else {
      this.refreshSubscriptions();
    }

    // A6 — poll sender/receiver stats so the classifier gets loss/rtt/bitrate.
    this.startStatsPolling();
  }

  /**
   * A2 subscription policy. Publishers subscribe to every other publisher
   * (all co-hosts). Viewers subscribe to the host AND every ACCEPTED
   * co-host (authorization list passed in via setViewerAuthorization);
   * multiple connections of the same user are de-duplicated deterministically
   * by the earliest-joined rule (listViewerStreams above).
   */
  private viewerAuthorized: Set<string> | null = null;

  setViewerAuthorization(userIds: string[] | null) {
    this.viewerAuthorized = userIds ? new Set(userIds) : null;
    if (!this.wantPublish) this.refreshSubscriptions();
  }

  private refreshSubscriptions() {
    const remotes = Array.from(this.room.remoteParticipants.values());
    if (this.wantPublish) {
      remotes.forEach((p) =>
        this.applySubscription(p, identityPrefix(p.identity) !== this.myPrefix),
      );
      return;
    }
    if (this.viewerAuthorized) {
      const authorized = this.viewerAuthorized;
      // A2: host + co-hosts (one connection per user, earliest joined wins).
      const perUser = new Map<string, { participant: RemoteParticipant; joinedAt: number }>();
      remotes.forEach((p) => {
        const prefix = identityPrefix(p.identity);
        if (prefix === this.myPrefix) return;
        if (!authorized.has(prefix)) return;
        const joinedAt = p.joinedAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
        const existing = perUser.get(prefix);
        if (!existing || joinedAt < existing.joinedAt)
          perUser.set(prefix, { participant: p, joinedAt });
      });
      // Unsubscribe everyone first, then subscribe the chosen set.
      remotes.forEach((p) => {
        const prefix = identityPrefix(p.identity);
        const chosen = perUser.get(prefix)?.participant;
        this.applySubscription(p, chosen === p);
      });
      return;
    }
    // Legacy fallback (no authorization list yet): host's earliest connection.
    const hostRemotes = this.hostId
      ? remotes.filter((p) => identityPrefix(p.identity) === this.hostId)
      : [];
    hostRemotes.sort((a, b) => (a.joinedAt?.getTime() ?? 0) - (b.joinedAt?.getTime() ?? 0));
    remotes.forEach((p) => {
      const isHostEarliest = hostRemotes[0] === p;
      this.applySubscription(p, Boolean(isHostEarliest));
    });
  }

  private applySubscription(participant: RemoteParticipant, want: boolean) {
    participant.trackPublications.forEach((publication) => {
      if (publication.isSubscribed !== want) {
        publication.setSubscribed(want);
      }
    });
  }

  /** Rebuild one participant's MediaStream from its subscribed tracks. */
  private rebuildRemote(identity: string) {
    const participant = this.room.remoteParticipants.get(identity);
    if (!participant) {
      this.remoteStreams.delete(identity);
      return;
    }
    const tracks: MediaStreamTrack[] = [];
    participant.trackPublications.forEach((publication) => {
      if (publication.isSubscribed && publication.track) {
        tracks.push(publication.track.mediaStreamTrack);
      }
    });
    if (tracks.length === 0) {
      this.remoteStreams.delete(identity);
      return;
    }
    // A fresh MediaStream keeps the exact same attach-identity flow the UI
    // already handles (memoized srcObject ref) — same as the old ontrack path.
    this.remoteStreams.set(identity, new MediaStream(tracks));
  }

  // ── A6: quality sampling ──────────────────────────────────────────────────

  private startStatsPolling() {
    if (this.statsTimer) return;
    this.statsTimer = setInterval(() => {
      void this.sampleStats();
    }, 2_000);
  }

  private async sampleStats() {
    if (this.tornDown) return;
    const at = Date.now();
    if (this.reconnecting) {
      this.emitQuality({ at, online: false });
      return;
    }

    if (this.wantPublish) {
      // Sender stats: real RTT + packet loss + bitrate for the uplink.
      try {
        const statsList = this.localVideo ? await this.localVideo.getSenderStats() : [];
        const s = statsList.find((x) => x.rid === "q") ?? statsList[0];
        if (s) {
          const packets = (s.packetsSent ?? 0) + (s.packetsLost ?? 0);
          const loss = packets > 0 ? (s.packetsLost ?? 0) / packets : 0;
          let bitrateKbps: number | undefined;
          if (typeof s.bytesSent === "number") {
            const prev = this.lastSenderBytes;
            if (prev && s.bytesSent >= prev.bytes) {
              const sec = (at - prev.at) / 1000;
              if (sec > 0) bitrateKbps = ((s.bytesSent - prev.bytes) * 8) / 1000 / sec;
            }
            this.lastSenderBytes = { bytes: s.bytesSent, at };
          }
          this.emitQuality({
            at,
            loss,
            ...(typeof s.roundTripTime === "number" ? { rttMs: s.roundTripTime * 1000 } : {}),
            ...(bitrateKbps !== undefined ? { bitrateKbps } : {}),
            online: true,
          });
          return;
        }
      } catch {
        /* fall through */
      }
      this.emitQuality({ at, online: true });
      return;
    }

    // Viewer: receiver stats from the first subscribed remote video track.
    try {
      let receiverStats: Awaited<ReturnType<RemoteVideoTrack["getReceiverStats"]>> | undefined;
      for (const participant of this.room.remoteParticipants.values()) {
        for (const publication of participant.trackPublications.values()) {
          if (
            publication.isSubscribed &&
            publication.kind === Track.Kind.Video &&
            publication.track
          ) {
            receiverStats = await (publication.track as RemoteVideoTrack).getReceiverStats();
            break;
          }
        }
        if (receiverStats) break;
      }
      if (receiverStats) {
        const packets = (receiverStats.packetsReceived ?? 0) + (receiverStats.packetsLost ?? 0);
        const loss = packets > 0 ? (receiverStats.packetsLost ?? 0) / packets : 0;
        let bitrateKbps: number | undefined;
        if (typeof receiverStats.bytesReceived === "number") {
          const prev = this.lastReceiverBytes;
          if (prev && receiverStats.bytesReceived >= prev.bytes) {
            const sec = (at - prev.at) / 1000;
            if (sec > 0)
              bitrateKbps = ((receiverStats.bytesReceived - prev.bytes) * 8) / 1000 / sec;
          }
          this.lastReceiverBytes = { bytes: receiverStats.bytesReceived, at };
        }
        this.emitQuality({
          at,
          loss,
          ...(bitrateKbps !== undefined ? { bitrateKbps } : {}),
          online: true,
        });
        return;
      }
    } catch {
      /* stats unavailable this tick — the next one will retry */
    }
    this.emitQuality({ at, online: true });
  }

  private lastSenderBytes: { bytes: number; at: number } | null = null;
  private lastReceiverBytes: { bytes: number; at: number } | null = null;

  private wireRoomEvents() {
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
      this.emitQuality({ at: Date.now(), online: false });
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
    // A6 — LiveKit's own connection-quality signal for the LOCAL participant:
    // "excellent"/"good" → fine, "poor"/"lost" → feed the classifier.
    this.room.on(RoomEvent.ConnectionQualityChanged, (quality: string, participant) => {
      if (this.tornDown) return;
      if (participant.isLocal) {
        const poor = quality === "poor" || quality === "lost";
        this.emitQuality({
          at: Date.now(),
          online: quality !== "lost",
          ...(poor ? { rttMs: QUALITY_THRESHOLDS.poorRttMs + 50 } : {}),
        });
      }
    });
    this.room.on(RoomEvent.ParticipantConnected, () => {
      if (this.tornDown) return;
      this.refreshSubscriptions();
    });
    this.room.on(
      RoomEvent.TrackPublished,
      (_publication: RemoteTrackPublication, _participant: RemoteParticipant) => {
        if (this.tornDown) return;
        this.refreshSubscriptions();
      },
    );
    this.room.on(
      RoomEvent.TrackSubscribed,
      (
        _track: RemoteTrack,
        _publication: RemoteTrackPublication,
        participant: RemoteParticipant,
      ) => {
        if (this.tornDown) return;
        this.rebuildRemote(participant.identity);
        this.notifyRemote();
      },
    );
    this.room.on(
      RoomEvent.TrackUnsubscribed,
      (
        _track: RemoteTrack,
        _publication: RemoteTrackPublication,
        participant: RemoteParticipant,
      ) => {
        if (this.tornDown) return;
        this.rebuildRemote(participant.identity);
        this.notifyRemote();
      },
    );
    this.room.on(
      RoomEvent.TrackUnpublished,
      (_publication: RemoteTrackPublication, participant: RemoteParticipant) => {
        if (this.tornDown) return;
        this.rebuildRemote(participant.identity);
      },
    );
    this.room.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
      if (this.tornDown) return;
      if (this.remoteStreams.delete(participant.identity)) this.notifyRemote();
      this.refreshSubscriptions();
    });
  }

  private stopLocalMedia() {
    this.localMedia?.getTracks().forEach((track) => track.stop());
    this.localMedia = null;
    this.localVideo = null;
    this.localAudio = null;
  }

  private teardownConnection() {
    if (this.statsTimer) {
      clearInterval(this.statsTimer);
      this.statsTimer = null;
    }
    try {
      void this.room.disconnect();
    } catch {
      // already gone — nothing to do
    }
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
}

// ── Session registry (refcounted, StrictMode/route-transition safe) ────────

const sessions = new Map<
  string,
  { session: LiveKitSession; refs: number; releaseTimer: ReturnType<typeof setTimeout> | null }
>();
const TEARDOWN_DELAY_MS = 750;

function sessionKey(streamId: string, wantPublish: boolean): string {
  // Separate connections per role: a viewer upgraded to co-host gets a FRESH
  // publisher session rather than re-using their subscriber connection
  // (LiveKit roles are fixed per connection). Hosts' room + mesh hooks share
  // the "pub" session.
  return `${streamId}::${wantPublish ? "pub" : "sub"}`;
}

function acquireSession(streamId: string, wantPublish: boolean): LiveKitSession {
  const key = sessionKey(streamId, wantPublish);
  let entry = sessions.get(key);
  if (!entry) {
    entry = { session: new LiveKitSession(streamId), refs: 0, releaseTimer: null };
    sessions.set(key, entry);
  }
  if (entry.releaseTimer) {
    clearTimeout(entry.releaseTimer);
    entry.releaseTimer = null;
  }
  entry.refs += 1;
  return entry.session;
}

function releaseSession(streamId: string, wantPublish: boolean) {
  const key = sessionKey(streamId, wantPublish);
  const entry = sessions.get(key);
  if (!entry) return;
  entry.refs -= 1;
  if (entry.refs > 0) return;
  // Short delay so React remounts (route transitions, dev double-effects)
  // reuse the same connection instead of churning it.
  entry.releaseTimer = setTimeout(() => {
    sessions.delete(key);
    entry.session.teardown();
  }, TEARDOWN_DELAY_MS);
}

// ── Hooks — exact return-shape mirrors of browser-live.ts ──────────────────

export interface LivekitLiveRoomOptions {
  streamId: string;
  publish: boolean;
  enabled: boolean;
  /** The host's userId — viewers subscribe only to the host's stream. */
  hostId?: string | undefined;
  /** Staff hosts go live with their staff session; the token endpoint accepts either. */
  asStaff?: boolean | undefined;
}

export function useLivekitLiveRoom({
  streamId,
  publish,
  enabled,
  hostId = "",
  asStaff = false,
}: LivekitLiveRoomOptions) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  // A6 — connection-quality samples (same return key as the mesh hook).
  const [qualitySamples, setQualitySamples] = useState<QualitySample[]>([]);
  const sessionRef = useRef<LiveKitSession | null>(null);

  useEffect(() => {
    if (!enabled || !streamId) return;
    const hasToken = asStaff ? Boolean(getStaffAccessToken()) : Boolean(getConsumerAccessToken());
    if (!hasToken) {
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
      // Plain viewers watch the host only — exactly one stream, same as the
      // old one-peer-per-viewer mesh. (The host's own remote co-host streams
      // are surfaced by useLivekitHostCoHostMesh instead.)
      if (publish) return;
      const found = hostId ? session.findRemoteByUser(hostId) : null;
      setRemoteStream(found ? new MediaStream(found.getTracks()) : null);
    });
    const offQuality = session.onQuality((sample) => {
      setQualitySamples((prev) => [...prev.slice(-31), sample]);
    });

    void session.start({ publish, hostId, asStaff });

    return () => {
      offState();
      offRemote();
      offQuality();
      sessionRef.current = null;
      releaseSession(streamId, publish);
    };
  }, [streamId, publish, enabled, hostId, asStaff]);

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
    switchCamera,
  };
}

export interface LivekitCoHostOptions {
  streamId: string;
  hostId: string;
  myUserId: string;
  enabled: boolean;
  asStaff?: string | boolean | undefined;
}

export function useLivekitCoHostRoom({
  streamId,
  hostId,
  myUserId,
  enabled,
  asStaff = false,
}: LivekitCoHostOptions) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [coHostStreams, setCoHostStreams] = useState<CoHostRemoteStream[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  // A6 — connection-quality samples (same return key as the mesh hook).
  const [qualitySamples, setQualitySamples] = useState<QualitySample[]>([]);
  const sessionRef = useRef<LiveKitSession | null>(null);

  useEffect(() => {
    if (!enabled || !streamId) return;
    const hasToken = asStaff ? Boolean(getStaffAccessToken()) : Boolean(getConsumerAccessToken());
    if (!hasToken) {
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
      // In a LiveKit room every participant simply publishes into the same
      // room — the host and the other co-hosts all show up as remote
      // publishers, which replaces the whole manual co-host mesh. Skip self.
      setCoHostStreams(session.listRemoteByUser(myUserId || null));
    });
    const offQuality = session.onQuality((sample) => {
      setQualitySamples((prev) => [...prev.slice(-31), sample]);
    });

    void session.start({ publish: true, hostId, asStaff: Boolean(asStaff) });

    return () => {
      offState();
      offRemote();
      offQuality();
      sessionRef.current = null;
      releaseSession(streamId, true);
    };
  }, [streamId, hostId, myUserId, enabled, asStaff]);

  function toggleMic() {
    sessionRef.current?.toggleMic();
  }
  function toggleCamera() {
    sessionRef.current?.toggleCamera();
  }
  function flipCamera() {
    sessionRef.current?.switchCamera();
  }
  function removeCoHostStream(participantId: string) {
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
    removeCoHostStream,
  };
}

export interface LivekitHostMeshOptions {
  streamId: string;
  // Kept for signature parity with useHostCoHostMesh in browser-live.ts —
  // the shared LiveKit session manages its own local media internally.
  hostLocalStream: MediaStream | null;
  enabled: boolean;
}

export function useLivekitHostCoHostMesh({ streamId, enabled }: LivekitHostMeshOptions) {
  const [coHostStreams, setCoHostStreams] = useState<CoHostRemoteStream[]>([]);
  const sessionRef = useRef<LiveKitSession | null>(null);

  useEffect(() => {
    if (!enabled || !streamId) return;
    // Shares the publisher session the host's useLivekitLiveRoom call created
    // (same stream ⇒ same LiveKit connection). Never starts one itself — the
    // room hook always runs first for a host and fixes the publish role.
    const session = acquireSession(streamId, true);
    sessionRef.current = session;
    const offRemote = session.onRemote(() => {
      // The host is the LOCAL participant here, so every remote stream in the
      // session belongs to a co-host — the split-screen grid's other tiles.
      setCoHostStreams(session.listRemoteByUser(null));
    });
    return () => {
      offRemote();
      sessionRef.current = null;
      releaseSession(streamId, true);
    };
  }, [streamId, enabled]);

  function removeCoHostStream(participantId: string) {
    sessionRef.current?.removeRemoteByUser(participantId);
  }

  return { coHostStreams, removeCoHostStream };
}

// ── A2: viewer-facing hooks ─────────────────────────────────────────────────

export interface LivekitViewerOptions {
  streamId: string;
  hostId: string;
  /** Host + accepted co-host user ids (from GET /live/:id + live:co-host events). */
  authorizedIds: string[];
  enabled: boolean;
  asStaff?: boolean | undefined;
}

/**
 * A2 — the plain viewer's split-screen source: the host AND every accepted
 * co-host, stable join order, one tile per user. The live page passes the
 * authorization list (host + coHostList ids) so the SFU subscription policy
 * and the UI can never disagree about who is on screen.
 */
export function useLivekitViewerStreams({
  streamId,
  hostId,
  authorizedIds,
  enabled,
  asStaff = false,
}: LivekitViewerOptions) {
  const [viewerStreams, setViewerStreams] = useState<CoHostRemoteStream[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qualitySamples, setQualitySamples] = useState<QualitySample[]>([]);
  const sessionRef = useRef<LiveKitSession | null>(null);
  const authorizedKey = authorizedIds.join(",");

  useEffect(() => {
    if (!enabled || !streamId) return;
    const hasToken = asStaff ? Boolean(getStaffAccessToken()) : Boolean(getConsumerAccessToken());
    if (!hasToken) {
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
      const allowed = new Set<string>([hostId, ...authorizedKey.split(",").filter(Boolean)]);
      setViewerStreams(session.listViewerStreams(allowed));
    });
    const offQuality = session.onQuality((sample) => {
      setQualitySamples((prev) => [...prev.slice(-31), sample]);
    });

    session.setViewerAuthorization([hostId, ...authorizedKey.split(",").filter(Boolean)]);
    void session.start({ publish: false, hostId, asStaff });

    return () => {
      offState();
      offRemote();
      offQuality();
      sessionRef.current = null;
      releaseSession(streamId, false);
    };
  }, [streamId, hostId, authorizedKey, enabled, asStaff]);

  return { viewerStreams, connected, error, qualitySamples };
}

/** A6 — quality samples for the publisher session (streamer-side banner). */
export function useLivekitPublisherQuality(streamId: string, enabled: boolean) {
  const [qualitySamples, setQualitySamples] = useState<QualitySample[]>([]);
  const sessionRef = useRef<LiveKitSession | null>(null);

  useEffect(() => {
    if (!enabled || !streamId) return;
    const session = acquireSession(streamId, true);
    sessionRef.current = session;
    const offQuality = session.onQuality((sample) => {
      setQualitySamples((prev) => [...prev.slice(-31), sample]);
    });
    return () => {
      offQuality();
      sessionRef.current = null;
      releaseSession(streamId, true);
    };
  }, [streamId, enabled]);

  return qualitySamples;
}
