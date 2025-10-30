// src/schemas/recipe.ts
import { z } from "zod";

// If you have FoodItem elsewhere, you can import it.
// To keep it self-contained, define it here too:
export const FoodItemSchema = z
  .object({
    name: z.string().min(1).max(100),
    type: z.enum(["Fruit", "Carbohydrates", "Protein", "Vegetables"]),
    amount: z.number().nonnegative().optional(),
    amountUnit: z.enum(["ml", "g", "tbsp", "unit"]).optional(),
  })
  .refine((v) => v.amount === undefined || v.amountUnit !== undefined, {
    message: "amountUnit is required when amount is provided",
    path: ["amountUnit"],
  });

export const RecipeCreateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  items: z.array(FoodItemSchema).min(1),
});

export const RecipeUpdateSchema = RecipeCreateSchema.partial();

export const RecipeQuerySchema = z.object({
  q: z.string().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

// (Optional) export TS types if you want
export type RecipeCreate = z.infer<typeof RecipeCreateSchema>;
export type RecipeUpdate = z.infer<typeof RecipeUpdateSchema>;
export type RecipeQuery = z.infer<typeof RecipeQuerySchema>;
