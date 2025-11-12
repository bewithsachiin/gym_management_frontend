const staffService = require('../services/staffService');
const responseHandler = require('../utils/responseHandler');

const getStaff = async (req, res, next) => {
  try {
    const staff = await staffService.getAllStaff();
    responseHandler.success(res, 'Staff fetched successfully', { staff });
  } catch (error) {
    next(error);
  }
};

const createStaff = async (req, res, next) => {
  try {
    const staffData = req.body;
    if (req.file) {
      staffData.profile_photo = req.file.path; // Cloudinary URL from middleware
    }
    const createdById = req.user.id; // Get creator ID from authenticated user
    const staff = await staffService.createStaff(staffData, createdById);
    responseHandler.success(res, 'Staff created successfully', { staff });
  } catch (error) {
    next(error);
  }
};

const updateStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    const staffData = req.body;
    if (req.file) {
      staffData.profile_photo = req.file.path; // Cloudinary URL from middleware
    }
    const staff = await staffService.updateStaff(id, staffData);
    responseHandler.success(res, 'Staff updated successfully', { staff });
  } catch (error) {
    next(error);
  }
};

const deleteStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    await staffService.deleteStaff(id);
    responseHandler.success(res, 'Staff deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
};
