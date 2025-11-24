const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');
const prisma = new PrismaClient();

//--------------------------------
// Safe Helpers
//--------------------------------
const toInt = (value) => {
  const num = parseInt(value);
  return Number.isNaN(num) ? null : num;
};

const toDate = (value) => {
  try {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
};

// Convert schedule_day input (array/string) -> string for DB
const normalizeScheduleDay = (value) => {
  if (!value) return "";
  if (Array.isArray(value)) return value.join(',');
  return String(value);
};

// Convert DB string -> array
const toArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(d => d.trim());
  if (typeof value === 'string') return value.split(',').map(d => d.trim());
  return [];
};

// ============================
// GET ALL CLASSES
// ============================
exports.getAllClasses = async (filters = {}) => {
  logger.info("📌 getAllClasses called", filters);
  try {
    const where = {};
    if (filters.branchId) where.branchId = toInt(filters.branchId);
    if (filters.trainerId) where.trainerId = toInt(filters.trainerId);
    if (filters.status) where.status = filters.status;

    const list = await prisma.classSchedule.findMany({
      where,
      include: {
        trainer: { select: { id: true, firstName: true, lastName: true, role: true } },
        branch: { select: { id: true, name: true } },
        admin: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return list.map(cls => ({
      id: cls.id,
      class_name: cls.className,
      trainer_id: cls.trainerId,
      date: cls.date,
      time: cls.time,
      schedule_day: toArray(cls.scheduleDay),
      total_sheets: cls.totalSheets,
      status: cls.status,
      branchId: cls.branchId,
      adminId: cls.adminId,
      room_name: cls.roomName,
      booked_seats: cls.bookedSeats,
      createdAt: cls.createdAt,
      updatedAt: cls.updatedAt,
      trainer: cls.trainer,
      branch: cls.branch,
      admin: cls.admin,
    }));
  } catch (error) {
    logger.error("❌ getAllClasses error", error);
    throw error;
  }
};

// ============================
// GET DAILY CLASSES
// ============================
exports.getDailyClasses = async (role, trainerId, branchId) => {
  logger.info("📅 getDailyClasses called", { role, trainerId, branchId });

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const where = {
      date: today,
      branchId: toInt(branchId),
      status: { not: "Canceled" } // Show Scheduled and Completed
    };

    // If trainer, filter by their classes
    if (role === 'generaltrainer' || role === 'personaltrainer') {
      where.trainerId = toInt(trainerId);
    }

    const list = await prisma.classSchedule.findMany({
      where,
      include: {
        trainer: { select: { id: true, firstName: true, lastName: true, role: true } },
        branch: { select: { id: true, name: true } },
        admin: { select: { id: true, firstName: true, lastName: true } },
        members: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            memberId: true,
            email: true,
          },
        },
      },
      orderBy: { time: "asc" },
    });

    return list.map(cls => ({
      class_schedule_id: cls.id,
      class_name: cls.className,
      trainer_id: cls.trainerId,
      start_time: cls.time?.split('-')[0] || cls.time,
      end_time: cls.time?.split('-')[1] || cls.time,
      room_name: cls.roomName || "--",
      capacity: cls.totalSheets,
      booked_seats: cls.bookedSeats,
      status: cls.status,
      trainer: cls.trainer,
      branch: cls.branch,
      members: cls.members,
    }));
  } catch (error) {
    logger.error("❌ getDailyClasses error", error);
    throw error;
  }
};

