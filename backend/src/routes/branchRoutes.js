"use strict";

const express = require("express");
const router = express.Router();

// Controllers
const branchController = require("../controllers/branchController");

// Middlewares
const { branchUpload } = require("../middlewares/uploadMiddleware");
const { authenticateToken } = require("../middlewares/auth.middleware");
const { accessControl, checkPermission } = require("../middlewares/accessControl.middleware");

// ----------------------------------------------------
// SAFE MIDDLEWARE GROUPS (No business logic changes)
// ----------------------------------------------------

// Authenticated users with branch-based restrictions
const protect = [
  authenticateToken,
  accessControl()
];

// Superadmin + Admin only access
const superAdminOnly = [
  authenticateToken,
  accessControl(),
  checkPermission(["superadmin", "admin"])
];

// ----------------------------------------------------
// BRANCH ROUTES (Strict + Minimal)
// ----------------------------------------------------

// Fetch all branches
router.get("/", protect, branchController.getBranches);

// Fetch admins who can be assigned to a branch
router.get("/available-admins", superAdminOnly, branchController.getAvailableAdmins);

// Create new branch (image allowed)
router.post("/", superAdminOnly, branchUpload, branchController.createBranch);

// Update existing branch (image allowed)
router.put("/:id", superAdminOnly, branchUpload, branchController.updateBranch);

// Delete branch
router.delete("/:id", superAdminOnly, branchController.deleteBranch);

module.exports = router;
