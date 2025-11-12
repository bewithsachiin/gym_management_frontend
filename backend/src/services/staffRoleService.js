const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getAllStaffRoles = async () => {
  return await prisma.staffRole.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

const createStaffRole = async (data) => {
  const { name, description } = data;

  return await prisma.staffRole.create({
    data: {
      name,
      description,
    },
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

  return await prisma.staffRole.update({
    where: { id: parseInt(id) },
    data: {
      name,
      description,
    },
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
  await prisma.staffRole.delete({ where: { id: parseInt(id) } });
};

module.exports = {
  getAllStaffRoles,
  createStaffRole,
  updateStaffRole,
  deleteStaffRole,
};
