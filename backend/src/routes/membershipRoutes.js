const express = require('express');
const router = express.Router();

const membershipController = require('../controllers/membershipController');

// Middlewares
const { authenticateToken } = require('../middlewares/auth.middleware');
const { accessControl, checkPermission } = require('../middlewares/accessControl.middleware');

// =====================================================
// 🔎 DEBUG Helper (Never change business logic)
// =====================================================
const debugRoute = (label) => (req, res, next) => {
  console.log(`\n📍 [MEMBERSHIP ROUTE] ${label}`);
  console.log("👤 User:", req.user ? {
    id: req.user.id,
    role: req.user.role,
    branchId: req.user.branchId
  } : "Unauthenticated");
  console.log("🏢 Filters:", req.accessFilters || "No Branch Filter");
  console.log("📎 Params:", req.params);
  console.log("📎 Query:", req.query);
  console.log("📎 Body:", req.body);
  next();
};

// =====================================================
// 🔐 ROUTE GUARDS
// =====================================================

// 🟨 Any logged in user WITH branch filtering (like trainers/receptionist)
const protect = [
  authenticateToken,
  accessControl()
];

// 🟥 Only superadmin + admin can Add/Edit/Delete
const adminOnly = [
  authenticateToken,
  accessControl(),
  checkPermission(['superadmin', 'admin'])
];

// =====================================================
// 📌 MEMBERSHIP ROUTES
// =====================================================

// 📌 Get all memberships (filtered for non-superadmin)
router.get('/', debugRoute("GET ALL MEMBERSHIPS"), protect, membershipController.getAllMemberships);

// 📌 Get membership by ID (filtered for non-superadmin)
router.get('/:id', debugRoute("GET MEMBERSHIP BY ID"), protect, membershipController.getMembershipById);

// 📌 Create membership (only admins/superadmins)
router.post('/', debugRoute("CREATE MEMBERSHIP"), adminOnly, membershipController.createMembership);

// 📌 Update membership (only admins/superadmins)
router.put('/:id', debugRoute("UPDATE MEMBERSHIP"), adminOnly, membershipController.updateMembership);

// 📌 Delete membership (only admins/superadmins)
router.delete('/:id', debugRoute("DELETE MEMBERSHIP"), adminOnly, membershipController.deleteMembership);

module.exports = router;
