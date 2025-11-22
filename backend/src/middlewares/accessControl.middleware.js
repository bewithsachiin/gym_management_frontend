const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Centralized Access Control Middleware
 * Applies global role-based and branch-based filtering to all data operations
 * Ensures users can only access data they are authorized to see
 */
const accessControl = (options = {}) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const { role, branchId: rawBranchId, id: userId } = user;
      const branchId = rawBranchId ? parseInt(rawBranchId) : null;

      // Debug logging
      console.log(`🔐 Access Control - User: ${userId}, Role: ${role}, Branch: ${branchId || 'N/A'}`);

      // Store access filters in req for use in controllers/services
      req.accessFilters = {
        userRole: role,
        userBranchId: branchId,
        userId: userId,
        isSuperAdmin: role === 'superadmin',
        isAdmin: role === 'admin',
        isTrainer: ['generaltrainer', 'personaltrainer'].includes(role),
        isStaff: ['housekeeping', 'receptionist'].includes(role),
        isMember: role === 'member'
      };

      // Apply global query filters based on role
      req.queryFilters = {};

      if (role === 'superadmin') {
        // SuperAdmin: No restrictions - can see everything
        console.log('🔓 SuperAdmin access - No filters applied');
        req.queryFilters = {};
      } else if (role === 'admin') {
        // Admin: Can only see data from their branch
        if (!branchId) {
          return res.status(403).json({ success: false, message: 'Admin must be assigned to a branch' });
        }
        req.queryFilters.branchId = branchId;
        console.log(`🏢 Admin access - Filtered to branch: ${branchId}`);
      } else {
        // Other roles: Can only see their own data and branch-related data
        if (!branchId) {
          return res.status(403).json({ success: false, message: 'User must be assigned to a branch' });
        }

        // For most operations, filter by branch
        req.queryFilters.branchId = branchId;

        // For user-specific data, also filter by userId
        if (options.includeUserFilter) {
          req.queryFilters.userId = userId;
        }

        console.log(`👤 ${role} access - Filtered to branch: ${branchId}, user: ${userId}`);
      }

      // Validate branch access for operations that specify a branch
      if (req.params.branchId || req.body.branchId || req.query.branchId) {
        const requestedBranchId = req.params.branchId || req.body.branchId || req.query.branchId;

        if (role !== 'superadmin' && requestedBranchId != branchId) {
          console.log(`🚫 Access denied - User branch: ${branchId}, Requested branch: ${requestedBranchId}`);
          return res.status(403).json({ success: false, message: 'Access denied: Branch isolation enforced' });
        }
      }

      // Validate user access for operations on specific users (only for user-related endpoints)
      if ((req.params.id || req.body.userId || req.query.userId) && req.originalUrl.includes('/members')) {
        const targetUserId = req.params.id || req.body.userId || req.query.userId;

        // Allow access to own data
        if (targetUserId == userId) {
          console.log(`✅ User accessing own data: ${userId}`);
        } else if (role === 'superadmin') {
          console.log(`✅ SuperAdmin accessing user data: ${targetUserId}`);
        } else if (role === 'admin' && branchId) {
          // Admin can access users in their branch
          const targetUser = await prisma.user.findUnique({
            where: { id: parseInt(targetUserId) },
            select: { branchId: true }
          });

          if (!targetUser || targetUser.branchId != branchId) {
            console.log(`🚫 Admin access denied - Target user branch: ${targetUser?.branchId}, Admin branch: ${branchId}`);
            return res.status(403).json({ success: false, message: 'Access denied: Can only manage users in your branch' });
          }
          console.log(`✅ Admin accessing branch user data: ${targetUserId}`);
        } else {
          console.log(`🚫 Access denied - User ${userId} trying to access user ${targetUserId}`);
          return res.status(403).json({ success: false, message: 'Access denied: Can only access your own data' });
        }
      }

      console.log(`✅ Access granted - Applied filters:`, req.queryFilters);
      next();

    } catch (error) {
      console.error('❌ Access Control Error:', error);
      return res.status(500).json({ success: false, message: 'Access control error' });
    }
  };
};

/**
 * Permission checker for specific actions
 */
const checkPermission = (requiredRoles = [], requiredPermissions = [], options = {}) => {
  return async (req, res, next) => {
    const userRole = req.accessFilters?.userRole;
    const userId = req.accessFilters?.userId;

    if (!userRole) {
      return res.status(401).json({ success: false, message: 'Access filters not set' });
    }

    // SuperAdmin has all permissions
    if (userRole === 'superadmin') {
      console.log(`✅ SuperAdmin permission granted for action`);
      return next();
    }

    // Check if user role is in required roles
    if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
      console.log(`🚫 Permission denied - Required roles: ${requiredRoles.join(', ')}, User: ${userRole}`);
      return res.status(403).json({ success: false, message: 'Insufficient permissions for this action' });
    }

    // For staff roles, check dynamic permissions
    if (requiredPermissions.length > 0 && ['generaltrainer', 'personaltrainer', 'housekeeping', 'receptionist'].includes(userRole)) {
      try {
        // Get user's staff role permissions
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();

        const staff = await prisma.staff.findFirst({
          where: { userId: userId },
          include: { role: true }
        });

        if (!staff || !staff.role) {
          console.log(`🚫 No staff role found for user: ${userId}`);
          return res.status(403).json({ success: false, message: 'Staff role not found' });
        }

        const userPermissions = staff.role.permissions || [];
        const hasRequiredPermission = requiredPermissions.some(perm => userPermissions.includes(perm));

        if (!hasRequiredPermission) {
          console.log(`🚫 Permission denied - Required permissions: ${requiredPermissions.join(', ')}, User permissions: ${userPermissions.join(', ')}`);
          return res.status(403).json({ success: false, message: 'Insufficient permissions for this action' });
        }

        console.log(`✅ Staff permission granted - Permissions: ${userPermissions.join(', ')}`);
      } catch (error) {
        console.error('Error checking staff permissions:', error);
        return res.status(500).json({ success: false, message: 'Permission check error' });
      }
    }

    // Additional checks for branch operations
    if (options.requireBranch && !req.accessFilters?.userBranchId) {
      return res.status(403).json({ success: false, message: 'Branch assignment required for this action' });
    }

    console.log(`✅ Permission granted - Role: ${userRole}, Action allowed`);
    next();
  };
};

module.exports = {
  accessControl,
  checkPermission
};
