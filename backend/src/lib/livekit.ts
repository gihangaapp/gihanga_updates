import crypto from "crypto";
import { AccessToken, RoomServiceClient } from "livekit-server-sdk";
import { LIVEKIT_TOKEN_TTL_CEILING_S } from "./liveConfig";

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
  /**
   * Explicit token lifetime in seconds. When omitted the caller should use
   * computeLiveKitTokenTtlSeconds() so the TTL can never outlive the
   * stream's remaining time under the 5 h server-enforced cap.
   */
  ttlSeconds?: number;
}

/**
 * TTL for a join token, clamped to the stream's remaining time (+ a small
 * join grace) and the ceiling. Returns at least 60 s so a host opening the
 * page right at the cap boundary can still authenticate long enough to
 * receive the "stream reached the 5-hour limit" flow.
 */
export function computeLiveKitTokenTtlSeconds(remainingMs: number): number {
  const remainingS = Math.ceil((remainingMs + 60_000) / 1000);
  return Math.max(60, Math.min(remainingS, LIVEKIT_TOKEN_TTL_CEILING_S));
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
 * The TTL covers JOINING only — an established session keeps working after
 * the token expires — and is clamped to the stream's remaining time so it
 * can never outlive the 5 h cap (see computeLiveKitTokenTtlSeconds).
 */
export async function createLiveKitToken({
  room,
  identity,
  canPublish,
  ttlSeconds,
}: LiveKitTokenInput): Promise<string> {
  const connectionId = crypto.randomBytes(4).toString("hex");
  const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: `${identity}:${connectionId}`,
    // Human-friendly fallback name; the app maps participants via identity,
    // so this is only what shows in the LiveKit dashboard/inspector.
    name: identity,
    ttl: ttlSeconds ?? LIVEKIT_TOKEN_TTL_CEILING_S,
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

/**
 * Server-side room teardown, used by the shared endStream() service so the
 * sweeper / REST end / socket end / staff force-end all drop every publisher
 * and subscriber still connected to the SFU. No-op when LiveKit isn't
 * configured (the mesh path has no rooms).
 */
export async function deleteLiveKitRoom(roomName: string): Promise<void> {
  if (!isLiveKitConfigured()) return;
  try {
    const client = new RoomServiceClient(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
    await client.deleteRoom(roomName);
  } catch (err) {
    // A missing room (already deleted, or the stream never used LiveKit)
    // is not an error worth failing the end-of-stream flow for.
    console.warn(`[LiveKit] deleteRoom(${roomName}) failed (continuing):`, err);
  }
}
