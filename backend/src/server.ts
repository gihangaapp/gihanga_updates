import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { createApp } from "./app";
import { connectDB } from "./config/db";
import { verifyConsumerAccessToken, verifyStaffAccessToken } from "./lib/jwt";
import { User, type UserRole } from "./models/User";
import { getEffectiveStaffPermissions } from "./middleware/rbac";
import { setIO } from "./lib/socket";
import { attachLiveHandlers } from "./lib/liveSignaling";
import { startLiveSweeper } from "./lib/liveSweeper";
import { startAchievementSweeper } from "./lib/achievementSweeper";
import { startStorySweeper } from "./lib/storySweeper";
import { startMomoReconciliationSweeper } from "./lib/momoReconciliation";
import { verifyMailer } from "./lib/mailer";
import { ensureDefaultAchievementDefinitions } from "./services/achievementService";
import {
  registerModerationJobHandler,
  recoverPostsStuckWithoutVisualProvider,
  recoverPostsWithUnsupportedMediaInput,
  recoverStuckPostModeration,
} from "./services/moderation/contentModerationService";
import { startModerationQueue, recoverStuckJobs } from "./services/moderation/moderationQueue";
import { publicSummary } from "./lib/moderation/config";
import { inspectVisionCredentials } from "./lib/moderation/visionCredentials";

const PORT = process.env.PORT || 4000;

