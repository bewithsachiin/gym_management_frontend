"use strict";

const { PrismaClient } = require("@prisma/client");
const cloudinary = require("../config/cloudinary");

const prisma = new PrismaClient();

// ---------------------------------------------------------
// Helpers
// ---------------------------------------------------------

const toInt = (v) => {
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? null : n;
};

const mapStatus = (status) => {
  switch (status) {
    case "Active":
      return "ACTIVE";
    case "Inactive":
      return "INACTIVE";
    case "Maintenance":
      return "MAINTENANCE";
    default:
      return "INACTIVE";
  }
};

const removeOldImage = async (existingImage) => {
  if (!existingImage) return;
  try {
    const publicId = existingImage.split("/").pop().split(".")[0];
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
  } catch {
    // Silent catch avoids crashing on invalid public IDs
  }
};

// ---------------------------------------------------------
// Get All Branches
// ---------------------------------------------------------
const getAllBranches = async () => {
  return prisma.branch.findMany({
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
        select: { id: true, firstName: true, lastName: true, email: true }
      },
      createdBy: {
        select: { id: true, firstName: true, lastName: true, email: true }
      },
      settings: {
        select: {
          operatingHours: true,
          holidays: true,
          notifications_enabled: true,
          sms_notifications_enabled: true,
          in_app_notifications_enabled: true,
          notification_message: true
        }
      }
    }
  });
};

// ---------------------------------------------------------
// Create Branch (with nested settings + admin linking)
// ---------------------------------------------------------
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

  // Validate admin if provided
  let adminToAssign = null;
  if (adminId) {
    const admin = await prisma.user.findUnique({
      where: { id: toInt(adminId) }
    });

    if (!admin) throw new Error("Admin user not found");
    if (!["admin", "superadmin"].includes(admin.role)) {
      throw new Error("Assigned user must be an admin or superadmin");
    }
    if (admin.role === "admin" && admin.branchId) {
      throw new Error("Admin is already assigned to a branch");
    }

    adminToAssign = admin;
  }

  const statusEnum = mapStatus(status);

  return prisma.$transaction(async (tx) => {
    const branch = await tx.branch.create({
      data: {
        name,
        code,
        address,
        phone,
        email,
        status: statusEnum,
        hours,
        branchImage: branch_image,
        adminId: adminToAssign ? adminToAssign.id : null,
        createdById: createdById ? toInt(createdById) : null,
        settings: {
          create: {
            operatingHours,
            holidays,
            notifications_enabled,
            sms_notifications_enabled,
            in_app_notifications_enabled,
            notification_message
          }
        }
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
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        settings: {
          select: {
            operatingHours: true,
            holidays: true,
            notifications_enabled: true,
            sms_notifications_enabled: true,
            in_app_notifications_enabled: true,
            notification_message: true
          }
        }
      }
    });

    // Update admin's branch (admin only, not superadmin)
    if (adminToAssign && adminToAssign.role === "admin") {
      await tx.user.update({
        where: { id: adminToAssign.id },
        data: { branchId: branch.id }
      });
    }

    return branch;
  });
};

// ---------------------------------------------------------
// Update Branch (replace image + upsert settings)
// ---------------------------------------------------------
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

  const branchId = toInt(id);
  if (!branchId) throw new Error("Invalid branch ID");

  // Remove old branch image if new provided
  if (branch_image) {
    const existing = await prisma.branch.findUnique({
      where: { id: branchId },
      select: { branchImage: true }
    });
    if (existing?.branchImage) await removeOldImage(existing.branchImage);
  }

  return prisma.branch.update({
    where: { id: branchId },
    data: {
      name,
      code,
      address,
      phone,
      email,
      status: mapStatus(status),
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
            notification_message
          },
          update: {
            operatingHours,
            holidays,
            notifications_enabled,
            sms_notifications_enabled,
            in_app_notifications_enabled,
            notification_message
          }
        }
      }
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
      settings: {
        select: {
          operatingHours: true,
          holidays: true,
          notifications_enabled: true,
          sms_notifications_enabled: true,
          in_app_notifications_enabled: true,
          notification_message: true
        }
      }
    }
  });
};

// ---------------------------------------------------------
// Delete Branch (remove cloud image)
// ---------------------------------------------------------
const deleteBranch = async (id) => {
  const branchId = toInt(id);
  if (!branchId) throw new Error("Invalid branch ID");

  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    select: { branchImage: true }
  });

  if (branch?.branchImage) await removeOldImage(branch.branchImage);

  await prisma.branch.delete({ where: { id: branchId } });
};

// ---------------------------------------------------------
// Get Branch by ID
// ---------------------------------------------------------
const getBranchById = async (id) => {
  return prisma.branch.findUnique({
    where: { id: toInt(id) },
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
      updatedAt: true
    }
  });
};

// ---------------------------------------------------------
// List Admins available for assigning to new branches
// ---------------------------------------------------------
const getAvailableAdmins = async () => {
  return prisma.user.findMany({
    where: {
      role: "admin",
      branchId: null
    },
    select: { id: true, firstName: true, lastName: true, email: true }
  });
};

module.exports = {
  getAllBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
  getAvailableAdmins
};
