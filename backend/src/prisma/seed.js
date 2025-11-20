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
      role: 'superadmin',
    },
  });

  // Create branches
  const branch1 = await prisma.branch.upsert({
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

  const branch2 = await prisma.branch.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Downtown Branch',
      code: 'DOWN002',
      address: '456 Downtown Ave',
      hours: { open: '05:30', close: '21:00' },
      adminId: superadmin.id,
    },
  });

  const branch3 = await prisma.branch.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: 'Uptown Branch',
      code: 'UP003',
      address: '789 Uptown Blvd',
      hours: { open: '06:30', close: '22:30' },
      adminId: superadmin.id,
    },
  });

  const branch4 = await prisma.branch.upsert({
    where: { id: 4 },
    update: {},
    create: {
      name: 'Suburban Branch',
      code: 'SUB004',
      address: '101 Suburban Rd',
      hours: { open: '07:00', close: '23:00' },
      adminId: superadmin.id,
    },
  });

  // Use branch1 for existing users and data
  const branch = branch1;

  // Create admin for Main Branch
  const admin = await prisma.user.upsert({
    where: { email: 'admin@fit.com' },
    update: {},
    create: {
      firstName: 'Branch',
      lastName: 'Admin',
      email: 'admin@fit.com',
      password: adminPassword,
      role: 'admin',
      branchId: branch1.id,
    },
  });

  // Create admin for Downtown Branch
  const admin2 = await prisma.user.upsert({
    where: { email: 'admin2@fit.com' },
    update: {},
    create: {
      firstName: 'Downtown',
      lastName: 'Admin',
      email: 'admin2@fit.com',
      password: adminPassword,
      role: 'admin',
      branchId: branch2.id,
    },
  });

  // Create admin for Uptown Branch
  const admin3 = await prisma.user.upsert({
    where: { email: 'admin3@fit.com' },
    update: {},
    create: {
      firstName: 'Uptown',
      lastName: 'Admin',
      email: 'admin3@fit.com',
      password: adminPassword,
      role: 'admin',
      branchId: branch3.id,
    },
  });

  // Create admin for Suburban Branch
  const admin4 = await prisma.user.upsert({
    where: { email: 'admin4@fit.com' },
    update: {},
    create: {
      firstName: 'Suburban',
      lastName: 'Admin',
      email: 'admin4@fit.com',
      password: adminPassword,
      role: 'admin',
      branchId: branch4.id,
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
      role: 'generaltrainer',
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
      role: 'personaltrainer',
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
      role: 'member',
      branchId: branch.id,
      memberId: 'M10001',
      gender: 'Male',
      dob: new Date('1990-01-01'),
      phone: '+61412345678',
      address: '123 Member St',
      city: 'Sydney',
      state: 'NSW',
      joiningDate: new Date('2023-01-01'),
      expireDate: new Date('2024-01-01'),
      memberType: 'Member',
      memberStatus: 'Active',
      membershipStatus: 'Activated',
      username: 'member',
      loginEnabled: true,
      weight: 75.5,
      height: 175.0,
      chest: 95.0,
      waist: 80.0,
      thigh: 60.0,
      arms: 35.0,
      fat: 15.0,
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
      role: 'housekeeping',
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
      role: 'receptionist',
      branchId: branch.id,
    },
  });

  // Create additional member for demo groups
  const member2 = await prisma.user.upsert({
    where: { email: 'member2@fit.com' },
    update: {},
    create: {
      firstName: 'Another',
      lastName: 'Member',
      email: 'member2@fit.com',
      password: memberPassword,
      role: 'member',
      branchId: branch.id,
    },
  });

  // Create members for personal training demo
  const johnDoe = await prisma.user.upsert({
    where: { email: 'john_doe@fit.com' },
    update: {},
    create: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john_doe@fit.com',
      password: memberPassword,
      role: 'member',
      branchId: branch.id,
      username: 'john_doe',
    },
  });

  const mikeWilliams = await prisma.user.upsert({
    where: { email: 'mike_w@fit.com' },
    update: {},
    create: {
      firstName: 'Mike',
      lastName: 'Williams',
      email: 'mike_w@fit.com',
      password: memberPassword,
      role: 'member',
      branchId: branch.id,
      username: 'mike_w',
    },
  });

  const guestUser = await prisma.user.upsert({
    where: { email: 'guest_user@fit.com' },
    update: {},
    create: {
      firstName: 'Guest',
      lastName: 'User',
      email: 'guest_user@fit.com',
      password: memberPassword,
      role: 'member',
      branchId: branch.id,
      username: 'guest_user',
    },
  });

  // Create personal trainers for demo
  const johnSmith = await prisma.user.upsert({
    where: { email: 'john_smith@fit.com' },
    update: {},
    create: {
      firstName: 'John',
      lastName: 'Smith',
      email: 'john_smith@fit.com',
      password: personalTrainerPassword,
      role: 'personaltrainer',
      branchId: branch.id,
    },
  });

  const mikeWilliamsTrainer = await prisma.user.upsert({
    where: { email: 'mike_williams_trainer@fit.com' },
    update: {},
    create: {
      firstName: 'Mike',
      lastName: 'Williams',
      email: 'mike_williams_trainer@fit.com',
      password: personalTrainerPassword,
      role: 'personaltrainer',
      branchId: branch.id,
    },
  });

  // Create sample groups
  const beginnersGroup = await prisma.group.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Beginners Group',
      branchId: branch.id,
    },
  });

  const advancedGroup = await prisma.group.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Advanced Group',
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

  // Member entry not needed as member is just a role in User model

  // Create gym plans (group and personal training)
  const starterGroupPlan = await prisma.plan.upsert({
    where: { id: 1 },
    update: {},
    create: {
      plan_name: 'Starter Pack',
      duration_days: 30,
      price_cents: 249900, // ₹2,499
      currency: 'INR',
      status: 'Active',
      adminId: superadmin.id,
      branchId: branch.id,
    },
  });

  const proGroupPlan = await prisma.plan.upsert({
    where: { id: 2 },
    update: {},
    create: {
      plan_name: 'Pro Pack',
      duration_days: 60,
      price_cents: 449900, // ₹4,499
      currency: 'INR',
      status: 'Active',
      adminId: superadmin.id,
      branchId: branch.id,
    },
  });

  const unlimitedGroupPlan = await prisma.plan.upsert({
    where: { id: 3 },
    update: {},
    create: {
      plan_name: 'Unlimited',
      duration_days: 90,
      price_cents: 799900, // ₹7,999
      currency: 'INR',
      status: 'Active',
      adminId: superadmin.id,
      branchId: branch.id,
    },
  });

  const basicPersonalPlan = await prisma.plan.upsert({
    where: { id: 4 },
    update: {},
    create: {
      plan_name: 'Basic 1:1',
      duration_days: 30,
      price_cents: 499900, // ₹4,999
      currency: 'INR',
      status: 'Active',
      adminId: superadmin.id,
      branchId: branch.id,
    },
  });

  const advancedPersonalPlan = await prisma.plan.upsert({
    where: { id: 5 },
    update: {},
    create: {
      plan_name: 'Advanced 1:1',
      duration_days: 60,
      price_cents: 899900, // ₹8,999
      currency: 'INR',
      status: 'Active',
      adminId: superadmin.id,
      branchId: branch.id,
    },
  });

  const elitePersonalPlan = await prisma.plan.upsert({
    where: { id: 6 },
    update: {},
    create: {
      plan_name: 'Elite 1:1',
      duration_days: 90,
      price_cents: 1499900, // ₹14,999
      currency: 'INR',
      status: 'Active',
      adminId: superadmin.id,
      branchId: branch.id,
    },
  });

  // Create plans matching frontend expectations
  const basicPlan = await prisma.plan.upsert({
    where: { id: 7 },
    update: {},
    create: {
      plan_name: 'Basic',
      duration_days: 30,
      price_cents: 29900, // ₹299
      currency: 'INR',
      status: 'Active',
      adminId: superadmin.id,
      branchId: branch.id,
    },
  });

  const goldPlan = await prisma.plan.upsert({
    where: { id: 8 },
    update: {},
    create: {
      plan_name: 'Gold',
      duration_days: 60,
      price_cents: 59900, // ₹599
      currency: 'INR',
      status: 'Active',
      adminId: superadmin.id,
      branchId: branch.id,
    },
  });

  const premiumPlan = await prisma.plan.upsert({
    where: { id: 9 },
    update: {},
    create: {
      plan_name: 'Premium',
      duration_days: 90,
      price_cents: 99900, // ₹999
      currency: 'INR',
      status: 'Active',
      adminId: superadmin.id,
      branchId: branch.id,
    },
  });

  // Create sample booking requests
  const booking1 = await prisma.planBooking.upsert({
    where: { id: 1 },
    update: {},
    create: {
      memberId: member.id,
      planId: proGroupPlan.id,
      requestedAt: new Date('2025-05-20T10:30:00Z'),
      status: 'pending',
      sessionsUsed: 1,
      note: 'Interested in group training sessions',
    },
  });

  const booking2 = await prisma.planBooking.upsert({
    where: { id: 2 },
    update: {},
    create: {
      memberId: member.id,
      planId: advancedPersonalPlan.id,
      requestedAt: new Date('2025-05-20T11:15:00Z'),
      status: 'approved',
      sessionsUsed: 1,
      note: 'Looking for personal training',
    },
  });

  const booking3 = await prisma.planBooking.upsert({
    where: { id: 3 },
    update: {},
    create: {
      memberId: member.id,
      planId: starterGroupPlan.id,
      requestedAt: new Date('2025-05-19T15:45:00Z'),
      status: 'rejected',
      sessionsUsed: 1,
      note: 'Basic group plan request',
    },
  });

  const booking4 = await prisma.planBooking.upsert({
    where: { id: 4 },
    update: {},
    create: {
      memberId: member.id,
      planId: elitePersonalPlan.id,
      requestedAt: new Date('2025-05-21T09:00:00Z'),
      status: 'pending',
      sessionsUsed: 1,
      note: 'Premium personal training package',
    },
  });

  // Create active member plan for approved booking
  const memberPlan = await prisma.memberPlan.upsert({
    where: { id: 1 },
    update: {},
    create: {
      memberId: member.id,
      planId: advancedPersonalPlan.id,
      startDate: new Date(),
      expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      remainingSessions: 11, // 12 - 1 used
    },
  });

  // Create branch-specific plans for Main Branch
  const mainBranchStarterGroupPlan = await prisma.branchPlan.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Main Branch Starter Pack',
      type: 'group',
      sessions: 8,
      validity: 30,
      priceCents: 249900, // ₹2,499
      currency: 'INR',
      active: true,
      branchId: branch1.id,
      createdById: admin.id,
    },
  });

  const mainBranchProGroupPlan = await prisma.branchPlan.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Main Branch Pro Pack',
      type: 'group',
      sessions: 16,
      validity: 60,
      priceCents: 449900, // ₹4,499
      currency: 'INR',
      active: true,
      branchId: branch1.id,
      createdById: admin.id,
    },
  });

  const mainBranchBasicPersonalPlan = await prisma.branchPlan.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: 'Main Branch Basic 1:1',
      type: 'personal',
      sessions: 6,
      validity: 30,
      priceCents: 499900, // ₹4,999
      currency: 'INR',
      active: true,
      branchId: branch1.id,
      createdById: admin.id,
    },
  });

  const mainBranchElitePersonalPlan = await prisma.branchPlan.upsert({
    where: { id: 4 },
    update: {},
    create: {
      name: 'Main Branch Elite 1:1',
      type: 'personal',
      sessions: 20,
      validity: 90,
      priceCents: 1499900, // ₹14,999
      currency: 'INR',
      active: true,
      branchId: branch1.id,
      createdById: admin.id,
    },
  });

  // Create branch plans for Downtown Branch
  const downtownGroupPlan = await prisma.branchPlan.upsert({
    where: { id: 5 },
    update: {},
    create: {
      name: 'Downtown Group Fitness',
      type: 'group',
      sessions: 12,
      validity: 45,
      priceCents: 349900, // ₹3,499
      currency: 'INR',
      active: true,
      branchId: branch2.id,
      createdById: admin2.id,
    },
  });

  const downtownPersonalPlan = await prisma.branchPlan.upsert({
    where: { id: 6 },
    update: {},
    create: {
      name: 'Downtown Personal Training',
      type: 'personal',
      sessions: 10,
      validity: 45,
      priceCents: 699900, // ₹6,999
      currency: 'INR',
      active: true,
      branchId: branch2.id,
      createdById: admin2.id,
    },
  });

  // Create branch plans for Uptown Branch
  const uptownGroupPlan = await prisma.branchPlan.upsert({
    where: { id: 7 },
    update: {},
    create: {
      name: 'Uptown Wellness Group',
      type: 'group',
      sessions: 20,
      validity: 75,
      priceCents: 599900, // ₹5,999
      currency: 'INR',
      active: true,
      branchId: branch3.id,
      createdById: admin3.id,
    },
  });

  const uptownPersonalPlan = await prisma.branchPlan.upsert({
    where: { id: 8 },
    update: {},
    create: {
      name: 'Uptown Premium Personal',
      type: 'personal',
      sessions: 15,
      validity: 75,
      priceCents: 1199900, // ₹11,999
      currency: 'INR',
      active: true,
      branchId: branch3.id,
      createdById: admin3.id,
    },
  });

  // Create branch plans for Suburban Branch
  const suburbanGroupPlan = await prisma.branchPlan.upsert({
    where: { id: 9 },
    update: {},
    create: {
      name: 'Suburban Family Fitness',
      type: 'group',
      sessions: 25,
      validity: 90,
      priceCents: 749900, // ₹7,499
      currency: 'INR',
      active: true,
      branchId: branch4.id,
      createdById: admin4.id,
    },
  });

  const suburbanPersonalPlan = await prisma.branchPlan.upsert({
    where: { id: 10 },
    update: {},
    create: {
      name: 'Suburban Personal Coaching',
      type: 'personal',
      sessions: 18,
      validity: 90,
      priceCents: 1349900, // ₹13,499
      currency: 'INR',
      active: true,
      branchId: branch4.id,
      createdById: admin4.id,
    },
  });

  // Create sample branch plan booking requests
  const branchBooking1 = await prisma.branchPlanBooking.upsert({
    where: { id: 1 },
    update: {},
    create: {
      memberId: member.id,
      branchPlanId: mainBranchProGroupPlan.id,
      requestedAt: new Date('2025-01-20T10:30:00Z'),
      status: 'pending',
      sessionsUsed: 0,
      note: 'Interested in main branch group training',
    },
  });

  const branchBooking2 = await prisma.branchPlanBooking.upsert({
    where: { id: 2 },
    update: {},
    create: {
      memberId: member.id,
      branchPlanId: mainBranchElitePersonalPlan.id,
      requestedAt: new Date('2025-01-20T11:15:00Z'),
      status: 'approved',
      sessionsUsed: 2,
      note: 'Premium personal training request',
    },
  });

  const branchBooking3 = await prisma.branchPlanBooking.upsert({
    where: { id: 3 },
    update: {},
    create: {
      memberId: member.id,
      branchPlanId: mainBranchStarterGroupPlan.id,
      requestedAt: new Date('2025-01-19T15:45:00Z'),
      status: 'rejected',
      sessionsUsed: 0,
      note: 'Basic starter plan request',
    },
  });

  const branchBooking4 = await prisma.branchPlanBooking.upsert({
    where: { id: 4 },
    update: {},
    create: {
      memberId: member2.id,
      branchPlanId: downtownGroupPlan.id,
      requestedAt: new Date('2025-01-21T09:00:00Z'),
      status: 'pending',
      sessionsUsed: 0,
      note: 'Downtown branch group fitness',
    },
  });

  const branchBooking5 = await prisma.branchPlanBooking.upsert({
    where: { id: 5 },
    update: {},
    create: {
      memberId: member2.id,
      branchPlanId: uptownPersonalPlan.id,
      requestedAt: new Date('2025-01-22T14:20:00Z'),
      status: 'approved',
      sessionsUsed: 1,
      note: 'Premium uptown personal training',
    },
  });

  // Create active member branch plans for approved bookings
  const memberBranchPlan1 = await prisma.memberBranchPlan.upsert({
    where: { id: 1 },
    update: {},
    create: {
      memberId: member.id,
      branchPlanId: mainBranchElitePersonalPlan.id,
      startDate: new Date(),
      expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      remainingSessions: 18, // 20 - 2 used
    },
  });

  const memberBranchPlan2 = await prisma.memberBranchPlan.upsert({
    where: { id: 2 },
    update: {},
    create: {
      memberId: member2.id,
      branchPlanId: uptownPersonalPlan.id,
      startDate: new Date(),
      expiryDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000), // 75 days from now
      remainingSessions: 14, // 15 - 1 used
    },
  });

  // Create sample classes
  const yogaClass = await prisma.classSchedule.upsert({
    where: { id: 1 },
    update: {},
    create: {
      class_name: 'Morning Yoga',
      trainer_id: generalTrainer.id,
      date: new Date('2024-01-15'),
      time: '07:00 - 08:00',
      schedule_day: ['Monday', 'Wednesday', 'Friday'],
      total_sheets: 20,
      status: 'Active',
      branchId: branch.id,
      adminId: admin.id,
    },
  });

  const cardioClass = await prisma.classSchedule.upsert({
    where: { id: 2 },
    update: {},
    create: {
      class_name: 'HIIT Cardio',
      trainer_id: personalTrainer.id,
      date: new Date('2024-01-16'),
      time: '18:00 - 19:00',
      schedule_day: ['Tuesday', 'Thursday'],
      total_sheets: 15,
      status: 'Active',
      branchId: branch.id,
      adminId: admin.id,
    },
  });

  const strengthClass = await prisma.classSchedule.upsert({
    where: { id: 3 },
    update: {},
    create: {
      class_name: 'Strength Training',
      trainer_id: generalTrainer.id,
      date: new Date('2024-01-17'),
      time: '10:00 - 11:30',
      schedule_day: ['Saturday'],
      total_sheets: 12,
      status: 'Active',
      branchId: branch.id,
      adminId: admin.id,
    },
  });

  // Create personal training sessions for demo
  const session1 = await prisma.personalTrainingSession.upsert({
    where: { id: 1 },
    update: {},
    create: {
      trainerId: johnSmith.id,
      memberId: johnDoe.id,
      branchId: branch.id,
      date: new Date('2023-06-20'),
      time: '10:00 - 11:00',
      duration: 60,
      status: 'Booked',
      type: 'Strength Training',
      price: 5000, // $50 in cents
      paymentStatus: 'Paid',
      location: 'Gym Floor',
      createdById: admin.id,
    },
  });

  const session2 = await prisma.personalTrainingSession.upsert({
    where: { id: 2 },
    update: {},
    create: {
      trainerId: mikeWilliamsTrainer.id,
      memberId: mikeWilliams.id,
      branchId: branch.id,
      date: new Date('2023-06-22'),
      time: '14:00 - 15:00',
      duration: 60,
      status: 'Booked',
      type: 'Cardio & HIIT',
      price: 6000, // $60 in cents
      paymentStatus: 'Paid',
      location: 'Gym Floor',
      createdById: admin.id,
    },
  });

  const session3 = await prisma.personalTrainingSession.upsert({
    where: { id: 3 },
    update: {},
    create: {
      trainerId: mikeWilliamsTrainer.id,
      memberId: mikeWilliams.id,
      branchId: branch.id,
      date: new Date('2025-09-18'),
      time: '23:34 - 03:04',
      duration: 90,
      status: 'Booked',
      type: 'Cardio & HIIT',
      price: 7000, // $70 in cents
      paymentStatus: 'Paid',
      location: 'Gym Floor',
      createdById: admin.id,
    },
  });

  const session4 = await prisma.personalTrainingSession.upsert({
    where: { id: 4 },
    update: {},
    create: {
      trainerId: personalTrainer.id, // Using existing personal trainer as "Unknown"
      memberId: guestUser.id,
      branchId: branch.id,
      date: new Date(), // Current date since no date specified
      time: '', // Empty time
      duration: 60,
      status: 'Booked',
      type: '', // Empty type
      price: null, // No price
      paymentStatus: 'Paid',
      location: 'Gym Floor',
      createdById: admin.id,
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
