# Content Safety & Moderation — Setup and Operations Guide

This document explains how to configure, operate, verify and troubleshoot the
Gihanga Updates content-safety system. It is written for the engineer doing
the deployment AND for the staff who operate the review dashboard.

---

## 1. What this system does

Every user-generated publishing path on the platform now flows through ONE
central moderation pipeline (`src/services/moderation/contentModerationService.ts`):

| Path | Protection |
| --- | --- |
| Posts (photo / video / reel / text) | Caption + media checks; post stays invisible until APPROVED |
| Stories (image / video) | Caption + media checks; invisible in the story tray until approved |
| Comments & story replies | Text check; comment stays hidden until approved |
| Avatars | Image check at upload; rejected avatars are never applied |
| Profile text (name / username / bio) | Text check before the change is saved |
| Live stream title / description | Text check before the stream can start |
| Live chat | Every message checked; prohibited chat never broadcast; viewers auto-muted, hosts' streams force-ended after repeated violations |
| Profile picture changes | Must reference platform-uploaded, approved media |

**Fail-closed is the default**: if a required safety check errors or times
out, the content is NOT published. It either retries (bounded) or lands in
the staff review queue. There is no code path where a failed check approves
content.

### Decision model (the ONLY status vocabulary)

`APPROVED → published` · `REJECTED → blocked with a safe explanation` ·
`PENDING_REVIEW → private, awaiting a human` · `PROCESSING → private, checks
running` · `FAILED → private, check could not complete (retryable)`.

On content documents this maps to:
- Post.status: `processing` → `published` (approved) / `rejected`; every
  public read path already filters `status: "published"`, so unapproved posts
  are invisible platform-wide.
- Story.moderation.status / Comment.moderation.status + `hidden` flag.
- Media.moderationStatus controls the checked delivery route.

---

## 2. Required credentials and where to get them

### OpenAI Moderation API
1. Create an account / organization at **https://platform.openai.com**.
2. Generate an API key at *Dashboard → API keys*. The key starts with `sk-`.
3. Optional: set a monthly spend limit under *Billing → Limits* — moderation
   calls are cheap but not free (see §9 Cost).
4. Docs: https://developers.openai.com/api/docs/guides/moderation

### Google Cloud Vision (SafeSearch)
1. Create/select a project at **https://console.cloud.google.com**.
2. Enable the **Cloud Vision API** (*APIs & Services → Library → Cloud Vision API → Enable*).
3. Create a dedicated **service account** (*IAM & Admin → Service Accounts →
   Create*). Grant it the **minimum** needed — never Owner or Editor. See
   **§12.3** for the IAM details and the one role name in earlier versions of
   this guide (`roles/cloudvision.user`) that could not be verified.
4. Create a **JSON key** for that service account and download it
   (`GOOGLE_APPLICATION_CREDENTIALS` will point at this file).
5. Docs: https://cloud.google.com/vision/docs/detecting-safe-search ·
   Pricing: https://cloud.google.com/vision/pricing

Keep BOTH credentials server-side only. They are never sent to the frontend,
never placed in Vite variables, never committed. The service-account JSON key
file must stay outside source control; deploy systems (Render) should inject
its contents through a **secret file / secret environment mechanism**.

---

## 3. Environment variables

Copy the moderation section from `backend/.env.example`. Reference:

