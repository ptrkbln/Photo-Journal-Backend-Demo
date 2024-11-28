import express from "express";
import connectDB from "./config/dbConnect.js";
import userRouter from "./routes/userRouter.js";
import postRouter from "./routes/postRouter.js";
import cookieParser from "cookie-parser";

connectDB();

const app = express();
app.use(cookieParser());
app.use(express.json());

app.use("/", userRouter);
app.use("/journal", postRouter);

// catch-all handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({ msg: "Endpoint not found" });
});

// General error handler
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ msg: error.message || "Internal server error" });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is listening on port ${process.env.PORT}`);
});
