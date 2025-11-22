const express = require("express");
const router = express.Router();
const salaryController = require("../controllers/salaryController");

const { authenticateToken } = require("../middlewares/auth.middleware");
const { accessControl, checkPermission } = require("../middlewares/accessControl.middleware");

// Get all salaries
router.get(
  "/",
  authenticateToken,
  accessControl(),
  salaryController.getSalaries
);

// Get salary by ID
router.get(
  "/:id",
  authenticateToken,
  accessControl(),
  salaryController.getSalaryById
);

// Create salary
router.post(
  "/",
  authenticateToken,
  accessControl(),
  checkPermission(["superadmin", "admin"]),
  salaryController.createSalary
);

// Update salary
router.put(
  "/:id",
  authenticateToken,
  accessControl(),
  checkPermission(["superadmin", "admin"]),
  salaryController.updateSalary
);

// Delete salary
router.delete(
  "/:id",
  authenticateToken,
  accessControl(),
  checkPermission(["superadmin", "admin"]),
  salaryController.deleteSalary
);

module.exports = router;
