import { Types } from "mongoose";
import { PlatformEvent, PlatformEventCategory, PlatformEventVisibility } from "../models/PlatformEvent";
import { getIO } from "../lib/socket";

export interface PlatformActivityInput {
  type: string;
  category: PlatformEventCategory;
  summary: string;
  actor?: string;
  actorRole?: string;
  targetUser?: string;
  targetId?: string;
  visibility?: PlatformEventVisibility;
  requiredAnyPermissions?: string[];
  metadata?: Record<string, unknown>;
}

/** Best-effort, secret-free platform activity recorder. It never blocks a user action. */
export async function recordPlatformActivity(input: PlatformActivityInput): Promise<void> {
  try {
    const event = await PlatformEvent.create({
      type: input.type.slice(0, 100),
      category: input.category,
      summary: input.summary.slice(0, 240),
      actor: input.actor && Types.ObjectId.isValid(input.actor) ? new Types.ObjectId(input.actor) : undefined,
      actorRole: input.actorRole?.slice(0, 30),
      targetUser: input.targetUser && Types.ObjectId.isValid(input.targetUser) ? new Types.ObjectId(input.targetUser) : undefined,
      targetId: input.targetId?.slice(0, 120),
      visibility: input.visibility || "all_staff",
      requiredAnyPermissions: input.requiredAnyPermissions?.slice(0, 8),
      metadata: input.metadata,
    });

    const payload = {
      id: String(event._id),
      type: event.type,
      category: event.category,
      summary: event.summary,
      actorRole: event.actorRole,
      targetId: event.targetId,
      createdAt: event.createdAt,
    };
    const io = getIO();
    if (!io) return;
    const requiredPermissions = event.requiredAnyPermissions || [];
    if (!requiredPermissions.length) return; // Older/unscoped events are available through permission-filtered API polling only.
    const visibilities: PlatformEventVisibility[] = event.visibility === "all_staff"
      ? ["all_staff", "admins", "superadmins"]
      : event.visibility === "admins"
        ? ["admins", "superadmins"]
        : ["superadmins"];
    for (const visibility of visibilities) {
      for (const permission of requiredPermissions) {
        io.to(`staff:activity:${visibility}:${permission}`).emit("platform:activity", payload);
      }
    }
  } catch (error) {
    console.error("[PlatformActivity] Failed to record activity:", error instanceof Error ? error.message : error);
  }
}
