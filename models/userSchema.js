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
    } /* profile pic? */,
    album: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
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
    console.error(error);
  }
});

userSchema.methods.authenticate = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export const User = model("User", userSchema);
