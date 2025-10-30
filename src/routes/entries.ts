import { Router } from "express";
import { Entry } from "../models/Entry.js";
import { validateBody } from "../middleware/validate.js";
import {
  EntryCreateSchema,
  EntryUpdateSchema,
  EntryQuerySchema,
} from "../schemas/entry.js";

const router = Router();

router.get("/", async (req, res) => {
  const parsed = EntryQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "BadQuery", details: parsed.error.flatten() });
  }
  const { limit, offset, sort, dateFrom, dateTo } = parsed.data;

  const filter: any = {};
  if (dateFrom || dateTo) filter.date = {};
  if (dateFrom) filter.date.$gte = dateFrom;
  if (dateTo) filter.date.$lte = dateTo;

  let sortSpec: any = { date: -1 };
  if (sort === "oldest") sortSpec = { date: 1 };
  if (sort === "rating_desc") sortSpec = { rating: -1, date: -1 };
  if (sort === "rating_asc") sortSpec = { rating: 1, date: -1 };

  const [items, total] = await Promise.all([
    Entry.find(filter).sort(sortSpec).skip(offset).limit(limit).lean(),
    Entry.countDocuments(filter),
  ]);

  res.json({ items, total, limit, offset });
});

router.get("/:id", async (req, res) => {
  const item = await Entry.findById(req.params.id).lean();
  if (!item) return res.status(404).json({ error: "NotFound" });
  res.json(item);
});

router.post("/", validateBody(EntryCreateSchema), async (req, res) => {
  const created = await Entry.create(req.body);
  res.status(201).json(created);
});

router.put("/:id", validateBody(EntryUpdateSchema), async (req, res) => {
  const updated = await Entry.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  }).lean();
  if (!updated) return res.status(404).json({ error: "NotFound" });
  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  const deleted = await Entry.findByIdAndDelete(req.params.id).lean();
  if (!deleted) return res.status(404).json({ error: "NotFound" });
  res.json({ ok: true });
});

export default router;
