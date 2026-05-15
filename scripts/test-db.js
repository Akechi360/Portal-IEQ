const { PrismaClient } = require('@prisma/client');

async function testConnection(url) {
  console.log(`\nProbando conexión con: ${url}`);
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: url,
      },
    },
  });

  try {
    // Attempt a simple query
    await prisma.$connect();
    const result = await prisma.$queryRaw`SELECT 1 as result`;
    console.log(`✅ ¡Conexión exitosa a ${url}!`);
    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.error(`❌ Error conectando a ${url}:`);
    console.error(error.message);
    await prisma.$disconnect();
    return false;
  }
}

async function main() {
  const password = "13q4dm1n2026";
  
  const urlsToTest = [
    // El original que fallaba
    `postgresql://postgres.ieq-clinica:${password}@192.168.15.21:5432/postgres?sslmode=disable`,
    // Original pero con localhost
    `postgresql://postgres.ieq-clinica:${password}@127.0.0.1:5432/postgres?sslmode=disable`,
    // Usuario postgres normal en la IP local
    `postgresql://postgres:${password}@192.168.15.21:5432/postgres?sslmode=disable`,
    // Usuario postgres normal en localhost
    `postgresql://postgres:${password}@127.0.0.1:5432/postgres?sslmode=disable`,
    // Probar base de datos "portal_ieq" en lugar de "postgres"
    `postgresql://postgres:${password}@127.0.0.1:5432/portal_ieq?sslmode=disable`
  ];

  for (const url of urlsToTest) {
    const success = await testConnection(url);
    if (success) {
      console.log("\n🚀 ESTA ES LA URL CORRECTA. DEBES PONERLA EN TU .env");
      console.log(`DATABASE_URL="${url}"`);
      break;
    }
  }
}

main();
