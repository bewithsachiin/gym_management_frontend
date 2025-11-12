const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const { authenticateToken } = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(authenticateToken);

// SuperAdmin only routes
router.get('/', planController.getAllPlans);
router.get('/features', planController.getAllFeatures);
router.post('/', planController.createPlan);

// Routes for specific plans
router.get('/:id', planController.getPlanById);
router.put('/:id', planController.updatePlan);
router.delete('/:id', planController.deletePlan);

module.exports = router;
