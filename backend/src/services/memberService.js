const prisma = require("../config/db");

// 🧪 Debug helper
const debugService = (label, extra = {}) => {
  console.log(`\n🔧 [SERVICE] ${label}`);
  if (extra) console.log("📌 Data:", extra);
};

const safeDate = (d) => (d ? d.toISOString().split("T")[0] : null);

// ----------------------------------------------------
// 📌 GET ALL MEMBERS
// ----------------------------------------------------
const getMembersService = async (branchId, search, isSuperAdmin) => {
  debugService("GET MEMBERS", { branchId, search, isSuperAdmin });

  const where = { role: "member" };

  if (!isSuperAdmin && branchId) where.branchId = branchId;

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
    include: { plan: true, branch: true },
    orderBy: { createdAt: "desc" },
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
    plan: m.plan ? m.plan.plan_name : null,
    email: m.email,
    phone: m.phone,
  }));
};

// ----------------------------------------------------
// 📌 GET SINGLE MEMBER
// ----------------------------------------------------
const getMemberByIdService = async (id, branchId, isSuperAdmin) => {
  debugService("GET MEMBER BY ID", { id, branchId, isSuperAdmin });

  const where = { id: parseInt(id), role: "member" };
  if (!isSuperAdmin && branchId) where.branchId = branchId;

  const m = await prisma.user.findFirst({
    where,
    include: { plan: true, branch: true },
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
    plan: m.plan ? m.plan.plan_name : null,
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
    branch: m.branch,
  };
};

// ----------------------------------------------------
// 📌 CREATE MEMBER
// ----------------------------------------------------
const createMemberService = async (data) => {
  debugService("CREATE MEMBER", data);

  let planId = null;
  if (data.plan) {
    const plan = await prisma.plan.findFirst({ where: { plan_name: data.plan } });
    if (plan) planId = plan.id;
  }

  const member = await prisma.user.create({
    data: {
      ...data,
      role: "member",
      dob: data.dob ? new Date(data.dob) : null,
      joiningDate: data.joiningDate ? new Date(data.joiningDate) : new Date(),
      expireDate: data.expireDate ? new Date(data.expireDate) : null,
      planId,
      profilePhoto: data.photo,
    },
    include: { plan: true },
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
    plan: member.plan ? member.plan.plan_name : null,
  };
};

// ----------------------------------------------------
// 📌 UPDATE MEMBER
// ----------------------------------------------------
const updateMemberService = async (id, data) => {
  debugService("UPDATE MEMBER", { id, data });

  let planId = undefined;
  if (data.planId !== undefined) {
    planId = data.planId;
  } else if (data.plan !== undefined) {
    if (data.plan) {
      const plan = await prisma.plan.findFirst({ where: { plan_name: data.plan } });
      planId = plan ? plan.id : null;
    } else planId = null;
  }

  const updated = await prisma.user.update({
    where: { id: parseInt(id) },
    data: {
      ...data,
      dob: data.dob ? new Date(data.dob) : undefined,
      joiningDate: data.joiningDate ? new Date(data.joiningDate) : undefined,
      expireDate: data.expireDate ? new Date(data.expireDate) : undefined,
      profilePhoto: data.photo,
      planId,
    },
    include: { plan: true },
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
    plan: updated.plan ? updated.plan.plan_name : null,
  };
};

// ----------------------------------------------------
// 📌 ACTIVATE / DEACTIVATE MEMBER
// ----------------------------------------------------
const activateMemberService = async (id) => {
  debugService("ACTIVATE/DEACTIVATE MEMBER", { id });

  const member = await prisma.user.findUnique({
    where: { id: parseInt(id) },
  });

  if (!member) return null;

  const newStatus = member.membershipStatus === "Activate" ? "Activated" : "Activate";

  const updated = await prisma.user.update({
    where: { id: parseInt(id) },
    data: { membershipStatus: newStatus },
    include: { plan: true },
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
  debugService("DELETE MEMBER", { id });

  const memberId = parseInt(id);
  const safeDeleteMany = async (model, where) => {
    if (model?.deleteMany) await model.deleteMany({ where });
  };

  await safeDeleteMany(prisma.memberAttendance, { memberId });
  await safeDeleteMany(prisma.attendance, { memberId });
  await safeDeleteMany(prisma.qrCheck, { OR: [{ memberId }, { scannedBy: memberId }] });
  await safeDeleteMany(prisma.planBooking, { memberId });
  await safeDeleteMany(prisma.memberPlan, { memberId });
  await safeDeleteMany(prisma.branchPlanBooking, { memberId });
  await safeDeleteMany(prisma.memberBranchPlan, { memberId });
  await safeDeleteMany(prisma.personalTrainingSession, { memberId });
  await safeDeleteMany(prisma.memberFeedback, { memberId });
  await safeDeleteMany(prisma.payment, { memberId });

  if (prisma.user?.delete) await prisma.user.delete({ where: { id: memberId } });
};

// ----------------------------------------------------
// 📌 GET MEMBER PROFILE
// ----------------------------------------------------
const getMemberProfileService = async (id) => {
  debugService("GET MEMBER PROFILE", { id });

  const m = await prisma.user.findFirst({
    where: { id: parseInt(id), role: "member" },
    include: { plan: true, branch: true },
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
    plan: m.plan ? m.plan.plan_name : null,
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
    branch: m.branch,
  };
};

// ----------------------------------------------------
// 📌 GET MEMBER PROFILE (for member self-service)
// ----------------------------------------------------
const getMyProfileService = async (userId) => {
  debugService("GET MY PROFILE", { userId });

  const m = await prisma.user.findFirst({
    where: { id: parseInt(userId), role: "member" },
    include: { plan: true, branch: true },
  });

  if (!m) return null;

  return {
    member_id: m.memberId,
    first_name: m.firstName,
    last_name: m.lastName,
    gender: m.gender,
    dob: safeDate(m.dob),
    email: m.email,
    phone: m.phone,
    address_street: m.address,
    address_city: m.city,
    address_state: m.state,
    address_zip: m.addressZip,
    profile_picture: m.profilePhoto,
    profile_preview: m.profilePhoto,
    membership_plan: m.plan ? m.plan.plan_name : null,
    plan_start_date: safeDate(m.joiningDate),
    plan_end_date: safeDate(m.expireDate),
    status: m.memberStatus || "Active",
    membership_type: m.memberType || "Member",
    membership_fee: m.plan ? (m.plan.price_cents / 100).toString() : "0",
  };
};

// ----------------------------------------------------
// 📌 UPDATE MEMBER PROFILE (for member self-service)
// ----------------------------------------------------
const updateMyProfileService = async (userId, data) => {
  debugService("UPDATE MY PROFILE", { userId, data });

  const updateData = {
    firstName: data.first_name,
    lastName: data.last_name,
    gender: data.gender,
    dob: data.dob ? new Date(data.dob) : undefined,
    email: data.email,
    phone: data.phone,
    address: data.address_street,
    city: data.address_city,
    state: data.address_state,
    addressZip: data.address_zip,
    profilePhoto: data.profile_picture,
  };

  // Remove undefined values
  Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

  const updated = await prisma.user.update({
    where: { id: parseInt(userId) },
    data: updateData,
    include: { plan: true },
  });

  return {
    member_id: updated.memberId,
    first_name: updated.firstName,
    last_name: updated.lastName,
    gender: updated.gender,
    dob: safeDate(updated.dob),
    email: updated.email,
    phone: updated.phone,
    address_street: updated.address,
    address_city: updated.city,
    address_state: updated.state,
    address_zip: updated.addressZip,
    profile_picture: updated.profilePhoto,
    profile_preview: updated.profilePhoto,
    membership_plan: updated.plan ? updated.plan.plan_name : null,
    plan_start_date: safeDate(updated.joiningDate),
    plan_end_date: safeDate(updated.expireDate),
    status: updated.memberStatus || "Active",
    membership_type: updated.memberType || "Member",
    membership_fee: updated.plan ? (updated.plan.price_cents / 100).toString() : "0",
  };
};

// ----------------------------------------------------
// 📌 CHANGE MEMBER PASSWORD (for member self-service)
// ----------------------------------------------------
const changeMyPasswordService = async (userId, currentPassword, newPassword) => {
  debugService("CHANGE MY PASSWORD", { userId });

  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
  });

  if (!user) throw new Error("User not found");

  const bcrypt = require("bcrypt");
  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) throw new Error("Current password is incorrect");

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: parseInt(userId) },
    data: { password: hashedPassword },
  });

  return { success: true, message: "Password changed successfully" };
};

module.exports = {
  getMembersService,
  getMemberByIdService,
  createMemberService,
  updateMemberService,
  activateMemberService,
  deleteMemberService,
  getMemberProfileService,
  getMyProfileService,
  updateMyProfileService,
  changeMyPasswordService,
};
