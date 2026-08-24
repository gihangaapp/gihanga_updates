import { AccessToken } from "livekit-server-sdk";

const LIVEKIT_URL_ENV =
  process.env.LIVEKIT_URL === undefined ? "wss://gihanga-updates-v9t64obx.livekit.cloud" : process.env.LIVEKIT_URL.trim();
const LIVEKIT_API_KEY = (process.env.LIVEKIT_API_KEY || "").trim();
const LIVEKIT_API_SECRET = (process.env.LIVEKIT_API_SECRET || "").trim();

// In production, a LiveKit URL is required because the Render service is not
// itself a LiveKit media server. The project’s LiveKit Cloud endpoint is a safe
// non-secret fallback, while LIVEKIT_URL can override it for another project.
// Local development may still derive localhost or LAN URLs for a self-hosted
// LiveKit dev server when the fallback is explicitly cleared.

// The URL can be derived automatically per-request for local/self-hosted dev
// (see resolveLiveKitUrl below), so a phone on the same network reaches the
// right host without any manual .env editing every time the LAN IP changes.
export const isLiveKitConfigured = Boolean(
  LIVEKIT_API_KEY && LIVEKIT_API_SECRET && (LIVEKIT_URL_ENV || process.env.NODE_ENV !== "production"),
);

/**
 * Works out which LiveKit server URL to hand back to a client.
 *  - If LIVEKIT_URL is explicitly set (production / LiveKit Cloud), use it verbatim.
 *  - Otherwise, assume a self-hosted `livekit-server --dev` running alongside this
 *    backend on the same machine, and point at whatever host the browser used to
 *    reach US (localhost, a LAN IP, etc.) on LiveKit's default dev port 7880.
 *    This is what makes "open on my phone via the LAN IP" work with zero config.
 */
export function resolveLiveKitUrl(requestHostname: string, secure = false): string {
  if (LIVEKIT_URL_ENV) {
    const normalized = LIVEKIT_URL_ENV.replace(/\/+$/, "");
    if (/^https?:\/\//i.test(normalized)) {
      return normalized.replace(/^http:/i, "ws:").replace(/^https:/i, "wss:");
    }
    if (/^wss?:\/\//i.test(normalized)) return normalized;
    return `${secure ? "wss" : "ws"}://${normalized}`;
  }
  return `${secure ? "wss" : "ws"}://${requestHostname}:7880`;
}

/**
 * Mints a short-lived room token for one participant. Video/audio flows
 * directly between the browser and LiveKit's media server (SFU) — this
 * backend never sees or proxies a single media frame, only issues the token
 * that authorizes the connection, exactly as the architecture requires.
 *
 * canPublish: true for the host (camera/mic), false for viewers (subscribe-only).
 */
export async function mintLiveKitToken(roomName: string, identity: string, name: string, canPublish: boolean) {
  if (!isLiveKitConfigured) {
    throw new Error(
      "LiveKit is not configured on this server — set LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET (the local dev defaults of devkey/secret work with `livekit-server --dev`)",
    );
  }

  const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, { identity, name, ttl: "6h" });
  token.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish,
    canSubscribe: true,
    canPublishData: false,
  });
  return token.toJwt();
}
