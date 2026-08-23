# PHASE 3 REPORT — Real Social Features (real data, end to end)

## Username uniqueness
Was already enforced at the database level (unique index on `username`, shared by
regular users and creators since they're the same collection — a creator and a
regular user can never claim the same handle). What was missing was graceful
handling of the rare race condition where two people submit the same username at
the same instant; that used to surface as a raw 500. Both `POST /auth/register`
and `PATCH /auth/me` now catch the Mongo duplicate-key error and return a clean
"Username is already taken" instead.

## Messaging removed
Per your instruction, this is TikTok-style with no DMs. Deleted `messages.tsx`,
the `Conversation` model (it was unused — no route ever consumed it), the
"Messages" icon/badge in `TopBar.tsx`, and the reference to messaging in the
login page copy.

## Backend — new REST API surface (all real MongoDB, all type-checked clean)
- **Uploads**: `POST /api/v1/uploads/:kind` (photos/videos/reels/avatars/stories)
  via multer, disk storage, type + size validation, served at `/uploads/...`.
  Reels are capped by file size as a proxy for the 2-minute limit (no ffmpeg
  binary assumed available in every deployment — duration should also be
  checked client-side before upload, which the composer does).
- **Posts**: full CRUD + `/feed` (you + who you follow), `/explore`, `/reels`,
  `/tag/:tag`, `/user/:username`, `/user/:username/liked` (owner-only). Every
  listing returns per-viewer `liked`, `bookmarked`, and `followingAuthor` flags
  in one batched query set — no N+1s.
- **Follow/unfollow** with live follower-count updates, followers/following
  lists, and a notification on follow.
- **Likes** (posts + comments) and **bookmarks**, both toggle endpoints.
- **Threaded comments** — top-level + nested replies, paginated, with likes.
- **Stories** — create, MongoDB TTL-backed 24h expiry, grouped-by-author feed,
  view tracking, viewer list (author-only).
- **Notifications** — real DB-backed list/read/read-all, plus a Socket.IO layer:
  sockets authenticate with the JWT access token on connect and join a private
  `user:<id>` room; likes/comments/follows push a live `notification:new` event.
- **Search** (users, posts, hashtags), trending tags, and a `/users/suggested`
  endpoint (accounts you don't already follow, ranked by followers) for the
  sidebar's "Suggested creators" panel.
- **Public profile** endpoint with real follow-relationship flags.

## Frontend — every consumer route now reads real data
Worth noting: `index.tsx`, `explore.tsx`, `reels.tsx`, `tag.$tag.tsx`, and
`CreateSheet.tsx`/`Composer.tsx` were **already built** against hooks that
didn't exist yet (the original scaffold anticipated this backend) — once the
API client and React Query hooks below existed, those pages worked with no
further changes needed.

What I built/rewrote this pass:
- `lib/api-client.ts` — typed `FeedPost`, `PostComment`, `StoryGroup`,
  `AppNotification`, `PublicUser`; a `mediaUrl()` helper to resolve
  `/uploads/...` paths; and `uploadFile()` (XHR-based, so it can report real
  upload progress — `fetch` can't).
- `hooks/use-posts.ts`, `use-social.ts`, `use-stories.ts`,
  `use-notifications.ts`, `use-search.ts` — React Query hooks for everything
  above, with optimistic updates on like/bookmark/follow so the UI feels
  instant and rolls back cleanly on error.
- `lib/socket-client.ts` — a Socket.IO client that connects only while signed
  in and reconnects with a fresh token after refresh.
- `PostCard.tsx` — rewritten: real like/bookmark/follow, a comments drawer with
  real threaded replies and comment likes, delete-your-own-post, copy-link
  share, double-tap-to-like.
- `StoryRail.tsx` / `StoryViewer.tsx` — rewritten for real story groups,
  progress bars keyed to each story's real duration, real view tracking.
- `notifications.tsx` — real feed, mark-read, mark-all-read, live updates via
  the socket (badge count in `TopBar.tsx` is now real, not a hardcoded `12`).
- `bookmarks.tsx` — real saved posts, list/grid view, unsave.
- `profile.$username.tsx` — rewritten: real profile data, Posts/Reels/Likes
  tabs (Likes only visible on your own profile — there's no reason to expose
  what someone else has liked), follow/unfollow, real follower/following/post
  counts.
- `RightRail.tsx` — real trending hashtags and suggested creators, both from
  the new endpoints; dropped the fake "Live now" panel since there's no live
  backend yet (that's explicitly Phase 4).
- `welcome.tsx` — removed a fabricated "Joined by 1.84M people" stat with fake
  avatar bubbles on the landing page. That was never real and shouldn't ship
  as if it were.
- `GAvatar.tsx` — now renders a real uploaded photo (`avatarUrl`) when present,
  falling back to the gradient-initials avatar otherwise.

## Verified
- Backend `tsc --noEmit` — clean.
- Frontend `tsc --noEmit` — clean.
- Not verified live: no MongoDB/network access in this sandbox, so the full
  loop (post → appears in feed → liked/commented by a second account → real
  notification arrives) is verified by code review, not a live run. Test that
  locally with two accounts in two browser windows.

## Deliberately out of scope (still on mock, not silently — flagged here)
These weren't in the Phase 3 spec you pasted, and still read from
`src/mock/*`: **Creator Studio** (`studio.tsx`), **Wallet** (`wallet.tsx`),
**Live streaming** (`live.tsx`), **Ads** (`ads.tsx`), and the
**admin/moderator/superadmin dashboards** (`admin.*`, `system.dashboard.*`).
`src/mock/data.ts` and `src/mock/social.ts` are still present because those
files still import from them — deleting the folder now would break their
build. `styleguide.tsx` (an internal design-system reference page, not
user-facing) also still uses mock data harmlessly.
