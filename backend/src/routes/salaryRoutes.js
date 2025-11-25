const express = require("express");
const router = express.Router();

const salaryController = require("../controllers/salaryController");

// Middlewares
const { authenticateToken } = require("../middlewares/auth.middleware");
const { accessControl, checkPermission } = require("../middlewares/accessControl.middleware");

// ===============================
// 📌 SALARY ROUTES
// ===============================

// GET: All salaries
router.get(
  "/",
  authenticateToken,
  accessControl(),
  (req, res, next) => salaryController.getSalaries(req, res, next)
);

// GET: Salary by ID
router.get(
  "/:id",
  authenticateToken,
  accessControl(),
  (req, res, next) => salaryController.getSalaryById(req, res, next)
);

// POST: Create salary
router.post(
  "/",
  authenticateToken,
  accessControl(),
  checkPermission(["superadmin", "admin"]),
  (req, res, next) => salaryController.createSalary(req, res, next)
);

// PUT: Update salary
router.put(
  "/:id",
  authenticateToken,
  accessControl(),
  checkPermission(["superadmin", "admin"]),
  (req, res, next) => salaryController.updateSalary(req, res, next)
);

// DELETE: Delete salary
router.delete(
  "/:id",
  authenticateToken,
  accessControl(),
  checkPermission(["superadmin", "admin"]),
  (req, res, next) => salaryController.deleteSalary(req, res, next)
);

module.exports = router;
