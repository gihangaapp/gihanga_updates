import { Schema, model, Document, Types } from "mongoose";

export interface IContentView extends Document {
  user: Types.ObjectId;
  content: Types.ObjectId;
  kind: "post" | "reel" | "story";
  seenCount: number;
  firstSeenAt: Date;
  lastSeenAt: Date;
}

const ContentViewSchema = new Schema<IContentView>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    content: { type: Schema.Types.ObjectId, ref: "Post", required: true, index: true },
    kind: { type: String, enum: ["post", "reel", "story"], required: true },
    seenCount: { type: Number, default: 1 },
    firstSeenAt: { type: Date, default: Date.now },
    lastSeenAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

ContentViewSchema.index({ user: 1, content: 1 }, { unique: true });
ContentViewSchema.index({ user: 1, lastSeenAt: -1 });

export const ContentView = model<IContentView>("ContentView", ContentViewSchema);
