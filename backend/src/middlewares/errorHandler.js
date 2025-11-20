const responseHandler = require('../utils/responseHandler');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.stack);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((val) => val.message);
    return responseHandler.error(res, 'Validation Error', 400);
  }

  // Prisma unique constraint error
  if (err.code === 'P2002') {
    return responseHandler.error(res, 'Duplicate entry', 400);
  }

  // Cloudinary error
  if (err.http_code) {
    return responseHandler.error(res, 'Image upload failed', 500);
  }

  // Default error
  responseHandler.error(res, err.message || 'Something went wrong!', 500);
};

module.exports = errorHandler;
