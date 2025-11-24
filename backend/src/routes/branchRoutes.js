const express = require('express');
const router = express.Router();

// Controllers
const branchController = require('../controllers/branchController');

// Middlewares
const uploadMiddleware = require('../middlewares/uploadMiddleware');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { accessControl, checkPermission } = require('../middlewares/accessControl.middleware');

// ----------------------------------------
// Common Middleware Groups (DEBUG FRIENDLY)
// ----------------------------------------

console.log("🔐 [Routes] Initializing Branch Route Middlewares...");

// Authenticated + Role + Branch Scoped Users
const protect = [
  (req, res, next) => { console.log("🔑 [Middleware] authenticateToken → protect"); next(); },
  authenticateToken,
  (req, res, next) => { console.log("🛂 [Middleware] accessControl() → protect"); next(); },
  accessControl()
];

// SuperAdmin/ Admin Only Section
const superAdminOnly = [
  (req, res, next) => { console.log("👑 [Middleware] authenticateToken → superAdminOnly"); next(); },
  authenticateToken,
  (req, res, next) => { console.log("🛂 [Middleware] accessControl() → superAdminOnly"); next(); },
  accessControl(),
  (req, res, next) => { console.log("🎟️ [Middleware] checkPermission(['superadmin','admin'])"); next(); },
  checkPermission(['superadmin', 'admin'])
];

// ----------------------------------------
// Branch Routes (DEBUG LOGS)
// ----------------------------------------

// Get all branches
router.get('/', protect, (req, res, next) => {
  console.log("📌 [Route] GET /api/v1/branches");
  return branchController.getBranches(req, res, next);
});

// Get available admins (superadmin only)
router.get('/available-admins', superAdminOnly, (req, res, next) => {
  console.log("📌 [Route] GET /api/v1/branches/available-admins");
  return branchController.getAvailableAdmins(req, res, next);
});

// Create a branch (superadmin only)
router.post('/', superAdminOnly, uploadMiddleware, (req, res, next) => {
  console.log("📌 [Route] POST /api/v1/branches → Create Branch");
  console.log("🖼️ Upload Middleware Applied");
  return branchController.createBranch(req, res, next);
});

// Update branch info (superadmin only)
router.put('/:id', superAdminOnly, uploadMiddleware, (req, res, next) => {
  console.log(`📌 [Route] PUT /api/v1/branches/${req.params.id} → Update Branch`);
  console.log("🖼️ Upload Middleware Applied");
  return branchController.updateBranch(req, res, next);
});

// Delete branch (superadmin only)
router.delete('/:id', superAdminOnly, (req, res, next) => {
  console.log(`📌 [Route] DELETE /api/v1/branches/${req.params.id}`);
  return branchController.deleteBranch(req, res, next);
});

module.exports = router;
