"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const validate_1 = require("../middleware/validate");
const WishlistItem_1 = require("../models/WishlistItem");
const router = express_1.default.Router();
const wishlistSchema = zod_1.z.object({
    body: zod_1.z.object({
        itemId: zod_1.z.string(),
    }),
});
router.post("/", (0, validate_1.validate)(wishlistSchema), async (req, res) => {
    const { itemId } = req.parsed.body;
    const userId = req.userId;
    const item = await WishlistItem_1.WishlistItem.findOneAndUpdate({ user: userId, item: itemId }, { user: userId, item: itemId }, { upsert: true, new: true });
    res.status(201).json(item);
});
router.get("/", async (req, res) => {
    const userId = req.userId;
    const items = await WishlistItem_1.WishlistItem.find({ user: userId }).populate("item");
    res.json(items);
});
router.delete("/:itemId", async (req, res) => {
    const userId = req.userId;
    const { itemId } = req.params;
    await WishlistItem_1.WishlistItem.findOneAndDelete({ user: userId, item: itemId });
    res.status(204).send();
});
exports.default = router;
//# sourceMappingURL=wishlist.js.map