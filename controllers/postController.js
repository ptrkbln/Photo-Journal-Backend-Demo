import { Post } from "../models/postSchema.js";
import { User } from "../models/userSchema.js";
import upload from "../config/cloudinary.js";
import { captionValidator } from "../helpers/validateCaption.js";

// Create a daily post (image and caption)
// Replaces any existing post with today's date
export const createPost = [
  upload.single("dailyPhoto"), // Middleware to handle image upload
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "File is required or too large" });
      }

      const user = await User.findById(req.user.userId); // Get user from authentication middleware: req.user = { userId: user._id }

      const { dailyCaption } = req.body;
      if (!captionValidator(dailyCaption))
        return res.status(400).json({ msg: "Invalid caption" });
      const imageUrl = req.file.path; // cloudinary URL for the uploaded image

      const fullDate = new Date();
      const dateToday = fullDate.toISOString().split("T")[0]; // Format: YYYY-MM-DD

      // Check for an existing post with today's date, and remove it if found
      const alreadyPostedToday = await Post.findOne({ postDate: dateToday });

      if (alreadyPostedToday) {
        await alreadyPostedToday.remove();
      }

      // Create and save the new post
      const newPost = await Post.create({
        dailyPhoto: imageUrl,
        dailyCaption,
        postDate: dateToday, // === req.file.public_id
      });

      // Add the new post's ID to the user's album (1-n relationship)
      user.album.push(newPost._id);
      await user.save();

      res
        .status(201)
        .json({ msg: "Daily post uploaded successfully", post: newPost });
    } catch (error) {
      next(error);
    }
  },
];

// Retrieve a specific post by date
export const getPostByDate = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    const { postDate } = req.params;
    if (!postDate)
      return res.status(400).json({ msg: "Please select a date." });

    // Ensure the post belongs to the user's album
    const post = await Post.findOne({ postDate, _id: { $in: user.album } });

    if (!post)
      return res
        .status(404)
        .json({ msg: "User's post with the selected date not found" });
    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
};

// Fetch posts from previous years on today's date
export const getPastPostsOnTodaysDate = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    const fullDate = new Date();
    const dateOnly = fullDate.toISOString().split("T")[0]; // Format: YYYY-MM-DD

    const dateYear = `${dateOnly.split("-")[0]}`; // Current year
    const dateMonthDay = `${dateOnly.split("-")[1]}-${dateOnly.split("-")[2]}`; // MM-DD

    const pastPosts = await Post.find({
      _id: { $in: user.album }, // User's posts
    });

    // Filter posts for today's date (month, day) across other years
    const filteredPosts = pastPosts.filter((post) => {
      return post.postDate.match(
        new RegExp(`^((?!${dateYear}).)*-${dateMonthDay}$`)
      );
    });

    if (filteredPosts.length === 0)
      return res
        .status(404)
        .json({ msg: "No posts found on today's date from past years" });

    res.status(200).json(filteredPosts);
  } catch (error) {
    next(error);
  }
};

// Fetch all posts from the logged-in user
export const getAllUserPosts = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    const allUserPosts = await Post.find({ _id: { $in: user.album } });

    if (allUserPosts.length === 0)
      return res.status(404).json({ msg: "No posts found from this user" });

    return res.status(200).json(allUserPosts);
  } catch (error) {
    next(error);
  }
};
