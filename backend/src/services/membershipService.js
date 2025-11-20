const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class MembershipService {
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

    return {
      memberships,
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
    return await prisma.membership.findUnique({
      where: { id: parseInt(id) },
    });
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
