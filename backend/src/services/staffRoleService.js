const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ----------------------------------------------------
// 📌 GET ALL STAFF ROLES
// ----------------------------------------------------
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
    orderBy: { createdAt: "desc" }
  });
};

// ----------------------------------------------------
// 📌 CREATE STAFF ROLE
// ----------------------------------------------------
const createStaffRole = async (data) => {
  const name = data?.name ? String(data.name).trim() : "";
  const description = data?.description ? String(data.description).trim() : null;

  // permissions must always be array
  const permissions = Array.isArray(data?.permissions) ? data.permissions : [];

  // allowed statuses
  const status = data?.status === "Inactive" ? "Inactive" : "Active";

  if (!name) {
    throw new Error("Role name is required");
  }

  // Prevent duplicate role names
  const exists = await prisma.staffRole.findUnique({ where: { name } });
  if (exists) {
    throw new Error("Role name already exists");
  }

  return prisma.staffRole.create({
    data: {
      name,
      description,
      permissions,
      status
    },
    select: {
      id: true,
      name: true,
      description: true,
      permissions: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    }
  });
};

// ----------------------------------------------------
// 📌 UPDATE STAFF ROLE
// ----------------------------------------------------
const updateStaffRole = async (id, data) => {
  id = Number(id);
  if (!id || isNaN(id)) {
    throw new Error("Invalid role ID");
  }

  const role = await prisma.staffRole.findUnique({ where: { id } });
  if (!role) {
    throw new Error("Role not found");
  }

  const updatedData = {};

  // update name with unique check
  if (data.name) {
    const name = String(data.name).trim();
    if (name) {
      const exists = await prisma.staffRole.findFirst({
        where: { name, id: { not: id } }
      });
      if (exists) {
        throw new Error("Role name already exists");
      }
      updatedData.name = name;
    }
  }

  // update description if provided
  if (data.description !== undefined) {
    updatedData.description = data.description ? String(data.description).trim() : null;
  }

  // permissions must always be array
  if (data.permissions !== undefined) {
    updatedData.permissions = Array.isArray(data.permissions) ? data.permissions : [];
  }

  // enforce valid status
  if (data.status !== undefined) {
    updatedData.status = data.status === "Inactive" ? "Inactive" : "Active";
  }

  return prisma.staffRole.update({
    where: { id },
    data: updatedData,
    select: {
      id: true,
      name: true,
      description: true,
      permissions: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    }
  });
};

// ----------------------------------------------------
// 📌 DELETE STAFF ROLE
// ----------------------------------------------------
const deleteStaffRole = async (id) => {
  id = Number(id);
  if (!id || isNaN(id)) {
    throw new Error("Invalid role ID");
  }

  // Do not delete roles assigned to staff members
  const staffCount = await prisma.staff.count({ where: { roleId: id } });
  if (staffCount > 0) {
    throw new Error("Cannot delete role that is assigned to staff members");
  }

  return prisma.staffRole.delete({ where: { id } });
};

// ----------------------------------------------------
// 🔐 CHECK PERMISSION FOR A ROLE
// ----------------------------------------------------
const hasPermission = async (roleId, permission) => {
  roleId = Number(roleId);
  if (!roleId || isNaN(roleId)) {
    return false;
  }

  const role = await prisma.staffRole.findUnique({
    where: { id: roleId },
    select: { permissions: true, status: true }
  });

  if (!role || role.status !== "Active") {
    return false;
  }

  return Array.isArray(role.permissions) && role.permissions.includes(permission);
};

// ----------------------------------------------------
// 🔐 GET PERMISSIONS BY ROLE
// ----------------------------------------------------
const getPermissionsByRoleId = async (roleId) => {
  roleId = Number(roleId);
  if (!roleId || isNaN(roleId)) {
    return [];
  }

  const role = await prisma.staffRole.findUnique({
    where: { id: roleId },
    select: { permissions: true, status: true }
  });

  if (!role || role.status !== "Active") {
    return [];
  }

  return Array.isArray(role.permissions) ? role.permissions : [];
};

module.exports = {
  getAllStaffRoles,
  createStaffRole,
  updateStaffRole,
  deleteStaffRole,
  hasPermission,
  getPermissionsByRoleId,
};
