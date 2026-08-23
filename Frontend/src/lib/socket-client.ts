import { io, Socket } from "socket.io-client";
import { API_ORIGIN, getConsumerAccessToken, getStaffAccessToken } from "./api-client";

let socket: Socket | null = null;
let staffSocket: Socket | null = null;

/** Connects (or reuses) a socket authenticated with the current access token. */
export function getSocket(): Socket | null {
  const token = getConsumerAccessToken();
  if (!token) return null;

  if (!socket) {
    socket = io(API_ORIGIN, { auth: { token }, transports: ["websocket", "polling"] });
  } else if (socket.auth && (socket.auth as any).token !== token) {
    // token was refreshed — reconnect with the new one
    socket.auth = { token };
    socket.disconnect().connect();
  }
  return socket;
}

/** Staff (moderator/admin/superadmin) socket — joins `staff:moderators` for live moderation pushes. */
export function getStaffSocket(): Socket | null {
  const token = getStaffAccessToken();
  if (!token) return null;

  if (!staffSocket) {
    staffSocket = io(API_ORIGIN, { auth: { token, isStaff: true }, transports: ["websocket", "polling"] });
  } else if (staffSocket.auth && (staffSocket.auth as any).token !== token) {
    staffSocket.auth = { token, isStaff: true };
    staffSocket.disconnect().connect();
  }
  return staffSocket;
}

/**
 * Socket to use for the live-stream room (join/chat/react/moderate). Prefers
 * the consumer socket (the common case), but falls back to the staff socket
 * when the person is only logged in as staff — e.g. a moderator going live
 * or moderating with just their `/system` session open. The backend's
 * connection handler joins a staff socket to `user:<id>` too, so every
 * `live:*` event works identically either way.
 */
export function getLiveSocket(): Socket | null {
  return getSocket() ?? getStaffSocket();
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

export function disconnectStaffSocket() {
  staffSocket?.disconnect();
  staffSocket = null;
}
