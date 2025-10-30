import { NextFunction, Request, Response } from "express";
import { logger } from "../logger";

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error({ err }, "Unhandled error");
  res.status(500).json({ error: "InternalServerError" });
}
