const groupService = require('../services/groupService');
const responseHandler = require('../utils/responseHandler');

// ------------------------------------------------------
// GET ALL GROUPS
// ------------------------------------------------------
const getGroups = async (req, res, next) => {
  try {
    const { isSuperAdmin, userBranchId } = req.accessFilters;

    let groups;

    if (isSuperAdmin) {
      // SuperAdmin → See all groups
      groups = await groupService.getAllGroups();
    } else {
      // Admin / Trainers → See only branch groups
      groups = await groupService.getAllGroups(userBranchId);
    }

    responseHandler.success(res, 'Groups fetched successfully', { groups });
  } catch (error) {
    console.error('❌ Group Controller Error:', error);
    next(error);
  }
};

// ------------------------------------------------------
// GET SINGLE GROUP
// ------------------------------------------------------
const getGroup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userBranchId, isSuperAdmin } = req.accessFilters;

    const group = await groupService.getGroupById(id, isSuperAdmin ? null : userBranchId);

    responseHandler.success(res, 'Group fetched successfully', { group });
  } catch (error) {
    next(error);
  }
};

// ------------------------------------------------------
// CREATE NEW GROUP
// ------------------------------------------------------
const createGroup = async (req, res, next) => {
  try {
    const groupData = req.body;

    if (req.file) {
      groupData.photo = req.file.path; // Cloudinary URL
    }

    const { isSuperAdmin, userBranchId } = req.accessFilters;

    // SUPERADMIN → Can choose branch (groupData.branchId required)
    if (isSuperAdmin) {
      if (!groupData.branchId) {
        return responseHandler.error(res, 'branchId is required for SuperAdmin');
      }
    }

    // ADMIN → Always forced to their branch
    if (!isSuperAdmin) {
      groupData.branchId = userBranchId;
    }

    const group = await groupService.createGroup(groupData, groupData.branchId);

    responseHandler.success(res, 'Group created successfully', { group });
  } catch (error) {
    next(error);
  }
};

// ------------------------------------------------------
// UPDATE GROUP
// ------------------------------------------------------
const updateGroup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const groupData = req.body;

    if (req.file) {
      groupData.photo = req.file.path;
    }

    const { isSuperAdmin, userBranchId } = req.accessFilters;

    const branchId = isSuperAdmin ? null : userBranchId;

    const group = await groupService.updateGroup(id, groupData, branchId);

    responseHandler.success(res, 'Group updated successfully', { group });
  } catch (error) {
    next(error);
  }
};

// ------------------------------------------------------
// DELETE GROUP
// ------------------------------------------------------
const deleteGroup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isSuperAdmin, userBranchId } = req.accessFilters;

    const branchId = isSuperAdmin ? null : userBranchId;

    await groupService.deleteGroup(id, branchId);

    responseHandler.success(res, 'Group deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
};
