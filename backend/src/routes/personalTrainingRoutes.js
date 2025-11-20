const express = require("express");
const router = express.Router();

const controller = require("../controllers/personalTrainingController");
const { authenticateToken } = require("../middlewares/auth.middleware");
const { accessControl, checkPermission } = require("../middlewares/accessControl.middleware");

// -----------------------------------------------------------
// PERSONAL TRAINING BOOKINGS ROUTES
// -----------------------------------------------------------

// GET ALL BOOKINGS (Admin, Superadmin, Trainer, Member*)
router.get(
  "/",
  authenticateToken,
  accessControl(),
  controller.getAllBookings
);

// GET SINGLE BOOKING
router.get(
  "/:id",
  authenticateToken,
  accessControl(),
  controller.getBookingById
);

// CREATE BOOKING (Trainer, Admin, Superadmin)
router.post(
  "/",
  authenticateToken,
  accessControl(),
  checkPermission(["superadmin", "admin", "personaltrainer"]),
  controller.createBooking
);

// UPDATE BOOKING (Trainer, Admin, Superadmin)
router.put(
  "/:id",
  authenticateToken,
  accessControl(),
  checkPermission(["superadmin", "admin", "personaltrainer"]),
  controller.updateBooking
);

// DELETE BOOKING (Trainer, Admin, Superadmin)
router.delete(
  "/:id",
  authenticateToken,
  accessControl(),
  checkPermission(["superadmin", "admin", "personaltrainer"]),
  controller.deleteBooking
);

module.exports = router;
