"use strict";

const prisma = require("../config/db");

// ====================================================================
// STRICT RUNTIME VALIDATORS (NO LOGIC CHANGE)
// ====================================================================

// ID must be a real positive integer
const toId = (val) => {
  const num = Number(val);
  if (!Number.isFinite(num) || num <= 0) {
    throw createError("Invalid ID: Must be a positive number", "INVALID_ID");
  }
  return num;
};

// Generic error creator (safe & predictable)
function createError(message, code = "VALIDATION_ERROR", status = 400) {
  const err = new Error(message);
  err.code = code;
  err.status = status;
  return err;
}

// Safe short date
const safeDate = (d) => (d ? new Date(d).toISOString().split("T")[0] : null);

// ====================================================================
// MEMBER LIST
// ====================================================================
const getMembersService = async (branchId, search, isSuperAdmin) => {
  const where = { role: "member" };

  if (!isSuperAdmin && branchId) where.branchId = toId(branchId);

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { memberId: { contains: search, mode: "insensitive" } }
    ];
  }

  const members = await prisma.user.findMany({
    where,
    include: { plan: true, branch: true },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return members.map((m) => ({
    id: m.id,
    name: `${m.firstName} ${m.lastName}`,
    memberId: m.memberId,
    joiningDate: safeDate(m.joiningDate),
    expireDate: safeDate(m.expireDate),
    type: m.memberType || "Member",
    status: m.memberStatus || "Active",
    membershipStatus: m.membershipStatus || "Activate",
    photo: m.profilePhoto,
    plan: m.plan?.plan_name || null,
    email: m.email,
    phone: m.phone
  }));
};

// ====================================================================
// GET MEMBER BY ID
// ====================================================================
const getMemberByIdService = async (id, branchId, isSuperAdmin) => {
  const parsedId = toId(id);

  const where = { id: parsedId, role: "member" };
  if (!isSuperAdmin && branchId) where.branchId = toId(branchId);

  const m = await prisma.user.findFirst({
    where,
    include: { plan: true, branch: true }
  });

  if (!m) return null;

  return {
    id: m.id,
    firstName: m.firstName,
    lastName: m.lastName,
    middleName: m.middleName,
    email: m.email,
    phone: m.phone,
    address: m.address,
    city: m.city,
    state: m.state,
    gender: m.gender,
    dob: safeDate(m.dob),
    joiningDate: safeDate(m.joiningDate),
    expireDate: safeDate(m.expireDate),
    memberId: m.memberId,
    memberType: m.memberType || "Member",
    memberStatus: m.memberStatus || "Active",
    membershipStatus: m.membershipStatus || "Activate",
    plan: m.plan?.plan_name || null,
    planId: m.planId,
    profilePhoto: m.profilePhoto,
    weight: m.weight,
    height: m.height,
    chest: m.chest,
    waist: m.waist,
    thigh: m.thigh,
    arms: m.arms,
    fat: m.fat,
    username: m.username,
    loginEnabled: m.loginEnabled,
    branchId: m.branchId,
    branch: m.branch
  };
};

// ====================================================================
// CREATE MEMBER
// ====================================================================
const createMemberService = async (data) => {
  let planId = null;

  if (data.plan) {
    const found = await prisma.plan.findFirst({ where: { plan_name: data.plan } });
    planId = found?.id || null;
  }

  const member = await prisma.user.create({
    data: {
      ...data,
      role: "member",
      dob: data.dob ? new Date(data.dob) : null,
      joiningDate: data.joiningDate ? new Date(data.joiningDate) : new Date(),
      expireDate: data.expireDate ? new Date(data.expireDate) : null,
      planId,
      profilePhoto: data.photo
    },
    include: { plan: true }
  });

  return {
    id: member.id,
    name: `${member.firstName} ${member.lastName}`,
    memberId: member.memberId,
    joiningDate: safeDate(member.joiningDate),
    expireDate: safeDate(member.expireDate),
    type: member.memberType,
    status: member.memberStatus,
    membershipStatus: member.membershipStatus,
    photo: member.profilePhoto,
    plan: member.plan?.plan_name || null
  };
};

// ====================================================================
// UPDATE MEMBER
// ====================================================================
const updateMemberService = async (id, data) => {
  const parsedId = toId(id);

  let planId = undefined;
  if (data.plan || data.planId !== undefined) {
    if (data.planId) {
      planId = data.planId;
    } else if (data.plan) {
      const found = await prisma.plan.findFirst({ where: { plan_name: data.plan } });
      planId = found?.id || null;
    } else {
      planId = null;
    }
  }

  const updated = await prisma.user.update({
    where: { id: parsedId },
    data: {
      ...data,
      dob: data.dob ? new Date(data.dob) : undefined,
      joiningDate: data.joiningDate ? new Date(data.joiningDate) : undefined,
      expireDate: data.expireDate ? new Date(data.expireDate) : undefined,
      profilePhoto: data.photo,
      planId
    },
    include: { plan: true }
  });

  return {
    id: updated.id,
    name: `${updated.firstName} ${updated.lastName}`,
    memberId: updated.memberId,
    joiningDate: safeDate(updated.joiningDate),
    expireDate: safeDate(updated.expireDate),
    type: updated.memberType,
    status: updated.memberStatus,
    membershipStatus: updated.membershipStatus,
    photo: updated.profilePhoto,
    plan: updated.plan?.plan_name || null
  };
};

// ====================================================================
// ACTIVATE / DEACTIVATE MEMBER
// ====================================================================
const activateMemberService = async (id) => {
  const parsedId = toId(id);

  const found = await prisma.user.findUnique({ where: { id: parsedId } });
  if (!found) return null;

  const newStatus =
    found.membershipStatus === "Activate" ? "Activated" : "Activate";

  const updated = await prisma.user.update({
    where: { id: parsedId },
    data: { membershipStatus: newStatus },
    include: { plan: true }
  });

  return {
    id: updated.id,
    name: `${updated.firstName} ${updated.lastName}`,
    membershipStatus: updated.membershipStatus,
    plan: updated.plan?.plan_name || null
  };
};

// ====================================================================
// DELETE MEMBER (SAFE CASCADE)
// ====================================================================
const deleteMemberService = async (id) => {
  const parsedId = toId(id);

  const safeDelete = async (model, where) => {
    if (model?.deleteMany) await model.deleteMany({ where });
  };

  await safeDelete(prisma.planBooking, { memberId: parsedId });
  await safeDelete(prisma.memberPlan, { memberId: parsedId });
  await safeDelete(prisma.memberBranchPlan, { memberId: parsedId });
  await safeDelete(prisma.personalTrainingSession, { memberId: parsedId });
  await safeDelete(prisma.payment, { memberId: parsedId });

  if (prisma.user?.delete) await prisma.user.delete({ where: { id: parsedId } });
};

// ====================================================================
// EXPORTS (NO CHANGE)
// ====================================================================
module.exports = {
  getMembersService,
  getMemberByIdService,
  createMemberService,
  updateMemberService,
  activateMemberService,
  deleteMemberService
};
