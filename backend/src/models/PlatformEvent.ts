import { Schema, model, Document, Types } from "mongoose";

export type PlatformEventCategory = "users" | "content" | "community" | "live" | "finance" | "moderation" | "staff" | "system";
export type PlatformEventVisibility = "all_staff" | "admins" | "superadmins";

export interface IPlatformEvent extends Document {
  type: string;
  category: PlatformEventCategory;
  summary: string;
  actor?: Types.ObjectId;
  actorRole?: string;
  targetUser?: Types.ObjectId;
  targetId?: string;
  visibility: PlatformEventVisibility;
  requiredAnyPermissions?: string[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const PlatformEventSchema = new Schema<IPlatformEvent>(
  {
    type: { type: String, required: true, trim: true, maxlength: 100, index: true },
    category: { type: String, enum: ["users", "content", "community", "live", "finance", "moderation", "staff", "system"], required: true, index: true },
    summary: { type: String, required: true, trim: true, maxlength: 240 },
    actor: { type: Schema.Types.ObjectId, ref: "User" },
    actorRole: { type: String, maxlength: 30 },
    targetUser: { type: Schema.Types.ObjectId, ref: "User" },
    targetId: { type: String, maxlength: 120 },
    visibility: { type: String, enum: ["all_staff", "admins", "superadmins"], default: "all_staff", index: true },
    requiredAnyPermissions: { type: [String], default: undefined },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

PlatformEventSchema.index({ createdAt: -1, category: 1 });
PlatformEventSchema.index({ actor: 1, createdAt: -1 });
PlatformEventSchema.index({ visibility: 1, requiredAnyPermissions: 1, createdAt: -1 });

export const PlatformEvent = model<IPlatformEvent>("PlatformEvent", PlatformEventSchema);
