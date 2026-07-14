import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/jwt";
import bcrypt from "bcryptjs";

// GET — Estado de los admins. PROTEGIDO: solo un admin autenticado puede verlo.
// (Antes era público y filtraba usuarios y roles a cualquiera.)
export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (auth instanceof Response) return auth;

  try {
    const count = await db.admin.count();
    const admins = await db.admin.findMany({ select: { username: true, role: true, status: true } });
    return Response.json({ ok: true, adminCount: count, admins });
  } catch (e: any) {
    return Response.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 });
  }
}

// POST — Seed inicial de admins. Solo funciona si aún no existe ningún admin.
// Requiere SETUP_SECRET del entorno (SIN fallback hardcodeado) y lee las
// contraseñas iniciales de variables de entorno (SETUP_ADMIN_PASSWORD /
// SETUP_OPERADOR_PASSWORD): nunca del código. Tras el seed, las contraseñas
// solo viven en la DB (hasheadas con bcrypt).
export async function POST(req: Request) {
  const setupSecret = process.env.SETUP_SECRET;
  if (!setupSecret) {
    return NextResponse.json(
      { ok: false, message: "SETUP_SECRET no está configurado en el servidor." },
      { status: 500 }
    );
  }

  const { secret } = await req.json().catch(() => ({}));
  if (secret !== setupSecret) {
    return NextResponse.json({ ok: false, message: "No autorizado." }, { status: 401 });
  }

  const adminPassword = process.env.SETUP_ADMIN_PASSWORD;
  const operadorPassword = process.env.SETUP_OPERADOR_PASSWORD;
  if (!adminPassword || !operadorPassword) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Define SETUP_ADMIN_PASSWORD y SETUP_OPERADOR_PASSWORD en el entorno antes de ejecutar el setup.",
      },
      { status: 500 }
    );
  }

  try {
    const existing = await db.admin.count();
    if (existing > 0) {
      return NextResponse.json({ ok: false, message: `Ya existen ${existing} admin(s). Setup no necesario.` });
    }
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        message: "Error al consultar DB — probablemente las migraciones no se aplicaron.",
        error: e?.message ?? String(e),
      },
      { status: 500 }
    );
  }

  try {
    const superHash = await bcrypt.hash(adminPassword, 10);
    const opHash = await bcrypt.hash(operadorPassword, 10);

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

    // No devolvemos las contraseñas en la respuesta.
    return NextResponse.json({
      ok: true,
      message: "Admins creados: admin_sistemas (SUPERADMIN) y admin_operador (OPERADOR).",
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, message: "Error al crear admins.", error: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
