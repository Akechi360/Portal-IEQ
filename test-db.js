const { Client } = require('pg');

async function testConnection(url) {
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    console.log(`[SUCCESS] Connected to: ${url}`);
    await client.query('SELECT 1');
    await client.end();
    return true;
  } catch (err) {
    console.log(`[FAILED] ${url} -> ${err.message}`);
    return false;
  }
}

async function run() {
  const urls = [
    // Supavisor direct
    "postgresql://postgres.ieq-clinica:13q4dm1n2026@192.168.15.21:5432/postgres",
    "postgresql://postgres.ieq-clinica:13q4dm1n2026@192.168.15.21:5433/postgres",
    "postgresql://postgres.ieq-clinica:13q4dm1n2026@192.168.15.21:6543/postgres",
    
    // Direct Postgres
    "postgresql://postgres:13q4dm1n2026@192.168.15.21:5432/postgres",
    "postgresql://postgres:13q4dm1n2026@192.168.15.21:54322/postgres",
    "postgresql://postgres:13q4dm1n2026@192.168.15.21:5433/postgres",
    
    // Default tenant just in case
    "postgresql://postgres.default:13q4dm1n2026@192.168.15.21:5432/postgres",
    "postgresql://postgres.default:13q4dm1n2026@192.168.15.21:6543/postgres"
  ];

  for (const url of urls) {
    console.log(`Testing: ${url}...`);
    const ok = await Promise.race([
      testConnection(url),
      new Promise(r => setTimeout(() => { console.log(`[TIMEOUT] ${url}`); r(false); }, 3000))
    ]);
    if (ok) {
      console.log('--- FOUND WORKING URL ---');
      console.log(url);
      process.exit(0);
    }
  }
}

run();
