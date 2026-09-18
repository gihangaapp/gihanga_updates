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
import {
  useBrowserLiveRoom as useMeshLiveRoom,
  useCoHostLiveRoom as useMeshCoHostRoom,
  useHostCoHostMesh as useMeshHostMesh,
  useCameraPreview,
  type CoHostRemoteStream,
} from "./browser-live";
import {
  useLivekitLiveRoom,
  useLivekitCoHostRoom,
  useLivekitHostCoHostMesh,
  useLivekitViewerStreams,
} from "./livekit-live";

export type { CoHostRemoteStream } from "./browser-live";
export { useCameraPreview };

export interface LiveRoomOptions {
  streamId: string;
  publish: boolean;
  enabled: boolean;
  /** The host's userId (LiveKit path) — viewers subscribe only to the host's stream. */
  hostId?: string | undefined;
  /** Staff hosts authenticate the token request with their staff session. */
  asStaff?: string | boolean | undefined;
}

const USE_LIVEKIT = import.meta.env["VITE_USE_LIVEKIT"] === "true";

/** True when the viewer split-screen grid is available (SFU only). */
export const VIEWER_GRID_AVAILABLE = USE_LIVEKIT;

export function useBrowserLiveRoom(options: LiveRoomOptions) {
  const mesh = useMeshLiveRoom({
    streamId: options.streamId,
    publish: options.publish,
    enabled: USE_LIVEKIT ? false : options.enabled,
  });
  const livekit = useLivekitLiveRoom({
    streamId: options.streamId,
    publish: options.publish,
    enabled: USE_LIVEKIT ? options.enabled : false,
    hostId: options.hostId,
    asStaff: Boolean(options.asStaff),
  });
  return USE_LIVEKIT ? livekit : mesh;
}

export function useCoHostLiveRoom(options: {
  streamId: string;
  hostId: string;
  myUserId: string;
  enabled: boolean;
  asStaff?: string | boolean | undefined;
}) {
  const mesh = useMeshCoHostRoom({
    streamId: options.streamId,
    hostId: options.hostId,
    myUserId: options.myUserId,
    enabled: USE_LIVEKIT ? false : options.enabled,
  });
  const livekit = useLivekitCoHostRoom({
    streamId: options.streamId,
    hostId: options.hostId,
    myUserId: options.myUserId,
    enabled: USE_LIVEKIT ? options.enabled : false,
    asStaff: options.asStaff,
  });
  return USE_LIVEKIT ? livekit : mesh;
}

export function useHostCoHostMesh(options: {
  streamId: string;
  hostLocalStream: MediaStream | null;
  enabled: boolean;
}) {
  const mesh = useMeshHostMesh({
    streamId: options.streamId,
    hostLocalStream: options.hostLocalStream,
    enabled: USE_LIVEKIT ? false : options.enabled,
  });
  const livekit = useLivekitHostCoHostMesh({
    streamId: options.streamId,
    hostLocalStream: options.hostLocalStream,
    enabled: USE_LIVEKIT ? options.enabled : false,
  });
  return USE_LIVEKIT ? livekit : mesh;
}

export interface ViewerStreamsOptions {
  streamId: string;
  hostId: string;
  /** Host + accepted co-host user ids — the grid's authorization list. */
  authorizedIds: string[];
  enabled: boolean;
  asStaff?: string | boolean | undefined;
}

/**
 * A2 — plain viewers' split-screen source (host + every accepted co-host).
 * LiveKit: real tiles in stable join order. Mesh: guarded — returns an empty
 * list and the live page falls back to the classic host-only view.
 */
export function useViewerStreams(options: ViewerStreamsOptions) {
  const livekit = useLivekitViewerStreams({
    streamId: options.streamId,
    hostId: options.hostId,
    authorizedIds: options.authorizedIds,
    enabled: USE_LIVEKIT ? options.enabled : false,
    asStaff: Boolean(options.asStaff),
  });
  // Mesh: viewers keep the host-only view (explicit guard, see header).
  return USE_LIVEKIT
    ? livekit
    : { viewerStreams: [], connected: false, error: null, qualitySamples: [] };
}
