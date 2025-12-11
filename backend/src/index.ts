import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// Import routes
import usersRouter from "./routes/users";
import itemsRouter from "./routes/items";
import cartRouter from "./routes/cart";
import wishlistRouter from "./routes/wishlist";
import rentalsRouter from "./routes/rentals";
import returnRouter from "./routes/return";

// Import auth middleware
import { authenticate } from "./middleware/auth";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:4173",
      "http://127.0.0.1:4173",
    ],
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

const PORT = process.env.PORT || 4000;

// basic test route
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Dress Hub backend up!" });
});

// Register routes
app.use("/api/users", usersRouter);
app.use("/api/items", itemsRouter);
app.use("/api/cart", authenticate, cartRouter);
app.use("/api/wishlist", authenticate, wishlistRouter);
app.use("/api/rentals", authenticate, rentalsRouter);
app.use("/api/returns", authenticate, returnRouter);

// connect to Mongo and start server
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/dress_hub";

mongoose
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