"use strict";

const branchService = require("../services/branchService");
const responseHandler = require("../utils/responseHandler");

// ---------------------------------------------------------
// GET BRANCHES (Superadmin = all, others = own branch only)
// ---------------------------------------------------------
const getBranches = async (req, res, next) => {
  try {
    const { isSuperAdmin, userBranchId } = req.accessFilters;

    let branches;

    if (isSuperAdmin) {
      branches = await branchService.getAllBranches();
    } else {
      const branch = await branchService.getBranchById(userBranchId);
      branches = branch ? [branch] : [];
    }

    return responseHandler.success(res, "Branches fetched successfully", { branches });
  } catch (error) {
    return next(error);
  }
};

// ---------------------------------------------------------
// CREATE BRANCH (Superadmin / Admin)
// ---------------------------------------------------------
const createBranch = async (req, res, next) => {
  try {
    const branchData = { ...req.body };

    if (req.file) {
      branchData.branch_image = req.file.path;
    }

    // Auto assign admin if superadmin is creating and no admin provided
    if (req.user.role === "superadmin" && !branchData.adminId) {
      branchData.adminId = req.user.id;
    }

    // Normalize front-end fields
    branchData.operatingHours = branchData.hours;
    branchData.holidays = branchData.holidayList ? JSON.stringify(branchData.holidayList) : null;

    const branch = await branchService.createBranch(branchData, req.user.id);

    return responseHandler.success(res, "Branch created successfully", { branch });
  } catch (error) {
    return next(error);
  }
};

// ---------------------------------------------------------
// UPDATE BRANCH
// ---------------------------------------------------------
const updateBranch = async (req, res, next) => {
  try {
    const branchData = { ...req.body };

    if (req.file) {
      branchData.branch_image = req.file.path;
    }

    const { id } = req.params;
    const branch = await branchService.updateBranch(id, branchData);

    return responseHandler.success(res, "Branch updated successfully", { branch });
  } catch (error) {
    return next(error);
  }
};

// ---------------------------------------------------------
// DELETE BRANCH
// ---------------------------------------------------------
const deleteBranch = async (req, res, next) => {
  try {
    await branchService.deleteBranch(req.params.id);
    return responseHandler.success(res, "Branch deleted successfully");
  } catch (error) {
    return next(error);
  }
};

// ---------------------------------------------------------
// GET AVAILABLE ADMINS (Only those not assigned to branches)
// ---------------------------------------------------------
const getAvailableAdmins = async (req, res, next) => {
  try {
    const admins = await branchService.getAvailableAdmins();
    return responseHandler.success(res, "Available admins fetched successfully", { admins });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  getAvailableAdmins,
};
