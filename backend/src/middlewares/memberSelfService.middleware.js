const { authenticateToken } = require("./auth.middleware");

/**
 * Middleware for member self-service routes
 * Allows authenticated members to access their own data without branch restrictions
 */
const memberSelfService = [
  authenticateToken,
  (req, res, next) => {
    // Basic authentication check
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Ensure user is a member (case insensitive)
    if (req.user.role.toLowerCase() !== 'member') {
      return res.status(403).json({ success: false, message: 'Access restricted to members only' });
    }


    // Set basic access filters for member self-service
    req.accessFilters = {
      userRole: req.user.role,
      userBranchId: req.user.branchId ? parseInt(req.user.branchId) : null,
      userId: req.user.id,
      isSuperAdmin: false,
      isAdmin: false,
      isTrainer: false,
      isStaff: false,
      isMember: true
    };

    next();
  }
];

module.exports = {
  memberSelfService
};
