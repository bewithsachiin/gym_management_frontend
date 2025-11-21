/**
 * WalkIn Controller Module
 *
 * Handles HTTP requests related to walk-in visitor registrations.
 * Acts as the interface between the API routes and the walk-in service layer.
 * Each function corresponds to a specific API endpoint and handles request/response logic.
 *
 * Key Features:
 * - Authentication and authorization checks
 * - Input validation and error handling
 * - Response formatting using responseHandler utility
 * - Branch-based access control for multi-branch support
 */

const walkInService = require('../services/walkInService');
const responseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');

/**
 * Get all walk-ins with optional filtering
 * GET /api/walk-ins
 * Query params: search
 */
const getWalkIns = async (req, res, next) => {
  try {
    // Extract access control information from middleware
    const { userRole, userBranchId, isSuperAdmin } = req.accessFilters;
    const { search, branchId } = req.query; // Get search term and branchId from query params

    console.log(`👤 WalkIn Controller - Get walk-ins - Role: ${userRole}, Branch: ${userBranchId}, Search: ${search}, Requested Branch: ${branchId}`);

    let walkIns;
    if (isSuperAdmin) {
      // SuperAdmin can see all walk-ins or filter by specific branch if provided
      const filterBranchId = branchId ? parseInt(branchId) : null;
      walkIns = await walkInService.getWalkIns(filterBranchId, search);
      console.log(`👤 SuperAdmin fetched walk-ins - Count: ${walkIns.length}`);
    } else {
      // Other roles see walk-ins from their branch only, ignore any branchId param
      walkIns = await walkInService.getWalkIns(userBranchId, search);
      console.log(`👤 User fetched branch walk-ins - Count: ${walkIns.length}`);
    }

    responseHandler.success(res, 'Walk-in registrations fetched successfully', { walkIns });
  } catch (error) {
    console.error('❌ WalkIn Controller Error:', error);
    next(error);
  }
};

/**
 * Create a new walk-in registration
 * POST /api/walk-ins
 * Requires: superadmin or admin permissions
 */
const createWalkIn = async (req, res, next) => {
  try {
    const walkInData = req.body;

    // Basic input validation
    if (!walkInData.name || !walkInData.phone || !walkInData.branchId) {
      return responseHandler.error(res, 'Missing required fields: name, phone, and branchId are required', 400);
    }

    // Ensure walk-in is created in the admin's branch
    const { userRole, userBranchId } = req.accessFilters;
    if (userRole === 'admin' && !walkInData.branchId) {
      walkInData.branchId = userBranchId;
    }

    const createdById = req.user.id; // Get creator ID from authenticated user
    const walkIn = await walkInService.createWalkIn(walkInData, createdById);
    responseHandler.success(res, 'Walk-in registration created successfully', { walkIn });
  } catch (error) {
    logger.error('Error creating walk-in:', error);
    next(error);
  }
};

/**
 * Update an existing walk-in registration
 * PUT /api/walk-ins/:id
 * Requires: access control permissions (includeUserFilter: true)
 */
const updateWalkIn = async (req, res, next) => {
  try {
    const { id } = req.params;
    const walkInData = req.body;
    const { userBranchId } = req.accessFilters;
    const walkIn = await walkInService.updateWalkIn(id, walkInData, userBranchId);
    responseHandler.success(res, 'Walk-in registration updated successfully', { walkIn });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single walk-in by ID
 * GET /api/walk-ins/:id
 * Requires: access control permissions (includeUserFilter: true)
 */
const getWalkInById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userBranchId, userRole } = req.accessFilters;
    const walkIn = await walkInService.getWalkInById(id, userBranchId, userRole);
    responseHandler.success(res, 'Walk-in registration fetched successfully', { walkIn });
  } catch (error) {
    logger.error('Error fetching walk-in by ID:', error);
    next(error);
  }
};

/**
 * Delete a walk-in registration
 * DELETE /api/walk-ins/:id
 * Requires: access control permissions (includeUserFilter: true) and superadmin/admin permissions
 */
const deleteWalkIn = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userBranchId } = req.accessFilters;
    await walkInService.deleteWalkIn(id, userBranchId);
    responseHandler.success(res, 'Walk-in registration deleted successfully');
  } catch (error) {
    logger.error('Error deleting walk-in:', error);
    next(error);
  }
};

module.exports = {
  getWalkIns,
  getWalkInById,
  createWalkIn,
  updateWalkIn,
  deleteWalkIn,
};
