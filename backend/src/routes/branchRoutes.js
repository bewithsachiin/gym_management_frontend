const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');
const uploadMiddleware = require('../middleware/uploadMiddleware');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth.middleware');

router.get('/', authenticateToken, authorizeRoles('SUPERADMIN'), branchController.getBranches);
router.post('/', authenticateToken, authorizeRoles('SUPERADMIN'), uploadMiddleware, branchController.createBranch);
router.put('/:id', authenticateToken, authorizeRoles('SUPERADMIN'), uploadMiddleware, branchController.updateBranch);
router.delete('/:id', authenticateToken, authorizeRoles('SUPERADMIN'), branchController.deleteBranch);

module.exports = router;
