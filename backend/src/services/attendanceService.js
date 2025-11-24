const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
  // ----------------------------------------------------
  // 📌 GET ALL ATTENDANCE RECORDS
  // ----------------------------------------------------
  getAttendancesService: async (userBranchId, filters, page, limit, isSuperAdmin) => {
    const offset = (page - 1) * limit;

    // Build where clause
    const where = {
      ...(isSuperAdmin ? {} : { branchId: userBranchId }),
      ...(filters.memberId && { memberId: filters.memberId }),
      ...(filters.status && { status: filters.status }),
      ...(filters.search && {
        OR: [
          { memberName: { contains: filters.search, mode: "insensitive" } },
          { member: { firstName: { contains: filters.search, mode: "insensitive" } } },
          { member: { lastName: { contains: filters.search, mode: "insensitive" } } },
        ],
      }),
    };

    const attendances = await prisma.memberAttendance.findMany({
      where,
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
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
    });

    const total = await prisma.memberAttendance.count({ where });

    return {
      attendances,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  // ----------------------------------------------------
  // 📌 GET SINGLE ATTENDANCE RECORD
  // ----------------------------------------------------
  getAttendanceByIdService: async (id, userBranchId, isSuperAdmin) => {
    const where = {
      id: parseInt(id),
      ...(isSuperAdmin ? {} : { branchId: userBranchId }),
    };

    return await prisma.memberAttendance.findFirst({
      where,
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
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  },

  // ----------------------------------------------------
  // 📌 CREATE ATTENDANCE RECORD
  // ----------------------------------------------------
  createAttendanceService: async (data) => {
    const { memberId, branchId, date, status, checkInTime, checkOutTime, mode, notes } = data;

    // Get member name
    const member = await prisma.user.findUnique({
      where: { id: memberId },
      select: { firstName: true, lastName: true },
    });

    if (!member) {
      throw new Error("Member not found");
    }

    const memberName = `${member.firstName} ${member.lastName}`;

    return await prisma.memberAttendance.create({
      data: {
        memberId,
        branchId,
        memberName,
        date: new Date(date),
        status,
        checkInTime,
        checkOutTime,
        mode,
        notes,
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
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  },

  // ----------------------------------------------------
  // 📌 UPDATE ATTENDANCE RECORD
  // ----------------------------------------------------
  updateAttendanceService: async (id, data, userBranchId, isSuperAdmin) => {
    const where = {
      id: parseInt(id),
      ...(isSuperAdmin ? {} : { branchId: userBranchId }),
    };

    // Check if record exists
    const existing = await prisma.memberAttendance.findFirst({ where });
    if (!existing) {
      throw new Error("Attendance record not found or access denied");
    }

    return await prisma.memberAttendance.update({
      where: { id: parseInt(id) },
      data,
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
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  },

  // ----------------------------------------------------
  // 📌 DELETE ATTENDANCE RECORD
  // ----------------------------------------------------
  deleteAttendanceService: async (id, userBranchId, isSuperAdmin) => {
    const where = {
      id: parseInt(id),
      ...(isSuperAdmin ? {} : { branchId: userBranchId }),
    };

    // Check if record exists
    const existing = await prisma.memberAttendance.findFirst({ where });
    if (!existing) {
      throw new Error("Attendance record not found or access denied");
    }

    await prisma.memberAttendance.delete({
      where: { id: parseInt(id) },
    });
  },

  // ----------------------------------------------------
  // 📌 MARK ATTENDANCE (CHECK-IN/CHECK-OUT)
  // ----------------------------------------------------
  markAttendanceService: async (memberId, action, mode, notes, userBranchId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get member details
    const member = await prisma.user.findUnique({
      where: { id: memberId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        branchId: true,
      },
    });

    if (!member) {
      throw new Error("Member not found");
    }

    // Check branch access
    if (member.branchId !== userBranchId) {
      throw new Error("Access denied: Member belongs to different branch");
    }

    const memberName = `${member.firstName} ${member.lastName}`;

    if (action === "checkin") {
      // Check if already checked in today
      const existingCheckIn = await prisma.memberAttendance.findFirst({
        where: {
          memberId,
          date: today,
        },
      });

      if (existingCheckIn) {
        throw new Error("Member already checked in today");
      }

      // Create check-in record
      return await prisma.memberAttendance.create({
        data: {
          memberId,
          branchId: member.branchId,
          memberName,
          date: today,
          status: "Present",
          checkInTime: new Date().toTimeString().split(" ")[0], // HH:MM:SS format
          mode,
          notes,
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
          branch: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    } else if (action === "checkout") {
      // Find today's check-in record
      const checkInRecord = await prisma.memberAttendance.findFirst({
        where: {
          memberId,
          date: today,
          checkInTime: { not: null },
          checkOutTime: null, // Not checked out yet
        },
      });

      if (!checkInRecord) {
        throw new Error("No active check-in found for today");
      }

      // Update with check-out time
      return await prisma.memberAttendance.update({
        where: { id: checkInRecord.id },
        data: {
          checkOutTime: new Date().toTimeString().split(" ")[0], // HH:MM:SS format
          notes: notes || checkInRecord.notes,
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
          branch: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    } else {
      throw new Error("Invalid action. Use 'checkin' or 'checkout'");
    }
  },
};
