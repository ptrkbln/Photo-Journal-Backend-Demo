import { User } from "../models/userSchema.js";
import nodemailer from "nodemailer";
import { generateToken } from "../middleware/jwt.js";
import jwt from "jsonwebtoken";
import { emailValidator } from "../helpers/validateEmail.js";
import { passwordValidator } from "../helpers/validatePassword.js";
import { usernameValidator } from "../helpers/validateUsername.js";
import { Post } from "../models/postSchema.js";
import cloudinary from "cloudinary";

// Configuring the nodemailer transporter to send emails via Gmail's SMTP service
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Not using secure connection (for "backend-only" demo purposes)
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

// Register a new user
export const registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Validate user input using custom validators
    if (!usernameValidator(username))
      return res.status(400).json({
        msg: "Invalid username. Must be between 3 and 16 characters long, start with a letter and can contain letters, numbers, or underscores.",
      });
    if (!emailValidator(email))
      return res.status(400).json({ msg: "Invalid email address." });
    if (!passwordValidator(password))
      return res.status(400).json({
        msg: "Invalid password. Must be between 8 and 20 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).",
      });

    // Create a new user and generate a verification token
    const newUser = new User({ username, email, password });
    const token = generateToken({ userId: newUser._id }); // Payload containing user ID
    newUser.validationToken = token; // Storing validation token in user's validationToken field
    await newUser.save();

    // Setting up the email options
    const mailOptions = {
      from: "Photo Journal App email-verification", // Sender name
      to: newUser.email,
      subject: "Please confirm your registration",
      html: `<p>Click <a href="${process.env.BASE_URL}${process.env.PORT}/email-verification/${token}">here</a> to verify your email address.</p>`,
      text: `Click on the following link to verify your email address: ${process.env.BASE_URL}${process.env.PORT}/email-verification/${token}`,
    };

    // Send the verification email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending verification email", error);
        res.status(500).json({ err: "Error sending verification email!" });
      } else {
        console.log("Email sent:", info.response);
        res.status(201).json({
          msg: "User created. Verification email has been sent!",
          newUser,
        });
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      // Handle duplicate username or email errors from MongoDB
      if (error.keyPattern.email) {
        return res.status(400).json({ msg: "Email is already in use" });
      }
      if (error.keyPattern.username) {
        return res.status(400).json({ msg: "Username is already in use" });
      }
    }
    next(error);
  }
};

// Verify the user's email using the token sent during registration
export const verifyUser = async (req, res, next) => {
  try {
    const token = req.params.token; // Extract token from URL parameters
    jwt.verify(token, process.env.JWT_SECRET); // Verify the token using JWT_SECRET

    // Find the user associated with the verification token
    const user = await User.findOne({ validationToken: token });

    if (user) {
      user.emailValidated = true; // Set the user's emailValidated field to true
      user.validationToken = null; // Remove the registration token
      await user.save();
      return res.status(200).json({
        msg: "Email successfully verified",
        emailValidated: user.emailValidated,
        user,
      });
    } else {
      return res.status(401).json({ err: "Unauthorized: Invalid token" });
    }
  } catch (error) {
    next(error);
  }
};

// Log in the user via username/email and password, generate a JWT token (attach to cookie) and send it back to Client
export const loginUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (!user) return res.status(404).json({ msg: "User not found!" });

    const isAuthenticated = user.authenticate(password);
    if (!isAuthenticated)
      return res.status(401).json({ msg: "Incorrect credentials!" });

    // If email not verified, reject login attempt
    if (!user.emailValidated)
      return res.status(401).json({
        msg: "Email not verified. Please verify your email to log in.",
      });

    // If login successful, generate JWT token and send it in the cookie
    const token = generateToken({ userId: user._id }); // payload
    return res
      .status(200)
      .cookie("jwt", token, {
        // httpOnly: true, // deactivated for backend-only demo purposes via Insomnia/Postman
        // secure: true, // deactivated for backend-only demo purposes via Insomnia/Postman
        maxAge: 60 * 60 * 1000, //1h
      })
      .json({ msg: "Successfully signed in" });
  } catch (error) {
    next(error);
  }
};

// Delete a user and their posts and uploaded images
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findOne(req.user.userId);

    // Find all posts associated with the user
    const allUserPosts = await Post.find({ _id: { $in: user.album } });
    if (allUserPosts.length > 0) {
      // If user has posts, delete associated images from Cloudinary
      for (const userPost of allUserPosts) {
        const publicId = `Backend-Project/${userPost.postDate}`;
        try {
          await cloudinary.uploader.destroy(publicId); // Delete image from Cloudinary
        } catch (error) {
          console.error(
            `Failed to delete image ${publicId} from Cloudinary:`,
            error
          );
        }
        await Post.deleteOne({ _id: userPost._id }); // Delete the post document
      }
    }
    // Delete the user after deleting all associated posts and images
    await User.deleteOne(user);
    return res
      .status(200)
      .json({ msg: "User profile and all posts deleted successfully." });
  } catch (error) {
    next(error);
  }
};
