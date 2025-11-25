const express = require("express");
const router = express.Router();

const staffRoleController = require("../controllers/staffRoleController");

// Middlewares
const { authenticateToken } = require("../middlewares/auth.middleware");
const { accessControl, checkPermission } = require("../middlewares/accessControl.middleware");

// ===============================
// 📌 STAFF ROLE ROUTES
// ===============================

// GET: All Staff Roles
router.get(
  "/",
  authenticateToken,
  accessControl(),
  checkPermission(["superadmin", "admin"]),
  (req, res, next) => staffRoleController.getStaffRoles(req, res, next)
);

// POST: Create Staff Role
router.post(
  "/",
  authenticateToken,
  accessControl(),
  checkPermission(["superadmin", "admin"]),
  (req, res, next) => staffRoleController.createStaffRole(req, res, next)
);

// PUT: Update Staff Role
router.put(
  "/:id",
  authenticateToken,
  accessControl(),
  checkPermission(["superadmin", "admin"]),
  (req, res, next) => staffRoleController.updateStaffRole(req, res, next)
);

// DELETE: Delete Staff Role
router.delete(
  "/:id",
  authenticateToken,
  accessControl(),
  checkPermission(["superadmin", "admin"]),
  (req, res, next) => staffRoleController.deleteStaffRole(req, res, next)
);

module.exports = router;
