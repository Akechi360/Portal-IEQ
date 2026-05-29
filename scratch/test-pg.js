const { Client } = require('pg');
require('dotenv').config();

const url = process.env.DATABASE_URL || "postgresql://postgres:13q4dm1n2026@192.168.15.21:5433/postgres?sslmode=disable";

async function main() {
  console.log(`Connecting to: ${url}`);
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    console.log("Connected successfully!");
    const res = await client.query("SELECT version();");
    console.log("Version:", res.rows[0].version);
    await client.end();
  } catch (err) {
    console.error("Connection failed:", err);
  }
}

main();
