import { Post } from "../models/postSchema.js";
import { User } from "../models/userSchema.js";

export const createPost = [
  upload.single("dailyPhoto"),
  async (req, res, next) => {
    try {
      console.log("Received request for profile picture upload:", req.file);

      const user = await User.findById(req.user.userId); // from authentication middleware: req.user = { userId: user._id }
      if (!user) return res.status(404).json({ error: "User not found" });

      const { caption } = req.body; // caption from form
      const imageUrl = req.file.path; // cloudinary URL

      // save image + caption to database
      const newPost = await Post.create({
        dailyPhoto: imageUrl,
        dailyCaption: caption,
        cloudinaryId: req.file.filename, // // req.file.filename is automatically used as the public_id in Cloudinary (when using multer-storage-cloudinary), used later for operations such as file deletion or updates.
      });

      // add post to the user's album
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
