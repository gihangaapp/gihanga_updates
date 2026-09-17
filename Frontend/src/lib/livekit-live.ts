import { useEffect, useRef, useState } from "react";
import {
  Room,
  RoomEvent,
  type LocalAudioTrack,
  type LocalVideoTrack,
  type RemoteParticipant,
  type RemoteTrack,
  type RemoteTrackPublication,
} from "livekit-client";
import { api, getConsumerAccessToken, getStaffAccessToken } from "./api-client";
import type { CoHostRemoteStream } from "./browser-live";

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
 * NOTE FOR THE PROJECT OWNER: LiveKit Cloud's free plan has a real monthly
 * usage quota (WebRTC participant-minutes, egress, concurrent connections —
 * verify current numbers at livekit.io/pricing). Exceeding that quota — not
 * licensing cost — is the actual ceiling on this "free" setup.
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
      if (/authentication|banned|ended|not found|not configured/i.test(message)) throw err;
      if (attempt < TOKEN_FETCH_ATTEMPTS) await delay(1500 * attempt);
    }
  }
  throw lastError;
}

type StateListener = () => void;
type RemoteListener = () => void;

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

  private localVideo: LocalVideoTrack | null = null;
  private localAudio: LocalAudioTrack | null = null;

  // identity -> MediaStream of currently subscribed remote tracks.
  private readonly remoteStreams = new Map<string, MediaStream>();
  private readonly stateListeners = new Set<StateListener>();
  private readonly remoteListeners = new Set<RemoteListener>();

  constructor(streamId: string) {
    this.streamId = streamId;
    // adaptiveStream right-sizes video to the attached element (cheap on
    // mobile data); autoSubscribe:false is passed at connect() time below —
    // roles pick tracks explicitly (viewers take only the host's stream;
    // publishers take every co-host).
    this.room = new Room({ adaptiveStream: true });
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

  private notifyState() {
    this.stateListeners.forEach((listener) => listener());
  }

  private notifyRemote() {
    this.remoteListeners.forEach((listener) => listener());
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
    if (this.wantPublish) {
      if (!navigator.mediaDevices?.getUserMedia) {
        this.fail("Camera access is unavailable. Open the site over HTTPS or localhost.");
        return;
      }
      let media: MediaStream;
      try {
        media = await navigator.mediaDevices.getUserMedia({
          video: true,
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
    //    cold starts). The backend decides canPublish from host/co-host state.
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
    //    the host's tracks per the subscription policy.
    if (this.wantPublish) {
      const videoTrack = this.localMedia?.getVideoTracks()[0];
      const audioTrack = this.localMedia?.getAudioTracks()[0];
      if (videoTrack) {
        // Publish the raw MediaStreamTrack (the SDK wraps it) and keep the
        // published LocalVideoTrack for mute/camera controls below.
        const publication = await this.room.localParticipant.publishTrack(videoTrack);
        this.localVideo = (publication.track as LocalVideoTrack | undefined) ?? null;
      }
      if (audioTrack) {
        const publication = await this.room.localParticipant.publishTrack(audioTrack);
        this.localAudio = (publication.track as LocalAudioTrack | undefined) ?? null;
      }
      if (this.tornDown) return;
      this.notifyState();
    } else {
      this.refreshSubscriptions();
    }
  }

  /**
   * Subscription policy. Publishers subscribe to every other publisher (all
   * co-hosts). Viewers subscribe ONLY to the host's earliest-joined
   * connection — deterministic if the host ever has a second simultaneous
   * connection (e.g. the discovery-page preview card), so viewers never get
   * duplicated streams or flicker between copies.
   */
  private refreshSubscriptions() {
    const remotes = Array.from(this.room.remoteParticipants.values());
    if (this.wantPublish) {
      remotes.forEach((p) =>
        this.applySubscription(p, identityPrefix(p.identity) !== this.myPrefix),
      );
      return;
    }
    const hostRemotes = this.hostId
      ? remotes.filter((p) => identityPrefix(p.identity) === this.hostId)
      : [];
    hostRemotes.sort((a, b) => (a.joinedAt?.getTime() ?? 0) - (b.joinedAt?.getTime() ?? 0));
    hostRemotes.forEach((p, index) => this.applySubscription(p, index === 0));
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
    this.room.on(RoomEvent.ParticipantConnected, () => {
      if (this.tornDown) return;
      this.refreshSubscriptions();
    });
    this.room.on(
      RoomEvent.TrackPublished,
      (_publication: RemoteTrackPublication, participant: RemoteParticipant) => {
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
        this.notifyRemote();
      },
    );
    this.room.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
      if (this.tornDown) return;
      if (this.remoteStreams.delete(participant.identity)) this.notifyRemote();
    });
  }

  private stopLocalMedia() {
    this.localMedia?.getTracks().forEach((track) => track.stop());
    this.localMedia = null;
    this.localVideo = null;
    this.localAudio = null;
  }

  private teardownConnection() {
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
    this.remoteStreams.clear();
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

    void session.start({ publish, hostId, asStaff });

    return () => {
      offState();
      offRemote();
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
  asStaff?: boolean | undefined;
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

    void session.start({ publish: true, hostId, asStaff });

    return () => {
      offState();
      offRemote();
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
