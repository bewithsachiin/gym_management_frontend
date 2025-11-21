const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class MembershipService {
  // Helper method to format date
  formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
  }

  // Get all memberships with search and pagination
  async getAllMemberships(search, page, limit) {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { title: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const memberships = await prisma.membership.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.membership.count({ where });

    // Transform memberships to match frontend format
    const transformedMemberships = memberships.map(membership => ({
      id: membership.id,
      title: membership.title,
      name: membership.name,
      amount: (membership.amount / 100).toString(),
      paidAmount: (membership.paidAmount / 100).toString(),
      dueAmount: (membership.dueAmount / 100).toString(),
      startDate: this.formatDate(membership.startDate),
      endDate: this.formatDate(membership.endDate),
      paymentStatus: membership.paymentStatus,
    }));

    return {
      memberships: transformedMemberships,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get membership by ID
  async getMembershipById(id) {
    const membership = await prisma.membership.findUnique({
      where: { id: parseInt(id) },
    });

    if (membership) {
      return {
        id: membership.id,
        title: membership.title,
        name: membership.name,
        amount: (membership.amount / 100).toString(),
        paidAmount: (membership.paidAmount / 100).toString(),
        dueAmount: (membership.dueAmount / 100).toString(),
        startDate: this.formatDate(membership.startDate),
        endDate: this.formatDate(membership.endDate),
        paymentStatus: membership.paymentStatus,
      };
    }

    return membership;
  }

  // Create a new membership
  async createMembership(data) {
    return await prisma.membership.create({
      data,
    });
  }

  // Update membership
  async updateMembership(id, data) {
    return await prisma.membership.update({
      where: { id: parseInt(id) },
      data,
    });
  }

  // Delete membership
  async deleteMembership(id) {
    return await prisma.membership.delete({
      where: { id: parseInt(id) },
    });
  }
}

module.exports = new MembershipService();
