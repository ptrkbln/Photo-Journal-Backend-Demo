import { Schema, model } from "mongoose";

const postSchema = new Schema({
  dailyPhoto: {
    type: String,
    required: true,
  },
  dailyCaption: {
    type: String,
    required: true,
  },
  postDate: {
    type: String,
    required: true,
  },
});

export const Post = model("Post", postSchema);
