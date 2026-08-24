import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { createApp } from "./app";
import { connectDB } from "./config/db";
import { verifyConsumerAccessToken, verifyStaffAccessToken } from "./lib/jwt";
import { setIO } from "./lib/socket";
import { attachLiveHandlers } from "./lib/liveSignaling";
import { verifyMailer } from "./lib/mailer";

const PORT = process.env.PORT || 4000;

async function startServer() {
  await connectDB();

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

  io.on("connection", (socket) => {
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
          socket.join(`staff:${decoded.userId}`);
          if (decoded.role === "moderator" || decoded.role === "admin" || decoded.role === "superadmin") {
            socket.join("staff:moderators");
          }
          userId = decoded.userId;
          socket.join(`user:${decoded.userId}`);
        } else {
          const decoded = verifyConsumerAccessToken(token);
          userId = decoded.userId;
          socket.join(`user:${decoded.userId}`);
        }
      } catch {
        // invalid/expired token — socket stays connected but won't receive
        // user-scoped events until it reconnects with a fresh one
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
  });
}

startServer().catch((err) => {
  console.error("[Fatal] Failed to start server:", err);
  process.exit(1);
});
