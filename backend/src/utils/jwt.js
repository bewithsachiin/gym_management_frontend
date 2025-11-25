const jwt = require("jsonwebtoken");

// Use secret from .env or fallback simple text (for development)
const JWT_SECRET = process.env.JWT_SECRET || "simple_secret_key";

// Create Token
function generateToken(payload) {
  // Payload must be an object (Entry Level Type Check)
  if (!payload || typeof payload !== "object") {
    throw new Error("Token payload must be an object");
  }

  // Generate and return token (24 hour validity)
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
  return token;
}

// Verify Token
function verifyToken(token) {
  // Token must be a string
  if (!token || typeof token !== "string") {
    throw new Error("Token is required");
  }

  try {
    // Validate token and return decoded data
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    // Standard error - no advanced terms, easy for beginners
    throw new Error("Invalid or expired token");
  }
}

module.exports = {
  generateToken: generateToken,
  verifyToken: verifyToken,
};
