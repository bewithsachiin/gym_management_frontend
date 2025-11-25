const staffService = require("../services/staffService");
const responseHandler = require("../utils/responseHandler");

// ===============================================
// 📌 GET STAFF (SuperAdmin = all, others = branch)
// ===============================================
const getStaff = async (req, res, next) => {
  try {
    const { isSuperAdmin, userBranchId } = req.accessFilters;

    let staff;
    if (isSuperAdmin) {
      staff = await staffService.getAllStaff();
    } else {
      staff = await staffService.getStaffByBranch(userBranchId);
    }

    return responseHandler.success(res, "Staff fetched successfully", { staff });
  } catch (error) {
    next(error);
  }
};

// ===============================================
// 📌 CREATE STAFF (Admin / SuperAdmin)
// ===============================================
const createStaff = async (req, res, next) => {
  try {
    const data = { ...req.body };

    // Parse 'user' field if it's a JSON string
    if (data.user && typeof data.user === 'string') {
      try {
        data.user = JSON.parse(data.user);
      } catch (parseError) {
        return responseHandler.error(res, "Invalid user data format", 400);
      }
    }

    // File upload handling
    if (req.file && req.file.path) {
      data.profilePhoto = req.file.path; // Prisma field name
    }

    // Branch assignment for Admin
    const { userRole, userBranchId } = req.accessFilters;
    if (userRole === "admin" && !data.branchId) {
      data.branchId = userBranchId;
    }

    const createdById = req.user.id;

    const staff = await staffService.createStaff(data, createdById);

    return responseHandler.success(res, "Staff created successfully", { staff });
  } catch (error) {
    next(error);
  }
};

// ===============================================
// 📌 UPDATE STAFF (Admin / SuperAdmin)
// ===============================================
const updateStaff = async (req, res, next) => {
  try {
    const staffId = parseInt(req.params.id);

    if (isNaN(staffId)) {
      return responseHandler.error(res, "Invalid staff ID", 400);
    }

    const data = { ...req.body };

    // Parse 'user' field if it's a JSON string
    if (data.user && typeof data.user === 'string') {
      try {
        data.user = JSON.parse(data.user);
      } catch (parseError) {
        return responseHandler.error(res, "Invalid user data format", 400);
      }
    }

    // File upload handling
    if (req.file && req.file.path) {
      data.profilePhoto = req.file.path;
    }

    // Prevent branch change if admin (only superadmin can change branch)
    const { userRole } = req.accessFilters;
    if (userRole === "admin" && data.branchId) {
      delete data.branchId;
    }

    const staff = await staffService.updateStaff(staffId, data);

    return responseHandler.success(res, "Staff updated successfully", { staff });
  } catch (error) {
    next(error);
  }
};

// ===============================================
// 📌 DELETE STAFF (Admin / SuperAdmin)
// ===============================================
const deleteStaff = async (req, res, next) => {
  try {
    const staffId = parseInt(req.params.id);

    if (isNaN(staffId)) {
      return responseHandler.error(res, "Invalid staff ID", 400);
    }

    await staffService.deleteStaff(staffId);

    return responseHandler.success(res, "Staff deleted successfully");
  } catch (error) {
    next(error);
  }
};

// ===============================================
// 📌 EXPORTS
// ===============================================
module.exports = {
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
};
