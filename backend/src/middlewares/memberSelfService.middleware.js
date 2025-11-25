const { authenticateToken } = require("./auth.middleware");

const memberSelfService = [
  authenticateToken, // Always check token first

  (req, res, next) => {
    const user = req.user;

    // Should not happen if authenticateToken works, but safe check
    if (!user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const role = user.role ? String(user.role).toLowerCase() : "";

    // Only members allowed (no staff, no admin)
    if (role !== "member") {
      return res.status(403).json({ success: false, message: "Access restricted to members only" });
    }

    // Assign strict filters for self-service access
    const branchId = user.branchId ? parseInt(user.branchId) : null;

    req.accessFilters = {
      userRole: "member",
      userBranchId: branchId,
      userId: user.id,

      // all other permissions disabled
      isSuperAdmin: false,
      isAdmin: false,
      isTrainer: false,
      isStaff: false,
      isMember: true
    };

    return next();
  }
];

module.exports = { memberSelfService };
