const classService = require('../services/classScheduleService');
const responseHandler = require('../utils/responseHandler');

// =========================
// GET ALL CLASSES
// =========================
exports.getClasses = async (req, res, next) => {
  try {
    const { role, branchId } = req.user;

    const filters = {};
    if (role !== 'superadmin') filters.branchId = branchId;

    const classes = await classService.getAllClasses(filters);
    responseHandler.success(res, "Classes fetched successfully", { classes });
  } catch (err) {
    next(err);
  }
};

// =========================
// GET CLASS BY ID
// =========================
exports.getClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { branchId, role } = req.user;

    if (isNaN(id)) return responseHandler.error(res, "Invalid class ID", 400);

    const classData = await classService.getClassById(id, role !== 'superadmin' ? branchId : null);
    if (!classData) return responseHandler.notFound(res, "Class not found");

    responseHandler.success(res, "Class fetched successfully", { class: classData });
  } catch (err) {
    next(err);
  }
};

// =========================
// CREATE CLASS
// =========================
exports.createClass = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const branchId = req.user.branchId;
    const classData = { ...req.body, branchId };

    const newClass = await classService.createClass(classData, userId);
    responseHandler.success(res, "Class created successfully", { class: newClass });
  } catch (err) {
    next(err);
  }
};

// =========================
// UPDATE CLASS
// =========================
exports.updateClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const branchId = req.user.branchId;

    const updatedClass = await classService.updateClass(id, req.body, userId, branchId);
    responseHandler.success(res, "Class updated successfully", { class: updatedClass });
  } catch (err) {
    next(err);
  }
};

// =========================
// DELETE CLASS
// =========================
exports.deleteClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const branchId = req.user.branchId;

    await classService.deleteClass(id, userId, branchId);
    responseHandler.success(res, "Class deleted successfully");
  } catch (err) {
    next(err);
  }
};

// =========================
// GET TRAINERS
// =========================
exports.getTrainers = async (req, res, next) => {
  try {
    const { branchId, role } = req.user;
    const trainers = await classService.getTrainers(role !== 'superadmin' ? branchId : null);

    responseHandler.success(res, "Trainers fetched successfully", { trainers });
  } catch (err) {
    next(err);
  }
};
