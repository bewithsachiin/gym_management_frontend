const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// -----------------------------------------------------
// GET ALL MEMBERS
// -----------------------------------------------------
exports.getMembers = async (filters) => {
  const { search, branchId, isSuperAdmin } = filters;

  const where = {};

  if (!isSuperAdmin) {
    where.branchId = parseInt(branchId);
  }

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { memberId: { contains: search, mode: "insensitive" } },
      { plan: { contains: search, mode: "insensitive" } },
    ];
  }

  const members = await prisma.user.findMany({
    where: {
      ...where,
      role: "member",
    },
    orderBy: { createdAt: "desc" },
  });

  return members.map((m) => ({
    id: m.id,
    name: `${m.firstName} ${m.lastName}`,
    firstName: m.firstName,
    lastName: m.lastName,
    memberId: m.memberId,
    joiningDate: m.joiningDate,
    expireDate: m.expireDate,
    type: m.type,
    membershipStatus: m.membershipStatus || "Activate",
    plan: m.plan,
    photo: m.photo,
    email: m.email,
    mobile: m.mobile,
  }));
};

// -----------------------------------------------------
// GET SINGLE MEMBER BY ID
// -----------------------------------------------------
exports.getMemberById = async (id, userBranchId, isSuperAdmin) => {
  const where = { id: parseInt(id), role: "member" };

  if (!isSuperAdmin) {
    where.branchId = userBranchId;
  }

  return await prisma.user.findFirst({ where });
};

// -----------------------------------------------------
// CREATE MEMBER
// -----------------------------------------------------
exports.createMember = async (data, createdBy) => {
  data.branchId = parseInt(data.branchId);
  data.createdBy = createdBy;

  const created = await prisma.user.create({
    data: {
      ...data,
      role: "member",
    },
  });

  return created;
};

// -----------------------------------------------------
// UPDATE MEMBER
// -----------------------------------------------------
exports.updateMember = async (id, data) => {
  const updated = await prisma.user.update({
    where: { id: parseInt(id) },
    data,
  });

  return updated;
};

// -----------------------------------------------------
// TOGGLE ACTIVATE/DEACTIVATE
// -----------------------------------------------------
exports.activateMember = async (id) => {
  const member = await prisma.user.findUnique({
    where: { id: parseInt(id) },
  });

  const newStatus =
    member.membershipStatus === "Activate" ? "Activated" : "Activate";

  return await prisma.user.update({
    where: { id: parseInt(id) },
    data: { membershipStatus: newStatus },
  });
};

// -----------------------------------------------------
// DELETE MEMBER
// -----------------------------------------------------
exports.deleteMember = async (id) => {
  await prisma.user.delete({
    where: { id: parseInt(id) },
  });
};
