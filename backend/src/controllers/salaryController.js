const salaryService = require("../services/salaryService");
const responseHandler = require("../utils/responseHandler");

const getSalaries = async (req, res, next) => {
  try {
    const { userRole, userBranchId, isSuperAdmin } = req.accessFilters;

    const salaries = isSuperAdmin
      ? await salaryService.getAllSalaries()
      : await salaryService.getSalariesByBranch(userBranchId);

    return responseHandler.success(res, "Salaries fetched successfully", { salaries });
  } catch (error) {
    next(error);
  }
};

const getSalaryById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const salary = await salaryService.getSalaryById(id);

    if (!salary) {
      return responseHandler.error(res, "Salary record not found", 404);
    }

    return responseHandler.success(res, "Salary fetched successfully", { salary });
  } catch (error) {
    next(error);
  }
};

const createSalary = async (req, res, next) => {
  try {
    const salaryData = { ...req.body };

    const createdById = req.user.id;

    const salary = await salaryService.createSalary(salaryData, createdById);

    return responseHandler.success(res, "Salary record created successfully", { salary });
  } catch (error) {
    next(error);
  }
};

const updateSalary = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const salaryData = { ...req.body };

    const salary = await salaryService.updateSalary(id, salaryData);

    return responseHandler.success(res, "Salary record updated successfully", { salary });
  } catch (error) {
    next(error);
  }
};

const deleteSalary = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

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
