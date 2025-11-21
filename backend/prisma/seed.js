const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Seed Membership data
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
