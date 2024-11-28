import { User } from "../models/userSchema.js";
import nodemailer from "nodemailer";
import { generateToken } from "../middleware/jwt.js";
import jwt from "jsonwebtoken";
import { emailValidator } from "../helpers/validateEmail.js";
import { passwordValidator } from "../helpers/validatePassword.js";
import { usernameValidator } from "../helpers/validateUsername.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

export const registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!usernameValidator(username))
      return res.status(400).json({ msg: "Invalid username" });
    if (!emailValidator(email))
      return res.status(400).json({ msg: "Invalid email address" });
    if (!passwordValidator(password))
      return res.status(400).json({ msg: "Invalid password" });

    const newUser = new User({ username, email, password });
    const token = generateToken({ userId: newUser._id }); // payload
    newUser.validationToken = token;
    await newUser.save();

    const mailOptions = {
      from: "Photo Journal App email-verification",
      to: newUser.email,
      subject: "Please confirm your registration",
      html: `<p>Click <a href="${process.env.BASE_URL}${process.env.PORT}/email-verification/${token}">here</a> to verify your email address.</p>`,
      text: `Click on the following link to verify your email address: ${process.env.BASE_URL}${process.env.PORT}/email-verification/${token}`,
    };

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
    next(error);
  }
};

export const verifyUser = async (req, res, next) => {
  try {
    const token = req.params.token;
    jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ validationToken: token });

    if (user) {
      user.emailValidated = true;
      user.validationToken = null; // Remove the registration token once it does its job
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

// login either via (username OR email) and (password), generate token - attach to cookie, and send to client (for 1h in browser's cookie storage)
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

    // if user is authenticated, first make them verify email
    if (!user.emailValidated)
      return res.status(401).json({
        msg: "Email not verified. Please verify your email to log in.",
      });

    // if user is found (via username OR password) AND authenticated (correct password) -> generate token
    const token = generateToken({ userId: user._id }); // payload
    return res
      .status(200)
      .cookie("jwt", token, {
        // httpOnly: true, // deactivated for demo purposes via thunder client
        // secure: true, // deactivated for demo purposes via thunder client
        maxAge: 60 * 60 * 1000, //1h
      })
      .json({ msg: "Successfully signed in" });
  } catch (error) {
    next(error);
  }
};
