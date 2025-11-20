const express = require('express');
const router = express.Router();

// Controllers
const branchPlanController = require('../controllers/branchPlanController');

// Middlewares
const { authenticateToken } = require('../middlewares/auth.middleware');
const { accessControl, checkPermission } = require('../middlewares/accessControl.middleware');

// ----------------------------------------
// Common Middlewares
// ----------------------------------------
const protect = [authenticateToken, accessControl()];
const adminOnly = [authenticateToken, accessControl(), checkPermission(['admin'])];

// ----------------------------------------
// Branch Plan CRUD Routes
// ----------------------------------------

// Get all branch plans
router.get('/', protect, branchPlanController.getBranchPlans);

// Get single branch plan
router.get('/:id', protect, branchPlanController.getBranchPlan);

// Create a branch plan (admin only)
router.post('/', adminOnly, branchPlanController.createBranchPlan);

// Update branch plan (admin only)
router.put('/:id', adminOnly, branchPlanController.updateBranchPlan);

// Delete branch plan (admin only)
router.delete('/:id', adminOnly, branchPlanController.deleteBranchPlan);

// Toggle status (Enable / Disable)
router.patch('/:id/toggle-status', adminOnly, branchPlanController.toggleBranchPlanStatus);

// ----------------------------------------
// Branch Booking Request Routes
// ----------------------------------------

// Get booking requests list
router.get('/bookings/requests', adminOnly, branchPlanController.getBranchBookingRequests);

// Approve a specific booking request
router.patch('/bookings/:id/approve', adminOnly, branchPlanController.approveBranchBooking);

// Reject a specific booking request
router.patch('/bookings/:id/reject', adminOnly, branchPlanController.rejectBranchBooking);

module.exports = router;
