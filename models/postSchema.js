import { Schema, model } from "mongoose";

const postSchema = new Schema(
  {
    photo: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Post = model("Post", postSchema);
