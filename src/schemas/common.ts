import { z } from "zod";

export const FoodType = z.enum([
  "Fruit",
  "Carbohydrates",
  "Protein",
  "Vegetables",
]);
export const AmountUnit = z.enum(["ml", "g", "tbsp", "unit"]);
export const MealType = z.enum(["Breakfast", "Lunch", "Dinner", "Snack"]);

export const FoodItem = z
  .object({
    name: z.string().min(1).max(100),
    type: FoodType,
    amount: z.number().nonnegative().optional(),
    amountUnit: AmountUnit.optional(),
  })
  .refine((v) => v.amount === undefined || v.amountUnit !== undefined, {
    message: "amountUnit is required when amount is provided",
    path: ["amountUnit"],
  });
