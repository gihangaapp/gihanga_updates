import mongoose from "mongoose";

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/gihanga-updates";
  try {
    await mongoose.connect(uri);
    console.log(`[Database] Connected to MongoDB database: ${mongoose.connection.name || "configured database"}`);
  } catch (error) {
    const message = error instanceof Error
      ? error.message.replace(/mongodb(?:\+srv)?:\/\/[^\s'"]+/gi, "[redacted MongoDB URI]")
      : "Unknown connection error";
    console.error("[Database] Connection failed:", message);
    process.exit(1);
  }
}
