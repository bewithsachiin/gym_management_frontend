const branchPlanService = require('../services/branchPlanService');
const responseHandler = require('../utils/responseHandler');

// Get all branch plans
const getBranchPlans = async (req, res, next) => {
  console.log("\n🟦 [Controller] getBranchPlans() triggered");

  try {
    const { userRole, userBranchId } = req.accessFilters;
    const filters = { ...req.query, ...req.queryFilters };

    console.log("🔎 Access Filters:", { userRole, userBranchId });
    console.log("📥 Filters Received:", filters);

    console.log("📡 Calling Service: getAllBranchPlans()");
    const plans = await branchPlanService.getAllBranchPlans(filters, userBranchId, userRole);

    console.log(`📦 Plans Retrieved: ${plans?.length}`);
    responseHandler.success(res, 'Branch plans fetched successfully', { plans });

  } catch (error) {
    console.error("❌ [Controller Error] getBranchPlans():", error);
    next(error);
  }
};

// Get branch plan by ID
const getBranchPlan = async (req, res, next) => {
  console.log("\n🟨 [Controller] getBranchPlan() triggered");

  try {
    const { id } = req.params;
    const { userRole, userBranchId } = req.accessFilters;

    console.log("🔐 Plan ID:", id);
    console.log("🔎 Access Filters:", { userRole, userBranchId });
    
    console.log("📡 Calling Service: getBranchPlanById()");
    const plan = await branchPlanService.getBranchPlanById(id, userBranchId, userRole);

    if (!plan) {
      console.log("⛔ No plan found with ID:", id);
      return responseHandler.error(res, 'Branch plan not found', 404);
    }

    console.log("📦 Plan Retrieved:", plan?.id);
    responseHandler.success(res, 'Branch plan fetched successfully', { plan });

  } catch (error) {
    console.error("❌ [Controller Error] getBranchPlan():", error);
    next(error);
  }
};

// Create new branch plan
const createBranchPlan = async (req, res, next) => {
  console.log("\n🟩 [Controller] createBranchPlan() triggered");

  try {
    const planData = req.body;
    const { id: userId, branchId, role } = req.user;
    const { userRole, userBranchId } = req.accessFilters;

    console.log("📥 Plan Data:", planData);
    console.log("🧑 User Context:", { userId, branchId, role });
    console.log("🔎 Access Filters:", { userRole, userBranchId });

    console.log("📡 Calling Service: createBranchPlan()");
    const plan = await branchPlanService.createBranchPlan(planData, userId, userBranchId, userRole);

    console.log("🎉 Branch Plan Created:", plan?.id);
    responseHandler.success(res, 'Branch plan created successfully', { plan }, 201);

  } catch (error) {
    console.error("❌ [Controller Error] createBranchPlan():", error);
    next(error);
  }
};

// Update branch plan
const updateBranchPlan = async (req, res, next) => {
  console.log("\n🟦 [Controller] updateBranchPlan() triggered");

  try {
    const { id } = req.params;
    const planData = req.body;
    const { id: userId, branchId, role } = req.user;
    const { userRole, userBranchId } = req.accessFilters;

    console.log("🔐 Plan ID:", id);
    console.log("📥 Update Data:", planData);
    console.log("🧑 User Context:", { userId, branchId, role });
    console.log("🔎 Access Filters:", { userRole, userBranchId });

    console.log("📡 Calling Service: updateBranchPlan()");
    const plan = await branchPlanService.updateBranchPlan(id, planData, userId, userBranchId, userRole);

    console.log("♻️ Branch Plan Updated:", plan?.id);
    responseHandler.success(res, 'Branch plan updated successfully', { plan });

  } catch (error) {
    console.error("❌ [Controller Error] updateBranchPlan():", error);
    next(error);
  }
};

