const express = require('express');
const router = express.Router();
const staffRoleController = require('../controllers/staffRoleController');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { checkPermission } = require('../middlewares/accessControl.middleware');

router.get('/', authenticateToken, checkPermission(['superadmin']), staffRoleController.getStaffRoles);
router.post('/', authenticateToken, checkPermission(['superadmin']), staffRoleController.createStaffRole);
router.put('/:id', authenticateToken, checkPermission(['superadmin']), staffRoleController.updateStaffRole);
router.delete('/:id', authenticateToken, checkPermission(['superadmin']), staffRoleController.deleteStaffRole);

module.exports = router;
