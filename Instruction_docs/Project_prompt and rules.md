# Gihanga Updates - Full Development & Deployment Plan

## 0. What Gihanga Updates is

Gihanga Updates is an African-market social content platform combining
TikTok-style short video, Instagram-style feed/stories, YouTube-style
long-form + live streaming, and a built-in creator economy: Kingdom
Points rewards, a wallet, and cash payouts via **MTN Mobile Money**.
Currency is RWF. Primary market is Rwanda (Kigali-first), built to
generalize to other African markets later.

Three audiences use this product, and they must never share one login
surface:

1. **Regular users** — sign up, browse the feed/reels/explore, follow,
   like, comment, save, message, get notified. Standard consumer auth,
   like Instagram or YouTube.
2. **Creators** — same login as regular users (a creator is a user with
   `isCreator: true` / an elevated capability, not a separate account
   system). Creators additionally get Creator Studio: content
   analytics, audience insights, earnings, campaign/ads tools, and
   live-streaming as a host.
3. **Staff** — Moderator, Admin, and Super Admin. These are **not**
   reachable through the normal login. They exist behind a dedicated
   route, `/system`, which shows a distinct staff login form. A regular
   user who happens to navigate to `/system` sees only that login form
   — never the app shell, never a hint that admin features exist.
   After staff authenticate, they land on a dashboard scoped to their
   role — not one dashboard with hidden buttons.

---

## 1. What already exists (audit of the attached codebase)

The attached zip (`gihanga-vision-ui-main`) is a **frontend-only**
build. Treat everything below as verified fact from reading the code,
not assumption — but note this was a structural audit of routes, data
shapes, and the auth mock; it was not an exhaustive read of every
component's internals. **Your first job in Phase 0 is to produce a
complete, verified inventory** — the list below is your starting map,
not the final word.

### Stack (keep this — do not replace the framework)

- **TanStack Start** (React 19, SSR-capable meta-framework, runs on
  Nitro) with **TanStack Router** using file-based routes in
  `src/routes/`
- **TanStack Query** for data fetching (currently unused for real data
  — everything reads from `src/mock/*.ts`)
- **Tailwind v4** with a genuinely well-built semantic design token
  system in `src/styles.css` (`--color-background`, `--color-surface`,
  `--color-primary`, `--color-primary-soft`, `--color-accent`,
  `--color-aqua`, `--color-success/warning/danger/info`,
  `--color-border`, etc.) — **this is the single source of truth for
  styling. Do not introduce new ad hoc colors. Reuse these tokens.**
- **shadcn/ui + Radix primitives** — full component library already
  installed in `src/components/ui/`
- **recharts** for charts (already used in `admin.index.tsx` — area
  charts, and in creator mock data shapes for studio analytics)
- **motion** (Framer Motion successor), **sonner** (toasts),
  **react-hook-form + zod**, **date-fns**, **embla-carousel**
- Package manager: **Bun** (`bun.lock` present)

### Routes that already exist (file-based, in `src/routes/`)

Consumer-facing: `index` (home feed), `explore`, `reels`, `live`,
`messages`, `notifications`, `bookmarks`, `wallet`, `ads`, `studio`
(creator studio), `profile.$username`, `tag.$tag`, `settings`,
`login`, `register`, `forgot-password`, `verify`, `welcome`,
`interests`, `styleguide`, `$` (404 catch-all).

Admin (currently unified, this is what needs to change):
`admin` (layout with tabs: Overview / Moderation / Accounts / Growth),
`admin.index` (overview + charts + audit log preview),
`admin.moderation`, `admin.users`, `admin.growth`.

### Data model already implied by the code (in `src/types/index.ts` and `src/mock/*.ts`)

- `User`: id, name, username, bio, avatarHue, verified, creator
  (boolean), live, followers, following, posts — **no role field, no
  password/email auth fields, no staff distinction**