| Variable | Default | Meaning |
| --- | --- | --- |
| `CONTENT_MODERATION_ENABLED` | `true` | Master switch. `false` = legacy behaviour (LOCAL DEV ONLY). |
| `CONTENT_MODERATION_FAIL_CLOSED` | `true` | Failed checks never approve content. Do not disable in production. |
| `CONTENT_MODERATION_REVIEW_THRESHOLD` | `0.5` | Normalized score at/above which a category goes to human review. |
| `CONTENT_MODERATION_BLOCK_THRESHOLD` | `0.8` | Normalized score at/above which a category auto-rejects. Forced > review; clamped [0.4, 0.95]. |
| `CONTENT_MODERATION_TIMEOUT_MS` | `15000` | Per-call provider timeout (ms). |
| `CONTENT_MODERATION_MAX_RETRIES` | `2` | Bounded retries with exponential backoff (transient errors only). |
| `CONTENT_MODERATION_QUEUE_CONCURRENCY` | `3` | Max concurrent moderation jobs in-process. |
| `CONTENT_MODERATION_QUEUE_MAX_DEPTH` | `500` | Queue backpressure cap — beyond it, submissions fail closed (retryable). |
| `CONTENT_MODERATION_VIDEO_FRAME_INTERVAL_SECONDS` | `10` | Seconds between sampled video frames. |
| `CONTENT_MODERATION_VIDEO_MAX_FRAMES` | `12` | Hard cap of frames sampled per video (cost control). |
| `CONTENT_MODERATION_MAX_VIDEO_DURATION` | `10` | Best-effort max video duration (minutes). |
| `CONTENT_MODERATION_MAX_UPLOAD_SIZE_MB` | `200` | Complementary server-side upload size cap. |
| `CONTENT_MODERATION_HASH_TTL_HOURS` | `168` | How long an APPROVED media hash may be reused without rescanning. |
| `CONTENT_MODERATION_HASH_SCOPE` | `owner` | `owner` = hash reuse within one account; `global` = across accounts. |
| `CONTENT_MODERATION_SYNC_IMAGE_CHECKS` | `true` | Run single/few image checks inline (fast feedback) vs queue-only. |
| `OPENAI_API_KEY` | — | Server-side secret. |
| `OPENAI_MODERATION_MODEL` | `omni-moderation-latest` | Model per the official moderation guide. |
| `OPENAI_MODERATION_ENABLED` | `true` | Toggle the OpenAI provider. |
| `OPENAI_TRANSCRIPTION_ENABLED` | `false` | Optional Whisper transcription of video audio (extra cost). |
| `GOOGLE_CLOUD_VISION_ENABLED` | `true` | Toggle the Vision provider. |
| `GOOGLE_CLOUD_PROJECT_ID` | — | Your GCP project **ID** (not the display name). Required for Vision to be active. |
| `GOOGLE_APPLICATION_CREDENTIALS` | — | Absolute path to the service-account JSON key on the server (Render: `/etc/secrets/<Secret File name>`). Required for Vision to be active. An API key is NOT supported. |
| `LIVE_MODERATION_CHAT_ENABLED` | `true` | AI moderation of live chat messages. |
| `LIVE_MODERATION_VIOLATION_LIMIT` | `3` | Host-side violations before automatic force-end. |
| `CONTENT_MODERATION_PROVIDER_STUB` | `false` | Deterministic test provider. **Hard-refuses to activate when NODE_ENV=production.** |
| `CONTENT_MODERATION_STUB_MODE` | `approve` | `approve` / `reject-sexual` / `reject-violence` / `review` / `error` / `critical`. |

Validation happens at config load: invalid values fall back to SAFE defaults
and surface as `[Moderation][WARN]` lines at startup and in the dashboard's
health tab. Startup also prints which providers are configured — never their
credentials.

### Degraded mode (no provider configured)
Text still passes the conservative local prohibited-terms policy, but MEDIA
cannot be verified → fail-closed routes it to human review. The health tab
and startup logs warn about this explicitly. For local development you can
either configure real keys, or set `CONTENT_MODERATION_PROVIDER_STUB=true`
(test/dev only), or explicitly opt out with `CONTENT_MODERATION_ENABLED=false`.

---

## 4. Local development

```bash
cd backend
npm install
cp .env.example .env          # add your OPENAI_API_KEY etc.
npm run dev                   # API on :4000
```

The moderation queue runs inside the API process and starts automatically
(see the `[Moderation] pipeline enabled…` startup log). There is no separate
worker to run.

**Safe connectivity test without real credentials:**

```bash
CONTENT_MODERATION_PROVIDER_STUB=true CONTENT_MODERATION_STUB_MODE=approve npm run dev
# then, in another terminal:
curl http://localhost:4000/health
```

Startup logs will show the pipeline enabled with the stub provider. To test
the FULL decision flow with zero credentials:

```bash
npm run test:moderation
```

