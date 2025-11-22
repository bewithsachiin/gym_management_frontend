const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllStaffRoles = async () => {
  return prisma.staffRole.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      permissions: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' }
  });
};

const createStaffRole = async (data) => {
  const { name, description, permissions, status } = data;

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
    data: {
      name,
      description,
      permissions: permissions || [],
      status: status || "Active"
    },
    select: {
      id: true,
      name: true,
      description: true,
      permissions: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

const updateStaffRole = async (id, data) => {
  const { name, description, permissions, status } = data;

  // Check for duplicate name if name is being updated
  if (name) {
    const exists = await prisma.staffRole.findFirst({
      where: { name, id: { not: id } },
    });

    if (exists) {
      throw new Error("Role name already exists");
    }
  }

  return prisma.staffRole.update({
    where: { id },
    data: { name, description, permissions, status },
    select: {
      id: true,
      name: true,
      description: true,
      permissions: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

const deleteStaffRole = async (id) => {
  // Check if role is being used by any staff
  const staffCount = await prisma.staff.count({
    where: { roleId: id },
  });

  if (staffCount > 0) {
    throw new Error("Cannot delete role that is assigned to staff members");
  }

  return prisma.staffRole.delete({
    where: { id },
  });
};

// Function to check if a role has a specific permission
const hasPermission = async (roleId, permission) => {
  const role = await prisma.staffRole.findUnique({
    where: { id: roleId },
    select: { permissions: true, status: true }
  });

  if (!role || role.status !== 'Active') {
    return false;
  }

  return role.permissions && role.permissions.includes(permission);
};

// Function to get permissions for a role
const getPermissionsByRoleId = async (roleId) => {
  const role = await prisma.staffRole.findUnique({
    where: { id: roleId },
    select: { permissions: true, status: true }
  });

  if (!role || role.status !== 'Active') {
    return [];
  }

  return role.permissions || [];
};

module.exports = {
  getAllStaffRoles,
  createStaffRole,
  updateStaffRole,
  deleteStaffRole,
  hasPermission,
  getPermissionsByRoleId,
};
