"use strict";

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ----------------------------------------------------
// SAFE HELPERS (strict runtime validation)
// ----------------------------------------------------
const toInt = (val) => {
  const num = Number(val);
  return Number.isFinite(num) ? num : null;
};

const toDate = (val) => {
  if (!val) return null;
  const parsed = new Date(val);
  return !isNaN(parsed.valueOf()) ? parsed : null;
};

// Format Date into readable form
const formatDate = (date) => {
  const d = toDate(date);
  return d
    ? d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : null;
};

// Convert numbers like "₹1000" or "1000" to integer cents
const toCents = (amount) => {
  if (!amount) return 0;
  const clean = amount.toString().replace(/[₹,\s]/g, "");
  const value = parseFloat(clean);
  return Number.isFinite(value) ? Math.round(value * 100) : 0;
};

// ----------------------------------------------------
// GET ALL MEMBERSHIPS
// ----------------------------------------------------
const getAllMemberships = async (search, page, limit) => {
  const safePage = toInt(page) || 1;
  const safeLimit = toInt(limit) || 10;
  const skip = (safePage - 1) * safeLimit;

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { title: { contains: search, mode: "insensitive" } }
        ]
      }
    : {};

  const memberships = await prisma.membership.findMany({
    where,
    skip,
    take: safeLimit,
    orderBy: { createdAt: "desc" }
  });

  const total = await prisma.membership.count({ where });

  return {
    memberships: memberships.map((m) => ({
      id: m.id,
      title: m.title,
      name: m.name,
      amount: (m.amount / 100).toString(),
      paidAmount: (m.paidAmount / 100).toString(),
      dueAmount: (m.dueAmount / 100).toString(),
      startDate: formatDate(m.startDate),
      endDate: formatDate(m.endDate),
      paymentStatus: m.paymentStatus
    })),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit)
    }
  };
};

// ----------------------------------------------------
// GET MEMBERSHIP BY ID
// ----------------------------------------------------
const getMembershipById = async (id) => {
  const safeId = toInt(id);
  if (!safeId) return null;

  const m = await prisma.membership.findUnique({ where: { id: safeId } });
  if (!m) return null;

  return {
    id: m.id,
    title: m.title,
    name: m.name,
    amount: (m.amount / 100).toString(),
    paidAmount: (m.paidAmount / 100).toString(),
    dueAmount: (m.dueAmount / 100).toString(),
    startDate: formatDate(m.startDate),
    endDate: formatDate(m.endDate),
    paymentStatus: m.paymentStatus
  };
};

// ----------------------------------------------------
// CREATE MEMBERSHIP
// ----------------------------------------------------
const createMembership = async (data) => {
  return await prisma.membership.create({
    data: {
      ...data,
      amount: toCents(data.amount),
      paidAmount: toCents(data.paidAmount),
      dueAmount: toCents(data.dueAmount)
    }
  });
};

// ----------------------------------------------------
// UPDATE MEMBERSHIP
// ----------------------------------------------------
const updateMembership = async (id, data) => {
  const safeId = toInt(id);
  if (!safeId) return null;

  return await prisma.membership.update({
    where: { id: safeId },
    data: {
      ...data,
      amount: data.amount ? toCents(data.amount) : undefined,
      paidAmount: data.paidAmount ? toCents(data.paidAmount) : undefined,
      dueAmount: data.dueAmount ? toCents(data.dueAmount) : undefined
    }
  });
};

// ----------------------------------------------------
// DELETE MEMBERSHIP
// ----------------------------------------------------
const deleteMembership = async (id) => {
  const safeId = toInt(id);
  if (!safeId) return null;

  return await prisma.membership.delete({ where: { id: safeId } });
};

// ----------------------------------------------------
// EXPORTS
// ----------------------------------------------------
module.exports = {
  getAllMemberships,
  getMembershipById,
  createMembership,
  updateMembership,
  deleteMembership
};
