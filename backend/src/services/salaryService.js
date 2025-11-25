const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// =====================================================
// 📌 GET ALL SALARIES (SuperAdmin)
// =====================================================
const getAllSalaries = async () => {
  return prisma.salary.findMany({
    include: {
      staff: {
        include: {
          user: true,
          role: true,
          branch: true,
        },
      },
      approvedByUser: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

// =====================================================
// 📌 GET SALARIES BY BRANCH
// =====================================================
const getSalariesByBranch = async (branchId) => {
  return prisma.salary.findMany({
    where: {
      staff: { branchId: Number(branchId) },
    },
    include: {
      staff: {
        include: {
          user: true,
          role: true,
          branch: true,
        },
      },
      approvedByUser: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

// =====================================================
// 📌 GET SALARY BY ID
// =====================================================
const getSalaryById = async (id) => {
  return prisma.salary.findUnique({
    where: { id: Number(id) },
    include: {
      staff: {
        include: {
          user: true,
          role: true,
          branch: true,
        },
      },
      approvedByUser: true,
    },
  });
};

// =====================================================
// 📌 CREATE SALARY RECORD
// =====================================================
const createSalary = async (data, createdById) => {
  // prevent runtime errors due to empty values
  const safeNumber = (val) =>
    val !== undefined && val !== null && val !== "" ? Number(val) : null;

  // safe object parsing
  const safeJson = (val) => {
    if (!val) return null;
    if (typeof val === "string") {
      try {
        return JSON.parse(val);
      } catch {
        return null;
      }
    }
    return val;
  };

  return prisma.salary.create({
    data: {
      salaryId: data.salaryId || null,
      staffId: safeNumber(data.staffId),
      periodStart: data.periodStart ? new Date(data.periodStart) : null,
      periodEnd: data.periodEnd ? new Date(data.periodEnd) : null,
      hoursWorked: safeNumber(data.hoursWorked),
      hourlyTotal: safeNumber(data.hourlyTotal),
      fixedSalary: safeNumber(data.fixedSalary),
      commissionTotal: safeNumber(data.commissionTotal),
      bonuses: safeJson(data.bonuses),
      deductions: safeJson(data.deductions),
      netPay: safeNumber(data.netPay),
      status: data.status || "Generated",
      approvedBy: safeNumber(data.approvedBy),
      paidAt: data.paidAt ? new Date(data.paidAt) : null,
      createdBy: createdById || null,
    },
    include: {
      staff: {
        include: {
          user: true,
          role: true,
          branch: true,
        },
      },
      approvedByUser: true,
    },
  });
};

// =====================================================
// 📌 UPDATE SALARY RECORD
// =====================================================
const updateSalary = async (id, data) => {
  const existing = await prisma.salary.findUnique({
    where: { id: Number(id) },
  });

  if (!existing) throw new Error("Salary record not found");

  const safeNumber = (val, oldVal) =>
    val !== undefined && val !== null && val !== "" ? Number(val) : oldVal;

  const safeJson = (val, oldVal) => {
    if (!val) return oldVal;
    if (typeof val === "string") {
      try {
        return JSON.parse(val);
      } catch {
        return oldVal;
      }
    }
    return val;
  };

  return prisma.salary.update({
    where: { id: Number(id) },
    data: {
      staffId: safeNumber(data.staffId, existing.staffId),
      periodStart: data.periodStart ? new Date(data.periodStart) : existing.periodStart,
      periodEnd: data.periodEnd ? new Date(data.periodEnd) : existing.periodEnd,
      hoursWorked: safeNumber(data.hoursWorked, existing.hoursWorked),
      hourlyTotal: safeNumber(data.hourlyTotal, existing.hourlyTotal),
      fixedSalary: safeNumber(data.fixedSalary, existing.fixedSalary),
      commissionTotal: safeNumber(data.commissionTotal, existing.commissionTotal),
      bonuses: safeJson(data.bonuses, existing.bonuses),
      deductions: safeJson(data.deductions, existing.deductions),
      netPay: safeNumber(data.netPay, existing.netPay),
      status: data.status || existing.status,
      approvedBy: safeNumber(data.approvedBy, existing.approvedBy),
      paidAt: data.paidAt ? new Date(data.paidAt) : existing.paidAt,
    },
    include: {
      staff: {
        include: {
          user: true,
          role: true,
          branch: true,
        },
      },
      approvedByUser: true,
    },
  });
};

// =====================================================
// 📌 DELETE SALARY RECORD
// =====================================================
const deleteSalary = async (id) => {
  const existing = await prisma.salary.findUnique({
    where: { id: Number(id) },
  });

  if (!existing) throw new Error("Salary record not found");

  await prisma.salary.delete({ where: { id: Number(id) } });

  return { message: "Salary record deleted successfully" };
};

module.exports = {
  getAllSalaries,
  getSalariesByBranch,
  getSalaryById,
  createSalary,
  updateSalary,
  deleteSalary,
};
