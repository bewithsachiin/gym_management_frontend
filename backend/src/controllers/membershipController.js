"use strict";

const membershipService = require("../services/membershipService");
const { sendResponse } = require("../utils/responseHandler");

// -----------------------------------------------------
// SAFE PARSERS (strict runtime type checks)
// -----------------------------------------------------
const toInt = (val) => {
  const num = Number(val);
  return Number.isFinite(num) ? num : null;
};

// -----------------------------------------------------
// GET ALL MEMBERSHIPS
// -----------------------------------------------------
const getAllMemberships = async (req, res) => {
  try {
    const { search } = req.query;
    const page = toInt(req.query.page) || 1;
    const limit = toInt(req.query.limit) || 10;

    const result = await membershipService.getAllMemberships(search, page, limit);

    return sendResponse(res, 200, "Memberships retrieved successfully", result);
  } catch (error) {
    return sendResponse(res, 500, "Error retrieving memberships", null, error.message);
  }
};

// -----------------------------------------------------
// GET MEMBERSHIP BY ID
// -----------------------------------------------------
const getMembershipById = async (req, res) => {
  try {
    const id = toInt(req.params.id);
    if (!id) return sendResponse(res, 400, "Invalid membership ID");

    const membership = await membershipService.getMembershipById(id);

    if (!membership) {
      return sendResponse(res, 404, "Membership not found");
    }

    return sendResponse(res, 200, "Membership retrieved successfully", membership);
  } catch (error) {
    return sendResponse(res, 500, "Error retrieving membership", null, error.message);
  }
};

// -----------------------------------------------------
// CREATE MEMBERSHIP
// -----------------------------------------------------
const createMembership = async (req, res) => {
  try {
    const data = req.body;

    const membership = await membershipService.createMembership(data);
    return sendResponse(res, 201, "Membership created successfully", membership);
  } catch (error) {
    return sendResponse(res, 500, "Error creating membership", null, error.message);
  }
};

// -----------------------------------------------------
// UPDATE MEMBERSHIP
// -----------------------------------------------------
const updateMembership = async (req, res) => {
  try {
    const id = toInt(req.params.id);
    if (!id) return sendResponse(res, 400, "Invalid membership ID");

    const data = req.body;

    const membership = await membershipService.updateMembership(id, data);
    return sendResponse(res, 200, "Membership updated successfully", membership);
  } catch (error) {
    return sendResponse(res, 500, "Error updating membership", null, error.message);
  }
};

// -----------------------------------------------------
// DELETE MEMBERSHIP
// -----------------------------------------------------
const deleteMembership = async (req, res) => {
  try {
    const id = toInt(req.params.id);
    if (!id) return sendResponse(res, 400, "Invalid membership ID");

    await membershipService.deleteMembership(id);
    return sendResponse(res, 200, "Membership deleted successfully");
  } catch (error) {
    return sendResponse(res, 500, "Error deleting membership", null, error.message);
  }
};

// -----------------------------------------------------
// EXPORTS
// -----------------------------------------------------
module.exports = {
  getAllMemberships,
  getMembershipById,
  createMembership,
  updateMembership,
  deleteMembership
};
