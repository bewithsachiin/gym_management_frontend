const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { staffUpload } = require('../middleware/uploadMiddleware');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth.middleware');

router.get('/', authenticateToken, authorizeRoles('SUPERADMIN'), staffController.getStaff);
router.post('/', authenticateToken, authorizeRoles('SUPERADMIN'), staffUpload, staffController.createStaff);
router.put('/:id', authenticateToken, authorizeRoles('SUPERADMIN'), staffUpload, staffController.updateStaff);
router.delete('/:id', authenticateToken, authorizeRoles('SUPERADMIN'), staffController.deleteStaff);

module.exports = router;
