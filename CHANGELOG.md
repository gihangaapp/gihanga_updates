# Changelog — Gihanga Updates engineering pass

All work below follows the master engineering brief (Parts A & B + §8 defects).
Verification commands and results are in `VERIFYING.md`.

---

## v2 — Paid interactions are now a moderator-stream exclusive (owner instruction)

**Policy change**: paid like/comment/reaction interactions exist **only on streams hosted by moderator / admin / superadmin accounts**. Streams hosted by normal creators are **always free** — viewers like, comment and react exactly as before the feature existed. Four enforcement layers make it impossible to bypass:

1. **`POST /live/start`** — `paidInteractions.enabled` is forced to `false` for non-staff hosts, no matter what the client sends (staff hosts keep the default-ON + toggle behaviour).
2. **`PATCH /live/:id/settings`** — a non-staff host attempting `enabled: true` gets a `403` ("Paid interactions are only available on moderator-hosted streams"); any legacy enabled flag on their stream is forced back off (self-healing old data).
3. **`chargePaidInteraction()`** (the money-moving layer) — re-checks the host role *before any money moves*, so even legacy or hand-edited non-staff streams resolve to **free**. New `isStaffRole()` helper; `resolveInteractionAccess()` takes `hostIsStaff` and treats non-staff streams as free.
4. **Frontend** — stream payloads now expose `host.role` (`HOST_FIELDS`), and the "Enable paid interactions" host-menu item only renders for staff hosts. Normal creators never see the toggle; their viewers see the plain free chat/like UI.

Tests: 5 new regression tests (49 total backend) pin the policy — non-staff streams resolve free for all interaction kinds, the charge path consults the host role, `/start` forces the flag off, `PATCH /settings` rejects enabling, and payloads expose the role.

**Env note**: no env vars are needed for paid interactions (prices live in the DB / staff Settings). The new-this-version env vars (live hygiene + LiveKit + transport switch) are documented in `backend/.env.example`, `frontend/.env.example`, and pre-filled (append-only) in both `.env` files; standalone copies ship as `backend-new-vars.env` / `frontend-new-vars.env` next to the ZIP.

---

## Part A — Live streaming

### A1 — Viewers receive HD video (was ~640×480)
- **Root causes confirmed** (as diagnosed): unconstrained `getUserMedia({video:true})`, `publishTrack()` with no options, no dynacast, same on the mesh path and `useCameraPreview`.
- `frontend/src/lib/live-video-config.ts` (new): every tunable in one env-overridable object (`VITE_LIVE_FPS`, `VITE_LIVE_MAX_BITRATE_KBPS`).
- **LiveKit path** (`livekit-live.ts`): capture 720p30 ideal / 360p floor (1080p desktop); publish with `simulcast: true`, `videoEncoding {maxBitrate: 1.8 Mbps, maxFramerate: 30}`, VP8 (H264 fallback), `degradationPreference: "maintain-resolution"`; `Room({adaptiveStream: true, dynacast: true})`.
- **Mesh path** (`browser-live.ts`): same capture constraints + `RTCRtpSender.setParameters` (`maxBitrate`, `scaleResolutionDownBy`) on every host/co-host video sender; **TURN support** via `VITE_TURN_URL/USERNAME/CREDENTIAL` (STUN-only fails on strict NATs — §8.7 related).
- `useCameraPreview` uses the same constraints → preview == broadcast.

### A2 — Split screen visible to ALL roles (was host-only)
- **Root causes confirmed**: `allCoHostStreams` hard-coded `[]` for viewers; `refreshSubscriptions()` only subscribed viewers to the host's earliest connection.
- Viewer subscription policy now: host **and every accepted co-host**, one connection per user (deterministic earliest-joined rule), stable join order (`useLivekitViewerStreams` → `listViewerStreams`).
- The grid layout is identical for host / co-host / viewer (2→50/50, 3→1 top + 2 bottom, 4+→auto-fit; self tile last for publishers; no "You" tile for viewers).
- **Late joiners**: co-host list seeded from `GET /live/:id` (`coHosts`) **and** a `live:co-host:snapshot` event emitted to the joining socket (backend).
- Co-host removal disappears on all roles (the shared `endStream()` also broadcasts `live:co-host:left` per co-host).
- Viewer audio: one sound toggle unmutes every tile (autoplay-policy safe).
- Chat auto-collapse when the grid appears now applies to viewers too.
- **Mesh guard (documented)**: viewer co-host tiles require the SFU (an SFU can fan every publisher to every subscriber; the mesh cannot without re-architecting signaling). On the mesh, viewers keep the classic host-only view. Enable `VITE_USE_LIVEKIT=true` + `LIVEKIT_*` for full grids.

