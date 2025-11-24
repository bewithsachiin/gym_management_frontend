const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all group plans (BranchPlans with type="group") with optional filters and access control
const getAllGroupPlans = async (filters = {}, userBranchId, userRole) => {
  console.log("\n🟦 [Service] getAllGroupPlans() triggered");
  console.log("🔎 Filters:", filters, "Branch:", userBranchId, "Role:", userRole);

  try {
    // Build where clause based on role and filters
    let where = { type: "group" }; // Only group plans

    // Access control: non-superadmin users can only see their branch's plans
    if (userRole !== 'superadmin') {
      where.branchId = userBranchId;
    }

    // Apply additional filters from query params
    if (filters.name) where.name = { contains: filters.name, mode: 'insensitive' };
    if (filters.active !== undefined) where.active = filters.active;
    if (filters.branchId) where.branchId = filters.branchId; // Allow superadmin to filter by branch

    console.log("🔍 Where Clause:", where);

    const plans = await prisma.branchPlan.findMany({
      where,
      include: {
        branch: true, // Include branch details
        createdBy: true, // Include creator details
        _count: {
          select: { memberPlans: true }, // Count of members enrolled
        },
      },
      orderBy: { createdAt: 'desc' }, // Order by creation date, newest first
    });

    console.log(`📦 Group Plans Retrieved: ${plans.length}`);
    return plans;

  } catch (error) {
    console.error("❌ [Service Error] getAllGroupPlans():", error.message);
    throw new Error(`Failed to fetch group plans: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
};

// Get members for a specific group plan (BranchPlan with type="group")
const getGroupPlanMembers = async (id, userBranchId, userRole) => {
  console.log("\n🟨 [Service] getGroupPlanMembers() triggered");
  console.log("🔐 Plan ID:", id, "Branch:", userBranchId, "Role:", userRole);

  try {
    // First, verify the plan exists and is a group plan, with access control
    const planWhere = userRole !== 'superadmin' ? { id, branchId: userBranchId, type: "group" } : { id, type: "group" };

    const plan = await prisma.branchPlan.findUnique({
      where: planWhere,
    });

    if (!plan) {
      throw new Error('Group plan not found or access denied');
    }

    // Get members enrolled in this plan
    const memberPlans = await prisma.memberBranchPlan.findMany({
      where: { branchPlanId: id },
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            memberId: true,
            memberStatus: true,
          },
        },
        branchPlan: {
          select: {
            sessions: true,
          },
        },
      },
    });

    const members = memberPlans.map(mp => ({
      ...mp.member,
      purchaseDate: mp.startDate,
      expiryDate: mp.expiryDate,
      sessionsRemaining: mp.remainingSessions,
      sessionsAttended: mp.branchPlan.sessions - mp.remainingSessions,
    }));

    console.log(`📦 Members Retrieved: ${members.length}`);
    return members;

  } catch (error) {
    console.error("❌ [Service Error] getGroupPlanMembers():", error.message);
    throw new Error(`Failed to fetch group plan members: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
};

module.exports = {
  getAllGroupPlans,
  getGroupPlanMembers,
};
