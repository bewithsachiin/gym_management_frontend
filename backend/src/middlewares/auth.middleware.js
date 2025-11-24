const { verifyToken } = require('../utils/jwt');

const authenticateToken = async (req, res, next) => {
  console.log("🔐 [Middleware] authenticateToken");
  try {
    const authHeader = req.headers['authorization'];
    console.log("🔎 Token Header:", authHeader);
    
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      console.log("⛔ No token provided");
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = verifyToken(token);
    console.log("🔓 Token Decoded:", decoded?.id);
    req.user = decoded;
    return next();

  } catch (error) {
    console.error("❌ Invalid Token");
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const roleAuthorization = (allowedRoles) => {
  return async (req, res, next) => {
    console.log("🛑 [Middleware] roleAuthorization");

    const userRole = req.user?.role;
    console.log("🎭 User Role:", userRole);

    if (!userRole || !allowedRoles.includes(userRole)) {
      console.log("🚫 Role blocked");
      return res.status(403).json({ message: 'Forbidden' });
    }

    return next();
  };
};

const branchAccessCheck = async (req, res, next) => {
  console.log("🏢 [Middleware] branchAccessCheck");

  try {
    const user = req.user;
    const branchId = req.params.branchId || req.body.branchId || req.query.branchId;
    console.log("🌿 User Branch:", user.branchId, "| Request Branch:", branchId);

    if (user.role === 'superadmin') return next();
    if (user.role === 'admin' && user.branchId == branchId) return next();
    if (user.role === 'user' && user.branchId == branchId && user.id == req.params.id) return next();

    console.log("⛔ Branch Access Denied");
    return res.status(403).json({ message: 'Branch access denied' });

  } catch {
    console.log("❌ Branch Access Error");
    return res.status(403).json({ message: 'Branch access denied' });
  }
};

module.exports = {
  authenticateToken,
  roleAuthorization,
 branchAccessCheck,
};