- `Post`, `Comment`, `Story`, `Hashtag`
- Admin mock (`src/mock/admin.ts`): `PlatformStat`, `ModerationReport`
  (reason/status/severity/reporter/target), `AdminUserRow` — **this
  already has a `role: "member" | "creator" | "moderator" | "admin"`
  field, but no `superadmin`**, `AuditEntry`, `ModerationRule` (toggle
  list, e.g. "Auto-hide flagged comments", "Nudity classifier")
- Creator mock (`src/mock/creator.ts`): 30-day analytics (`DayPoint`:
  views/followers/earnings), `audienceByCity`, `audienceByAge`,
  `trafficSources`, `StudioContentRow` (post + status + views +
  engagement + earnings), `Transaction` (payout/earning/tip/fee),
  `walletBalance` (available/pending/lifetime), `Campaign` (ads:
  objective/status/budget/spent/impressions/clicks)

### Auth — this is entirely fake and must be replaced

`src/lib/mock-auth.ts` stores a `MockSession` object in
`localStorage`, patched directly by `login.tsx`/`register.tsx` after a
`setTimeout` — there is no server, no password hashing, no token, no
role enforcement anywhere. `src/lib/nav.ts` lists an "Admin" nav item
in `secondaryNav` that is **visible to every signed-in user regardless
of role**. This is the core problem statement: normalize this into
real, separated auth.

### What Phase 0 must verify beyond this (don't assume — check)

- Whether `PostCard.tsx` / `CreateSheet.tsx` already render a comment
  thread UI or only a comment *count*
- Whether `live.tsx`, `wallet.tsx`, `ads.tsx`, `messages.tsx`,
  `studio.tsx` are fully designed UI-only screens or have partial
  logic already
- Whether `StoryViewer.tsx` / `StoryRail.tsx` are complete
- What `src/hooks/` currently contains
- Exact prop/interface shapes for every component that will need to
  switch from mock data to a React Query hook

---

## 2. Target architecture

### 2.1 Two completely separate auth systems

**Consumer auth** (`/login`, `/register`, `/forgot-password`,
`/verify`) — issues a JWT (access + refresh token pair) for accounts
with role `user`. A `user` document with `isCreator: true` is still a
`user` role; creator capability is a flag/feature-set, not a role tier.
This is the ONLY login regular people and creators ever see.

