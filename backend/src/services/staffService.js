const prisma = require("../config/db");
const bcrypt = require("bcrypt");

// ==============================
// 📌 Helper: Safe Number Convert
// ==============================
const toNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const num = parseInt(value, 10);
  return Number.isNaN(num) ? null : num;
};

// ==============================
// 📌 Helper: Parse user if JSON string
// ==============================
const ensureUserObject = (data) => {
  if (!data.user) return;

  if (typeof data.user === "string") {
    try {
      data.user = JSON.parse(data.user);
    } catch (err) {
      throw new Error("Invalid user JSON format");
    }
  }
};

// ==============================
// 📌 Helper: Normalize login fields
//  - returns boolean loginEnabled
//  - if false => force username/password null
// ==============================
const normalizeLoginFields = (data) => {
  const rawLoginEnabled =
    data.loginEnabled ??
    (data.user && data.user.loginEnabled);

  const loginEnabled =
    rawLoginEnabled === true ||
    rawLoginEnabled === "true" ||
    rawLoginEnabled === 1 ||
    rawLoginEnabled === "1";

  if (!loginEnabled) {
    // Force login disabled & credentials null
    data.loginEnabled = false;
    data.username = null;
    data.password = null;

    if (data.user) {
      data.user.loginEnabled = false;
      data.user.username = null;
    }
  } else {
    // Normalize to boolean true
    data.loginEnabled = true;
    if (data.user) data.user.loginEnabled = true;
  }

  return loginEnabled;
};

// ==============================
// 📌 Helper: Normalize optional fields
// ==============================
const normalizeOptionalFields = (data) => {
  const safeNull = (val) =>
    val === "" || val === undefined ? null : val;

  data.staffId = safeNull(data.staffId);
  data.phone = safeNull(data.phone);
  data.gender = safeNull(data.gender);
  data.profilePhoto = safeNull(data.profilePhoto);
  data.salaryType = safeNull(data.salaryType);
  data.fixedSalary = safeNull(data.fixedSalary);
  data.hourlyRate = safeNull(data.hourlyRate);
  data.commissionRatePercent = safeNull(data.commissionRatePercent);
  data.status = safeNull(data.status) || "Active";
  data.joinDate = data.joinDate || new Date().toISOString().split("T")[0];
  data.exitDate = safeNull(data.exitDate);
};

// ==============================
// 📌 GET ALL STAFF (SuperAdmin)
// ==============================
const getAllStaff = async () => {
  return prisma.staff.findMany({
    include: { role: true, branch: true, user: true },
    orderBy: { id: "desc" },
  });
};

// ==============================
// 📌 GET STAFF BY BRANCH (Admin)
// ==============================
const getStaffByBranch = async (branchId) => {
  return prisma.staff.findMany({
    where: { branchId: toNumber(branchId) },
    include: { role: true, branch: true, user: true },
    orderBy: { id: "desc" },
  });
};

// ==============================
// 📌 CREATE STAFF
// ==============================
const createStaff = async (data, createdById) => {
  // In case coming from FormData
  ensureUserObject(data);

  const branchId = toNumber(data.branchId);
  const roleId = toNumber(data.roleId);

  // Validate required Staff > User fields
  if (!data.user || !data.user.firstName || !data.user.lastName || !data.user.email) {
    throw new Error("Staff user details (firstName, lastName, email) are required");
  }
  if (!branchId) throw new Error("Branch is required");
  if (!roleId) throw new Error("Role is required");

  // Normalize login + optional fields (avoid field missing)
  const loginEnabled = normalizeLoginFields(data);
  normalizeOptionalFields(data);

  // Derive dob/phone/gender with fallback to user-level if present
  const dobValue = data.dob || (data.user && data.user.dob) || null;
  const genderValue = data.gender || (data.user && data.user.gender) || null;
  const phoneValue = data.phone || (data.user && data.user.phone) || null;

  // Check duplicate email or phone
  const duplicateUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: data.user.email },
        { phone: phoneValue },
      ],
    },
  });
  if (duplicateUser) {
    throw new Error("User already exists with same email or phone");
  }

  // Handle password & hashing
  let hashedPassword = null;
  if (loginEnabled) {
    if (data.password) {
      hashedPassword = await bcrypt.hash(data.password, 10);
    } else {
      throw new Error("Password is required when login is enabled");
    }
  } else {
    // For disabled login, use a dummy hashed password to satisfy User model requirement
    hashedPassword = await bcrypt.hash("dummy123", 10);
  }

  // Create User first
  const newUser = await prisma.user.create({
    data: {
      firstName: data.user.firstName,
      lastName: data.user.lastName,
      email: data.user.email,
      password: hashedPassword,
      roleId: data.user.roleId ? toNumber(data.user.roleId) : roleId,
      branchId: branchId,
      loginEnabled: loginEnabled,
      username: data.username,
      phone: phoneValue,
      gender: genderValue,
      dob: dobValue ? new Date(dobValue) : null,
      profilePhoto: data.profilePhoto,
    },
  });

  // Create Staff record linked to user
  return prisma.staff.create({
    data: {
      userId: newUser.id,
      branchId: branchId,
      roleId: roleId,
      staffId: data.staffId,
      gender: genderValue,
      dob: dobValue ? new Date(dobValue) : null,
      phone: phoneValue,
      profilePhoto: data.profilePhoto,
      status: data.status,
      joinDate: data.joinDate ? new Date(data.joinDate) : new Date(),
      exitDate: data.exitDate ? new Date(data.exitDate) : null,
      salaryType: data.salaryType,
      hourlyRate: data.hourlyRate ? toNumber(data.hourlyRate) : null,
      fixedSalary: data.fixedSalary ? toNumber(data.fixedSalary) : null,
      commissionRatePercent: data.commissionRatePercent
        ? toNumber(data.commissionRatePercent)
        : 0,
      loginEnabled: loginEnabled,
      username: data.username,
      password: hashedPassword,
      createdById: createdById || null,
    },
    include: { role: true, branch: true, user: true },
  });
};

