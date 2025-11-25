"use strict";

const express = require("express");
const router = express.Router();

const membershipController = require("../controllers/membershipController");

// Middlewares
const { authenticateToken } = require("../middlewares/auth.middleware");
const { accessControl, checkPermission } = require("../middlewares/accessControl.middleware");

// ---------------------------------------------------------
// ID VALIDATION (Strict runtime numeric type)
// ---------------------------------------------------------
const validateNumericId = (req, res, next) => {
  const id = Number(req.params.id);
  if (!id || Number.isNaN(id) || id <= 0) {
    return res.status(400).json({
      status: false,
      message: "Invalid membership ID. Expected a positive number."
    });
  }
  req.params.id = id; // convert safely to number for controller
  next();
};

// ---------------------------------------------------------
// ROUTE GUARDS (same logic as original)
// ---------------------------------------------------------

// Logged-in users with branch filtering
const protect = [
  authenticateToken,
  accessControl()
];

// Only Admin + Superadmin can create/update/delete
const adminOnly = [
  authenticateToken,
  accessControl(),
  checkPermission(["superadmin", "admin"])
];

// ---------------------------------------------------------
// MEMBERSHIP ROUTES (logic unchanged)
// ---------------------------------------------------------

// Get all memberships (branch filtered automatically)
router.get("/", protect, membershipController.getAllMemberships);

// Get membership by ID (branch filtered automatically)
router.get("/:id", protect, validateNumericId, membershipController.getMembershipById);

// Create membership (admin only)
router.post("/", adminOnly, membershipController.createMembership);

// Update membership (admin only)
router.put("/:id", adminOnly, validateNumericId, membershipController.updateMembership);

// Delete membership (admin only)
router.delete("/:id", adminOnly, validateNumericId, membershipController.deleteMembership);

module.exports = router;
