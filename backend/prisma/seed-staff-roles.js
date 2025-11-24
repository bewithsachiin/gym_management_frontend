const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Staff Roles...');

  // Clear existing staff roles
  await prisma.staffRole.deleteMany();
  console.log('Existing staff roles cleared.');

  // Seed StaffRole data
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
    console.log(`Created staff role: ${createdRole.name}`);
  }

  console.log('Staff Roles seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
