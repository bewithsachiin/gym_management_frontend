const groupPlanService = require('../services/groupPlanService');
const responseHandler = require('../utils/responseHandler');

// Get all group plans
const getGroupPlans = async (req, res, next) => {
  console.log("\n🟦 [Controller] getGroupPlans() triggered");

  try {
    const { userRole, userBranchId } = req.accessFilters;
    const filters = { ...req.query, ...req.queryFilters };

    console.log("🔎 Access Filters:", { userRole, userBranchId });
    console.log("📥 Filters Received:", filters);

    console.log("📡 Calling Service: getAllGroupPlans()");
    const plans = await groupPlanService.getAllGroupPlans(filters, userBranchId, userRole);

    console.log(`📦 Group Plans Retrieved: ${plans?.length}`);
    responseHandler.success(res, 'Group plans fetched successfully', { plans });

  } catch (error) {
    console.error("❌ [Controller Error] getGroupPlans():", error);
    next(error);
  }
};

// Get members for a specific group plan
const getGroupPlanMembers = async (req, res, next) => {
  console.log("\n🟨 [Controller] getGroupPlanMembers() triggered");

  try {
    const { id } = req.params;
    const { userRole, userBranchId } = req.accessFilters;

    console.log("🔐 Plan ID:", id);
    console.log("🔎 Access Filters:", { userRole, userBranchId });

    console.log("📡 Calling Service: getGroupPlanMembers()");
    const members = await groupPlanService.getGroupPlanMembers(id, userBranchId, userRole);

    console.log(`📦 Members Retrieved: ${members?.length}`);
    responseHandler.success(res, 'Group plan members fetched successfully', { members });

  } catch (error) {
    console.error("❌ [Controller Error] getGroupPlanMembers():", error);
    next(error);
  }
};

module.exports = {
  getGroupPlans,
  getGroupPlanMembers,
};
