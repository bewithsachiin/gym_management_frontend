const branchService = require('../services/branchService');
const responseHandler = require('../utils/responseHandler');

const getBranches = async (req, res, next) => {
  try {
    const branches = await branchService.getAllBranches();
    responseHandler.success(res, 'Branches fetched successfully', { branches });
  } catch (error) {
    next(error);
  }
};

const createBranch = async (req, res, next) => {
  try {
    const branchData = req.body;
    if (req.file) {
      branchData.branch_image = req.file.path; // Cloudinary URL from middleware
    }
    const branch = await branchService.createBranch(branchData);
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

module.exports = {
  getBranches,
  createBranch,
  updateBranch,
  deleteBranch,
};
