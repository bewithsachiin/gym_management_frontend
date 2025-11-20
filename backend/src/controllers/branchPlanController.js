const branchPlanService = require('../services/branchPlanService');
const responseHandler = require('../utils/responseHandler');

// Get all branch plans
const getBranchPlans = async (req, res, next) => {
  try {
    const { userRole, userBranchId } = req.accessFilters;
    const filters = { ...req.query, ...req.queryFilters };

    console.log(`📋 Branch Plan Controller - Get plans - Role: ${userRole}, Branch: ${userBranchId}, Filters:`, filters);

    const plans = await branchPlanService.getAllBranchPlans(filters, userBranchId, userRole);
    console.log(`📋 Branch Plans fetched - Count: ${plans.length}`);

    responseHandler.success(res, 'Branch plans fetched successfully', { plans });
  } catch (error) {
    console.error('❌ Branch Plan Controller Error:', error);
    next(error);
  }
};

// Get branch plan by ID
const getBranchPlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userRole, userBranchId } = req.accessFilters;

    const plan = await branchPlanService.getBranchPlanById(id, userBranchId, userRole);
    if (!plan) {
      return responseHandler.error(res, 'Branch plan not found', 404);
    }

    responseHandler.success(res, 'Branch plan fetched successfully', { plan });
  } catch (error) {
    next(error);
  }
};

// Create new branch plan
const createBranchPlan = async (req, res, next) => {
  try {
    const planData = req.body;
    const { id: userId, branchId, role } = req.user;
    const { userRole, userBranchId } = req.accessFilters;

    const plan = await branchPlanService.createBranchPlan(planData, userId, userBranchId, userRole);
    responseHandler.success(res, 'Branch plan created successfully', { plan }, 201);
  } catch (error) {
    next(error);
  }
};

// Update branch plan
const updateBranchPlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const planData = req.body;
    const { id: userId, branchId, role } = req.user;
    const { userRole, userBranchId } = req.accessFilters;

    const plan = await branchPlanService.updateBranchPlan(id, planData, userId, userBranchId, userRole);
    responseHandler.success(res, 'Branch plan updated successfully', { plan });
  } catch (error) {
    next(error);
  }
};

// Delete branch plan
const deleteBranchPlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id: userId, branchId, role } = req.user;
    const { userRole, userBranchId } = req.accessFilters;

    await branchPlanService.deleteBranchPlan(id, userId, userBranchId, userRole);
    responseHandler.success(res, 'Branch plan deleted successfully');
  } catch (error) {
    next(error);
  }
};

// Toggle branch plan status
const toggleBranchPlanStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id: userId, branchId, role } = req.user;
    const { userRole, userBranchId } = req.accessFilters;

    const plan = await branchPlanService.toggleBranchPlanStatus(id, userId, userBranchId, userRole);
    responseHandler.success(res, 'Branch plan status updated successfully', { plan });
  } catch (error) {
    next(error);
  }
};

// Get branch booking requests
const getBranchBookingRequests = async (req, res, next) => {
  try {
    const { userRole, userBranchId } = req.accessFilters;

    const bookings = await branchPlanService.getBranchBookingRequests(userBranchId, userRole);
    responseHandler.success(res, 'Branch booking requests fetched successfully', { bookings });
  } catch (error) {
    next(error);
  }
};

// Approve branch booking request
const approveBranchBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id: userId, branchId, role } = req.user;

    // Only admins can approve bookings
    if (!['superadmin', 'admin'].includes(role)) {
      return responseHandler.error(res, 'Insufficient permissions', 403);
    }

    const booking = await branchPlanService.approveBranchBooking(id, userId);
    responseHandler.success(res, 'Branch booking approved successfully', { booking });
  } catch (error) {
    next(error);
  }
};

// Reject branch booking request
const rejectBranchBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id: userId, branchId, role } = req.user;

    // Only admins can reject bookings
    if (!['superadmin', 'admin'].includes(role)) {
      return responseHandler.error(res, 'Insufficient permissions', 403);
    }

    const booking = await branchPlanService.rejectBranchBooking(id, userId);
    responseHandler.success(res, 'Branch booking rejected successfully', { booking });
  } catch (error) {
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
