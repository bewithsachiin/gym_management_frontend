"use strict";

const express = require("express");
const router = express.Router();

// Controllers
const branchPlanController = require("../controllers/branchPlanController");

// Middlewares
const { authenticateToken } = require("../middlewares/auth.middleware");
const { accessControl, checkPermission } = require("../middlewares/accessControl.middleware");

// ---------------------------------------------------------
// STRICT ID VALIDATOR (runtime-safe numeric)
// ---------------------------------------------------------
const validateNumericId = (req, res, next) => {
  const id = Number(req.params.id);
  if (!id || Number.isNaN(id) || id <= 0) {
    return res.status(400).json({
      status: false,
      message: "Invalid ID. Positive number required."
    });
  }
  req.params.id = id; // enforce numeric type for controller logic
  next();
};

// ---------------------------------------------------------
// ROUTE GUARDS (original logic unchanged)
// ---------------------------------------------------------

// Normal protected user (branch scoped)
const protect = [
  authenticateToken,
  accessControl()
];

// Only admin can manage branch plans
const adminOnly = [
  authenticateToken,
  accessControl(),
  checkPermission(["admin"])
];

// ---------------------------------------------------------
// BRANCH PLAN CRUD
// ---------------------------------------------------------

router.get("/", protect, branchPlanController.getBranchPlans);

router.get("/:id", protect, validateNumericId, branchPlanController.getBranchPlan);

router.post("/", adminOnly, branchPlanController.createBranchPlan);

router.put("/:id", adminOnly, validateNumericId, branchPlanController.updateBranchPlan);

router.delete("/:id", adminOnly, validateNumericId, branchPlanController.deleteBranchPlan);

router.patch(
  "/:id/toggle-status",
  adminOnly,
  validateNumericId,
  branchPlanController.toggleBranchPlanStatus
);

// ---------------------------------------------------------
// BOOKING REQUEST ROUTES
// ---------------------------------------------------------

router.get(
  "/bookings/requests",
  adminOnly,
  branchPlanController.getBranchBookingRequests
);

router.patch(
  "/bookings/:id/approve",
  adminOnly,
  validateNumericId,
  branchPlanController.approveBranchBooking
);

router.patch(
  "/bookings/:id/reject",
  adminOnly,
  validateNumericId,
  branchPlanController.rejectBranchBooking
);

router.post(
  "/bookings/request",
  protect,
  branchPlanController.createBranchPlanBookingRequest
);

module.exports = router;
