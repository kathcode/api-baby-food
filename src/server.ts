import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { connectMongo } from "./db/mongo.js";
import { errorHandler } from "./middleware/error.js";
import { notFound } from "./middleware/notFound.js";
import entriesRouter from "./routes/entries.js";
import recipesRouter from "./routes/recipes.js";
import swaggerUi from "swagger-ui-express";
import openapi from "./spec/openapi.json" with { type: "json" };
import mongoose from "mongoose";
import { requireAuth } from '@clerk/express'
import { clerkMiddleware } from '@clerk/express'

export async function createServer() {
  await connectMongo();
  const app = express();

  const WEB_ORIGINS = [
    "https://snugbitesbaby.onrender.com", // UI origin
    "http://localhost:3000", // Local origins
  ];

  const corsOptions: cors.CorsOptions = {
    origin: WEB_ORIGINS,
    credentials: true, // ok even if you don't use cookies
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  };
  
  // CORS
  app.use(cors(corsOptions));
  app.options("*", cors(corsOptions));
  app.use(
    helmet({
      crossOriginResourcePolicy: false, // don't block cross-origin JSON
    })
  );
  
  // CONFIG
  app.use(express.json({ limit: "1mb" }));
  app.use(rateLimit({ windowMs: 60_000, max: 120 })); // 120 req/min per IP

  // CLERK AUTH
  app.use(clerkMiddleware())

  // Public routes
  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.get("/debug/db", (_req, res) => {
    const conn = mongoose.connection;
    res.json({
      host: conn.host,
      name: conn.name,
      readyState: conn.readyState, // 1 = connected
    });
  });

  // Private routes
  app.use("/api/entries", requireAuth(), entriesRouter);
  app.use("/api/recipes", requireAuth(), recipesRouter);
  app.use("/docs", requireAuth(), swaggerUi.serve, swaggerUi.setup(openapi));
  app.get("/openapi.json", requireAuth(), (_req, res) => res.json(openapi));
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
