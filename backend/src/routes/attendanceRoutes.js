const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
const { authenticateToken } = require("../middlewares/auth.middleware");
const { accessControl } = require("../middlewares/accessControl.middleware");

// Apply auth middleware to all routes
router.use(authenticateToken);
router.use(accessControl());

// ----------------------------------------------------
// 📌 ATTENDANCE ROUTES
// ----------------------------------------------------

// GET /api/v1/attendance - Get all attendance records
router.get("/", attendanceController.getAttendances);

// GET /api/v1/attendance/:id - Get single attendance record
router.get("/:id", attendanceController.getAttendanceById);

// POST /api/v1/attendance - Create attendance record
router.post("/", attendanceController.createAttendance);

// PUT /api/v1/attendance/:id - Update attendance record
router.put("/:id", attendanceController.updateAttendance);

// DELETE /api/v1/attendance/:id - Delete attendance record
router.delete("/:id", attendanceController.deleteAttendance);

// POST /api/v1/attendance/mark - Mark attendance (check-in/check-out)
router.post("/mark", attendanceController.markAttendance);

module.exports = router;
