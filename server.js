import express from "express";
import connectDB from "./config/dbConnect.js";
import userRouter from "./routes/userRouter.js";
import postRouter from "./routes/postRouter.js";
import cookieParser from "cookie-parser";

// Establish a connection to the MongoDB database
connectDB();

const app = express();
// Middleware to parse cookies and JSON payloads
app.use(cookieParser());
app.use(express.json());

// Route handlers
app.use("/", userRouter); // Routes related to user management
app.use("/journal", postRouter); // Routes related to journal posts

// catch-all handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({ msg: "Endpoint not found" });
});

// General error handler for unexpected errors
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ msg: error.message || "Internal server error" });
});

// Start the server on the specified port
app.listen(process.env.PORT, () => {
  console.log(`Server is listening on port ${process.env.PORT}`);
});
