import { Schema, model, Document, Types } from "mongoose";

export interface IAuditLog extends Document {
  actor: Types.ObjectId;
  actorUsername?: string;
  action: string;
  targetUser?: Types.ObjectId;
  targetPost?: Types.ObjectId;
  targetId?: string;
  meta?: Record<string, any>;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    actorUsername: { type: String },
    action: { type: String, required: true },
    targetUser: { type: Schema.Types.ObjectId, ref: "User" },
    targetPost: { type: Schema.Types.ObjectId, ref: "Post" },
    targetId: { type: String },
    meta: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
  },
  { timestamps: true },
);

AuditLogSchema.index({ actor: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ targetUser: 1, createdAt: -1 });

export const AuditLog = model<IAuditLog>("AuditLog", AuditLogSchema);
