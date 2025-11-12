const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

const uploadBranchImage = upload.single('branch_image');
const uploadProfilePhoto = upload.single('profile_photo');
const uploadMemberPhoto = upload.single('profile_photo');

const cloudinaryUpload = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const localPath = req.file.path; // Store the local file path
    let folder = 'gym-staff'; // Default folder
    if (req.file.fieldname === 'branch_image') {
      folder = 'gym-branches';
    } else if (req.file.fieldname === 'profile_photo' && req.originalUrl.includes('/members')) {
      folder = 'gym-members';
    }
    const result = await cloudinary.uploader.upload(localPath, {
      folder: folder,
    });
    req.file.path = result.secure_url;

    // Delete temp file
    fs.unlinkSync(localPath);

    next();
  } catch (error) {
    next(error);
  }
};

const branchUploadMiddleware = (req, res, next) => {
  uploadBranchImage(req, res, (err) => {
    if (err) return next(err);
    cloudinaryUpload(req, res, next);
  });
};

const staffUploadMiddleware = (req, res, next) => {
  uploadProfilePhoto(req, res, (err) => {
    if (err) return next(err);
    cloudinaryUpload(req, res, next);
  });
};

const memberUploadMiddleware = (req, res, next) => {
  uploadMemberPhoto(req, res, (err) => {
    if (err) return next(err);
    cloudinaryUpload(req, res, next);
  });
};

module.exports = branchUploadMiddleware;
module.exports.staffUpload = staffUploadMiddleware;
module.exports.memberUpload = memberUploadMiddleware;
