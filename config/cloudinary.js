import cloudinary from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

// Configure Cloudinary with environment variables
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Generate today's date for use in public IDs (avoids naming conflicts)
const fullDate = new Date(); // Example: Wed Nov 27 2024 15:45:30 GMT+0100
const dateOnly = fullDate.toISOString().split("T")[0]; // Format: YYYY-MM-DD

// Set up Cloudinary storage with specific folder and file format constraints
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: "Backend-Project", // Folder name in Cloudinary
    allowed_formats: ["jpeg", "png", "jpg", "webp", "avif"], // Accepted formats
    public_id: (req, file) => dateOnly, // Use today's date as the public ID
  },
});

// Set up multer for file uploads, with a 5MB size limit
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});
export default upload;
