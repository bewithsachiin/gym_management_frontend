const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllStaffRoles = async () => {
  return prisma.staffRole.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { id: 'asc' }
  });
};

const createStaffRole = async (data) => {
  const { name, description } = data;

  if (!name || name.trim() === "") {
    throw new Error("Role name is required");
  }

  // prevent duplicate role names
  const exists = await prisma.staffRole.findUnique({
    where: { name },
  });

  if (exists) {
    throw new Error("Role name already exists");
  }

  return prisma.staffRole.create({
    data: { name, description },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

const updateStaffRole = async (id, data) => {
  const { name, description } = data;

  return prisma.staffRole.update({
    where: { id },
    data: { name, description },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

const deleteStaffRole = async (id) => {
  return prisma.staffRole.delete({
    where: { id },
  });
};

module.exports = {
  getAllStaffRoles,
  createStaffRole,
  updateStaffRole,
  deleteStaffRole,
};