async function startServer() {
  await connectDB();
  await ensureDefaultAchievementDefinitions();

  // Mail sending is temporarily disabled across the app (see notes in
  // consumerAuth.ts) since free-tier hosting is currently failing to send
  // mail. Skipping this startup check avoids noisy "no email provider
  // configured" warnings in the logs. To restore: uncomment the line below.
  // verifyMailer().catch(() => {});

  const app = createApp();
  const server = http.createServer(app);

  // Same allowlist logic as the Express CORS setup in app.ts — Socket.IO
  // has its own separate CORS handshake. Auth here is via a bearer token in
  // `auth: { token }`, not cookies, so reflecting "*" is safe either way,
  // but mirroring FRONTEND_ORIGIN keeps both layers consistent in production.
  const socketAllowedOrigins = (process.env.FRONTEND_ORIGIN || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  const io = new SocketIOServer(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || socketAllowedOrigins.includes(origin)) return callback(null, true);
        const localDevOrigin = /^(https?):\/\/(localhost|127(?:\.\d{1,3}){3}|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?::\d+)?$/i.test(origin);
        if (localDevOrigin) return callback(null, true);
        return callback(new Error(`Origin ${origin} is not allowed by Socket.IO CORS`));
      },
      methods: ["GET", "POST"],
    },
  });
  setIO(io);

  io.on("connection", async (socket) => {
    // The client connects with `auth: { token: accessToken, isStaff?: boolean } }`.
    // Consumer sockets join a private `user:<id>` room so notify() can reach exactly
    // that user; staff sockets with a moderation permission join `staff:moderators`
    // so live-chat keyword alerts and other moderation pushes reach the right people.
    //
    // Staff (moderator/admin/superadmin) accounts share the same underlying User._id
    // as their consumer identity, so when a staff member goes live as themselves,
    // their socket ALSO joins `user:<id>` and gets a real `userId` — this is what lets
    // attachLiveHandlers (live:join, live:chat, kick, pin, etc.) treat a staff host
    // exactly like a consumer host, with no changes needed on that side.
    const token = socket.handshake.auth?.token as string | undefined;
    const isStaff = Boolean(socket.handshake.auth?.isStaff);
    let userId: string | undefined;

    if (token) {
      try {
        if (isStaff) {
          const decoded = verifyStaffAccessToken(token);
          const staffAccount = await User.findById(decoded.userId).select("role status staffPermissions").lean();
          if (!staffAccount || staffAccount.status !== "active" || staffAccount.role !== decoded.role || staffAccount.role === "user") {
            socket.disconnect(true);
            return;
          }
          socket.join(`staff:${decoded.userId}`);
          // Activity stream rooms combine staff visibility and a live permission.
          // This prevents a custom-restricted Admin from receiving events merely
          // because their base role belongs to the Admin audience.
          const effectivePermissions = getEffectiveStaffPermissions(staffAccount.role as Exclude<UserRole, "user">, staffAccount.staffPermissions);
          const visibilityScopes = staffAccount.role === "superadmin"
            ? ["all_staff", "admins", "superadmins"]
            : staffAccount.role === "admin"
              ? ["all_staff", "admins"]
              : ["all_staff"];
          for (const permission of effectivePermissions) {
            for (const visibility of visibilityScopes) {
              socket.join(`staff:activity:${visibility}:${permission}`);
            }
          }
          // Legacy room for live-safety alerts is permission-gated too: a staff
          // member with a customized permission set must not receive moderation
          // payloads merely because of their base role.
          if (effectivePermissions.has("moderation.queue.view")) socket.join("staff:moderators");
          if ((staffAccount.role === "admin" || staffAccount.role === "superadmin") && effectivePermissions.has("audit.viewAll")) socket.join("staff:admins");
          if (staffAccount.role === "superadmin") socket.join("staff:superadmins");
          userId = decoded.userId;
          socket.join(`user:${decoded.userId}`);
        } else {
          const decoded = verifyConsumerAccessToken(token);
          userId = decoded.userId;
          socket.join(`user:${decoded.userId}`);
        }
      } catch {
        // Invalid or expired credentials cannot subscribe to private staff/user rooms.
        if (isStaff) { socket.disconnect(true); return; }
      }
    }

    attachLiveHandlers(io, socket, userId);

    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  server.listen(PORT, () => {
    console.log(`[Server] Gihanga Updates Backend running on http://localhost:${PORT}`);
    // A4 — server-enforced live-stream hygiene: 5 h duration cap + stale-host
    // sweep + remaining-time warnings. Single-instance safe via a Redis lock
    // (or the in-memory shim's lock on dev); every action is idempotent anyway.
    startLiveSweeper();
    startAchievementSweeper();
    // Stories are 24-hour content — purge expired stories AND their
    // Cloudinary-hosted media (see lib/storySweeper.ts).
    startStorySweeper();
    // MTN sends each callback only once; poll pending transactions as a reliable fallback.
    startMomoReconciliationSweeper();

    // Content-safety pipeline: bounded in-process queue for async moderation
    // jobs (video frame sampling, deferred image batches). Recovers jobs that
    // were mid-flight when the process last died — the DB row is the source
    // of truth, so nothing is lost and nothing publishes unverified.
    registerModerationJobHandler();
    recoverStuckJobs()
      .then(async () => {
        const recoveredPosts = await recoverPostsStuckWithoutVisualProvider();
        if (recoveredPosts > 0) {
          console.warn(`[Moderation] Published ${recoveredPosts} previously stuck post(s) after caption checks; no visual AI provider is configured.`);
        }
        const retriedPosts = await recoverPostsWithUnsupportedMediaInput();
        if (retriedPosts > 0) {
          console.warn(`[Moderation] Retried ${retriedPosts} post(s) held by the previous unsupported-media input path.`);
        }
        const recoveredStuckPosts = await recoverStuckPostModeration();
        if (recoveredStuckPosts > 0) {
          console.warn(`[Moderation] Re-attempted ${recoveredStuckPosts} stale post moderation assessment(s).`);
        }
        startModerationQueue();
        const postRecoveryTimer = setInterval(() => {
          void recoverStuckPostModeration().then((count) => {
            if (count > 0) console.warn(`[Moderation] Re-attempted ${count} stale post moderation assessment(s).`);
          }).catch((error) => {
            console.error("[Moderation] Stuck-post recovery failed:", error instanceof Error ? error.message : "unknown error");
          });
        }, 60_000);
        postRecoveryTimer.unref?.();
      })
      .catch((err) => console.error("[ModerationQueue] startup failed:", err));

    // Startup configuration surface — secret-free summary + warnings.
    const moderationSummary = publicSummary();
    if (moderationSummary.enabled) {
      console.log(
        `[Moderation] pipeline enabled (fail-closed=${moderationSummary.failClosed}). ` +
          `Providers: OpenAI=${moderationSummary.providers.openai.configured}, ` +
          `Vision=${moderationSummary.providers.googleVision.configured} ` +
          `(credential file: ${moderationSummary.providers.googleVision.credentialFile}).`,
      );
      for (const warning of moderationSummary.warnings) {
        console.warn(`[Moderation][WARN] ${warning}`);
      }
      // Server-log-only detail: names the configured path so a Render Secret
      // File filename/path mismatch is obvious. Never sent to any API response.
      if (moderationSummary.providers.googleVision.enabled && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        const cred = inspectVisionCredentials();
        if (cred.status !== "ok") console.warn(`[Moderation][Vision] ${cred.message}`);
      }
    } else {
      console.log("[Moderation] pipeline DISABLED via CONTENT_MODERATION_ENABLED=false (local dev only — do not disable in production).");
    }
  });
}

startServer().catch((err) => {
  console.error("[Fatal] Failed to start server:", err);
  process.exit(1);
});