// Delete branch plan
const deleteBranchPlan = async (req, res, next) => {
  console.log("\n🟥 [Controller] deleteBranchPlan() triggered");

  try {
    const { id } = req.params;
    const { id: userId, branchId, role } = req.user;
    const { userRole, userBranchId } = req.accessFilters;

    console.log("🧹 Delete Plan ID:", id);
    console.log("🧑 User Context:", { userId, branchId, role });

    console.log("📡 Calling Service: deleteBranchPlan()");
    await branchPlanService.deleteBranchPlan(id, userId, userBranchId, userRole);

    console.log("🗑️ Branch Plan Deleted Successfully");
    responseHandler.success(res, 'Branch plan deleted successfully');

  } catch (error) {
    console.error("❌ [Controller Error] deleteBranchPlan():", error);
    next(error);
  }
};

// Toggle branch plan status
const toggleBranchPlanStatus = async (req, res, next) => {
  console.log("\n🔁 [Controller] toggleBranchPlanStatus() triggered");

  try {
    const { id } = req.params;
    const { id: userId, branchId, role } = req.user;
    const { userRole, userBranchId } = req.accessFilters;

    console.log("🔐 Plan ID:", id);
    console.log("🧑 User Context:", { userId, branchId, role });

    console.log("📡 Calling Service: toggleBranchPlanStatus()");
    const plan = await branchPlanService.toggleBranchPlanStatus(id, userId, userBranchId, userRole);

    console.log("🔄 Status Toggled for:", plan?.id);
    responseHandler.success(res, 'Branch plan status updated successfully', { plan });

  } catch (error) {
    console.error("❌ [Controller Error] toggleBranchPlanStatus():", error);
    next(error);
  }
};

// Get branch booking requests
const getBranchBookingRequests = async (req, res, next) => {
  console.log("\n📩 [Controller] getBranchBookingRequests() triggered");

  try {
    const { userRole, userBranchId } = req.accessFilters;

    console.log("🔎 Access Filters:", { userRole, userBranchId });
    console.log("📡 Calling Service: getBranchBookingRequests()");
    const bookings = await branchPlanService.getBranchBookingRequests(userBranchId, userRole);

    console.log(`📦 Booking Requests Retrieved: ${bookings?.length}`);
    responseHandler.success(res, 'Branch booking requests fetched successfully', { bookings });

  } catch (error) {
    console.error("❌ [Controller Error] getBranchBookingRequests():", error);
    next(error);
  }
};

// Approve branch booking
const approveBranchBooking = async (req, res, next) => {
  console.log("\n🟢 [Controller] approveBranchBooking() triggered");

  try {
    const { id } = req.params;
    const { id: userId, role } = req.user;

    console.log("🔐 Booking ID:", id);
    console.log("🧑 User Role:", role);

    if (!['superadmin', 'admin'].includes(role)) {
      console.warn("⛔ User lacks permission to approve");
      return responseHandler.error(res, 'Insufficient permissions', 403);
    }

    console.log("📡 Calling Service: approveBranchBooking()");
    const booking = await branchPlanService.approveBranchBooking(id, userId);

    console.log("✔️ Booking Approved:", booking?.id);
    responseHandler.success(res, 'Branch booking approved successfully', { booking });

  } catch (error) {
    console.error("❌ [Controller Error] approveBranchBooking():", error);
    next(error);
  }
};

// Reject branch booking request
const rejectBranchBooking = async (req, res, next) => {
  console.log("\n🔴 [Controller] rejectBranchBooking() triggered");

  try {
    const { id } = req.params;
    const { id: userId, role } = req.user;

    console.log("🔐 Booking ID:", id);
    console.log("🧑 User Role:", role);

    if (!['superadmin', 'admin'].includes(role)) {
      console.warn("⛔ User lacks permission to reject");
      return responseHandler.error(res, 'Insufficient permissions', 403);
    }

    console.log("📡 Calling Service: rejectBranchBooking()");
    const booking = await branchPlanService.rejectBranchBooking(id, userId);

    console.log("❌ Booking Rejected:", booking?.id);
    responseHandler.success(res, 'Branch booking rejected successfully', { booking });

  } catch (error) {
    console.error("❌ [Controller Error] rejectBranchBooking():", error);
    next(error);
  }
};

module.exports = {
  getBranchPlans,
  getBranchPlan,
  createBranchPlan,
  updateBranchPlan,
  deleteBranchPlan,
  toggleBranchPlanStatus,
  getBranchBookingRequests,
  approveBranchBooking,
  rejectBranchBooking,
};
