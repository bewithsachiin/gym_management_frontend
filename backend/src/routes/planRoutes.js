const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { accessControl, checkPermission } = require('../middlewares/accessControl.middleware');

/**
 * ===========================
 * PLAN CRUD ROUTES
 * ===========================
 */

// Get All / Single / Features
router.get(
  '/',
  authenticateToken,
  accessControl(),
  planController.getPlans
);

router.get(
  '/features',
  authenticateToken,
  accessControl(),
  planController.getFeatures
);

router.get(
  '/:id',
  authenticateToken,
  accessControl(),
  planController.getPlan
);

// Create Plan (Only SuperAdmin)
router.post(
  '/',
  authenticateToken,
  accessControl(),
  checkPermission(['superadmin']),
  planController.createPlan
);

// Update Plan (Only SuperAdmin)
router.put(
  '/:id',
  authenticateToken,
  accessControl(),
  checkPermission(['superadmin']),
  planController.updatePlan
);

// Delete Plan (Only SuperAdmin)
router.delete(
  '/:id',
  authenticateToken,
  accessControl(),
  checkPermission(['superadmin']),
  planController.deletePlan
);

/**
 * ===========================
 * STATUS TOGGLE (Admin + SuperAdmin)
 * ===========================
 */
router.patch(
  '/:id/toggle-status',
  authenticateToken,
  accessControl(),
  checkPermission(['superadmin', 'admin']),
  planController.togglePlanStatus
);

/**
 * ===========================
 * BOOKING REQUEST ROUTES
 * ===========================
 */

// Member Creates Booking Request (Self-Service, no branch lock)
router.post(
  '/bookings/request',
  authenticateToken,
  checkPermission(['member']),
  planController.createBookingRequest
);

// Admin / SuperAdmin Views All Booking Requests
router.get(
  '/bookings/requests',
  authenticateToken,
  accessControl(),
  checkPermission(['superadmin', 'admin']),
  planController.getBookingRequests
);

// Approve Booking
router.patch(
  '/bookings/:id/approve',
  authenticateToken,
  accessControl(),
  checkPermission(['superadmin', 'admin']),
  planController.approveBooking
);

// Reject Booking
router.patch(
  '/bookings/:id/reject',
  authenticateToken,
  accessControl(),
  checkPermission(['superadmin', 'admin']),
  planController.rejectBooking
);

module.exports = router;
