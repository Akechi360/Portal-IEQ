import { db } from '../lib/db';

async function main() {
  try {
    const admins = await db.admin.findMany();
    console.log("✅ Success! Admins found:", admins.length);
  } catch (e) {
    console.error("❌ Failed:", e.message);
  } finally {
    await db.$disconnect();
  }
}

main();
