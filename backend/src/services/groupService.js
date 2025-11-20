const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/* ---------------------------------------------------------
   GET ALL GROUPS (SuperAdmin = ALL, Admin = By Branch)
---------------------------------------------------------- */
const getAllGroups = async (branchId = null) => {
  try {
    const where = branchId ? { branchId: parseInt(branchId) } : {};

    const groups = await prisma.group.findMany({
      where,
      include: {
        _count: { select: { members: true } },
        branch: {
          select: {
            id: true,
            name: true
          }
        }
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
    throw new Error(`Error fetching groups: ${error.message}`);
  }
};

/* ---------------------------------------------------------
   GET SINGLE GROUP (SuperAdmin = any, Admin = own branch)
---------------------------------------------------------- */
const getGroupById = async (id, branchId) => {
  try {
    const where = {
      id: parseInt(id)
    };

    // Only filter branch if NOT superadmin
    if (branchId !== null) {
      where.branchId = branchId;
    }

    const group = await prisma.group.findFirst({
      where,
      include: {
        _count: { select: { members: true } },
        branch: { select: { id: true, name: true } }
      }
    });

    if (!group) throw new Error('Group not found');

    return {
      id: group.id,
      name: group.name,
      photo: group.photo,
      total: group._count.members,
      branchId: group.branchId,
      branch: group.branch
    };
  } catch (error) {
    throw new Error(`Error fetching group: ${error.message}`);
  }
};

/* ---------------------------------------------------------
   CREATE GROUP
---------------------------------------------------------- */
const createGroup = async (data, branchId) => {
  try {
    const group = await prisma.group.create({
      data: {
        name: data.name,
        photo: data.photo && typeof data.photo === 'string' ? data.photo : null,
        branchId: parseInt(branchId)
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
    throw new Error(`Error creating group: ${error.message}`);
  }
};

/* ---------------------------------------------------------
   UPDATE GROUP (SuperAdmin = any, Admin = own branch)
---------------------------------------------------------- */
const updateGroup = async (id, data, branchId) => {
  try {
    const where = { id: parseInt(id) };

    if (branchId !== null) {
      where.branchId = branchId; // Only admins get branch restriction
    }

    // Update with permission filter
    const updated = await prisma.group.updateMany({
      where,
      data: {
        name: data.name,
        photo: data.photo && typeof data.photo === 'string' ? data.photo : null
      }
    });

    if (updated.count === 0) {
      throw new Error('Group not found or not authorized');
    }

    // return updated group
    const group = await prisma.group.findUnique({
      where: { id: parseInt(id) },
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
    throw new Error(`Error updating group: ${error.message}`);
  }
};

/* ---------------------------------------------------------
   DELETE GROUP (SuperAdmin = any, Admin = own branch)
---------------------------------------------------------- */
const deleteGroup = async (id, branchId) => {
  try {
    // Remove group from all users first
    await prisma.user.updateMany({
      where: { groupId: parseInt(id) },
      data: { groupId: null }
    });

    const where = { id: parseInt(id) };

    if (branchId !== null) {
      where.branchId = branchId;
    }

    const deleted = await prisma.group.deleteMany({ where });

    if (deleted.count === 0) {
      throw new Error('Group not found or not authorized');
    }

    return { message: 'Group deleted successfully' };
  } catch (error) {
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
