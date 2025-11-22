const express = require('express');
const router = express.Router();

// Controllers
const branchController = require('../controllers/branchController');

// Middlewares
const uploadMiddleware = require('../middlewares/uploadMiddleware');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { accessControl, checkPermission } = require('../middlewares/accessControl.middleware');

// ----------------------------------------
// Common Middleware Groups
// ----------------------------------------

// Normal authenticated + role-validated user
const protect = [authenticateToken, accessControl()];

// Only superadmin allowed
const superAdminOnly = [authenticateToken, accessControl(), checkPermission(['superadmin','admin'])];

// ----------------------------------------
// Branch Routes
// ----------------------------------------

// Get all branches
router.get('/', protect, branchController.getBranches);

// Get available admins (superadmin only)
router.get('/available-admins', superAdminOnly, branchController.getAvailableAdmins);

// Create a branch (superadmin only)
router.post('/', superAdminOnly, uploadMiddleware, branchController.createBranch);

// Update branch info (superadmin only)
router.put('/:id', superAdminOnly, uploadMiddleware, branchController.updateBranch);

// Delete branch (superadmin only)
router.delete('/:id', superAdminOnly, branchController.deleteBranch);

module.exports = router;
