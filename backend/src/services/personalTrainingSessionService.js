const prisma = require("../config/db");

// Safe converters
const toInt = (v) => isNaN(v) ? null : parseInt(v);
const toDate = (v) => v ? new Date(v) : null;

// ==================== VALIDATIONS ====================
const validateUserSameBranch = async (id, branchId) => {
  const user = await prisma.user.findUnique({ where: { id } });
  return user && user.branchId === branchId;
};

const trainerHasConflict = async (trainerId, date, time, branchId, ignoreId = null) => {
  return await prisma.personalTrainingSession.findFirst({
    where: {
      trainerId,
      date,
      time,
      branchId,
      id: ignoreId ? { not: ignoreId } : undefined,
      status: { not: 'Cancelled' }
    }
  });
};

const memberSessionCountIsValid = async (memberId) => {
  const activePlan = await prisma.memberPlan.findFirst({
    where: { memberId, remainingSessions: { gt: 0 } }
  });
  return activePlan;
};

// ==================== GET ====================
exports.getSessions = async (filters = {}) => {
  const where = {};
  if (filters.trainerId) where.trainerId = filters.trainerId;
  if (filters.memberId) where.memberId = filters.memberId;
  if (filters.status) where.status = filters.status;
  if (filters.branchId) where.branchId = filters.branchId;

  return await prisma.personalTrainingSession.findMany({
    where,
    include: {
      trainer: true,
      member: true,
      branch: true
    },
    orderBy: { createdAt: "desc" }
  });
};

exports.getSessionById = async (id) => {
  return await prisma.personalTrainingSession.findUnique({
    where: { id },
    include: {
      trainer: true,
      member: true,
      branch: true
    }
  });
};

// ==================== CREATE WITH DEDUCTION ====================
exports.createSession = async (data) => {

  // Validate trainer & member belong to this branch
  if (!await validateUserSameBranch(data.trainerId, data.branchId)) {
    throw new Error("Trainer does not belong to this branch");
  }
  if (!await validateUserSameBranch(data.memberId, data.branchId)) {
    throw new Error("Member does not belong to this branch");
  }

  // Validate member session available
  const activePlan = await memberSessionCountIsValid(data.memberId);
  if (!activePlan) throw new Error("No remaining sessions in member plan");

  // Validate trainer availability
  const conflict = await trainerHasConflict(data.trainerId, data.date, data.time, data.branchId);
  if (conflict) throw new Error("Trainer already booked at same time");

  // Deduct session (transaction)
  return await prisma.$transaction(async (tx) => {
    // deduct session
    await tx.memberPlan.update({
      where: { id: activePlan.id },
      data: { remainingSessions: activePlan.remainingSessions - 1 }
    });

    // create session
    return await tx.personalTrainingSession.create({
      data: {
        trainerId: data.trainerId,
        memberId: data.memberId,
        branchId: data.branchId,
        duration: data.duration,
        date: data.date,
        time: data.time,
        status: "Booked",
        createdById: data.createdBy
      }
    });
  });
};

// ==================== UPDATE ====================
exports.updateSession = async (id, data) => {
  const session = await prisma.personalTrainingSession.findUnique({ where: { id } });
  if (!session) throw new Error("Session not found");

  const finalDate = data.date ? new Date(data.date) : session.date;
  const finalTime = data.time || session.time;
  const finalTrainer = data.trainerId ? parseInt(data.trainerId) : session.trainerId;

  const conflict = await trainerHasConflict(finalTrainer, finalDate, finalTime, session.branchId, id);
  if (conflict) throw new Error("Trainer already booked at same time");

  return await prisma.personalTrainingSession.update({
    where: { id },
    data
  });
};

// ==================== DELETE (NO REFUND IMPLEMENTED YET) ====================
exports.deleteSession = async (id) => {
  const exists = await prisma.personalTrainingSession.findUnique({ where: { id } });
  if (!exists) throw new Error("Session not found");
  return await prisma.personalTrainingSession.delete({ where: { id } });
};

// ==================== DROPDOWN QUERIES ====================
exports.getTrainers = async (branchId) => {
  return await prisma.user.findMany({
    where: { branchId, role: "personaltrainer" },
    select: { id: true, firstName: true, lastName: true }
  });
};

exports.getMembersForSessions = async (branchId, search) => {
  let members = await prisma.user.findMany({
    where: { branchId, role: "member" },
    select: { id: true, firstName: true, lastName: true }
  });

  if (search) {
    members = members.filter(m =>
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(search)
    );
  }
  return members;
};
