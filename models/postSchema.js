import { Schema, model } from "mongoose";

const postSchema = new Schema({
  dailyPhoto: {
    type: String,
    required: true,
  },
  dailyCaption: {
    //TODO validation, eg. max and min length
    type: String,
    required: true,
  },
  postDate: {
    type: String,
    required: true,
  },
});

export const Post = model("Post", postSchema);
