const express = require('express');
const router = express.Router();
const personalTrainingSessionController = require('../controllers/personalTrainingSessionController');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { accessControl, checkPermission } = require('../middlewares/accessControl.middleware');

// ------------------------------
// STATIC ROUTES FIRST (AVOID /:id conflict)
// ------------------------------

// Get trainers for dropdown
router.get('/trainers/list',
  authenticateToken,
  accessControl(),
  personalTrainingSessionController.getTrainers
);

// Get members for dropdown
router.get('/members/list',
  authenticateToken,
  accessControl(),
  personalTrainingSessionController.getMembersForSessions
);

// ------------------------------
// MAIN CRUD ROUTES
// ------------------------------

// Get all sessions (calendar & list view)
router.get('/',
  authenticateToken,
  accessControl(),
  personalTrainingSessionController.getSessions
);

// Get session by ID (restrict to number only)
router.get('/:id(\\d+)',
  authenticateToken,
  accessControl(),
  personalTrainingSessionController.getSessionById
);

// Create new session
router.post('/',
  authenticateToken,
  accessControl(),
  checkPermission(['superadmin', 'admin', 'personaltrainer']),
  personalTrainingSessionController.createSession
);

// Update session (restrict to number only)
router.put('/:id(\\d+)',
  authenticateToken,
  accessControl(),
  checkPermission(['superadmin', 'admin', 'personaltrainer']),
  personalTrainingSessionController.updateSession
);

// Delete session (restrict to number only)
router.delete('/:id(\\d+)',
  authenticateToken,
  accessControl(),
  checkPermission(['superadmin', 'admin']),
  personalTrainingSessionController.deleteSession
);

module.exports = router;
