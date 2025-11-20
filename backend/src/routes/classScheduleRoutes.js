const express = require('express');
const router = express.Router();

const classScheduleController = require('../controllers/classScheduleController');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { accessControl, checkPermission } = require('../middlewares/accessControl.middleware');

// COMMON MIDDLEWARE SHORTCUTS
const protect = [authenticateToken, accessControl()];
const adminOnly = [authenticateToken, accessControl(), checkPermission(['superadmin', 'admin'])];

// ROUTES
router.get('/', protect, classScheduleController.getClasses);
router.get('/trainers', adminOnly, classScheduleController.getTrainers);
router.get('/:id', protect, classScheduleController.getClass);

router.post('/', adminOnly, classScheduleController.createClass);
router.put('/:id', adminOnly, classScheduleController.updateClass);
router.delete('/:id', adminOnly, classScheduleController.deleteClass);

module.exports = router;
