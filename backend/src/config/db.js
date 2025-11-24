const { PrismaClient } = require('@prisma/client');

console.log("🗄️ [Prisma] Initializing Prisma Client...");

const prisma = new PrismaClient();

prisma.$connect()
  .then(() => console.log("✅ [Prisma] Database Connected Successfully"))
  .catch((error) => console.error("❌ [Prisma] Database Connection Error:", error));

module.exports = prisma;
