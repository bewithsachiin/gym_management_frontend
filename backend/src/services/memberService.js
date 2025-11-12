const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const cloudinary = require('../config/cloudinary');

const prisma = new PrismaClient();

const getAllMembers = async () => {
  const members = await prisma.member.findMany({
    select: {
      id: true,
      phone: true,
      status: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      branch: {
        select: {
          id: true,
          name: true,
        },
      },
      staff: {
        select: {
          id: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  // Flatten the data for consistency
  return members.map(member => ({
    id: member.id,
    first_name: member.user.firstName,
    last_name: member.user.lastName,
    email: member.user.email,
    phone: member.phone,
    status: member.status,
    branch: member.branch,
    staff: member.staff ? {
      id: member.staff.id,
      first_name: member.staff.user.firstName,
      last_name: member.staff.user.lastName,
    } : null,
    createdAt: member.createdAt,
    updatedAt: member.updatedAt,
  }));
};

const createMember = async (data, createdById) => {
  const {
    first_name,
    last_name,
    email,
    password,
    phone,
    status,
    branchId,
    staffId,
    profile_photo,
  } = data;

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create User first
  const user = await prisma.user.create({
    data: {
      firstName: first_name,
      lastName: last_name,
      email,
      password: hashedPassword,
      role: 'MEMBER',
      branchId: parseInt(branchId),
    },
  });

  // Create Member
  const member = await prisma.member.create({
    data: {
      userId: user.id,
      branchId: parseInt(branchId),
      staffId: staffId ? parseInt(staffId) : null,
      phone: phone || null,
      status: status || 'Active',
    },
    select: {
      id: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      branch: {
        select: {
          id: true,
          name: true,
        },
      },
      staff: {
        select: {
          id: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  // Flatten the data for consistency
  return {
    id: member.id,
    first_name: member.user.firstName,
    last_name: member.user.lastName,
    email: member.user.email,
    branch: member.branch,
    staff: member.staff ? {
      id: member.staff.id,
      first_name: member.staff.user.firstName,
      last_name: member.staff.user.lastName,
    } : null,
    createdAt: member.createdAt,
    updatedAt: member.updatedAt,
  };
};

const updateMember = async (id, data) => {
  const {
    first_name,
    last_name,
    email,
    password,
    phone,
    status,
    branchId,
    staffId,
    profile_photo,
  } = data;

  const member = await prisma.member.findUnique({
    where: { id: parseInt(id) },
    include: { user: true },
  });

  if (!member) {
    throw new Error('Member not found');
  }

  // Hash new password if provided
  let hashedPassword = member.user.password;
  if (password && password !== member.user.password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  // Update User
  await prisma.user.update({
    where: { id: member.userId },
    data: {
      firstName: first_name,
      lastName: last_name,
      email,
      password: hashedPassword,
      branchId: parseInt(branchId),
    },
  });

  // Update Member
  const updatedMember = await prisma.member.update({
    where: { id: parseInt(id) },
    data: {
      branchId: parseInt(branchId),
      staffId: staffId ? parseInt(staffId) : null,
      phone: phone || null,
      status: status || 'Active',
    },
    select: {
      id: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      branch: {
        select: {
          id: true,
          name: true,
        },
      },
      staff: {
        select: {
          id: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  // Flatten the data for consistency
  return {
    id: updatedMember.id,
    first_name: updatedMember.user.firstName,
    last_name: updatedMember.user.lastName,
    email: updatedMember.user.email,
    branch: updatedMember.branch,
    staff: updatedMember.staff ? {
      id: updatedMember.staff.id,
      first_name: updatedMember.staff.user.firstName,
      last_name: updatedMember.staff.user.lastName,
    } : null,
    createdAt: updatedMember.createdAt,
    updatedAt: updatedMember.updatedAt,
  };
};

const deleteMember = async (id) => {
  const member = await prisma.member.findUnique({
    where: { id: parseInt(id) },
    include: { user: true },
  });

  if (!member) {
    throw new Error('Member not found');
  }

  // Delete Member (this will cascade to User if configured, but let's delete manually)
  await prisma.member.delete({ where: { id: parseInt(id) } });
  await prisma.user.delete({ where: { id: member.userId } });
};

module.exports = {
  getAllMembers,
  createMember,
  updateMember,
  deleteMember,
};
