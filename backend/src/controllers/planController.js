const planService = require('../services/planService');
const responseHandler = require('../utils/responseHandler');

const getPlans = async (req, res) => {
  try {
    const filters = req.query;
    const plans = await planService.getAllPlans(filters);
    responseHandler.success(res, 'Plans fetched successfully', { plans });
  } catch (error) {
    responseHandler.error(res, error.message, 500);
  }
};

const getFeatures = async (req, res) => {
  try {
    const features = await planService.getFeatures();
    responseHandler.success(res, 'Features fetched successfully', { features });
  } catch (error) {
    responseHandler.error(res, error.message, 500);
  }
};

const getPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await planService.getPlanById(id);
    if (!plan) {
      return responseHandler.error(res, 'Plan not found', 404);
    }
    responseHandler.success(res, 'Plan fetched successfully', { plan });
  } catch (error) {
    responseHandler.error(res, error.message, 500);
  }
};

const createPlan = async (req, res) => {
  try {
    const planData = req.body;
    const userId = req.user.id;
    const plan = await planService.createPlan(planData, userId);
    responseHandler.success(res, 'Plan created successfully', { plan }, 201);
  } catch (error) {
    responseHandler.error(res, error.message, 500);
  }
};

const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const planData = req.body;
    const userId = req.user.id;
    const plan = await planService.updatePlan(id, planData, userId);
    responseHandler.success(res, 'Plan updated successfully', { plan });
  } catch (error) {
    responseHandler.error(res, error.message, 500);
  }
};

const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    await planService.deletePlan(id, userId);
    responseHandler.success(res, 'Plan deleted successfully');
  } catch (error) {
    responseHandler.error(res, error.message, 500);
  }
};

const togglePlanStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const plan = await planService.togglePlanStatus(id, userId);
    responseHandler.success(res, 'Plan status updated successfully', { plan });
  } catch (error) {
    responseHandler.error(res, error.message, 500);
  }
};

const getBookingRequests = async (req, res) => {
  try {
    const filters = req.query;
    const bookings = await planService.getBookingRequests(filters);
    responseHandler.success(res, 'Booking requests fetched successfully', { bookings });
  } catch (error) {
    responseHandler.error(res, error.message, 500);
  }
};

const createBookingRequest = async (req, res) => {
  try {
    const bookingData = req.body;
    const userId = req.user.id;
    const booking = await planService.createBookingRequest(bookingData, userId);
    responseHandler.success(res, 'Booking request submitted successfully', { booking }, 201);
  } catch (error) {
    responseHandler.error(res, error.message, 500);
  }
};

const approveBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const booking = await planService.approveBooking(id, userId);
    responseHandler.success(res, 'Booking approved successfully', { booking });
  } catch (error) {
    responseHandler.error(res, error.message, 500);
  }
};

const rejectBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const booking = await planService.rejectBooking(id, userId);
    responseHandler.success(res, 'Booking rejected successfully', { booking });
  } catch (error) {
    responseHandler.error(res, error.message, 500);
  }
};

module.exports = {
  getPlans,
  getFeatures,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
  togglePlanStatus,
  getBookingRequests,
  createBookingRequest,
  approveBooking,
  rejectBooking,
};
