const prisma = require("../config/db");
const responseHandler = require("../utils/responseHandler");

// ======================================================================
// 🔥 GET ALL BOOKINGS (Branch-based + Role-based Access)
// ======================================================================
exports.getAllBookings = async (req, res, next) => {
  try {
    const { userRole, userBranchId, isSuperAdmin } = req.accessFilters;

    const where = {};

    // 🟦 Branch Access
    if (!isSuperAdmin) {
      where.branchId = userBranchId;
    }

    // Members should ONLY see their own bookings
    if (userRole === "member") {
      where.memberId = req.user.id;
    }

    const sessions = await prisma.personalTrainingSession.findMany({
      where,
      include: {
        trainer: { select: { id: true, firstName: true, lastName: true } },
        member: { select: { id: true, firstName: true, lastName: true, memberId: true } },
        branch: { select: { id: true, name: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    responseHandler.success(res, "Sessions fetched successfully", { sessions });

  } catch (error) {
    console.error("❌ GetAllBookings Error:", error);
    next(error);
  }
};

// ======================================================================
// 🔥 GET BOOKING BY ID (Role protection)
// ======================================================================
exports.getBookingById = async (req, res, next) => {
  try {
    const { userRole, userBranchId, isSuperAdmin } = req.accessFilters;
    const id = parseInt(req.params.id);

    const session = await prisma.personalTrainingSession.findUnique({
      where: { id },
      include: {
        trainer: true,
        member: true,
        branch: true,
        createdBy: true,
      }
    });

    if (!session) return next(new Error("Booking not found"));

    // 🔐 Role: Member can ONLY view their own bookings
    if (userRole === "member" && session.memberId !== req.user.id) {
      return next(new Error("Access denied"));
    }

    // 🔐 Branch Protection
    if (!isSuperAdmin && session.branchId !== userBranchId) {
      return next(new Error("Access denied"));
    }

    responseHandler.success(res, "Session fetched successfully", { session });

  } catch (error) {
    console.error("❌ GetBookingById Error:", error);
    next(error);
  }
};

// ======================================================================
// 🔥 CREATE BOOKING (Admin, Superadmin, Trainer)
// ======================================================================
exports.createBooking = async (req, res, next) => {
  try {
    const { userRole, userBranchId, isSuperAdmin } = req.accessFilters;

    const {
      trainerId,
      memberId,
      branchId,
      date,
      time,
      type,
      notes,
      location,
      price,
      paymentStatus,
    } = req.body;

    // 🟦 Validate Required Fields
    if (!trainerId || !memberId || !date || !time) {
      return next(new Error("Trainer, member, date & time are required"));
    }

    // 🟦 Branch logic
    const finalBranchId = isSuperAdmin ? parseInt(branchId) : userBranchId;
    if (!finalBranchId) return next(new Error("Branch ID missing"));

    // 🟦 Validate Trainer
    const trainer = await prisma.user.findUnique({ where: { id: parseInt(trainerId) } });
    if (!trainer || trainer.branchId !== finalBranchId)
      return next(new Error("Trainer does not belong to this branch"));

    // 🟦 Validate Member
    const member = await prisma.user.findUnique({ where: { id: parseInt(memberId) } });
    if (!member || member.branchId !== finalBranchId)
      return next(new Error("Member does not belong to this branch"));

    // 🔥 Create booking
    const session = await prisma.personalTrainingSession.create({
      data: {
        trainerId: parseInt(trainerId),
        memberId: parseInt(memberId),
        branchId: finalBranchId,
        date: new Date(date),
        time,
        type: type || "Personal Training",
        notes: notes || "",
        location: location || "Gym Floor",
        price: price ? parseInt(price) : 0,
        paymentStatus: paymentStatus || "Paid",
        status: "Booked",
        createdById: req.user.id,
      }
    });

    responseHandler.success(res, "Session created successfully", { session });

  } catch (error) {
    console.error("❌ CreateBooking Error:", error);
    next(error);
  }
};

// ======================================================================
// 🔥 UPDATE BOOKING (Admin, Superadmin, Trainer)
// ======================================================================
exports.updateBooking = async (req, res, next) => {
  try {
    const { userRole, userBranchId, isSuperAdmin } = req.accessFilters;
    const id = parseInt(req.params.id);

    const session = await prisma.personalTrainingSession.findUnique({ where: { id } });
    if (!session) return next(new Error("Booking not found"));

    // 🔐 Trainers can only edit their own sessions
    if (userRole === "personaltrainer" && session.trainerId !== req.user.id) {
      return next(new Error("Access denied"));
    }

    // 🔐 Branch access
    if (!isSuperAdmin && session.branchId !== userBranchId) {
      return next(new Error("Access denied"));
    }

    const updated = await prisma.personalTrainingSession.update({
      where: { id },
      data: req.body,
    });

    responseHandler.success(res, "Session updated successfully", { updated });

  } catch (error) {
    console.error("❌ UpdateBooking Error:", error);
    next(error);
  }
};

// ======================================================================
// 🔥 DELETE BOOKING (Admin, Superadmin, Trainer)
// ======================================================================
exports.deleteBooking = async (req, res, next) => {
  try {
    const { userRole, userBranchId, isSuperAdmin } = req.accessFilters;
    const id = parseInt(req.params.id);

    const session = await prisma.personalTrainingSession.findUnique({ where: { id } });
    if (!session) return next(new Error("Booking not found"));

    // 🟦 Trainers can only delete their own bookings
    if (userRole === "personaltrainer" && session.trainerId !== req.user.id) {
      return next(new Error("Access denied"));
    }

    // 🟦 Branch protection
    if (!isSuperAdmin && session.branchId !== userBranchId) {
      return next(new Error("Access denied"));
    }

    await prisma.personalTrainingSession.delete({ where: { id } });

    responseHandler.success(res, "Session deleted successfully");

  } catch (error) {
    console.error("❌ DeleteBooking Error:", error);
    next(error);
  }
};
