const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const responseHandler = require('../utils/responseHandler');

// Get all membership plans (SuperAdmin only)
const getAllPlans = async (req, res) => {
  try {
    const { branchId, status } = req.query;
    const where = {};
    if (branchId) where.branchId = parseInt(branchId);
    if (status) where.status = status;

    const plans = await prisma.membershipPlan.findMany({
      where,
      include: {
        branch: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    responseHandler.success(res, 'Plans retrieved successfully', plans);
  } catch (error) {
    console.error('Error fetching plans:', error);
    responseHandler.error(res, 'Failed to retrieve plans', 500);
  }
};

// Get plan by ID
const getPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await prisma.membershipPlan.findUnique({
      where: { id: parseInt(id) },
      include: {
        branch: true,
      },
    });

    if (!plan) {
      return responseHandler.error(res, 'Plan not found', 404);
    }

    responseHandler.success(res, 'Plan retrieved successfully', plan);
  } catch (error) {
    console.error('Error fetching plan:', error);
    responseHandler.error(res, 'Failed to retrieve plan', 500);
  }
};

// Create new plan
const createPlan = async (req, res) => {
  try {
    const { name, description, durationDays, priceCents, currency, features, status, branchId } = req.body;

    // Validation
    if (!name || !durationDays || !priceCents) {
      return responseHandler.error(res, 'Name, duration, and price are required', 400);
    }

    if (durationDays <= 0 || priceCents <= 0) {
      return responseHandler.error(res, 'Duration and price must be positive', 400);
    }

    // Check if branch exists if provided
    if (branchId) {
      const branch = await prisma.branch.findUnique({ where: { id: parseInt(branchId) } });
      if (!branch) {
        return responseHandler.error(res, 'Branch not found', 404);
      }
    }

    const plan = await prisma.membershipPlan.create({
      data: {
        name,
        description,
        durationDays: parseInt(durationDays),
        priceCents: parseInt(priceCents),
        currency: currency || 'INR',
        features: features || [],
        status: status || 'Active',
        branchId: branchId ? parseInt(branchId) : null,
      },
      include: {
        branch: true,
      },
    });

    responseHandler.success(res, 'Plan created successfully', plan, 201);
  } catch (error) {
    console.error('Error creating plan:', error);
    if (error.code === 'P2002') {
      responseHandler.error(res, 'Plan name already exists', 409);
    } else {
      responseHandler.error(res, 'Failed to create plan', 500);
    }
  }
};

// Update plan
const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, durationDays, priceCents, currency, features, status, branchId } = req.body;

    // Check if plan exists
    const existingPlan = await prisma.membershipPlan.findUnique({ where: { id: parseInt(id) } });
    if (!existingPlan) {
      return responseHandler.error(res, 'Plan not found', 404);
    }

    // Validation
    if (durationDays && durationDays <= 0) {
      return responseHandler.error(res, 'Duration must be positive', 400);
    }
    if (priceCents && priceCents <= 0) {
      return responseHandler.error(res, 'Price must be positive', 400);
    }

    // Check if branch exists if provided
    if (branchId) {
      const branch = await prisma.branch.findUnique({ where: { id: parseInt(branchId) } });
      if (!branch) {
        return responseHandler.error(res, 'Branch not found', 404);
      }
    }

    const plan = await prisma.membershipPlan.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(durationDays && { durationDays: parseInt(durationDays) }),
        ...(priceCents && { priceCents: parseInt(priceCents) }),
        ...(currency && { currency }),
        ...(features && { features }),
        ...(status && { status }),
        ...(branchId !== undefined && { branchId: branchId ? parseInt(branchId) : null }),
      },
      include: {
        branch: true,
      },
    });

    responseHandler.success(res, 'Plan updated successfully', plan);
  } catch (error) {
    console.error('Error updating plan:', error);
    if (error.code === 'P2002') {
      responseHandler.error(res, 'Plan name already exists', 409);
    } else {
      responseHandler.error(res, 'Failed to update plan', 500);
    }
  }
};

// Delete plan
const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if plan exists
    const plan = await prisma.membershipPlan.findUnique({ where: { id: parseInt(id) } });
    if (!plan) {
      return responseHandler.error(res, 'Plan not found', 404);
    }

    // Check if plan has active subscriptions
    const activeSubscriptions = await prisma.subscription.findMany({
      where: {
        planId: parseInt(id),
        status: 'Active',
      },
    });

    if (activeSubscriptions.length > 0) {
      return responseHandler.error(res, 'Cannot delete plan with active subscriptions', 400);
    }

    await prisma.membershipPlan.delete({ where: { id: parseInt(id) } });

    responseHandler.success(res, 'Plan deleted successfully');
  } catch (error) {
    console.error('Error deleting plan:', error);
    responseHandler.error(res, 'Failed to delete plan', 500);
  }
};

// Get all available features (global)
const getAllFeatures = async (req, res) => {
  try {
    // Get unique features from all plans
    const plans = await prisma.membershipPlan.findMany({ select: { features: true } });
    const allFeatures = [...new Set(plans.flatMap(plan => plan.features || []))];

    responseHandler.success(res, 'Features retrieved successfully', allFeatures);
  } catch (error) {
    console.error('Error fetching features:', error);
    responseHandler.error(res, 'Failed to retrieve features', 500);
  }
};

module.exports = {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  getAllFeatures,
};
