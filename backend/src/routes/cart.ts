import express from "express";
import { z } from "zod";
import { validate } from "../middleware/validate";
import { CartItem } from "../models/CartItem";
import { Item } from "../models/Item";
// assume you have auth middleware that sets req.userId

const router = express.Router();

const addToCartSchema = z.object({
  body: z.object({
    itemId: z.string(),
    rentalStart: z.string(), // ISO date
    rentalEnd: z.string(),
  }),
});

router.post("/", validate(addToCartSchema), async (req, res) => {
  const { itemId, rentalStart, rentalEnd } = (req as any).parsed.body;
  const userId = (req as any).userId;

  const item = await Item.findById(itemId);
  if (!item) return res.status(404).json({ message: "Item not found" });

  const cartItem = await CartItem.create({
    user: userId,
    item: itemId,
    rentalStart,
    rentalEnd,
  });

  res.status(201).json(cartItem);
});

router.get("/", async (req, res) => {
  const userId = (req as any).userId;
  const cartItems = await CartItem.find({ user: userId, checkedOut: false })
    .populate("item");
  res.json(cartItems);
});

router.delete("/:cartItemId", async (req, res) => {
  const userId = (req as any).userId;
  const { cartItemId } = req.params;
  
  const cartItem = await CartItem.findOneAndDelete({ 
    _id: cartItemId, 
    user: userId,
    checkedOut: false 
  });
  
  if (!cartItem) {
    return res.status(404).json({ error: "Cart item not found" });
  }
  
  res.status(204).send();
});

export default router;
