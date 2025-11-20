const staffService = require('../services/staffService');
const responseHandler = require('../utils/responseHandler');

const getStaff = async (req, res, next) => {
  try {
    const { userRole, userBranchId, isSuperAdmin } = req.accessFilters;
    const filters = req.queryFilters;

    console.log(`👥 Staff Controller - Get staff - Role: ${userRole}, Branch: ${userBranchId}, Filters:`, filters);

    let staff;
    if (isSuperAdmin) {
      staff = await staffService.getAllStaff();
      console.log(`👥 SuperAdmin fetched all staff - Count: ${staff.length}`);
    } else {
      // Other roles see staff from their branch
      staff = await staffService.getStaffByBranch(userBranchId);
      console.log(`👥 User fetched branch staff - Count: ${staff.length}`);
    }

    responseHandler.success(res, 'Staff fetched successfully', { staff });
  } catch (error) {
    console.error('❌ Staff Controller Error:', error);
    next(error);
  }
};

const createStaff = async (req, res, next) => {
  try {
    const staffData = req.body;
    if (req.file) {
      staffData.profile_photo = req.file.path; // Cloudinary URL from middleware
    }

    // Ensure staff is created in the admin's branch
    const { userRole, userBranchId } = req.accessFilters;
    if (userRole === 'admin' && !staffData.branchId) {
      staffData.branchId = userBranchId;
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
