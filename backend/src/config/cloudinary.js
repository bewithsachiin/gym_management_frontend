const cloudinary = require('cloudinary').v2;

console.log("☁️ [Cloudinary] Initializing configuration...");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn("⚠️ [Cloudinary] Missing environment variables! Check .env file");
} else {
  console.log("✅ [Cloudinary] Config loaded successfully");
}

module.exports = cloudinary;
