const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data to avoid unique constraint errors
  console.log('Clearing existing data...');
  try {
    // Delete in order to handle foreign key constraints
    await prisma.membership.deleteMany();
    await prisma.personalTrainingSession.deleteMany();
    await prisma.classSchedule.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.walkIn.deleteMany();
    await prisma.memberAttendance.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.qrCheck.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.dutyRoster.deleteMany();
    await prisma.salary.deleteMany();
    await prisma.generalTrainerDashboard.deleteMany();
    await prisma.receptionistBooking.deleteMany();
    await prisma.memberFeedback.deleteMany();
    await prisma.branchSettings.deleteMany();
    await prisma.group.deleteMany();
    await prisma.planBooking.deleteMany();
    await prisma.memberPlan.deleteMany();
    await prisma.memberBranchPlan.deleteMany();
    await prisma.branchPlan.deleteMany();
    await prisma.plan.deleteMany();
    await prisma.staff.deleteMany();
    await prisma.staffRole.deleteMany();
    await prisma.branch.deleteMany();
    await prisma.user.deleteMany();
    console.log('Data cleared successfully.');
  } catch (error) {
    console.log('Error clearing data:', error.message);
    console.log('Attempting to reset database...');
    // If clearing fails, try to reset the database completely
    try {
      await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`;
      await prisma.$executeRaw`TRUNCATE TABLE membership;`;
      await prisma.$executeRaw`TRUNCATE TABLE personalTrainingSession;`;
      await prisma.$executeRaw`TRUNCATE TABLE classSchedule;`;
      await prisma.$executeRaw`TRUNCATE TABLE payment;`;
      await prisma.$executeRaw`TRUNCATE TABLE walkIn;`;
      await prisma.$executeRaw`TRUNCATE TABLE memberAttendance;`;
      await prisma.$executeRaw`TRUNCATE TABLE attendance;`;
      await prisma.$executeRaw`TRUNCATE TABLE qrCheck;`;
      await prisma.$executeRaw`TRUNCATE TABLE auditLog;`;
      await prisma.$executeRaw`TRUNCATE TABLE dutyRoster;`;
      await prisma.$executeRaw`TRUNCATE TABLE salary;`;
      await prisma.$executeRaw`TRUNCATE TABLE generalTrainerDashboard;`;
      await prisma.$executeRaw`TRUNCATE TABLE receptionistBooking;`;
      await prisma.$executeRaw`TRUNCATE TABLE memberFeedback;`;
      await prisma.$executeRaw`TRUNCATE TABLE branchSettings;`;
      await prisma.$executeRaw`TRUNCATE TABLE \`group\`;`;
      await prisma.$executeRaw`TRUNCATE TABLE planBooking;`;
      await prisma.$executeRaw`TRUNCATE TABLE memberPlan;`;
      await prisma.$executeRaw`TRUNCATE TABLE memberBranchPlan;`;
      await prisma.$executeRaw`TRUNCATE TABLE branchPlan;`;
      await prisma.$executeRaw`TRUNCATE TABLE plan;`;
      await prisma.$executeRaw`TRUNCATE TABLE staff;`;
      await prisma.$executeRaw`TRUNCATE TABLE staffRole;`;
      await prisma.$executeRaw`TRUNCATE TABLE branch;`;
      await prisma.$executeRaw`TRUNCATE TABLE user;`;
      await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`;
      console.log('Database reset successfully.');
    } catch (resetError) {
      console.log('Reset failed, continuing anyway:', resetError.message);
    }
  }

  // Seed StaffRole data first
  const staffRoles = [
    {
      name: 'Admin',
      description: 'Full administrative access to manage all aspects of the gym',
      permissions: {
        canManageClasses: true,
        canViewMembers: true,
        canTakeAttendance: true,
        canManageGroups: true,
        canManageStaff: true,
        canViewReports: true,
        canManagePayments: true,
        canManageBranches: true,
        canManagePlans: true,
        canApproveSalaries: true,
      },
      status: 'Active',
    },
    {
      name: 'General Trainer',
      description: 'Responsible for conducting group fitness classes and training sessions',
      permissions: {
        canManageClasses: true,
        canViewMembers: true,
        canTakeAttendance: true,
        canManageGroups: false,
        canManageStaff: false,
        canViewReports: true,
        canManagePayments: false,
      },
      status: 'Active',
    },
    {
      name: 'Personal Trainer',
      description: 'Provides one-on-one personal training sessions',
      permissions: {
        canManageClasses: false,
        canViewMembers: true,
        canTakeAttendance: true,
        canManageGroups: false,
        canManageStaff: false,
        canViewReports: true,
        canManagePayments: false,
      },
      status: 'Active',
    },
    {
      name: 'Housekeeping',
      description: 'Maintains gym cleanliness and equipment',
      permissions: {
        canManageClasses: false,
        canViewMembers: false,
        canTakeAttendance: true,
        canManageGroups: false,
        canManageStaff: false,
        canViewReports: false,
        canManagePayments: false,
      },
      status: 'Active',
    },
    {
      name: 'Receptionist',
      description: 'Handles front desk operations, member check-ins, and bookings',
      permissions: {
        canManageClasses: false,
        canViewMembers: true,
        canTakeAttendance: true,
        canManageGroups: false,
        canManageStaff: false,
        canViewReports: false,
        canManagePayments: true,
        canManageBookings: true,
      },
      status: 'Active',
    },
    {
      name: 'Manager',
      description: 'Oversees branch operations and staff management',
      permissions: {
        canManageClasses: true,
        canViewMembers: true,
        canTakeAttendance: true,
        canManageGroups: true,
        canManageStaff: true,
        canViewReports: true,
        canManagePayments: true,
        canApproveSalaries: true,
      },
      status: 'Active',
    },
  ];

  const createdStaffRoles = [];
  for (const role of staffRoles) {
    const createdRole = await prisma.staffRole.create({
      data: role,
    });
    createdStaffRoles.push(createdRole);
  }

  // Seed User data (create admins first)
  // Hash passwords for different roles
  const superAdminPassword = await bcrypt.hash('superadmin123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);
  const trainerPassword = await bcrypt.hash('trainer123', 10);
  const ptPassword = await bcrypt.hash('ptrainer123', 10);
  const memberPassword = await bcrypt.hash('member123', 10);
  const housekeepingPassword = await bcrypt.hash('house123', 10);
  const receptionistPassword = await bcrypt.hash('reception123', 10);
  const managerPassword = await bcrypt.hash('manager123', 10);

  // Create superadmin
  const superAdmin = await prisma.user.create({
    data: {
      firstName: 'Super',
      lastName: 'Admin',
      email: 'superadmin@fit.com',
      password: superAdminPassword,
      role: 'superadmin',
      branchId: null, // Superadmin can access all branches
    },
  });

  // Create branch admin (temporarily with branchId: null)
  const branchAdmin = await prisma.user.create({
    data: {
      firstName: 'Branch',
      lastName: 'Admin',
      email: 'admin@fit.com',
      password: adminPassword,
      role: 'admin',
      branchId: null,
    },
  });

  // Seed Branch data
  const branches = [
    {
      name: 'Main Branch',
      code: 'MAIN001',
      address: '123 Main St, City, State',
      phone: '123-456-7890',
      email: 'main@gym.com',
      status: 'ACTIVE',
      hours: { open: '06:00', close: '22:00' },
      adminId: branchAdmin.id,
    },
    {
      name: 'Downtown Branch',
      code: 'DOWN002',
      address: '456 Downtown Ave, City, State',
      phone: '987-654-3210',
      email: 'downtown@gym.com',
      status: 'ACTIVE',
      hours: { open: '05:00', close: '23:00' },
      adminId: branchAdmin.id, // Using same admin for both branches
    },
  ];

  const createdBranches = [];
  for (const branch of branches) {
    const createdBranch = await prisma.branch.create({
      data: branch,
    });
    createdBranches.push(createdBranch);
  }

  // Update branch admin's branchId to the first branch
  await prisma.user.update({
    where: { id: branchAdmin.id },
    data: { branchId: createdBranches[0].id },
  });

  // Create remaining users
  const remainingUsers = [
    {
      firstName: 'General',
      lastName: 'Trainer',
      email: 'trainer@fit.com',
      password: trainerPassword,
      role: 'generaltrainer',
      branchId: createdBranches[0].id,
    },
    {
      firstName: 'Personal',
      lastName: 'Trainer',
      email: 'ptrainer@fit.com',
      password: ptPassword,
      role: 'personaltrainer',
      branchId: createdBranches[0].id,
    },
    {
      firstName: 'House',
      lastName: 'Keeping',
      email: 'house@fit.com',
      password: housekeepingPassword,
      role: 'housekeeping',
      branchId: createdBranches[0].id,
    },
    {
      firstName: 'Reception',
      lastName: 'Staff',
      email: 'reception@fit.com',
      password: receptionistPassword,
      role: 'receptionist',
      branchId: createdBranches[0].id,
    },
    {
      firstName: 'Manager',
      lastName: 'User',
      email: 'manager@fit.com',
      password: managerPassword,
      role: 'manager',
      branchId: createdBranches[0].id,
    },
    {
      firstName: 'John',
      lastName: 'Member',
      email: 'member@fit.com',
      password: memberPassword,
      role: 'member',
      branchId: createdBranches[0].id,
      memberId: 'MEM001',
      joiningDate: new Date('2023-01-01'),
    },
    {
      firstName: 'Jane',
      lastName: 'Member',
      email: 'member2@fit.com',
      password: memberPassword,
      role: 'member',
      branchId: createdBranches[0].id,
      memberId: 'MEM002',
      joiningDate: new Date('2023-02-01'),
    },
    {
      firstName: 'Bob',
      lastName: 'Member',
      email: 'member3@fit.com',
      password: memberPassword,
      role: 'member',
      branchId: createdBranches[1].id,
      memberId: 'MEM003',
      joiningDate: new Date('2023-03-01'),
    },
  ];

  const createdUsers = [superAdmin, branchAdmin];
  for (const user of remainingUsers) {
    const createdUser = await prisma.user.create({
      data: user,
    });
    createdUsers.push(createdUser);
  }

  // Seed BranchPlan data
  const branchPlans = [
    {
      name: 'Group Fitness Basic',
      type: 'group',
      sessions: 12,
      validity: 30, // 30 days
      priceCents: 15000, // 150 INR
      currency: 'INR',
      active: true,
      branchId: createdBranches[0].id,
      trainerId: createdUsers[2].id, // General Trainer
      createdById: createdUsers[1].id, // Branch Admin
    },
    {
      name: 'Group Fitness Premium',
      type: 'group',
      sessions: 24,
      validity: 60, // 60 days
      priceCents: 25000, // 250 INR
      currency: 'INR',
      active: true,
      branchId: createdBranches[0].id,
      trainerId: createdUsers[2].id, // General Trainer
      createdById: createdUsers[1].id,
    },
    {
      name: 'Personal Training Basic',
      type: 'personal',
      sessions: 8,
      validity: 30, // 30 days
      priceCents: 20000, // 200 INR
      currency: 'INR',
      active: true,
      branchId: createdBranches[0].id,
      trainerId: createdUsers[3].id, // Personal Trainer
      createdById: createdUsers[1].id,
    },
    {
      name: 'Personal Training Premium',
      type: 'personal',
      sessions: 16,
      validity: 60, // 60 days
      priceCents: 35000, // 350 INR
      currency: 'INR',
      active: true,
      branchId: createdBranches[0].id,
      trainerId: createdUsers[3].id, // Personal Trainer
      createdById: createdUsers[1].id,
    },
    {
      name: 'Downtown Group Fitness',
      type: 'group',
      sessions: 12,
      validity: 30, // 30 days
      priceCents: 18000, // 180 INR
      currency: 'INR',
      active: true,
      branchId: createdBranches[1].id,
      trainerId: createdUsers[2].id, // General Trainer (same trainer for both branches)
      createdById: createdUsers[1].id,
    },
  ];

  const createdBranchPlans = [];
  for (const plan of branchPlans) {
    const createdPlan = await prisma.branchPlan.create({
      data: plan,
    });
    createdBranchPlans.push(createdPlan);
  }

  // Seed ClassSchedule data
  const classes = [
    {
      className: 'Yoga Class',
      trainerId: createdUsers[2].id, // General Trainer
      date: new Date('2024-10-01'),
      time: '08:00',
      scheduleDay: ['Monday', 'Wednesday', 'Friday'],
      totalSheets: 20,
      status: 'Active',
      branchId: createdBranches[0].id,
      adminId: createdUsers[1].id, // Branch Admin
      roomName: 'Yoga Room',
    },
    {
      className: 'HIIT Class',
      trainerId: createdUsers[2].id, // General Trainer
      date: new Date('2024-10-02'),
      time: '10:00',
      scheduleDay: ['Tuesday', 'Thursday'],
      totalSheets: 15,
      status: 'Active',
      branchId: createdBranches[0].id,
      adminId: createdUsers[1].id,
      roomName: 'Main Hall',
    },
    {
      className: 'Pilates Class',
      trainerId: createdUsers[3].id, // Personal Trainer
      date: new Date('2024-10-03'),
      time: '14:00',
      scheduleDay: ['Monday', 'Wednesday'],
      totalSheets: 10,
      status: 'Active',
      branchId: createdBranches[1].id,
      adminId: createdUsers[1].id,
      roomName: 'Studio 1',
    },
  ];

  for (const classData of classes) {
    await prisma.classSchedule.create({
      data: classData,
    });
  }

  // Seed PersonalTrainingSession data
  const sessions = [
    {
      trainerId: createdUsers[3].id, // Personal Trainer
      memberId: createdUsers[4].id, // John Member
      branchId: createdBranches[0].id,
      date: new Date('2024-10-05'),
      time: '09:00',
      duration: 60,
      status: 'Booked',
      type: 'Personal Training',
      price: 5000, // 50 in cents
      paymentStatus: 'Paid',
      notes: 'Focus on upper body',
      location: 'Gym Floor',
      createdById: createdUsers[1].id, // Admin
    },
    {
      trainerId: createdUsers[3].id, // Personal Trainer
      memberId: createdUsers[5].id, // Jane Member
      branchId: createdBranches[0].id,
      date: new Date('2024-10-06'),
      time: '11:00',
      duration: 60,
      status: 'Confirmed',
      type: 'HIIT Session',
      price: 6000,
      paymentStatus: 'Paid',
      notes: 'High intensity workout',
      location: 'Training Room',
      createdById: createdUsers[1].id,
    },
    {
      trainerId: createdUsers[2].id, // General Trainer
      memberId: createdUsers[6].id, // Bob Member
      branchId: createdBranches[1].id,
      date: new Date('2024-10-07'),
      time: '15:00',
      duration: 45,
      status: 'Booked',
      type: 'Personal Training',
      price: 4500,
      paymentStatus: 'Pending',
      notes: 'Beginner session',
      location: 'Private Studio',
      createdById: createdUsers[1].id,
    },
  ];

  for (const session of sessions) {
    await prisma.personalTrainingSession.create({
      data: session,
    });
  }

  // Seed Membership data (unchanged)
  const memberships = [
    {
      title: 'Gold Membership',
      name: 'Alex Johnson',
      amount: 50000, // 500 in cents
      paidAmount: 30000, // 300 in cents
      dueAmount: 20000, // 200 in cents
      startDate: new Date('2020-01-01'),
      endDate: new Date('2020-12-26'),
      paymentStatus: 'Pending'
    },
    {
      title: 'Silver Membership',
      name: 'Braidy Con',
      amount: 30000,
      paidAmount: 30000,
      dueAmount: 0,
      startDate: new Date('2020-02-01'),
      endDate: new Date('2021-01-31'),
      paymentStatus: 'Completed'
    },
    {
      title: 'Platinum Membership',
      name: 'John Doe',
      amount: 80000,
      paidAmount: 50000,
      dueAmount: 30000,
      startDate: new Date('2020-03-01'),
      endDate: new Date('2021-03-01'),
      paymentStatus: 'Pending'
    },
    {
      title: 'Basic Membership',
      name: 'Jane Smith',
      amount: 15000,
      paidAmount: 15000,
      dueAmount: 0,
      startDate: new Date('2020-04-01'),
      endDate: new Date('2021-04-01'),
      paymentStatus: 'Completed'
    },
    {
      title: 'Gold Membership',
      name: 'Chris Lee',
      amount: 50000,
      paidAmount: 25000,
      dueAmount: 25000,
      startDate: new Date('2020-05-01'),
      endDate: new Date('2021-05-01'),
      paymentStatus: 'Pending'
    },
    {
      title: 'Silver Membership',
      name: 'Patricia Brown',
      amount: 30000,
      paidAmount: 10000,
      dueAmount: 20000,
      startDate: new Date('2020-06-01'),
      endDate: new Date('2021-06-01'),
      paymentStatus: 'Pending'
    },
    {
      title: 'Platinum Membership',
      name: 'Robert Wilson',
      amount: 80000,
      paidAmount: 80000,
      dueAmount: 0,
      startDate: new Date('2020-07-01'),
      endDate: new Date('2021-07-01'),
      paymentStatus: 'Completed'
    }
  ];

  for (const membership of memberships) {
    await prisma.membership.create({
      data: membership,
    });
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
