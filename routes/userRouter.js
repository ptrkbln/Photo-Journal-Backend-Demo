import { Router } from "express";
import { User } from "../models/userSchema.js";
import * as user from "../controllers/userController.js";

const userRouter = Router();

userRouter
  .post("/signup", user.registerUser)
  .get("/verify-email/:token", user.verifyUser);