### A3 — Black-screen messages (was: two generic overlays)
- `frontend/src/hooks/use-live-video-health.ts` (new): one state machine — `connecting / waiting-host / host-camera-off / no-frames (auto-retry w/ backoff) / autoplay-blocked ("Tap to play") / reconnecting / disconnected (Retry) / host-left / ok`.
- `frontend/src/components/live/LiveOverlays.tsx` (new): `<VideoStatusOverlay role="status" aria-live>` — never over healthy video, debounced 400 ms, role-appropriate wording for host / co-host / viewer.

### A4 — Hard 5-hour cap, server-enforced
- **Root cause confirmed**: no duration cap anywhere; `lastHeartbeatAt` written but never read.
- `backend/src/lib/liveConfig.ts` (new): `LIVE_MAX_HOURS` (default 5), `LIVE_STALE_HEARTBEAT_SECONDS` (90), `LIVE_SWEEP_INTERVAL_SECONDS` (30) — all env-overridable (A7 testing used minutes-scale overrides).
- `LiveStream` model: `maxEndsAt` (indexed) + `timeWarningsSent`; `POST /live/start` sets it.
- `backend/src/lib/liveSweeper.ts` (new): **pure `planSweep()`** (unit-tested) + Redis-SETNX-locked runner; ends capped streams ("Maximum duration (5 hours) reached") and stale hosts ("Host disconnected"), emits 30/5/1-min `live:time-warning`s, writes audit logs, deletes the LiveKit room.
- `backend/src/services/liveStreamService.ts` (new): the ONE `endStream()` used by REST `/end`, socket `live:end`, staff force-end **and** the sweeper — atomic conditional flip (`status:"live"` guard) = idempotent, no double side-effects.
- LiveKit token TTL clamped to `min(remaining + 60s, 6h)` (`computeLiveKitTokenTtlSeconds`, tested); past-deadline token requests end the stream and 409.
- Host UI: live countdown badge (red under 5 min); viewers get a subtle "N min left" chip; cap-ended streams show "This stream reached the 5-hour limit" + "Start a new stream" (host).

### A5 — Paid like / comment / react
- Policy (updated in v2 — see the top of this file): **moderator-stream exclusive**. Staff-hosted streams (moderator/admin/superadmin hosts) default **ON** and are host-toggleable per stream (`PATCH /live/:id/settings`, bounds-validated); normal creators' streams are **always free** and cannot enable the feature; staff-settable global price defaults via the `Setting` model (`live_paid_interactions_defaults`, category `features`).
- **Server-authoritative** (`backend/src/lib/paidInteractions.ts`): price always from the DB; **atomic debit** `findOneAndUpdate({kingdomPoints: {$gte: price}, frozen: {$ne: true}}, {$inc: …})` — no overdraft, no double-spend; host credit minus optional platform fee (`live_paid_interactions_fee_bps` Setting); **compensating refund** on any post-debit failure; `Transaction` rows with new kinds `live_like / live_comment / live_reaction` (wallet history + payments dashboard updated via the shared Transaction model).
- **Idempotency**: client-sent `idempotencyKey` + Redis `SETNX` window (5 min) — duplicates charge exactly once; per-user/stream rate limit (40/min).
- Socket flow: free event names preserved; `live:paid-chat` / `live:paid-react` carry the idempotency key; failures emit `live:payment-failed` with precise reasons (`insufficient / frozen / muted / banned / rate-limited / ended / disabled`). Muted/banned users are rejected **before** any charge; host/mods/staff interact free.
- UI: price on the heart button ("❤ 1") and input ("Comment · 5 pts"), confirm-once dialog with "don't ask again this stream" (sessionStorage), live wallet balance in the input row, insufficient-points state with a `/wallet` top-up link, **optimistic UI rolls back** on `live:payment-failed`. Host earnings panel shows the paid like/comment/reaction breakdown (`GET /live/:id/earnings` extended).
- The **gift route's check-then-debit race** (§8.1) is fixed with the same atomic debit.

