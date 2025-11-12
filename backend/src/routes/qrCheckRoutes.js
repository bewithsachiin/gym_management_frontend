const express = require('express');
const router = express.Router();
const qrCheckController = require('../controllers/qrCheckController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth.middleware');

// All QR check routes require authentication
router.use(authenticateToken);

// POST /api/v1/qr-check/in - Check in/out with QR code
router.post('/in', qrCheckController.checkInOut);

// GET /api/v1/qr-check/history - Get today's QR check history
router.get('/history', qrCheckController.getHistory);

// GET /api/v1/qr-check/attendance/:userId - Get attendance records for a user (admin view)
router.get('/attendance/:userId', qrCheckController.getAttendance);

module.exports = router;
