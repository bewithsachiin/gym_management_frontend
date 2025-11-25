var prismaClient = require("@prisma/client");
var prisma = new prismaClient.PrismaClient();

// Clean Walk-In input (only allowed safe fields)
function cleanWalkInData(data) {
  var allowed = [
    "name",
    "phone",
    "email",
    "preferredMembershipPlanId",
    "interestedIn",
    "preferredTime",
    "notes",
    "branchId",
    "createdById"
  ];

  var result = {};

  for (var i = 0; i < allowed.length; i++) {
    var key = allowed[i];

    if (data && data[key] !== undefined) {
      // Date fix (basic beginner friendly)
      if (key === "preferredTime" && typeof data[key] === "string") {
        if (data[key].match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
          result[key] = new Date(data[key] + ":00"); // add seconds if missing
        } else {
          result[key] = new Date(data[key]);
        }
      } else {
        result[key] = data[key];
      }
    }
  }

  return result;
}

// Get all Walk-Ins
function getWalkIns(branchId, search) {
  var where = {};
  if (!search) {
    search = "";
  }

  if (branchId) {
    where.branchId = branchId;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } }
    ];
  }

  return prisma.walkIn
    .findMany({
      where: where,
      include: {
        branch: { select: { id: true, name: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        preferredMembershipPlan: { select: { id: true, plan_name: true } }
      },
      orderBy: { registeredAt: "desc" }
    })
    .then(function (list) {
      // Add name for easy frontend reading
      for (var i = 0; i < list.length; i++) {
        var row = list[i];
        if (row.preferredMembershipPlan) {
          row.preferredMembershipPlanName = row.preferredMembershipPlan.plan_name;
        } else {
          row.preferredMembershipPlanName = null;
        }
      }
      return list;
    })
    .catch(function () {
      throw new Error("Failed to fetch walk-in registrations");
    });
}

// Get single Walk-In
function getWalkInById(id, branchId) {
  id = parseInt(id);

  return prisma.walkIn
    .findUnique({
      where: { id: id },
      include: {
        branch: { select: { id: true, name: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } }
      }
    })
    .then(function (row) {
      if (!row) {
        throw new Error("Walk-in registration not found");
      }
      if (branchId && row.branchId !== branchId) {
        throw new Error("Access denied: Not your branch");
      }
      return row;
    })
    .catch(function (error) {
      throw error;
    });
}

// Create Walk-In
function createWalkIn(data, createdById) {
  var cleaned = cleanWalkInData(data);
  cleaned.createdById = createdById;

  return prisma.walkIn
    .create({
      data: cleaned,
      include: {
        branch: { select: { id: true, name: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } }
      }
    })
    .then(function (row) {
      return row;
    })
    .catch(function () {
      throw new Error("Error creating walk-in");
    });
}

// Update Walk-In
function updateWalkIn(id, data, branchId) {
  id = parseInt(id);

  return prisma.walkIn
    .findUnique({ where: { id: id } })
    .then(function (existing) {
      if (!existing) {
        throw new Error("Walk-in registration not found");
      }
      if (branchId && existing.branchId !== branchId) {
        throw new Error("Access denied: Not your branch");
      }

      var cleaned = cleanWalkInData(data);

      return prisma.walkIn.update({
        where: { id: id },
        data: cleaned,
        include: {
          branch: { select: { id: true, name: true } },
          createdBy: { select: { id: true, firstName: true, lastName: true } }
        }
      });
    })
    .catch(function (error) {
      throw error;
    });
}

// Delete Walk-In
function deleteWalkIn(id, branchId) {
  id = parseInt(id);

  return prisma.walkIn
    .findUnique({ where: { id: id } })
    .then(function (existing) {
      if (!existing) {
        throw new Error("Walk-in registration not found");
      }
      if (branchId && existing.branchId !== branchId) {
        throw new Error("Access denied: Not your branch");
      }

      return prisma.walkIn.delete({ where: { id: id } });
    })
    .catch(function (error) {
      throw error;
    });
}

module.exports = {
  getWalkIns: getWalkIns,
  getWalkInById: getWalkInById,
  createWalkIn: createWalkIn,
  updateWalkIn: updateWalkIn,
  deleteWalkIn: deleteWalkIn
};