97 tests exercise approve/reject/review/error/critical paths, fail-closed
behaviour, threshold clamping, MIME-sniffing, video sampling plans and the
Google Vision adapter (mocked SDK, temp fake credential files) — no network,
no real keys, no sensitive test data.

**With real credentials** (optional integration check): start the server with
real keys configured and post a benign text post through the API — the
response's `moderation.status` should be `approved` (or `processing` for
video). Nothing else is required. Do NOT upload real prohibited material to
"test" the blockers.

---

## 5. Deployment notes

- **Render**: add `OPENAI_API_KEY`, `GOOGLE_CLOUD_PROJECT_ID` and the
  service-account JSON (as a **Secret File**, mounted at
  `/etc/secrets/<Filename>`, referenced by `GOOGLE_APPLICATION_CREDENTIALS`) in
  the service's configuration. Never place them in the frontend. Step-by-step
  Vision deployment and verification: **§12**.
- **Run the migration after deploying** (see §6).
- The queue is in-process (bounded, crash-recovered via durable
  ModerationJob rows). For multi-instance deployments, the job claim is
  atomic, but a future externalization to BullMQ/Cloud Tasks is documented
  as the scaling path in `contentModerationService.ts`.
- Monitoring: the staff dashboard *Moderation → Provider health* tab shows
  provider configuration, queue depth and warnings. `GET
  /api/v1/system/moderation/statistics` (staff) returns aggregate metrics for
  your own dashboards/alerting.

---

## 6. Database migrations

Mongoose creates the new collections (`moderationrecords`,
`moderationjobs`, `appeals`) and indexes automatically on first use. **No
destructive migration exists — nothing is dropped.**

The one-time backfill (safe + reversible):

```bash
npm run migrate:moderation            # Phase 1 (default): grandfather existing content
npm run migrate:moderation -- --rescan  # Phase 2 (optional): re-scan legacy media
```

- **Phase 1 (grandfather)** marks existing published posts/stories/visible
  comments as `approved` and legacy media as publicly deliverable. Existing
  content keeps working exactly as before — the rollout hides NOTHING.
- **Phase 2 (rescan)** re-checks legacy media in controlled batches through
  the queue. It is FLAG-ONLY: flagged content lands in the staff review
  queue and STAYS published until a human actioned it (an auditable,
  reversible decision record per item). Critical-protocol findings escalate
  to staff immediately.

---

## 7. How moderation decisions work (operator summary)

1. Providers normalize their outputs to platform categories with 0..1 scores
   (OpenAI category scores; Vision likelihoods mapped
   VERY_UNLIKELY=0 … VERY_LIKELY=0.85).
2. The decision engine applies thresholds:
   - critical categories (`sexual_content_minors`, `sexual_exploitation`)
     trigger the CRITICAL PROTOCOL at any score ≥ 0.1: immediate rejection,
     quarantine, staff-only escalation, generic non-graphic messaging, no
     automated appeals;
   - auto-reject categories (explicit sexual content, graphic violence,
     harassment, hate speech, self-harm) at ≥ block threshold → REJECTED;
   - anything at/above review threshold → PENDING_REVIEW;
   - elevated-but-sub-threshold signals on severe categories (≥ 60% of the
     review threshold) also hold content for review (this is what makes
     provider disagreement fail safe);
   - medical / spoof / racy imagery NEVER auto-rejects: medical is at most a
     review, spoof is ignored entirely, racy (e.g. swimwear) routes to review
     only at the highest confidence. Breastfeeding-style signal combinations
     (adult=UNLIKELY + medical=POSSIBLE) pass.
3. Providers erroring/timing out can never approve: all error → FAILED
   (retryable), some error + some pass → PENDING_REVIEW.
4. Media fingerprints (sha256 of the exact bytes) avoid rescanning
   byte-identical media from the same owner within the hash TTL. Only
   APPROVED decisions are ever reused — rejections always re-run.

Thresholds can be tuned at runtime by an Admin via
`PUT /api/v1/system/moderation/rules/content_thresholds` — values are
validated and clamped to safe ranges; the block threshold is always forced
above the review threshold. Critical-category behaviour is not tunable.

---

## 8. Operating the review dashboard

`/system/dashboard/moderation` (moderator and above):

