"use strict";

const prisma = require("../config/db");
const responseHandler = require("../utils/responseHandler");

// -------------------------------------------------------
// SAFE PARSERS (never throw / strongly typed)
// -------------------------------------------------------
const toInt = (val) => {
  const num = Number(val);
  return Number.isFinite(num) ? num : null;
};

const toDate = (val) => {
  const parsed = val ? new Date(val) : null;
  return parsed && !isNaN(parsed.valueOf()) ? parsed : null;
};

// -------------------------------------------------------
// GET ALL BOOKINGS
// Branch-restricted + Role-based
// -------------------------------------------------------
const getAllBookings = async (req, res, next) => {
  try {
    const { userRole, userBranchId, isSuperAdmin } = req.accessFilters;
    const filters = {};

    if (!isSuperAdmin) filters.branchId = userBranchId;
    if (userRole === "member") filters.memberId = req.user?.id;

    const sessions = await prisma.personalTrainingSession.findMany({
      where: filters,
      include: {
        trainer: { select: { id: true, firstName: true, lastName: true } },
        member: { select: { id: true, firstName: true, lastName: true, memberId: true } },
        branch: { select: { id: true, name: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return responseHandler.success(res, "Sessions fetched successfully", { sessions });
  } catch (err) {
    return next(err);
  }
};

// -------------------------------------------------------
// GET BOOKING BY ID
// Protects access for member + trainer + branch
// -------------------------------------------------------
const getBookingById = async (req, res, next) => {
  try {
    const id = toInt(req.params.id);
    if (!id) return next(new Error("Invalid booking ID"));

    const { userRole, userBranchId, isSuperAdmin } = req.accessFilters;
    const session = await prisma.personalTrainingSession.findUnique({
      where: { id },
      include: { trainer: true, member: true, branch: true, createdBy: true }
    });

    if (!session) return next(new Error("Booking not found"));
    if (userRole === "member" && session.memberId !== req.user.id)
      return next(new Error("Access denied"));
    if (!isSuperAdmin && session.branchId !== userBranchId)
      return next(new Error("Access denied"));

    return responseHandler.success(res, "Session fetched successfully", { session });
  } catch (err) {
    return next(err);
  }
};

// -------------------------------------------------------
// CREATE BOOKING
// Allowed: Admin, Superadmin, Trainer
// -------------------------------------------------------
const createBooking = async (req, res, next) => {
  try {
    const { userRole, userBranchId, isSuperAdmin } = req.accessFilters;
    const { trainerId, memberId, branchId, date, time, type, notes, location, price, paymentStatus } = req.body;

    // Required fields validation
    if (!trainerId || !memberId || !date || !time)
      return next(new Error("Trainer, member, date & time are required"));

    // Branch resolution based on role
    const finalBranchId = isSuperAdmin ? toInt(branchId) : userBranchId;
    if (!finalBranchId) return next(new Error("Branch ID missing"));

    // Trainer and member validation + must belong to same branch
    const trainer = await prisma.user.findUnique({ where: { id: toInt(trainerId) } });
    if (!trainer || trainer.branchId !== finalBranchId)
      return next(new Error("Trainer does not belong to this branch"));

    const member = await prisma.user.findUnique({ where: { id: toInt(memberId) } });
    if (!member || member.branchId !== finalBranchId)
      return next(new Error("Member does not belong to this branch"));

    // Check if trainer has another booking at same date/time
    const conflict = await prisma.personalTrainingSession.findFirst({
      where: {
        trainerId: toInt(trainerId),
        date: toDate(date),
        time,
        branchId: finalBranchId,
        status: { not: "Cancelled" }
      }
    });

    if (conflict) return next(new Error("Trainer already has a booking at this date & time"));

    // Create booking
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
        createdById: req.user.id
      }
    });

    return responseHandler.success(res, "Session created successfully", { session });
  } catch (err) {
    return next(err);
  }
};

// -------------------------------------------------------
// UPDATE BOOKING
// Allowed: Admin, Superadmin, Trainer
// -------------------------------------------------------
const updateBooking = async (req, res, next) => {
  try {
    const id = toInt(req.params.id);
    if (!id) return next(new Error("Invalid booking ID"));

    const { userRole, userBranchId, isSuperAdmin } = req.accessFilters;
    const existing = await prisma.personalTrainingSession.findUnique({ where: { id } });

    if (!existing) return next(new Error("Booking not found"));
    if (userRole === "personaltrainer" && existing.trainerId !== req.user.id)
      return next(new Error("Access denied"));
    if (!isSuperAdmin && existing.branchId !== userBranchId)
      return next(new Error("Access denied"));

    // Resolve new values or fallback to current
    const newTrainerId = req.body.trainerId ? toInt(req.body.trainerId) : existing.trainerId;
    const newDate = req.body.date ? toDate(req.body.date) : existing.date;
    const newTime = req.body.time || existing.time;

    // Conflict detection
    const conflict = await prisma.personalTrainingSession.findFirst({
      where: {
        trainerId: newTrainerId,
        date: newDate,
        time: newTime,
        branchId: existing.branchId,
        status: { not: "Cancelled" },
        id: { not: id }
      }
    });

    if (conflict) return next(new Error("Trainer already has a booking at this date & time"));

    const updated = await prisma.personalTrainingSession.update({
      where: { id },
      data: req.body
    });

    return responseHandler.success(res, "Session updated successfully", { updated });
  } catch (err) {
    return next(err);
  }
};

// -------------------------------------------------------
// DELETE BOOKING
// Allowed: Admin, Superadmin, Trainer
// -------------------------------------------------------
const deleteBooking = async (req, res, next) => {
  try {
    const id = toInt(req.params.id);
    if (!id) return next(new Error("Invalid booking ID"));

    const { userRole, userBranchId, isSuperAdmin } = req.accessFilters;
    const session = await prisma.personalTrainingSession.findUnique({ where: { id } });

    if (!session) return next(new Error("Booking not found"));
    if (userRole === "personaltrainer" && session.trainerId !== req.user.id)
      return next(new Error("Access denied"));
    if (!isSuperAdmin && session.branchId !== userBranchId)
      return next(new Error("Access denied"));

    await prisma.personalTrainingSession.delete({ where: { id } });
    return responseHandler.success(res, "Session deleted successfully");
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking
};
