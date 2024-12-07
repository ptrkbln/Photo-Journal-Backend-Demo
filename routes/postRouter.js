import { Router } from "express";
import * as post from "../controllers/postController.js";
import { authenticate } from "../middleware/jwt.js";

// Create a router instance for handling post-related routes
const postRouter = Router();

// Define routes for post-related operations
postRouter
  .post("/", authenticate, post.createPost) // Route to create a new post, protected by JWT authentication
  .get("/post-history/:postDate", authenticate, post.getPostByDate) // Route to get posts created on a specific date, protected by JWT authentication
  .get("/memories", authenticate, post.getPastPostsOnTodaysDate) // Route to retrieve posts from past years on today's date, protected by JWT authentication
  .get("/post-history", authenticate, post.getAllUserPosts); // Route to fetch all posts by the authenticated user (GET /post-history), requires JWT authentication

export default postRouter;
