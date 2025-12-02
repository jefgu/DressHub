"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const validate_1 = require("../middleware/validate");
const CartItem_1 = require("../models/CartItem");
const Item_1 = require("../models/Item");
// assume you have auth middleware that sets req.userId
const router = express_1.default.Router();
const addToCartSchema = zod_1.z.object({
    body: zod_1.z.object({
        itemId: zod_1.z.string(),
        rentalStart: zod_1.z.string(), // ISO date
        rentalEnd: zod_1.z.string(),
    }),
});
router.post("/", (0, validate_1.validate)(addToCartSchema), async (req, res) => {
    const { itemId, rentalStart, rentalEnd } = req.parsed.body;
    const userId = req.userId;
    const item = await Item_1.Item.findById(itemId);
    if (!item)
        return res.status(404).json({ message: "Item not found" });
    const cartItem = await CartItem_1.CartItem.create({
        user: userId,
        item: itemId,
        rentalStart,
        rentalEnd,
    });
    res.status(201).json(cartItem);
});
router.get("/", async (req, res) => {
    const userId = req.userId;
    const cartItems = await CartItem_1.CartItem.find({ user: userId, checkedOut: false })
        .populate("item");
    res.json(cartItems);
});
exports.default = router;
//# sourceMappingURL=cart.js.map