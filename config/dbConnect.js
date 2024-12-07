import mongoose from "mongoose";

// Log errors related to the MongoDB connection
mongoose.connection.on("error", (error) => {
  console.log("DB error with initial connection:", error);
});

// Function to connect to the MongoDB database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB!");
  } catch (error) {
    console.error("Connection error:", error);
  }
};

export default connectDB;
