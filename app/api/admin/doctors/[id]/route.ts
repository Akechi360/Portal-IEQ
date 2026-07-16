import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/jwt";
import { logAccess } from "@/lib/audit";

const patchSchema = z.object({
  nombre: z.string().min(2).trim().optional(),
  especialidad: z.string().min(2).trim().optional(),
  email: z.string().email().optional(),
  telefono: z.string().min(7).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING"]).optional(),
});

// ─── DELETE — Elimina el médico definitivamente ──────────────────────────────
// Para bloquear temporalmente sin borrar, usar PATCH status=INACTIVE
// ("Revocar acceso"). Al borrar: sus device bindings caen en cascada y sus
// sesiones históricas se conservan con doctorId = NULL (FK ON DELETE SET NULL),
// así no se pierde el registro de auditoría.

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (auth instanceof Response) return auth;

  const { id } = await params;

  try {
    const doctor = await db.doctor.findUnique({ where: { id } });
    if (!doctor) {
      return NextResponse.json({ ok: false, message: "Médico no encontrado" }, { status: 404 });
    }

    await db.doctor.delete({ where: { id } });

    await logAccess({
      event: "DISCONNECTED",
      actor: auth.username,
      detail: `doctor:${doctor.email}:deleted`,
    });

    return NextResponse.json({ ok: true, message: `${doctor.nombre} fue eliminado.` });
  } catch (error) {
    console.error("DELETE /api/admin/doctors/[id]", error);
    return NextResponse.json({ ok: false, message: "Error al eliminar el médico" }, { status: 500 });
  }
}

// ─── PATCH — Editar campos o reactivar ───────────────────────────────────────

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (auth instanceof Response) return auth;

  const { id } = await params;

  try {
    const json = await req.json();
    const parsed = patchSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Datos inválidos", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Correo normalizado a minúsculas para que el login por correo coincida,
    // consistente con el alta individual y en lote.
    const data = { ...parsed.data };
    if (data.email) data.email = data.email.trim().toLowerCase();

    const doctor = await db.doctor.update({
      where: { id },
      data,
    });

    await logAccess({
      event: parsed.data.status === "ACTIVE" ? "DOCTOR_APPROVED" : "DISCONNECTED",
      actor: "admin",
      detail: `doctor:${doctor.email}:updated`,
    });

    return NextResponse.json({ ok: true, message: "Médico actualizado", data: doctor });
  } catch (error) {
    console.error("PATCH /api/admin/doctors/[id]", error);
    return NextResponse.json({ ok: false, message: "Médico no encontrado o error interno" }, { status: 404 });
  }
}
