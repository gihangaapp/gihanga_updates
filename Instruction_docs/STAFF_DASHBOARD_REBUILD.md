# STAFF DASHBOARD REBUILD — Full permission-matrix implementation

## Permission matrix
Checked the existing `middleware/rbac.ts` against the exact table you gave —
it already matched every single row precisely (moderator/admin/superadmin
capabilities for moderation, accounts, payments, wallet, ads, live, rewards,
settings, bonus points). No changes needed there; it was already the correct
foundation. Added a matching frontend helper, `lib/permissions.ts`
(`hasPermission(staffUser, 'wallet.freeze')`), backed by the `permissions`
array the login response already returns — so route/UI guards read from one
source of truth instead of scattered `role === "admin"` checks.

## Backend — newly built
- **Moderation actions**: `POST /system/moderation/reports/:id/action` —
  remove content, warn, or suspend, each requiring a reason, each writing to
  the audit log and notifying the affected user.
- **Moderation rules**: `GET/PUT /system/moderation/rules` — view for
  everyone with queue access, edit gated to admin/superadmin per the matrix.
- **User account management**: verify, suspend, reinstate, ban, and
  role-change-to-creator, each admin/superadmin-gated, each audit-logged and
  notifying the user.
- **Staff promotion/demotion**: `POST /system/staff/promote` (by email or
  username), `POST /system/staff/:id/demote` — superadmin only.
- **Full audit log with filtering**: `GET /system/audit` — filters by
  action, actor, and date range; automatically scoped to "your own actions
  only" for moderators vs. everything for admin/superadmin, per the matrix.
- **Platform settings** (superadmin only): feature flags, MTN MoMo UI
  visibility toggle (hide deposit/withdraw from users without touching code
  while credentials aren't set up yet), and content category CRUD.
- **Admin bonus points**: `POST /system/users/:id/grant-points`.
- **Dashboard overview**: `GET /system/overview` — a permission-aware
  snapshot (pending reports, user counts, pending payments, live count, etc.)
  that only returns numbers the signed-in role can actually see.
- **Platform growth**: `GET /system/growth` — real signup/post/revenue
  aggregation, replacing what used to be fully mock data.

Payments queue, wallet freeze/unfreeze, ads oversight, live oversight, and
reward-rate config already existed from Phase 4 and were verified still
correct against the matrix — no changes needed.

## Frontend — completely rebuilt, not reused
- **New login page** — different visual identity entirely (dark gradient,
  glass card), not the previous form.
- **New dashboard shell** — a fresh sidebar built from the permission map
  (sections and links only appear if the signed-in role actually has a
  permission that unlocks them), with a mobile slide-over nav that didn't
  exist before.
- **Brand new pages**: Dashboard overview, Moderation queue (with the
  remove/warn/suspend/dismiss action flow), Moderation rules panel, User
  accounts (search, verify, suspend, ban, reinstate, make-creator, grant
  points), Staff Management (promote/demote), Audit Log (with filters),
  Platform Settings (feature flags, MoMo visibility, categories), and
  Platform Growth.
- Also removed a redundant, unused duplicate `/admin/*` route family that
  overlapped entirely with `/system/dashboard/*` — one clean staff surface
  now instead of two.

## Verified
`tsc --noEmit` clean on both backend and frontend, as the final step before
this delivery.

## What I'd flag as worth adding next
A couple of things from "other activities you think I forgot," noted rather
than built (time/scope):
- **Bulk moderation actions** (select multiple reports, action together) —
  the queue currently handles one report at a time.
- **Staff activity dashboard per person** — the audit log is filterable but
  there's no "here's what moderator X did this week" summary view.
- **Two-factor auth for staff logins** — given the sensitivity of what this
  console can do (ban accounts, freeze wallets, approve payouts), it's worth
  considering before this goes anywhere near production.

