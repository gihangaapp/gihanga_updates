import { Server as SocketIOServer } from "socket.io";

let ioInstance: SocketIOServer | null = null;

export function setIO(io: SocketIOServer) {
  ioInstance = io;
}

export function getIO(): SocketIOServer | null {
  return ioInstance;
}

/** Emits an event to every socket a given user has open (they join `user:<id>` on connect). */
export function emitToUser(userId: string, event: string, payload: unknown) {
  ioInstance?.to(`user:${userId}`).emit(event, payload);
}