### A6 — "Poor connection" banner
- `frontend/src/lib/live-quality.ts` (new): **pure classifier with hysteresis** (poor after ≥6 s of loss>8% / RTT>600 ms / <150 kbps; recovers after ≥8 s good) — 10 unit tests.
- LiveKit: `ConnectionQualityChanged`, `Reconnecting/Reconnected/SignalReconnecting`, `Disconnected` + real sender/receiver stats (`getSenderStats`/`getReceiverStats`, 2 s polling). Mesh: `RTCPeerConnection.getStats()` every 2 s.
- `navigator.connection` hints (`effectiveType`, `saveData`, `downlink`) + `online/offline` events; **Data saver toggle** pins a lower simulcast layer by shrinking the rendered element (adaptiveStream keys off element size).
- Non-blocking banner, auto-dismiss on recovery, escalation to the A3 overlay when reconnecting >10 s. Streamer wording: "Your connection is weak — viewers may see lag."

### A7 — Regression pass
See `VERIFYING.md` for the full matrix and how to run it (including the 2-minute cap drill via `LIVE_MAX_HOURS`).

---

## Part B — Feed / stories / reels / sign-up

### B1 — Feed images: best-fit height, no crop
- **Root causes confirmed**: hard-coded `aspect-[4/3] max-h-[440px]` + `object-cover`; metadata returned by uploads but never persisted.
- Backend: `Post` model gains `mediaWidth/mediaHeight/aspectRatio/blurDataUrl/media[]`; `POST /posts` validates + persists them (sanitised, URL-whitelisted). Migration script: `npm run migrate:post-media` (from `backend/`) — fills geometry from the `Media` collection or Cloudinary URLs; anything unresolved falls back to the frontend's lazy on-load measurement.
- Frontend: `PostMediaCarousel` reserves the **image's own ratio clamped to [4:5 … 1.91:1]**, `max-height: min(80dvh, 720px)`, `object-contain` on a blurred self-backdrop when clamping applies → **nothing important is cropped, CLS ≈ 0**. Multi-image carousels use the first item's ratio (no layout jump on swipe). `ResponsiveImage` gets real Cloudinary `srcset`/`sizes` (`f_auto,q_auto,c_limit,w_…` via `lib/cdn.ts`), `fetchpriority="high"` for the first two feed items, a neutral placeholder on broken URLs, and the lazy natural-size fallback.
- `uploadFile()` return type, `useCreatePost`, `FeedPost`, `PostCard`, and `PostCreator` all carry the metadata end-to-end.

### B2 — Feed videos actually play
- **Root causes confirmed**: 0.5-threshold observer inside `AnimatePresence` remounts could leave `inViewport` false forever (black box, no error).
- `ResponsiveVideo` rewritten: attach `src` within a generous `rootMargin: 200%` **play only at ≥60 % visible**; module-level **single-play registry** (exactly one feed video plays at a time, app-wide); `muted playsInline preload="metadata"→"auto"`; poster; visible Play affordance when paused/autoplay-blocked; mute toggle; error state with retry; `prefers-reduced-motion` and `saveData` disable autoplay; Cloudinary video URLs get `f_auto,q_auto,vc_auto`.
- Same best-fit sizing rules as B1 (real aspect ratio, portrait clamp, contain + blurred backdrop). Renders correctly for every feed source (the component is shared).

