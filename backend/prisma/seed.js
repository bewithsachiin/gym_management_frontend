const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Hash passwords
  const superadminPassword = await bcrypt.hash('superadmin123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);
  const generalTrainerPassword = await bcrypt.hash('trainer123', 10);
  const personalTrainerPassword = await bcrypt.hash('ptrainer123', 10);
  const memberPassword = await bcrypt.hash('member123', 10);
  const housekeepingPassword = await bcrypt.hash('house123', 10);
  const receptionistPassword = await bcrypt.hash('reception123', 10);

  // Create superadmin
  const superadmin = await prisma.user.upsert({
    where: { email: 'superadmin@fit.com' },
    update: {},
    create: {
      firstName: 'Super',
      lastName: 'Admin',
      email: 'superadmin@fit.com',
      password: superadminPassword,
      role: 'SUPERADMIN',
    },
  });

  // Create a branch
  const branch = await prisma.branch.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Main Branch',
      code: 'MAIN001',
      address: '123 Main St',
      hours: { open: '06:00', close: '22:00' },
      adminId: superadmin.id,
    },
  });

  // Create admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@fit.com' },
    update: {},
    create: {
      firstName: 'Branch',
      lastName: 'Admin',
      email: 'admin@fit.com',
      password: adminPassword,
      role: 'ADMIN',
      branchId: branch.id,
    },
  });

  // Create general trainer
  const generalTrainer = await prisma.user.upsert({
    where: { email: 'trainer@fit.com' },
    update: {},
    create: {
      firstName: 'General',
      lastName: 'Trainer',
      email: 'trainer@fit.com',
      password: generalTrainerPassword,
      role: 'GENERALTRAINER',
      branchId: branch.id,
    },
  });

  // Create personal trainer
  const personalTrainer = await prisma.user.upsert({
    where: { email: 'ptrainer@fit.com' },
    update: {},
    create: {
      firstName: 'Personal',
      lastName: 'Trainer',
      email: 'ptrainer@fit.com',
      password: personalTrainerPassword,
      role: 'PERSONALTRAINER',
      branchId: branch.id,
    },
  });

  // Create member
  const member = await prisma.user.upsert({
    where: { email: 'member@fit.com' },
    update: {},
    create: {
      firstName: 'Gym',
      lastName: 'Member',
      email: 'member@fit.com',
      password: memberPassword,
      role: 'MEMBER',
      branchId: branch.id,
    },
  });

  // Create housekeeping
  const housekeeping = await prisma.user.upsert({
    where: { email: 'house@fit.com' },
    update: {},
    create: {
      firstName: 'House',
      lastName: 'Keeping',
      email: 'house@fit.com',
      password: housekeepingPassword,
      role: 'HOUSEKEEPING',
      branchId: branch.id,
    },
  });

  // Create receptionist
  const receptionist = await prisma.user.upsert({
    where: { email: 'reception@fit.com' },
    update: {},
    create: {
      firstName: 'Front',
      lastName: 'Desk',
      email: 'reception@fit.com',
      password: receptionistPassword,
      role: 'RECEPTIONIST',
      branchId: branch.id,
    },
  });

  // Create staff roles first
  const adminRole = await prisma.staffRole.upsert({
    where: { name: 'Admin' },
    update: {},
    create: {
      name: 'Admin',
      description: 'Branch Administrator',
    },
  });

  const trainerRole = await prisma.staffRole.upsert({
    where: { name: 'Trainer' },
    update: {},
    create: {
      name: 'Trainer',
      description: 'General Trainer',
    },
  });

  const personalTrainerRole = await prisma.staffRole.upsert({
    where: { name: 'Personal Trainer' },
    update: {},
    create: {
      name: 'Personal Trainer',
      description: 'Personal Trainer',
    },
  });

  const housekeepingRole = await prisma.staffRole.upsert({
    where: { name: 'Housekeeping' },
    update: {},
    create: {
      name: 'Housekeeping',
      description: 'Housekeeping Staff',
    },
  });

  const receptionistRole = await prisma.staffRole.upsert({
    where: { name: 'Receptionist' },
    update: {},
    create: {
      name: 'Receptionist',
      description: 'Receptionist',
    },
  });

  // Create staff entries
  await prisma.staff.upsert({
    where: { userId: generalTrainer.id },
    update: {},
    create: {
      userId: generalTrainer.id,
      branchId: branch.id,
      roleId: trainerRole.id,
      staff_id: 'STAFF001',
      gender: 'Male',
      dob: new Date('1985-03-15'),
      phone: '+1 555-123-4567',
      status: 'Active',
      join_date: new Date('2020-01-15'),
      salary_type: 'Hourly',
      hourly_rate: 35,
      commission_rate_percent: 15,
      login_enabled: true,
      username: 'trainer',
      password: generalTrainerPassword,
      createdById: superadmin.id, // Created by superadmin
    },
  });

  await prisma.staff.upsert({
    where: { userId: personalTrainer.id },
    update: {},
    create: {
      userId: personalTrainer.id,
      branchId: branch.id,
      roleId: personalTrainerRole.id,
      staff_id: 'STAFF002',
      gender: 'Female',
      dob: new Date('1990-07-22'),
      phone: '+1 555-987-6543',
      status: 'Active',
      join_date: new Date('2021-03-10'),
      salary_type: 'Fixed',
      fixed_salary: 60000,
      commission_rate_percent: 0,
      login_enabled: true,
      username: 'ptrainer',
      password: personalTrainerPassword,
      createdById: superadmin.id, // Created by superadmin
    },
  });

  await prisma.staff.upsert({
    where: { userId: housekeeping.id },
    update: {},
    create: {
      userId: housekeeping.id,
      branchId: branch.id,
      roleId: housekeepingRole.id,
      staff_id: 'STAFF003',
      gender: 'Male',
      dob: new Date('1988-11-05'),
      phone: '+1 555-456-7890',
      status: 'Inactive',
      join_date: new Date('2019-08-01'),
      exit_date: new Date('2025-01-31'),
      salary_type: 'Fixed',
      fixed_salary: 35000,
      commission_rate_percent: 0,
      login_enabled: false,
      username: 'house',
      password: housekeepingPassword,
      createdById: admin.id, // Created by admin
    },
  });

  await prisma.staff.upsert({
    where: { userId: receptionist.id },
    update: {},
    create: {
      userId: receptionist.id,
      branchId: branch.id,
      roleId: receptionistRole.id,
      staff_id: 'STAFF004',
      gender: 'Female',
      dob: new Date('1992-05-10'),
      phone: '+1 555-234-5678',
      status: 'Active',
      join_date: new Date('2022-02-01'),
      salary_type: 'Fixed',
      fixed_salary: 40000,
      commission_rate_percent: 0,
      login_enabled: true,
      username: 'reception',
      password: receptionistPassword,
      createdById: receptionist.id, // Created by receptionist (self-created for demo)
    },
  });

  // Create member entry
  await prisma.member.upsert({
    where: { userId: member.id },
    update: {},
    create: {
      userId: member.id,
      branchId: branch.id,
    },
  });

  // Create membership plans
  const basicPlan = await prisma.membershipPlan.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Basic Monthly',
      description: 'Access to gym floor and cardio machines only.',
      durationDays: 30,
      priceCents: 15000, // ₹150
      currency: 'INR',
      features: ['Cardio Access', 'Locker Room'],
      status: 'Active',
    },
  });

  const premiumPlan = await prisma.membershipPlan.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Premium Annual',
      description: 'Full access including group classes, sauna, and personal training.',
      durationDays: 365,
      priceCents: 120000, // ₹1200
      currency: 'INR',
      features: ['Sauna', 'Group Classes', 'Personal Training', 'Locker Room'],
      status: 'Active',
    },
  });

  const studentPlan = await prisma.membershipPlan.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: 'Student Plan',
      description: 'Discounted access for students during off-peak hours.',
      durationDays: 90,
      priceCents: 30000, // ₹300
      currency: 'INR',
      features: ['Cardio Access', 'Group Classes'],
      status: 'Inactive',
    },
  });

  console.log('Seeding completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
