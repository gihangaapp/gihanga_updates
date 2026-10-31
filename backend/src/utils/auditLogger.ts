import { AuditLog } from "../models/AuditLog";
import { Types } from "mongoose";
import { User } from "../models/User";
import { recordPlatformActivity } from "../services/platformActivity";

export interface AuditParams {
  actor: string | Types.ObjectId;
  actorUsername?: string;
  action: string;
  targetUser?: string | Types.ObjectId;
  targetPost?: string | Types.ObjectId;
  targetId?: string;
  meta?: Record<string, any>;
  ipAddress?: string;
}

export async function logAudit(params: AuditParams): Promise<void> {
  try {
    await AuditLog.create({
      actor: typeof params.actor === "string" ? new Types.ObjectId(params.actor) : params.actor,
      actorUsername: params.actorUsername,
      action: params.action,
      targetUser: params.targetUser
        ? typeof params.targetUser === "string"
          ? new Types.ObjectId(params.targetUser)
          : params.targetUser
        : undefined,
      targetPost: params.targetPost
        ? typeof params.targetPost === "string"
          ? new Types.ObjectId(params.targetPost)
          : params.targetPost
        : undefined,
      targetId: params.targetId,
      meta: params.meta,
      ipAddress: params.ipAddress,
    });
    const actorId = typeof params.actor === "string" ? params.actor : String(params.actor);
    const actor = await User.findById(actorId).select("role").lean();
    void recordPlatformActivity({
      type: `staff.${params.action}`,
      category: "staff",
      summary: `Staff action recorded: ${params.action}`,
      actor: actorId,
      actorRole: actor?.role || "staff",
      targetUser: params.targetUser ? String(params.targetUser) : undefined,
      targetId: params.targetId || (params.targetPost ? String(params.targetPost) : undefined),
      visibility: actor?.role === "superadmin" ? "superadmins" : "admins",
      requiredAnyPermissions: ["audit.viewAll"],
    });
  } catch (error) {
    console.error("[AuditLog Error] Failed to write audit entry:", error);
  }
}
