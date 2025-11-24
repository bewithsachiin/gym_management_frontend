const membershipService = require('../services/membershipService');
const { sendResponse } = require('../utils/responseHandler');

// 🧪 Debug helper (safe, no logic changes)
const debugController = (label, req, extra = {}) => {
  console.log(`\n📌[MEMBERSHIP CONTROLLER] ${label}`);
  console.log("👤 User:", req.user ? {
    id: req.user.id,
    role: req.user.role,
    branchId: req.user.branchId
  } : "Not Authenticated");
  console.log("🌿 Filters:", req.accessFilters || "No Filter Middleware");
  if (Object.keys(req.params).length) console.log("📎 Params:", req.params);
  if (Object.keys(req.query).length) console.log("🔍 Query:", req.query);
  if (Object.keys(req.body).length) console.log("📦 Body:", req.body);
  if (extra && Object.keys(extra).length) console.log("📍 Extra:", extra);
};

// ----------------------------------------------------
// 📌 Get all memberships
// ----------------------------------------------------
const getAllMemberships = async (req, res) => {
  debugController("GET ALL MEMBERSHIPS", req);
  try {
    const { search, page = 1, limit = 10 } = req.query;

    const result = await membershipService.getAllMemberships(
      search,
      parseInt(page),
      parseInt(limit)
    );

    return sendResponse(res, 200, 'Memberships retrieved successfully', result);

  } catch (error) {
    return sendResponse(res, 500, 'Error retrieving memberships', null, error.message);
  }
};

// ----------------------------------------------------
// 📌 Get membership by ID
// ----------------------------------------------------
const getMembershipById = async (req, res) => {
  debugController("GET MEMBERSHIP BY ID", req);
  try {
    const { id } = req.params;

    const membership = await membershipService.getMembershipById(id);

    if (!membership) {
      return sendResponse(res, 404, 'Membership not found');
    }

    return sendResponse(res, 200, 'Membership retrieved successfully', membership);

  } catch (error) {
    return sendResponse(res, 500, 'Error retrieving membership', null, error.message);
  }
};

// ----------------------------------------------------
// 📌 Create membership
// ----------------------------------------------------
const createMembership = async (req, res) => {
  debugController("CREATE MEMBERSHIP", req);
  try {
    const data = req.body;

    const membership = await membershipService.createMembership(data);
    return sendResponse(res, 201, 'Membership created successfully', membership);

  } catch (error) {
    return sendResponse(res, 500, 'Error creating membership', null, error.message);
  }
};

// ----------------------------------------------------
// 📌 Update membership
// ----------------------------------------------------
const updateMembership = async (req, res) => {
  debugController("UPDATE MEMBERSHIP", req);
  try {
    const { id } = req.params;
    const data = req.body;

    const membership = await membershipService.updateMembership(id, data);
    return sendResponse(res, 200, 'Membership updated successfully', membership);

  } catch (error) {
    return sendResponse(res, 500, 'Error updating membership', null, error.message);
  }
};

// ----------------------------------------------------
// 📌 Delete membership
// ----------------------------------------------------
const deleteMembership = async (req, res) => {
  debugController("DELETE MEMBERSHIP", req);
  try {
    const { id } = req.params;

    await membershipService.deleteMembership(id);
    return sendResponse(res, 200, 'Membership deleted successfully');

  } catch (error) {
    return sendResponse(res, 500, 'Error deleting membership', null, error.message);
  }
};

// Exporting all functions (NO CLASS)
module.exports = {
  getAllMemberships,
  getMembershipById,
  createMembership,
  updateMembership,
  deleteMembership
};
