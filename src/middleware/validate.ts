import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

export const validateBody =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "ValidationError", details: parsed.error.flatten() });
    }
    req.body = parsed.data;
    next();
  };
