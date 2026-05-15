import mongoose from "mongoose";
import { logger } from "./logger";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is required");
}

let isConnected = false;

export async function connectMongoDB() {
  if (isConnected) return;
  try {
    await mongoose.connect(MONGODB_URI!);
    isConnected = true;
    logger.info("MongoDB connected");
  } catch (err) {
    logger.error({ err }, "MongoDB connection error");
    process.exit(1);
  }
}
