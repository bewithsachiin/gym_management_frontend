const express = require('express');
const router = express.Router();

const classScheduleController = require('../controllers/classScheduleController');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { accessControl, checkPermission } = require('../middlewares/accessControl.middleware');

// ===============================
// COMMON MIDDLEWARE SHORTCUTS
// ===============================

// Anyone logged in (All roles valid for view)
const protect = [authenticateToken, accessControl()];

// Roles who can modify class (NOT receptionist)
const classManagerOnly = [
  authenticateToken,
  accessControl(),
  checkPermission([
    'superadmin',
    'admin',
    'generaltrainer',
    'personaltrainer'   // 🔥 fixed name (underscore removed)
  ])
];

// ===============================
// ROUTES
// ===============================

// VIEW CLASSES
router.get('/', protect, classScheduleController.getClasses);
router.get('/daily', protect, classScheduleController.getDailyClasses);
router.get('/trainers', classManagerOnly, classScheduleController.getTrainers);
router.get('/:id', protect, classScheduleController.getClass);
router.get('/:id/members', protect, classScheduleController.getClassMembers);

// MODIFY CLASSES (restricted)
router.post('/', classManagerOnly, classScheduleController.createClass);
router.put('/:id', classManagerOnly, classScheduleController.updateClass);
router.delete('/:id', classManagerOnly, classScheduleController.deleteClass);

module.exports = router;
