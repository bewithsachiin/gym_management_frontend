const staffRoleService = require("../services/staffRoleService");
const responseHandler = require("../utils/responseHandler");

// ==========================================
// 📌 GET STAFF ROLES
// ==========================================
const getStaffRoles = async (req, res, next) => {
  console.log("▶️ [Controller] Get Staff Roles");

  try {
    const roles = await staffRoleService.getAllStaffRoles();

    return responseHandler.success(res, "Staff roles fetched successfully", { roles });
  } catch (error) {
    console.error("❌ Get Staff Roles Error:", error);
    next(error);
  }
};

// ==========================================
// 📌 CREATE STAFF ROLE
// ==========================================
const createStaffRole = async (req, res, next) => {
  console.log("▶️ [Controller] Create Staff Role");

  try {
    // Basic input protection
    if (!req.body || !req.body.name) {
      return responseHandler.error(res, "Role name is required", 400);
    }

    const roleData = {
      name: String(req.body.name).trim(),
      permissions: Array.isArray(req.body.permissions)
        ? req.body.permissions
        : [],
      status: req.body.status || "Active",
    };

    const role = await staffRoleService.createStaffRole(roleData);

    return responseHandler.success(res, "Staff role created successfully", { role });
  } catch (error) {
    console.error("❌ Create Staff Role Error:", error);
    next(error);
  }
};

// ==========================================
// 📌 UPDATE STAFF ROLE
// ==========================================
const updateStaffRole = async (req, res, next) => {
  console.log("▶️ [Controller] Update Staff Role");

  try {
    const id = Number(req.params.id);

    // Validate numeric ID
    if (!id || isNaN(id)) {
      return responseHandler.error(res, "Invalid role ID", 400);
    }

    const roleData = {};

    if (req.body.name) {
      roleData.name = String(req.body.name).trim();
    }

    if (req.body.permissions) {
      roleData.permissions = Array.isArray(req.body.permissions)
        ? req.body.permissions
        : [];
    }

    if (req.body.status) {
      roleData.status = req.body.status;
    }

    const role = await staffRoleService.updateStaffRole(id, roleData);

    return responseHandler.success(res, "Staff role updated successfully", { role });
  } catch (error) {
    console.error("❌ Update Staff Role Error:", error);
    next(error);
  }
};

// ==========================================
// 📌 DELETE STAFF ROLE
// ==========================================
const deleteStaffRole = async (req, res, next) => {
  console.log("▶️ [Controller] Delete Staff Role");

  try {
    const id = Number(req.params.id);

    if (!id || isNaN(id)) {
      return responseHandler.error(res, "Invalid role ID", 400);
    }

    await staffRoleService.deleteStaffRole(id);

    return responseHandler.success(res, "Staff role deleted successfully");
  } catch (error) {
    console.error("❌ Delete Staff Role Error:", error);
    next(error);
  }
};

module.exports = {
  getStaffRoles,
  createStaffRole,
  updateStaffRole,
  deleteStaffRole,
};
