import { AuditLog } from "../models/AuditLog";
import { Types } from "mongoose";

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
  } catch (error) {
    console.error("[AuditLog Error] Failed to write audit entry:", error);
  }
}
