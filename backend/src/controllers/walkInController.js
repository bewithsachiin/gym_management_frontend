const walkInService = require("../services/walkInService");
const responseHandler = require("../utils/responseHandler");

// Get all Walk-In records
function getWalkIns(req, res, next) {
  const filters = req.accessFilters; // from accessControl middleware
  const query = req.query; // search and branchId

  try {
    const userRole = filters.userRole;
    const userBranchId = filters.userBranchId;
    const isSuperAdmin = filters.isSuperAdmin;

    const search = query.search || null;
    const branchId = query.branchId ? parseInt(query.branchId) : null;

    // SuperAdmin -> can see all or filter by branch
    // Other users (admin/trainer) -> see only their branch
    let branchToUse;
    if (isSuperAdmin) {
      branchToUse = branchId ? branchId : null;
    } else {
      branchToUse = userBranchId;
    }

    walkInService
      .getWalkIns(branchToUse, search)
      .then(function (walkIns) {
        responseHandler.success(
          res,
          "Walk-in registrations fetched successfully",
          { walkIns }
        );
      })
      .catch(function (error) {
        next(error);
      });
  } catch (error) {
    next(error);
  }
}

// Create Walk-In
function createWalkIn(req, res, next) {
  const body = req.body;

  try {
    // Basic validation
    if (!body.name || !body.phone || !body.branchId) {
      return responseHandler.error(
        res,
        "Name, phone and branchId are required",
        400
      );
    }

    const filters = req.accessFilters;
    const userRole = filters.userRole;
    const userBranchId = filters.userBranchId;

    // Admin must create inside their own branch (ignore custom branch input)
    if (userRole === "admin") {
      body.branchId = userBranchId;
    }

    const createdById = req.user.id;

    walkInService
      .createWalkIn(body, createdById)
      .then(function (walkIn) {
        responseHandler.success(
          res,
          "Walk-in registration created successfully",
          { walkIn }
        );
      })
      .catch(function (error) {
        next(error);
      });
  } catch (error) {
    next(error);
  }
}

// Update Walk-In
function updateWalkIn(req, res, next) {
  const id = req.params.id;
  const body = req.body;
  const filters = req.accessFilters;

  try {
    const branchId = filters.userBranchId;

    walkInService
      .updateWalkIn(id, body, branchId)
      .then(function (walkIn) {
        responseHandler.success(
          res,
          "Walk-in registration updated successfully",
          { walkIn }
        );
      })
      .catch(function (error) {
        next(error);
      });
  } catch (error) {
    next(error);
  }
}

// Get Walk-In by ID
function getWalkInById(req, res, next) {
  const id = req.params.id;
  const filters = req.accessFilters;

  try {
    const branchId = filters.userBranchId;
    const userRole = filters.userRole;

    walkInService
      .getWalkInById(id, branchId, userRole)
      .then(function (walkIn) {
        responseHandler.success(
          res,
          "Walk-in registration fetched successfully",
          { walkIn }
        );
      })
      .catch(function (error) {
        next(error);
      });
  } catch (error) {
    next(error);
  }
}

// Delete Walk-In
function deleteWalkIn(req, res, next) {
  const id = req.params.id;
  const filters = req.accessFilters;

  try {
    const branchId = filters.userBranchId;

    walkInService
      .deleteWalkIn(id, branchId)
      .then(function () {
        responseHandler.success(
          res,
          "Walk-in registration deleted successfully"
        );
      })
      .catch(function (error) {
        next(error);
      });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getWalkIns: getWalkIns,
  getWalkInById: getWalkInById,
  createWalkIn: createWalkIn,
  updateWalkIn: updateWalkIn,
  deleteWalkIn: deleteWalkIn,
};
