const express = require('express');
const router = express.Router();
const staffRoleController = require('../controllers/staffRoleController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth.middleware');

router.get('/', authenticateToken, authorizeRoles('SUPERADMIN'), staffRoleController.getStaffRoles);
router.post('/', authenticateToken, authorizeRoles('SUPERADMIN'), staffRoleController.createStaffRole);
router.put('/:id', authenticateToken, authorizeRoles('SUPERADMIN'), staffRoleController.updateStaffRole);
router.delete('/:id', authenticateToken, authorizeRoles('SUPERADMIN'), staffRoleController.deleteStaffRole);

module.exports = router;
