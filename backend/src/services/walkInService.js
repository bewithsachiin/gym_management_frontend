const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');

/**
 * Utility function to convert object keys from snake_case to camelCase recursively
 * @param {any} obj - The object to convert
 * @returns {any} - The converted object
 */
const toCamelCase = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);

  const camelObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      camelObj[camelKey] = toCamelCase(obj[key]);
    }
  }
  return camelObj;
};

/**
 * Filter object to only include valid WalkIn fields
 * @param {Object} data - The data object to filter
 * @returns {Object} - Filtered object with only valid fields
 */
const filterWalkInFields = (data) => {
  const validFields = [
    'name',
    'phone',
    'email',
    'preferredMembershipPlanId',
    'interestedIn',
    'preferredTime',
    'notes',
    'branchId',
    'createdById'
  ];

  const filtered = {};
  for (const key of validFields) {
    if (data.hasOwnProperty(key)) {
      // Convert preferredTime to proper DateTime if it's a string
      if (key === 'preferredTime' && data[key] && typeof data[key] === 'string') {
        // Handle datetime-local input format (YYYY-MM-DDTHH:MM) by adding seconds
        if (data[key].match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
          filtered[key] = new Date(data[key] + ':00');
        } else {
          filtered[key] = new Date(data[key]);
        }
      } else {
        filtered[key] = data[key];
      }
    }
  }
  return filtered;
};

/**
 * WalkIn Service Module
 *
 * Handles all database operations for walk-in visitor registrations.
 * Implements branch-based access control for all operations.
 */

/**
 * Get all walk-ins with optional filtering
 * @param {number|null} branchId - Filter by branch (null for all branches)
 * @param {string} search - Search term for name or phone
 * @returns {Promise<Array>} Array of walk-in records
 */
const getWalkIns = async (branchId, search = '') => {
  try {
    const where = {};

    // Apply branch filter if specified
    if (branchId) {
      where.branchId = branchId;
    }

    // Apply search filter if provided
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } }
      ];
    }

    const walkIns = await prisma.walkIn.findMany({
      where,
      include: {
        branch: {
          select: { id: true, name: true }
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true }
        },
        preferredMembershipPlan: {
          select: { id: true, plan_name: true }
        }
      },
      orderBy: { registeredAt: 'desc' }
    });

    // Transform the data to include plan name for frontend compatibility
    const transformedWalkIns = walkIns.map(walkIn => ({
      ...walkIn,
      preferredMembershipPlanName: walkIn.preferredMembershipPlan?.plan_name || null
    }));

    return transformedWalkIns;

    logger.info(`Fetched ${walkIns.length} walk-in registrations`);
    return walkIns;
  } catch (error) {
    logger.error('Error fetching walk-ins:', error);
    throw new Error('Failed to fetch walk-in registrations');
  }
};

/**
 * Get a single walk-in by ID
 * @param {number} id - Walk-in ID
 * @param {number} branchId - Branch ID for access control
 * @returns {Promise<Object>} Walk-in record
 */
const getWalkInById = async (id, branchId) => {
  try {
    const walkIn = await prisma.walkIn.findUnique({
      where: { id: parseInt(id) },
      include: {
        branch: {
          select: { id: true, name: true }
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });

    if (!walkIn) {
      throw new Error('Walk-in registration not found');
    }

    // Check branch access
    if (walkIn.branchId !== branchId) {
      throw new Error('Access denied: Not your branch');
    }

    return walkIn;
  } catch (error) {
    console.error('Error fetching walk-in by ID:', error);
    throw error;
  }
};

/**
 * Create a new walk-in registration
 * @param {Object} walkInData - Walk-in data
 * @param {number} createdById - User ID who created the record
 * @returns {Promise<Object>} Created walk-in record
 */
const createWalkIn = async (walkInData, createdById) => {
  try {
    // Filter to only include valid WalkIn fields
    const filteredData = filterWalkInFields(walkInData);

    const walkIn = await prisma.walkIn.create({
      data: {
        ...filteredData,
        createdById: createdById
      },
      include: {
        branch: {
          select: { id: true, name: true }
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });

    logger.info(`Created new walk-in registration with ID: ${walkIn.id}`);
    return walkIn;
  } catch (error) {
    logger.error('Error creating walk-in:', error);
    throw error;
  }
};

/**
 * Update an existing walk-in registration
 * @param {number} id - Walk-in ID
 * @param {Object} walkInData - Updated walk-in data
 * @param {number|null} branchId - Branch ID for access control (null for superadmin)
 * @returns {Promise<Object>} Updated walk-in record
 */
const updateWalkIn = async (id, walkInData, branchId) => {
  try {
    // First check if the walk-in exists and belongs to the user's branch
    const existingWalkIn = await prisma.walkIn.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingWalkIn) {
      throw new Error('Walk-in registration not found');
    }

    // Check branch access (allow if branchId is null for superadmin)
    if (branchId && existingWalkIn.branchId !== branchId) {
      throw new Error('Access denied: Not your branch');
    }

    // Filter to only include valid WalkIn fields
    const filteredData = filterWalkInFields(walkInData);

    const walkIn = await prisma.walkIn.update({
      where: { id: parseInt(id) },
      data: filteredData,
      include: {
        branch: {
          select: { id: true, name: true }
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });

    logger.info(`Updated walk-in registration with ID: ${walkIn.id}`);
    return walkIn;
  } catch (error) {
    logger.error('Error updating walk-in:', error);
    throw error;
  }
};

/**
 * Delete a walk-in registration
 * @param {number} id - Walk-in ID
 * @param {number|null} branchId - Branch ID for access control (null for superadmin)
 * @returns {Promise<void>}
 */
const deleteWalkIn = async (id, branchId) => {
  try {
    // First check if the walk-in exists and belongs to the user's branch
    const existingWalkIn = await prisma.walkIn.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingWalkIn) {
      throw new Error('Walk-in registration not found');
    }

    // Check branch access (allow if branchId is null for superadmin)
    if (branchId && existingWalkIn.branchId !== branchId) {
      throw new Error('Access denied: Not your branch');
    }

    await prisma.walkIn.delete({
      where: { id: parseInt(id) }
    });

    logger.info(`Deleted walk-in registration with ID: ${id}`);
  } catch (error) {
    logger.error('Error deleting walk-in:', error);
    throw error;
  }
};

module.exports = {
  getWalkIns,
  getWalkInById,
  createWalkIn,
  updateWalkIn,
  deleteWalkIn
};
