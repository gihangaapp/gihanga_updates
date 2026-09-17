/**
 * migrateAds.ts
 *
 * Migration script for safe transition from the old primitive ad system
 * to the new comprehensive advertising architecture.
 *
 * Safe & Idempotent:
 * - Does NOT delete any collection or data.
 * - Flags old ad documents with `_legacySystem: true`.
 * - Sets default fallback values for new required fields.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { Advertisement } from "../models/Advertisement";

dotenv.config();

async function migrate() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/gihanga-updates";
  console.log(`Connecting to MongoDB at ${uri}...`);
  await mongoose.connect(uri);

  console.log("Starting advertising system migration...");

  // Find all documents that do not have `_legacySystem` set
  const oldAds = await Advertisement.find({ _legacySystem: { $exists: false } });
  console.log(`Found ${oldAds.length} legacy ad documents.`);

  let updatedCount = 0;
  for (const doc of oldAds) {
    (doc as any)._legacySystem = true;
    if (!doc.adType) (doc as any).adType = "image";
    if (!doc.placement) (doc as any).placement = "feed";
    if (!doc.title) (doc as any).title = (doc as any).name || "Legacy Campaign";
    if (!doc.campaignDurationDays) (doc as any).campaignDurationDays = 7;
    if (!doc.advertisingMinutes) (doc as any).advertisingMinutes = 30;
    if (!doc.paymentStatus) (doc as any).paymentStatus = "paid";
    await doc.save();
    updatedCount++;
  }

  console.log(`Successfully migrated ${updatedCount} legacy ad documents.`);
  await mongoose.disconnect();
  console.log("Migration complete.");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
