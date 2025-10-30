import { z } from "zod";

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

const EntryBaseSchema = z
  .object({
    date: z.coerce.date(),
    items: z.array(FoodItemSchema).min(1),
    typeOfMeal: z.enum(["Breakfast", "Lunch", "Dinner", "Snack"]),
    amount: z.number().nonnegative().optional(),
    amountUnit: z.enum(["ml", "g", "tbsp", "unit"]).optional(),
    reaction: z.string().max(500).optional(),
    rating: z.number().int().min(1).max(5),
  })
  .refine((v) => v.amount === undefined || v.amountUnit !== undefined, {
    message: "amountUnit is required when amount is provided",
    path: ["amountUnit"],
  });

export const EntryCreateSchema = EntryBaseSchema;
export const EntryUpdateSchema = EntryBaseSchema;

export const EntryQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  sort: z
    .enum(["newest", "oldest", "rating_desc", "rating_asc"])
    .default("newest"),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});
