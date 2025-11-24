const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// ====== MULTER STORAGE =======
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("\x1b[33m📁 MULTER DESTINATION → uploads/\x1b[0m");
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    console.log("\x1b[36m🖼️ MULTER FILENAME →", file.originalname, "\x1b[0m");
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// ====== UPLOAD TYPES =======
const uploadBranchImage = upload.single('branch_image');
const uploadProfilePhoto = upload.single('profile_photo');
const uploadMemberPhoto = upload.any();
const uploadGroupPhoto = upload.single('photo');

// ====== CLOUDINARY UPLOAD =======
const cloudinaryUpload = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    console.log("\x1b[33m⚠️ NO FILES TO UPLOAD TO CLOUDINARY\x1b[0m");
    return next();
  }

  try {
    for (const file of req.files) {
      console.log("\x1b[33m🚀 CLOUDINARY REQUEST → Uploading:", file.originalname, "\x1b[0m");

      const localPath = file.path;
      let folder = 'gym-staff';

      if (file.fieldname === 'branch_image') folder = 'gym-branches';
      else if (file.fieldname === 'photo' && req.originalUrl.includes('/members')) folder = 'gym-members';
      else if (file.fieldname === 'photo' && req.originalUrl.includes('/groups')) folder = 'gym-groups';

      console.log("\x1b[35m📂 CLOUDINARY FOLDER →", folder, "\x1b[0m");

      const result = await cloudinary.uploader.upload(localPath, { folder });

      console.log("\x1b[32m📦 CLOUDINARY RESPONSE:", result.secure_url, "\x1b[0m");

      file.path = result.secure_url;

      fs.unlinkSync(localPath);
      console.log("\x1b[31m🗑️ TEMP FILE REMOVED:", localPath, "\x1b[0m");
    }

    next();
  } catch (error) {
    console.error("\x1b[41m❌ CLOUDINARY ERROR:", error.message, "\x1b[0m");
    return next(error);
  }
};

// ====== MIDDLEWARE EXPORTS WITH DEBUG =======
const branchUploadMiddleware = (req, res, next) => {
  console.log("\x1b[34m🏢 BRANCH IMAGE UPLOAD START\x1b[0m");
  uploadBranchImage(req, res, (err) => {
    if (err) {
      console.error("\x1b[41m❌ MULTER ERROR:", err.message, "\x1b[0m");
      return next(err);
    }
    cloudinaryUpload(req, res, next);
  });
};

const staffUploadMiddleware = (req, res, next) => {
  console.log("\x1b[34m👨‍🏫 STAFF PHOTO UPLOAD START\x1b[0m");
  uploadProfilePhoto(req, res, (err) => {
    if (err) {
      console.error("\x1b[41m❌ MULTER ERROR:", err.message, "\x1b[0m");
      return next(err);
    }
    cloudinaryUpload(req, res, next);
  });
};

const memberUploadMiddleware = (req, res, next) => {
  console.log("\x1b[34m👨‍👩‍👧 MEMBER PHOTO UPLOAD START\x1b[0m");
  uploadMemberPhoto(req, res, (err) => {
    if (err) {
      console.error("\x1b[41m❌ MULTER ERROR:", err.message, "\x1b[0m");
      return next(err);
    }
    cloudinaryUpload(req, res, next);
  });
};

const groupUploadMiddleware = (req, res, next) => {
  console.log("\x1b[34m👥 GROUP PHOTO UPLOAD START\x1b[0m");
  uploadGroupPhoto(req, res, (err) => {
    if (err) {
      console.error("\x1b[41m❌ MULTER ERROR:", err.message, "\x1b[0m");
      return next(err);
    }
    cloudinaryUpload(req, res, next);
  });
};

// ====== EXPORTS =======
module.exports = branchUploadMiddleware;
module.exports.staffUpload = staffUploadMiddleware;
module.exports.memberUpload = memberUploadMiddleware;
module.exports.groupUpload = groupUploadMiddleware;
