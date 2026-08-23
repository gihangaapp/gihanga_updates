import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { createApp } from "./app";
import { connectDB } from "./config/db";
import { verifyConsumerAccessToken, verifyStaffAccessToken } from "./lib/jwt";
import { setIO } from "./lib/socket";
import { attachLiveHandlers } from "./lib/liveSignaling";

const PORT = process.env.PORT || 4000;

async function startServer() {
  await connectDB();

  const app = createApp();
  const server = http.createServer(app);

  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  setIO(io);

  io.on("connection", (socket) => {
    // The client connects with `auth: { token: accessToken, isStaff?: boolean } }`.
    // Consumer sockets join a private `user:<id>` room so notify() can reach exactly
    // that user; staff sockets with a moderation permission join `staff:moderators`
    // so live-chat keyword alerts and other moderation pushes reach the right people.
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
