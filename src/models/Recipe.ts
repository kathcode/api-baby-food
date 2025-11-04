import { Schema, model, Types } from "mongoose";

const FoodItemSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["Fruit", "Carbohydrates", "Protein", "Vegetables"],
      required: true,
    },
    amount: { type: Number },
    amountUnit: { type: String, enum: ["ml", "g", "tbsp", "unit"] },
  },
  { _id: false }
);

const RecipeSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true, index: "text" },
    description: { type: String },
    items: { type: [FoodItemSchema], required: true },
  },
  { timestamps: true }
);

RecipeSchema.index({ createdAt: -1 });

export type RecipeDoc = {
  _id: Types.ObjectId;
} & Omit<InstanceType<any>, never>;

export const Recipe = model("Recipe", RecipeSchema);
