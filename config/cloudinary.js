import cloudinary from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
// import crypto from "crypto";

// cloudinary configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const fullDate = new Date(); // eg. Wed Nov 27 2024 15:45:30 GMT+0100 (Central European Standard Time)
const dateOnly = fullDate.toISOString().split("T")[0]; // (YYYY-MM-DD)

// cloudinary storage set up
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: "Backend-Project",
    allowed_formats: ["jpeg", "png", "jpg", "webp"],
    public_id: dateOnly, // prevents conflicts between uploaded filenames (in case files with the same name are uploaded)
  },
});

const upload = multer({
  storage,
  limits: {
    filesize: 5 * 1024 * 1024, // 5 MB limit per upload
  },
});
export default upload;