- **User reports** — the pre-existing report queue, unchanged.
- **AI review queue** — records with status `pending_review` (and
  `failed`/`rejected`/`approved` audit views). Reviewers can Approve &
  publish, Reject (reason required), or Escalate. Critical-protocol records
  can never be approved here — they require the documented escalation
  procedure below.
- **Appeals** — user appeals with one-click Uphold (restores content) or
  Reject (decision stands), both requiring a decision note.
- **Provider health** — provider configuration state, queue depth, failed
  jobs, configuration warnings. No secrets are ever included.

All staff actions are audit-logged (`AuditLog`) with actor, action, target
and note.

### The critical-content (CSAM) protocol
When a check signals potential child-sexual-abuse or sexual-exploitation
material:
- the content is rejected and quarantined immediately; it is never
  displayed to users (the author receives a generic, non-graphic message and
  cannot appeal through the automated flow);
- all staff are alerted in real time; the record is flagged
  `criticalEscalation` and access-restricted to staff with
  `moderation.assessments.view`;
- the system does NOT re-submit suspected material to providers and does not
  redistribute it;
- **REMAINING REQUIREMENT (legal — cannot be completed in code)**: your
  organization must define, with legal counsel, the reporting/preservation
  procedure for your jurisdiction (e.g. NCMEC reporting where applicable)
  and the retention policy for evidence. The system preserves the audit
  trail and evidence references for exactly this purpose.

---

## 9. Cost, limits and honest capability notes

- OpenAI moderation: per-1K-inputs pricing on the Moderation endpoint; image
  inputs bill at image rates. Video frame sampling multiplies calls by the
  frame count (capped by `CONTENT_MODERATION_VIDEO_MAX_FRAMES`).
- Google Vision: per-1K-feature pricing (SafeSearch = 1 feature per image).
- Cloudinary: authenticated (private) asset delivery and video→JPEG frame
  transformations are billable transformations on your plan.
- Whisper transcription (optional, off by default) bills per audio minute.
- **Frame sampling proves only that the sampled frames are safe**, not every
  frame. Beginning/middle/end + even coverage mitigates, and borderline
  results route to humans, but full-coverage video moderation would need
  provider-side video classifiers.
- **Live-stream VIDEO moderation is not possible on the current
  infrastructure**: LiveKit Cloud is used without Egress/recording. What the
  system enforces today: title/description checks at start, AI moderation of
  every chat message, automatic viewer muting, host violation counting with
  automatic force-end (through the same audited `endStream()` path staff
  use), staff alerts, and report-driven escalation. Full frame-level live
  moderation requires enabling LiveKit Egress → a recording bucket → feeding
  sampled frames into the same `moderateImageByUrl()` pipeline; the provider
  abstraction already supports this without route changes.
- No moderation system catches everything. This one fails closed, keeps
  humans in the loop for uncertainty, and preserves the evidence trail.

---

## 10. Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Startup warns "NO AI provider is fully configured" | Missing keys | Set `OPENAI_API_KEY` and/or the Vision vars. |
| Everything lands in "Needs review" | Vision `LIKELY`+ on many images, or disagreement | Inspect the record's categories in the AI queue; consider raising review threshold (≤ 0.9). |
| Posts stuck "Processing failed" | Provider outage / quota | Health tab shows provider errors; the author's "Try again" button re-runs checks. |
| Local uploads never visible | Quarantine + no provider (fail-closed) | Configure keys, use the stub for dev, or explicitly disable the pipeline locally. |
| Video stuck in processing | Queue backpressure or ffmpeg absent locally | Check queue depth in Health; locally install ffmpeg or use Cloudinary. |
| 404 on `/api/v1/media/file/...` | Media not approved AND requester is not owner/staff | Intended behaviour — quarantined media is undeliverable. |

---

## 11. File map (for engineers)

