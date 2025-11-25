const winston = require("winston");

// Simple logger format
const simpleFormat = winston.format.printf(function (info) {
  return `[${info.level.toUpperCase()}] ${info.message}`;
});

// Logger setup
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: simpleFormat,
  transports: [
    new winston.transports.Console(), // show logs in terminal
    new winston.transports.File({ filename: "logs/all.log" }), // all logs
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error", // only errors
    }),
  ],
});

// Export for use everywhere
module.exports = logger;
