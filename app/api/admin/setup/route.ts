import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

// One-time setup endpoint — creates default admins if none exist.
// Only works when no Admin records are in the DB (safe to call multiple times).
export async function POST(req: Request) {
  const { secret } = await req.json().catch(() => ({}));

  if (secret !== process.env.SETUP_SECRET && secret !== "ieq-setup-2026") {
    return NextResponse.json({ ok: false, message: "No autorizado." }, { status: 401 });
  }

  const existing = await db.admin.count();
  if (existing > 0) {
    return NextResponse.json({ ok: false, message: `Ya existen ${existing} admin(s). Setup no necesario.` });
  }

  const superHash = await bcrypt.hash("Sistemas#2026", 10);
  const opHash   = await bcrypt.hash("Admision#2026", 10);

  await db.admin.createMany({
    data: [
      {
        nombre:       "Administrador de Sistemas",
        username:     "admin_sistemas",
        email:        "sistemas@ieq.med",
        passwordHash: superHash,
        role:         "SUPERADMIN",
        status:       "ACTIVE",
      },
      {
        nombre:       "Operador de Admisión",
        username:     "admin_operador",
        email:        "admision@ieq.med",
        passwordHash: opHash,
        role:         "OPERADOR",
        status:       "ACTIVE",
      },
    ],
  });

  return NextResponse.json({
    ok: true,
    message: "Admins creados. SUPERADMIN: admin_sistemas / Sistemas#2026",
  });
}
