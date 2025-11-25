const express = require("express");
const router = express.Router();

const staffController = require("../controllers/staffController");
const { staffUpload } = require("../middlewares/uploadMiddleware");
const { authenticateToken } = require("../middlewares/auth.middleware");
const { accessControl, checkPermission } = require("../middlewares/accessControl.middleware");

/*
  Routes:
  - GET    /api/v1/staff       -> list staff
  - POST   /api/v1/staff       -> create staff (with photo)
  - PUT    /api/v1/staff/:id   -> update staff (with photo)
  - DELETE /api/v1/staff/:id   -> delete staff
*/

// List staff (requires authentication + branch access rules)
router.get(
  "/",
  authenticateToken,
  accessControl(),
  staffController.getStaff
);

// Create staff (only superadmin/admin) + file upload
router.post(
  "/",
  authenticateToken,
  accessControl(),
  checkPermission(["superadmin", "admin"]),
  staffUpload,
  staffController.createStaff
);

// Update staff (only superadmin/admin) + file upload
router.put(
  "/:id",
  authenticateToken,
  accessControl(),
  checkPermission(["superadmin", "admin"]),
  staffUpload,
  staffController.updateStaff
);

// Delete staff (only superadmin/admin)
router.delete(
  "/:id",
  authenticateToken,
  accessControl(),
  checkPermission(["superadmin", "admin"]),
  staffController.deleteStaff
);

module.exports = router;
