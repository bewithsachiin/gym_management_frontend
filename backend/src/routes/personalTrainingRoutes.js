"use strict";

const express = require("express");
const router = express.Router();

// Controllers
const controller = require("../controllers/personalTrainingController");

// Middlewares
const { authenticateToken } = require("../middlewares/auth.middleware");
const {
  accessControl,
  checkPermission
} = require("../middlewares/accessControl.middleware");

// ------------------------------------------------------
// PERSONAL TRAINING BOOKING ROUTES
// ------------------------------------------------------

// Validate ID type strictly (must be a number)
const validateNumericId = (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id) || id <= 0) {
    return res.status(400).json({
      status: false,
      message: "Invalid booking ID. Expected a positive numeric value."
    });
  }
  req.params.id = id; // Convert to number to avoid type bugs in controller
  next();
};

// ------------------------------------------------------
// GET ALL BOOKINGS
// Allowed: Superadmin, Admin, Trainer, Member
// ------------------------------------------------------
router.get(
  "/",
  authenticateToken,
  accessControl(),
  controller.getAllBookings
);

// ------------------------------------------------------
// GET BOOKING BY ID
// ID must always be numeric
// ------------------------------------------------------
router.get(
  "/:id",
  authenticateToken,
  accessControl(),
  validateNumericId,
  controller.getBookingById
);

// ------------------------------------------------------
// CREATE BOOKING
// Allowed: Superadmin, Admin, Trainer
// ------------------------------------------------------
router.post(
  "/",
  authenticateToken,
  accessControl(),
  checkPermission(["superadmin", "admin", "personaltrainer"]),
  controller.createBooking
);

// ------------------------------------------------------
// UPDATE BOOKING
// Allowed: Superadmin, Admin, Trainer
// ------------------------------------------------------
router.put(
  "/:id",
  authenticateToken,
  accessControl(),
  validateNumericId,
  checkPermission(["superadmin", "admin", "personaltrainer"]),
  controller.updateBooking
);

// ------------------------------------------------------
// DELETE BOOKING
// Allowed: Superadmin, Admin, Trainer
// Members can NEVER delete
// ------------------------------------------------------
router.delete(
  "/:id",
  authenticateToken,
  accessControl(),
  validateNumericId,
  checkPermission(["superadmin", "admin", "personaltrainer"]),
  controller.deleteBooking
);

module.exports = router;
