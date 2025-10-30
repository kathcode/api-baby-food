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

const EntrySchema = new Schema(
  {
    date: { type: Date, required: true, index: true },
    items: { type: [FoodItemSchema], required: true },
    typeOfMeal: {
      type: String,
      enum: ["Breakfast", "Lunch", "Dinner", "Snack"],
      required: true,
      index: true,
    },
    amount: { type: Number },
    amountUnit: { type: String, enum: ["ml", "g", "tbsp", "unit"] },
    reaction: { type: String },
    rating: { type: Number, min: 1, max: 5, required: true, index: true },
  },
  { timestamps: true }
);

EntrySchema.index({ createdAt: -1 });

export type EntryDoc = {
  _id: Types.ObjectId;
} & Omit<InstanceType<any>, never>;

export const Entry = model("Entry", EntrySchema);
