import express from "express";
import connectDB from "../unterricht-21/backend/config/dbConnect.js";

connectDB();

const app = express();
app.use(express.json());

// General error handler
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is listening on port ${process.env.PORT}`);
});
