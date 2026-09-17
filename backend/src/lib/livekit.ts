import crypto from "crypto";
import { AccessToken } from "livekit-server-sdk";

/**
 * LiveKit Cloud join-token minting for live streaming.
 *
 * The SFU itself is LiveKit Cloud's managed service (free "Build" plan) —
 * the Render free tier cannot host a media server because it exposes no
 * inbound UDP. This module is the backend's ONLY involvement in the video
 * path: like the existing MongoDB Atlas / Cloudinary integrations, it makes
 * a normal outbound call (here: local token signing, zero network I/O) and
 * hands the browser a short-lived join token. Media never touches Render.
 *
 * NOTE FOR THE PROJECT OWNER: LiveKit Cloud's free plan has a real monthly
 * usage quota (WebRTC participant-minutes, egress, concurrent connections —
 * verify current numbers at livekit.io/pricing). Exceeding that quota — not
 * licensing cost — is the actual ceiling on this "free" setup. Monitor usage
 * in the LiveKit Cloud dashboard as the platform grows.
 */

const LIVEKIT_URL = process.env.LIVEKIT_URL || "";
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || "";
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || "";

/** True when all three LIVEKIT_* env vars are present (local or Render). */
export function isLiveKitConfigured(): boolean {
  return Boolean(LIVEKIT_URL && LIVEKIT_API_KEY && LIVEKIT_API_SECRET);
}

/** The LiveKit Cloud project URL (wss://<project>.livekit.cloud). */
export function getLiveKitUrl(): string {
  return LIVEKIT_URL;
}

export interface LiveKitTokenInput {
  /** Room name — the live stream's _id. One room per live stream. */
  room: string;
  /** The user's _id. Becomes the identity PREFIX (see below). */
  identity: string;
  /** Host/co-hosts may publish; plain viewers may only subscribe. */
  canPublish: boolean;
}

/**
 * Mints a short-lived LiveKit join token (JWT).
 *
 * Identity gets a per-connection random suffix: LiveKit disconnects an
 * existing participant when a new connection joins with the SAME identity,
 * so two browser tabs, the discovery-page preview card, or a viewer being
 * upgraded to co-host from the same account would otherwise fight over one
 * identity and kick each other off. The userId stays the prefix (before the
 * ":"), so the frontend can still map any remote participant back to a real
 * user for the co-host grid labels.
 *
 * The TTL covers joining only — an established session keeps working after
 * the token expires; 6h comfortably covers even very long streams.
 */
export async function createLiveKitToken({ room, identity, canPublish }: LiveKitTokenInput): Promise<string> {
  const connectionId = crypto.randomBytes(4).toString("hex");
  const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: `${identity}:${connectionId}`,
    // Human-friendly fallback name; the app maps participants via identity,
    // so this is only what shows in the LiveKit dashboard/inspector.
    name: identity,
    ttl: 6 * 60 * 60,
    metadata: JSON.stringify({ userId: identity }),
  });
  token.addGrant({
    room,
    roomJoin: true,
    canPublish,
    canSubscribe: true,
    // Chat/reactions/gifts ride the existing Socket.IO, not LiveKit data
    // channels — but leaving data publish on costs nothing and keeps the
    // door open for future in-room features without a token re-mint.
    canPublishData: true,
  });
  return token.toJwt();
}
