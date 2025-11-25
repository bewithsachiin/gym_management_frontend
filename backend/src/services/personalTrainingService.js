"use strict";

const prisma = require("../prismaClient");
const responseHandler = require("../utils/responseHandler");

// -----------------------------------------------------
// SAFE TYPE HELPERS (runtime validated + reusable)
// -----------------------------------------------------
const toInt = (val) => {
  const num = Number(val);
  return Number.isFinite(num) ? num : null;
};

const toDate = (val) => {
  if (!val) return null;
  const parsed = new Date(val);
  return !isNaN(parsed.valueOf()) ? parsed : null;
};

// ==============================================================
// GET ALL BOOKINGS (Branch restricted + Role restricted)
// ==============================================================
exports.getAllBookings = async (req, res, next) => {
  try {
    const { userRole, userBranchId, isSuperAdmin } = req.accessFilters;
    const filters = {};

    if (!isSuperAdmin) filters.branchId = userBranchId;
    if (userRole === "member") filters.memberId = req.user.id;

    const sessions = await prisma.personalTrainingSession.findMany({
      where: filters,
      include: {
        trainer: { select: { id: true, firstName: true, lastName: true } },
        member: {
          select: { id: true, firstName: true, lastName: true, memberId: true },
        },
        branch: { select: { id: true, name: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return responseHandler.success(res, "Sessions fetched successfully", {
      sessions,
    });
  } catch (error) {
    return next(error);
  }
};

// ==============================================================
// GET BOOKING BY ID (Branch + Member + Trainer Protection)
// ==============================================================
exports.getBookingById = async (req, res, next) => {
  try {
    const id = toInt(req.params.id);
    if (!id) return next(new Error("Invalid booking ID"));

    const { userRole, userBranchId, isSuperAdmin } = req.accessFilters;

    const session = await prisma.personalTrainingSession.findUnique({
      where: { id },
      include: { trainer: true, member: true, branch: true, createdBy: true },
    });

    if (!session) return next(new Error("Booking not found"));
    if (userRole === "member" && session.memberId !== req.user.id)
      return next(new Error("Access denied"));
    if (!isSuperAdmin && session.branchId !== userBranchId)
      return next(new Error("Access denied"));

    return responseHandler.success(res, "Session fetched successfully", {
      session,
    });
  } catch (error) {
    return next(error);
  }
};

// ==============================================================
// CREATE BOOKING (Allowed: Admin, Superadmin, Trainer)
// ==============================================================
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

    if (!trainerId || !memberId || !date || !time)
      return next(new Error("Trainer, member, date & time are required"));

    const finalBranchId = isSuperAdmin ? toInt(branchId) : userBranchId;
    if (!finalBranchId) return next(new Error("Branch ID missing"));

    const trainer = await prisma.user.findUnique({
      where: { id: toInt(trainerId) },
    });
    if (!trainer || trainer.branchId !== finalBranchId)
      return next(new Error("Trainer does not belong to this branch"));

    const member = await prisma.user.findUnique({
      where: { id: toInt(memberId) },
    });
    if (!member || member.branchId !== finalBranchId)
      return next(new Error("Member does not belong to this branch"));

    const session = await prisma.personalTrainingSession.create({
      data: {
        trainerId: toInt(trainerId),
        memberId: toInt(memberId),
        branchId: finalBranchId,
        date: toDate(date),
        time,
        type: type || "Personal Training",
        notes: notes || "",
        location: location || "Gym Floor",
        price: price ? toInt(price) : 0,
        paymentStatus: paymentStatus || "Paid",
        status: "Booked",
        createdById: req.user.id,
      },
    });

    return responseHandler.success(res, "Session created successfully", {
      session,
    });
  } catch (error) {
    return next(error);
  }
};

// ==============================================================
// UPDATE BOOKING (Allowed: Admin, Superadmin, Trainer)
// ==============================================================
exports.updateBooking = async (req, res, next) => {
  try {
    const id = toInt(req.params.id);
    if (!id) return next(new Error("Invalid booking ID"));

    const { userRole, userBranchId, isSuperAdmin } = req.accessFilters;
    const existing = await prisma.personalTrainingSession.findUnique({
      where: { id },
    });

    if (!existing) return next(new Error("Booking not found"));
    if (userRole === "personaltrainer" && existing.trainerId !== req.user.id)
      return next(new Error("Access denied"));
    if (!isSuperAdmin && existing.branchId !== userBranchId)
      return next(new Error("Access denied"));

    const updated = await prisma.personalTrainingSession.update({
      where: { id },
      data: req.body,
    });

    return responseHandler.success(res, "Session updated successfully", {
      updated,
    });
  } catch (error) {
    return next(error);
  }
};

// ==============================================================
// DELETE BOOKING (Allowed: Admin, Superadmin, Trainer)
// ==============================================================
exports.deleteBooking = async (req, res, next) => {
  try {
    const id = toInt(req.params.id);
    if (!id) return next(new Error("Invalid booking ID"));

    const { userRole, userBranchId, isSuperAdmin } = req.accessFilters;

    const session = await prisma.personalTrainingSession.findUnique({
      where: { id },
    });
    if (!session) return next(new Error("Booking not found"));
    if (userRole === "personaltrainer" && session.trainerId !== req.user.id)
      return next(new Error("Access denied"));
    if (!isSuperAdmin && session.branchId !== userBranchId)
      return next(new Error("Access denied"));

    await prisma.personalTrainingSession.delete({ where: { id } });

    return responseHandler.success(res, "Session deleted successfully");
  } catch (error) {
    return next(error);
  }
};
