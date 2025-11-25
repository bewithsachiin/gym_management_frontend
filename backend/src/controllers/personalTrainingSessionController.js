const service = require('../services/personalTrainingSessionService');
const response = require('../utils/responseHandler');

const getSessions = async (req, res, next) => {
  try {
    const { userBranchId, isSuperAdmin } = req.accessFilters;
    const filters = { ...req.query };

    if (!isSuperAdmin) filters.branchId = userBranchId;
    if (filters.trainerId) filters.trainerId = parseInt(filters.trainerId);
    if (filters.memberId) filters.memberId = parseInt(filters.memberId);

    const sessions = await service.getSessions(filters);
    return response.success(res, 'Sessions fetched successfully', { sessions });
  } catch (err) {
    next(err);
  }
};

const getSessionById = async (req, res, next) => {
  try {
    const session = await service.getSessionById(parseInt(req.params.id));
    return response.success(res, 'Session fetched successfully', { session });
  } catch (err) {
    next(err);
  }
};

const createSession = async (req, res, next) => {
  try {
    const createdBy = req.user.id;
    const { userBranchId, userRole } = req.accessFilters;

    const data = {
      ...req.body,
      trainerId: parseInt(req.body.trainerId),
      memberId: parseInt(req.body.memberId),
      duration: parseInt(req.body.duration),
      date: new Date(req.body.date),
      branchId: userRole === 'superadmin' ? parseInt(req.body.branchId) : userBranchId,
      createdBy
    };

    const session = await service.createSession(data);
    return response.success(res, 'Session created successfully', { session });
  } catch (err) {
    next(err);
  }
};

const updateSession = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    // Trainer can only update their own session
    const sessionData = await service.getSessionById(id);
    if (req.user.role === 'personaltrainer' && sessionData.trainerId !== req.user.id) {
      return response.error(res, 'You can only update your own sessions', 403);
    }

    const updated = await service.updateSession(id, req.body);
    return response.success(res, 'Session updated successfully', { updated });
  } catch (err) {
    next(err);
  }
};

const deleteSession = async (req, res, next) => {
  try {
    await service.deleteSession(parseInt(req.params.id));
    return response.success(res, 'Session deleted successfully');
  } catch (err) {
    next(err);
  }
};

const getTrainers = async (req, res, next) => {
  try {
    const branchId = req.accessFilters.isSuperAdmin
      ? parseInt(req.query.branchId || 0)
      : parseInt(req.accessFilters.userBranchId);

    const trainers = await service.getTrainers(branchId);
    return response.success(res, 'Trainers fetched successfully', { trainers });
  } catch (err) {
    next(err);
  }
};

const getMembersForSessions = async (req, res, next) => {
  try {
    const { isSuperAdmin, userBranchId } = req.accessFilters;

    const search = req.query.search?.toLowerCase() || null;
    const branchId = isSuperAdmin ? parseInt(req.query.branchId || 0) : userBranchId;

    const members = await service.getMembersForSessions(branchId, search);
    return response.success(res, 'Members fetched successfully', { members });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession,
  getTrainers,
  getMembersForSessions
};
