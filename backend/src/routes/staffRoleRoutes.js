const express = require('express');
const router = express.Router();
const staffRoleController = require('../controllers/staffRoleController');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { checkPermission, accessControl } = require('../middlewares/accessControl.middleware');

router.get(
  '/',
  authenticateToken,
  accessControl(),
  checkPermission(['superadmin', 'admin']),
  staffRoleController.getStaffRoles
);

router.post(
  '/',
  authenticateToken,
  accessControl(),
  checkPermission(['superadmin', 'admin']),
  staffRoleController.createStaffRole
);

router.put(
  '/:id',
  authenticateToken,
  accessControl(),
  checkPermission(['superadmin', 'admin']),
  staffRoleController.updateStaffRole
);

router.delete(
  '/:id',
  authenticateToken,
  accessControl(),
  checkPermission(['superadmin', 'admin']),
  staffRoleController.deleteStaffRole
);

module.exports = router;
