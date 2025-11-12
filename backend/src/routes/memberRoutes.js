const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const { memberUpload } = require('../middleware/uploadMiddleware');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth.middleware');

router.get('/', authenticateToken, authorizeRoles('SUPERADMIN'), memberController.getMembers);
router.post('/', authenticateToken, authorizeRoles('SUPERADMIN'), memberUpload, memberController.createMember);
router.put('/:id', authenticateToken, authorizeRoles('SUPERADMIN'), memberUpload, memberController.updateMember);
router.delete('/:id', authenticateToken, authorizeRoles('SUPERADMIN'), memberController.deleteMember);

module.exports = router;
