import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// basic test route
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Dress Hub backend up!" });
});

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