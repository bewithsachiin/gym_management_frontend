const classService = require('../services/classScheduleService');
const responseHandler = require('../utils/responseHandler');

// =========================
// GET ALL CLASSES
// =========================
exports.getClasses = async (req, res, next) => {
  console.log("📌 [CONTROLLER] getClasses called | user =", req.user);

  try {
    const { role, branchId } = req.user;
    const filters = {};

    if (role !== 'superadmin') filters.branchId = branchId;

    console.log("🔍 [FILTERS APPLIED] =>", filters);

    const classes = await classService.getAllClasses(filters);

    responseHandler.success(res, "Classes fetched successfully", { classes });
  } catch (err) {
    console.error("❌ [ERROR] getClasses:", err);
    next(err);
  }
};

// =========================
// GET CLASS BY ID
// =========================
exports.getClass = async (req, res, next) => {
  console.log("📌 [CONTROLLER] getClass called | params =", req.params);

  try {
    const { id } = req.params;
    const { branchId, role } = req.user;

    if (!id || isNaN(id)) {
      console.warn("⚠️ [WARNING] Invalid class ID:", id);
      return responseHandler.error(res, "Invalid class ID", 400);
    }

    const classData = await classService.getClassById(
      id,
      role !== 'superadmin' ? branchId : null
    );

    if (!classData) {
      console.warn("⚠️ [NOT FOUND] Class ID:", id);
      return responseHandler.notFound(res, "Class not found");
    }

    responseHandler.success(res, "Class fetched successfully", { class: classData });
  } catch (err) {
    console.error("❌ [ERROR] getClass:", err);
    next(err);
  }
};

// =========================
// CREATE CLASS
// =========================
exports.createClass = async (req, res, next) => {
  console.log("📌 [CONTROLLER] createClass called | body =", req.body);

  try {
    const userId = req.user.id;
    const branchId = req.user.branchId;
    const classData = { ...req.body, branchId };

    console.log("🆕 [CREATE CLASS DATA] =>", classData);

    const newClass = await classService.createClass(classData, userId);

    responseHandler.success(res, "Class created successfully", { class: newClass });
  } catch (err) {
    console.error("❌ [ERROR] createClass:", err);
    next(err);
  }
};

// =========================
// UPDATE CLASS
// =========================
exports.updateClass = async (req, res, next) => {
  console.log("📌 [CONTROLLER] updateClass called | params =", req.params, "| body =", req.body);

  try {
    const { id } = req.params;
    const userId = req.user.id;
    const branchId = req.user.branchId;

    if (!id || isNaN(id)) {
      console.warn("⚠️ [WARNING] Invalid class ID:", id);
      return responseHandler.error(res, "Invalid class ID", 400);
    }

    const updatedClass = await classService.updateClass(id, req.body, userId, branchId);

    responseHandler.success(res, "Class updated successfully", { class: updatedClass });
  } catch (err) {
    console.error("❌ [ERROR] updateClass:", err);
    next(err);
  }
};

// =========================
// DELETE CLASS
// =========================
exports.deleteClass = async (req, res, next) => {
  console.log("🗑️ [CONTROLLER] deleteClass | params =", req.params);

  try {
    const { id } = req.params;
    const userId = req.user.id;
    const branchId = req.user.branchId;

    if (!id || isNaN(id)) {
      console.warn("⚠️ [WARNING] Invalid class ID:", id);
      return responseHandler.error(res, "Invalid class ID", 400);
    }

    await classService.deleteClass(id, userId, branchId);

    responseHandler.success(res, "Class deleted successfully");
  } catch (err) {
    console.error("❌ [ERROR] deleteClass:", err);
    next(err);
  }
};

// =========================
// GET DAILY CLASSES
// =========================
exports.getDailyClasses = async (req, res, next) => {
  console.log("📆 [CONTROLLER] getDailyClasses called | user =", req.user);

  try {
    const { id: trainerId, branchId, role } = req.user;
    const classes = await classService.getDailyClasses(role, trainerId, branchId);

    responseHandler.success(res, "Daily classes fetched successfully", { classes });
  } catch (err) {
    console.error("❌ [ERROR] getDailyClasses:", err);
    next(err);
  }
};

// =========================
// GET TRAINERS
// =========================
exports.getTrainers = async (req, res, next) => {
  console.log("👨‍🏫 [CONTROLLER] getTrainers called | user =", req.user);

  try {
    const { branchId } = req.user;
    const trainers = await classService.getTrainers(branchId);

    responseHandler.success(res, "Trainers fetched successfully", { trainers });
  } catch (err) {
    console.error("❌ [ERROR] getTrainers:", err);
    next(err);
  }
};

// =========================
// GET CLASS MEMBERS
// =========================
exports.getClassMembers = async (req, res, next) => {
  console.log("👥 [CONTROLLER] getClassMembers called | params =", req.params);

  try {
    const { id } = req.params;
    const { branchId, role } = req.user;

    if (!id || isNaN(id)) {
      console.warn("⚠️ [WARNING] Invalid class ID:", id);
      return responseHandler.error(res, "Invalid class ID", 400);
    }

    const members = await classService.getClassMembers(
      id,
      role !== 'superadmin' ? branchId : null
    );

    responseHandler.success(res, "Class members fetched successfully", { members });
  } catch (err) {
    console.error("❌ [ERROR] getClassMembers:", err);
    next(err);
  }
};

// =========================
// GET WEEKLY GROUP CLASSES (for members)
// =========================
exports.getWeeklyGroupClasses = async (req, res, next) => {
  console.log("📅 [CONTROLLER] getWeeklyGroupClasses called | user =", req.user);

  try {
    const { branchId } = req.user;

    const classes = await classService.getWeeklyGroupClasses(branchId);

    responseHandler.success(res, "Weekly group classes fetched successfully", { classes });
  } catch (err) {
    console.error("❌ [ERROR] getWeeklyGroupClasses:", err);
    next(err);
  }
};

// =========================
// BOOK GROUP CLASS (for members)
// =========================
exports.bookGroupClass = async (req, res, next) => {
  console.log("🎫 [CONTROLLER] bookGroupClass called | params =", req.params, "| user =", req.user);

  try {
    const { id } = req.params;
    const { id: memberId, branchId } = req.user;

    if (!id || isNaN(id)) {
      console.warn("⚠️ [WARNING] Invalid class ID:", id);
      return responseHandler.error(res, "Invalid class ID", 400);
    }

    const booking = await classService.bookGroupClass(memberId, id);

    responseHandler.success(res, "Class booked successfully", { booking });
  } catch (err) {
    console.error("❌ [ERROR] bookGroupClass:", err);
    next(err);
  }
};
