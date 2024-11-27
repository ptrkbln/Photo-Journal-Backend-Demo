import { Post } from "../models/postSchema.js";
import { User } from "../models/userSchema.js";
import upload from "../config/cloudinary.js";

export const createPost = [
  upload.single("dailyPhoto"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "File is required or too large" });
      }

      console.log("Received request for profile picture upload:", req.file);

      const user = await User.findById(req.user.userId); // from authentication middleware: req.user = { userId: user._id }

      const { caption } = req.body; // caption that comes with the picture from form in frontend
      const imageUrl = req.file.path; // cloudinary URL

      const dateToday = req.file.public_id; // we set the public_id in the cloudinary config to today's date (YYYY-MM-DD)

      // if a post from today (with today's date) already exists -> delete it and then create the new one
      const alreadyPostedToday = await Post.findOne({ postDate: dateToday });

      if (alreadyPostedToday) {
        await alreadyPostedToday.remove();
      }

      // save image + caption to database
      const newPost = await Post.create({
        dailyPhoto: imageUrl,
        dailyCaption: caption,
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

    // find the post with this date and make sure it belongs to the logged-in user's album
    const post = Post.findOne({ postDate, _id: { $in: user.album } });

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
    const dateOnly = fullDate.toISOString().split("T")[0];

    const dateYear = `${dateOnly.split("-")[0]}`;
    const dateMonthDay = `${dateOnly.split("-")[1]}-${dateOnly.split("-")[2]}`;

    // Find posts where postDate ends with `MM-DD` but does not start with the current year
    const pastPosts = await Post.find({
      postDate: {
        $regex: new RegExp(`^((?!${year}).)*-${dateMonthDay}$`),
        _id: { $in: user.album },
      },
    });

    if (pastPosts.length === 0)
      return res
        .status(404)
        .json({ msg: "No posts found on today's date from past years" });

    res.status(200).json(pastPosts);
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
