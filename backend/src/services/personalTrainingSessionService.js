const prisma = require("../config/db");

// ⚙️ Safe Parser Helpers (Never throw errors)
const toInt = (v) => (v === undefined || v === null || isNaN(v) ? null : parseInt(v));
const toDate = (v) => {
  try { return v ? new Date(v) : null; } catch { return null; }
};

// ======================================================================
// 📌 GET ALL SESSIONS (FILTER + DEBUG MODE)
// ======================================================================
exports.getSessions = async (filters) => {
  console.log("\n💾 SERVICE: getSessions()");
  console.log("📌 Incoming Filters:", filters);

  try {
    const where = {};

    if (toInt(filters.trainerId)) where.trainerId = toInt(filters.trainerId);
    if (toInt(filters.memberId)) where.memberId = toInt(filters.memberId);
    if (filters.status) where.status = filters.status;
    if (toInt(filters.branchId)) where.branchId = toInt(filters.branchId);

    // Date Range Filtering
    if (filters.dateFrom || filters.dateTo) {
      where.date = {};
      if (filters.dateFrom) where.date.gte = toDate(filters.dateFrom);
      if (filters.dateTo) where.date.lte = toDate(filters.dateTo);
    }

    console.log("🧠 Final Prisma WHERE:", where);

    let sessions = await prisma.personalTrainingSession.findMany({
      where,
      include: {
        trainer: { select: { id: true, firstName: true, lastName: true } },
        member: { select: { id: true, firstName: true, lastName: true, memberId: true } },
        branch: { select: { id: true, name: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    console.log(`📦 SERVICE RESULT: Found ${sessions.length} sessions`);

    // 🔍 Search across user names (manual filter)
    if (filters.search) {
      const searchVal = filters.search.toLowerCase();
      sessions = sessions.filter(s =>
        `${s.trainer?.firstName} ${s.trainer?.lastName}`.toLowerCase().includes(searchVal) ||
        `${s.member?.firstName} ${s.member?.lastName}`.toLowerCase().includes(searchVal)
      );
      console.log(`🔎 Post Search Filter: ${sessions.length} sessions matched`);
    }

    return sessions;
  } catch (error) {
    console.error("❌ SERVICE:getSessions Error:", error);
    return []; // Prevent crash
  }
};

// ======================================================================
// 📌 GET SESSION BY ID (NO CRASH)
// ======================================================================
exports.getSessionById = async (id) => {
  console.log("\n💾 SERVICE: getSessionById()");
  console.log("🆔 ID:", id);

  try {
    const session = await prisma.personalTrainingSession.findUnique({
      where: { id },
      include: {
        trainer: true,
        member: true,
        branch: true,
        createdBy: true
      }
    });

    console.log("📌 Service Fetched Session:", session ? { id: session.id } : null);
    return session;
  } catch (error) {
    console.error("❌ SERVICE:getSessionById Error:", error);
    return null;
  }
};

// ======================================================================
// 📌 CREATE SESSION (VALIDATION + CONFLICT CHECK)
// ======================================================================
exports.createSession = async (data) => {
  console.log("\n💾 SERVICE: createSession()");
  console.log("📦 Incoming Data:", data);

  try {
    if (!data.trainerId || !data.memberId || !data.date || !data.time) {
      console.warn("⚠️ Required fields missing in Service");
      throw new Error("Missing required fields");
    }

    // Validate Trainer
    const trainer = await prisma.user.findUnique({ where: { id: data.trainerId } });
    console.log("👨‍🏫 Trainer Lookup:", trainer ? { id: trainer.id, branchId: trainer.branchId } : null);

    if (!trainer || trainer.branchId !== data.branchId)
      throw new Error("Trainer does not belong to this branch");

    // Validate Member
    const member = await prisma.user.findUnique({ where: { id: data.memberId } });
    console.log("🧍 Member Lookup:", member ? { id: member.id, branchId: member.branchId } : null);

    if (!member || member.branchId !== data.branchId)
      throw new Error("Member does not belong to this branch");

    // 🔥 Conflict Check
    const conflict = await prisma.personalTrainingSession.findFirst({
      where: {
        trainerId: data.trainerId,
        date: toDate(data.date),
        time: data.time,
        branchId: data.branchId,
        status: { not: "Cancelled" }
      }
    });

    if (conflict) {
      console.warn("⛔ SERVICE:createSession Trainer conflict:", {
        id: conflict.id, date: conflict.date, time: conflict.time
      });
      throw new Error("Trainer already has a booking at this date & time");
    }

    // 🚀 Create Session
    const session = await prisma.personalTrainingSession.create({
      data: {
        trainerId: data.trainerId,
        memberId: data.memberId,
        duration: data.duration || 60,
        branchId: data.branchId,
        date: toDate(data.date),
        time: data.time,
        type: data.type || "Personal Training",
        notes: data.notes || "",
        location: data.location || "Gym Floor",
        price: data.price ? toInt(data.price) : 0,
        paymentStatus: data.paymentStatus || "Paid",
        status: "Booked",
        createdById: data.createdBy
      }
    });

    console.log("🔥 SERVICE:createSession Created:", { id: session.id });
    return session;

  } catch (error) {
    console.error("❌ SERVICE:createSession Error:", error);
    throw error;
  }
};

// ======================================================================
// 📌 UPDATE SESSION (SAFE + VALIDATION + CONFLICT)
// ======================================================================
exports.updateSession = async (id, data) => {
  console.log("\n💾 SERVICE: updateSession()");
  console.log("🆔 ID:", id);
  console.log("📦 Data:", data);

  try {
    const existing = await prisma.personalTrainingSession.findUnique({ where: { id } });
    if (!existing) throw new Error("Session not found");

    const finalTrainerId = data.trainerId ? toInt(data.trainerId) : existing.trainerId;
    const finalDate      = data.date       ? toDate(data.date)    : existing.date;
    const finalTime      = data.time       || existing.time;

    console.log("🔄 Checking Conflict on Update:", {
      finalTrainerId, finalDate, finalTime
    });

    const conflict = await prisma.personalTrainingSession.findFirst({
      where: {
        trainerId: finalTrainerId,
        date: finalDate,
        time: finalTime,
        branchId: existing.branchId,
        status: { not: "Cancelled" },
        id: { not: id }
      }
    });

    if (conflict) throw new Error("Trainer already has a booking at this date & time");

    const updated = await prisma.personalTrainingSession.update({
      where: { id },
      data
    });

    console.log("🔥 SERVICE:updateSession Updated:", { id: updated.id });
    return updated;

  } catch (error) {
    console.error("❌ SERVICE:updateSession Error:", error);
    throw error;
  }
};

// ======================================================================
// 📌 DELETE SESSION (SAFE)
// ======================================================================
exports.deleteSession = async (id) => {
  console.log("\n💾 SERVICE: deleteSession()");
  console.log("🆔 ID:", id);

  try {
    await prisma.personalTrainingSession.delete({ where: { id } });
    console.log("🔥 SERVICE: deleteSession Success:", id);
    return true;
  } catch (error) {
    console.error("❌ SERVICE:deleteSession Error:", error);
    throw error;
  }
};

// ======================================================================
// 📌 DROPDOWN: GET TRAINERS by BRANCH
// ======================================================================
exports.getTrainers = async (branchId) => {
  console.log("\n💾 SERVICE: getTrainers()");
  console.log("🌍 Branch:", branchId);

  try {
    if (!branchId) return [];

    const trainers = await prisma.user.findMany({
      where: {
        branchId: branchId,
        role: { in: ["personaltrainer", "generaltrainer"] }
      },
      select: { id: true, firstName: true, lastName: true }
    });

    console.log(`📦 Found Trainers: ${trainers.length}`);
    return trainers;
  } catch (error) {
    console.error("❌ SERVICE:getTrainers Error:", error);
    return [];
  }
};

// ======================================================================
// 📌 DROPDOWN: GET MEMBERS by BRANCH
// ======================================================================
exports.getMembersForSessions = async (branchId, search) => {
  console.log("\n💾 SERVICE: getMembersForSessions()");
  console.log("🌍 Branch:", branchId, "🔎 Search:", search);

  try {
    if (!branchId) return [];

    let members = await prisma.user.findMany({
      where: {
        branchId,
        role: "member"
      },
      select: { id: true, firstName: true, lastName: true, memberId: true }
    });

    if (search) {
      members = members.filter(m =>
        `${m.firstName} ${m.lastName}`.toLowerCase().includes(search)
      );
      console.log(`🔎 Matched After Search: ${members.length}`);
    }

    return members;
  } catch (error) {
    console.error("❌ SERVICE:getMembersForSessions Error:", error);
    return [];
  }
};
