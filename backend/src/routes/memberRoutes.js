const express = require("express");
const router = express.Router();

// Controllers
const memberController = require("../controllers/memberController");
const classScheduleController = require("../controllers/classScheduleController");


// Middlewares
const { memberUpload } = require("../middlewares/uploadMiddleware");
const { authenticateToken } = require("../middlewares/auth.middleware");
const {
  accessControl,
  checkPermission,
} = require("../middlewares/accessControl.middleware");
const { memberSelfService } = require("../middlewares/memberSelfService.middleware");

// =========================================================
// 🛡️ COMMON DEBUG HELPER (Logs route + user + filters)
// =========================================================
const debugRoute = (label) => (req, res, next) => {
  console.log(`\n🚦[ROUTE HIT] ${label}`);
  console.log("👤 User:", req.user ? {
    id: req.user.id,
    role: req.user.role,
    branchId: req.user.branchId
  } : "No User");
  console.log("📌 Filters:", req.accessFilters || "No Filters");
  console.log("📎 Params:", req.params);
  console.log("📎 Query:", req.query);
  console.log("📎 Body:", req.body);
  next();
};

// =========================================================
// 🔐 MIDDLEWARE GROUPS (unchanged + debug keeps them transparent)
// =========================================================

// Logged in + normal branch filtering
const protect = [
  authenticateToken,
  accessControl(),
];

// Logged in + must apply branch filter always
const protectWithFilter = [
  authenticateToken,
  accessControl({ includeUserFilter: true }),
];

// Admin or Superadmin only
const adminOnly = [
  authenticateToken,
  accessControl(),
  checkPermission(["superadmin", "admin"]),
];

// Admin or Superadmin + branch filter applied
const adminWithFilter = [
  authenticateToken,
  accessControl({ includeUserFilter: true }),
  checkPermission(["superadmin", "admin"]),
];

// =========================================================
// 📌 ROUTES WITH DEBUG LOGS
// =========================================================

// 📌 MEMBER SELF-SERVICE ROUTES (must come before generic routes)
router.get(
  "/me/profile",
  debugRoute("GET MY PROFILE"),
  memberSelfService,
  memberController.getMyProfile
);

router.put(
  "/me/profile",
  debugRoute("UPDATE MY PROFILE"),
  memberSelfService,
  memberUpload,
  memberController.updateMyProfile
);

router.put(
  "/me/change-password",
  debugRoute("CHANGE MY PASSWORD"),
  memberSelfService,
  memberController.changeMyPassword
);

// 📌 ADMIN MEMBER MANAGEMENT ROUTES
router.get("/", debugRoute("GET ALL MEMBERS"), protect, memberController.getMembers);

router.get("/:id", debugRoute("GET SINGLE MEMBER"), protectWithFilter, memberController.getMemberById);

router.post(
  "/",
  debugRoute("CREATE MEMBER"),
  adminOnly,
  memberUpload,
  memberController.createMember
);

router.put(
  "/:id",
  debugRoute("UPDATE MEMBER"),
  adminWithFilter,
  memberUpload,
  memberController.updateMember
);

router.put(
  "/:id/activate",
  debugRoute("ACTIVATE/DEACTIVATE MEMBER"),
  protectWithFilter,
  memberController.activateMember
);

router.delete(
  "/:id",
  debugRoute("DELETE MEMBER"),
  adminWithFilter,
  memberController.deleteMember
);

// 📌 MEMBER GROUP CLASS ROUTES
router.get(
  "/group-classes",
  debugRoute("GET WEEKLY GROUP CLASSES"),
  memberSelfService,
  classScheduleController.getWeeklyGroupClasses
);

router.post(
  "/group-classes/:id/book",
  debugRoute("BOOK GROUP CLASS"),
  memberSelfService,
  classScheduleController.bookGroupClass
);

module.exports = router;
