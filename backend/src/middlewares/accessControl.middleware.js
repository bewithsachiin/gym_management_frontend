const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ROLE + BRANCH ACCESS CONTROL
const accessControl = (options = {}) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({ success: false, message: "User not authenticated" });
      }

      const role = user.role;
      const userId = user.id;
      const branchId = user.branchId ? parseInt(user.branchId) : null;

      // Save basic access properties for use in service/controller
      req.accessFilters = {
        userRole: role,
        userBranchId: branchId,
        userId,
        isSuperAdmin: role === "superadmin",
        isAdmin: role === "admin",
        isTrainer: role === "generaltrainer" || role === "personaltrainer",
        isStaff: ["housekeeping", "receptionist"].includes(role),
        isMember: role === "member",
      };

      // Default filters
      req.queryFilters = {};

      // ROLE RULES
      if (role === "superadmin") {
        req.queryFilters = {}; // no restriction
      } 
      else if (role === "admin") {
        if (!branchId) {
          return res.status(403).json({ success: false, message: "Admin must be assigned to a branch" });
        }
        req.queryFilters.branchId = branchId;
      } 
      else {
        if (!branchId) {
          return res.status(403).json({ success: false, message: "User must be assigned to a branch" });
        }
        req.queryFilters.branchId = branchId;

        if (options.includeUserFilter) {
          req.queryFilters.userId = userId;
        }
      }

      // BRANCH VALIDATION IN REQUEST
      const requestedBranch =
        req.params.branchId || req.body.branchId || req.query.branchId;

      if (requestedBranch && role !== "superadmin") {
        if (parseInt(requestedBranch) !== branchId) {
          return res.status(403).json({
            success: false,
            message: "Access denied: Branch isolation enforced",
          });
        }
      }

      // MEMBER-LEVEL ACCESS VALIDATION (only for /members routes)
      const requestedUser =
        req.params.id || req.body.userId || req.query.userId;

      const isMemberRoute =
        req.originalUrl.includes("/members") &&
        !req.originalUrl.includes("/members/group-classes");

      if (requestedUser && isMemberRoute) {
        const targetId = parseInt(requestedUser);

        // User accessing own data is allowed
        if (targetId === userId) return next();

        // Superadmin allowed
        if (role === "superadmin") return next();

        // Admin: Only user from same branch
        if (role === "admin" && branchId) {
          try {
            const result = await prisma.user.findUnique({
              where: { id: targetId },
              select: { branchId: true },
            });

            if (!result || result.branchId !== branchId) {
              return res.status(403).json({
                success: false,
                message: "Access denied: Can only manage users in your branch",
              });
            }
            return next();
          } catch (err) {
            return res.status(500).json({ success: false, message: "Access control error" });
          }
        }

        // All others denied
        return res.status(403).json({
          success: false,
          message: "Access denied: Can only access your own data",
        });
      }

      return next();
    } catch (error) {
      return res.status(500).json({ success: false, message: "Access control error" });
    }
  };
};

// CHECK SPECIFIC ROLE OR PERMISSIONS
const checkPermission = (roles = [], permissions = [], options = {}) => {
  return async (req, res, next) => {
    const access = req.accessFilters;
    if (!access || !access.userRole) {
      return res.status(401).json({ success: false, message: "Access filters not set" });
    }

    const userRole = access.userRole;
    const userId = access.userId;

    // SuperAdmin allowed always
    if (userRole === "superadmin") return next();

    // Static Role Check
    if (roles.length > 0 && !roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions for this action",
      });
    }

    // Dynamic Staff Permission Check
    const staffRoles = ["generaltrainer", "personaltrainer", "housekeeping", "receptionist"];
    const isStaff = staffRoles.includes(userRole);

    if (permissions.length > 0 && isStaff) {
      try {
        const staff = await prisma.staff.findFirst({
          where: { userId },
          include: { role: true },
        });

        if (!staff || !staff.role || !Array.isArray(staff.role.permissions)) {
          return res.status(403).json({ success: false, message: "Staff role not found" });
        }

        const userPermissions = staff.role.permissions;
        const hasPermission = permissions.some((perm) => userPermissions.includes(perm));

        if (!hasPermission) {
          return res.status(403).json({
            success: false,
            message: "Insufficient permissions for this action",
          });
        }

        return next();
      } catch (error) {
        return res.status(500).json({ success: false, message: "Permission check error" });
      }
    }

    return next();
  };
};

module.exports = {
  accessControl,
  checkPermission,
};
