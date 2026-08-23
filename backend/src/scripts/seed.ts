import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db";
import { User, Wallet, Setting, ModerationRule } from "../models";

async function seed() {
  await connectDB();

  console.log("[Seed] Clearing existing collections for clean initialization...");
  await User.deleteMany({});
  await Wallet.deleteMany({});
  await Setting.deleteMany({});
  await ModerationRule.deleteMany({});

  console.log("[Seed] Hashing default passwords...");
  const passwordHash = await bcrypt.hash("Gihanga2026!", 12);

  // 1. Create Seed Users
  const usersToCreate = [
    {
      name: "Super Admin",
      username: "superadmin",
      email: "superadmin@gihanga.rw",
      passwordHash,
      role: "superadmin",
      isCreator: true,
      verified: true,
      avatarHue: 250,
      bio: "Gihanga Platform Owner & Lead Developer",
      onboarded: true,
      emailVerified: true,
    },
    {
      name: "System Admin",
      username: "admin",
      email: "admin@gihanga.rw",
      passwordHash,
      role: "admin",
      isCreator: false,
      verified: true,
      avatarHue: 205,
      bio: "Gihanga Operations & Admin Lead",
      onboarded: true,
      emailVerified: true,
    },
    {
      name: "Chantal Uwase",
      username: "chantalu",
      email: "moderator@gihanga.rw",
      passwordHash,
      role: "moderator",
      isCreator: true,
      verified: true,
      avatarHue: 186,
      bio: "Trust & Safety Moderator. Food, markets, and late-night city walks.",
      onboarded: true,
      emailVerified: true,
    },
    {
      name: "Aline Mugisha",
      username: "aline",
      email: "aline@gihanga.rw",
      passwordHash,
      role: "user",
      isCreator: true,
      verified: true,
      avatarHue: 205,
      bio: "Storyteller from Kigali. Building things that matter.",
      followersCount: 48200,
      followingCount: 312,
      postsCount: 284,
      onboarded: true,
      emailVerified: true,
    },
    {
      name: "Eric Ndayishimiye",
      username: "ericnd",
      email: "ericnd@gihanga.rw",
      passwordHash,
      role: "user",
      isCreator: false,
      verified: false,
      avatarHue: 235,
      bio: "Documentary filmmaker. Hills & humans.",
      followersCount: 182400,
      followingCount: 421,
      postsCount: 613,
      onboarded: true,
      emailVerified: true,
    },
  ];

  console.log("[Seed] Creating users & wallets...");
  for (const u of usersToCreate) {
    const createdUser = await User.create(u);
    await Wallet.create({
      user: createdUser._id,
      available: u.isCreator ? 1284500 : 50000,
      pending: u.isCreator ? 316200 : 0,
      lifetime: u.isCreator ? 9842000 : 50000,
      kingdomPoints: 1250,
    });
    console.log(`  ✓ Created [${createdUser.role}] @${createdUser.username} (${createdUser.email})`);
  }

  // 2. Create Platform Settings
  console.log("[Seed] Creating platform settings...");
  const defaultSettings = [
    { key: "rewards.points_per_upload", value: 50, category: "rewards", description: "Kingdom Points awarded for a new post upload" },
    { key: "rewards.points_per_like", value: 1, category: "rewards", description: "Kingdom Points awarded per like received" },
    { key: "rewards.points_per_follow", value: 5, category: "rewards", description: "Kingdom Points awarded per new follower" },
    { key: "rewards.points_per_1000_views", value: 10, category: "rewards", description: "Kingdom Points awarded per 1000 reel views" },
    { key: "rewards.points_per_share", value: 3, category: "rewards", description: "Kingdom Points awarded per share" },
    { key: "rewards.points_per_daily_login", value: 10, category: "rewards", description: "Kingdom Points for daily streak" },
    { key: "rewards.points_per_referral", value: 200, category: "rewards", description: "Kingdom Points per successful invite" },
    { key: "rewards.rwf_per_point", value: 0.5, category: "rewards", description: "RWF conversion value per 1 Kingdom Point" },
    { key: "platform.fee_percent", value: 8, category: "limits", description: "Platform revenue share fee on payouts (%)" },
    { key: "features.live_enabled", value: true, category: "features", description: "Global toggle for live streaming feature" },
    { key: "features.gifts_enabled", value: true, category: "features", description: "Global toggle for point gifts during live streams" },
    { key: "features.ads_enabled", value: true, category: "features", description: "Global toggle for creator promotion ads" },
    { key: "momo.sandbox_mode", value: true, category: "momo", description: "MTN Mobile Money sandbox simulation mode" },
    { key: "momo.currency", value: "RWF", category: "momo", description: "Primary currency code" },
  ];

  for (const s of defaultSettings) {
    await Setting.create(s);
  }
  console.log(`  ✓ Created ${defaultSettings.length} default platform settings`);

  // 3. Create Default Moderation Rules
  console.log("[Seed] Creating default moderation rules...");
  const defaultRules = [
    { key: "m1", name: "Auto-hide flagged comments", description: "Hide comments once 5 unique reports land.", enabled: true },
    { key: "m2", name: "Nudity classifier", description: "Route flagged media to human review first.", enabled: true },
    { key: "m3", name: "New-account link limits", description: "Block outbound links for the first 7 days.", enabled: true },
    { key: "m4", name: "Shadow-ban repeat spammers", description: "Reduce reach after two confirmed strikes.", enabled: false },
    { key: "m5", name: "Live stream keyword alerts", description: "Ping moderators on high-risk phrases.", enabled: true },
  ];

  for (const r of defaultRules) {
    await ModerationRule.create(r);
  }
  console.log(`  ✓ Created ${defaultRules.length} moderation rules`);

  console.log("\n=======================================================");
  console.log("SEEDING COMPLETE. Working credentials:");
  console.log("Password for ALL seeded accounts: Gihanga2026!");
  console.log("-------------------------------------------------------");
  console.log("1. Super Admin: superadmin@gihanga.rw (@superadmin)");
  console.log("2. Admin:       admin@gihanga.rw      (@admin)");
  console.log("3. Moderator:   moderator@gihanga.rw  (@chantalu)");
  console.log("4. Creator:     aline@gihanga.rw      (@aline)");
  console.log("5. Regular User: ericnd@gihanga.rw     (@ericnd)");
  console.log("=======================================================\n");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("[Seed Error]:", err);
  process.exit(1);
});
