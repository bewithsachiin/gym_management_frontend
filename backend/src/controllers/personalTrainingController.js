const prisma = require("../config/db");
const responseHandler = require("../utils/responseHandler");

// ======================================================================
// 🔥 GET ALL BOOKINGS (Branch-based + Role-based Access)
// ======================================================================
exports.getAllBookings = async (req, res, next) => {
  console.log("\n======================== PT: getAllBookings ========================");
  console.log("👤 User:", req.user);
  console.log("🔐 accessFilters:", req.accessFilters);
  console.log("🔎 Query:", req.query);

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

    console.log("📌 Final WHERE for getAllBookings:", where);

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

    console.log(`✅ PT:getAllBookings → fetched ${sessions.length} sessions`);

    responseHandler.success(res, "Sessions fetched successfully", { sessions });

  } catch (error) {
    console.error("❌ PT:getAllBookings Error:", error);
    next(error);
  }
};

// ======================================================================
// 🔥 GET BOOKING BY ID (Role protection)
// ======================================================================
exports.getBookingById = async (req, res, next) => {
  console.log("\n======================== PT: getBookingById ========================");
  console.log("👤 User:", req.user);
  console.log("🔐 accessFilters:", req.accessFilters);
  console.log("📎 Params:", req.params);

  try {
    const { userRole, userBranchId, isSuperAdmin } = req.accessFilters;
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      console.warn("⚠️ PT:getBookingById → Invalid ID:", req.params.id);
      return next(new Error("Invalid booking ID"));
    }

    const session = await prisma.personalTrainingSession.findUnique({
      where: { id },
      include: {
        trainer: true,
        member: true,
        branch: true,
        createdBy: true,
      }
    });

    console.log("📌 Fetched Session:", session ? { id: session.id, trainerId: session.trainerId, memberId: session.memberId, branchId: session.branchId } : null);

    if (!session) return next(new Error("Booking not found"));

    // 🔐 Member: Only view their own bookings
    if (userRole === "member" && session.memberId !== req.user.id) {
      console.warn("⛔ PT:getBookingById → Member tried to access another member's booking");
      return next(new Error("Access denied"));
    }

    // 🔐 Branch Protection
    if (!isSuperAdmin && session.branchId !== userBranchId) {
      console.warn("⛔ PT:getBookingById → Cross-branch access blocked");
      return next(new Error("Access denied"));
    }

    responseHandler.success(res, "Session fetched successfully", { session });

  } catch (error) {
    console.error("❌ PT:getBookingById Error:", error);
    next(error);
  }
};

// ======================================================================
// 🔥 CREATE BOOKING (Admin, Superadmin, Trainer)
// ======================================================================
exports.createBooking = async (req, res, next) => {
  console.log("\n======================== PT: createBooking ========================");
  console.log("👤 User:", req.user);
  console.log("🔐 accessFilters:", req.accessFilters);
  console.log("📦 Body:", req.body);

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
      console.warn("⚠️ PT:createBooking → Missing required fields");
      return next(new Error("Trainer, member, date & time are required"));
    }

    // 🟦 Final Branch Logic
    const finalBranchId = isSuperAdmin ? parseInt(branchId) : userBranchId;
    console.log("🏢 finalBranchId:", finalBranchId);

    if (!finalBranchId) {
      console.warn("⚠️ PT:createBooking → finalBranchId missing");
      return next(new Error("Branch ID missing"));
    }

    // 🟦 Validate Trainer
    const trainer = await prisma.user.findUnique({ where: { id: parseInt(trainerId) } });
    console.log("👨‍🏫 Trainer Lookup:", trainer ? { id: trainer.id, branchId: trainer.branchId } : null);

    if (!trainer || trainer.branchId !== finalBranchId) {
      console.warn("⛔ PT:createBooking → Trainer not in branch");
      return next(new Error("Trainer does not belong to this branch"));
    }

    // 🟦 Validate Member
    const member = await prisma.user.findUnique({ where: { id: parseInt(memberId) } });
    console.log("🧍 Member Lookup:", member ? { id: member.id, branchId: member.branchId } : null);

    if (!member || member.branchId !== finalBranchId) {
      console.warn("⛔ PT:createBooking → Member not in branch");
      return next(new Error("Member does not belong to this branch"));
    }

    // 🟥 Trainer session conflict check
    console.log("🔄 Checking trainer conflict for:", {
      trainerId: Number(trainerId),
      date,
      time,
      finalBranchId,
    });

    const conflict = await prisma.personalTrainingSession.findFirst({
      where: {
        trainerId: Number(trainerId),
        date: new Date(date),
        time,
        branchId: finalBranchId,
        status: { not: "Cancelled" }
      }
    });

    if (conflict) {
      console.warn("⛔ PT:createBooking → Trainer conflict found:", {
        conflictId: conflict.id,
        date: conflict.date,
        time: conflict.time
      });
      return next(new Error("Trainer already has a booking at this date & time"));
    }

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

    console.log("✅ PT:createBooking → Created session:", {
      id: session.id,
      trainerId: session.trainerId,
      memberId: session.memberId,
      branchId: session.branchId,
      date: session.date,
      time: session.time
    });

    responseHandler.success(res, "Session created successfully", { session });

  } catch (error) {
    console.error("❌ PT:createBooking Error:", error);
    next(error);
  }
};