```
backend/src/lib/moderation/
  types.ts            decision/status/category vocabulary (single source of truth)
  config.ts           env parsing, validation, clamping, secret-free summary
  policy.ts           category mapping, thresholds, user messages, critical protocol
  decisionEngine.ts   the ONLY place decisions are computed
  providers/
    types.ts          ModerationProvider contract + retry/timeout + error sanitization
    openaiProvider.ts       official openai SDK adapter (text + image URL)
    googleVisionProvider.ts official @google-cloud/vision adapter (bytes/URL)
    stubProvider.ts         deterministic test provider (refuses production)
    index.ts           registry
backend/src/services/moderation/
  contentModerationService.ts  central pipeline: text/image/video, records, publish
  moderationQueue.ts           bounded in-process queue with durable jobs
  videoFrameSampler.ts         Cloudinary so_ URLs / local ffmpeg frame sampling
  visionCredentials.ts  secret-free credential-FILE diagnostics (status enum only)
backend/src/models/  ModerationRecord, ModerationJob, Appeal (+ extended Post/Story/Comment/Media/LiveStream)
backend/src/routes/v1/moderation/consumerModeration.ts  reports + appeals + own records
backend/src/routes/v1/system/moderation/staffModeration.ts  assessments + appeals + stats + health
backend/src/scripts/migrate-moderation-backfill.ts      grandfather + flag-only rescan
backend/test/moderation-*.test.ts                       97-test suite (no network/DB; moderation-vision.test.ts = Vision adapter)
frontend/src/components/moderation/  ModerationStatusBadge, ReportDialog, AppealDialog
frontend/src/routes/system.dashboard.moderation.tsx     4-tab staff dashboard
```

---

## 12. Google Cloud Vision on Render — configure, deploy, verify

### 12.1 What is active with Vision only (OpenAI key not yet set)

| Works with Google credentials alone | Needs `OPENAI_API_KEY` |
| --- | --- |
| Image checks (SafeSearch) for post photos, story images, avatars | AI text moderation (captions beyond the local prohibited-terms list, comments, bios, usernames, live titles, live chat) |
| Video **frame** checks (sampled frames only — never the whole video) | OpenAI's own image/text scoring and its provider cross-check |
| Fail-closed handling of errors, timeouts, quota, bad credentials | Optional Whisper audio transcription |

**Important:** until the OpenAI key is configured, text is checked only by the
small local prohibited-terms policy (the existing documented *degraded mode*).
The startup log prints an explicit `[OpenAI]` warning for this. Vision is an
image classifier — it never receives text.

### 12.2 Render configuration

Environment variables (Render → service → *Environment*):

| Variable | Value |
| --- | --- |
| `CONTENT_MODERATION_ENABLED` | `true` |
| `CONTENT_MODERATION_FAIL_CLOSED` | `true` |
| `GOOGLE_CLOUD_VISION_ENABLED` | `true` |
| `GOOGLE_CLOUD_PROJECT_ID` | your project **ID** (shown in the Cloud Console project picker / dashboard — not the display name) |
| `GOOGLE_APPLICATION_CREDENTIALS` | `/etc/secrets/gihanga-vision-moderation.json` (must equal `/etc/secrets/` + the exact Secret File *Filename* below) |
| `OPENAI_MODERATION_ENABLED` | `true` (leave; key comes later) |
| `OPENAI_MODERATION_MODEL` | `omni-moderation-latest` |
| `OPENAI_API_KEY` | *(leave unset for now)* |
| `CONTENT_MODERATION_PROVIDER_STUB` | `false` or unset — the stub is refused when `NODE_ENV=production` anyway |

Secret File (Render → service → *Environment* → *Secret Files* → *Add Secret File*):

1. **Filename:** `gihanga-vision-moderation.json` (the downloaded key's own file
   name does not matter — only the Filename you type here does).
2. **Contents:** paste the key file contents into Render's secret-file editor
   (never into a normal environment variable, a repo file or a chat).
3. Render redeploys; the file appears at `/etc/secrets/<Filename>` (for
   non-Docker services also in the service root).

### 12.3 Google Cloud IAM

- The Cloud Vision API must be **enabled** on the project (enabling requires
  Service Usage Admin — a human, not this service account).
- The service account must be allowed to *use the project's quota* when calling
  the API. Google documents `roles/serviceusage.serviceUsageConsumer` (Service
  Usage Consumer) as the role for "consume quota and billing for a consumer
  project" — this is the least-privilege role to try first.
