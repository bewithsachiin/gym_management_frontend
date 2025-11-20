const membershipService = require('../services/membershipService');
const { sendResponse } = require('../utils/responseHandler');

class MembershipController {
  // Get all memberships
  async getAllMemberships(req, res) {
    try {
      const { search, page = 1, limit = 10 } = req.query;
      const result = await membershipService.getAllMemberships(search, parseInt(page), parseInt(limit));
      sendResponse(res, 200, 'Memberships retrieved successfully', result);
    } catch (error) {
      sendResponse(res, 500, 'Error retrieving memberships', null, error.message);
    }
  }

  // Get membership by ID
  async getMembershipById(req, res) {
    try {
      const { id } = req.params;
      const membership = await membershipService.getMembershipById(id);
      if (!membership) {
        return sendResponse(res, 404, 'Membership not found');
      }
      sendResponse(res, 200, 'Membership retrieved successfully', membership);
    } catch (error) {
      sendResponse(res, 500, 'Error retrieving membership', null, error.message);
    }
  }

  // Create a new membership
  async createMembership(req, res) {
    try {
      const data = req.body;
      const membership = await membershipService.createMembership(data);
      sendResponse(res, 201, 'Membership created successfully', membership);
    } catch (error) {
      sendResponse(res, 500, 'Error creating membership', null, error.message);
    }
  }

  // Update membership
  async updateMembership(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const membership = await membershipService.updateMembership(id, data);
      sendResponse(res, 200, 'Membership updated successfully', membership);
    } catch (error) {
      sendResponse(res, 500, 'Error updating membership', null, error.message);
    }
  }

  // Delete membership
  async deleteMembership(req, res) {
    try {
      const { id } = req.params;
      await membershipService.deleteMembership(id);
      sendResponse(res, 200, 'Membership deleted successfully');
    } catch (error) {
      sendResponse(res, 500, 'Error deleting membership', null, error.message);
    }
  }
}

module.exports = new MembershipController();