// ==============================
// 📌 UPDATE STAFF
// ==============================
const updateStaff = async (id, data) => {
  // In case coming from FormData
  ensureUserObject(data);

  const staffId = toNumber(id);

  // Get existing staff + related user
  const currentStaff = await prisma.staff.findUnique({
    where: { id: staffId },
    include: { user: true },
  });

  if (!currentStaff) {
    throw new Error("Staff not found");
  }

  // Normalize login + optional fields
  const loginEnabled = normalizeLoginFields(data);
  normalizeOptionalFields(data);

  // Derive dob/phone/gender with fallback to user-level if present
  const dobValue = data.dob || (data.user && data.user.dob) || null;
  const genderValue = data.gender || (data.user && data.user.gender) || null;
  const phoneValue = data.phone || (data.user && data.user.phone) || null;

  // Handle password update
  let hashedPassword = null;
  if (loginEnabled) {
    if (data.password) {
      hashedPassword = await bcrypt.hash(data.password, 10);
    }
  } else {
    // For disabled login, use a dummy hashed password to satisfy User model requirement
    hashedPassword = await bcrypt.hash("dummy123", 10);
  }

  // ============================
  // ✨ UPDATE USER TABLE FIRST
  // ============================
  if (data.user) {
    await prisma.user.update({
      where: { id: currentStaff.userId },
      data: {
        firstName: data.user.firstName ?? currentStaff.user.firstName,
        lastName: data.user.lastName ?? currentStaff.user.lastName,
        email: data.user.email ?? currentStaff.user.email,
        phone: phoneValue ?? currentStaff.user.phone,
        gender: genderValue ?? currentStaff.user.gender,
        dob: dobValue ? new Date(dobValue) : currentStaff.user.dob,
        profilePhoto: data.profilePhoto ?? currentStaff.user.profilePhoto,
        loginEnabled: loginEnabled,
        username: data.username !== undefined ? data.username : currentStaff.user.username,
        password: hashedPassword,
      },
    });
  }

  // ============================
  // ✨ UPDATE STAFF TABLE
  // ============================
  const staffUpdateData = {
    branchId: data.branchId !== undefined ? toNumber(data.branchId) : undefined,
    roleId: data.roleId !== undefined ? toNumber(data.roleId) : undefined,
    staffId: data.staffId !== undefined ? data.staffId : undefined,
    gender: genderValue !== undefined ? genderValue : undefined,
    dob: dobValue ? new Date(dobValue) : undefined,
    phone: phoneValue !== undefined ? phoneValue : undefined,
    profilePhoto: data.profilePhoto !== undefined ? data.profilePhoto : undefined,
    status: data.status !== undefined ? data.status : undefined,
    joinDate: data.joinDate ? new Date(data.joinDate) : undefined,
    exitDate: data.exitDate ? new Date(data.exitDate) : undefined,
    salaryType: data.salaryType !== undefined ? data.salaryType : undefined,
    hourlyRate:
      data.hourlyRate !== undefined
        ? data.hourlyRate
          ? toNumber(data.hourlyRate)
          : null
        : undefined,
    fixedSalary:
      data.fixedSalary !== undefined
        ? data.fixedSalary
          ? toNumber(data.fixedSalary)
          : null
        : undefined,
    commissionRatePercent:
      data.commissionRatePercent !== undefined
        ? toNumber(data.commissionRatePercent)
        : undefined,
    loginEnabled: loginEnabled,
    username: data.username !== undefined ? data.username : undefined,
    password:
      hashedPassword !== null
        ? hashedPassword
        : !loginEnabled
        ? null
        : undefined,
  };

  return prisma.staff.update({
    where: { id: staffId },
    data: staffUpdateData,
    include: { role: true, branch: true, user: true },
  });
};

// ==============================
// 📌 DELETE STAFF
// ==============================
const deleteStaff = async (id) => {
  return prisma.staff.delete({ where: { id: toNumber(id) } });
};

// ==============================
// 📌 EXPORTS
// ==============================
module.exports = {
  getAllStaff,
  getStaffByBranch,
  createStaff,
  updateStaff,
  deleteStaff,
};