**Staff auth** (`/system`) — a distinct login form, distinct branding
(should not look like the consumer login — signal "this is an internal
tool"), issues a separately-scoped token for accounts with role
`moderator`, `admin`, or `superadmin`. Requirements:

- Visiting `/system` while unauthenticated (or authenticated as a
  regular `user`) shows **only the staff login form** — never the
  consumer app shell, never a way to browse the public site from there.
- On successful staff login, redirect based on role:
  - `moderator` → `/system/dashboard` scoped to moderation tools only
  - `admin` → `/system/dashboard` scoped to moderation + accounts +
    payments + ads + live oversight + growth analytics
  - `superadmin` → everything `admin` has, plus role/permission
    management (promote/demote other staff), platform-wide settings,
    reward-rate configuration, full unredacted audit log, and
    "danger zone" actions (freeze any wallet, force-end any live
    stream, disable any feature flag)
- A `user`-role account must get a 403/redirect if it ever obtains a
  staff URL directly — server-side check, not just hidden UI.
- A staff account must **not** be able to log in through `/login` (the
  consumer form) — reject with a message pointing them to `/system`,
  or just treat staff accounts as invalid credentials on the consumer
  endpoint. Decide one behavior and apply it consistently.

### 2.2 Role/permission matrix (build this exactly, refine only with reasoning shown)

| Capability | Moderator | Admin | Super Admin |
|---|---|---|---|
| View moderation queue, action reports (remove content, warn, suspend for TOS reasons) | Y | Y | Y |
| Toggle moderation rules (auto-hide thresholds, classifiers) | view only | Y | Y |
| View audit log | own actions only | full | full |
| Manage user accounts (verify, suspend, ban, role change to creator) | N | Y | Y |
| Promote/demote staff (assign moderator/admin) | N | N | Y |
| View/approve payouts & withdrawals | N | Y | Y |
| Freeze/unfreeze a wallet | N | Y | Y |
| Manage ad campaigns platform-wide | view only | Y | Y |
| Force-end a live stream | Y (safety only) | Y | Y |
| Configure reward-point rates | N | view only | Y |
| Platform settings (categories, feature flags, MoMo config visibility) | N | N | Y |
| Grant admin bonus points | N | Y | Y |

Implement this as a real permission-checking middleware (backend) and
route guards (frontend) — not string-equality checks scattered around.
A single `hasPermission(user, 'wallet.freeze')`-style helper, backed
by a permission map, is the correct pattern.

### 2.3 Backend

Node.js + Express + MongoDB (Mongoose) + Socket.IO. REST API under
`/api/v1`, with a fully separate auth namespace for staff
(`/api/v1/system/auth/login`). JWT access + refresh tokens, bcrypt
password hashing, helmet, rate limiting, input validation
(express-validator or zod), CORS locked to the frontend origin.

Core modules: users/auth, posts (video/photo/reel), stories, comments,
likes, follows, bookmarks, hashtags, notifications, direct messages,
wallet + transactions, MTN MoMo integration (Collections +
Disbursements — implement the real request shapes; simulate
pending-response behavior until real sandbox credentials are supplied,
clearly marked in code exactly where to swap in production
credentials), reward engine (configurable point rates, admin bonus
grants), advertisements/campaigns, live streams + live chat + gifting
(Socket.IO), reports + moderation queue + moderation rules, audit log.

### 2.4 Live streaming

Socket.IO for live chat, gifting (real point transfers), viewer
counts, and notifications. WebRTC for the actual video for MVP
(document that this is mesh/peer-to-peer, fine for small audiences,
and that swapping in LiveKit/MediaSoup later only requires replacing
the video transport layer, not the chat/gifting/signaling contract).

---

## 3. Execution rules for every phase

- **Finish and verify each phase before starting the next.** "Verify"
  means: the app builds with zero errors, the relevant pages actually
  work end-to-end against the real backend (not mock data), and you
  can state in plain language what was tested.
- **Reuse existing UI wherever the design/shape already fits.** Do not
  rebuild `admin.index.tsx`'s chart layout from scratch — relocate it,
  reconnect it to real data, and extend it. The existing design token
  system, shadcn components, and page layouts are the source of truth
  for visual style throughout this entire project.
- **Never silently drop a feature that already exists in the mock
  data.** If `src/mock/creator.ts` implies a feature (e.g. campaign
  management, revenue split breakdown), that feature must exist for
  real by the end of the relevant phase — either build it or flag it
  explicitly as descoped with a reason, never just quietly omit it.
- At the end of every phase, produce a short **PHASE_N_REPORT.md**:
  what was built, what was tested and how, what's known to be
  incomplete, and what the next phase depends on.
- Keep secrets out of the repo. `.env.example` for every service, real
  `.env` gitignored.

---

## PHASE 0 — Audit, Architecture Plan, Monorepo Setup

**Goal:** no feature code yet. Understand the codebase completely and
lock the architecture decisions so nothing has to be redone later.

1. Read every route file and every component actually used by those
   routes (not just the ones listed in section 1 — verify that list).
   Produce `AUDIT.md`: for each route, what's UI-only vs. has real
   logic, what mock data source it depends on, what backend
   endpoints it will need.
2. Decide and document the SSR strategy: TanStack Start can
   server-render, but this project's data will come from an external
   Express API. Recommendation to validate or override with reasoning:
   run it in **client-rendered SPA mode against the external API**
   (disable/ignore server-side data loaders tied to Lovable's Nitro
   backend), keeping TanStack Start purely for its router/build
   tooling and optional shell SSR. Document the final decision and why.
3. Restructure the repo into a monorepo:
   ```
   gihanga-updates/
     frontend/   <- the existing TanStack Start app, cleaned up
     backend/    <- new Express/MongoDB/Socket.IO service
     docs/
   ```
4. Write `ROLE_MATRIX.md` (formalize section 2.2 above, adjust only
   with clear reasoning) and `DATA_MODEL.md` (every Mongoose schema
   you intend to build, derived from the mock data shapes already in
   the code plus what's needed for auth/wallet/live/reports).
5. Set up both projects' tooling: backend `package.json`
   (express, mongoose, socket.io, jsonwebtoken, bcryptjs, helmet,
   express-rate-limit, multer, cors, dotenv, morgan), root scripts to
   run both concurrently in dev.

**Exit criteria:** `AUDIT.md`, `ROLE_MATRIX.md`, `DATA_MODEL.md` exist
and are internally consistent; monorepo structure in place; both
projects install cleanly; no feature work has started yet.

---

## PHASE 1 — Backend Foundation: Data, Auth, RBAC

1. Implement every Mongoose model from `DATA_MODEL.md`. At minimum:
   `User` (with `role: 'user' | 'moderator' | 'admin' | 'superadmin'`,
   `isCreator: boolean`, `isVerified`, `status`, referral fields),
   `Wallet`, `Transaction`, `Post`, `Comment`, `Like`, `Follow`,
   `Story`, `Bookmark`, `Hashtag`, `Category`, `Notification`,
   `Message`/`Conversation`, `Report`, `ModerationRule`, `AuditLog`,
   `Advertisement`/`Campaign`, `LiveStream`, `LiveChatMessage`,
   `Setting`.
2. Build consumer auth: register, login, refresh, logout, email
   verification (real email service — nodemailer/Resend/SendGrid,
   pick one and document setup), forgot/reset password (this maps
   directly onto the existing `/verify` and `/forgot-password` pages
   in the frontend — the UI is already there, wire it for real).
3. Build staff auth: `/api/v1/system/auth/login`, separate from
   consumer login, rejects non-staff roles, issues staff-scoped
   tokens. Seed script must create one account per role: `moderator`,
   `admin`, `superadmin`, plus a demo `user` and a demo creator.
4. Build the permission middleware from the Phase 0 role matrix.
   Every admin/moderator/superadmin route must declare which
   permission it requires; the middleware checks it, not the
   controller.
5. Build an audit log write-path: every staff mutation (ban a user,
   remove a post, approve a payout, change a role, freeze a wallet)
   writes an `AuditLog` entry with actor, action, target, timestamp.

**Exit criteria:** you can register/login as a regular user via
Postman/curl and get a working JWT; you can log in as each staff role
via the `/system` endpoint and get correctly scoped access; hitting an
admin-only route as a `moderator` returns 403 with a clear message;
the seed script produces working credentials for all five account
types; every model has appropriate indexes and timestamps.

---

## PHASE 2 — Frontend Role Architecture Normalization

This is the phase that fixes the exact problem you flagged.

1. Delete `src/lib/mock-auth.ts`'s role in the app. Replace it with a
   real auth layer: an API client (fetch/axios wrapper with token
   refresh interceptor), a React Query-backed `useAuth()` hook or
   context, token storage strategy (document the choice — httpOnly
   cookie via backend-set cookie is preferable to localStorage for the
   access/refresh tokens if the architecture allows it; if not,
   explain the tradeoff you're accepting).
2. Update `login.tsx` and `register.tsx` to call the real consumer
   auth API instead of the fake `setTimeout` + `patchSession`.
3. Remove "Admin" entirely from `src/lib/nav.ts`'s `secondaryNav` —
   regular users and creators must never see any link toward staff
   tooling.
4. Build the `/system` route tree:
   - `/system` — dedicated staff login page (new component, visually
     distinct from `/login`, reuse the design token system but signal
     "internal tool" — e.g. a different accent treatment, a shield
     icon, no marketing copy)
   - `/system/dashboard` — a new staff shell (separate from the
     consumer `AppShell.tsx`) whose sidebar/nav renders **different
     items depending on the authenticated role**, using the
     permission matrix from Phase 0/1.
5. Split the existing unified `admin.tsx`/`admin.index.tsx`/
   `admin.moderation.tsx`/`admin.users.tsx`/`admin.growth.tsx` into
   role-scoped pages under the new `/system/dashboard/*` tree:
   - Moderator view: moderation queue + reports (reuse
     `admin.moderation.tsx`'s UI), read-only moderation rules, own
     audit history
   - Admin view: everything moderator has, plus accounts
     (`admin.users.tsx`'s UI), payments/payouts, campaigns oversight,
     live stream oversight, growth analytics (`admin.growth.tsx`,
     `admin.index.tsx`'s charts — reconnect to real data)
   - Super Admin view: everything admin has, plus staff role
     management, reward-rate config, platform settings, full audit
     log, danger-zone actions
   Keep the existing recharts-based visual design for all of this —
   it's good, reuse it, just change the data source and the
   route/permission gating.
6. Add route guards (`beforeLoad` in TanStack Router) on every
   protected route: unauthenticated consumer routes redirect to
   `/login`; unauthenticated/wrong-role staff routes redirect to
   `/system`; a signed-in regular user hitting a `/system/*` URL
   directly gets redirected to `/system` (the login form), not an
   error page that reveals the admin panel exists.

**Exit criteria:** visiting `/system` when logged out (or logged in as
a regular user) shows only the staff login form. Logging in as
`moderator`, `admin`, and `superadmin` each lands on a dashboard with
visibly different available sections matching the permission matrix.
No trace of admin/staff navigation appears anywhere in the regular
consumer UI. All of this runs against the real Phase 1 backend, not
mock data.

---

## PHASE 3 — Core Social Features (real data, end to end)

Wire every consumer-facing route to the real API via React Query,
replacing `src/mock/data.ts` and `src/mock/social.ts` consumption:

- Home feed (`index.tsx`), Explore, Reels, hashtag pages (`tag.$tag`)
- Post creation (`CreateSheet.tsx`/`Composer.tsx`) — real upload
  (multer on backend, progress indicator on frontend), photo/video/
  reel/text post types
- Stories (`StoryRail.tsx`/`StoryViewer.tsx`) — real create/view/expiry
- **Comments** — verify from the Phase 0 audit whether this needs to
  be built from scratch or just reconnected; either way, full working
  threaded comments with replies is a hard requirement, not optional
- Likes, follows, bookmarks, saves — all real, with optimistic UI
- Notifications — real data first (Phase 5 adds the real-time socket
  layer on top)
- Search / explore search — real backend search endpoint
- Profile pages (`profile.$username`) — real data, follow/unfollow,
  post grid

**Exit criteria:** a new user can register, complete onboarding
(`welcome.tsx`/`interests.tsx` — wire these to save real interest
data), post content, see it in the feed, get liked/commented on by a
second test account, and see a real notification. No page in this
phase still reads from `src/mock/*`.

---

## PHASE 4 — Creator Studio, Wallet, MTN MoMo, Ads

1. Creator Studio (`studio.tsx`): back every chart and table
   (`analytics30d`, `audienceByCity`, `audienceByAge`,
   `trafficSources`, `studioContent`, `revenueSplit`) with real
   aggregation endpoints. Views/earnings should reflect real
   activity, not random data.
2. Wallet (`wallet.tsx`): real balance, real `Transaction` history,
   deposit and withdraw via MTN MoMo (Collections request-to-pay for
   deposit, Disbursements for withdrawal/payout) — implement the real
   request/response shapes per MTN's API, clearly mark where real
   sandbox/production credentials plug in, and make deposit/withdraw
   fully functional in "simulated pending" mode until those
   credentials are supplied.
3. Reward engine: point accrual for uploads/likes/follows/views/
   shares/daily login/referrals, admin-configurable rates (feeds the
   Phase 2 Super Admin reward-config page), point-to-cash conversion.
4. Ads (`ads.tsx`): real campaign CRUD for creators/admins, real
   impression/click tracking, real CTR/spend calculation — this
   feeds the Admin "campaigns oversight" view from Phase 2.

**Exit criteria:** a creator account shows real analytics that change
as test activity happens; a deposit/withdraw request creates a real
pending transaction and appears in an admin's payments queue; an ad
campaign created by a creator is visible and manageable from the admin
dashboard.

---

## PHASE 5 — Live Streaming, Real-Time, Messaging

1. Live streaming (`live.tsx`): go-live, end-live, viewer count, live
   chat, point-based gifting — all via Socket.IO, all moving real
   wallet points. WebRTC video per the architecture in section 2.4.
2. Real-time notifications: push socket events for likes/comments/
   follows/live/payment/reward, replacing the Phase 3 poll-on-load
   version.
3. Direct messages (`messages.tsx`): real conversations, real-time
   delivery via Socket.IO, read receipts if the existing UI implies
   them.
4. Moderator "force-end a live stream" and live-chat keyword alerting
   (this is already implied by `moderationRules` mock data — build it
   for real).

**Exit criteria:** two test accounts can go live, chat, and gift each
other points with real wallet balance changes; a moderator can
force-end a stream from `/system/dashboard`; DMs deliver in real time
between two open sessions.

---

## PHASE 6 — Staff Tooling Completion

Finish everything in the role matrix that isn't done yet:

- Full moderation queue actions (remove content, warn, suspend, with
  reasons, all writing to the audit log)
- Moderation rules toggles fully functional (admin/superadmin can
  edit thresholds, not just view)
- User account management: verify, suspend, ban, role changes
  (admin/superadmin only, per matrix)
- Payment/payout approval queue, wallet freeze/unfreeze
- Super Admin: staff role promotion/demotion, reward-rate config UI,
  platform settings (categories, feature flags), full audit log view
  with filtering
- Admin bonus point grants

**Exit criteria:** every row in the Phase 0 permission matrix is a
real, working, permission-checked feature — not a UI element that
exists but does nothing.

---

## PHASE 7 — Hardening & Production Readiness

1. Security pass: confirm helmet/rate-limiting/input validation/
   sanitization on every route; pen-test the `/system` login and
   every staff-only endpoint specifically as the highest-value attack
   surface; confirm JWT secrets, MoMo credentials, and DB URIs are
   only in `.env`, never committed.
2. UX pass: loading states and skeletons on every page (not just some),
   consistent toast behavior, field-level form validation, empty
   states, error boundaries, mobile responsiveness on every new
   `/system` page (staff tables especially — they will overflow on
   mobile without a responsive fallback).
3. Accessibility: focus trapping in modals, aria-labels on icon-only
   buttons, contrast check against the existing design tokens.
4. Write `docs/API.md`, `docs/DEPLOYMENT.md`,
   `docs/PRODUCTION_CHECKLIST.md`, root `README.md` with real setup
   instructions for both `frontend/` and `backend/`.
5. Final QA pass against the full role matrix: log in as each of the
   five seeded account types and confirm each sees exactly what it
   should and nothing else.

**Exit criteria:** a fresh clone of the repo, following only the
README, produces a fully working system with all five account types
functioning exactly per the permission matrix, ready to point at real
MongoDB/MoMo credentials for a real deployment.

---

## Final reminder to the agent

Do not treat this as a rewrite. The existing frontend has real design
value — a working token system, real component library usage, and
page layouts that already match the product's intent. Your job is to
**normalize the role architecture, connect it to a real backend, and
fill the gaps** — not to start over. When in doubt about whether
something in the existing code is worth keeping, keep it and adapt it
rather than replace it, and say so in the phase report.
