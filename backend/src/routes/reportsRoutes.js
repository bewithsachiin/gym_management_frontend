const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { accessControl } = require('../middlewares/accessControl.middleware');

// Reports routes
router.get('/sales', authenticateToken, accessControl(), reportsController.getSalesReports);
router.get('/sales/export', authenticateToken, accessControl(), reportsController.exportSalesReports);

module.exports = router;
