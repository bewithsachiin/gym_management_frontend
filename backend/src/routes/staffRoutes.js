const express = require("express");
const router = express.Router();
const staffController = require("../controllers/staffController");

const { staffUpload } = require("../middlewares/uploadMiddleware");
const { authenticateToken } = require("../middlewares/auth.middleware");
const { accessControl, checkPermission } = require("../middlewares/accessControl.middleware");

// Get all staff
router.get(
  "/",
  authenticateToken,
  accessControl(),
  staffController.getStaff
);

// Create staff
router.post(
  "/",
  authenticateToken,
  accessControl(),
  checkPermission(["superadmin", "admin"]),
  staffUpload,
  staffController.createStaff
);

// Update staff
router.put(
  "/:id",
  authenticateToken,
  accessControl(),
  checkPermission(["superadmin", "admin"]),
  staffUpload,
  staffController.updateStaff
);

// Delete staff
router.delete(
  "/:id",
  authenticateToken,
  accessControl(),
  checkPermission(["superadmin", "admin"]),
  staffController.deleteStaff
);

module.exports = router;
