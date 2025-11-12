const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Service functions for business logic related to plans

// Validate plan data
const validatePlanData = (data) => {
  const errors = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push('Plan name is required');
  }

  if (!data.durationDays || data.durationDays <= 0) {
    errors.push('Duration must be a positive number');
  }

  if (!data.priceCents || data.priceCents <= 0) {
    errors.push('Price must be a positive number');
  }

  return errors;
};

// Check if plan name exists (for uniqueness)
const checkPlanNameExists = async (name, excludeId = null) => {
  const where = { name };
  if (excludeId) {
    where.id = { not: excludeId };
  }

  const existingPlan = await prisma.membershipPlan.findFirst({ where });
  return !!existingPlan;
};

// Get plans by branch
const getPlansByBranch = async (branchId) => {
  return await prisma.membershipPlan.findMany({
    where: {
      OR: [
        { branchId: parseInt(branchId) },
        { branchId: null }, // Global plans
      ],
      status: 'Active',
    },
    include: {
      branch: true,
    },
  });
};

// Get global plans (no branch assigned)
const getGlobalPlans = async () => {
  return await prisma.membershipPlan.findMany({
    where: {
      branchId: null,
      status: 'Active',
    },
  });
};

// Calculate plan end date
const calculateEndDate = (startDate, durationDays) => {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + durationDays);
  return endDate;
};

// Check if member has active subscription for a plan
const hasActiveSubscription = async (memberId, planId) => {
  const subscription = await prisma.subscription.findFirst({
    where: {
      memberId: parseInt(memberId),
      planId: parseInt(planId),
      status: 'Active',
    },
  });
  return !!subscription;
};

// Get member's current active subscriptions
const getMemberActiveSubscriptions = async (memberId) => {
  return await prisma.subscription.findMany({
    where: {
      memberId: parseInt(memberId),
      status: 'Active',
    },
    include: {
      plan: true,
    },
  });
};

module.exports = {
  validatePlanData,
  checkPlanNameExists,
  getPlansByBranch,
  getGlobalPlans,
  calculateEndDate,
  hasActiveSubscription,
  getMemberActiveSubscriptions,
};
