const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getSessions = async (filters = {}) => {
  const { trainerId, memberId, branchId, status, dateFrom, dateTo, search } = filters;

  const where = {};

  if (trainerId) where.trainerId = parseInt(trainerId);
  if (memberId) where.memberId = parseInt(memberId);
  if (branchId) where.branchId = parseInt(branchId);
  if (status) where.status = status;
  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) where.date.gte = new Date(dateFrom);
    if (dateTo) where.date.lte = new Date(dateTo);
  }

  if (search) {
    where.OR = [
      { trainer: { firstName: { contains: search } } },
      { trainer: { lastName: { contains: search } } },
      { member: { firstName: { contains: search } } },
      { member: { lastName: { contains: search } } },
      { type: { contains: search } },
      { location: { contains: search } }
    ];
  }

  const sessions = await prisma.personalTrainingSession.findMany({
    where,
    include: {
      trainer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      member: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          memberId: true,
        },
      },
      branch: {
        select: {
          id: true,
          name: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { date: 'asc' },
  });

  return sessions.map(session => ({
    id: session.id,
    trainerId: session.trainerId,
    trainer: `${session.trainer.firstName} ${session.trainer.lastName}`,
    memberId: session.memberId,
    username: session.member.username || session.member.firstName.toLowerCase() + '_' + session.member.lastName.toLowerCase(),
    date: session.date.toISOString().split('T')[0],
    time: session.time,
    price: session.price ? `$${(session.price / 100).toFixed(2)}` : '$0.00',
    paymentStatus: session.paymentStatus,
    bookingStatus: session.status,
    type: session.type,
    notes: session.notes,
    location: session.location,
    branchId: session.branchId,
    branchName: session.branch.name,
    createdById: session.createdById,
    createdByName: session.createdBy ? `${session.createdBy.firstName} ${session.createdBy.lastName}` : null,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  }));
};

