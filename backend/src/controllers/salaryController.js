const salaryService = require("../services/salaryService");
const responseHandler = require("../utils/responseHandler");

// ===============================
// 📌 GET ALL SALARIES
// ===============================
const getSalaries = async (req, res, next) => {
  try {
    const { isSuperAdmin, userBranchId } = req.accessFilters;

    const salaries = isSuperAdmin
      ? await salaryService.getAllSalaries()
      : await salaryService.getSalariesByBranch(userBranchId);

    return responseHandler.success(res, "Salaries fetched successfully", { salaries });
  } catch (error) {
    next(error);
  }
};

// ===============================
// 📌 GET SALARY BY ID
// ===============================
const getSalaryById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!id || isNaN(id)) {
      return responseHandler.error(res, "Invalid salary ID", 400);
    }

    const salary = await salaryService.getSalaryById(id);

    if (!salary) {
      return responseHandler.error(res, "Salary record not found", 404);
    }

    return responseHandler.success(res, "Salary fetched successfully", { salary });
  } catch (error) {
    next(error);
  }
};

// ===============================
// 📌 CREATE SALARY RECORD
// ===============================
const createSalary = async (req, res, next) => {
  try {
    const data = { ...req.body }; // keep safe immutable data
    const createdById = req.user.id;

    // Ensure branch is attached based on access filters
    if (!data.branchId) {
      data.branchId = req.accessFilters.userBranchId || null;
    }

    // Basic validation (we don't assume frontend correctness)
    if (!data.staffId || !data.salaryType) {
      return responseHandler.error(res, "Staff ID and salary type are required", 400);
    }

    const salary = await salaryService.createSalary(data, createdById);

    return responseHandler.success(res, "Salary record created successfully", { salary });
  } catch (error) {
    next(error);
  }
};

// ===============================
// 📌 UPDATE SALARY RECORD
// ===============================
const updateSalary = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const data = { ...req.body };

    if (!id || isNaN(id)) {
      return responseHandler.error(res, "Invalid salary ID", 400);
    }

    const salary = await salaryService.updateSalary(id, data);

    return responseHandler.success(res, "Salary record updated successfully", { salary });
  } catch (error) {
    next(error);
  }
};

// ===============================
// 📌 DELETE SALARY RECORD
// ===============================
const deleteSalary = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!id || isNaN(id)) {
      return responseHandler.error(res, "Invalid salary ID", 400);
    }

    const result = await salaryService.deleteSalary(id);

    return responseHandler.success(res, result.message);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSalaries,
  getSalaryById,
  createSalary,
  updateSalary,
  deleteSalary,
};
