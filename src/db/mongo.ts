import mongoose from "mongoose";
import { logger } from "../logger.js";
import { env } from "../config/env.js";

export async function connectMongo() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.MONGO_URI);
  logger.info("✅ MongoDB connected");
}
