const { verifyToken } = require('../utils/jwt');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const roleAuthorization = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};

const branchAccessCheck = (req, res, next) => {
  const user = req.user;
  const branchId = req.params.branchId || req.body.branchId || req.query.branchId;

  if (user.role === 'superadmin') {
    return next();
  }
  if (user.role === 'admin' && user.branchId == branchId) {
    return next();
  }
  if (user.role === 'user' && user.branchId == branchId && user.id == req.params.id) {
    return next();
  }
  return res.status(403).json({ message: 'Branch access denied' });
};

module.exports = {
  authenticateToken,
  roleAuthorization,
  branchAccessCheck,
};