### B3 — Add Story modal: instant fixed-height shell
- **Root causes confirmed**: `max-h-[92vh] overflow-hidden` grid = no definite height; `h-[100vh]` mobile drawer (not `dvh`); `StoryCamera` re-requested the camera on Photo↔Video; no permission-pending placeholder; PostCreator's footer could be clipped.
- Desktop dialog: `h-[min(92dvh,900px)]` — definite height at first paint; mobile drawer: `100dvh` + safe-area padding; story body is full-bleed (`min-h-0`, no scroll).
- `StoryCamera`: black **skeleton with "Starting camera…" at first paint**, video fades in on metadata; stream acquired **once** (only `facingMode` changes re-acquire); **audio track attached lazily** via `addTrack` when Video mode is first used (with a mic on/off badge); specific messages for `NotAllowedError / NotFoundError / NotReadableError / OverconstrainedError`; Gallery/Text actions never blocked on camera readiness; tracks always released on unmount.
- `PostCreator` restructured into header (fixed) / body (`flex-1 min-h-0 overflow-y-auto overscroll-contain`) / **sticky safe-area footer** — Publish always reachable on 320×480.

### B4 — Story text-tab posts the REAL selected background
- **Root cause confirmed**: every gradient preset was replaced by the same hard-coded purple→red→orange.
- `frontend/src/lib/gradient.ts` (new): real `linear-gradient()` parser — angle (deg + side-or-corner), **all** stops with positions, rgba/hsl/named/3-digit-hex colours; corner-fitted canvas endpoint math identical to CSS. 13 unit tests cover **every preset**.
- `compositeStoryToBlob` rewritten: parsed background (photo → object-cover; gradient/solid → `paintBackground`), text with the **same font family/weight/size scaling** (preview-measured scale factor), wrapping, alignment, pill background, rotation, drop shadows; stickers keep per-type sizes/colours; `document.fonts.ready` before drawing; export **1080×1920 JPEG q≈0.92** (PNG only when transparency is needed — it never is here).
- §8.6 fixed: no `crossOrigin` on `blob:`/`data:` URLs; failed layers now **reject with a message** instead of silently skipping.
- Multi-slide: only the current slide is published (API contract is one story per post) — now **explicitly visible** via a "Sharing slide X of Y" chip rather than silent.

### B5 — Reels: TikTok-grade navigation
- **Root causes confirmed**: no keydown handler; arrows `hidden lg:flex` in a page-scrolling parent; snap on the wrong element + `gap-4` misalignment; `100vh` card heights; manual "Load more"; two overlapping active-index mechanisms.
- One scroll container: definite `calc(100dvh - 9rem)` height, `scroll-snap-type: y mandatory`, `overscroll-behavior: contain`, `scroll-snap-align/start + scroll-snap-stop: always` on cards, **no gap** (padding inside).
- **Sticky arrows on desktop AND touch** (disabled at ends, visible focus rings). **Windowed rendering**: active ± 1 stay mounted with sources (instant navigation), others are empty snap cells.
- **Keyboard**: ↑/↓, j/k, PageUp/Down, Space (play/pause), m (mute), l (like), Esc — ignored while typing in inputs/textarea/contenteditable or with a dialog open, `preventDefault`, key-repeat throttled, works right after load.
- **Wheel/trackpad**: exactly one reel per gesture, inertia-tail rejection; touch relies on native snap.
- Single source of truth: geometry-based index committed on settle. **Infinite prefetch** at active ≥ length−3 with a compact skeleton row; deep-link `/reels?reel=<id>` restores position; `aria-live` announces the current reel.

