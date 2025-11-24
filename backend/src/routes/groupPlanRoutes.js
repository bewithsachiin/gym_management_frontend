const express = require('express');
const router = express.Router();

const groupPlanController = require('../controllers/groupPlanController');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { accessControl } = require('../middlewares/accessControl.middleware');

// ========================================
// VIEW ACCESS: ALL STAFF (only own branch if not superadmin)
// superadmin | admin | trainers | receptionist
// ========================================
const viewOnly = [
  authenticateToken,
  accessControl(),
  (req, res, next) => {
    console.log(`👁️ [GROUP PLAN VIEW] role=${req.user.role}, branch=${req.user.branchId}`);
    next();
  }
];

// ========================================
// ROUTES
// ========================================

// VIEW group plans
router.get('/', viewOnly, groupPlanController.getGroupPlans);

// VIEW members for a specific group plan
router.get('/:id/members', viewOnly, groupPlanController.getGroupPlanMembers);

module.exports = router;
