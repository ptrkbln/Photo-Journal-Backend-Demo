import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    album: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    validationToken: String,
    emailValidated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

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

/* This method is used to validate a user's password during login. It compares the plain-text password entered by the user with the hashed password stored in the database. */

userSchema.methods.authenticate = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// as soon as something is converted to JSON (eg.res.json) the function will be envoked (remove password)
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

export const User = model("User", userSchema);
