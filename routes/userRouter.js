import { Router } from "express";
import * as user from "../controllers/userController.js";
import { authenticate } from "../middleware/jwt.js";

const userRouter = Router();

userRouter
  .post("/signup", user.registerUser)
  .get("/email-verification/:token", user.verifyUser)
  .post("/login", user.loginUser)
  .delete("/delete-profile", authenticate, user.deleteUser);

export default userRouter;
