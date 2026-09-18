# How to verify — Gihanga Updates engineering pass

Everything below was executed in this workspace unless marked "needs a live
environment". Machine-verified results are summarised at the end.

---

## 0. Prerequisites

```bash
# backend
cd backend && npm install
cp .env.example .env      # fill MONGODB_URI (+ optionally LIVEKIT_*, REDIS_URL)

# frontend
cd frontend && npm install
cp .env.example .env      # VITE_API_URL (+ VITE_USE_LIVEKIT when going SFU)
```

## 1. Static verification (runs anywhere)

| Check | Command (from…) | Result here |
|---|---|---|
| Backend types | `cd backend && npx tsc --noEmit` | **0 errors** |
| Frontend types | `cd frontend && npx tsc --noEmit` | **0 errors** (was 115 pre-existing) |
| Backend lint | `cd backend && npm run lint` | **0 errors** (285 legacy warnings) |
| Frontend lint | `cd frontend && npm run lint` | **0 errors** (148 legacy warnings) |
| Payment regression | `cd backend && npm run test:payment` | **12/12 pass** |
| New backend tests | `cd backend && npm run test:live` | **32/32 pass** |
| All backend tests | `cd backend && npm run test` | **44/44 pass** |
| Frontend pure tests | `cd frontend && npm run test` | **23/23 pass** |
| Backend build | `cd backend && npm run build` | **dist/ produced** |
| Frontend build | `cd frontend && npm run build` | **.output/ produced** |

> Note: `npm run test:payment` previously FAILED on any case-sensitive
> filesystem (Linux/Render) because it read `../../Frontend/...`; fixed.

## 2. Backend behavioural tests (in the suites)

- **Sweeper decision table** (`test/live-regression.test.ts`): cap reached →
  ends with the 5-hour reason; stale heartbeat → "Host disconnected";
  already-ended → no-op; healthy stream → untouched; warnings fire exactly
  once per mark (30/5/1 min); cap takes precedence over staleness; missing
  heartbeat falls back to `startedAt`.
- **Token TTL**: clamps to remaining+60 s, 60 s floor, 6 h ceiling.
- **Paid-interaction access**: disabled → free; enabled → viewer pays the
  DB price; host/stream-mod/staff → free; muted/banned blocked **before**
  charge; ended → blocked; zero price → free.
- **Money safety**: gift route uses the atomic conditional debit (no
  check-then-debit); the debit refuses overdrafts and frozen wallets in one
  conditional update; failures after the debit write compensating refunds.
- **Idempotency/locks** (`test/idempotency.test.ts`): first claim wins,
  duplicates are no-ops, keys are scoped per stream+kind, sweeper lock allows
  exactly one concurrent claimant, rate limiter blocks beyond its limit,
  TTL expiry frees keys.
- **Wiring**: every end path funnels through `endStream()`; the sweeper is
  started by `server.ts`; `/live/start` persists `maxEndsAt`; paid socket
  events exist with free names preserved; earnings include the breakdown;
  late joiners get a co-host snapshot.

## 3. Live regression matrix (needs two browsers + MongoDB)

Run with the mesh first (no extra credentials), then repeat with LiveKit
(`VITE_USE_LIVEKIT=true` + `LIVEKIT_*` set) for the full A-series:

1. **Host start → viewer join** — host preview instant; viewer connects
   (A3 overlay shows "Connecting…" then video; never a silent black box).
2. **HD check** — host on a decent connection: viewer `getStats()` on the
   remote track shows the high simulcast layer; a still face is not pixelated.
3. **Co-host request/accept/leave** — host gets the request card; on accept
   ALL roles see the same 2-tile grid (50/50); leaving removes the tile
   everywhere (no stale black tile).
4. **3 people** — 1 top + 2 bottom on every screen; late-joining viewer
   still gets correct labels (snapshot + REST seeding).
