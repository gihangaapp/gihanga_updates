import { Schema, model, Document, Types } from "mongoose";

export type NotificationKind =
  | "like"
  | "comment"
  | "follow"
  | "mention"
  | "live"
  | "system"
  | "payment"
  | "reward";

export interface INotification extends Document {
  recipient: Types.ObjectId;
  kind: NotificationKind;
  actor?: Types.ObjectId;
  text: string;
  relatedPost?: Types.ObjectId;
  relatedLive?: Types.ObjectId;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    kind: {
      type: String,
      enum: ["like", "comment", "follow", "mention", "live", "system", "payment", "reward"],
      required: true,
    },
    actor: { type: Schema.Types.ObjectId, ref: "User" },
    text: { type: String, required: true },
    relatedPost: { type: Schema.Types.ObjectId, ref: "Post" },
    relatedLive: { type: Schema.Types.ObjectId, ref: "LiveStream" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

export const Notification = model<INotification>("Notification", NotificationSchema);
