"use strict";

// Core dependencies
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

// Create express app
const app = express();

/**
 * Allowed frontend origins for CORS.
 * Only these URLs can call our API from the browser.
 * @type {string[]}
 */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
];

/**
 * CORS configuration.
 * This function checks the incoming origin and allows or blocks it.
 */
const corsOptions = {
  origin: function (origin, callback) {
    // If origin is undefined (for example: Postman, server-to-server), allow it
    if (!origin) {
      return callback(null, true);
    }

    // Check if the origin is in allowedOrigins list
    const isAllowed = allowedOrigins.includes(origin);

    if (isAllowed) {
      return callback(null, true);
    }

    // If not allowed, create an error with a clear message
    const corsError = new Error("Not allowed by CORS");
    corsError.statusCode = 403;
    return callback(corsError);
  },
  credentials: true, // Allow cookies / auth headers
};

// ----------------------------------------------------
// GLOBAL MIDDLEWARE
// ----------------------------------------------------

// Security headers (helps protect from common attacks)
app.use(helmet());

// CORS protection
app.use(cors(corsOptions));

// HTTP request logger (method, URL, status, response time)
app.use(morgan("dev"));

/**
 * Parse incoming JSON requests.
 * Limit size to avoid very large payloads (basic protection).
 */
app.use(
  express.json({
    limit: "10mb",
  })
);

// Also support URL-encoded bodies (e.g. form submissions)
app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

// ----------------------------------------------------
// ROUTE IMPORTS
// ----------------------------------------------------
const authRoutes = require("./routes/auth.routes");
const branchRoutes = require("./routes/branchRoutes");
const staffRoutes = require("./routes/staffRoutes");
const salaryRoutes = require("./routes/salaryRoutes");
const staffRoleRoutes = require("./routes/staffRoleRoutes");
const memberRoutes = require("./routes/memberRoutes");
// const membershipRoutes = require("./routes/membershipRoutes");
const planRoutes = require("./routes/planRoutes");
const classScheduleRoutes = require("./routes/classScheduleRoutes");
const groupRoutes = require("./routes/groupRoutes");
const branchPlanRoutes = require("./routes/branchPlanRoutes");
const personalTrainingSessionRoutes = require("./routes/personalTrainingSessionRoutes");
const walkInRoutes = require("./routes/walkInRoutes");
const personalTrainingRoutes = require("./routes/personalTrainingRoutes");
const groupPlanRoutes = require("./routes/groupPlanRoutes");

// ----------------------------------------------------
// ROUTE MOUNTING (API ENDPOINTS)
// ----------------------------------------------------
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/branches", branchRoutes);
app.use("/api/v1/staff", staffRoutes);
app.use("/api/v1/staff-roles", staffRoleRoutes);
app.use("/api/v1/salaries", salaryRoutes);
app.use("/api/v1/members", memberRoutes);
app.use("/api/v1/plans", planRoutes);
app.use("/api/v1/classes", classScheduleRoutes);
app.use("/api/v1/groups", groupRoutes);
app.use("/api/v1/group-plans", groupPlanRoutes);
app.use("/api/v1/branch-plans", branchPlanRoutes);
app.use("/api/v1/sessions", personalTrainingSessionRoutes);
app.use("/api/v1/walk-ins", walkInRoutes);
app.use("/api/v1/personal-training", personalTrainingRoutes);

// ----------------------------------------------------
// HEALTH CHECK ROUTE
// ----------------------------------------------------
app.get("/api/health", (req, res) => {
  /**
   * Basic health response.
   * This is useful for monitoring tools and uptime checks.
   */
  res.status(200).json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// ----------------------------------------------------
// 404 HANDLER (ROUTE NOT FOUND)
// ----------------------------------------------------
app.use((req, res, next) => {
  const notFoundError = new Error("Route not found");
  notFoundError.statusCode = 404;
  next(notFoundError);
});

// ----------------------------------------------------
// GLOBAL ERROR HANDLER
// ----------------------------------------------------
const errorHandler = require("./middlewares/errorHandler");
app.use(errorHandler);

// Export app for server.js
module.exports = app;
