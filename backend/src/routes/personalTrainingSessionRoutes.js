const express = require('express');
const router = express.Router();
const controller = require('../controllers/personalTrainingSessionController');

const { authenticateToken } = require('../middlewares/auth.middleware');
const { accessControl, checkPermission } = require('../middlewares/accessControl.middleware');

// ================= STATIC =================

// Trainers List
router.get('/trainers/list',
  authenticateToken,
  accessControl(),
  controller.getTrainers
);

// Members List
router.get('/members/list',
  authenticateToken,
  accessControl(),
  controller.getMembersForSessions
);

// ================= CRUD =================

// All sessions
router.get('/',
  authenticateToken,
  accessControl(),
  controller.getSessions
);

// Single session by ID (Number Only)
router.get('/:id(\\d+)',
  authenticateToken,
  accessControl(),
  controller.getSessionById
);

// Create session
router.post('/',
  authenticateToken,
  accessControl(),
  checkPermission(['superadmin', 'admin', 'personaltrainer']),
  controller.createSession
);

// Update session
router.put('/:id(\\d+)',
  authenticateToken,
  accessControl(),
  checkPermission(['superadmin', 'admin', 'personaltrainer']),
  controller.updateSession
);

// Delete session (Trainer Cannot Delete)
router.delete('/:id(\\d+)',
  authenticateToken,
  accessControl(),
  checkPermission(['superadmin', 'admin']),
  controller.deleteSession
);

module.exports = router;