// ============================
// GET CLASS BY ID
// ============================
exports.getClassById = async (id, branchId = null) => {
  logger.info("🔎 getClassById", { id, branchId });

  try {
    const where = { id: toInt(id) };
    if (branchId) where.branchId = toInt(branchId);

    const cls = await prisma.classSchedule.findFirst({
      where,
      include: {
        trainer: { select: { id: true, firstName: true, lastName: true, role: true } },
        branch: { select: { id: true, name: true } },
        admin: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (!cls) return null;

    return {
      ...cls,
      schedule_day: toArray(cls.scheduleDay),
    };
  } catch (error) {
    logger.error("❌ getClassById error", error);
    throw error;
  }
};

// ============================
// CREATE CLASS
// ============================
exports.createClass = async (data, userId) => {
  logger.info("🟢 createClass called", data);

  try {
    const dateObj = toDate(data.date);
    if (!dateObj) throw new Error("Invalid or missing date");

    // trainer conflict
    const conflict = await prisma.classSchedule.findFirst({
      where: {
        trainerId: toInt(data.trainer_id),
        date: dateObj,
        time: data.time,
        branchId: toInt(data.branchId),
        status: { not: "Canceled" },
      },
    });

    if (conflict) throw new Error("Trainer is already scheduled at this time.");

    const created = await prisma.classSchedule.create({
      data: {
        className: data.class_name,
        trainerId: toInt(data.trainer_id),
        date: dateObj,
        time: data.time,
        scheduleDay: normalizeScheduleDay(data.schedule_day),
        totalSheets: Number(data.total_sheets) || 20,
        status: data.status || "Scheduled",
        branchId: toInt(data.branchId),
        adminId: toInt(userId),
      },
      include: { trainer: true, branch: true, admin: true },
    });

    logger.info(`Class created: ${created.className} by user ${userId}`);

    return { ...created, schedule_day: toArray(created.scheduleDay) };
  } catch (error) {
    logger.error("❌ createClass error", error);
    throw error;
  }
};

// ============================
// UPDATE CLASS
// ============================
exports.updateClass = async (id, data, userId, branchId = null) => {
  logger.info("🟪 updateClass called", { id, data });

  try {
    const existing = await prisma.classSchedule.findFirst({
      where: { id: toInt(id), ...(branchId && { branchId: toInt(branchId) }) },
    });

    if (!existing) throw new Error("Class not found");

    // conflict validation
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
        status: "Active",
        id: { not: toInt(id) },
      },
    });

    if (conflict) throw new Error("Trainer is already scheduled at this time.");

    const updated = await prisma.classSchedule.update({
      where: { id: toInt(id) },
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

    logger.info(`Class updated: ${updated.className} by user ${userId}`);

    return { ...updated, schedule_day: toArray(updated.scheduleDay) };
  } catch (error) {
    logger.error("❌ updateClass error", error);
    throw error;
  }
};

// ============================
// DELETE CLASS
// ============================
exports.deleteClass = async (id, userId, branchId = null) => {
  logger.info("🗑️ deleteClass", { id });

  try {
    const existing = await prisma.classSchedule.findFirst({
      where: { id: toInt(id), ...(branchId && { branchId: toInt(branchId) }) },
    });

    if (!existing) throw new Error("Class not found");

    await prisma.classSchedule.delete({ where: { id: toInt(id) } });

    logger.info(`Class deleted: ${existing.className} by user ${userId}`);
  } catch (error) {
    logger.error("❌ deleteClass error", error);
    throw error;
  }
};

// ============================
// GET TRAINERS
// ============================
exports.getTrainers = async (branchId = null) => {
  logger.info("🐾 getTrainers");

  try {
    const trainers = await prisma.user.findMany({
      where: {
        role: { in: ["generaltrainer", "personaltrainer"] },
        ...(branchId && { branchId: toInt(branchId) }),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
      orderBy: { firstName: "asc" },
    });

    return trainers;
  } catch (error) {
    logger.error("❌ getTrainers error", error);
    throw error;
  }
};

// ============================
// GET CLASS MEMBERS
// ============================
exports.getClassMembers = async (classId, branchId = null) => {
  logger.info("👥 getClassMembers", { classId, branchId });

  try {
    const where = { id: toInt(classId) };
    if (branchId) where.branchId = toInt(branchId);

    const cls = await prisma.classSchedule.findFirst({
      where,
      include: {
        members: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            memberId: true,
            email: true,
          },
        },
      },
    });

    if (!cls) return [];

    return cls.members;
  } catch (error) {
    logger.error("❌ getClassMembers error", error);
    throw error;
  }
};
