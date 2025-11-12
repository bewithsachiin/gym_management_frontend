const staffRoleService = require('../services/staffRoleService');
const responseHandler = require('../utils/responseHandler');

const getStaffRoles = async (req, res, next) => {
  try {
    const roles = await staffRoleService.getAllStaffRoles();
    responseHandler.success(res, 'Staff roles fetched successfully', { roles });
  } catch (error) {
    next(error);
  }
};

const createStaffRole = async (req, res, next) => {
  try {
    const roleData = req.body;
    const role = await staffRoleService.createStaffRole(roleData);
    responseHandler.success(res, 'Staff role created successfully', { role });
  } catch (error) {
    next(error);
  }
};

const updateStaffRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const roleData = req.body;
    const role = await staffRoleService.updateStaffRole(id, roleData);
    responseHandler.success(res, 'Staff role updated successfully', { role });
  } catch (error) {
    next(error);
  }
};

const deleteStaffRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    await staffRoleService.deleteStaffRole(id);
    responseHandler.success(res, 'Staff role deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStaffRoles,
  createStaffRole,
  updateStaffRole,
  deleteStaffRole,
};
