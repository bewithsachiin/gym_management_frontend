const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
        }
      },
      orderBy: { registered_at: 'desc' }
    });

    return walkIns;
  } catch (error) {
    console.error('Error fetching walk-ins:', error);
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
    const walkIn = await prisma.walkIn.create({
      data: {
        ...walkInData,
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

    return walkIn;
  } catch (error) {
    console.error('Error creating walk-in:', error);
    throw new Error('Failed to create walk-in registration');
  }
};

/**
 * Update an existing walk-in registration
 * @param {number} id - Walk-in ID
 * @param {Object} walkInData - Updated walk-in data
 * @param {number} branchId - Branch ID for access control
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

    // Check branch access
    if (existingWalkIn.branchId !== branchId) {
      throw new Error('Access denied: Not your branch');
    }

    const walkIn = await prisma.walkIn.update({
      where: { id: parseInt(id) },
      data: walkInData,
      include: {
        branch: {
          select: { id: true, name: true }
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });

    return walkIn;
  } catch (error) {
    console.error('Error updating walk-in:', error);
    throw error;
  }
};

/**
 * Delete a walk-in registration
 * @param {number} id - Walk-in ID
 * @param {number} branchId - Branch ID for access control
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

    // Check branch access
    if (existingWalkIn.branchId !== branchId) {
      throw new Error('Access denied: Not your branch');
    }

    await prisma.walkIn.delete({
      where: { id: parseInt(id) }
    });
  } catch (error) {
    console.error('Error deleting walk-in:', error);
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
