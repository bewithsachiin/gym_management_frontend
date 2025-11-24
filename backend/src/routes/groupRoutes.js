const express = require('express');
const router = express.Router();

const groupController = require('../controllers/groupController');
const { groupUpload } = require('../middlewares/uploadMiddleware');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { accessControl, checkPermission } = require('../middlewares/accessControl.middleware');

// ========================================
// VIEW ACCESS: ALL STAFF (only own branch if not superadmin)
// superadmin | admin | trainers | receptionist
// ========================================
const viewOnly = [
  authenticateToken,
  accessControl(),
  (req, res, next) => {
    console.log(`👁️ [GROUP VIEW] role=${req.user.role}, branch=${req.user.branchId}`);
    next();
  }
];

// ========================================
// MODIFY ACCESS: superadmin + admin only
// ========================================
const adminOnly = [
  authenticateToken,
  accessControl(),
  checkPermission(['superadmin', 'admin']),
  (req, res, next) => {
    console.log(`✏️ [GROUP MODIFY] role=${req.user.role}, branch=${req.user.branchId}`);
    next();
  }
];

// ========================================
// ROUTES
// ========================================

// VIEW groups
router.get('/', viewOnly, groupController.getGroups);
router.get('/:id', viewOnly, groupController.getGroup);

// MODIFY groups
router.post('/', adminOnly, groupUpload, groupController.createGroup);
router.put('/:id', adminOnly, groupUpload, groupController.updateGroup);
router.delete('/:id', adminOnly, groupController.deleteGroup);

module.exports = router;
