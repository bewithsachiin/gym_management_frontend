const planService = require('../services/planService');
const responseHandler = require('../utils/responseHandler');

function parseId(id) {
  const num = Number(id);
  return isNaN(num) ? null : num;
}

module.exports = {

  // GET ALL PLANS
  getPlans: async (req, res) => {
    try {
      const filters = { ...req.query };
      const result = await planService.getAllPlans(filters);
      return responseHandler.success(res, 'Plans fetched successfully', { plans: result });
    } catch (error) {
      return responseHandler.error(res, error.message, 500);
    }
  },

  // GET ALL FEATURES
  getFeatures: async (req, res) => {
    try {
      const result = await planService.getFeatures();
      return responseHandler.success(res, 'Features fetched successfully', { features: result });
    } catch (error) {
      return responseHandler.error(res, error.message, 500);
    }
  },

  // GET SINGLE PLAN
  getPlan: async (req, res) => {
    try {
      const id = parseId(req.params.id);
      if (!id) {
        return responseHandler.error(res, 'Invalid plan ID', 400);
      }
      const result = await planService.getPlanById(id);
      if (!result) {
        return responseHandler.error(res, 'Plan not found', 404);
      }
      return responseHandler.success(res, 'Plan fetched successfully', { plan: result });
    } catch (error) {
      return responseHandler.error(res, error.message, 500);
    }
  },

  // CREATE PLAN
  createPlan: async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return responseHandler.error(res, 'Unauthorized request', 401);
      }

      const cleanData = { ...req.body };
      const createdBy = req.user.id;

      const result = await planService.createPlan(cleanData, createdBy);
      return responseHandler.success(res, 'Plan created successfully', { plan: result }, 201);
    } catch (error) {
      return responseHandler.error(res, error.message, 500);
    }
  },

  // UPDATE PLAN
  updatePlan: async (req, res) => {
    try {
      const id = parseId(req.params.id);
      if (!id) {
        return responseHandler.error(res, 'Invalid plan ID', 400);
      }

      if (!req.user || !req.user.id) {
        return responseHandler.error(res, 'Unauthorized request', 401);
      }

      const cleanData = { ...req.body };
      const updatedBy = req.user.id;

      const result = await planService.updatePlan(id, cleanData, updatedBy);
      return responseHandler.success(res, 'Plan updated successfully', { plan: result });
    } catch (error) {
      return responseHandler.error(res, error.message, 500);
    }
  },

  // DELETE PLAN
  deletePlan: async (req, res) => {
    try {
      const id = parseId(req.params.id);
      if (!id) {
        return responseHandler.error(res, 'Invalid plan ID', 400);
      }

      if (!req.user || !req.user.id) {
        return responseHandler.error(res, 'Unauthorized request', 401);
      }

      await planService.deletePlan(id, req.user.id);
      return responseHandler.success(res, 'Plan deleted successfully');
    } catch (error) {
      return responseHandler.error(res, error.message, 500);
    }
  },

  // TOGGLE STATUS (ACTIVE / INACTIVE)
  togglePlanStatus: async (req, res) => {
    try {
      const id = parseId(req.params.id);
      if (!id) {
        return responseHandler.error(res, 'Invalid plan ID', 400);
      }

      if (!req.user || !req.user.id) {
        return responseHandler.error(res, 'Unauthorized request', 401);
      }

      const result = await planService.togglePlanStatus(id, req.user.id);
      return responseHandler.success(res, 'Plan status updated successfully', { plan: result });
    } catch (error) {
      return responseHandler.error(res, error.message, 500);
    }
  },

  // GET BOOKING REQUESTS
  getBookingRequests: async (req, res) => {
    try {
      const filters = { ...req.query };
      const result = await planService.getBookingRequests(filters);
      return responseHandler.success(res, 'Booking requests fetched successfully', { bookings: result });
    } catch (error) {
      return responseHandler.error(res, error.message, 500);
    }
  },

  // CREATE BOOKING REQUEST (MEMBER SELF-SERVICE)
  createBookingRequest: async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return responseHandler.error(res, 'Unauthorized request', 401);
      }

      const cleanData = { ...req.body };
      const userId = req.user.id;

      const result = await planService.createBookingRequest(cleanData, userId);
      return responseHandler.success(res, 'Booking request submitted successfully', { booking: result }, 201);
    } catch (error) {
      return responseHandler.error(res, error.message, 500);
    }
  },

  // APPROVE BOOKING
  approveBooking: async (req, res) => {
    try {
      const id = parseId(req.params.id);
      if (!id) {
        return responseHandler.error(res, 'Invalid booking ID', 400);
      }

      const userId = req.user?.id;
      const result = await planService.approveBooking(id, userId);
      return responseHandler.success(res, 'Booking approved successfully', { booking: result });
    } catch (error) {
      return responseHandler.error(res, error.message, 500);
    }
  },

  // REJECT BOOKING
  rejectBooking: async (req, res) => {
    try {
      const id = parseId(req.params.id);
      if (!id) {
        return responseHandler.error(res, 'Invalid booking ID', 400);
      }

      const userId = req.user?.id;
      const result = await planService.rejectBooking(id, userId);
      return responseHandler.success(res, 'Booking rejected successfully', { booking: result });
    } catch (error) {
      return responseHandler.error(res, error.message, 500);
    }
  }
};