5. **Paid interactions** — staff-hosted stream (moderator going live) has
   paid mode ON by default: heart shows the price, first like/comment opens
   the confirm dialog ("don't ask again"), balance updates, chat shows the
   message; a viewer with 0 points gets the insufficient state + `/wallet`
   link; a duplicate tap within the window charges once.
6. **Mute/ban/kick** — muted user's comment attempt is rejected with a toast
   and NO charge; banned user is kicked from the page.
7. **Host reload mid-stream** — rejoining resumes (heartbeat lease intact);
   the `heartbeatMutateRef` protection against accidental `live:end` is
   preserved (untouched in the rewrite).
8. **Viewer network drop/recover** — banner "Poor connection — try moving…"
   appears after ~6 s of bad stats and auto-dismisses ~8 s after recovery;
   a longer drop escalates to "Reconnecting…" then the retry overlay.
9. **Host crash (stale sweep)** — kill the host tab; within
   `LIVE_STALE_HEARTBEAT_SECONDS` (default 90 s) + sweep interval the stream
   ends with "Host disconnected" and viewers get `live:ended`.
10. **5 h cap in 2 minutes** — backend `.env`: `LIVE_MAX_HOURS=0.0333`,
    `LIVE_SWEEP_INTERVAL_SECONDS=5`; go live; ~30 s and ~5 s before the end
    you receive `live:time-warning`s (host badge turns red under 5 min);
    at the cap the stream ends with "Maximum duration (5 hours) reached",
    viewers see the 5-hour-limit message, the host gets "Start a new stream",
    and the LiveKit room is deleted. Reset the env afterwards.
11. **Force-end by staff** — system dashboard → Live → force-end; identical
    behaviour through the shared service (+ audit log entry).
12. **Two tabs, same account** — both viewers count; no identity fights on
    the LiveKit path (per-connection identity suffix preserved).
13. **Render cold-start** — the token fetch retries transient failures
    (unchanged); "not configured" now surfaces its message in the overlay.

Track-leak drill: end a stream and watch
`Object.keys(sessions)` in `livekit-live.ts` (or just reconnect twice) — the
refcounted registry tears the LiveKit room down 750 ms after the last
consumer unmounts; mesh peers close on unmount (unchanged).

## 4. Part B verification

- **B1**: upload a portrait photo → feed shows the full image (no crop) at
  its own ratio; DevTools Performance → no layout shift on image load
  (aspect-ratio reserved). Old posts: run
  `cd backend && npm run migrate:post-media`, then reload (unresolved ones
  self-heal on first load via the measured fallback).
- **B2**: scroll a feed containing videos → exactly one plays when ≥60 %
  visible; scrolling away pauses it; a broken URL shows the retry state,
  not a black box.
- **B3**: open Add Story → the shell is full-height instantly with the
  "Starting camera…" skeleton; toggle Photo↔Video (no black flash, no new
  permission prompt); deny camera → specific message + gallery still works.
  Open Create Post at 320×480 with the keyboard up → Publish stays visible.
- **B4**: pick ANY gradient preset (e.g. the blue one), add text, publish →
  the published story has THAT gradient (was always purple→red→orange).
- **B5**: /reels — wheel notch/trackpad swipe moves exactly one reel;
  ↑/↓/j/k/Space/m/l work; arrows visible on mobile; next page prefetches
  automatically; `/reels?reel=<id>` deep-links.
- **B6**: register flow at 320 px and 200 % zoom — no overflow or clipped
  labels; account-type cards stack below 420 px; Follow buttons collapse
  below 360 px.

## 5. Machine-verified results (this workspace)

- Backend: tsc **pass** · build **pass** · lint **0 errors** · tests **44/44**
- Frontend: tsc **0 errors** · lint **0 errors** · tests **23/23** · build **pass**
- The shipped ZIP could not build at all (empty `src/assets/`); three branded
  placeholder images now ship — replace them with real artwork any time.
- MongoDB/live-browser drills (§3) require a running environment; the
  decision logic behind each is covered by the pure-function test suites.
