const { Client } = require('pg');

async function test(port, user) {
  const client = new Client({
    user: user,
    host: '192.168.15.21',
    database: 'postgres',
    password: '13q4dm1n2026',
    port: port,
  });

  try {
    await client.connect();
    console.log(`[SUCCESS] Connected to port ${port} with user ${user}`);
    await client.end();
  } catch (err) {
    console.error(`[ERROR] Port ${port}, user ${user}:`, err.message);
  }
}

async function run() {
  await test(5432, 'postgres');
  await test(5432, 'postgres.default');
  await test(6543, 'postgres');
  await test(6543, 'postgres.default');
  await test(5433, 'postgres');
}

run();
