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
      branchImage: true,
      createdAt: true,
      updatedAt: true,
      admin: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      settings: {
        select: {
          operatingHours: true,
          holidays: true,
          notifications_enabled: true,
          sms_notifications_enabled: true,
          in_app_notifications_enabled: true,
          notification_message: true,
        },
      },
    },
  });
};

const createBranch = async (data, createdById) => {
  const {
    name,
    code,
    address,
    phone,
    email,
    status,
    hours,
    branch_image,
    adminId,
    operatingHours,
    holidays,
    notifications_enabled,
    sms_notifications_enabled,
    in_app_notifications_enabled,
    notification_message
  } = data;

  // adminId is now optional
  let adminIdValue = null;
  if (adminId) {
    // Check if admin exists and is role 'admin' or 'superadmin'
    const admin = await prisma.user.findUnique({
      where: { id: parseInt(adminId) },
    });

    if (!admin) {
      throw new Error('Admin user not found');
    }

    if (!['admin', 'superadmin'].includes(admin.role)) {
      throw new Error('Assigned user must be an admin or superadmin');
    }

    // Check if admin already has a branch (only for regular admins, superadmin can have multiple)
    if (admin.role === 'admin' && admin.branchId) {
      throw new Error('Admin is already assigned to a branch');
    }

    adminIdValue = parseInt(adminId);
  }

  // Map status to enum
  const statusEnum = status === 'Active' ? 'ACTIVE' : status === 'Inactive' ? 'INACTIVE' : status === 'Maintenance' ? 'MAINTENANCE' : 'INACTIVE';

  // Create branch and update admin's branchId in transaction
  const result = await prisma.$transaction(async (prisma) => {
    const branch = await prisma.branch.create({
      data: {
        name,
        code,
        address,
        phone,
        email,
        status: statusEnum,
        hours,
        branch_image,
        adminId: adminIdValue,
        createdById: createdById ? parseInt(createdById) : null,
        settings: {
          create: {
            operatingHours,
            holidays,
            notifications_enabled,
            sms_notifications_enabled,
            in_app_notifications_enabled,
            notification_message,
          },
        },
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
        branchImage: true,
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        settings: {
          select: {
            operatingHours: true,
            holidays: true,
            notifications_enabled: true,
            sms_notifications_enabled: true,
            in_app_notifications_enabled: true,
            notification_message: true,
          },
        },
      },
    });

    // Update admin's branchId (only for regular admins, superadmin doesn't need branchId update)
    if (adminIdValue && admin.role === 'admin') {
      await prisma.user.update({
        where: { id: adminIdValue },
        data: { branchId: branch.id },
      });
    }

    return branch;
  });

  return result;
};

const updateBranch = async (id, data) => {
  const {
    name,
    code,
    address,
    phone,
    email,
    status,
    hours,
    branch_image,
    operatingHours,
    holidays,
    notifications_enabled,
    sms_notifications_enabled,
    in_app_notifications_enabled,
    notification_message
  } = data;

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
        branchImage: branch_image,
        settings: {
      upsert: {
        create: {
          operatingHours,
          holidays,
          notifications_enabled,
          sms_notifications_enabled,
          in_app_notifications_enabled,
          notification_message,
        },
        update: {
          operatingHours,
          holidays,
          notifications_enabled,
          sms_notifications_enabled,
          in_app_notifications_enabled,
          notification_message,
        },
      },
    },
  };

  // If new image, delete old one from Cloudinary
  if (branch_image) {
    const existingBranch = await prisma.branch.findUnique({ where: { id: parseInt(id) } });
    if (existingBranch && existingBranch.branch_image) {
      const publicId = existingBranch.branchImage.split('/').pop().split('.')[0];
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
        branchImage: true,
        createdAt: true,
        updatedAt: true,
        settings: {
        select: {
          operatingHours: true,
          holidays: true,
          notifications_enabled: true,
          sms_notifications_enabled: true,
          in_app_notifications_enabled: true,
          notification_message: true,
        },
      },
    },
  });
};

const deleteBranch = async (id) => {
  const branch = await prisma.branch.findUnique({ where: { id: parseInt(id) } });
  if (branch && branch.branchImage) {
    const publicId = branch.branchImage.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(publicId);
  }

  await prisma.branch.delete({ where: { id: parseInt(id) } });
};

const getBranchById = async (id) => {
  return await prisma.branch.findUnique({
    where: { id: parseInt(id) },
    select: {
      id: true,
      name: true,
      code: true,
      address: true,
      phone: true,
      email: true,
      status: true,
      hours: true,
      branchImage: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

const getAvailableAdmins = async () => {
  return await prisma.user.findMany({
    where: {
      role: 'admin',
      branchId: null, // Only admins not assigned to any branch
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  });
};

module.exports = {
  getAllBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
  getAvailableAdmins,
};
