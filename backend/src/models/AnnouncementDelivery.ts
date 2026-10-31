import { Schema, model, Document, Types } from "mongoose";

export interface IAnnouncementDelivery extends Document {
  announcement: Types.ObjectId;
  user: Types.ObjectId;
  createdAt: Date;
}

const AnnouncementDeliverySchema = new Schema<IAnnouncementDelivery>(
  {
    announcement: { type: Schema.Types.ObjectId, ref: "Announcement", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
AnnouncementDeliverySchema.index({ announcement: 1, user: 1 }, { unique: true });
export const AnnouncementDelivery = model<IAnnouncementDelivery>("AnnouncementDelivery", AnnouncementDeliverySchema);
