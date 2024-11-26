import express from "express";
import connectDB from "../unterricht-21/backend/config/dbConnect.js";

connectDB();

const app = express();
app.use(express.json({ limit: "10mb" })); // TODO does this work?

// catch-all handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({ msg: "Route not found" });
});

// General error handler
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ err: error.message || "Internal server error" });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is listening on port ${process.env.PORT}`);
});
