const express = require('express');
const router = express.Router();

const groupController = require('../controllers/groupController');
const { groupUpload } = require('../middlewares/uploadMiddleware');

const { authenticateToken } = require('../middlewares/auth.middleware');
const { accessControl, checkPermission } = require('../middlewares/accessControl.middleware');

// -------------------------------------------------------------
// COMMON MIDDLEWARE PRESETS
// -------------------------------------------------------------
const protect = [authenticateToken, accessControl()];
const adminOnly = [
  authenticateToken,
  accessControl(),
  checkPermission(['superadmin', 'admin'])
];

// -------------------------------------------------------------
// GROUP CRUD ROUTES
// -------------------------------------------------------------

// Get all groups
router.get('/', protect, groupController.getGroups);

// Get single group
router.get('/:id', protect, groupController.getGroup);

// Create new group (superadmin/admin)
router.post('/', adminOnly, groupUpload, groupController.createGroup);

// Update group (superadmin/admin)
router.put('/:id', adminOnly, groupUpload, groupController.updateGroup);

// Delete group (superadmin/admin)
router.delete('/:id', adminOnly, groupController.deleteGroup);

module.exports = router;
