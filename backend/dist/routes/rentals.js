"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const validate_1 = require("../middleware/validate");
const CartItem_1 = require("../models/CartItem");
const Rental_1 = require("../models/Rental");
const router = express_1.default.Router();
const checkoutSchema = zod_1.z.object({
    body: zod_1.z.object({
        cartItemIds: zod_1.z.array(zod_1.z.string()),
    }),
});
router.post("/checkout", (0, validate_1.validate)(checkoutSchema), async (req, res) => {
    const { cartItemIds } = req.parsed.body;
    const userId = req.userId;
    const cartItems = await CartItem_1.CartItem.find({
        _id: { $in: cartItemIds },
        user: userId,
        checkedOut: false,
    }).populate("item");
    const rentals = [];
    for (const ci of cartItems) {
        const item = ci.item;
        const days = (new Date(ci.rentalEnd).getTime() - new Date(ci.rentalStart).getTime()) /
            (1000 * 60 * 60 * 24);
        const totalPrice = item.dailyPrice * Math.max(days, 1);
        const rental = await Rental_1.Rental.create({
            item: item._id,
            owner: item.owner,
            renter: userId,
            startDate: ci.rentalStart,
            endDate: ci.rentalEnd,
            totalPrice,
            status: "confirmed",
        });
        ci.checkedOut = true;
        await ci.save();
        rentals.push(rental);
    }
    res.status(201).json(rentals);
});
router.get("/", async (req, res) => {
    const userId = req.userId;
    const role = req.query.role;
    const filter = {};
    if (role === "owner")
        filter.owner = userId;
    else
        filter.renter = userId;
    const rentals = await Rental_1.Rental.find(filter).populate("item");
    res.json(rentals);
});
exports.default = router;
//# sourceMappingURL=rentals.js.map