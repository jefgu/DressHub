"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const validate_1 = require("../middleware/validate");
const ReturnRequest_1 = require("../models/ReturnRequest");
const Rental_1 = require("../models/Rental");
const router = express_1.default.Router();
const createReturnSchema = zod_1.z.object({
    body: zod_1.z.object({
        rentalId: zod_1.z.string(),
    }),
});
router.post("/", (0, validate_1.validate)(createReturnSchema), async (req, res) => {
    const { rentalId } = req.parsed.body;
    const userId = req.userId;
    const rental = await Rental_1.Rental.findById(rentalId);
    if (!rental)
        return res.status(404).json({ message: "Rental not found" });
    if (String(rental.renter) !== userId)
        return res.status(403).json({ message: "Not renter" });
    const rr = await ReturnRequest_1.ReturnRequest.create({
        rental: rentalId,
        renter: rental.renter,
        owner: rental.owner,
    });
    res.status(201).json(rr);
});
const updateReturnSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(["initiated", "in_transit", "received", "issue_reported"]),
    }),
});
router.put("/:id", (0, validate_1.validate)(updateReturnSchema), async (req, res) => {
    const { id } = req.params;
    const { status } = req.parsed.body;
    const userId = req.userId;
    const rr = await ReturnRequest_1.ReturnRequest.findById(id);
    if (!rr)
        return res.status(404).json({ message: "Return not found" });
    // You can add logic: only renter can set to in_transit; owner to received, etc.
    rr.status = status;
    await rr.save();
    if (status === "received") {
        await Rental_1.Rental.findByIdAndUpdate(rr.rental, { status: "returned" });
    }
    res.json(rr);
});
router.get("/", async (req, res) => {
    const userId = req.userId;
    const role = req.query.role;
    const filter = {};
    if (role === "owner")
        filter.owner = userId;
    else
        filter.renter = userId;
    const returns = await ReturnRequest_1.ReturnRequest.find(filter).populate("rental");
    res.json(returns);
});
exports.default = router;
//# sourceMappingURL=return.js.map