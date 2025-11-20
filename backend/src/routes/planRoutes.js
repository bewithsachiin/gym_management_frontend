const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { accessControl, checkPermission } = require('../middlewares/accessControl.middleware');

// Plan CRUD routes
router.get('/', authenticateToken, accessControl(), planController.getPlans);
router.get('/features', authenticateToken, accessControl(), planController.getFeatures);
router.get('/:id', authenticateToken, accessControl(), planController.getPlan);
router.post('/', authenticateToken, checkPermission(['superadmin']), planController.createPlan);
router.put('/:id', authenticateToken, accessControl(), checkPermission(['superadmin']), planController.updatePlan);
router.delete('/:id', authenticateToken, accessControl(), checkPermission(['superadmin']), planController.deletePlan);

// Plan status toggle
router.patch('/:id/toggle-status', authenticateToken, accessControl(), checkPermission(['superadmin', 'admin']), planController.togglePlanStatus);

// Booking request routes
router.get('/bookings/requests', authenticateToken, accessControl(), checkPermission(['superadmin', 'admin']), planController.getBookingRequests);
router.post('/bookings/request', authenticateToken, checkPermission(['member']), planController.createBookingRequest);
router.patch('/bookings/:id/approve', authenticateToken, checkPermission(['superadmin', 'admin']), planController.approveBooking);
router.patch('/bookings/:id/reject', authenticateToken, checkPermission(['superadmin', 'admin']), planController.rejectBooking);

module.exports = router;
