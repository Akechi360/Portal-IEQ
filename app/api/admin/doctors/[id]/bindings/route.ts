// app/api/admin/doctors/[id]/bindings/route.ts
// GET    — Dispositivos casados al médico.
// DELETE — Libera los dispositivos (el médico podrá casar equipos nuevos).

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/jwt";
import { logAccess } from "@/lib/audit";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  try {
    const bindings = await db.doctorDeviceBinding.findMany({
      where: { doctorId: id },
      orderBy: { boundAt: "asc" },
    });
    return NextResponse.json({ ok: true, bindings });
  } catch (error) {
    console.error("GET /api/admin/doctors/[id]/bindings", error);
    return NextResponse.json({ ok: false, message: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  try {
    const doctor = await db.doctor.findUnique({ where: { id } });
    const { count } = await db.doctorDeviceBinding.deleteMany({ where: { doctorId: id } });

    await logAccess({
      event: "DISCONNECTED",
      actor: auth.username,
      detail: `doctor:${doctor?.email ?? id}:bindings_reset:${count}`,
    });

    return NextResponse.json({ ok: true, message: `Liberados ${count} dispositivo(s)`, count });
  } catch (error) {
    console.error("DELETE /api/admin/doctors/[id]/bindings", error);
    return NextResponse.json({ ok: false, message: "Error interno" }, { status: 500 });
  }
}
