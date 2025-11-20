/**
 * WalkIn Routes Module
 *
 * Defines the API routes for walk-in visitor registration management.
 * Sets up the endpoints that the frontend can call to interact with walk-in data.
 *
 * Routes:
 * - GET /api/walk-ins - Get all walk-ins (with search filtering)
 * - POST /api/walk-ins - Create a new walk-in registration
 * - PUT /api/walk-ins/:id - Update an existing walk-in registration
 * - GET /api/walk-ins/:id - Get a single walk-in by ID
 * - DELETE /api/walk-ins/:id - Delete a walk-in registration
 *
 * Middleware:
 * - authenticateToken: Ensures user is logged in
 * - accessControl: Handles branch-based access restrictions
 * - checkPermission: Checks for specific role permissions
 */

const express = require('express');
const router = express.Router();
const walkInController = require('../controllers/walkInController');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { accessControl, checkPermission } = require('../middlewares/accessControl.middleware');

// Get all walk-ins with optional search filtering
router.get('/', authenticateToken, accessControl(), walkInController.getWalkIns);

// Get a single walk-in by ID
router.get('/:id', authenticateToken, accessControl({ includeUserFilter: true }), walkInController.getWalkInById);

// Create a new walk-in registration
router.post('/', authenticateToken, accessControl(), checkPermission(['superadmin', 'admin']), walkInController.createWalkIn);

// Update an existing walk-in registration
router.put('/:id', authenticateToken, accessControl({ includeUserFilter: true }), checkPermission(['superadmin', 'admin']), walkInController.updateWalkIn);

// Delete a walk-in registration
router.delete('/:id', authenticateToken, accessControl({ includeUserFilter: true }), checkPermission(['superadmin', 'admin']), walkInController.deleteWalkIn);

module.exports = router;
