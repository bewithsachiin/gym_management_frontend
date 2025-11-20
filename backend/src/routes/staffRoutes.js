const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { staffUpload } = require('../middlewares/uploadMiddleware');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { accessControl, checkPermission } = require('../middlewares/accessControl.middleware');

router.get('/', authenticateToken, accessControl(), staffController.getStaff);
router.post('/', authenticateToken, accessControl(), checkPermission(['superadmin',"admin"]), staffUpload, staffController.createStaff);
router.put('/:id', authenticateToken, accessControl(), checkPermission(['superadmin',"admin"]), staffUpload, staffController.updateStaff);
router.delete('/:id', authenticateToken, accessControl(), checkPermission(['superadmin',"admin"]), staffController.deleteStaff);

module.exports = router;
