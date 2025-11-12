const { PrismaClient } = require('@prisma/client');
const cloudinary = require('../config/cloudinary');

const prisma = new PrismaClient();

const getAllBranches = async () => {
  return await prisma.branch.findMany({
    select: {
      id: true,
      name: true,
      code: true,
      address: true,
      phone: true,
      email: true,
      status: true,
      hours: true,
      branch_image: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

const createBranch = async (data) => {
  const { name, code, address, phone, email, status, hours, branch_image } = data;

  // Map status to enum
  const statusEnum = status === 'Active' ? 'ACTIVE' : status === 'Inactive' ? 'INACTIVE' : status === 'Maintenance' ? 'MAINTENANCE' : 'INACTIVE';

  return await prisma.branch.create({
    data: {
      name,
      code,
      address,
      phone,
      email,
      status: statusEnum,
      hours,
      branch_image,
      adminId: 1, // Assuming superadmin id is 1
    },
    select: {
      id: true,
      name: true,
      code: true,
      address: true,
      phone: true,
      email: true,
      status: true,
      hours: true,
      branch_image: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

const updateBranch = async (id, data) => {
  const { name, code, address, phone, email, status, hours, branch_image } = data;

  // Map status to enum
  const statusEnum = status === 'Active' ? 'ACTIVE' : status === 'Inactive' ? 'INACTIVE' : status === 'Maintenance' ? 'MAINTENANCE' : 'INACTIVE';

  const updateData = {
    name,
    code,
    address,
    phone,
    email,
    status: statusEnum,
    hours,
    branch_image,
  };

  // If new image, delete old one from Cloudinary
  if (branch_image) {
    const existingBranch = await prisma.branch.findUnique({ where: { id: parseInt(id) } });
    if (existingBranch && existingBranch.branch_image) {
      const publicId = existingBranch.branch_image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }
  }

  return await prisma.branch.update({
    where: { id: parseInt(id) },
    data: updateData,
    select: {
      id: true,
      name: true,
      code: true,
      address: true,
      phone: true,
      email: true,
      status: true,
      hours: true,
      branch_image: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

const deleteBranch = async (id) => {
  const branch = await prisma.branch.findUnique({ where: { id: parseInt(id) } });
  if (branch && branch.branch_image) {
    const publicId = branch.branch_image.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(publicId);
  }

  await prisma.branch.delete({ where: { id: parseInt(id) } });
};

module.exports = {
  getAllBranches,
  createBranch,
  updateBranch,
  deleteBranch,
};
