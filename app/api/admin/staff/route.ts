// app/api/admin/staff/route.ts
// GET  — Lista personal / gerencia registrados.
// POST — Registra un nuevo miembro de staff (activo de inmediato: alta directa
//         hecha por Sistemas, no hay autoregistro ni flujo de aprobación).

import { NextResponse } from "next/server";
import { staffCreateSchema } from "@/lib/validators";
import { logAccess } from "@/lib/audit";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/jwt";

// ─── GET — Listar staff ────────────────────────────────────────────────────────

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (auth instanceof Response) return auth;

  try {
    const staff = await db.staffUser.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ ok: true, data: staff, total: staff.length });
  } catch (error) {
    console.error("GET /api/admin/staff", error);
    return NextResponse.json({ ok: false, message: "Error interno del servidor" }, { status: 500 });
  }
}

// ─── POST — Crear staff ────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if (auth instanceof Response) return auth;

  try {
    const json = await req.json();
    const parsed = staffCreateSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Datos inválidos", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { nombre, email } = parsed.data;

    const existing = await db.staffUser.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { ok: false, message: "Ya existe un miembro de staff con ese correo." },
        { status: 409 }
      );
    }

    const staff = await db.staffUser.create({
      data: { nombre: nombre ?? null, email, status: "ACTIVE" },
    });

    await logAccess({
      event: "AUTH_SUCCESS",
      actor: "admin",
      detail: `staff:${email}:registered`,
    });

    return NextResponse.json(
      { ok: true, message: "Personal registrado y activado.", data: staff },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/staff", error);
    return NextResponse.json({ ok: false, message: "Error interno del servidor" }, { status: 500 });
  }
}
