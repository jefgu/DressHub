import express from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { Item } from "../models/Item";

const router = express.Router();

const createItemSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    category: z.string().optional(),
    size: z.string().optional(),
    genderTarget: z.string().optional(),
    dailyPrice: z.number().positive(),
    depositAmount: z.number().nonnegative().optional(),
    condition: z.string().optional(),
    available: z.boolean().optional(),
    images: z.array(z.string()).optional(),
  }),
});

const searchItemsSchema = z.object({
  query: z.object({
    query: z.string().optional(),
    category: z.string().optional(),
    size: z.string().optional(),
    genderTarget: z.string().optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
  }),
});

router.post("/", authenticate, validate(createItemSchema), async (req, res) => {
  try {
    const userId = (req as any).userId;
    const newItem = await Item.create({
      ...((req as any).parsed.body as any),
      owner: userId,
    });
    res.status(201).json(newItem);
  } catch (error) {
    console.error("Failed to create item:", error);
    res.status(500).json({ error: "Failed to create item" });
  }
});

router.get("/", validate(searchItemsSchema), async (req, res) => {
  const { query, category, size, genderTarget, minPrice, maxPrice } = (req as any).parsed.query;

  const q: any = {};

  if (query) {
    q.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }
  if (category) q.category = category;
  if (size) q.size = size;
  if (genderTarget) q.genderTarget = genderTarget;

  if (minPrice || maxPrice) {
    q.dailyPrice = {};
    if (minPrice) q.dailyPrice.$gte = Number(minPrice);
    if (maxPrice) q.dailyPrice.$lte = Number(maxPrice);
  }

  const items = await Item.find(q).limit(50);
  res.json(items);
});

// Get single item by ID
router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch item" });
  }
});

export default router;
