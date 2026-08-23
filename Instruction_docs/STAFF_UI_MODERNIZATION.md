# STAFF CONSOLE — Modern UI Rebuild

## Live page bug
I couldn't find a definitive smoking-gun bug through code review — the routing,
permissions, and data-fetching logic all checked out. Rather than guess, I
rebuilt the page with defensive patterns that address the most likely causes
and make failures visible instead of silent: an explicit error state with a
retry button (previously a failed fetch just left the page blank with no
explanation), `retry: 1` instead of default retries so a real failure surfaces
quickly, and viewer counts now update live via the staff socket instead of
only refreshing every 15s. If it's still not loading after this, open your
browser's dev tools console/network tab when it happens — that'll show the
real error, and I can fix the actual cause instead of a second guess.

## Modern UI — rebuilt, not restyled
- **Real dark/light mode**, not just a dark theme: everywhere in the staff
  console now uses the same semantic color tokens as the rest of the app
  (`bg-card`, `text-foreground`, `border-border`, etc.) instead of hardcoded
  slate/white colors — so the existing theme toggle (now added to the staff
  top bar) actually switches the whole console, not just the consumer app.
- **New shared component kit** (`components/staff/StaffUI.tsx`): `StaffCard`,
  `StaffPageHeader`, `StatTile`, `StaffBadge`, `StaffToggle`, empty/error/
  skeleton states — used across the console so cards, buttons, and badges
  look and animate consistently instead of each page reinventing them.
- **Real Gihanga logo** on both the login page and the sidebar (the actual
  logo asset, not a placeholder icon).
- **Animations throughout** via `motion/react` — page transitions, staggered
  card entrances, a sliding active-nav-item indicator, a mobile nav that
  slides in instead of just appearing, an animated notification dropdown.
- **Real-time notification bell** — new backend piece: staff accounts are
  just `User` documents with an elevated role, so this reuses the existing
  Notification model. New reports, new pending deposits/withdrawals, and new
  ad campaigns awaiting review now push a live socket event *and* persist to
  the bell's history, so nothing's missed if you're looking away when it
  happens. A small "Live"/"Connecting" indicator in the top bar shows real
  socket connection status.
- Charts (growth, studio-style area/bar charts) already existed from earlier
  phases and now render with theme-aware colors instead of hardcoded hex.

## New pages
- **Staff Activity** (`/system/dashboard/activity`) — per-moderator/admin
  action counts over 30 days, with a visual bar and a breakdown of which
  actions each person's been taking. Built exactly per what I'd flagged as
  missing last round.
- **Bulk moderation actions** — `POST /system/moderation/reports/bulk-action`
  now exists on the backend, applying remove/warn/suspend/dismiss to many
  reports at once with one reason, all individually audit-logged.

## Deliberately deferred
**Two-factor auth for staff logins** — I chose not to build this in this
pass. A correct 2FA implementation (TOTP setup, QR codes, a login flow that
safely gates on a second factor without weakening the first) is a real
security feature that deserves its own focused pass with actual testing, not
something to squeeze in alongside a full UI rebuild under real time pressure.
Flagging again rather than shipping something half-verified.

## Verified
`tsc --noEmit` clean on both backend and frontend, as the final step before
this delivery. As always, I can't click through this myself — real
verification is you running it.
