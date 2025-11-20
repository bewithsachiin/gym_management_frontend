const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

// Helper function to format price from cents to rupees string
const formatPrice = (priceCents) => {
  const rupees = Math.round(priceCents / 100);
  return `₹${rupees.toLocaleString('en-IN')}`;
};

// Helper function to format date as "YYYY-MM-DD HH:MM AM/PM"
const formatDateTime = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  return `${year}-${month}-${day} ${hours}:${minutes} ${ampm}`;
};

// Get all branch plans with filtering (admin can only see their branch plans)
const getAllBranchPlans = async (filters = {}, userBranchId = null, userRole = null) => {
  const { type, active } = filters;

  const where = {};
  if (type) where.type = type;
  if (active !== undefined) where.active = active === 'true';

  // Branch isolation: non-superadmin users can only see plans from their branch
  if (userRole !== 'superadmin' && userBranchId) {
    where.branchId = parseInt(userBranchId);
  }

  const plans = await prisma.branchPlan.findMany({
    where,
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      branch: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Format the response to match frontend expectations
  return plans.map(plan => ({
    id: plan.id,
    name: plan.name,
    sessions: plan.sessions,
    validity: plan.validity,
    price: formatPrice(plan.priceCents),
    active: plan.active,
    type: plan.type,
    createdBy: plan.createdBy,
    branch: plan.branch,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
  }));
};

// Get branch plan by ID
const getBranchPlanById = async (id, userBranchId = null, userRole = null) => {
  const where = { id: parseInt(id) };

  // Branch isolation: non-superadmin users can only access plans from their branch
  if (userRole !== 'superadmin' && userBranchId) {
    where.branchId = parseInt(userBranchId);
  }

  const plan = await prisma.branchPlan.findFirst({
    where,
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      branch: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!plan) return null;

  // Format the response
  return {
    id: plan.id,
    name: plan.name,
    sessions: plan.sessions,
    validity: plan.validity,
    price: formatPrice(plan.priceCents),
    active: plan.active,
    type: plan.type,
    createdBy: plan.createdBy,
    branch: plan.branch,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
  };
};

// Create new branch plan
const createBranchPlan = async (planData, userId, userBranchId = null, userRole = null) => {
  const { name, type, sessions, validity, price } = planData;

  // Convert price to cents (assuming price is in rupees)
  const priceCents = Math.round(parseFloat(price.replace(/[₹,]/g, '')) * 100);

  const plan = await prisma.branchPlan.create({
    data: {
      name,
      type,
      sessions: parseInt(sessions),
      validity: parseInt(validity),
      priceCents,
      currency: 'INR',
      active: true,
      branchId: parseInt(userBranchId),
      createdById: parseInt(userId),
    },
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      branch: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  logger.info(`Branch Plan created: ${plan.name} by user ${userId}`);

  // Format the response
  return {
    id: plan.id,
    name: plan.name,
    sessions: plan.sessions,
    validity: plan.validity,
    price: formatPrice(plan.priceCents),
    active: plan.active,
    type: plan.type,
    createdBy: plan.createdBy,
    branch: plan.branch,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
  };
};

// Update branch plan
const updateBranchPlan = async (id, planData, userId, userBranchId = null, userRole = null) => {
  const where = { id: parseInt(id) };

  // Branch isolation: non-superadmin users can only update plans from their branch
  if (userRole !== 'superadmin' && userBranchId) {
    where.branchId = parseInt(userBranchId);
  }

  const existingPlan = await prisma.branchPlan.findFirst({ where });
  if (!existingPlan) {
    throw new Error('Plan not found');
  }

  const updateData = {};
  if (planData.name !== undefined) updateData.name = planData.name;
  if (planData.type !== undefined) updateData.type = planData.type;
  if (planData.sessions !== undefined) updateData.sessions = parseInt(planData.sessions);
  if (planData.validity !== undefined) updateData.validity = parseInt(planData.validity);
  if (planData.price !== undefined) updateData.priceCents = Math.round(parseFloat(planData.price.replace(/[₹,]/g, '')) * 100);
  if (planData.active !== undefined) updateData.active = planData.active;

  const updatedPlan = await prisma.branchPlan.update({
    where: { id: parseInt(id) },
    data: updateData,
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      branch: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  logger.info(`Branch Plan updated: ${updatedPlan.name} (ID: ${id}) by user ${userId}`);

  // Format the response
  return {
    id: updatedPlan.id,
    name: updatedPlan.name,
    sessions: updatedPlan.sessions,
    validity: updatedPlan.validity,
    price: formatPrice(updatedPlan.priceCents),
    active: updatedPlan.active,
    type: updatedPlan.type,
    createdBy: updatedPlan.createdBy,
    branch: updatedPlan.branch,
    createdAt: updatedPlan.createdAt,
    updatedAt: updatedPlan.updatedAt,
  };
};

// Delete branch plan
const deleteBranchPlan = async (id, userId, userBranchId = null, userRole = null) => {
  const where = { id: parseInt(id) };

  // Branch isolation: non-superadmin users can only delete plans from their branch
  if (userRole !== 'superadmin' && userBranchId) {
    where.branchId = parseInt(userBranchId);
  }

  const plan = await prisma.branchPlan.findFirst({ where });
  if (!plan) {
    throw new Error('Plan not found');
  }

  // Check if plan has active bookings or member plans
  const activeBookings = await prisma.branchPlanBooking.count({
    where: { branchPlanId: parseInt(id), status: 'approved' },
  });

  const activeMemberPlans = await prisma.memberBranchPlan.count({
    where: { branchPlanId: parseInt(id) },
  });

  if (activeBookings > 0 || activeMemberPlans > 0) {
    throw new Error('Cannot delete plan with active bookings or subscriptions');
  }

  await prisma.branchPlan.delete({ where: { id: parseInt(id) } });

  logger.info(`Branch Plan deleted: ${plan.name} (ID: ${id}) by user ${userId}`);
};

// Toggle branch plan active status
const toggleBranchPlanStatus = async (id, userId, userBranchId = null, userRole = null) => {
  const where = { id: parseInt(id) };

  // Branch isolation: non-superadmin users can only toggle plans from their branch
  if (userRole !== 'superadmin' && userBranchId) {
    where.branchId = parseInt(userBranchId);
  }

  const plan = await prisma.branchPlan.findFirst({ where });
  if (!plan) {
    throw new Error('Plan not found');
  }

  const updatedPlan = await prisma.branchPlan.update({
    where: { id: parseInt(id) },
    data: { active: !plan.active },
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      branch: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  logger.info(`Branch Plan status toggled: ${updatedPlan.name} (ID: ${id}) - Active: ${updatedPlan.active} by user ${userId}`);

  // Format the response
  return {
    id: updatedPlan.id,
    name: updatedPlan.name,
    sessions: updatedPlan.sessions,
    validity: updatedPlan.validity,
    price: formatPrice(updatedPlan.priceCents),
    active: updatedPlan.active,
    type: updatedPlan.type,
    createdBy: updatedPlan.createdBy,
    branch: updatedPlan.branch,
    createdAt: updatedPlan.createdAt,
    updatedAt: updatedPlan.updatedAt,
  };
};

// Get branch booking requests
const getBranchBookingRequests = async (userBranchId = null, userRole = null) => {
  const where = {};

  // Branch isolation: non-superadmin users can only see bookings for plans from their branch
  if (userRole !== 'superadmin' && userBranchId) {
    where.branchPlan = { branchId: parseInt(userBranchId) };
  }

  const bookings = await prisma.branchPlanBooking.findMany({
    where,
    include: {
      member: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      branchPlan: {
        select: {
          id: true,
          name: true,
          type: true,
          sessions: true,
          validity: true,
          priceCents: true,
          currency: true,
        },
      },
    },
    orderBy: { requestedAt: 'desc' },
  });

  // Format the response to match frontend expectations
  return bookings.map(booking => ({
    id: booking.id,
    memberId: booking.memberId,
    branchPlanId: booking.branchPlanId,
    memberName: `${booking.member.firstName} ${booking.member.lastName}`,
    planName: booking.branchPlan.name,
    planType: booking.branchPlan.type === 'group' ? 'Group' : 'Personal',
    sessions: booking.branchPlan.sessions,
    validity: booking.branchPlan.validity,
    sessionsUsed: booking.sessionsUsed,
    requestedAt: formatDateTime(booking.requestedAt),
    status: booking.status,
    note: booking.note,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
  }));
};

// Approve branch booking request
const approveBranchBooking = async (bookingId, userId) => {
  const booking = await prisma.branchPlanBooking.findUnique({
    where: { id: parseInt(bookingId) },
    include: { branchPlan: true, member: true },
  });

  if (!booking) {
    throw new Error('Booking request not found');
  }

  if (booking.status !== 'pending') {
    throw new Error('Booking request is not pending');
  }

  // Start transaction
  const result = await prisma.$transaction(async (prisma) => {
    // Update booking status
    const updatedBooking = await prisma.branchPlanBooking.update({
      where: { id: parseInt(bookingId) },
      data: { status: 'approved' },
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        branchPlan: {
          select: {
            id: true,
            name: true,
            type: true,
            sessions: true,
            validity: true,
            priceCents: true,
            currency: true,
          },
        },
      },
    });

    // Create member branch plan subscription
    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(startDate.getDate() + booking.branchPlan.validity);

    await prisma.memberBranchPlan.create({
      data: {
        memberId: booking.memberId,
        branchPlanId: booking.branchPlanId,
        startDate,
        expiryDate,
        remainingSessions: booking.branchPlan.sessions,
      },
    });

    return updatedBooking;
  });

  logger.info(`Branch Booking approved: ID ${bookingId} by user ${userId}`);

  // Format the response
  return {
    id: result.id,
    memberId: result.memberId,
    branchPlanId: result.branchPlanId,
    memberName: `${result.member.firstName} ${result.member.lastName}`,
    planName: result.branchPlan.name,
    planType: result.branchPlan.type === 'group' ? 'Group' : 'Personal',
    sessions: result.branchPlan.sessions,
    validity: result.branchPlan.validity,
    sessionsUsed: result.sessionsUsed,
    requestedAt: formatDateTime(result.requestedAt),
    status: result.status,
    note: result.note,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  };
};

// Reject branch booking request
const rejectBranchBooking = async (bookingId, userId) => {
  const booking = await prisma.branchPlanBooking.findUnique({
    where: { id: parseInt(bookingId) },
  });

  if (!booking) {
    throw new Error('Booking request not found');
  }

  if (booking.status !== 'pending') {
    throw new Error('Booking request is not pending');
  }

  const updatedBooking = await prisma.branchPlanBooking.update({
    where: { id: parseInt(bookingId) },
    data: { status: 'rejected' },
    include: {
      member: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      branchPlan: {
        select: {
          id: true,
          name: true,
          type: true,
          sessions: true,
          validity: true,
          priceCents: true,
          currency: true,
        },
      },
    },
  });

  logger.info(`Branch Booking rejected: ID ${bookingId} by user ${userId}`);

  // Format the response
  return {
    id: updatedBooking.id,
    memberId: updatedBooking.memberId,
    branchPlanId: updatedBooking.branchPlanId,
    memberName: `${updatedBooking.member.firstName} ${updatedBooking.member.lastName}`,
    planName: updatedBooking.branchPlan.name,
    planType: updatedBooking.branchPlan.type === 'group' ? 'Group' : 'Personal',
    sessions: updatedBooking.branchPlan.sessions,
    validity: updatedBooking.branchPlan.validity,
    sessionsUsed: updatedBooking.sessionsUsed,
    requestedAt: formatDateTime(updatedBooking.requestedAt),
    status: updatedBooking.status,
    note: updatedBooking.note,
    createdAt: updatedBooking.createdAt,
    updatedAt: updatedBooking.updatedAt,
  };
};

module.exports = {
  getAllBranchPlans,
  getBranchPlanById,
  createBranchPlan,
  updateBranchPlan,
  deleteBranchPlan,
  toggleBranchPlanStatus,
  getBranchBookingRequests,
  approveBranchBooking,
  rejectBranchBooking,
};