### B5.8 — Reels scroll glitch fix (owner-reported: "videos jump into the screen and dance, skip next/previous then snap back")
- **Root causes found** (frame-by-frame analysis of the owner's screen recording):
  1. `scrollIntoView({behavior:'smooth'})` on the card **fights the mandatory CSS snap mid-animation** (Chrome re-snaps during the animation → bounce/"dance"), and also targets **every scrollable ancestor** — including the page itself, which is what made the desktop page scrollbar jump.
  2. The wheel handler navigated from React state captured in a closure (stale mid-animation) with a leaky 700 ms cooldown + setInterval decay machinery racing native snap.
  3. A rAF handler flipped the active index (and thus the windowed DOM: videos mounting/unmounting) **mid-animation**, churning the layout while the snap animation ran.
  4. Snap points were declared on BOTH the padded wrapper and the inset article — two competing points ~4 px apart per card → ambiguous snapping/jitter.
- **Fix** (`src/lib/reel-scroll.ts` + `reels.tsx` rewrite, 12 new unit tests):
  - **Only the snap container ever scrolls, only to exact card multiples** (`index × clientHeight` via `container.scrollTo`) — never `scrollIntoView`; the page is never a scroll target again.
  - **Wheel is fully owned** (every event `preventDefault`'d, native wheel snap can never fight us) and grouped into gestures by a pure `ReelWheelArbiter`: one navigation per gesture, re-armed only after 150 ms of wheel silence — a trackpad flick's inertia tail can never fire a second, spurious navigation. Navigation steps derive from **live scroll geometry**, never stale state.
  - **Active index commits only on settle** (`scrollend` where available, 140 ms quiet fallback) — zero state/DOM churn mid-animation.
  - **One unambiguous snap point per card** (align-start + stop-always on the direct wrapper children only).
  - **ResizeObserver re-pins** the scroll to the active card when the viewport/dvh changes (mobile URL-bar collapse) so a re-snap can never choose a neighbour.
  - **`html.reels-page-scroll-lock`** (applied while the route is mounted): the page itself never scrolls — **hides the desktop right page scrollbar** (full-screen player feel, per owner request) and kills page-level scroll chaining on mobile.
  - Bonus fixes found during the pass: keyboard `l` hit the MUTE button instead of LIKE (now targeted via `data-reel-action="like"`); Space resolved the wrong video through mismatched `querySelectorAll` indices; the prefetch skeleton row was a full viewport tall; keyboard nav early-return used a stale closure of `reels.length`.

### B6 — Sign-up fully responsive
- `Button size="lg"` is fluid (`h-11 sm:h-12`, `px-4 sm:px-7`, `text-sm sm:text-base`) and wraps long labels (i18n-safe `text-wrap`).
- Footer row stacks (`flex-col-reverse`, primary first, full-width) below 360 px; account-type cards `grid-cols-1 min-[420px]:grid-cols-2`; profile-picture header wraps; creator Follow buttons collapse to icons below 360 px; touch targets ≥ 44 px.

---

## §8 additional defects
1. **`applyLedgerEntry` clamp / gift race** — fixed: atomic `debitWalletAtomic` (conditional update, cannot overdraft or race); legacy helper documented as credits-only.
2. **Stale closures in `live.$streamId.tsx`** — fixed with a `roleRef` the socket handlers read at event time.
3. **Token TTL > cap** — fixed (A4).
4. **Reply limited to host** — moderators can reply now (`canModerate`).
5. **Story multi-slide publish** — surfaced explicitly (B4 chip) + documented.
6. **`crossOrigin` on blob URLs / swallowed errors** — fixed (B4).
7. **`VITE_USE_LIVEKIT=false` dormant LiveKit fixes** — documented: the flag + `LIVEKIT_*` must be set for the SFU path (see `frontend/.env.example`); the mesh path remains a working rollback with this pass's constraints/bitrate/TURN fixes.

## Hygiene & tooling
- **Zero TypeScript errors in both packages** (frontend came down from **115 pre-existing** errors; backend was already clean).
- Backend `npm run lint` now actually runs (eslint + typescript-eslint config added — it previously failed with eslint not installed); frontend lint at **0 errors** (840 prettier issues auto-fixed; legacy `any`s downgraded to warnings, new code adds none).
- `npm run test:payment` **passes on case-sensitive filesystems** (the test referenced `../../Frontend/` — fixed to `frontend/`).
- New scripts: backend `npm run test:live`, `npm run test` (44 tests), `migrate:post-media`; frontend `npm run test:quality`, `test:gradient`, `test` (23 tests).
- **Missing `src/assets/` images restored** — the ZIP shipped an empty assets folder while `landing.tsx`/`Logo.tsx` imported three images, so **the project could not build at all**; branded placeholders ship now (replace with real art freely).
