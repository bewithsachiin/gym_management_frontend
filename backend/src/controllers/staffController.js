const staffService = require("../services/staffService");
const responseHandler = require("../utils/responseHandler");

const getStaff = async (req, res, next) => {
  try {
    const { userRole, userBranchId, isSuperAdmin } = req.accessFilters;

    const staff = isSuperAdmin
      ? await staffService.getAllStaff()
      : await staffService.getStaffByBranch(userBranchId);

    return responseHandler.success(res, "Staff fetched successfully", { staff });
  } catch (error) {
    next(error);
  }
};

const createStaff = async (req, res, next) => {
  try {
    const staffData = { ...req.body }; // ensure clean object

    // Correct field name per Prisma: "profilePhoto"
    if (req.file) {
      staffData.profilePhoto = req.file.path;
    }

    // Auto-assign branch for admin
    const { userRole, userBranchId } = req.accessFilters;
    if (userRole === "admin" && !staffData.branchId) {
      staffData.branchId = userBranchId;
    }

    const createdById = req.user.id;

    const staff = await staffService.createStaff(staffData, createdById);

    return responseHandler.success(res, "Staff created successfully", { staff });
  } catch (error) {
    next(error);
  }
};

const updateStaff = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const staffData = { ...req.body };

    // Correct field name
    if (req.file) {
      staffData.profilePhoto = req.file.path;
    }

    // Ensure branch cannot be changed for admin users
    const { userRole, userBranchId } = req.accessFilters;
    if (userRole === "admin") {
      // Remove branchId from update data to prevent changes
      delete staffData.branchId;
    }

    const staff = await staffService.updateStaff(id, staffData);

    return responseHandler.success(res, "Staff updated successfully", { staff });
  } catch (error) {
    next(error);
  }
};

const deleteStaff = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    await staffService.deleteStaff(id);

    return responseHandler.success(res, "Staff deleted successfully");
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
