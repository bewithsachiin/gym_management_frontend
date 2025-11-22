const prisma = require("../config/db");
const bcrypt = require("bcrypt");


// Fetch staff for superadmin
const getAllStaff = async () => {
  return await prisma.staff.findMany({
    include: {
      role: true,
      branch: true,
      user: true
    },
    orderBy: { id: "desc" }
  });
};

// Fetch staff for branch admin
const getStaffByBranch = async (branchId) => {
  return await prisma.staff.findMany({
    where: { branchId },
    include: {
      role: true,
      branch: true,
      user: true
    },
    orderBy: { id: "desc" }
  });
};

// Create staff
const createStaff = async (data, createdById) => {
  const {
    user,
    branchId,
    roleId,
    staffId,
    gender,
    dob,
    phone,
    profilePhoto,
    status,
    joinDate,
    exitDate,
    salaryType,
    hourlyRate,
    fixedSalary,
    commissionRatePercent,
    loginEnabled,
    username,
    password
  } = data;

  let hashedPassword = null;
  if (password && loginEnabled) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  // Create the user first
  const newUser = await prisma.user.create({
    data: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: hashedPassword || '', // Required field, but will be updated if loginEnabled
      roleId: user.roleId,// Default role, can be updated later if needed
      branchId: Number(branchId),
      loginEnabled: Boolean(loginEnabled),
      username: username || null,
      phone: phone || null,
      gender: gender || null,
      dob: dob ? new Date(dob) : null,
      profilePhoto: profilePhoto || null
    }
  });

  // Now create the staff record
  return await prisma.staff.create({
    data: {
      userId: newUser.id,
      branchId: Number(branchId),
      roleId: Number(roleId),
      staffId,
      gender,
      dob: dob ? new Date(dob) : null,
      phone,
      profilePhoto,
      status: status || "Active",
      joinDate: new Date(joinDate),
      exitDate: exitDate ? new Date(exitDate) : null,
      salaryType,
      hourlyRate: hourlyRate ? Number(hourlyRate) : null,
      fixedSalary: fixedSalary ? Number(fixedSalary) : null,
      commissionRatePercent: Number(commissionRatePercent) || 0,
      loginEnabled: Boolean(loginEnabled),
      username,
      password: hashedPassword,
      createdById: createdById || null
    },
    include: {
      role: true,
      branch: true,
      user: true
    }
  });
};

// Update staff
const updateStaff = async (id, data) => {
  let hashedPassword = null;

  if (data.password && data.loginEnabled) {
    hashedPassword = await bcrypt.hash(data.password, 10);
  }

  // First, get the current staff to find the userId
  const currentStaff = await prisma.staff.findUnique({
    where: { id },
    include: { user: true }
  });

  if (!currentStaff) {
    throw new Error('Staff not found');
  }

  // Update the User table with user-related fields
  if (data.user) {
    await prisma.user.update({
      where: { id: currentStaff.userId },
      data: {
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        email: data.user.email,
        phone: data.user.phone || undefined,
        gender: data.user.gender || undefined,
        dob: data.user.dob ? new Date(data.user.dob) : undefined,
        profilePhoto: data.user.profilePhoto || undefined,
        loginEnabled: data.user.loginEnabled !== undefined ? Boolean(data.user.loginEnabled) : undefined,
        username: data.user.username || undefined,
        password: hashedPassword || undefined
      }
    });
  }

  // Update the Staff table with staff-related fields
  const staffUpdateData = { ...data };
  delete staffUpdateData.user; // Remove user data from staff update
  delete staffUpdateData.password; // Password is handled in user update

  // Convert string values to appropriate types for Prisma
  if (staffUpdateData.roleId !== undefined) staffUpdateData.roleId = Number(staffUpdateData.roleId);
  if (staffUpdateData.branchId !== undefined) staffUpdateData.branchId = Number(staffUpdateData.branchId);
  if (staffUpdateData.fixedSalary !== undefined) staffUpdateData.fixedSalary = staffUpdateData.fixedSalary ? Number(staffUpdateData.fixedSalary) : null;
  if (staffUpdateData.hourlyRate !== undefined) staffUpdateData.hourlyRate = staffUpdateData.hourlyRate ? Number(staffUpdateData.hourlyRate) : null;
  if (staffUpdateData.commissionRatePercent !== undefined) staffUpdateData.commissionRatePercent = Number(staffUpdateData.commissionRatePercent);
  if (staffUpdateData.loginEnabled !== undefined) staffUpdateData.loginEnabled = staffUpdateData.loginEnabled === 'true' || staffUpdateData.loginEnabled === true;

  return await prisma.staff.update({
    where: { id },
    data: {
      ...staffUpdateData,
      dob: data.dob ? new Date(data.dob) : undefined,
      joinDate: data.joinDate ? new Date(data.joinDate) : undefined,
      exitDate: data.exitDate ? new Date(data.exitDate) : undefined
    },
    include: {
      role: true,
      branch: true,
      user: true
    }
  });
};

// Delete staff
const deleteStaff = async (id) => {
  return await prisma.staff.delete({
    where: { id }
  });
};

module.exports = {
  getAllStaff,
  getStaffByBranch,
  createStaff,
  updateStaff,
  deleteStaff
};
