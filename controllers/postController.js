import { Post } from "../models/postSchema.js";
import { User } from "../models/userSchema.js";
import upload from "../config/cloudinary.js";
import { captionValidator } from "../helpers/validateCaption.js";

export const createPost = [
  upload.single("dailyPhoto"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "File is required or too large" });
      }

      // console.log("Received request for profile picture upload:", req.file);

      const user = await User.findById(req.user.userId); // from authentication middleware: req.user = { userId: user._id }

      const { dailyCaption } = req.body; // caption that comes with the picture from form in frontend
      if (!captionValidator(dailyCaption))
        return res.status(400).json({ msg: "Invalid caption" });
      const imageUrl = req.file.path; // cloudinary URL

      const fullDate = new Date(); // Current date
      const dateToday = fullDate.toISOString().split("T")[0]; // YYYY-MM-DD

      // if a post from today (with today's date) already exists -> delete it and then create the new one
      const alreadyPostedToday = await Post.findOne({ postDate: dateToday });

      if (alreadyPostedToday) {
        await alreadyPostedToday.remove();
      }

      // save image + caption to database
      const newPost = await Post.create({
        dailyPhoto: imageUrl,
        dailyCaption,
        postDate: dateToday, // === req.file.public_id
      });

      // add post (_id) to the user's album (1-m relationship)
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

export const getPostByDate = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId); // from authentication middleware: req.user = { userId: user._id }

    const { postDate } = req.body; // date provided by the client
    if (!postDate) return res.status(400).json({ msg: "Please select a date" });

    // find the post with this date and make sure it belongs to the logged-in user's album
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

export const getPastPostsOnTodaysDate = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId); // from authentication middleware: req.user = { userId: user._id }

    const fullDate = new Date(); // eg. Wed Nov 27 2024 15:45:30 GMT+0100 (Central European Standard Time)
    const dateOnly = fullDate.toISOString().split("T")[0]; // YYYY-MM-DD

    const dateYear = `${dateOnly.split("-")[0]}`; // YYYY
    const dateMonthDay = `${dateOnly.split("-")[1]}-${dateOnly.split("-")[2]}`; // MM-DD

    const pastPosts = await Post.find({
      _id: { $in: user.album }, // find all posts from the user first
    });

    // To users posts apply the regex condition separately to the postDate field
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

export const getAllUserPosts = async (req, res, next) => {
  try {
    const user = await User.findOne(req.user.userId);

    const allUserPosts = await Post.find({ _id: { $in: user.album } });

    if (allUserPosts.length === 0)
      return res.status(404).json({ msg: "No posts found from this user" });

    return res.status(200).json(allUserPosts);
  } catch (error) {
    next(error);
  }
};
