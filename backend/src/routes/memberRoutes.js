const express = require("express");
const router = express.Router();

// Controllers
const memberController = require("../controllers/memberController");

// Middlewares
const { memberUpload } = require("../middlewares/uploadMiddleware");
const { authenticateToken } = require("../middlewares/auth.middleware");
const {
  accessControl,
  checkPermission,
} = require("../middlewares/accessControl.middleware");


// ------------------------------------------------------------------
// 🔐 COMMON MIDDLEWARE GROUPS
// ------------------------------------------------------------------

// Logged in + normal branch filtering
const protect = [
  authenticateToken,
  accessControl() // auto sets isSuperAdmin + branch filtering
];

// Logged in + must apply branch filter always
const protectWithFilter = [
  authenticateToken,
  accessControl({ includeUserFilter: true })
];

// Admin or Superadmin only
const adminOnly = [
  authenticateToken,
  accessControl(),
  checkPermission(["superadmin", "admin"])
];

// Admin or Superadmin + branch filter applied
const adminWithFilter = [
  authenticateToken,
  accessControl({ includeUserFilter: true }),
  checkPermission(["superadmin", "admin"])
];



// ------------------------------------------------------------------
// 📌 GET ALL MEMBERS    (Auto branch filter)
// ------------------------------------------------------------------
router.get("/", protect, memberController.getMembers);


// ------------------------------------------------------------------
// 📌 GET SINGLE MEMBER  (Auto branch filter unless superadmin)
// ------------------------------------------------------------------
router.get("/:id", protectWithFilter, memberController.getMemberById);


// ------------------------------------------------------------------
// 📌 CREATE MEMBER  (Admin / Superadmin Only)
// ------------------------------------------------------------------
router.post(
  "/",
  adminOnly,
  memberUpload, // handles image upload (Cloudinary)
  memberController.createMember
);


// ------------------------------------------------------------------
// 📌 UPDATE MEMBER  (Admin / Superadmin Only)
// ------------------------------------------------------------------
router.put(
  "/:id",
  adminWithFilter,
  memberUpload,
  memberController.updateMember
);


// ------------------------------------------------------------------
// 📌 ACTIVATE / DEACTIVATE MEMBER
// ------------------------------------------------------------------
router.put(
  "/:id/activate",
  protectWithFilter,
  memberController.activateMember
);


// ------------------------------------------------------------------
// 📌 DELETE MEMBER  (Admin / Superadmin Only)
// ------------------------------------------------------------------
router.delete(
  "/:id",
  adminWithFilter,
  memberController.deleteMember
);


module.exports = router;
