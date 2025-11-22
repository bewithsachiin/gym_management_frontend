const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getAllSalaries = async () => {
  return await prisma.salary.findMany({
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
    orderBy: {
      createdAt: 'desc',
    },
  });
};

const getSalariesByBranch = async (branchId) => {
  return await prisma.salary.findMany({
    where: {
      staff: {
        branchId: branchId,
      },
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
    orderBy: {
      createdAt: 'desc',
    },
  });
};

const getSalaryById = async (id) => {
  return await prisma.salary.findUnique({
    where: { id: id },
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

const createSalary = async (salaryData, createdById) => {
  const salary = await prisma.salary.create({
    data: {
      salaryId: salaryData.salaryId,
      staffId: salaryData.staffId,
      periodStart: new Date(salaryData.periodStart),
      periodEnd: new Date(salaryData.periodEnd),
      hoursWorked: salaryData.hoursWorked ? parseFloat(salaryData.hoursWorked) : null,
      hourlyTotal: salaryData.hourlyTotal ? parseFloat(salaryData.hourlyTotal) : null,
      fixedSalary: salaryData.fixedSalary ? parseFloat(salaryData.fixedSalary) : null,
      commissionTotal: salaryData.commissionTotal ? parseFloat(salaryData.commissionTotal) : null,
      bonuses: salaryData.bonuses ? (typeof salaryData.bonuses === 'string' ? JSON.parse(salaryData.bonuses) : salaryData.bonuses) : null,
      deductions: salaryData.deductions ? (typeof salaryData.deductions === 'string' ? JSON.parse(salaryData.deductions) : salaryData.deductions) : null,
      netPay: parseFloat(salaryData.netPay),
      status: salaryData.status || 'Generated',
      approvedBy: salaryData.approvedBy ? parseInt(salaryData.approvedBy) : null,
      paidAt: salaryData.paidAt ? new Date(salaryData.paidAt) : null,
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

  return salary;
};

const updateSalary = async (id, salaryData) => {
  const existingSalary = await prisma.salary.findUnique({
    where: { id: id },
  });

  if (!existingSalary) {
    throw new Error("Salary record not found");
  }

  const updatedSalary = await prisma.salary.update({
    where: { id: id },
    data: {
      staffId: salaryData.staffId ? parseInt(salaryData.staffId) : existingSalary.staffId,
      periodStart: salaryData.periodStart ? new Date(salaryData.periodStart) : existingSalary.periodStart,
      periodEnd: salaryData.periodEnd ? new Date(salaryData.periodEnd) : existingSalary.periodEnd,
      hoursWorked: salaryData.hoursWorked !== undefined ? (salaryData.hoursWorked ? parseFloat(salaryData.hoursWorked) : null) : existingSalary.hoursWorked,
      hourlyTotal: salaryData.hourlyTotal !== undefined ? (salaryData.hourlyTotal ? parseFloat(salaryData.hourlyTotal) : null) : existingSalary.hourlyTotal,
      fixedSalary: salaryData.fixedSalary !== undefined ? (salaryData.fixedSalary ? parseFloat(salaryData.fixedSalary) : null) : existingSalary.fixedSalary,
      commissionTotal: salaryData.commissionTotal !== undefined ? (salaryData.commissionTotal ? parseFloat(salaryData.commissionTotal) : null) : existingSalary.commissionTotal,
      bonuses: salaryData.bonuses ? (typeof salaryData.bonuses === 'string' ? JSON.parse(salaryData.bonuses) : salaryData.bonuses) : existingSalary.bonuses,
      deductions: salaryData.deductions ? (typeof salaryData.deductions === 'string' ? JSON.parse(salaryData.deductions) : salaryData.deductions) : existingSalary.deductions,
      netPay: salaryData.netPay ? parseFloat(salaryData.netPay) : existingSalary.netPay,
      status: salaryData.status || existingSalary.status,
      approvedBy: salaryData.approvedBy ? parseInt(salaryData.approvedBy) : existingSalary.approvedBy,
      paidAt: salaryData.paidAt ? new Date(salaryData.paidAt) : existingSalary.paidAt,
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

  return updatedSalary;
};

const deleteSalary = async (id) => {
  const existingSalary = await prisma.salary.findUnique({
    where: { id: id },
  });

  if (!existingSalary) {
    throw new Error("Salary record not found");
  }

  await prisma.salary.delete({
    where: { id: id },
  });

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
