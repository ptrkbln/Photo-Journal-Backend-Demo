import { Router } from "express";
import * as user from "../controllers/userController.js";

const userRouter = Router();

userRouter
  .post("/signup", user.registerUser)
  .get("/email-verification/:token", user.verifyUser)
  .post("/login", user.loginUser);

// authenticate as middleware comes later on with routes that are accessible only to a specific user

export default userRouter;
