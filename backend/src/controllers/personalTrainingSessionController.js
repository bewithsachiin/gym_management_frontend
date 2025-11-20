const personalTrainingSessionService = require('../services/personalTrainingSessionService');
const responseHandler = require('../utils/responseHandler');

// ----------------------------
// GET ALL SESSIONS
// ----------------------------
const getSessions = async (req, res, next) => {
  try {
    const { userBranchId, isSuperAdmin } = req.accessFilters;

    const {
      trainerId,
      memberId,
      status,
      dateFrom,
      dateTo,
      search
    } = req.query;

    const filters = {};

    if (trainerId) filters.trainerId = parseInt(trainerId);
    if (memberId) filters.memberId = parseInt(memberId);
    if (status) filters.status = status;

    if (dateFrom) filters.dateFrom = new Date(dateFrom);
    if (dateTo) filters.dateTo = new Date(dateTo);

    if (search) filters.search = search.trim().toLowerCase();

    // Branch Restriction
    if (!isSuperAdmin) {
      filters.branchId = parseInt(userBranchId);
    } else if (req.query.branchId) {
      filters.branchId = parseInt(req.query.branchId);
    }

    const sessions = await personalTrainingSessionService.getSessions(filters);

    return responseHandler.success(res, 'Sessions fetched successfully', { sessions });
  } catch (error) {
    console.error('❌ Get Sessions Error:', error);
    next(error);
  }
};

// ----------------------------
// GET SINGLE SESSION
// ----------------------------
const getSessionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const session = await personalTrainingSessionService.getSessionById(parseInt(id));

    return responseHandler.success(res, 'Session fetched successfully', { session });
  } catch (error) {
    console.error('❌ Get Session By ID Error:', error);
    next(error);
  }
};

// ----------------------------
// CREATE SESSION
// ----------------------------
const createSession = async (req, res, next) => {
  try {
    const createdById = req.user.id;
    const { userRole, userBranchId } = req.accessFilters;

    const sessionData = {
      ...req.body,
      trainerId: parseInt(req.body.trainerId),
      memberId: parseInt(req.body.memberId),
      duration: parseInt(req.body.duration),
      date: new Date(req.body.date),
      branchId: userRole === 'superadmin' ? parseInt(req.body.branchId) : userBranchId,
      createdBy: createdById
    };

    const session = await personalTrainingSessionService.createSession(sessionData);

    return responseHandler.success(res, 'Session created successfully', { session });
  } catch (error) {
    console.error('❌ Create Session Error:', error);
    next(error);
  }
};

// ----------------------------
// UPDATE SESSION
// ----------------------------
const updateSession = async (req, res, next) => {
  try {
    const { id } = req.params;

    const updateData = {
      ...req.body
    };

    if (updateData.date) updateData.date = new Date(updateData.date);
    if (updateData.trainerId) updateData.trainerId = parseInt(updateData.trainerId);

    const session = await personalTrainingSessionService.updateSession(parseInt(id), updateData);

    return responseHandler.success(res, 'Session updated successfully', { session });
  } catch (error) {
    console.error('❌ Update Session Error:', error);
    next(error);
  }
};

// ----------------------------
// DELETE SESSION
// ----------------------------
const deleteSession = async (req, res, next) => {
  try {
    const { id } = req.params;

    await personalTrainingSessionService.deleteSession(parseInt(id));

    return responseHandler.success(res, 'Session deleted successfully');
  } catch (error) {
    console.error('❌ Delete Session Error:', error);
    next(error);
  }
};

// ----------------------------
// GET TRAINERS (STATIC ROUTE)
// ----------------------------
const getTrainers = async (req, res, next) => {
  try {
    const { isSuperAdmin, userBranchId } = req.accessFilters;

    const branchId = isSuperAdmin
      ? parseInt(req.query.branchId || 0)
      : parseInt(userBranchId);

    const trainers = await personalTrainingSessionService.getTrainers(branchId);

    return responseHandler.success(res, 'Trainers fetched successfully', { trainers });
  } catch (error) {
    console.error('❌ Get Trainers Error:', error);
    next(error);
  }
};

// ----------------------------
// GET MEMBERS FOR SESSIONS
// ----------------------------
const getMembersForSessions = async (req, res, next) => {
  try {
    const { isSuperAdmin, userBranchId } = req.accessFilters;

    const search = req.query.search ? req.query.search.toLowerCase() : null;

    const branchId = isSuperAdmin
      ? parseInt(req.query.branchId || 0)
      : parseInt(userBranchId);

    const members = await personalTrainingSessionService.getMembersForSessions(branchId, search);

    return responseHandler.success(res, 'Members fetched successfully', { members });
  } catch (error) {
    console.error('❌ Get Members Error:', error);
    next(error);
  }
};

module.exports = {
  getSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession,
  getTrainers,
  getMembersForSessions,
};
