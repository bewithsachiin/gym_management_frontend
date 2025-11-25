const responseHandler = require("../utils/responseHandler");

const errorHandler = (err, req, res, next) => {
  console.error("Error:", err?.stack || err);

  // Validation Error (ex: Mongoose, Joi-like messages)
  if (err?.name === "ValidationError") {
    return responseHandler.error(res, "Validation Error", 400);
  }

  // Prisma Duplicate / Unique Constraint Error
  if (err?.code === "P2002") {
    return responseHandler.error(res, "Duplicate entry", 400);
  }

  // Cloudinary / Upload error (http_code is Cloudinary specific)
  if (err?.http_code) {
    return responseHandler.error(res, "Image upload failed", 500);
  }

  // JWT error handling (invalid / expired token)
  if (err?.name === "JsonWebTokenError" || err?.name === "TokenExpiredError") {
    return responseHandler.error(res, "Invalid or expired token", 401);
  }

  // Missing required fields (simple backend protection)
  if (err?.message && err.message.toLowerCase().includes("required")) {
    return responseHandler.error(res, "Missing required fields", 400);
  }

  // Default fallback error
  return responseHandler.error(res, err?.message || "Something went wrong!", 500);
};

module.exports = errorHandler;
