const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ===============================================
// 📌 HELPER: FIX QUERY NUMBER TYPE
// ===============================================
const toNumber = (value) => {
  const num = parseInt(value);
  return isNaN(num) ? null : num;
};

// ===============================================
// 📌 GET ALL ATTENDANCE RECORDS
// ===============================================
const getAttendancesService = async (
  userBranchId,
  filters,
  page,
  limit,
  isSuperAdmin
) => {
  const skip = (page - 1) * limit;

  // Build query filters safely
  const where = {};

  // Branch rule (SuperAdmin can see all)
  if (!isSuperAdmin) {
    where.branchId = userBranchId;
  }

  // Filter by member id
  if (filters.memberId) {
    where.memberId = filters.memberId;
  }

  // Filter by attendance status (Present, Absent, etc.)
  if (filters.status) {
    where.status = filters.status;
  }

  // Search by member name or phone
  if (filters.search) {
    where.OR = [
      { memberName: { contains: filters.search, mode: "insensitive" } },
      {
        member: {
          firstName: { contains: filters.search, mode: "insensitive" },
        },
      },
      {
        member: { lastName: { contains: filters.search, mode: "insensitive" } },
      },
    ];
  }

  const attendances = await prisma.memberAttendance.findMany({
    where: where,
    include: {
      member: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          memberId: true,
        },
      },
      branch: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    skip: skip,
    take: limit,
  });

  const total = await prisma.memberAttendance.count({ where });

  return {
    attendances: attendances,
    pagination: {
      page: page,
      limit: limit,
      total: total,
      pages: Math.ceil(total / limit),
    },
  };
};

// ===============================================
// 📌 GET SINGLE ATTENDANCE RECORD
// ===============================================
const getAttendanceByIdService = async (id, userBranchId, isSuperAdmin) => {
  const where = { id: toNumber(id) };

  // Branch restriction (except SuperAdmin)
  if (!isSuperAdmin) {
    where.branchId = userBranchId;
  }

  return prisma.memberAttendance.findFirst({
    where: where,
    include: {
      member: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          memberId: true,
        },
      },
      branch: { select: { id: true, name: true } },
    },
  });
};

// ===============================================
// 📌 CREATE ATTENDANCE RECORD
// ===============================================
const createAttendanceService = async (data) => {
  const memberId = toNumber(data.memberId);
  const branchId = toNumber(data.branchId);

  // Validate member
  const member = await prisma.user.findUnique({
    where: { id: memberId },
    select: { firstName: true, lastName: true },
  });

  if (!member) {
    throw new Error("Member not found");
  }

  const memberName = member.firstName + " " + member.lastName;

  return prisma.memberAttendance.create({
    data: {
      memberId: memberId,
      branchId: branchId,
      memberName: memberName,
      date: new Date(data.date),
      status: data.status,
      checkInTime: data.checkInTime,
      checkOutTime: data.checkOutTime,
      mode: data.mode,
      notes: data.notes,
    },
    include: {
      member: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          memberId: true,
        },
      },
      branch: { select: { id: true, name: true } },
    },
  });
};

// ===============================================
// 📌 UPDATE ATTENDANCE RECORD
// ===============================================
const updateAttendanceService = async (
  id,
  data,
  userBranchId,
  isSuperAdmin
) => {
  const recId = toNumber(id);

  const where = { id: recId };

  if (!isSuperAdmin) {
    where.branchId = userBranchId;
  }

  const existing = await prisma.memberAttendance.findFirst({ where: where });
  if (!existing) {
    throw new Error("Attendance record not found or access denied");
  }

  return prisma.memberAttendance.update({
    where: { id: recId },
    data: data,
    include: {
      member: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          memberId: true,
        },
      },
      branch: { select: { id: true, name: true } },
    },
  });
};

// ===============================================
// 📌 DELETE ATTENDANCE RECORD
// ===============================================
const deleteAttendanceService = async (id, userBranchId, isSuperAdmin) => {
  const recId = toNumber(id);

  const where = { id: recId };

  if (!isSuperAdmin) {
    where.branchId = userBranchId;
  }

  const existing = await prisma.memberAttendance.findFirst({ where: where });
  if (!existing) {
    throw new Error("Attendance record not found or access denied");
  }

  await prisma.memberAttendance.delete({ where: { id: recId } });
};

// ===============================================
// 📌 MARK ATTENDANCE (CHECK-IN / CHECK-OUT)
// ===============================================
const markAttendanceService = async (
  memberId,
  action,
  mode,
  notes,
  userBranchId
) => {
  memberId = toNumber(memberId);

  // Find today's date (reset time)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Validate member
  const member = await prisma.user.findUnique({
    where: { id: memberId },
    select: { id: true, firstName: true, lastName: true, branchId: true },
  });

  if (!member) {
    throw new Error("Member not found");
  }

  // Branch access rule
  if (member.branchId !== userBranchId) {
    throw new Error("Access denied: Member belongs to different branch");
  }

  const memberName = member.firstName + " " + member.lastName;
  const timeNow = new Date().toTimeString().split(" ")[0]; // HH:MM:SS

  // Checkin
  if (action === "checkin") {
    const exists = await prisma.memberAttendance.findFirst({
      where: { memberId: memberId, date: today },
    });

    if (exists) {
      throw new Error("Member already checked in today");
    }

    return prisma.memberAttendance.create({
      data: {
        memberId: memberId,
        branchId: member.branchId,
        memberName: memberName,
        date: today,
        status: "Present",
        checkInTime: timeNow,
        mode: mode,
        notes: notes,
      },
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            memberId: true,
          },
        },
        branch: { select: { id: true, name: true } },
      },
    });
  }

  // Checkout
  if (action === "checkout") {
    const record = await prisma.memberAttendance.findFirst({
      where: {
        memberId: memberId,
        date: today,
        checkInTime: { not: null },
        checkOutTime: null,
      },
    });

    if (!record) {
      throw new Error("No active check-in found for today");
    }

    return prisma.memberAttendance.update({
      where: { id: record.id },
      data: { checkOutTime: timeNow, notes: notes || record.notes },
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            memberId: true,
          },
        },
        branch: { select: { id: true, name: true } },
      },
    });
  }

  throw new Error("Invalid action. Use 'checkin' or 'checkout'");
};

// ===============================================
// 📌 EXPORTS
// ===============================================
module.exports = {
  getAttendancesService,
  getAttendanceByIdService,
  createAttendanceService,
  updateAttendanceService,
  deleteAttendanceService,
  markAttendanceService,
};
