import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

// Define schema for a user
const userSchema = new Schema(
  {
    username: {
      type: String, // User's chosen username
      required: true,
      unique: true,
    },
    email: {
      type: String, // User's email address
      required: true,
      unique: true,
    },
    password: {
      type: String, // Hashed password
      required: true,
    },
    album: [
      {
        type: Schema.Types.ObjectId, // References to posts created by the user
        ref: "Post",
      },
    ],
    validationToken: String, // Token used to validate the user's email
    emailValidated: {
      type: Boolean, // // Indicates if the user's email has been verified
      default: false,
    },
  },
  { timestamps: true }
);

// Pre-save middleware to hash the user's password before saving it to the database
userSchema.pre("save", async function (next) {
  try {
    const saltRounds = 12;
    const hash = await bcrypt.hash(this.password, saltRounds);
    this.password = hash;
    next();
  } catch (error) {
    next(error);
  }
});

// Method to validate the user's password during login
userSchema.methods.authenticate = async function (password) {
  // Compare the entered (clear-text) password with the stored hashed password
  return await bcrypt.compare(password, this.password);
};

// Custom method to modify the user object when converted to JSON -> remove password
userSchema.methods.toJSON = function () {
  const user = this.toObject(); // Convert the document to a plain JavaScript object
  delete user.password;
  return user;
};

// Create a Mongoose model for the User schema
export const User = model("User", userSchema);
