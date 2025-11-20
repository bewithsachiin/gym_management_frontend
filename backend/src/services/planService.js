const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

// Get all plans with filtering (membership plans are global)
const getAllPlans = async (filters = {}) => {
  const { type, active, adminId } = filters;

  const where = {};
  // No branchId filtering for membership plans - they are global
  if (type) where.type = type;
  if (active !== undefined) where.active = active === 'true';
  if (adminId) where.adminId = parseInt(adminId);

  return await prisma.plan.findMany({
    where,
    include: {
      admin: {
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
      bookings: {
        select: {
          id: true,
          status: true,
          requestedAt: true,
          member: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
      memberPlans: {
        select: {
          id: true,
          startDate: true,
          expiryDate: true,
          remainingSessions: true,
          member: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

// Get plan by ID
const getPlanById = async (id, branchId = null) => {
  const where = { id: parseInt(id) };
  if (branchId) where.branchId = parseInt(branchId);

  return await prisma.plan.findFirst({
    where,
    include: {
      admin: {
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
      bookings: {
        include: {
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
      memberPlans: {
        include: {
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
    },
  });
};

// Create new plan (membership plans are global)
const createPlan = async (planData, userId) => {
  const { name, plan_description, type, sessions, validity, price, features } = planData;

  // Convert price to cents (assuming price is in rupees)
  const priceCents = Math.round(parseFloat(price) * 100);

  const plan = await prisma.plan.create({
    data: {
      name,
      plan_description,
      type,
      sessions: parseInt(sessions),
      validity: parseInt(validity),
      priceCents,
      currency: 'INR',
      active: true,
      features: features || [],
      adminId: parseInt(userId),
      branchId: null, // Membership plans are global
    },
    include: {
      admin: {
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

  logger.info(`Plan created: ${plan.name} by user ${userId}`);
  return plan;
};

// Update plan
const updatePlan = async (id, planData, userId, branchId = null) => {
  const { name, plan_description, type, sessions, validity, price, active, features } = planData;

  const where = { id: parseInt(id) };
  if (branchId) where.branchId = parseInt(branchId);

  const existingPlan = await prisma.plan.findFirst({ where });
  if (!existingPlan) {
    throw new Error('Plan not found');
  }

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (plan_description !== undefined) updateData.plan_description = plan_description;
  if (type !== undefined) updateData.type = type;
  if (sessions !== undefined) updateData.sessions = parseInt(sessions);
  if (validity !== undefined) updateData.validity = parseInt(validity);
  if (price !== undefined) updateData.priceCents = Math.round(parseFloat(price) * 100);
  if (active !== undefined) updateData.active = active;
  if (features !== undefined) updateData.features = features;

  const updatedPlan = await prisma.plan.update({
    where: { id: parseInt(id) },
    data: updateData,
    include: {
      admin: {
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

  logger.info(`Plan updated: ${updatedPlan.name} (ID: ${id}) by user ${userId}`);
  return updatedPlan;
};

// Delete plan
const deletePlan = async (id, userId, branchId = null) => {
  const where = { id: parseInt(id) };
  if (branchId) where.branchId = parseInt(branchId);

  const plan = await prisma.plan.findFirst({ where });
  if (!plan) {
    throw new Error('Plan not found');
  }

  // Check if plan has active bookings or member plans
  const activeBookings = await prisma.planBooking.count({
    where: { planId: parseInt(id), status: 'approved' },
  });

  const activeMemberPlans = await prisma.memberPlan.count({
    where: { planId: parseInt(id) },
  });

  if (activeBookings > 0 || activeMemberPlans > 0) {
    throw new Error('Cannot delete plan with active bookings or subscriptions');
  }

  await prisma.plan.delete({ where: { id: parseInt(id) } });

  logger.info(`Plan deleted: ${plan.name} (ID: ${id}) by user ${userId}`);
};

// Toggle plan active status
const togglePlanStatus = async (id, userId, branchId = null) => {
  const where = { id: parseInt(id) };
  if (branchId) where.branchId = parseInt(branchId);

  const plan = await prisma.plan.findFirst({ where });
  if (!plan) {
    throw new Error('Plan not found');
  }

  const updatedPlan = await prisma.plan.update({
    where: { id: parseInt(id) },
    data: { active: !plan.active },
    include: {
      admin: {
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

  logger.info(`Plan status toggled: ${updatedPlan.name} (ID: ${id}) - Active: ${updatedPlan.active} by user ${userId}`);
  return updatedPlan;
};

// Get booking requests
const getBookingRequests = async (filters = {}) => {
  const { branchId, status, planId } = filters;

  const where = {};
  if (branchId) where.plan = { branchId: parseInt(branchId) };
  if (status) where.status = status;
  if (planId) where.planId = parseInt(planId);

  return await prisma.planBooking.findMany({
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
      plan: {
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
};

// Create booking request
const createBookingRequest = async (bookingData, userId) => {
  const { planId, note } = bookingData;

  // Check if plan exists and is active
  const plan = await prisma.plan.findUnique({
    where: { id: parseInt(planId) },
  });

  if (!plan || !plan.active) {
    throw new Error('Plan not found or inactive');
  }

  // Check if member already has a pending/active booking for this plan
  const existingBooking = await prisma.planBooking.findFirst({
    where: {
      memberId: parseInt(userId),
      planId: parseInt(planId),
      status: { in: ['pending', 'approved'] },
    },
  });

  if (existingBooking) {
    throw new Error('You already have a pending or approved booking for this plan');
  }

  const booking = await prisma.planBooking.create({
    data: {
      memberId: parseInt(userId),
      planId: parseInt(planId),
      status: 'pending',
      note: note || null,
    },
    include: {
      member: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      plan: {
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

  logger.info(`Booking request created: Member ${userId} for plan ${planId}`);
  return booking;
};

// Approve booking request
const approveBooking = async (bookingId, userId) => {
  const booking = await prisma.planBooking.findUnique({
    where: { id: parseInt(bookingId) },
    include: { plan: true, member: true },
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
    const updatedBooking = await prisma.planBooking.update({
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
        plan: {
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

    // Create member plan subscription
    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(startDate.getDate() + booking.plan.validity);

    await prisma.memberPlan.create({
      data: {
        memberId: booking.memberId,
        planId: booking.planId,
        startDate,
        expiryDate,
        remainingSessions: booking.plan.sessions,
      },
    });

    return updatedBooking;
  });

  logger.info(`Booking approved: ID ${bookingId} by user ${userId}`);
  return result;
};

// Reject booking request
const rejectBooking = async (bookingId, userId) => {
  const booking = await prisma.planBooking.findUnique({
    where: { id: parseInt(bookingId) },
  });

  if (!booking) {
    throw new Error('Booking request not found');
  }

  if (booking.status !== 'pending') {
    throw new Error('Booking request is not pending');
  }

  const updatedBooking = await prisma.planBooking.update({
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
      plan: {
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

  logger.info(`Booking rejected: ID ${bookingId} by user ${userId}`);
  return updatedBooking;
};

// Get distinct plan features (types)
const getFeatures = async () => {
  // Return a static list of common gym features
  return [
    "Sauna",
    "Group Classes",
    "Personal Training",
    "Locker Room",
    "Cardio Access",
    "Swimming Pool",
    "Nutrition Counseling",
    "Massage Therapy",
    "Yoga Classes",
    "Weight Training",
    "CrossFit",
    "Boxing",
    "Martial Arts",
    "Dance Classes",
    "Pilates",
    "Zumba",
    "Spin Classes",
    "Tennis Court",
    "Basketball Court",
    "Squash Court"
  ];
};

module.exports = {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  togglePlanStatus,
  getFeatures,
  getBookingRequests,
  createBookingRequest,
  approveBooking,
  rejectBooking,
};
