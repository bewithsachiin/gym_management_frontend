// Simple Response Helper for Success and Error

const responseHandler = {
  
  // Success Response
  success: function (res, message, data, statusCode) {
    // Default values (Entry Level Friendly)
    if (!statusCode) {
      statusCode = 200;
    }
    if (!message) {
      message = "Success";
    }
    if (!data) {
      data = null;
    }

    res.status(statusCode).json({
      success: true,
      message: message,
      data: data,
    });
  },

  // Error Response
  error: function (res, message, statusCode) {
    if (!statusCode) {
      statusCode = 500;
    }
    if (!message) {
      message = "Something went wrong";
    }

    res.status(statusCode).json({
      success: false,
      message: message,
    });
  },
};

module.exports = responseHandler;
