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

// Get session by ID
router.get('/:id',
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

// Update session
router.put('/:id',
  authenticateToken,
  accessControl(),
  checkPermission(['superadmin', 'admin', 'personaltrainer']),
  personalTrainingSessionController.updateSession
);

// Delete session
router.delete('/:id',
  authenticateToken,
  accessControl(),
  checkPermission(['superadmin', 'admin']),
  personalTrainingSessionController.deleteSession
);

module.exports = router;
