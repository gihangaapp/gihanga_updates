import { Schema, model, Document, Types } from "mongoose";

export type SettingCategory = "rewards" | "momo" | "features" | "content" | "limits";

export interface ISetting extends Document {
  key: string;
  value: any;
  description?: string;
  category: SettingCategory;
  editableBy: "superadmin";
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SettingSchema = new Schema<ISetting>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true },
    description: { type: String },
    category: {
      type: String,
      enum: ["rewards", "momo", "features", "content", "limits"],
      required: true,
    },
    editableBy: { type: String, enum: ["superadmin"], default: "superadmin" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export const Setting = model<ISetting>("Setting", SettingSchema);
