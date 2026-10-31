import { Schema, model, Document, Types } from "mongoose";

export type SupportTicketStatus = "open" | "in_progress" | "waiting_user" | "resolved" | "closed";

export interface ISupportTicket extends Document {
  user: Types.ObjectId;
  subject: string;
  category: "account" | "content" | "creator" | "payment" | "technical" | "safety" | "other";
  message: string;
  status: SupportTicketStatus;
  priority: "low" | "normal" | "high" | "urgent";
  assignedTo?: Types.ObjectId;
  messages: { sender: Types.ObjectId; senderRole: "user" | "moderator" | "admin" | "superadmin"; body: string; createdAt: Date }[];
  staffNote?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema = new Schema<ISupportTicket>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subject: { type: String, required: true, trim: true, maxlength: 120 },
    category: { type: String, enum: ["account", "content", "creator", "payment", "technical", "safety", "other"], default: "other" },
    message: { type: String, required: true, trim: true, maxlength: 4000 },
    status: { type: String, enum: ["open", "in_progress", "waiting_user", "resolved", "closed"], default: "open", index: true },
    priority: { type: String, enum: ["low", "normal", "high", "urgent"], default: "normal", index: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    messages: [{ _id: false, sender: { type: Schema.Types.ObjectId, ref: "User", required: true }, senderRole: { type: String, enum: ["user", "moderator", "admin", "superadmin"], required: true }, body: { type: String, required: true, maxlength: 4000 }, createdAt: { type: Date, default: Date.now } }],
    staffNote: { type: String, maxlength: 2000 },
    resolvedAt: { type: Date },
  },
  { timestamps: true },
);

SupportTicketSchema.index({ status: 1, priority: -1, updatedAt: -1 });
SupportTicketSchema.index({ assignedTo: 1, status: 1, updatedAt: -1 });

export const SupportTicket = model<ISupportTicket>("SupportTicket", SupportTicketSchema);
