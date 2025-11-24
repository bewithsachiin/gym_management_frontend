const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/* ------------------------------------
   SAFE HELPERS
------------------------------------ */
const toInt = (v) => {
  const n = parseInt(v);
  return Number.isNaN(n) ? null : n;
};

/* ---------------------------------------------------------
   GET ALL GROUPS (Trainer/Receptionist = Branch Only)
---------------------------------------------------------- */
const getAllGroups = async (branchId = null) => {
  console.log("📌 [SERVICE] getAllGroups | branchId =", branchId);

  try {
    const where = branchId ? { branchId: toInt(branchId) } : {};

    const groups = await prisma.group.findMany({
      where,
      include: {
        _count: { select: { members: true } },
        branch: { select: { id: true, name: true } }
      }
    });

    return groups.map(group => ({
      id: group.id,
      name: group.name,
      photo: group.photo,
      total: group._count.members,
      branchId: group.branchId,
      branch: group.branch
    }));
  } catch (error) {
    console.error("❌ [SERVICE ERROR] getAllGroups:", error);
    throw new Error(`Error fetching groups: ${error.message}`);
  }
};

/* ---------------------------------------------------------
   GET SINGLE GROUP (Non-Admin users = Branch Lock)
---------------------------------------------------------- */
const getGroupById = async (id, branchId = null) => {
  console.log("📌 [SERVICE] getGroupById | id =", id, "| branchId =", branchId);

  try {
    const groupId = toInt(id);
    if (!groupId) throw new Error("Invalid group ID");

    const where = { id: groupId };
    if (branchId !== null) where.branchId = toInt(branchId);

    const group = await prisma.group.findFirst({
      where,
      include: {
        _count: { select: { members: true } },
        branch: { select: { id: true, name: true } }
      }
    });

    if (!group) throw new Error("Group not found or not authorized");

    return {
      id: group.id,
      name: group.name,
      photo: group.photo,
      total: group._count.members,
      branchId: group.branchId,
      branch: group.branch
    };
  } catch (error) {
    console.error("❌ [SERVICE ERROR] getGroupById:", error);
    throw new Error(`Error fetching group: ${error.message}`);
  }
};

/* ---------------------------------------------------------
   CREATE GROUP (Only SuperAdmin/Admin)
---------------------------------------------------------- */
const createGroup = async (data, branchId) => {
  console.log("🆕 [SERVICE] createGroup:", data);

  try {
    const bId = toInt(branchId);
    if (!bId) throw new Error("Invalid branchId");

    const group = await prisma.group.create({
      data: {
        name: data.name,
        photo: data.photo && typeof data.photo === "string" ? data.photo : null,
        branchId: bId
      },
      include: {
        _count: { select: { members: true } },
        branch: { select: { id: true, name: true } }
      }
    });

    return {
      id: group.id,
      name: group.name,
      photo: group.photo,
      total: group._count.members,
      branchId: group.branchId,
      branch: group.branch
    };
  } catch (error) {
    console.error("❌ [SERVICE ERROR] createGroup:", error);
    throw new Error(`Error creating group: ${error.message}`);
  }
};

/* ---------------------------------------------------------
   UPDATE GROUP (Only SuperAdmin/Admin)
---------------------------------------------------------- */
const updateGroup = async (id, data, branchId = null) => {
  console.log("✏️ [SERVICE] updateGroup | id =", id, "| data =", data, "| branchId =", branchId);

  try {
    const groupId = toInt(id);
    if (!groupId) throw new Error("Invalid group ID");

    const where = { id: groupId };
    if (branchId !== null) where.branchId = toInt(branchId);

    const updated = await prisma.group.updateMany({
      where,
      data: {
        name: data.name,
        photo: data.photo && typeof data.photo === "string" ? data.photo : null
      }
    });

    if (updated.count === 0) throw new Error("Group not found or not authorized");

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        _count: { select: { members: true } },
        branch: { select: { id: true, name: true } }
      }
    });

    return {
      id: group.id,
      name: group.name,
      photo: group.photo,
      total: group._count.members,
      branchId: group.branchId,
      branch: group.branch
    };
  } catch (error) {
    console.error("❌ [SERVICE ERROR] updateGroup:", error);
    throw new Error(`Error updating group: ${error.message}`);
  }
};

/* ---------------------------------------------------------
   DELETE GROUP (Only SuperAdmin/Admin)
---------------------------------------------------------- */
const deleteGroup = async (id, branchId = null) => {
  console.log("🗑️ [SERVICE] deleteGroup | id =", id, "| branchId =", branchId);

  try {
    const groupId = toInt(id);
    if (!groupId) throw new Error("Invalid group ID");

    // Remove relation from users first
    await prisma.user.updateMany({
      where: { groupId },
      data: { groupId: null }
    });

    const where = { id: groupId };
    if (branchId !== null) where.branchId = toInt(branchId);

    const deleted = await prisma.group.deleteMany({ where });

    if (deleted.count === 0) {
      throw new Error("Group not found or not authorized");
    }

    return { message: "Group deleted successfully" };
  } catch (error) {
    console.error("❌ [SERVICE ERROR] deleteGroup:", error);
    throw new Error(`Error deleting group: ${error.message}`);
  }
};

module.exports = {
  getAllGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup
};
