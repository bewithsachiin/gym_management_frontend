const staffRoleService = require('../services/staffRoleService');
const responseHandler = require('../utils/responseHandler');

const getStaffRoles = async (req, res, next) => {
  try {
    const roles = await staffRoleService.getAllStaffRoles();
    return responseHandler.success(res, 'Staff roles fetched successfully', { roles });
  } catch (error) {
    next(error);
  }
};

const createStaffRole = async (req, res, next) => {
  try {
    const roleData = { ...req.body }; // prevent mutation
    const role = await staffRoleService.createStaffRole(roleData);

    return responseHandler.success(res, 'Staff role created successfully', { role });
  } catch (error) {
    next(error);
  }
};

const updateStaffRole = async (req, res, next) => {
  try {
    const id = Number(req.params.id); // ensure Prisma receives number
    const roleData = { ...req.body };

    const role = await staffRoleService.updateStaffRole(id, roleData);

    return responseHandler.success(res, 'Staff role updated successfully', { role });
  } catch (error) {
    next(error);
  }
};

const deleteStaffRole = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    await staffRoleService.deleteStaffRole(id);

    return responseHandler.success(res, 'Staff role deleted successfully');
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
