import { Router } from "express";
import * as user from "../controllers/userController.js";
import { authenticate } from "../middleware/jwt.js";

// Create a router instance for handling user-related routes
const userRouter = Router();

// Define routes for user-related operations
userRouter
  .post("/signup", user.registerUser) // Route for user registration (POST /signup)
  .get("/email-verification/:token", user.verifyUser) // Route for email verification using a token (GET /email-verification/:token)
  .post("/login", user.loginUser) // Route for user login (POST /login)
  .delete("/delete-profile", authenticate, user.deleteUser); // Route for deleting a user profile, protected by JWT authentication (DELETE /delete-profile)

export default userRouter;
