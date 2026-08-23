# PHASE 4a (rebuilt) — Live Streaming: proper architecture + full feature set

The first pass used a raw browser-to-browser WebRTC mesh through Socket.IO.
That's fine for a demo but doesn't match what you asked for, so this replaces
it entirely with the real architecture and fills in every feature from your
checklist.

## Architecture change

- **Video/audio now goes through LiveKit** (a WebRTC SFU), not through
  Express/Socket.IO. The backend (`lib/livekit.ts`) only mints short-lived
  join tokens — `POST /live/start` mints the host's publish token,
  `POST /live/:id/token` mints a subscribe-only token for viewers (or a
  publish token if the host reconnects). The actual media stream flows
  directly between each browser and LiveKit's server.
- **Redis now backs viewer presence and reaction counts**
  (`lib/redis.ts`) — a Redis `SET` per stream holds connected viewer socket
  ids (`SADD`/`SREM`/`SCARD` for join/leave/count), and reactions increment a
  Redis counter rather than writing a database row per tap, exactly as
  "high-frequency real-time data" calls for. If `REDIS_URL` isn't set, an
  in-memory fallback keeps local dev working — clearly logged as such, and
  called out in `.env` as unsuitable for production/multi-instance.
- **Socket.IO is now used only for what it's meant for**: chat, likes/
  reactions, viewer presence, follow notifications, gifts, moderation events,
  live status. No SDP/ICE ever touches it anymore.
- Set `LIVEKIT_URL` / `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET` in `.env` — free
  credentials at https://cloud.livekit.io, or self-host. Without them, the app
  still runs (chat, gifts, moderation, everything else works), video just
  won't connect, with a clear message shown in the video area saying so.

## Full feature checklist against your list

**Creator — Start a Live**: title + description, camera/mic permission
request, a real camera **preview step before going live** (mute/unmute,
enable/disable camera, switch front/rear camera — all before broadcasting),
then "Start streaming" mints the room. ✅

**Creator — while live**: end live, real-time viewer count (Redis-backed),
reactions appear as floating hearts, comments arrive live, **pin/unpin a
comment**, **delete any comment**, **mute a viewer**, **ban a viewer**
(kicks them out immediately via a socket event), **add a moderator by
username** (moderators get the same pin/delete/mute/ban powers as the host),
share the live (native share sheet or copy link), receive gifts with a live
points counter, **see live earnings** (real gift totals, not a placeholder),
**manage live settings** while broadcasting (toggle gifts on/off mid-stream),
mic/camera/switch-camera controls visible throughout the broadcast (not just
the pre-flight preview). Stats (peak viewers, total gifts, end reason,
duration) are saved automatically — the `LiveStream` document simply persists
after `status` flips to `ended`, nothing extra to trigger. ✅

**Viewer**: discover active lives (real list, auto-refreshing), join and
watch (LiveKit — inherently low-latency, WebRTC-based), send comments live,
send reactions (❤️ button, bursts as floating hearts for everyone in the
room), follow the creator without leaving the room, share the live, send one
of 4 point-based gifts (10/50/200/500 pts, spent from real Kingdom Points
balance), see the live viewer count, **report a live** (reason picker →
creates a real `Report` row for moderators), **block a user** (from a chat
message's context menu — hides their messages for you across the whole app,
not just this stream, and unwinds any follow relationship), get a real
notification when a followed creator goes live, leave cleanly (both the
LiveKit connection and the Socket.IO room are torn down on unmount/back
navigation). ✅

**Moderator dashboard** (`/system/dashboard/live`): live-updating list of
every active stream (real-time via a staff-authenticated socket joining
`staff:moderators` — the "not pushed live yet" gap from the first pass is
now closed), force-end with a required reason (audit-logged, notifies the
host), a flagged-message review panel that now updates instantly instead of
only on page load, and the keyword-list editor. ✅

## What's honestly not done / can't be verified here
- **No live test.** Still no camera, microphone, or second browser in this
  sandbox — verified by type-checking and careful review of the LiveKit SDK
  usage, not an actual call. This is the single most important thing to test
  locally before trusting it: two accounts, two browser windows, confirm
  video, chat, reactions, gifts, pin/delete, mute/ban, and force-end all
  actually work end to end.
- **LiveKit/Redis need real credentials to do anything beyond chat/mod
  tooling.** Without `LIVEKIT_URL`/keys set, video won't connect (clearly
  messaged in the UI). Without `REDIS_URL`, presence/reactions still work via
  the in-memory fallback, just not across multiple server instances.
- Viewer-count truth now lives in Redis, decoupled from the old
  request-response viewer list — a stream's `viewerCount` field on the
  `LiveStream` document is kept in sync as people join/leave but is a
  snapshot, not the live source of truth (the socket event is).

## Verified
`tsc --noEmit` clean on both backend and frontend.

## Next
Wallet + MTN MoMo, the reward-point engine, and Ads.
