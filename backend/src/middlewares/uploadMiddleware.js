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
const uploadMemberPhoto = upload.any();
const uploadGroupPhoto = upload.single('photo');

const cloudinaryUpload = async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();

  try {
    for (const file of req.files) {
      const localPath = file.path; // Store the local file path
      let folder = 'gym-staff'; // Default folder
      if (file.fieldname === 'branch_image') {
        folder = 'gym-branches';
      } else if (file.fieldname === 'photo' && req.originalUrl.includes('/members')) {
        folder = 'gym-members';
      } else if (file.fieldname === 'photo' && req.originalUrl.includes('/groups')) {
        folder = 'gym-groups';
      }
      const result = await cloudinary.uploader.upload(localPath, {
        folder: folder,
      });
      file.path = result.secure_url;

      // Delete temp file
      fs.unlinkSync(localPath);
    }

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

const groupUploadMiddleware = (req, res, next) => {
  uploadGroupPhoto(req, res, (err) => {
    if (err) return next(err);
    cloudinaryUpload(req, res, next);
  });
};

module.exports = branchUploadMiddleware;
module.exports.staffUpload = staffUploadMiddleware;
module.exports.memberUpload = memberUploadMiddleware;
module.exports.groupUpload = groupUploadMiddleware;
