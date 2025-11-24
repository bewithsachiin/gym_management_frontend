const express = require('express');
const router = express.Router();

// Controllers
const branchPlanController = require('../controllers/branchPlanController');

// Middlewares
const { authenticateToken } = require('../middlewares/auth.middleware');
const { accessControl, checkPermission } = require('../middlewares/accessControl.middleware');

// ----------------------------------------
// Common Middlewares (DEBUG FRIENDLY)
// ----------------------------------------

console.log("🔐 [Routes] Initializing Branch Plan Route Middlewares...");

// Normal protected user (branch scoped)
const protect = [
  (req, res, next) => { console.log("🔑 [Middleware] authenticateToken → protect"); next(); },
  authenticateToken,
  (req, res, next) => { console.log("🛂 [Middleware] accessControl() → protect"); next(); },
  accessControl()
];

// Only Admin allowed
const adminOnly = [
  (req, res, next) => { console.log("👑 [Middleware] authenticateToken → adminOnly"); next(); },
  authenticateToken,
  (req, res, next) => { console.log("🛂 [Middleware] accessControl() → adminOnly"); next(); },
  accessControl(),
  (req, res, next) => { console.log("🎟️ [Middleware] checkPermission(['admin'])"); next(); },
  checkPermission(['admin'])
];

// ----------------------------------------
// Branch Plan CRUD Routes (DEBUG LOGS)
// ----------------------------------------

// Get all branch plans
router.get('/', protect, (req, res, next) => {
  console.log("📌 [Route] GET /api/v1/branch-plans");
  return branchPlanController.getBranchPlans(req, res, next);
});

// Get single branch plan
router.get('/:id', protect, (req, res, next) => {
  console.log(`📌 [Route] GET /api/v1/branch-plans/${req.params.id}`);
  return branchPlanController.getBranchPlan(req, res, next);
});

// Create branch plan (admin only)
router.post('/', adminOnly, (req, res, next) => {
  console.log("🧾 [Route] POST /api/v1/branch-plans → Create Branch Plan");
  return branchPlanController.createBranchPlan(req, res, next);
});

// Update branch plan
router.put('/:id', adminOnly, (req, res, next) => {
  console.log(`📝 [Route] PUT /api/v1/branch-plans/${req.params.id} → Update Branch Plan`);
  return branchPlanController.updateBranchPlan(req, res, next);
});

// Delete branch plan
router.delete('/:id', adminOnly, (req, res, next) => {
  console.log(`🗑️ [Route] DELETE /api/v1/branch-plans/${req.params.id}`);
  return branchPlanController.deleteBranchPlan(req, res, next);
});

// Toggle status (Enable / Disable)
router.patch('/:id/toggle-status', adminOnly, (req, res, next) => {
  console.log(`🔁 [Route] PATCH /api/v1/branch-plans/${req.params.id}/toggle-status`);
  return branchPlanController.toggleBranchPlanStatus(req, res, next);
});

// ----------------------------------------
// Branch Booking Request Routes (DEBUG)
// ----------------------------------------

// Get booking requests list
router.get('/bookings/requests', adminOnly, (req, res, next) => {
  console.log("📩 [Route] GET /api/v1/branch-plans/bookings/requests");
  return branchPlanController.getBranchPlanBookingRequests(req, res, next);
});

// Approve a booking request
router.patch('/bookings/:id/approve', adminOnly, (req, res, next) => {
  console.log(`🟢 [Route] PATCH /api/v1/branch-plans/bookings/${req.params.id}/approve`);
  return branchPlanController.approveBranchPlanBooking(req, res, next);
});

// Reject a booking request
router.patch('/bookings/:id/reject', adminOnly, (req, res, next) => {
  console.log(`🔴 [Route] PATCH /api/v1/branch-plans/bookings/${req.params.id}/reject`);
  return branchPlanController.rejectBranchPlanBooking(req, res, next);
});

// Create booking request for branch plan (members)
router.post('/bookings/request', protect, (req, res, next) => {
  console.log("📝 [Route] POST /api/v1/branch-plans/bookings/request → Create Branch Plan Booking Request");
  return branchPlanController.createBranchPlanBookingRequest(req, res, next);
});

module.exports = router;
