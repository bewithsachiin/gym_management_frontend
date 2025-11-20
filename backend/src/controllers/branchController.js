const branchService = require('../services/branchService');
const responseHandler = require('../utils/responseHandler');

const getBranches = async (req, res, next) => {
  try {
    const { userRole, userBranchId, isSuperAdmin } = req.accessFilters;
    const filters = req.queryFilters;

    console.log(`📋 Branch Controller - Get branches - Role: ${userRole}, Branch: ${userBranchId}, Filters:`, filters);

    let branches;
    if (isSuperAdmin) {
      branches = await branchService.getAllBranches();
      console.log(`📋 SuperAdmin fetched all branches - Count: ${branches.length}`);
    } else {
      // For other roles, return only their branch
      branches = await branchService.getBranchById(userBranchId);
      branches = branches ? [branches] : [];
      console.log(`📋 User fetched own branch - Count: ${branches.length}`);
    }

    responseHandler.success(res, 'Branches fetched successfully', { branches });
  } catch (error) {
    console.error('❌ Branch Controller Error:', error);
    next(error);
  }
};

const createBranch = async (req, res, next) => {
  try {
    const branchData = req.body;
    if (req.file) {
      branchData.branch_image = req.file.path; // Cloudinary URL from middleware
    }
    // If superadmin and no adminId provided, link superadmin id
    if (req.user.role === 'superadmin' && !branchData.adminId) {
      branchData.adminId = req.user.id;
    }
    const branch = await branchService.createBranch(branchData, req.user.id);
    responseHandler.success(res, 'Branch created successfully', { branch });
  } catch (error) {
    next(error);
  }
};

const updateBranch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const branchData = req.body;
    if (req.file) {
      branchData.branch_image = req.file.path; // Cloudinary URL from middleware
    }
    const branch = await branchService.updateBranch(id, branchData);
    responseHandler.success(res, 'Branch updated successfully', { branch });
  } catch (error) {
    next(error);
  }
};

const deleteBranch = async (req, res, next) => {
  try {
    const { id } = req.params;
    await branchService.deleteBranch(id);
    responseHandler.success(res, 'Branch deleted successfully');
  } catch (error) {
    next(error);
  }
};

const getAvailableAdmins = async (req, res, next) => {
  try {
    const branchService = require('../services/branchService');
    const admins = await branchService.getAvailableAdmins();
    responseHandler.success(res, 'Available admins fetched successfully', { admins });
  } catch (error) {
    console.error('❌ Get Available Admins Error:', error);
    next(error);
  }
};

module.exports = {
  getBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  getAvailableAdmins,
};
