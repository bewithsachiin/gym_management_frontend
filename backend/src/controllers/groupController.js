const groupService = require('../services/groupService');
const responseHandler = require('../utils/responseHandler');

// ------------------------------------------------------
// GET ALL GROUPS
// ------------------------------------------------------
const getGroups = async (req, res, next) => {
  console.log("📌 [CONTROLLER] getGroups | accessFilters =", req.accessFilters);

  try {
    const { isSuperAdmin, userBranchId } = req.accessFilters;
    let groups;

    if (isSuperAdmin) {
      console.log("🔍 SuperAdmin → Fetching ALL groups");
      groups = await groupService.getAllGroups();
    } else {
      console.log(`🔍 Branch Restricted → Fetching groups for branchId=${userBranchId}`);
      groups = await groupService.getAllGroups(userBranchId);
    }

    responseHandler.success(res, 'Groups fetched successfully', { groups });
  } catch (error) {
    console.error('❌ [ERROR] getGroups:', error);
    next(error);
  }
};

// ------------------------------------------------------
// GET SINGLE GROUP
// ------------------------------------------------------
const getGroup = async (req, res, next) => {
  console.log("📌 [CONTROLLER] getGroup | params =", req.params);

  try {
    const { id } = req.params;
    const { userBranchId, isSuperAdmin } = req.accessFilters;

    if (!id || isNaN(id)) {
      console.warn("⚠️ Invalid group ID:", id);
      return responseHandler.error(res, "Invalid group ID", 400);
    }

    console.log(`🔎 Getting Group ID=${id} | Branch Filter=${isSuperAdmin ? "NONE" : userBranchId}`);

    const group = await groupService.getGroupById(id, isSuperAdmin ? null : userBranchId);

    if (!group) {
      console.warn("⚠️ Group Not Found:", id);
      return responseHandler.notFound(res, "Group not found");
    }

    responseHandler.success(res, 'Group fetched successfully', { group });
  } catch (error) {
    console.error('❌ [ERROR] getGroup:', error);
    next(error);
  }
};

// ------------------------------------------------------
// CREATE NEW GROUP
// ------------------------------------------------------
const createGroup = async (req, res, next) => {
  console.log("📌 [CONTROLLER] createGroup | body =", req.body);

  try {
    const groupData = { ...req.body };
    if (req.file) groupData.photo = req.file.path;

    const { isSuperAdmin, userBranchId } = req.accessFilters;

    // SUPERADMIN MUST provide branch ID
    if (isSuperAdmin && !groupData.branchId) {
      console.warn("⚠️ SuperAdmin did not provide branchId");
      return responseHandler.error(res, 'branchId is required for SuperAdmin');
    }

    // Non-SuperAdmin always forced to their own branch
    if (!isSuperAdmin) {
      console.log(`🔐 BranchLocked →Forced branchId=${userBranchId}`);
      groupData.branchId = userBranchId;
    }

    console.log("🆕 Creating Group with data =", groupData);

    const group = await groupService.createGroup(groupData, groupData.branchId);

    responseHandler.success(res, 'Group created successfully', { group });
  } catch (error) {
    console.error('❌ [ERROR] createGroup:', error);
    next(error);
  }
};

// ------------------------------------------------------
// UPDATE GROUP
// ------------------------------------------------------
const updateGroup = async (req, res, next) => {
  console.log("📌 [CONTROLLER] updateGroup | params =", req.params, "| body =", req.body);

  try {
    const { id } = req.params;
    const groupData = { ...req.body };
    if (req.file) groupData.photo = req.file.path;

    const { isSuperAdmin, userBranchId } = req.accessFilters;

    if (!id || isNaN(id)) {
      console.warn("⚠️ Invalid group ID:", id);
      return responseHandler.error(res, "Invalid group ID", 400);
    }

    const branchId = isSuperAdmin ? null : userBranchId;
    console.log(`🔧 Updating Group ID=${id} | Branch Filter=${branchId}`);

    const group = await groupService.updateGroup(id, groupData, branchId);

    responseHandler.success(res, 'Group updated successfully', { group });
  } catch (error) {
    console.error('❌ [ERROR] updateGroup:', error);
    next(error);
  }
};

// ------------------------------------------------------
// DELETE GROUP
// ------------------------------------------------------
const deleteGroup = async (req, res, next) => {
  console.log("🗑️ [CONTROLLER] deleteGroup | params =", req.params);

  try {
    const { id } = req.params;
    const { isSuperAdmin, userBranchId } = req.accessFilters;

    if (!id || isNaN(id)) {
      console.warn("⚠️ Invalid group ID:", id);
      return responseHandler.error(res, "Invalid group ID", 400);
    }

    const branchId = isSuperAdmin ? null : userBranchId;
    console.log(`🗑️ Deleting Group ID=${id} | Branch Filter=${branchId}`);

    await groupService.deleteGroup(id, branchId);

    responseHandler.success(res, 'Group deleted successfully');
  } catch (error) {
    console.error('❌ [ERROR] deleteGroup:', error);
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
