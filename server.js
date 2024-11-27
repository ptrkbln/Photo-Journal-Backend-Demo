import express from "express";
import connectDB from "../unterricht-21/backend/config/dbConnect.js";
import userRouter from "./routes/userRouter.js";
import postRouter from "./routes/postRouter.js";

connectDB();

const app = express();
app.use(express.json());

app.use("/", userRouter);
app.use("/journal", postRouter);

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
