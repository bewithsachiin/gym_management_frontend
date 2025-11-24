const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ----------------------------------------------------
// 🔧 Helper: Format Date -> "Month DD, YYYY"
// ----------------------------------------------------
const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
};

// ----------------------------------------------------
// 🔧 Helper: Convert numbers like "₹1000" or "1000" to cents
// ----------------------------------------------------
const parseAmountToCents = (amount) => {
  if (!amount) return 0;
  const clean = amount.toString().replace(/[₹,\s]/g, '');
  return Math.round(parseFloat(clean) * 100);
};

// ----------------------------------------------------
// 📌 GET ALL MEMBERSHIPS
// ----------------------------------------------------
const getAllMemberships = async (search, page, limit) => {
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { title: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  const memberships = await prisma.membership.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
  });

  const total = await prisma.membership.count({ where });

  return {
    memberships: memberships.map(m => ({
      id: m.id,
      title: m.title,
      name: m.name,
      amount: (m.amount / 100).toString(),
      paidAmount: (m.paidAmount / 100).toString(),
      dueAmount: (m.dueAmount / 100).toString(),
      startDate: formatDate(m.startDate),
      endDate: formatDate(m.endDate),
      paymentStatus: m.paymentStatus,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ----------------------------------------------------
// 📌 GET MEMBERSHIP BY ID
// ----------------------------------------------------
const getMembershipById = async (id) => {
  const m = await prisma.membership.findUnique({
    where: { id: parseInt(id) },
  });

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
    paymentStatus: m.paymentStatus,
  };
};

// ----------------------------------------------------
// 📌 CREATE MEMBERSHIP
// ----------------------------------------------------
const createMembership = async (data) => {
  return await prisma.membership.create({
    data: {
      ...data,
      amount: parseAmountToCents(data.amount),
      paidAmount: parseAmountToCents(data.paidAmount),
      dueAmount: parseAmountToCents(data.dueAmount),
    },
  });
};

// ----------------------------------------------------
// 📌 UPDATE MEMBERSHIP
// ----------------------------------------------------
const updateMembership = async (id, data) => {
  return await prisma.membership.update({
    where: { id: parseInt(id) },
    data: {
      ...data,
      amount: data.amount ? parseAmountToCents(data.amount) : undefined,
      paidAmount: data.paidAmount ? parseAmountToCents(data.paidAmount) : undefined,
      dueAmount: data.dueAmount ? parseAmountToCents(data.dueAmount) : undefined,
    },
  });
};

// ----------------------------------------------------
// ❌ DELETE MEMBERSHIP
// ----------------------------------------------------
const deleteMembership = async (id) => {
  return await prisma.membership.delete({
    where: { id: parseInt(id) },
  });
};

module.exports = {
  getAllMemberships,
  getMembershipById,
  createMembership,
  updateMembership,
  deleteMembership,
};
