"use strict";

const { PrismaClient } = require("@prisma/client");
const logger = require("../utils/logger");

const prisma = new PrismaClient();

/* =====================================================================
    HELPER UTILITIES
===================================================================== */

const toInt = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
};

const toDate = (value) => {
  try {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
};

const normalizeScheduleDay = (value) => {
  if (!value) return "";
  return Array.isArray(value) ? value.join(",") : String(value);
};

const toArray = (value) =>
  typeof value === "string"
    ? value.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

/* =====================================================================
    CLASS QUERIES
===================================================================== */

// GET ALL CLASSES
exports.getAllClasses = async (filters = {}) => {
  logger.info("getAllClasses called", filters);

  try {
    const where = {};

    const branch = toInt(filters?.branchId);
    if (branch) where.branchId = branch;

    const trainer = toInt(filters?.trainerId);
    if (trainer) where.trainerId = trainer;

    if (filters?.status) where.status = filters.status;

    const rows = await prisma.classSchedule.findMany({
      where,
      include: {
        trainer: { select: { id: true, firstName: true, lastName: true, role: true } },
        branch: { select: { id: true, name: true } },
        admin: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return rows.map((cls) => ({
      id: cls.id,
      className: cls.className,
      trainerId: cls.trainerId,
      date: cls.date,
      time: cls.time,
      scheduleDays: toArray(cls.scheduleDay),
      totalSeats: cls.totalSheets,
      bookedSeats: cls.bookedSeats,
      roomName: cls.roomName,
      branchId: cls.branchId,
      status: cls.status,
      createdAt: cls.createdAt,
      updatedAt: cls.updatedAt,
      trainer: cls.trainer,
      branch: cls.branch,
      admin: cls.admin,
    }));
  } catch (err) {
    logger.error("getAllClasses error", err);
    throw err;
  }
};

/* =====================================================================
    GET DAILY CLASSES
===================================================================== */

exports.getDailyClasses = async (role, trainerId, branchId) => {
  logger.info("getDailyClasses called", { role, trainerId, branchId });

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const where = {
      date: today,
      branchId: toInt(branchId),
      status: { not: "Canceled" },
    };

    if (["generaltrainer", "personaltrainer"].includes(role)) {
      where.trainerId = toInt(trainerId);
    }

    const rows = await prisma.classSchedule.findMany({
      where,
      include: {
        trainer: { select: { id: true, firstName: true, lastName: true, role: true } },
        branch: { select: { id: true, name: true } },
        admin: { select: { id: true, firstName: true, lastName: true } },
        members: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { time: "asc" },
    });

    return rows.map((cls) => ({
      id: cls.id,
      className: cls.className,
      startTime: cls.time?.split("-")[0] || cls.time,
      endTime: cls.time?.split("-")[1] || cls.time,
      trainerId: cls.trainerId,
      roomName: cls.roomName ?? "--",
      totalSeats: cls.totalSheets,
      bookedSeats: cls.bookedSeats,
      status: cls.status,
      trainer: cls.trainer,
      branch: cls.branch,
      members: cls.members,
    }));
  } catch (err) {
    logger.error("getDailyClasses error", err);
    throw err;
  }
};

/* =====================================================================
    GET CLASS BY ID
===================================================================== */

exports.getClassById = async (id, branchId = null) => {
  logger.info("getClassById", { id, branchId });

  try {
    const where = { id: toInt(id) };
    if (branchId) where.branchId = toInt(branchId);

    const cls = await prisma.classSchedule.findFirst({
      where,
      include: {
        trainer: true,
        branch: true,
        admin: true,
      },
    });

    return cls ? { ...cls, scheduleDays: toArray(cls.scheduleDay) } : null;
  } catch (err) {
    logger.error("getClassById error", err);
    throw err;
  }
};

/* =====================================================================
    CREATE CLASS
===================================================================== */

exports.createClass = async (data, userId) => {
  logger.info("createClass called", data);

  try {
    const dateObj = toDate(data.date);
    if (!dateObj) throw new Error("Invalid date provided");

    const trainer = toInt(data.trainer_id);
    const branch = toInt(data.branchId);

    // Validate trainer availability
    const conflict = await prisma.classSchedule.findFirst({
      where: {
        trainerId: trainer,
        date: dateObj,
        time: data.time,
        branchId: branch,
        status: { not: "Canceled" },
      },
    });

    if (conflict) throw new Error("Trainer is already scheduled at this time");

    const created = await prisma.classSchedule.create({
      data: {
        className: data.class_name,
        trainerId: trainer,
        date: dateObj,
        time: data.time,
        scheduleDay: normalizeScheduleDay(data.schedule_day),
        totalSheets: Number(data.total_sheets) || 20,
        status: data.status || "Scheduled",
        branchId: branch,
        adminId: toInt(userId),
      },
      include: { trainer: true, branch: true, admin: true },
    });

    return { ...created, scheduleDays: toArray(created.scheduleDay) };
  } catch (err) {
    logger.error("createClass error", err);
    throw err;
  }
};

/* =====================================================================
    UPDATE CLASS
===================================================================== */

exports.updateClass = async (id, data, userId, branchId = null) => {
  logger.info("updateClass called", { id, data });

  try {
    const classId = toInt(id);

    const existing = await prisma.classSchedule.findFirst({
      where: { id: classId, ...(branchId && { branchId: toInt(branchId) }) },
    });

    if (!existing) throw new Error("Class not found");

    const newTrainer = data.trainer_id ? toInt(data.trainer_id) : existing.trainerId;
    const newDate = data.date ? toDate(data.date) : existing.date;
    if (!newDate) throw new Error("Invalid date");
    const newTime = data.time || existing.time;

    const conflict = await prisma.classSchedule.findFirst({
      where: {
        trainerId: newTrainer,
        date: newDate,
        time: newTime,
        branchId: existing.branchId,
        status: { not: "Canceled" },
        id: { not: classId },
      },
    });

    if (conflict) throw new Error("Trainer is already scheduled at this time");

    const updated = await prisma.classSchedule.update({
      where: { id: classId },
      data: {
        className: data.class_name ?? existing.className,
        trainerId: newTrainer,
        date: newDate,
        time: newTime,
        scheduleDay: data.schedule_day ? normalizeScheduleDay(data.schedule_day) : undefined,
        totalSheets: data.total_sheets ? Number(data.total_sheets) : undefined,
        status: data.status,
      },
      include: { trainer: true, branch: true, admin: true },
    });

    return { ...updated, scheduleDays: toArray(updated.scheduleDay) };
  } catch (err) {
    logger.error("updateClass error", err);
    throw err;
  }
};

/* =====================================================================
    DELETE CLASS
===================================================================== */

exports.deleteClass = async (id, userId, branchId = null) => {
  logger.info("deleteClass called", { id });

  try {
    const existing = await prisma.classSchedule.findFirst({
      where: { id: toInt(id), ...(branchId && { branchId: toInt(branchId) }) },
    });

    if (!existing) throw new Error("Class not found");

    await prisma.classSchedule.delete({ where: { id: toInt(id) } });

    return true;
  } catch (err) {
    logger.error("deleteClass error", err);
    throw err;
  }
};

/* =====================================================================
    GET TRAINERS
===================================================================== */

exports.getTrainers = async (branchId = null) => {
  logger.info("getTrainers called");

  try {
    return await prisma.user.findMany({
      where: {
        role: { in: ["generaltrainer", "personaltrainer"] },
        ...(branchId && { branchId: toInt(branchId) }),
      },
      select: { id: true, firstName: true, lastName: true, email: true },
      orderBy: { firstName: "asc" },
    });
  } catch (err) {
    logger.error("getTrainers error", err);
    throw err;
  }
};

/* =====================================================================
    CLASS MEMBERS
===================================================================== */

exports.getClassMembers = async (classId, branchId = null) => {
  logger.info("getClassMembers called");

  try {
    const where = { id: toInt(classId), ...(branchId && { branchId: toInt(branchId) }) };

    const cls = await prisma.classSchedule.findFirst({
      where,
      include: {
        members: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    return cls ? cls.members : [];
  } catch (err) {
    logger.error("getClassMembers error", err);
    throw err;
  }
};

/* =====================================================================
    MEMBER - WEEKLY GROUP CLASSES
===================================================================== */

exports.getWeeklyGroupClasses = async (branchId) => {
  logger.info("getWeeklyGroupClasses called");

  try {
    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - today.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const where = {
      date: { gte: start, lte: end },
      status: { not: "Canceled" },
    };

    const b = toInt(branchId);
    if (b) where.branchId = b;

    const rows = await prisma.classSchedule.findMany({
      where,
      include: { trainer: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });

    return rows.map((cls) => ({
      id: cls.id,
      name: cls.className,
      trainerId: cls.trainerId,
      date: cls.date.toISOString().split("T")[0],
      time: cls.time,
      totalSeats: cls.totalSheets,
      bookedSeats: cls.bookedSeats,
      trainer: {
        id: cls.trainer.id,
        name: `${cls.trainer.firstName} ${cls.trainer.lastName}`,
      },
    }));
  } catch (err) {
    logger.error("getWeeklyGroupClasses error", err);
    throw err;
  }
};

/* =====================================================================
    BOOK GROUP CLASS (MEMBERS)
===================================================================== */

exports.bookGroupClass = async (memberId, classId) => {
  logger.info("bookGroupClass called");

  try {
    const cls = await prisma.classSchedule.findFirst({
      where: { id: toInt(classId) },
    });

    if (!cls) throw new Error("Class not found");
    if (cls.status === "Canceled") throw new Error("Class is canceled");
    if (cls.bookedSeats >= cls.totalSheets) throw new Error("Class is full");

    const member = await prisma.user.findFirst({
      where: { id: toInt(memberId) },
      select: { branchId: true },
    });

    if (!member || member.branchId !== cls.branchId)
      throw new Error("Access denied: Member must belong to same branch");

    const existingBooking = await prisma.groupClassBooking.findFirst({
      where: {
        memberId: toInt(memberId),
        classScheduleId: toInt(classId),
        status: { not: "Canceled" },
      },
    });

    if (existingBooking) throw new Error("Already booked");

    const booking = await prisma.groupClassBooking.create({
      data: {
        memberId: toInt(memberId),
        classScheduleId: toInt(classId),
        status: "Booked",
      },
    });

    await prisma.classSchedule.update({
      where: { id: toInt(classId) },
      data: { bookedSeats: { increment: 1 } },
    });

    return booking;
  } catch (err) {
    logger.error("bookGroupClass error", err);
    throw err;
  }
};