const getSessionById = async (id) => {
  const session = await prisma.personalTrainingSession.findUnique({
    where: { id: parseInt(id) },
    include: {
      trainer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      member: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          memberId: true,
        },
      },
      branch: {
        select: {
          id: true,
          name: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!session) {
    throw new Error('Session not found');
  }

  return {
    id: session.id,
    trainerId: session.trainerId,
    trainerName: `${session.trainer.firstName} ${session.trainer.lastName}`,
    memberId: session.memberId,
    memberName: `${session.member.firstName} ${session.member.lastName}`,
    memberIdCode: session.member.memberId,
    date: session.date.toISOString().split('T')[0],
    time: session.time,
    duration: session.duration,
    status: session.status,
    type: session.type,
    notes: session.notes,
    location: session.location,
    branchId: session.branchId,
    branchName: session.branch.name,
    createdById: session.createdById,
    createdByName: session.createdBy ? `${session.createdBy.firstName} ${session.createdBy.lastName}` : null,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
};

const createSession = async (data, createdById, userBranchId = null) => {
  const { trainerId, memberId, branchId, date, time, duration, type, notes, location, price, paymentStatus } = data;

  // Validate required fields
  if (!trainerId || !memberId || !date || !time) {
    throw new Error('Trainer, member, date, and time are required');
  }

  // Determine branchId: if not superadmin, use user's branch
  let finalBranchId = branchId ? parseInt(branchId) : userBranchId;
  if (!finalBranchId) {
    throw new Error('Branch is required');
  }

  // Check if trainer exists and is a personal trainer in the same branch
  const trainer = await prisma.user.findUnique({
    where: { id: parseInt(trainerId) },
  });
  if (!trainer || trainer.role !== 'personaltrainer' || trainer.branchId !== finalBranchId) {
    throw new Error('Invalid trainer selected or trainer does not belong to your branch');
  }

  // Check if member exists in the same branch
  const member = await prisma.user.findUnique({
    where: { id: parseInt(memberId) },
  });
  if (!member || member.role !== 'member' || member.branchId !== finalBranchId) {
    throw new Error('Invalid member selected or member does not belong to your branch');
  }

  // Check if branch exists
  const branch = await prisma.branch.findUnique({
    where: { id: finalBranchId },
  });
  if (!branch) {
    throw new Error('Invalid branch selected');
  }

  // Create session
  const session = await prisma.personalTrainingSession.create({
    data: {
      trainerId: parseInt(trainerId),
      memberId: parseInt(memberId),
      branchId: finalBranchId,
      date: new Date(date),
      time,
      duration: parseInt(duration) || 60,
      status: 'Booked',
      type: type || 'Personal Training',
      price: price ? parseInt(price) : null,
      paymentStatus: paymentStatus || 'Paid',
      notes: notes || '',
      location: location || 'Gym Floor',
      createdById: parseInt(createdById),
    },
    include: {
      trainer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      member: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          memberId: true,
        },
      },
      branch: {
        select: {
          id: true,
          name: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return {
    id: session.id,
    trainerId: session.trainerId,
    trainer: `${session.trainer.firstName} ${session.trainer.lastName}`,
    memberId: session.memberId,
    username: session.member.username || session.member.firstName.toLowerCase() + '_' + session.member.lastName.toLowerCase(),
    date: session.date.toISOString().split('T')[0],
    time: session.time,
    price: session.price ? `$${(session.price / 100).toFixed(2)}` : '$0.00',
    paymentStatus: session.paymentStatus,
    bookingStatus: session.status,
    type: session.type,
    notes: session.notes,
    location: session.location,
    branchId: session.branchId,
    branchName: session.branch.name,
    createdById: session.createdById,
    createdByName: session.createdBy ? `${session.createdBy.firstName} ${session.createdBy.lastName}` : null,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
};

const updateSession = async (id, data) => {
  const session = await prisma.personalTrainingSession.findUnique({
    where: { id: parseInt(id) },
  });

  if (!session) {
    throw new Error('Session not found');
  }

  const { date, time, duration, status, type, notes, location, price, paymentStatus } = data;

  const updatedSession = await prisma.personalTrainingSession.update({
    where: { id: parseInt(id) },
    data: {
      date: date ? new Date(date) : session.date,
      time: time || session.time,
      duration: duration ? parseInt(duration) : session.duration,
      status: status || session.status,
      type: type || session.type,
      price: price !== undefined ? (price ? parseInt(price) : null) : session.price,
      paymentStatus: paymentStatus || session.paymentStatus,
      notes: notes !== undefined ? notes : session.notes,
      location: location || session.location,
    },
    include: {
      trainer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      member: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          memberId: true,
        },
      },
      branch: {
        select: {
          id: true,
          name: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return {
    id: updatedSession.id,
    trainerId: updatedSession.trainerId,
    trainer: `${updatedSession.trainer.firstName} ${updatedSession.trainer.lastName}`,
    memberId: updatedSession.memberId,
    username: updatedSession.member.username || updatedSession.member.firstName.toLowerCase() + '_' + updatedSession.member.lastName.toLowerCase(),
    date: updatedSession.date.toISOString().split('T')[0],
    time: updatedSession.time,
    price: updatedSession.price ? `$${(updatedSession.price / 100).toFixed(2)}` : '$0.00',
    paymentStatus: updatedSession.paymentStatus,
    bookingStatus: updatedSession.status,
    type: updatedSession.type,
    notes: updatedSession.notes,
    location: updatedSession.location,
    branchId: updatedSession.branchId,
    branchName: updatedSession.branch.name,
    createdById: updatedSession.createdById,
    createdByName: updatedSession.createdBy ? `${updatedSession.createdBy.firstName} ${updatedSession.createdBy.lastName}` : null,
    createdAt: updatedSession.createdAt,
    updatedAt: updatedSession.updatedAt,
  };
};

const deleteSession = async (id) => {
  const session = await prisma.personalTrainingSession.findUnique({
    where: { id: parseInt(id) },
  });

  if (!session) {
    throw new Error('Session not found');
  }

  await prisma.personalTrainingSession.delete({
    where: { id: parseInt(id) },
  });
};

const getTrainers = async (branchId = null) => {
  const where = {
    role: 'personaltrainer',
  };

  if (branchId) {
    where.branchId = parseInt(branchId);
  }

  const trainers = await prisma.user.findMany({
    where,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      branch: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return trainers.map(trainer => ({
    id: trainer.id,
    name: `${trainer.firstName} ${trainer.lastName}`,
    firstName: trainer.firstName,
    lastName: trainer.lastName,
    email: trainer.email,
    branch: trainer.branch,
  }));
};

const getMembersForSessions = async (branchId = null, search = '') => {
  const where = { role: 'member' };

  if (branchId) {
    where.branchId = parseInt(branchId);
  }

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { memberId: { contains: search, mode: 'insensitive' } },
    ];
  }

  const members = await prisma.user.findMany({
    where,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      memberId: true,
      email: true,
      phone: true,
      branch: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return members.map(member => ({
    id: member.id,
    name: `${member.firstName} ${member.lastName}`,
    firstName: member.firstName,
    lastName: member.lastName,
    memberId: member.memberId,
    email: member.email,
    phone: member.phone,
    branch: member.branch,
  }));
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
