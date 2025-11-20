const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const cloudinary = require('../config/cloudinary');

const prisma = new PrismaClient();

const getAllStaff = async () => {
  const staffList = await prisma.staff.findMany({
    select: {
      id: true,
      staff_id: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      gender: true,
      dob: true,
      phone: true,
      profile_photo: true,
      status: true,
      role: {
        select: {
          id: true,
          name: true,
        },
      },
      branch: {
        select: {
          id: true,
          name: true,
        },
      },
      join_date: true,
      exit_date: true,
      salary_type: true,
      hourly_rate: true,
      fixed_salary: true,
      commission_rate_percent: true,
      login_enabled: true,
      username: true,
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  // Flatten the user data for consistency
  return staffList.map(staff => ({
    id: staff.id,
    staff_id: staff.staff_id,
    first_name: staff.user.firstName,
    last_name: staff.user.lastName,
    email: staff.user.email,
    gender: staff.gender,
    dob: staff.dob,
    phone: staff.phone,
    profile_photo: staff.profile_photo,
    status: staff.status,
    role: staff.role,
    branch: staff.branch,
    join_date: staff.join_date,
    exit_date: staff.exit_date,
    salary_type: staff.salary_type,
    hourly_rate: staff.hourly_rate,
    fixed_salary: staff.fixed_salary,
    commission_rate_percent: staff.commission_rate_percent,
    login_enabled: staff.login_enabled,
    username: staff.username,
    createdBy: staff.createdBy,
    createdAt: staff.createdAt,
    updatedAt: staff.updatedAt,
  }));
};

const createStaff = async (data, createdById) => {
  const {
    first_name,
    last_name,
    gender,
    dob,
    email,
    phone,
    profile_photo,
    status,
    roleId,
    branchId,
    join_date,
    exit_date,
    salary_type,
    hourly_rate,
    fixed_salary,
    commission_rate_percent,
    login_enabled,
    username,
    password,
  } = data;

  // Generate staff_id
  const lastStaff = await prisma.staff.findFirst({
    orderBy: { id: 'desc' },
  });
  const nextId = lastStaff ? parseInt(lastStaff.staff_id.replace('STAFF', '')) + 1 : 1;
  const staff_id = `STAFF${String(nextId).padStart(3, '0')}`;

  // Hash password if provided
  let hashedPassword = null;
  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  // Create User first
  const user = await prisma.user.create({
    data: {
      firstName: first_name,
      lastName: last_name,
      email,
      password: hashedPassword || 'temp', // Temporary password if not provided
      role: 'MEMBER', // Default, will be updated based on staff role
      branchId: parseInt(branchId),
    },
  });

  // Create Staff
  const staff = await prisma.staff.create({
    data: {
      userId: user.id,
      branchId: parseInt(branchId),
      roleId: parseInt(roleId),
      staff_id,
      gender,
      dob: dob ? new Date(dob) : null,
      phone,
      profile_photo,
      status,
      join_date: new Date(join_date),
      exit_date: exit_date ? new Date(exit_date) : null,
      salary_type,
      hourly_rate: hourly_rate ? parseFloat(hourly_rate) : null,
      fixed_salary: fixed_salary ? parseFloat(fixed_salary) : null,
      commission_rate_percent: parseFloat(commission_rate_percent) || 0,
      login_enabled: login_enabled === 'true' || login_enabled === true,
      username,
      password: hashedPassword,
      createdById: parseInt(createdById),
    },
    select: {
      id: true,
      staff_id: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      gender: true,
      dob: true,
      phone: true,
      profile_photo: true,
      status: true,
      role: {
        select: {
          id: true,
          name: true,
        },
      },
      branch: {
        select: {
          id: true,
          name: true,
        },
      },
      join_date: true,
      exit_date: true,
      salary_type: true,
      hourly_rate: true,
      fixed_salary: true,
      commission_rate_percent: true,
      login_enabled: true,
      username: true,
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  // Flatten the user data for consistency
  return {
    id: staff.id,
    staff_id: staff.staff_id,
    first_name: staff.user.firstName,
    last_name: staff.user.lastName,
    email: staff.user.email,
    gender: staff.gender,
    dob: staff.dob,
    phone: staff.phone,
    profile_photo: staff.profile_photo,
    status: staff.status,
    role: staff.role,
    branch: staff.branch,
    join_date: staff.join_date,
    exit_date: staff.exit_date,
    salary_type: staff.salary_type,
    hourly_rate: staff.hourly_rate,
    fixed_salary: staff.fixed_salary,
    commission_rate_percent: staff.commission_rate_percent,
    login_enabled: staff.login_enabled,
    username: staff.username,
    createdAt: staff.createdAt,
    updatedAt: staff.updatedAt,
  };
};

const updateStaff = async (id, data) => {
  const {
    first_name,
    last_name,
    gender,
    dob,
    email,
    phone,
    profile_photo,
    status,
    roleId,
    branchId,
    join_date,
    exit_date,
    salary_type,
    hourly_rate,
    fixed_salary,
    commission_rate_percent,
    login_enabled,
    username,
    password,
  } = data;

  const staff = await prisma.staff.findUnique({
    where: { id: parseInt(id) },
    include: { user: true },
  });

  if (!staff) {
    throw new Error('Staff not found');
  }

  // Hash new password if provided
  let hashedPassword = staff.password;
  if (password && password !== staff.password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  // Update User
  await prisma.user.update({
    where: { id: staff.userId },
    data: {
      firstName: first_name,
      lastName: last_name,
      email,
      password: hashedPassword,
      branchId: parseInt(branchId),
    },
  });

  // If new image, delete old one from Cloudinary
  if (profile_photo && staff.profile_photo) {
    const publicId = staff.profile_photo.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(publicId);
  }

  // Update Staff
  const updatedStaff = await prisma.staff.update({
    where: { id: parseInt(id) },
    data: {
      branchId: parseInt(branchId),
      roleId: parseInt(roleId),
      gender,
      dob: dob ? new Date(dob) : null,
      phone,
      profile_photo,
      status,
      join_date: new Date(join_date),
      exit_date: exit_date ? new Date(exit_date) : null,
      salary_type,
      hourly_rate: hourly_rate ? parseFloat(hourly_rate) : null,
      fixed_salary: fixed_salary ? parseFloat(fixed_salary) : null,
      commission_rate_percent: parseFloat(commission_rate_percent) || 0,
      login_enabled: login_enabled === 'true' || login_enabled === true,
      username,
      password: hashedPassword,
    },
    select: {
      id: true,
      staff_id: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      gender: true,
      dob: true,
      phone: true,
      profile_photo: true,
      status: true,
      role: {
        select: {
          id: true,
          name: true,
        },
      },
      branch: {
        select: {
          id: true,
          name: true,
        },
      },
      join_date: true,
      exit_date: true,
      salary_type: true,
      hourly_rate: true,
      fixed_salary: true,
      commission_rate_percent: true,
      login_enabled: true,
      username: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Flatten the user data for consistency
  return {
    id: updatedStaff.id,
    staff_id: updatedStaff.staff_id,
    first_name: updatedStaff.user.firstName,
    last_name: updatedStaff.user.lastName,
    email: updatedStaff.user.email,
    gender: updatedStaff.gender,
    dob: updatedStaff.dob,
    phone: updatedStaff.phone,
    profile_photo: updatedStaff.profile_photo,
    status: updatedStaff.status,
    role: updatedStaff.role,
    branch: updatedStaff.branch,
    join_date: updatedStaff.join_date,
    exit_date: updatedStaff.exit_date,
    salary_type: updatedStaff.salary_type,
    hourly_rate: updatedStaff.hourly_rate,
    fixed_salary: updatedStaff.fixed_salary,
    commission_rate_percent: updatedStaff.commission_rate_percent,
    login_enabled: updatedStaff.login_enabled,
    username: updatedStaff.username,
    createdAt: updatedStaff.createdAt,
    updatedAt: updatedStaff.updatedAt,
  };
};

const deleteStaff = async (id) => {
  const staff = await prisma.staff.findUnique({
    where: { id: parseInt(id) },
    include: { user: true },
  });

  if (!staff) {
    throw new Error('Staff not found');
  }

  // Delete profile photo from Cloudinary if exists
  if (staff.profile_photo) {
    const publicId = staff.profile_photo.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(publicId);
  }

  // Delete Staff (this will cascade to User if configured, but let's delete manually)
  await prisma.staff.delete({ where: { id: parseInt(id) } });
  await prisma.user.delete({ where: { id: staff.userId } });
};

const getStaffByBranch = async (branchId) => {
  const staffList = await prisma.staff.findMany({
    where: { branchId: parseInt(branchId) },
    select: {
      id: true,
      staff_id: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      gender: true,
      dob: true,
      phone: true,
      profile_photo: true,
      status: true,
      role: {
        select: {
          id: true,
          name: true,
        },
      },
      branch: {
        select: {
          id: true,
          name: true,
        },
      },
      join_date: true,
      exit_date: true,
      salary_type: true,
      hourly_rate: true,
      fixed_salary: true,
      commission_rate_percent: true,
      login_enabled: true,
      username: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Flatten the user data for consistency
  return staffList.map(staff => ({
    id: staff.id,
    staff_id: staff.staff_id,
    firstName: staff.user.firstName,
    lastName: staff.user.lastName,
    email: staff.user.email,
    gender: staff.gender,
    dob: staff.dob,
    phone: staff.phone,
    profile_photo: staff.profile_photo,
    status: staff.status,
    role: staff.role,
    branch: staff.branch,
    join_date: staff.join_date,
    exit_date: staff.exit_date,
    salary_type: staff.salary_type,
    hourly_rate: staff.hourly_rate,
    fixed_salary: staff.fixed_salary,
    commission_rate_percent: staff.commission_rate_percent,
    login_enabled: staff.login_enabled,
    username: staff.username,
    createdAt: staff.createdAt,
    updatedAt: staff.updatedAt,
  }));
};

module.exports = {
  getAllStaff,
  getStaffByBranch,
  createStaff,
  updateStaff,
  deleteStaff,
};
