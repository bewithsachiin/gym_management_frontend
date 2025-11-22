const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkSuperadmin() {
  try {
    const superadmin = await prisma.user.findFirst({
      where: { role: 'superadmin' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        branchId: true,
        password: true, // To check if hashed
      },
    });

    if (!superadmin) {
      console.log('No superadmin user found in the database.');
      return;
    }

    console.log('Superadmin user found:');
    console.log(`ID: ${superadmin.id}`);
    console.log(`Name: ${superadmin.firstName} ${superadmin.lastName}`);
    console.log(`Email: ${superadmin.email}`);
    console.log(`Role: ${superadmin.role}`);
    console.log(`Branch ID: ${superadmin.branchId || 'null'}`);
    console.log(`Password (first 10 chars): ${superadmin.password.substring(0, 10)}...`);

    // Check if password is hashed (bcrypt hashes start with $2b$ or similar)
    if (superadmin.password.startsWith('$2')) {
      console.log('Password appears to be hashed.');
    } else {
      console.log('WARNING: Password does not appear to be hashed! This is why login fails.');
    }
  } catch (error) {
    console.error('Error checking superadmin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSuperadmin();
