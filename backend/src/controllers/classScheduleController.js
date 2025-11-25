"use strict";

const classService = require("../services/classScheduleService");
const responseHandler = require("../utils/responseHandler");

// ==========================
// Helper: Validate numeric ID
// ==========================
const validateId = (id) => {
  const parsed = Number(id);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

// ==========================
// GET ALL CLASSES
// ==========================
exports.getClasses = async (req, res, next) => {
  try {
    const { role, branchId } = req.user;
    const filters = role !== "superadmin" ? { branchId } : {};

    const classes = await classService.getAllClasses(filters);
    return responseHandler.success(res, "Classes fetched successfully", { classes });
  } catch (error) {
    next(error);
  }
};

// ==========================
// GET CLASS BY ID
// ==========================
exports.getClass = async (req, res, next) => {
  try {
    const id = validateId(req.params.id);
    if (!id) return responseHandler.error(res, "Invalid class ID", 400);

    const { role, branchId } = req.user;
    const classData = await classService.getClassById(id, role !== "superadmin" ? branchId : null);

    if (!classData) return responseHandler.notFound(res, "Class not found");

    return responseHandler.success(res, "Class fetched successfully", { class: classData });
  } catch (error) {
    next(error);
  }
};

// ==========================
// CREATE CLASS
// ==========================
exports.createClass = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const branchId = req.user.branchId;

    const payload = { ...req.body, branchId };
    const newClass = await classService.createClass(payload, userId);

    return responseHandler.success(res, "Class created successfully", { class: newClass });
  } catch (error) {
    next(error);
  }
};

// ==========================
// UPDATE CLASS
// ==========================
exports.updateClass = async (req, res, next) => {
  try {
    const id = validateId(req.params.id);
    if (!id) return responseHandler.error(res, "Invalid class ID", 400);

    const userId = req.user.id;
    const branchId = req.user.branchId;

    const updatedClass = await classService.updateClass(id, req.body, userId, branchId);
    return responseHandler.success(res, "Class updated successfully", { class: updatedClass });
  } catch (error) {
    next(error);
  }
};

// ==========================
// DELETE CLASS
// ==========================
exports.deleteClass = async (req, res, next) => {
  try {
    const id = validateId(req.params.id);
    if (!id) return responseHandler.error(res, "Invalid class ID", 400);

    const userId = req.user.id;
    const branchId = req.user.branchId;

    await classService.deleteClass(id, userId, branchId);
    return responseHandler.success(res, "Class deleted successfully");
  } catch (error) {
    next(error);
  }
};

// ==========================
// GET DAILY CLASSES (Trainer/Member)
// ==========================
exports.getDailyClasses = async (req, res, next) => {
  try {
    const { id: trainerId, branchId, role } = req.user;
    const classes = await classService.getDailyClasses(role, trainerId, branchId);

    return responseHandler.success(res, "Daily classes fetched successfully", { classes });
  } catch (error) {
    next(error);
  }
};

// ==========================
// GET TRAINERS (Admin Only)
// ==========================
exports.getTrainers = async (req, res, next) => {
  try {
    const { branchId } = req.user;
    const trainers = await classService.getTrainers(branchId);

    return responseHandler.success(res, "Trainers fetched successfully", { trainers });
  } catch (error) {
    next(error);
  }
};

// ==========================
// GET CLASS MEMBERS
// ==========================
exports.getClassMembers = async (req, res, next) => {
  try {
    const id = validateId(req.params.id);
    if (!id) return responseHandler.error(res, "Invalid class ID", 400);

    const { branchId, role } = req.user;
    const members = await classService.getClassMembers(id, role !== "superadmin" ? branchId : null);

    return responseHandler.success(res, "Class members fetched successfully", { members });
  } catch (error) {
    next(error);
  }
};

// ==========================
// MEMBERS: WEEKLY GROUP CLASSES
// ==========================
exports.getWeeklyGroupClasses = async (req, res, next) => {
  try {
    const { branchId } = req.user;
    const classes = await classService.getWeeklyGroupClasses(branchId);

    return responseHandler.success(res, "Weekly group classes fetched successfully", { classes });
  } catch (error) {
    next(error);
  }
};

// ==========================
// MEMBERS: BOOK GROUP CLASS
// ==========================
exports.bookGroupClass = async (req, res, next) => {
  try {
    const classId = validateId(req.params.id);
    if (!classId) return responseHandler.error(res, "Invalid class ID", 400);

    const memberId = req.user.id;
    const booking = await classService.bookGroupClass(memberId, classId);

    return responseHandler.success(res, "Class booked successfully", { booking });
  } catch (error) {
    next(error);
  }
};
