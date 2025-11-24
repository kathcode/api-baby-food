import { Router } from "express";
import { z } from "zod";
import { Recipe } from "../models/Recipe.js";
import { Entry } from "../models/Entry.js";
import { validateBody } from "../middleware/validate.js";
import {
  RecipeCreateSchema,
  RecipeUpdateSchema,
  RecipeQuerySchema,
} from "../schemas/recipe.js";
import { getAuth } from "@clerk/express";

const NewEntryFromRecipeSchema = z
  .object({
    date: z.coerce.date(),
    typeOfMeal: z.enum(["Breakfast", "Lunch", "Dinner", "Snack"]),
    rating: z.number().int().min(1).max(5),
    reaction: z.string().max(500).optional(),
    amount: z.number().nonnegative().optional(),
    amountUnit: z.enum(["ml", "g", "tbsp", "unit"]).optional(),
  })
  .refine((v) => v.amount === undefined || v.amountUnit !== undefined, {
    message: "amountUnit is required when amount is provided",
    path: ["amountUnit"],
  });

const router = Router();

router.get("/", async (req, res) => {
  const { userId } = getAuth(req);
  const parsed = RecipeQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "BadQuery", details: parsed.error.flatten() });
  }

  const { q, limit, offset } = parsed.data;
  const filter: any = { userId };
  if (q) filter.$text = { $search: q };

  const [items, total] = await Promise.all([
    Recipe.find(filter)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean(),
    Recipe.countDocuments(filter),
  ]);

  res.json({ items, total, limit, offset });
});

router.get("/:id", async (req, res) => {
  const { userId } = getAuth(req);
  const filter: any = { id: req.params.id, userId };
  const recipe = await Recipe.findById(filter).lean();
  if (!recipe) return res.status(404).json({ error: "NotFound" });
  res.json(recipe);
});

router.post("/", validateBody(RecipeCreateSchema), async (req, res) => {
  const payload = req.body;
  const { userId } = getAuth(req);
  const created = await Recipe.create({ ...payload, userId });
  res.status(201).json(created);
});

router.put("/:id", validateBody(RecipeUpdateSchema), async (req, res) => {
  const { userId } = getAuth(req);
  const filter: any = { id: req.params.id, userId };
  const updated = await Recipe.findByIdAndUpdate(filter, req.body, {
    new: true,
  }).lean();
  if (!updated) return res.status(404).json({ error: "NotFound" });
  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  const { userId } = getAuth(req);
  const filter: any = { id: req.params.id, userId };
  const deleted = await Recipe.findByIdAndDelete(filter).lean();
  if (!deleted) return res.status(404).json({ error: "NotFound" });
  res.json({ ok: true });
});

// Create entry from a recipe
router.post("/:id/use", async (req, res) => {
  const { userId } = getAuth(req);
  const filter: any = { id: req.params.id, userId };
  const recipe = await Recipe.findById(filter).lean();
  if (!recipe) return res.status(404).json({ error: "RecipeNotFound" });

  const parsed = NewEntryFromRecipeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "ValidationError", details: parsed.error.flatten() });
  }

  const entry = await Entry.create({
    date: parsed.data.date,
    items: recipe.items,
    typeOfMeal: parsed.data.typeOfMeal,
    amount: parsed.data.amount,
    amountUnit: parsed.data.amountUnit,
    reaction: parsed.data.reaction,
    rating: parsed.data.rating,
    userId,
  });

  res.status(201).json(entry);
});

export default router;
