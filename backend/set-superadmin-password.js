const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function setSuperadminPassword() {
  try {
    // Find the superadmin user
    const superadmin = await prisma.user.findFirst({
      where: { role: 'superadmin' },
    });

    if (!superadmin) {
      console.log('No superadmin user found. Please create one first.');
      return;
    }

    console.log(`Found superadmin: ${superadmin.email}`);

    // Set a new password: 'admin123' (you can change this)
    const newPassword = 'superadmin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user with new hashed password
    await prisma.user.update({
      where: { id: superadmin.id },
      data: { password: hashedPassword },
    });

    console.log(`Superadmin password has been reset to: ${newPassword}`);
    console.log('You can now login with email: superadmin@fit.com and password: superadmin123');
  } catch (error) {
    console.error('Error setting superadmin password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setSuperadminPassword();
