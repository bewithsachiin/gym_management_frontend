const prisma = require("../config/db");

// ----------------------------------------------------
// 📌 GET ALL MEMBERS
// ----------------------------------------------------
const getMembersService = async (branchId, search, isSuperAdmin) => {
  const where = {
    role: "member",
  };

  // Branch filter unless superadmin
  if (!isSuperAdmin && branchId) {
    where.branchId = branchId;
  }

  // Search filter
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { memberId: { contains: search, mode: "insensitive" } },
      { plan: { plan_name: { contains: search, mode: "insensitive" } } },
    ];
  }

  const members = await prisma.user.findMany({
    where,
    include: {
      plan: true,
      branch: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Map to frontend expected format
  return members.map((member) => ({
    id: member.id,
    name: `${member.firstName} ${member.lastName}`,
    memberId: member.memberId,
    joiningDate: member.joiningDate ? member.joiningDate.toISOString().split("T")[0] : null,
    expireDate: member.expireDate ? member.expireDate.toISOString().split("T")[0] : null,
    type: member.memberType || "Member",
    status: member.memberStatus || "Active",
    membershipStatus: member.membershipStatus || "Activate",
    photo: member.profilePhoto,
    plan: member.plan ? member.plan.plan_name : null,
    email: member.email,
    phone: member.phone,
    // Add other fields as needed
  }));
};

// ----------------------------------------------------
// 📌 GET SINGLE MEMBER
// ----------------------------------------------------
const getMemberByIdService = async (id, branchId, isSuperAdmin) => {
  const where = {
    id: parseInt(id),
    role: "member",
  };

  if (!isSuperAdmin && branchId) {
    where.branchId = branchId;
  }

  const member = await prisma.user.findFirst({
    where,
    include: {
      plan: true,
      branch: true,
    },
  });

  if (!member) return null;

  return {
    id: member.id,
    firstName: member.firstName,
    lastName: member.lastName,
    middleName: member.middleName,
    email: member.email,
    phone: member.phone,
    address: member.address,
    city: member.city,
    state: member.state,
    gender: member.gender,
    dob: member.dob ? member.dob.toISOString().split("T")[0] : null,
    joiningDate: member.joiningDate ? member.joiningDate.toISOString().split("T")[0] : null,
    expireDate: member.expireDate ? member.expireDate.toISOString().split("T")[0] : null,
    memberId: member.memberId,
    memberType: member.memberType || "Member",
    memberStatus: member.memberStatus || "Active",
    membershipStatus: member.membershipStatus || "Activate",
    plan: member.plan ? member.plan.plan_name : null,
    planId: member.planId,
    profilePhoto: member.profilePhoto,
    weight: member.weight,
    height: member.height,
    chest: member.chest,
    waist: member.waist,
    thigh: member.thigh,
    arms: member.arms,
    fat: member.fat,
    username: member.username,
    loginEnabled: member.loginEnabled,
    branchId: member.branchId,
    branch: member.branch,
  };
};

// ----------------------------------------------------
// 📌 CREATE MEMBER
// ----------------------------------------------------
const createMemberService = async (data) => {
  // If plan provided as string, find planId
  let planId = null;
  if (data.plan) {
    const plan = await prisma.plan.findFirst({
      where: { plan_name: data.plan },
    });
    if (plan) planId = plan.id;
  }

  const member = await prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      middleName: data.middleName,
      email: data.email,
      password: data.password,
      role: "member",
      memberId: data.memberId,
      gender: data.gender,
      dob: data.dob ? new Date(data.dob) : null,
      phone: data.phone,
      address: data.address,
      city: data.city,
      state: data.state,
      profilePhoto: data.photo,
      joiningDate: data.joiningDate ? new Date(data.joiningDate) : new Date(),
      expireDate: data.expireDate ? new Date(data.expireDate) : null,
      memberType: data.type || "Member",
      memberStatus: data.status || "Active",
      membershipStatus: data.membershipStatus || "Activate",
      planId: planId,
      weight: data.weight,
      height: data.height,
      chest: data.chest,
      waist: data.waist,
      thigh: data.thigh,
      arms: data.arms,
      fat: data.fat,
      username: data.username,
      loginEnabled: data.loginEnabled || false,
      branchId: data.branchId, // Assume passed or from context
    },
    include: {
      plan: true,
    },
  });

  return {
    id: member.id,
    name: `${member.firstName} ${member.lastName}`,
    memberId: member.memberId,
    joiningDate: member.joiningDate ? member.joiningDate.toISOString().split("T")[0] : null,
    expireDate: member.expireDate ? member.expireDate.toISOString().split("T")[0] : null,
    type: member.memberType,
    status: member.memberStatus,
    membershipStatus: member.membershipStatus,
    photo: member.profilePhoto,
    plan: member.plan ? member.plan.plan_name : null,
  };
};

