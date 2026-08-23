import mongoose from "mongoose";

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/gihanga-updates";
  try {
    await mongoose.connect(uri);
    console.log(`[Database] Connected to MongoDB at ${uri}`);
  } catch (error) {
    console.error("[Database] Connection failed:", error);
    process.exit(1);
  }
}
