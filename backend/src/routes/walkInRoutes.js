const express = require("express");
const router = express.Router();

const walkInController = require("../controllers/walkInController");

const { authenticateToken } = require("../middlewares/auth.middleware");
const { accessControl, checkPermission } = require("../middlewares/accessControl.middleware");

// Get all walk-in records
router.get(
  "/",
  authenticateToken,
  accessControl(),
  walkInController.getWalkIns
);

// Get single walk-in by ID
router.get(
  "/:id",
  authenticateToken,
  accessControl({ includeUserFilter: true }),
  walkInController.getWalkInById
);

// Create a new walk-in
router.post(
  "/",
  authenticateToken,
  accessControl(),
  checkPermission(["superadmin", "admin"]),
  walkInController.createWalkIn
);

// Update walk-in by ID
router.put(
  "/:id",
  authenticateToken,
  accessControl({ includeUserFilter: true }),
  checkPermission(["superadmin", "admin"]),
  walkInController.updateWalkIn
);

// Delete walk-in by ID
router.delete(
  "/:id",
  authenticateToken,
  accessControl({ includeUserFilter: true }),
  checkPermission(["superadmin", "admin"]),
  walkInController.deleteWalkIn
);

module.exports = router;