// ----------------------------------------------------
// 📌 UPDATE MEMBER
// ----------------------------------------------------
const updateMemberService = async (id, data) => {
  // If plan provided as string, find planId
  let planId = undefined;
  if (data.planId !== undefined) {
    planId = data.planId;
  } else if (data.plan !== undefined) {
    if (data.plan) {
      const plan = await prisma.plan.findFirst({
        where: { plan_name: data.plan },
      });
      planId = plan ? plan.id : null;
    } else {
      planId = null;
    }
  }

  const updated = await prisma.user.update({
    where: { id: parseInt(id) },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      middleName: data.middleName,
      email: data.email,
      memberId: data.memberId,
      gender: data.gender,
      dob: data.dob ? new Date(data.dob) : null,
      phone: data.phone,
      address: data.address,
      city: data.city,
      state: data.state,
      profilePhoto: data.photo,
      joiningDate: data.joiningDate ? new Date(data.joiningDate) : undefined,
      expireDate: data.expireDate ? new Date(data.expireDate) : undefined,
      memberType: data.type,
      memberStatus: data.status,
      membershipStatus: data.membershipStatus,
      planId: planId,
      weight: data.weight,
      height: data.height,
      chest: data.chest,
      waist: data.waist,
      thigh: data.thigh,
      arms: data.arms,
      fat: data.fat,
      username: data.username,
      loginEnabled: data.loginEnabled,
    },
    include: {
      plan: true,
    },
  });

  return {
    id: updated.id,
    name: `${updated.firstName} ${updated.lastName}`,
    memberId: updated.memberId,
    joiningDate: updated.joiningDate ? updated.joiningDate.toISOString().split("T")[0] : null,
    expireDate: updated.expireDate ? updated.expireDate.toISOString().split("T")[0] : null,
    type: updated.memberType,
    status: updated.memberStatus,
    membershipStatus: updated.membershipStatus,
    photo: updated.profilePhoto,
    plan: updated.plan ? updated.plan.plan_name : null,
  };
};

// ----------------------------------------------------
// 📌 ACTIVATE / DEACTIVATE MEMBER
// ----------------------------------------------------
const activateMemberService = async (id) => {
  const member = await prisma.user.findUnique({
    where: { id: parseInt(id) },
  });

  if (!member) return null;

  const newStatus = member.membershipStatus === "Activate" ? "Activated" : "Activate";

  const updated = await prisma.user.update({
    where: { id: parseInt(id) },
    data: { membershipStatus: newStatus },
    include: {
      plan: true,
    },
  });

  return {
    id: updated.id,
    name: `${updated.firstName} ${updated.lastName}`,
    membershipStatus: updated.membershipStatus,
    plan: updated.plan ? updated.plan.plan_name : null,
  };
};

// ----------------------------------------------------
// 📌 DELETE MEMBER
// ----------------------------------------------------
const deleteMemberService = async (id) => {
  const memberId = parseInt(id);

  // Helper function: delete safely
  const safeDeleteMany = async (model, where) => {
    if (model?.deleteMany) {
      await model.deleteMany({ where });
    }
  };

  // 1. MemberAttendance
  await safeDeleteMany(prisma.memberAttendance, { memberId });

  // 2. Attendance
  await safeDeleteMany(prisma.attendance, { memberId });

  // 3. QRCheck
  await safeDeleteMany(prisma.qrCheck, {
    OR: [{ memberId }, { scannedBy: memberId }]
  });

  // 4. PlanBooking
  await safeDeleteMany(prisma.planBooking, { memberId });

  // 5. MemberPlan
  await safeDeleteMany(prisma.memberPlan, { memberId });

  // 6. BranchPlanBooking
  await safeDeleteMany(prisma.branchPlanBooking, { memberId });

  // 7. MemberBranchPlan
  await safeDeleteMany(prisma.memberBranchPlan, { memberId });

  // 8. PersonalTrainingSession
  await safeDeleteMany(prisma.personalTrainingSession, { memberId });

  // 9. MemberFeedback
  await safeDeleteMany(prisma.memberFeedback, { memberId });

  // 10. Payment
  await safeDeleteMany(prisma.payment, { memberId });

  // 11. Finally delete User (safe)
  if (prisma.user?.delete) {
    await prisma.user.delete({
      where: { id: memberId },
    });
  }
};

module.exports = {
  getMembersService,
  getMemberByIdService,
  createMemberService,
  updateMemberService,
  activateMemberService,
  deleteMemberService,
};
