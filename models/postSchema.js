import { Schema, model } from "mongoose";

const postSchema = new Schema(
  {
    dailyPhoto: {
      type: String,
      required: true,
    },
    dailyCaption: {
      //TODO validation, eg. max and min length
      type: String,
      required: true,
    },
    cloudinaryId: {
      // // store the public_id for Cloudinary operations
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Post = model("Post", postSchema);
