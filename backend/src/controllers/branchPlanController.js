"use strict";

const branchPlanService = require("../services/branchPlanService");
const responseHandler = require("../utils/responseHandler");

// ---------------------------------------------------------
// STRICT SAFE HELPERS
// ---------------------------------------------------------

// Parse body safely (protects from undefined/null)
const safeBody = (body) => (body && typeof body === "object" ? body : {});

// Enforce numeric ID for all services
const parseId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

// ---------------------------------------------------------
// CONTROLLERS
// ---------------------------------------------------------

const getBranchPlans = async (req, res, next) => {
  try {
    const { userRole, userBranchId } = req.accessFilters;
    const filters = { ...req.query, ...req.queryFilters };

    const plans = await branchPlanService.getAllBranchPlans(
      filters,
      userBranchId,
      userRole
    );

    return responseHandler.success(res, "Branch plans fetched successfully", { plans });

  } catch (error) {
    return next(error);
  }
};

const getBranchPlan = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return responseHandler.error(res, "Invalid plan ID", 400);

    const { userRole, userBranchId } = req.accessFilters;

    const plan = await branchPlanService.getBranchPlanById(
      id,
      userBranchId,
      userRole
    );

    if (!plan) return responseHandler.error(res, "Branch plan not found", 404);

    return responseHandler.success(res, "Branch plan fetched successfully", { plan });

  } catch (error) {
    return next(error);
  }
};

const createBranchPlan = async (req, res, next) => {
  try {
    const data = safeBody(req.body);
    const { id: userId } = req.user;
    const { userRole, userBranchId } = req.accessFilters;

    const plan = await branchPlanService.createBranchPlan(
      data,
      userId,
      userBranchId,
      userRole
    );

    return responseHandler.success(res, "Branch plan created successfully", { plan }, 201);

  } catch (error) {
    return next(error);
  }
};

const updateBranchPlan = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return responseHandler.error(res, "Invalid plan ID", 400);

    const data = safeBody(req.body);
    const { id: userId } = req.user;
    const { userRole, userBranchId } = req.accessFilters;

    const plan = await branchPlanService.updateBranchPlan(
      id,
      data,
      userId,
      userBranchId,
      userRole
    );

    return responseHandler.success(res, "Branch plan updated successfully", { plan });

  } catch (error) {
    return next(error);
  }
};

const deleteBranchPlan = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return responseHandler.error(res, "Invalid plan ID", 400);

    const { id: userId } = req.user;
    const { userRole, userBranchId } = req.accessFilters;

    await branchPlanService.deleteBranchPlan(id, userId, userBranchId, userRole);

    return responseHandler.success(res, "Branch plan deleted successfully");

  } catch (error) {
    return next(error);
  }
};

const toggleBranchPlanStatus = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return responseHandler.error(res, "Invalid plan ID", 400);

    const { id: userId } = req.user;
    const { userRole, userBranchId } = req.accessFilters;

    const plan = await branchPlanService.toggleBranchPlanStatus(
      id,
      userId,
      userBranchId,
      userRole
    );

    return responseHandler.success(res, "Branch plan status updated successfully", { plan });

  } catch (error) {
    return next(error);
  }
};

const getBranchBookingRequests = async (req, res, next) => {
  try {
    const { userRole, userBranchId } = req.accessFilters;

    const bookings = await branchPlanService.getBranchBookingRequests(
      userBranchId,
      userRole
    );

    return responseHandler.success(res, "Branch booking requests fetched successfully", { bookings });

  } catch (error) {
    return next(error);
  }
};

const approveBranchBooking = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return responseHandler.error(res, "Invalid booking ID", 400);

    const { id: userId, role } = req.user;
    if (!["superadmin", "admin"].includes(role)) {
      return responseHandler.error(res, "Insufficient permissions", 403);
    }

    const booking = await branchPlanService.approveBranchBooking(id, userId);

    return responseHandler.success(res, "Branch booking approved successfully", { booking });

  } catch (error) {
    return next(error);
  }
};

const rejectBranchBooking = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return responseHandler.error(res, "Invalid booking ID", 400);

    const { id: userId, role } = req.user;
    if (!["superadmin", "admin"].includes(role)) {
      return responseHandler.error(res, "Insufficient permissions", 403);
    }

    const booking = await branchPlanService.rejectBranchBooking(id, userId);

    return responseHandler.success(res, "Branch booking rejected successfully", { booking });

  } catch (error) {
    return next(error);
  }
};

// ---------------------------------------------------------
// CREATE BOOKING REQUEST
// ---------------------------------------------------------
const createBranchPlanBookingRequest = async (req, res, next) => {
  try {
    const data = safeBody(req.body);
    const { id: userId } = req.user;
    const { userRole, userBranchId } = req.accessFilters;

    const booking = await branchPlanService.createBranchPlanBookingRequest(
      data,
      userId,
      userBranchId,
      userRole
    );

    return responseHandler.success(res, "Branch plan booking request created successfully", { booking }, 201);

  } catch (error) {
    return next(error);
  }
};

// ---------------------------------------------------------
// EXPORTS
// ---------------------------------------------------------
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
  createBranchPlanBookingRequest,
};
