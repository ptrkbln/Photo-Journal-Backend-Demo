import mongoose from "mongoose";
import { User } from "../models/userSchema.js";
import nodemailer from "nodemailer";
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
    let token; // IMPORTANT: JWT
    const { username, email, password } = req.body;
    const newUser = new User({ username, email, password });
    newUser.validationToken = token;
    await newUser.save();

    const mailOptions = {
      from: "Photo Album Journal email-verification",
      to: newUser.email,
      subject: "Please confirm your registration",
      text: `Click on the following link to verify your email address: ${process.env.BASE_URL}${process.env.PORT}/verify-email/${token}`,
      html: `<p>Click <a href="${verificationLink}">here</a> to verify your email address.</p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
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
    // decode jwt token

    const user = User.find({ validationToken: token });

    if (user) {
      user.emailValidated = true;
      await user.save();
      return res.status(200).json({
        msg: "Email successfully verified",
        emailValidated: user.emailValidated,
      });
    } else {
      return res.status(401).json({ err: "Unauthorized: Invalid token" });
    }
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
  } catch (error) {}
};
