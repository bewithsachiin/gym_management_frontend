const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// =======================
// MULTER DISK STORAGE
// =======================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const newName = `${Date.now()}-${file.originalname}`;
    cb(null, newName);
  },
});

const upload = multer({ storage });

// =======================
// UPLOAD TYPES (Single/Any)
// =======================
const uploadBranchImage = upload.single("branch_image");
const uploadProfilePhoto = upload.single("profilePhoto");
const uploadAnyFiles = upload.any(); // member upload any
const uploadGroupPhoto = upload.single("photo");

// =======================
// CLOUDINARY UPLOAD HANDLER
// =======================
const uploadToCloudinary = async (req, res, next) => {
  try {
    // No files to upload
    if (!req.files || req.files.length === 0) {
      return next();
    }

    // Upload files one by one
    for (const file of req.files) {
      const localPath = file.path;

      // Select folder based on file field and URL
      let folder = "gym-staff";

      if (file.fieldname === "branch_image") folder = "gym-branches";
      else if (file.fieldname === "photo" && req.originalUrl.includes("/members")) folder = "gym-members";
      else if (file.fieldname === "photo" && req.originalUrl.includes("/groups")) folder = "gym-groups";

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(localPath, { folder });

      // Replace file path with Cloudinary URL
      file.path = result.secure_url;

      // Remove temp file
      try {
        fs.unlinkSync(localPath);
      } catch (err) {
        console.error("Error removing temp file:", err.message);
      }
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

// =======================
// REUSABLE WRAPPER (SAFE FILE HANDLER)
// =======================
const safeUpload = (uploadFn) => {
  return (req, res, next) => {
    uploadFn(req, res, (err) => {
      if (err) {
        return next(err);
      }
      return uploadToCloudinary(req, res, next);
    });
  };
};

// =======================
// FINAL MIDDLEWARE EXPORTS
// =======================
const branchUpload = safeUpload(uploadBranchImage);
const staffUpload = safeUpload(uploadProfilePhoto);
const memberUpload = safeUpload(uploadAnyFiles);
const groupUpload = safeUpload(uploadGroupPhoto);

module.exports = {
  branchUpload,
  staffUpload,
  memberUpload,
  groupUpload,
};
