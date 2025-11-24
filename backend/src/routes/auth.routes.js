const express = require('express');
const authController = require('../controllers/auth.controller');

const router = express.Router();

router.post('/login', (req, res, next) => {
  console.log("🔐 [REQUEST] /login", req.body);
  return authController.login(req, res, next);
});

router.post('/signup', (req, res, next) => {
  console.log("🧾 [REQUEST] /signup", req.body);
  return authController.signup(req, res, next);
});

router.post('/forgot-password', (req, res, next) => {
  console.log("📨 [REQUEST] /forgot-password", req.body);
  return authController.forgotPassword(req, res, next);
});

router.post('/reset-password', (req, res, next) => {
  console.log("🔄 [REQUEST] /reset-password", req.body);
  return authController.resetPassword(req, res, next);
});

module.exports = router;
