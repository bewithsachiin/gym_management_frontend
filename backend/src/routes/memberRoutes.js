"use strict";

const express = require("express");
const router = express.Router();

// Controllers
const memberController = require("../controllers/memberController");
const classScheduleController = require("../controllers/classScheduleController");

// Middlewares
const { memberUpload } = require("../middlewares/uploadMiddleware");
const { authenticateToken } = require("../middlewares/auth.middleware");
const { accessControl, checkPermission } = require("../middlewares/accessControl.middleware");
const { memberSelfService } = require("../middlewares/memberSelfService.middleware");

// ------------------------------------------------------
// STRICT ID VALIDATOR (runtime type check)
// ------------------------------------------------------
const validateNumericId = (req, res, next) => {
  const id = Number(req.params.id);
  if (!id || Number.isNaN(id) || id <= 0) {
    return res.status(400).json({
      status: false,
      message: "Invalid member ID. Expected a positive number."
    });
  }
  req.params.id = id;  // enforce numeric type for controller code
  next();
};

// ------------------------------------------------------
// MIDDLEWARE GROUPS (logic unchanged)
// ------------------------------------------------------

// Logged in + normal branch filtering
const protect = [
  authenticateToken,
  accessControl()
];

// Logged in + must apply branch filter always
const protectWithFilter = [
  authenticateToken,
  accessControl({ includeUserFilter: true })
];

// Admin or Superadmin only
const adminOnly = [
  authenticateToken,
  accessControl(),
  checkPermission(["superadmin", "admin"])
];

// Admin or Superadmin + branch filter applied
const adminWithFilter = [
  authenticateToken,
  accessControl({ includeUserFilter: true }),
  checkPermission(["superadmin", "admin"])
];

// ------------------------------------------------------
// MEMBER SELF-SERVICE ROUTES (must come first)
// ------------------------------------------------------
router.get("/me/profile", memberSelfService, memberController.getMyProfile);

router.put("/me/profile", memberSelfService, memberUpload, memberController.updateMyProfile);

router.put("/me/change-password", memberSelfService, memberController.changeMyPassword);

router.get("/plans", memberSelfService, memberController.getPlans);

router.post("/bookings", memberSelfService, memberController.createBooking);

router.get("/bookings", memberSelfService, memberController.getBookings);

// ------------------------------------------------------
// ADMIN MEMBER MANAGEMENT ROUTES
// ------------------------------------------------------
router.get("/", protect, memberController.getMembers);

router.get("/:id", protectWithFilter, validateNumericId, memberController.getMemberById);

router.post("/", adminOnly, memberUpload, memberController.createMember);

router.put("/:id", adminWithFilter, validateNumericId, memberUpload, memberController.updateMember);

router.put("/:id/activate", protectWithFilter, validateNumericId, memberController.activateMember);

router.delete("/:id", adminWithFilter, validateNumericId, memberController.deleteMember);

// ------------------------------------------------------
// MEMBER GROUP CLASS ROUTES
// ------------------------------------------------------
router.get("/group-classes", memberSelfService, classScheduleController.getWeeklyGroupClasses);

router.post("/group-classes/:id/book", memberSelfService, validateNumericId, classScheduleController.bookGroupClass);

module.exports = router;
