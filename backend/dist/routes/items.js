"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const validate_1 = require("../middleware/validate");
const Item_1 = require("../models/Item");
const router = express_1.default.Router();
const searchItemsSchema = zod_1.z.object({
    query: zod_1.z.object({
        query: zod_1.z.string().optional(),
        category: zod_1.z.string().optional(),
        size: zod_1.z.string().optional(),
        genderTarget: zod_1.z.string().optional(),
        minPrice: zod_1.z.string().optional(),
        maxPrice: zod_1.z.string().optional(),
    }),
});
router.get("/", (0, validate_1.validate)(searchItemsSchema), async (req, res) => {
    const { query, category, size, genderTarget, minPrice, maxPrice } = req.parsed.query;
    const q = { available: true };
    if (query) {
        q.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
        ];
    }
    if (category)
        q.category = category;
    if (size)
        q.size = size;
    if (genderTarget)
        q.genderTarget = genderTarget;
    if (minPrice || maxPrice) {
        q.dailyPrice = {};
        if (minPrice)
            q.dailyPrice.$gte = Number(minPrice);
        if (maxPrice)
            q.dailyPrice.$lte = Number(maxPrice);
    }
    const items = await Item_1.Item.find(q).limit(50);
    res.json(items);
});
// Get single item by ID
router.get("/:id", async (req, res) => {
    try {
        const item = await Item_1.Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ error: "Item not found" });
        }
        res.json(item);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch item" });
    }
});
exports.default = router;
//# sourceMappingURL=items.js.map