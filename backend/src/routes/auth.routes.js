const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");

// ==================================
// 📌 SIMPLE LOGGER FUNCTION
// ==================================
const logRequest = (path, body) => {
  console.log(`🔐 [REQUEST] ${path}`, body);
};

// ==================================
// 📌 AUTH ROUTES
// ==================================

// Login
router.post("/login", (req, res, next) => {
  logRequest("/login", req.body);
  authController.login(req, res, next);
});

// Signup
router.post("/signup", (req, res, next) => {
  logRequest("/signup", req.body);
  authController.signup(req, res, next);
});

// Forgot Password
router.post("/forgot-password", (req, res, next) => {
  logRequest("/forgot-password", req.body);
  authController.forgotPassword(req, res, next);
});

// Reset Password
router.post("/reset-password", (req, res, next) => {
  logRequest("/reset-password", req.body);
  authController.resetPassword(req, res, next);
});

module.exports = router;
