"use strict";

const { PrismaClient } = require("@prisma/client");
const logger = require("../utils/logger");

const prisma = new PrismaClient();

// --------------------------------------------------------
// SAFE PARSERS (No throw; return null for invalid input)
// --------------------------------------------------------
const toInt = (value) => {
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : null;
};

const parsePrice = (value) => {
  if (value === undefined || value === null) return null;
  const clean = value.toString().replace(/[₹,\s]/g, "");
  const num = parseFloat(clean);
  return Number.isNaN(num) ? null : Math.round(num * 100);
};

const formatPrice = (cents) => {
  if (cents === undefined || cents === null) return null;
  const rupees = Math.round(cents / 100);
  return `₹${rupees.toLocaleString("en-IN")}`;
};

const formatDateTime = (date) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;

  const YYYY = d.getFullYear();
  const MM = String(d.getMonth() + 1).padStart(2, "0");
  const DD = String(d.getDate()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  let hours = d.getHours();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours || 12;

  return `${YYYY}-${MM}-${DD} ${hours}:${minutes} ${ampm}`;
};

// --------------------------------------------------------
// 1) GET ALL BRANCH PLANS
// --------------------------------------------------------
const getAllBranchPlans = async (filters = {}, userBranchId = null, userRole = null) => {
  try {
    const { type, active } = filters;
    const where = {};

    if (type) where.type = type;
    if (active !== undefined) where.active = active === "true";

    if (userRole !== "superadmin" && userBranchId) {
      const branchId = toInt(userBranchId);
      if (branchId) where.branchId = branchId;
    }

    const plans = await prisma.branchPlan.findMany({
      where,
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        branch: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return plans.map((p) => ({
      id: p.id,
      name: p.name,
      sessions: p.sessions,
      validity: p.validity,
      price: formatPrice(p.priceCents),
      active: p.active,
      type: p.type,
      createdBy: p.createdBy,
      branch: p.branch,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

  } catch (error) {
    logger.error("getAllBranchPlans", { error });
    throw error;
  }
};

// --------------------------------------------------------
// 2) GET BRANCH PLAN BY ID
// --------------------------------------------------------
const getBranchPlanById = async (id, userBranchId = null, userRole = null) => {
  try {
    const idInt = toInt(id);
    if (!idInt) return null;

    const where = { id: idInt };

    if (userRole !== "superadmin" && userBranchId) {
      const branchId = toInt(userBranchId);
      if (branchId) where.branchId = branchId;
    }

    const plan = await prisma.branchPlan.findFirst({
      where,
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        branch: { select: { id: true, name: true } },
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
    logger.error("getBranchPlanById", { error });
    throw error;
  }
};

// --------------------------------------------------------
// 3) CREATE BRANCH PLAN
// --------------------------------------------------------
const createBranchPlan = async (data, userId, userBranchId = null, userRole = null) => {
  try {
    const priceCents = parsePrice(data.price);
    const sessions = toInt(data.sessions);
    const validity = toInt(data.validity);
    const branchId = toInt(userBranchId);
    const creatorId = toInt(userId);

    const plan = await prisma.branchPlan.create({
      data: {
        name: data.name,
        type: data.type,
        sessions,
        validity,
        priceCents,
        currency: "INR",
        active: true,
        branchId,
        createdById: creatorId,
      },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        branch: { select: { id: true, name: true } },
      },
    });

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
    logger.error("createBranchPlan", { error });
    throw error;
  }
};

// --------------------------------------------------------
// 4) UPDATE BRANCH PLAN
// --------------------------------------------------------
const updateBranchPlan = async (id, data, userId, userBranchId = null, userRole = null) => {
  try {
    const idInt = toInt(id);
    if (!idInt) throw new Error("Invalid plan ID");

    const where = { id: idInt };

    if (userRole !== "superadmin" && userBranchId) {
      const branchId = toInt(userBranchId);
      if (branchId) where.branchId = branchId;
    }

    const existing = await prisma.branchPlan.findFirst({ where });
    if (!existing) throw new Error("Plan not found");

    const update = {};
    if (data.name !== undefined) update.name = data.name;
    if (data.type !== undefined) update.type = data.type;
    if (data.sessions !== undefined) update.sessions = toInt(data.sessions);
    if (data.validity !== undefined) update.validity = toInt(data.validity);
    if (data.price !== undefined) update.priceCents = parsePrice(data.price);
    if (data.active !== undefined) update.active = data.active;

    const plan = await prisma.branchPlan.update({
      where: { id: idInt },
      data: update,
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        branch: { select: { id: true, name: true } },
      },
    });

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
    logger.error("updateBranchPlan", { error });
    throw error;
  }
};

// --------------------------------------------------------
// 5) DELETE BRANCH PLAN
// --------------------------------------------------------
const deleteBranchPlan = async (id, userId, userBranchId = null, userRole = null) => {
  try {
    const idInt = toInt(id);
    if (!idInt) throw new Error("Invalid plan ID");

    const where = { id: idInt };

    if (userRole !== "superadmin" && userBranchId) {
      const branchId = toInt(userBranchId);
      if (branchId) where.branchId = branchId;
    }

    const plan = await prisma.branchPlan.findFirst({ where });
    if (!plan) throw new Error("Plan not found");

    const hasBookings = await prisma.branchPlanBooking.count({
      where: { branchPlanId: idInt, status: "approved" },
    });

    const hasMembers = await prisma.memberBranchPlan.count({
      where: { branchPlanId: idInt },
    });

    if (hasBookings || hasMembers) {
      throw new Error("Cannot delete plan with active subscriptions/bookings");
    }

    await prisma.branchPlan.delete({ where: { id: idInt } });

  } catch (error) {
    logger.error("deleteBranchPlan", { error });
    throw error;
  }
};

// --------------------------------------------------------
// 6) TOGGLE STATUS
// --------------------------------------------------------
const toggleBranchPlanStatus = async (id, userId, userBranchId = null, userRole = null) => {
  try {
    const idInt = toInt(id);
    if (!idInt) throw new Error("Invalid plan ID");

    const where = { id: idInt };

    if (userRole !== "superadmin" && userBranchId) {
      const branchId = toInt(userBranchId);
      if (branchId) where.branchId = branchId;
    }

    const existing = await prisma.branchPlan.findFirst({ where });
    if (!existing) throw new Error("Plan not found");

    const plan = await prisma.branchPlan.update({
      where: { id: idInt },
      data: { active: !existing.active },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        branch: { select: { id: true, name: true } },
      },
    });

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
    logger.error("toggleBranchPlanStatus", { error });
    throw error;
  }
};

// --------------------------------------------------------
// 7) GET BOOKING REQUESTS
// --------------------------------------------------------
const getBranchBookingRequests = async (userBranchId = null, userRole = null) => {
  try {
    const where = {};

    if (userRole !== "superadmin" && userBranchId) {
      const branchId = toInt(userBranchId);
      if (branchId) where.branchPlan = { branchId };
    }

    const bookings = await prisma.branchPlanBooking.findMany({
      where,
      include: {
        member: { select: { id: true, firstName: true, lastName: true, email: true } },
        branchPlan: {
          select: { id: true, name: true, type: true, sessions: true, validity: true, priceCents: true },
        },
      },
      orderBy: { requestedAt: "desc" },
    });

    return bookings.map((b) => ({
      id: b.id,
      memberId: b.memberId,
      branchPlanId: b.branchPlanId,
      memberName: `${b.member.firstName} ${b.member.lastName}`,
      planName: b.branchPlan.name,
      planType: b.branchPlan.type === "group" ? "Group" : "Personal",
      sessions: b.branchPlan.sessions,
      validity: b.branchPlan.validity,
      sessionsUsed: b.sessionsUsed,
      requestedAt: formatDateTime(b.requestedAt),
      status: b.status,
      note: b.note,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
    }));

  } catch (error) {
    logger.error("getBranchBookingRequests", { error });
    throw error;
  }
};

// --------------------------------------------------------
// 8) APPROVE BOOKING REQUEST
// --------------------------------------------------------
const approveBranchBooking = async (bookingId, userId) => {
  try {
    const idInt = toInt(bookingId);
    if (!idInt) throw new Error("Invalid booking ID");

    const record = await prisma.branchPlanBooking.findUnique({
      where: { id: idInt },
      include: { branchPlan: true },
    });

    if (!record) throw new Error("Booking not found");
    if (record.status !== "pending") throw new Error("Only pending requests can be approved");

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.branchPlanBooking.update({
        where: { id: idInt },
        data: { status: "approved" },
        include: {
          member: { select: { id: true, firstName: true, lastName: true, email: true } },
          branchPlan: {
            select: { id: true, name: true, type: true, sessions: true, validity: true, priceCents: true },
          },
        },
      });

      const start = new Date();
      const end = new Date();
      end.setDate(start.getDate() + record.branchPlan.validity);

      await tx.memberBranchPlan.create({
        data: {
          memberId: record.memberId,
          branchPlanId: record.branchPlanId,
          startDate: start,
          expiryDate: end,
          remainingSessions: record.branchPlan.sessions,
        },
      });

      return updated;
    });

    return {
      id: result.id,
      memberId: result.memberId,
      branchPlanId: result.branchPlanId,
      memberName: `${result.member.firstName} ${result.member.lastName}`,
      planName: result.branchPlan.name,
      planType: result.branchPlan.type === "group" ? "Group" : "Personal",
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
    logger.error("approveBranchBooking", { error });
    throw error;
  }
};

// --------------------------------------------------------
// 9) REJECT BOOKING REQUEST
// --------------------------------------------------------
const rejectBranchBooking = async (bookingId, userId) => {
  try {
    const idInt = toInt(bookingId);
    if (!idInt) throw new Error("Invalid booking ID");

    const record = await prisma.branchPlanBooking.findUnique({ where: { id: idInt } });
    if (!record) throw new Error("Booking not found");
    if (record.status !== "pending") throw new Error("Only pending requests can be rejected");

    const updated = await prisma.branchPlanBooking.update({
      where: { id: idInt },
      data: { status: "rejected" },
      include: {
        member: { select: { id: true, firstName: true, lastName: true, email: true } },
        branchPlan: {
          select: { id: true, name: true, type: true, sessions: true, validity: true, priceCents: true },
        },
      },
    });

    return {
      id: updated.id,
      memberId: updated.memberId,
      branchPlanId: updated.branchPlanId,
      memberName: `${updated.member.firstName} ${updated.member.lastName}`,
      planName: updated.branchPlan.name,
      planType: updated.branchPlan.type === "group" ? "Group" : "Personal",
      sessions: updated.branchPlan.sessions,
      validity: updated.branchPlan.validity,
      sessionsUsed: updated.sessionsUsed,
      requestedAt: formatDateTime(updated.requestedAt),
      status: updated.status,
      note: updated.note,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };

  } catch (error) {
    logger.error("rejectBranchBooking", { error });
    throw error;
  }
};

// --------------------------------------------------------
// EXPORTS
// --------------------------------------------------------
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
