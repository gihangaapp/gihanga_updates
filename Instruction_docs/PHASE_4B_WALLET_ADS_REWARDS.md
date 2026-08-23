# PHASE 4b — Wallet, MTN MoMo, Reward Engine, Ads, Creator Studio Analytics

## Wallet + MTN MoMo
- `lib/momo.ts` — real Collections (RequestToPay) and Disbursements (Transfer)
  request/response shapes, matching MTN's actual API: token exchange (Basic
  auth → Bearer token), `X-Reference-Id`/`X-Target-Environment` headers,
  async accept-then-poll-or-callback flow. Credentials plug in via
  `MOMO_COLLECTION_*` / `MOMO_DISBURSEMENT_*` in `.env` — get them from
  https://momodeveloper.mtn.com. Sandbox only accepts EUR; switch
  `MOMO_CURRENCY` to RWF once you have production credentials.
- `POST /wallet/deposit` and `POST /wallet/withdraw` — real amount/phone
  validation, real balance checks (a withdrawal holds the funds in `pending`
  immediately so the same balance can't be withdrawn twice while awaiting
  approval), and a real `Transaction` row either way.
- **Simulated-pending mode**: exactly as asked — without MoMo credentials
  configured, deposits/withdrawals still work end-to-end, they just stay
  `pending` until an admin approves them from the payments queue instead of
  triggering an instant phone prompt. The moment real credentials are added,
  the same endpoints switch to the live MTN flow automatically — no code
  change needed.
- `POST /wallet/momo/callback` — the webhook MTN calls when a payment
  actually settles; completes the transaction and credits/releases the
  wallet balance.
- `POST /wallet/convert-points` — Kingdom Points → cash at the admin-set rate.
- Staff: `/system/payments` (queue), `/approve`, `/reject` (releases a held
  withdrawal back to available balance if rejected); `/system/wallet/:id/
  freeze` / `/unfreeze`.

## Reward engine
- `lib/rewards.ts` — admin-configurable rates (`Setting` doc, key
  `reward_rates`) for upload/like/follow/share/daily-login/referral, with
  sane defaults if nothing's configured. `/system/rewards/config` (GET/PUT)
  feeds the Super Admin reward-config page.
- Wired into real actions: uploading a post, getting liked, getting
  followed, getting shared, logging in once per calendar day, and a
  referral system (capture `referralCode` at registration → payout to the
  referrer only once the referred account verifies their email, to prevent
  fake-signup farming).
- Point-to-cash conversion rate is separately admin-configurable
  (`points_to_cash_rate` Setting).

## Ads
- Full campaign CRUD (`/ads`) for creators — name, objective, budgets,
  optional post targeting (can only promote your own posts), pause/resume.
- Real impression/click tracking (`/ads/:id/impression`, `/ads/:id/click`) —
  each debits the campaign's real budget from the creator's wallet via the
  same ledger primitive gifting uses, auto-completes the campaign once the
  budget's exhausted, and keeps a real CTR.
- Staff oversight (`/system/ads`) — review queue, approve/reject with a
  reason, and an independent admin pause (separate from the creator's own
  pause toggle).

## Creator Studio — real analytics
`GET /studio/analytics` aggregates real data only:
- 30-day daily series (views/likes/comments/new followers/earnings) built
  from actual `Post` and `Follow` timestamps — no random data.
- Top-performing content, ranked by real engagement.
- Revenue split (gifts vs. reward points) from real `Transaction` rows.
- **Honestly incomplete, not faked**: city/age audience breakdowns and
  traffic-source attribution are not shown. The platform doesn't collect
  geolocation or referrer data, and I wasn't willing to fill that gap with
  invented numbers just to make the dashboard look complete — the UI shows
  a plain note explaining why instead. Adding real geo/referrer tracking is
  a reasonable next step if you want those back.

## What's newly wired vs. what was already there
Turned out `wallet.tsx`, `ads.tsx`, and their hooks (`use-wallet.ts`,
`use-ads.ts`) were already built against this exact API shape from earlier
in this session — I only needed to finish the backend routes and mount them.
`studio.tsx` needed a real rewrite since it was still fully on mock data.

## Verified
`tsc --noEmit` clean on both backend and frontend, checked as the very last
step before this delivery.

## Honestly still on mock, not part of this phase's ask
`admin.growth.tsx`, `admin.index.tsx`, `admin.users.tsx`,
`admin.moderation.tsx`, and `system.dashboard.{growth,audit,accounts,
moderation}.tsx` — the broader admin/superadmin dashboard rebuild from your
very first request. That's a separate, still-substantial phase on its own
(real growth metrics, audit log viewer, account management, content
moderation queue) and wasn't part of the Phase 4 spec block you pasted this
round. `feed-store.ts` (local-only scheduled/draft posts in Creator Studio)
also stays as-is — there's no backend for post scheduling yet, and building
one wasn't asked for here either.
