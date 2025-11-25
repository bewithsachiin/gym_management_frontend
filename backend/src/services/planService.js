const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

// ------------------------------------------------------
// UTILITY HELPERS
// ------------------------------------------------------
function parseNumber(value) {
  const num = Number(value);
  return isNaN(num) ? null : num;
}

function parsePriceToCents(price) {
  const num = Number(price);
  return isNaN(num) ? 0 : Math.round(num * 100);
}

// ------------------------------------------------------
// GET ALL PLANS (GLOBAL PLANS - NO BRANCH FILTER)
// ------------------------------------------------------
async function getAllPlans(filters) {
  const where = {};

  if (filters && filters.type) {
    where.type = filters.type;
  }
  if (filters && filters.active !== undefined) {
    where.active = filters.active === 'true';
  }
  if (filters && filters.adminId) {
    where.adminId = parseNumber(filters.adminId);
  }

  return prisma.plan.findMany({
    where: where,
    include: {
      admin: { select: { id: true, firstName: true, lastName: true } },
      branch: { select: { id: true, name: true } },
      bookings: {
        select: {
          id: true,
          status: true,
          requestedAt: true,
          member: { select: { firstName: true, lastName: true, email: true } }
        }
      },
      memberPlans: {
        select: {
          id: true,
          startDate: true,
          expiryDate: true,
          remainingSessions: true,
          member: { select: { firstName: true, lastName: true, email: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

// ------------------------------------------------------
// GET PLAN BY ID
// ------------------------------------------------------
async function getPlanById(id) {
  const planId = parseNumber(id);
  if (!planId) return null;

  return prisma.plan.findFirst({
    where: { id: planId },
    include: {
      admin: { select: { id: true, firstName: true, lastName: true } },
      branch: { select: { id: true, name: true } },
      bookings: {
        include: {
          member: { select: { id: true, firstName: true, lastName: true, email: true } }
        }
      },
      memberPlans: {
        include: {
          member: { select: { id: true, firstName: true, lastName: true, email: true } }
        }
      }
    }
  });
}

// ------------------------------------------------------
// CREATE PLAN (GLOBAL PLAN ONLY)
// ------------------------------------------------------
async function createPlan(data, userId) {
  const cleanData = {
    name: data.name,
    plan_description: data.plan_description,
    type: data.type,
    sessions: parseNumber(data.sessions),
    validity: parseNumber(data.validity),
    priceCents: parsePriceToCents(data.price),
    currency: 'INR',
    active: true,
    features: data.features ? data.features : [],
    adminId: parseNumber(userId),
    branchId: null
  };

  const result = await prisma.plan.create({
    data: cleanData,
    include: {
      admin: { select: { id: true, firstName: true, lastName: true } },
      branch: { select: { id: true, name: true } }
    }
  });

  logger.info(`Plan created: ${cleanData.name} by user ${userId}`);
  return result;
}

// ------------------------------------------------------
// UPDATE PLAN
// ------------------------------------------------------
async function updatePlan(id, data, userId) {
  const planId = parseNumber(id);
  if (!planId) throw new Error('Invalid plan ID');

  const existing = await prisma.plan.findFirst({ where: { id: planId } });
  if (!existing) throw new Error('Plan not found');

  const updateData = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.plan_description !== undefined) updateData.plan_description = data.plan_description;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.sessions !== undefined) updateData.sessions = parseNumber(data.sessions);
  if (data.validity !== undefined) updateData.validity = parseNumber(data.validity);
  if (data.price !== undefined) updateData.priceCents = parsePriceToCents(data.price);
  if (data.active !== undefined) updateData.active = data.active;
  if (data.features !== undefined) updateData.features = data.features;

  const result = await prisma.plan.update({
    where: { id: planId },
    data: updateData,
    include: {
      admin: { select: { id: true, firstName: true, lastName: true } },
      branch: { select: { id: true, name: true } }
    }
  });

  logger.info(`Plan updated: ${result.name} by user ${userId}`);
  return result;
}

// ------------------------------------------------------
// DELETE PLAN
// ------------------------------------------------------
async function deletePlan(id, userId) {
  const planId = parseNumber(id);
  if (!planId) throw new Error('Invalid plan ID');

  const existing = await prisma.plan.findFirst({ where: { id: planId } });
  if (!existing) throw new Error('Plan not found');

  const bookingCount = await prisma.planBooking.count({
    where: { planId: planId, status: 'approved' }
  });

  const memberCount = await prisma.memberPlan.count({
    where: { planId: planId }
  });

  if (bookingCount > 0 || memberCount > 0) {
    throw new Error('Cannot delete plan with active bookings or subscriptions');
  }

  await prisma.plan.delete({ where: { id: planId } });

  logger.info(`Plan deleted: ${existing.name} by user ${userId}`);
}

// ------------------------------------------------------
// TOGGLE ACTIVE STATUS
// ------------------------------------------------------
async function togglePlanStatus(id, userId) {
  const planId = parseNumber(id);
  if (!planId) throw new Error('Invalid plan ID');

  const existing = await prisma.plan.findFirst({ where: { id: planId } });
  if (!existing) throw new Error('Plan not found');

  const result = await prisma.plan.update({
    where: { id: planId },
    data: { active: !existing.active },
    include: {
      admin: { select: { id: true, firstName: true, lastName: true } },
      branch: { select: { id: true, name: true } }
    }
  });

  logger.info(`Plan status toggled: ${result.name} by user ${userId}`);
  return result;
}

// ------------------------------------------------------
// BOOKING REQUESTS
// ------------------------------------------------------
async function getBookingRequests(filters) {
  const where = {};

  if (filters && filters.status) where.status = filters.status;
  if (filters && filters.planId) where.planId = parseNumber(filters.planId);

  return prisma.planBooking.findMany({
    where: where,
    include: {
      member: { select: { id: true, firstName: true, lastName: true, email: true } },
      plan: { select: { id: true, name: true, type: true, sessions: true, validity: true, priceCents: true, currency: true } }
    },
    orderBy: { requestedAt: 'desc' }
  });
}

// ------------------------------------------------------
// MEMBER BOOKING REQUEST
// ------------------------------------------------------
async function createBookingRequest(data, userId) {
  const planId = parseNumber(data.planId);

  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan || !plan.active) throw new Error('Plan not found or inactive');

  const duplicate = await prisma.planBooking.findFirst({
    where: { memberId: parseNumber(userId), planId: planId, status: { in: ['pending', 'approved'] } }
  });

  if (duplicate) throw new Error('Booking already pending or approved');

  return prisma.planBooking.create({
    data: { memberId: parseNumber(userId), planId: planId, status: 'pending', note: data.note || null },
    include: {
      member: { select: { id: true, firstName: true, lastName: true, email: true } },
      plan: { select: { id: true, name: true, type: true, sessions: true, validity: true, priceCents: true, currency: true } }
    }
  });
}

// ------------------------------------------------------
// APPROVE BOOKING
// ------------------------------------------------------
async function approveBooking(id, userId) {
  const bookingId = parseNumber(id);

  const booking = await prisma.planBooking.findUnique({
    where: { id: bookingId },
    include: { plan: true }
  });

  if (!booking || booking.status !== 'pending') throw new Error('Booking request invalid');

  const result = await prisma.$transaction(async (tx) => {
    await tx.planBooking.update({
      where: { id: bookingId },
      data: { status: 'approved' }
    });

    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + Number(booking.plan.validity));

    await tx.memberPlan.create({
      data: {
        memberId: booking.memberId,
        planId: booking.planId,
        startDate: start,
        expiryDate: end,
        remainingSessions: Number(booking.plan.sessions)
      }
    });

    return tx.planBooking.findUnique({
      where: { id: bookingId },
      include: {
        member: { select: { id: true, firstName: true, lastName: true, email: true } },
        plan: { select: { id: true, name: true, type: true, sessions: true, validity: true, priceCents: true, currency: true } }
      }
    });
  });

  logger.info(`Booking approved: ${id} by user ${userId}`);
  return result;
}

// ------------------------------------------------------
// REJECT BOOKING
// ------------------------------------------------------
async function rejectBooking(id, userId) {
  const bookingId = parseNumber(id);

  const booking = await prisma.planBooking.findUnique({
    where: { id: bookingId }
  });

  if (!booking || booking.status !== 'pending') throw new Error('Booking request invalid');

  const result = await prisma.planBooking.update({
    where: { id: bookingId },
    data: { status: 'rejected' },
    include: {
      member: { select: { id: true, firstName: true, lastName: true, email: true } },
      plan: { select: { id: true, name: true, type: true, sessions: true, validity: true, priceCents: true, currency: true } }
    }
  });

  logger.info(`Booking rejected: ${id} by user ${userId}`);
  return result;
}

// ------------------------------------------------------
// STATIC FEATURES LIST
// ------------------------------------------------------
async function getFeatures() {
  return [
    "Sauna", "Group Classes", "Personal Training", "Locker Room", "Cardio Access",
    "Swimming Pool", "Nutrition Counseling", "Massage Therapy", "Yoga Classes",
    "Weight Training", "CrossFit", "Boxing", "Martial Arts", "Dance Classes",
    "Pilates", "Zumba", "Spin Classes", "Tennis Court", "Basketball Court", "Squash Court"
  ];
}

// ------------------------------------------------------
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
  rejectBooking
};
