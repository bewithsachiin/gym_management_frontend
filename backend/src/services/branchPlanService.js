const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

// ---------------------------
// Helper: safe int parsing
// ---------------------------
const toInt = (value) => {
  const num = parseInt(value);
  return Number.isNaN(num) ? null : num;
};

// Helper: priceCents -> "₹X,XXX"
const formatPrice = (priceCents) => {
  if (priceCents === undefined || priceCents === null) return null;
  try {
    const rupees = Math.round(priceCents / 100);
    return `₹${rupees.toLocaleString('en-IN')}`;
  } catch {
    return null;
  }
};

// Helper: "₹1,200" / 1200 -> cents
const parsePrice = (price) => {
  if (price === undefined || price === null) return null;
  try {
    const normalized = price.toString().replace(/[₹,]/g, '');
    const num = parseFloat(normalized);
    if (Number.isNaN(num)) return null;
    return Math.round(num * 100);
  } catch {
    return null;
  }
};

// Helper: "YYYY-MM-DD HH:MM AM/PM"
const formatDateTime = (date) => {
  try {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return null;

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;

    return `${year}-${month}-${day} ${hours}:${minutes} ${ampm}`;
  } catch {
    return null;
  }
};

// Get all branch plans with filtering (admin can only see their branch plans)
const getAllBranchPlans = async (filters = {}, userBranchId = null, userRole = null) => {
  logger.info('🟦 getAllBranchPlans called', { filters, userBranchId, userRole });

  try {
    const { type, active } = filters;

    const where = {};
    if (type) where.type = type;
    if (active !== undefined) where.active = active === 'true';

    if (userRole !== 'superadmin' && userBranchId) {
      const branchIdInt = toInt(userBranchId);
      if (branchIdInt !== null) {
        where.branchId = branchIdInt;
      }
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

    logger.info('getAllBranchPlans fetched plans', { count: plans.length });

    return plans.map((plan) => ({
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
  } catch (error) {
    logger.error('❌ getAllBranchPlans error', { error });
    throw error;
  }
};

// Get branch plan by ID
const getBranchPlanById = async (id, userBranchId = null, userRole = null) => {
  logger.info('🟨 getBranchPlanById called', { id, userBranchId, userRole });

  try {
    const idInt = toInt(id);
    if (idInt === null) {
      throw new Error('Invalid branch plan ID');
    }

    const where = { id: idInt };

    if (userRole !== 'superadmin' && userBranchId) {
      const branchIdInt = toInt(userBranchId);
      if (branchIdInt !== null) {
        where.branchId = branchIdInt;
      }
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
  } catch (error) {
    logger.error('❌ getBranchPlanById error', { error });
    throw error;
  }
};

// Create new branch plan
const createBranchPlan = async (planData, userId, userBranchId = null, userRole = null) => {
  logger.info('🟩 createBranchPlan called', { planData, userId, userBranchId, userRole });

  try {
    const { name, type, sessions, validity, price } = planData;

    const priceCents = parsePrice(price);
    const sessionsInt = toInt(sessions);
    const validityInt = toInt(validity);
    const branchIdInt = toInt(userBranchId);
    const userIdInt = toInt(userId);

    const plan = await prisma.branchPlan.create({
      data: {
        name,
        type,
        sessions: sessionsInt,
        validity: validityInt,
        priceCents,
        currency: 'INR',
        active: true,
        branchId: branchIdInt,
        createdById: userIdInt,
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
  } catch (error) {
    logger.error('❌ createBranchPlan error', { error });
    throw error;
  }
};

// Update branch plan
const updateBranchPlan = async (id, planData, userId, userBranchId = null, userRole = null) => {
  logger.info('🟪 updateBranchPlan called', { id, planData, userId, userBranchId, userRole });

  try {
    const idInt = toInt(id);
    if (idInt === null) {
      throw new Error('Invalid branch plan ID');
    }

    const where = { id: idInt };

    if (userRole !== 'superadmin' && userBranchId) {
      const branchIdInt = toInt(userBranchId);
      if (branchIdInt !== null) {
        where.branchId = branchIdInt;
      }
    }

    const existingPlan = await prisma.branchPlan.findFirst({ where });
    if (!existingPlan) {
      throw new Error('Plan not found');
    }

    const updateData = {};
    if (planData.name !== undefined) updateData.name = planData.name;
    if (planData.type !== undefined) updateData.type = planData.type;
    if (planData.sessions !== undefined) updateData.sessions = toInt(planData.sessions);
    if (planData.validity !== undefined) updateData.validity = toInt(planData.validity);
    if (planData.price !== undefined) updateData.priceCents = parsePrice(planData.price);
    if (planData.active !== undefined) updateData.active = planData.active;

    const updatedPlan = await prisma.branchPlan.update({
      where: { id: idInt },
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
  } catch (error) {
    logger.error('❌ updateBranchPlan error', { error });
    throw error;
  }
};

// Delete branch plan
const deleteBranchPlan = async (id, userId, userBranchId = null, userRole = null) => {
  logger.info('🟥 deleteBranchPlan called', { id, userId, userBranchId, userRole });

  try {
    const idInt = toInt(id);
    if (idInt === null) {
      throw new Error('Invalid branch plan ID');
    }

    const where = { id: idInt };

    if (userRole !== 'superadmin' && userBranchId) {
      const branchIdInt = toInt(userBranchId);
      if (branchIdInt !== null) {
        where.branchId = branchIdInt;
      }
    }

    const plan = await prisma.branchPlan.findFirst({ where });
    if (!plan) {
      throw new Error('Plan not found');
    }

    const activeBookings = await prisma.branchPlanBooking.count({
      where: { branchPlanId: idInt, status: 'approved' },
    });

    const activeMemberPlans = await prisma.memberBranchPlan.count({
      where: { branchPlanId: idInt },
    });

    if (activeBookings > 0 || activeMemberPlans > 0) {
      throw new Error('Cannot delete plan with active bookings or subscriptions');
    }

    await prisma.branchPlan.delete({ where: { id: idInt } });

    logger.info(`Branch Plan deleted: ${plan.name} (ID: ${id}) by user ${userId}`);
  } catch (error) {
    logger.error('❌ deleteBranchPlan error', { error });
    throw error;
  }
};

// Toggle branch plan active status
const toggleBranchPlanStatus = async (id, userId, userBranchId = null, userRole = null) => {
  logger.info('🔁 toggleBranchPlanStatus called', { id, userId, userBranchId, userRole });

  try {
    const idInt = toInt(id);
    if (idInt === null) {
      throw new Error('Invalid branch plan ID');
    }

    const where = { id: idInt };

    if (userRole !== 'superadmin' && userBranchId) {
      const branchIdInt = toInt(userBranchId);
      if (branchIdInt !== null) {
        where.branchId = branchIdInt;
      }
    }

    const plan = await prisma.branchPlan.findFirst({ where });
    if (!plan) {
      throw new Error('Plan not found');
    }

    const updatedPlan = await prisma.branchPlan.update({
      where: { id: idInt },
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

    logger.info(
      `Branch Plan status toggled: ${updatedPlan.name} (ID: ${id}) - Active: ${updatedPlan.active} by user ${userId}`
    );

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
  } catch (error) {
    logger.error('❌ toggleBranchPlanStatus error', { error });
    throw error;
  }
};

// Get branch booking requests
const getBranchBookingRequests = async (userBranchId = null, userRole = null) => {
  logger.info('📩 getBranchBookingRequests called', { userBranchId, userRole });

  try {
    const where = {};

    if (userRole !== 'superadmin' && userBranchId) {
      const branchIdInt = toInt(userBranchId);
      if (branchIdInt !== null) {
        where.branchPlan = { branchId: branchIdInt };
      }
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

    logger.info('getBranchBookingRequests fetched', { count: bookings.length });

    return bookings.map((booking) => ({
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
  } catch (error) {
    logger.error('❌ getBranchBookingRequests error', { error });
    throw error;
  }
};

// Approve branch booking request
const approveBranchBooking = async (bookingId, userId) => {
  logger.info('🟢 approveBranchBooking called', { bookingId, userId });

  try {
    const bookingIdInt = toInt(bookingId);
    if (bookingIdInt === null) {
      throw new Error('Invalid booking ID');
    }

    const booking = await prisma.branchPlanBooking.findUnique({
      where: { id: bookingIdInt },
      include: { branchPlan: true, member: true },
    });

    if (!booking) {
      throw new Error('Booking request not found');
    }

    if (booking.status !== 'pending') {
      throw new Error('Booking request is not pending');
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedBooking = await tx.branchPlanBooking.update({
        where: { id: bookingIdInt },
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

      const startDate = new Date();
      const expiryDate = new Date();
      expiryDate.setDate(startDate.getDate() + booking.branchPlan.validity);

      await tx.memberBranchPlan.create({
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
  } catch (error) {
    logger.error('❌ approveBranchBooking error', { error });
    throw error;
  }
};

// Reject branch booking request
const rejectBranchBooking = async (bookingId, userId) => {
  logger.info('🔴 rejectBranchBooking called', { bookingId, userId });

  try {
    const bookingIdInt = toInt(bookingId);
    if (bookingIdInt === null) {
      throw new Error('Invalid booking ID');
    }

    const booking = await prisma.branchPlanBooking.findUnique({
      where: { id: bookingIdInt },
    });

    if (!booking) {
      throw new Error('Booking request not found');
    }

    if (booking.status !== 'pending') {
      throw new Error('Booking request is not pending');
    }

    const updatedBooking = await prisma.branchPlanBooking.update({
      where: { id: bookingIdInt },
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
  } catch (error) {
    logger.error('❌ rejectBranchBooking error', { error });
    throw error;
  }
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
}
