const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

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
  const where = {};
  if (filters.branchId) where.branchId = Number(filters.branchId);
  if (filters.trainer_id) where.trainer_id = Number(filters.trainer_id);
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
    ...cls,
    schedule_day: toArray(cls.schedule_day),
  }));
};

// ============================
// GET CLASS BY ID
// ============================
exports.getClassById = async (id, branchId = null) => {
  const where = { id: Number(id) };
  if (branchId) where.branchId = Number(branchId);

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
    schedule_day: toArray(cls.schedule_day),
  };
};

// ============================
// CREATE CLASS
// ============================
exports.createClass = async (data, userId) => {
  const {
    class_name, trainer_id, date, time,
    schedule_day, total_sheets, status, branchId
  } = data;

  // Check trainer conflict
  const conflict = await prisma.classSchedule.findFirst({
    where: {
      trainer_id: Number(trainer_id),
      date: new Date(date),
      time,
      branchId: Number(branchId),
      status: "Active",
    },
  });

  if (conflict) throw new Error("Trainer is already scheduled at this time.");

  const created = await prisma.classSchedule.create({
    data: {
      class_name,
      trainer_id: Number(trainer_id),
      date: new Date(date),
      time,
      schedule_day: normalizeScheduleDay(schedule_day),
      total_sheets: Number(total_sheets) || 20,
      status: status || "Active",
      branchId: Number(branchId),
      adminId: Number(userId),
    },
    include: {
      trainer: true,
      branch: true,
      admin: true,
    },
  });

  logger.info(`Class created: ${class_name} by user ${userId}`);

  return { ...created, schedule_day: toArray(created.schedule_day) };
};

// ============================
// UPDATE CLASS
// ============================
exports.updateClass = async (id, data, userId, branchId = null) => {
  const existing = await prisma.classSchedule.findFirst({
    where: { id: Number(id), ...(branchId && { branchId: Number(branchId) }) },
  });

  if (!existing) throw new Error("Class not found");

  // If trainer/date/time changed → check conflict
  const newTrainer = data.trainer_id ? Number(data.trainer_id) : existing.trainer_id;
  const newDate = data.date ? new Date(data.date) : existing.date;
  const newTime = data.time || existing.time;

  const conflict = await prisma.classSchedule.findFirst({
    where: {
      trainer_id: newTrainer,
      date: newDate,
      time: newTime,
      branchId: existing.branchId,
      status: "Active",
      id: { not: Number(id) },
    },
  });

  if (conflict) throw new Error("Trainer is already scheduled at this time.");

  const updated = await prisma.classSchedule.update({
    where: { id: Number(id) },
    data: {
      class_name: data.class_name,
      trainer_id: newTrainer,
      date: newDate,
      time: newTime,
      schedule_day: data.schedule_day ? normalizeScheduleDay(data.schedule_day) : undefined,
      total_sheets: data.total_sheets ? Number(data.total_sheets) : undefined,
      status: data.status,
    },
    include: {
      trainer: true,
      branch: true,
      admin: true,
    },
  });

  logger.info(`Class updated: ${updated.class_name} by user ${userId}`);

  return { ...updated, schedule_day: toArray(updated.schedule_day) };
};

// ============================
// DELETE CLASS
// ============================
exports.deleteClass = async (id, userId, branchId = null) => {
  const existing = await prisma.classSchedule.findFirst({
    where: { id: Number(id), ...(branchId && { branchId: Number(branchId) }) },
  });

  if (!existing) throw new Error("Class not found");

  await prisma.classSchedule.delete({ where: { id: Number(id) } });

  logger.info(`Class deleted: ${existing.class_name} by user ${userId}`);
};

// ============================
// GET TRAINERS
// ============================
exports.getTrainers = async (branchId = null) => {
  const trainers = await prisma.user.findMany({
    where: {
      role: { in: ["generaltrainer", "personaltrainer"] },
      ...(branchId && { branchId: Number(branchId) }),
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
};
