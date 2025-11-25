"use strict";

const express = require("express");
const router = express.Router();

const classScheduleController = require("../controllers/classScheduleController");

const { authenticateToken } = require("../middlewares/auth.middleware");
const { accessControl, checkPermission } = require("../middlewares/accessControl.middleware");

// ============================================================
// Common Role-Based Middleware Groups
// ============================================================

// Logged-in user can view classes (filter applied automatically)
const protect = [
  authenticateToken,
  accessControl()
];

// Roles who can create/update/delete classes
const classManagerOnly = [
  authenticateToken,
  accessControl(),
  checkPermission([
    "superadmin",
    "admin",
    "generaltrainer",
    "personaltrainer"
  ])
];

// ============================================================
// Class Schedule Routes
// ============================================================

// ----- VIEW CLASSES -----
router.get("/", protect, classScheduleController.getClasses);
router.get("/daily", protect, classScheduleController.getDailyClasses);
router.get("/trainers", classManagerOnly, classScheduleController.getTrainers);
router.get("/:id", protect, classScheduleController.getClass);
router.get("/:id/members", protect, classScheduleController.getClassMembers);

// ----- MODIFY (CREATE / UPDATE / DELETE) -----
router.post("/", classManagerOnly, classScheduleController.createClass);
router.put("/:id", classManagerOnly, classScheduleController.updateClass);
router.delete("/:id", classManagerOnly, classScheduleController.deleteClass);

module.exports = router;
