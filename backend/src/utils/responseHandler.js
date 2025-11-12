const responseHandler = {
  success: (res, message, data = null, statusCode = 200) => {
    res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  },

  error: (res, message, statusCode = 500) => {
    res.status(statusCode).json({
      success: false,
      message,
    });
  },
};

module.exports = responseHandler;
