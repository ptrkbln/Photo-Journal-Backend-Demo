import { Router } from "express";
import * as post from "../controllers/postController.js";
import { authenticate } from "../middleware/jwt.js";

const postRouter = Router();

postRouter
  .post("/", authenticate, post.createPost)
  .get("/past-posts", authenticate, post.getPostByDate)
  .get("/memories", authenticate, post.getPastPostsOnTodaysDate)
  .get("/post-history", authenticate, post.getAllUserPosts);

export default postRouter;
