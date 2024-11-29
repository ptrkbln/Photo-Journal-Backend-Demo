import jwt from "jsonwebtoken";
import { User } from "../models/userSchema.js";

export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });
};

// check whether a JWT is valid (correct secret key, matching payload and header (type of token (jwt) and signing algorithm), has not expired ) -> returns decoded payload
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

/* This method is used to authenticate users via a JWT (JSON Web Token). It verifies the token sent by the client (e.g., in a cookie or HTTP header) and determines if the user has permission to access protected routes. */

export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.jwt; // cookie named jwt in userController.js
    if (!token) return res.status(401).json({ msg: "Unauthorized!" });

    const decoded = verifyToken(token);

    const user = await User.findById(decoded.userId); // userId:user._id defined in userController
    if (!user) return res.status(404).json({ msg: "User not found!" });

    req.user = { userId: user._id };
    next();
  } catch (error) {
    return res.status(403).json({ msg: "Authorization failed." });
  }
};
