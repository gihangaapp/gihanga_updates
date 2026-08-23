# FIX ROUND — Follow button, and Live Streaming for local/LAN testing

## Follow button — root cause found and fixed
`useFollowingSet()` and `useBlockedSet()` use react-query's `select` option to
turn the API's raw `{ usernames: [...] }` response into a `Set` — but `select`
only transforms data at *read* time. The underlying cache still stores the raw
object. Both `useFollowUser` and `useToggleBlock`'s optimistic updates were
calling `new Set(rawCachedObject)` — since a plain object isn't iterable, this
throws immediately inside `onMutate`, which kills the entire mutation before
the real POST/DELETE request ever fires. Same failure class as the bookmark
bug from Phase 3. Fixed all three spots (including a matching bug in the
post-cache patch inside `useFollowUser`), and added visible error toasts to
every Follow button in the app so a real failure is never silent again.

## Live streaming — made it actually work for local + phone testing

The most likely reason video wasn't connecting: LiveKit needs a running media
server and credentials, and there was no easy way to get either without
signing up for LiveKit Cloud. Fixed properly rather than papered over:

- **`livekit-server --dev` now works out of the box.** LiveKit's local dev
  server ships with fixed `devkey`/`secret` credentials — no signup. Added
  `docker-compose.yml` at the project root: `docker compose up -d` gets you
  that server (and Redis) running in one command.
- **The server URL is now resolved per-request**, not hardcoded. If you set
  `LIVEKIT_URL` explicitly (for LiveKit Cloud/production), that's used as-is.
  Otherwise the backend points the client at
  `ws://<whatever-host-the-browser-used-to-reach-us>:7880` — so opening the
  app at `http://localhost:8080` gets `ws://localhost:7880`, and opening the
  *same* app from your phone at `http://192.168.1.23:8080` automatically gets
  `ws://192.168.1.23:7880`. No per-device `.env` editing when your LAN IP
  changes.
- **The frontend no longer hardcodes `localhost` for the API/socket either** —
  `api-client.ts` now derives the backend URL from `window.location.hostname`
  unless `VITE_API_URL` is explicitly set. This is the other half of "works
  on my phone" — previously the phone's browser would have tried to reach
  its own `localhost:4000`, which doesn't exist.
- Confirmed (not assumed) that CORS was already permissive and that both Vite
  and Express already bind to all network interfaces by default — those
  weren't blockers, so no changes were needed there.
- **Replaced silent failure with real error states.** Before, if the LiveKit
  token request failed for any reason, the video area just stayed black with
  zero explanation — which is exactly what "black screen" describes. Now
  there are distinct, visible states: not configured, token error (with the
  actual error message), connecting, and — for viewers — "waiting for the
  host's video" if connected but no track has arrived yet.
- **Added "Invite followers"** — a host can re-ping their followers about an
  already-live stream (on top of the automatic notification everyone already
  gets the moment you go live).

## How to actually get video working locally
1. `docker compose up -d` from the project root (starts LiveKit's dev server
   + Redis).
2. Start the backend and frontend as normal.
3. Open the app — on the same computer, `http://localhost:8080` works as
   before. From your phone, find this computer's LAN IP (e.g. `192.168.1.23`,
   `ipconfig`/`ifconfig` will show it) and open
   `http://<that-IP>:8080` in the phone's browser instead of `localhost`.

## Still true, worth repeating
I have no camera, microphone, or second browser in this sandbox — everything
above is fixed via code and configuration review, not a live test. This is
the single most important thing to verify yourself before trusting it: start
a stream, join as a second account, confirm video, chat, reactions, gifts,
pin/delete, mute/ban, and end-live all work end to end.

## Verified
`tsc --noEmit` clean on both backend and frontend, as the last step before
this delivery.
