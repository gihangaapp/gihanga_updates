import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db";
import { User, Wallet } from "../models";

/**
 * Standalone creator/user seeder.
 *
 * Unlike src/scripts/seed.ts (which wipes and rebuilds the whole database),
 * this script is safe to run on a fresh OR existing database: it only
 * creates the accounts listed below, skipping any that already exist
 * (matched by username/email), so it never duplicates or deletes data.
 *
 * Run with: npm run seed:users
 *
 * Purpose: guarantees at least 5 "role: user" accounts with isCreator: true
 * exist so the "/users/top-creators" endpoint has enough people to return
 * during onboarding (Step 4 of registration — "Follow at least 5 creators").
 */

const DEFAULT_PASSWORD = "Gihanga2026!";

interface SeedCreator {
  name: string;
  username: string;
  email: string;
  role: "user";
  isCreator: boolean;
  verified: boolean;
  avatarHue: number;
  bio: string;
  interests: string[];
  followersCount: number;
  followingCount: number;
  postsCount: number;
}

const creatorsToSeed: SeedCreator[] = [
  {
    name: "Aline Mugisha",
    username: "aline",
    email: "aline@gihanga.rw",
    role: "user",
    isCreator: true,
    verified: true,
    avatarHue: 205,
    bio: "Storyteller from Kigali. Building things that matter.",
    interests: ["Photography", "Writing", "Travel"],
    followersCount: 48200,
    followingCount: 312,
    postsCount: 284,
  },
  {
    name: "Eric Ndayishimiye",
    username: "ericnd",
    email: "ericnd@gihanga.rw",
    role: "user",
    isCreator: true,
    verified: false,
    avatarHue: 235,
    bio: "Documentary filmmaker. Hills & humans.",
    interests: ["Film", "Photography", "Travel"],
    followersCount: 182400,
    followingCount: 421,
    postsCount: 613,
  },
  {
    name: "Diane Umutoni",
    username: "dianeu",
    email: "diane@gihanga.rw",
    role: "user",
    isCreator: true,
    verified: true,
    avatarHue: 320,
    bio: "Fashion & design creator. Kigali streets, bold colors.",
    interests: ["Fashion", "Design", "Art"],
    followersCount: 96500,
    followingCount: 198,
    postsCount: 402,
  },
  {
    name: "Patrick Habimana",
    username: "patrickh",
    email: "patrick@gihanga.rw",
    role: "user",
    isCreator: true,
    verified: true,
    avatarHue: 30,
    bio: "Music producer & DJ. New beats every Friday.",
    interests: ["Music", "Dance", "Comedy"],
    followersCount: 134800,
    followingCount: 256,
    postsCount: 519,
  },
  {
    name: "Grace Ingabire",
    username: "graceing",
    email: "grace@gihanga.rw",
    role: "user",
    isCreator: true,
    verified: false,
    avatarHue: 160,
    bio: "Illustrator & visual artist. Comics inspired by Rwandan folklore.",
    interests: ["Illustration", "Design", "Art"],
    followersCount: 61200,
    followingCount: 143,
    postsCount: 227,
  },
  {
    name: "Emmanuel Bizimana",
    username: "manub",
    email: "emmanuel@gihanga.rw",
    role: "user",
    isCreator: true,
    verified: true,
    avatarHue: 275,
    bio: "Food vlogger. Rwandan cuisine, one dish at a time.",
    interests: ["Food", "Comedy", "Travel"],
    followersCount: 78900,
    followingCount: 210,
    postsCount: 331,
  },
];

async function seedUsers() {
  await connectDB();

  console.log("[SeedUsers] Hashing default password...");
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12);

  let created = 0;
  let skipped = 0;

  for (const c of creatorsToSeed) {
    const existing = await User.findOne({
      $or: [{ username: c.username }, { email: c.email }],
    });

    if (existing) {
      console.log(`  - Skipped (already exists): @${c.username}`);
      skipped++;
      continue;
    }

    const createdUser = await User.create({
      ...c,
      passwordHash,
      onboarded: true,
      emailVerified: true,
    });

    await Wallet.create({
      user: createdUser._id,
      available: 50000,
      pending: 0,
      lifetime: 50000,
      kingdomPoints: 250,
    });

    console.log(`  ✓ Created creator @${createdUser.username} (${createdUser.email})`);
    created++;
  }

  console.log("\n=======================================================");
  console.log("SEED USERS COMPLETE.");
  console.log(`Created: ${created}  |  Skipped (already existed): ${skipped}`);
  console.log(`Password for any newly created accounts: ${DEFAULT_PASSWORD}`);
  console.log("=======================================================\n");

  await mongoose.disconnect();
  process.exit(0);
}

seedUsers().catch((err) => {
  console.error("[SeedUsers Error]:", err);
  process.exit(1);
});
