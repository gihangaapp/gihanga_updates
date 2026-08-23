import { Schema, model, Document } from "mongoose";

export interface IModerationRule extends Document {
  name: string;
  description?: string;
  key: string;
  enabled: boolean;
  config: Record<string, any>;
  editableBy: "admin" | "superadmin";
  createdAt: Date;
  updatedAt: Date;
}

const ModerationRuleSchema = new Schema<IModerationRule>(
  {
    name: { type: String, required: true },
    description: { type: String },
    key: { type: String, required: true, unique: true },
    enabled: { type: Boolean, default: true },
    config: { type: Schema.Types.Mixed, default: {} },
    editableBy: { type: String, enum: ["admin", "superadmin"], default: "admin" },
  },
  { timestamps: true },
);

export const ModerationRule = model<IModerationRule>("ModerationRule", ModerationRuleSchema);
