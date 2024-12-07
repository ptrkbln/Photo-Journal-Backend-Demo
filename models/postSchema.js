import { Schema, model } from "mongoose";

// Schema definition for a user's daily journal post
const postSchema = new Schema({
  dailyPhoto: {
    type: String, // URL to the uploaded photo
    required: true,
  },
  dailyCaption: {
    type: String, // Text caption
    required: true,
  },
  postDate: {
    type: String, // Date in YYYY-MM-DD format
    required: true,
  },
});

// Create a Mongoose model for the Post schema
export const Post = model("Post", postSchema);
