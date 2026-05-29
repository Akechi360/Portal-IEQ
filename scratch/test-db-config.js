const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const systemConfigs = await prisma.systemConfig.findMany();
    console.log("System Configs in DB:");
    console.log(JSON.stringify(systemConfigs, null, 2));

    const portalConfigs = await prisma.portalConfig.findMany();
    console.log("Portal Configs in DB:");
    console.log(JSON.stringify(portalConfigs, null, 2));
  } catch (err) {
    console.error("Error reading database configs:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
