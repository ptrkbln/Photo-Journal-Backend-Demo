import { User } from "../models/userSchema.js";
import nodemailer from "nodemailer";
import { generateToken } from "../middleware/jwt.js";
import jwt from "jsonwebtoken";

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
    const newUser = new User({ username, email, password });
    const token = generateToken({ userId: newUser._id }); // payload
    newUser.validationToken = token;
    await newUser.save();

    const mailOptions = {
      from: "Photo Journal App email-verification",
      to: newUser.email,
      subject: "Please confirm your registration",
      html: `<p>Click <a href="${process.env.BASE_URL}${process.env.PORT}/verify-email/${token}">here</a> to verify your email address.</p>`,
      text: `Click on the following link to verify your email address: ${process.env.BASE_URL}${process.env.PORT}/verify-email/${token}`,
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

// IMPORTANT: verify-email get route
export const verifyUser = async (req, res, next) => {
  try {
    const token = req.params.token;
    jwt.verify(token, process.env.SECRET_KEY);

    const user = await User.findOne({ validationToken: token });

    if (user) {
      user.emailValidated = true;
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

    const isAuthenticated = await user.authenticate(password);
    if (!isAuthenticated)
      return res.status(401).json({ msg: "Incorrect credentials!" });

    // if user is found (via username OR password) AND authenticated (correct password) -> generate token
    const token = generateToken({ userId: user._id }); // payload
    return res
      .status(200)
      .cookie("jwt", token, {
        httpOnly: true,
        // secure: true, // deactivated for demo purposes via thunder client
        maxAge: 60 * 60 * 1000, //1h
      })
      .json({ msg: "Successfully signed in" });
  } catch (error) {
    next(error);
  }
};
