"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// Import routes
const users_1 = __importDefault(require("./routes/users"));
const items_1 = __importDefault(require("./routes/items"));
const cart_1 = __importDefault(require("./routes/cart"));
const wishlist_1 = __importDefault(require("./routes/wishlist"));
const rentals_1 = __importDefault(require("./routes/rentals"));
const return_1 = __importDefault(require("./routes/return"));
// Import auth middleware
const auth_1 = require("./middleware/auth");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
const PORT = process.env.PORT || 4000;
// basic test route
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", message: "Dress Hub backend up!" });
});
// Register routes
app.use("/api/users", users_1.default);
app.use("/api/items", items_1.default);
app.use("/api/cart", auth_1.authenticate, cart_1.default);
app.use("/api/wishlist", auth_1.authenticate, wishlist_1.default);
app.use("/api/rentals", auth_1.authenticate, rentals_1.default);
app.use("/api/returns", auth_1.authenticate, return_1.default);
// connect to Mongo and start server
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/dress_hub";
mongoose_1.default
    .connect(MONGO_URI)
    .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
        console.log(`Backend listening on port ${PORT}`);
    });
})
    .catch((err) => {
    console.error("MongoDB connection error:", err);
});
//# sourceMappingURL=index.js.map