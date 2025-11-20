const express = require('express');
const router = express.Router();

// Controllers
const memberController = require('../controllers/memberController');

// Middlewares
const { memberUpload } = require('../middlewares/uploadMiddleware');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { accessControl, checkPermission } = require('../middlewares/accessControl.middleware');


// 🛡️ Logged in + role access
const protect = [
  authenticateToken,
  accessControl()
];

// 🛡️ Logged in + role access + user-based filtering
const protectWithFilter = [
  authenticateToken,
  accessControl({ includeUserFilter: true })
];

// 🛡️ Admin & Superadmin only
const adminOnly = [
  authenticateToken,
  accessControl(),
  checkPermission(['superadmin', 'admin'])
];

// 🛡️ Admin or Superadmin + branch filter
const adminWithFilter = [
  authenticateToken,
  accessControl({ includeUserFilter: true }),
  checkPermission(['superadmin', 'admin'])
];


// ----------------------------------------------------
// GET ALL MEMBERS (search + branch based auto filter)
// ----------------------------------------------------
router.get('/', protect, memberController.getMembers);

// ----------------------------------------------------
// GET SINGLE MEMBER (branch restricted unless superadmin)
// ----------------------------------------------------
router.get('/:id', protectWithFilter, memberController.getMemberById);

// ----------------------------------------------------
// CREATE A MEMBER (Admin / Superadmin Only)
// ----------------------------------------------------
router.post(
  '/',
  adminOnly,
  memberUpload,            // For profile image
  memberController.createMember
);

// ----------------------------------------------------
// UPDATE MEMBER (Admin / Superadmin Only)
// ----------------------------------------------------
router.put(
  '/:id',
  adminWithFilter,
  memberUpload,
  memberController.updateMember
);

// ----------------------------------------------------
// TOGGLE ACTIVE / DEACTIVATE MEMBER
// ----------------------------------------------------
router.put(
  '/:id/activate',
  protectWithFilter,
  memberController.activateMember
);

// ----------------------------------------------------
// DELETE MEMBER (Admin / Superadmin Only)
// ----------------------------------------------------
router.delete(
  '/:id',
  adminWithFilter,
  memberController.deleteMember
);

module.exports = router;
