import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import { env } from "./config/env.js";
import { connectMongo } from "./db/mongo.js";
import { errorHandler } from "./middleware/error.js";
import { notFound } from "./middleware/notFound.js";
import entriesRouter from "./routes/entries.js";
import recipesRouter from "./routes/recipes.js";
import { logger } from "../src/logger.js";
import swaggerUi from "swagger-ui-express";
import openapi from "./spec/openapi.json" with { type: "json" };
import mongoose from "mongoose";

export async function createServer() {
  await connectMongo();
  const app = express();
  
  app.get("/debug/db", (_req, res) => {
    const conn = mongoose.connection;
    res.json({
      host: conn.host,
      name: conn.name,
      readyState: conn.readyState, // 1 = connected
    });
  });

  app.use(pinoHttp({ logger }));
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: "1mb" }));

  app.use(rateLimit({ windowMs: 60_000, max: 120 })); // 120 req/min per IP

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/api/entries", entriesRouter);
  app.use("/api/recipes", recipesRouter);

  app.use(notFound);
  app.use(errorHandler);

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));
  app.get("/openapi.json", (_req, res) => res.json(openapi));

  return app;
}