- **Unverified:** earlier versions of this guide named `roles/cloudvision.user`.
  I could not confirm that role exists in Google's documentation. Search for it
  in *IAM → Grant access → Role*; if it is not offered, do not use it.
- **Never** grant Owner or Editor to make auth work.
- Confirm with one real call (12.5). If it returns PERMISSION_DENIED the Render
  log prints `[Moderation][Vision] permission_denied` or `api_disabled`/`billing`;
  the Cloud Console *Logs Explorer* then names the exact missing permission.
- Billing must be enabled on the project for Vision to answer.

### 12.4 Migrations

No new collections, fields or indexes were added for the Vision work, so **no new
migration is required**. The existing, previously documented backfill still
applies if you have not run it (`npm run migrate:moderation`, §6).

### 12.5 Safest deploy-and-verify sequence

1. Commit/push the code (the key file is **not** in the repo; `.gitignore` now
   blocks common key-file names).
2. Add the Secret File and the env vars from 12.2, then deploy.
3. In the Render logs expect, in order:
   - `[Moderation] pipeline enabled (fail-closed=true). Providers: OpenAI=false, Vision=true (credential file: ok).`
   - `[Moderation][WARN] [OpenAI] OPENAI_MODERATION_ENABLED=true but OPENAI_API_KEY is not set …` (expected for now)
   - **No** `[Moderation][WARN] [Vision] …` and no `[Moderation][Vision] …` lines.
   - `credential file: file_missing` ⇒ the `GOOGLE_APPLICATION_CREDENTIALS` path ≠ `/etc/secrets/<Filename>`.
4. Staff dashboard → *Moderation → Provider health*: Google Vision shows
   configured, credential file `ok`. (`ok` means the file *looks* valid — only a
   live call proves Google accepts it.)
5. Smoke test with ONE benign photo post from a test account. It makes one
   billed SafeSearch call (see Google's pricing page). Expected: the post goes
   *processing → published*. Check the logs for `[Moderation][Vision]` lines.
   Do **not** upload prohibited material to "test" the blockers.
6. Only after 5 succeeds, move on to OpenAI (12.7).

### 12.6 Vision troubleshooting (server log lines are static, secret-free hints)

| Log line | Meaning / fix |
| --- | --- |
| `credentials: Credential file not found …` | Secret File Filename ≠ the path in `GOOGLE_APPLICATION_CREDENTIALS`. |
| `credentials: … not valid JSON` / `incomplete` / `wrong credential type` | Re-paste the original service-account key into the Secret File. |
| `permission_denied` | Service account lacks permission (12.3). |
| `api_disabled` | Enable the Cloud Vision API on the project. |
| `billing` | Enable billing on the project. |
| `unauthenticated` | Key revoked/rotated/malformed — create a new key, re-upload the Secret File. |
| `quota` / `unavailable` | Transient — retried (bounded), then the content fails closed and the author can retry. |
| `no_signal` | Vision returned only UNKNOWN likelihoods — treated as an error, never as "safe". |
| `[Vision] … project_id does not match` (startup warning) | The key file belongs to a different project than `GOOGLE_CLOUD_PROJECT_ID`. |

### 12.7 Later: OpenAI key checklist

1. Create the key at platform.openai.com and (recommended) set a spend limit.
2. Render → *Environment* → add `OPENAI_API_KEY` (a normal secret env var; never in git/frontend).
3. Keep `OPENAI_MODERATION_ENABLED=true`, `OPENAI_MODERATION_MODEL=omni-moderation-latest`.
4. Redeploy; expect `Providers: OpenAI=true, Vision=true` and the `[OpenAI]` warning gone.
5. Smoke-test one benign text post and one benign photo post.
6. Expect somewhat more items in the *AI review queue*: with two image providers, a disagreement intentionally routes to human review.
7. Leave `OPENAI_TRANSCRIPTION_ENABLED=false` unless you accept the per-minute Whisper cost.

### 12.8 Honest limits (unchanged by this work)

- Video moderation checks **sampled frames only** (start/middle/end + even coverage, capped); live-stream *video* is not moderated.
- Hash-based duplicate-scan avoidance and DB-level publish gating are verified by code review and decision-layer tests, not by integration tests against a database.