// ======================================================================
// 🔥 UPDATE BOOKING (Admin, Superadmin, Trainer)
// ======================================================================
exports.updateBooking = async (req, res, next) => {
  console.log("\n======================== PT: updateBooking ========================");
  console.log("👤 User:", req.user);
  console.log("🔐 accessFilters:", req.accessFilters);
  console.log("📎 Params:", req.params);
  console.log("📦 Body:", req.body);

  try {
    const { userRole, userBranchId, isSuperAdmin } = req.accessFilters;
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      console.warn("⚠️ PT:updateBooking → Invalid ID:", req.params.id);
      return next(new Error("Invalid booking ID"));
    }

    const session = await prisma.personalTrainingSession.findUnique({ where: { id } });

    console.log("📌 Existing Session Before Update:", session ? {
      id: session.id,
      trainerId: session.trainerId,
      memberId: session.memberId,
      branchId: session.branchId,
      date: session.date,
      time: session.time
    } : null);

    if (!session) return next(new Error("Booking not found"));

    // 🔐 Trainers can only edit their own sessions
    if (userRole === "personaltrainer" && session.trainerId !== req.user.id) {
      console.warn("⛔ PT:updateBooking → Trainer tried to edit someone else's session");
      return next(new Error("Access denied"));
    }

    // 🔐 Branch access
    if (!isSuperAdmin && session.branchId !== userBranchId) {
      console.warn("⛔ PT:updateBooking → Cross-branch edit blocked");
      return next(new Error("Access denied"));
    }

    // 🟥 Trainer conflict check on update
    const finalTrainerId = req.body.trainerId ? Number(req.body.trainerId) : session.trainerId;
    const finalDate = req.body.date ? new Date(req.body.date) : session.date;
    const finalTime = req.body.time ? req.body.time : session.time;

    console.log("🔄 Checking trainer conflict on UPDATE:", {
      trainerId: finalTrainerId,
      date: finalDate,
      time: finalTime,
      branchId: session.branchId,
      currentSessionId: id
    });

    const conflictUpdate = await prisma.personalTrainingSession.findFirst({
      where: {
        trainerId: finalTrainerId,
        date: finalDate,
        time: finalTime,
        branchId: session.branchId,
        status: { not: "Cancelled" },
        id: { not: id }
      }
    });

    if (conflictUpdate) {
      console.warn("⛔ PT:updateBooking → Trainer conflict found:", {
        conflictId: conflictUpdate.id,
        date: conflictUpdate.date,
        time: conflictUpdate.time
      });
      return next(new Error("Trainer already has a booking at this date & time"));
    }

    const updated = await prisma.personalTrainingSession.update({
      where: { id },
      data: req.body,
    });

    console.log("✅ PT:updateBooking → Updated session:", {
      id: updated.id,
      trainerId: updated.trainerId,
      memberId: updated.memberId,
      branchId: updated.branchId,
      date: updated.date,
      time: updated.time
    });

    responseHandler.success(res, "Session updated successfully", { updated });

  } catch (error) {
    console.error("❌ PT:updateBooking Error:", error);
    next(error);
  }
};

// ======================================================================
// 🔥 DELETE BOOKING (Admin, Superadmin, Trainer)
// ======================================================================
exports.deleteBooking = async (req, res, next) => {
  console.log("\n======================== PT: deleteBooking ========================");
  console.log("👤 User:", req.user);
  console.log("🔐 accessFilters:", req.accessFilters);
  console.log("📎 Params:", req.params);

  try {
    const { userRole, userBranchId, isSuperAdmin } = req.accessFilters;
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      console.warn("⚠️ PT:deleteBooking → Invalid ID:", req.params.id);
      return next(new Error("Invalid booking ID"));
    }

    const session = await prisma.personalTrainingSession.findUnique({ where: { id } });

    console.log("📌 Session to Delete:", session ? {
      id: session.id,
      trainerId: session.trainerId,
      memberId: session.memberId,
      branchId: session.branchId,
      date: session.date,
      time: session.time
    } : null);

    if (!session) return next(new Error("Booking not found"));

    // 🟦 Trainers can only delete their own bookings
    if (userRole === "personaltrainer" && session.trainerId !== req.user.id) {
      console.warn("⛔ PT:deleteBooking → Trainer tried to delete someone else's session");
      return next(new Error("Access denied"));
    }

    // 🟦 Branch protection
    if (!isSuperAdmin && session.branchId !== userBranchId) {
      console.warn("⛔ PT:deleteBooking → Cross-branch delete blocked");
      return next(new Error("Access denied"));
    }

    await prisma.personalTrainingSession.delete({ where: { id } });

    console.log("✅ PT:deleteBooking → Deleted session ID:", id);

    responseHandler.success(res, "Session deleted successfully");

  } catch (error) {
    console.error("❌ PT:deleteBooking Error:", error);
    next(error);
  }
};
