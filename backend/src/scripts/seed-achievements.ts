import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { AchievementDefinition } from "../models/Achievement";
import { DEFAULT_ACHIEVEMENTS } from "../services/achievementService";

/**
 * Idempotently seeds the default achievement definitions.
 *
 * Safe to run more than once: existing definitions are updated in place
 * (threshold/color/name), never deleted, and existing UserAchievement award
 * records are never touched. Use this to initialize a fresh database or to
 * restore a definition that was accidentally disabled.
 *
 * Run: tsx src/scripts/seed-achievements.ts
 */
async function seedAchievements() {
  await connectDB();

  console.log("[seed-achievements] Seeding default achievement definitions...");
  let created = 0;
  let updated = 0;

  for (const def of DEFAULT_ACHIEVEMENTS) {
    const result = await AchievementDefinition.findOneAndUpdate(
      { achievementId: def.achievementId },
      {
        $set: {
          name: def.name,
          category: def.category,
          metric: def.metric,
          description: def.description,
          threshold: def.threshold,
          icon: def.icon,
          color: def.color,
          enabled: true,
        },
        $setOnInsert: { version: 1 },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    // Distinguish created vs updated by checking if the doc is brand-new
    // (createdAt within the last few seconds).
    const ageMs = Date.now() - new Date(result.createdAt).getTime();
    if (ageMs < 5000) created++;
    else updated++;
    console.log(`  ${ageMs < 5000 ? "+" : "~"} ${def.achievementId.padEnd(14)} ${def.name.padEnd(16)} ${def.metric} ≥ ${def.threshold}`);
  }

  console.log(`\n[seed-achievements] Done. ${created} created, ${updated} updated, ${DEFAULT_ACHIEVEMENTS.length} total.`);
  await mongoose.disconnect();
  process.exit(0);
}

seedAchievements().catch((err) => {
  console.error("[seed-achievements] Failed:", err);
  process.exit(1);
});
