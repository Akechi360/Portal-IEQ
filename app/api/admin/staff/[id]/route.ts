import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/jwt";
import { logAccess } from "@/lib/audit";

const patchSchema = z.object({
  nombre: z.string().min(2).trim().optional(),
  email: z.string().email().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

// ─── DELETE — Elimina el personal definitivamente ────────────────────────────
// Para bloquear temporalmente sin borrar, usar PATCH status=INACTIVE
// ("Revocar acceso"). Sus sesiones históricas se conservan con staffUserId =
// NULL (FK ON DELETE SET NULL), así no se pierde el registro de auditoría.

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (auth instanceof Response) return auth;

  const { id } = await params;

  try {
    const staff = await db.staffUser.findUnique({ where: { id } });
    if (!staff) {
      return NextResponse.json({ ok: false, message: "Personal no encontrado" }, { status: 404 });
    }

    await db.staffUser.delete({ where: { id } });

    await logAccess({
      event: "DISCONNECTED",
      actor: auth.username,
      detail: `staff:${staff.email}:deleted`,
    });

    return NextResponse.json({ ok: true, message: `${staff.nombre ?? staff.email} fue eliminado.` });
  } catch (error) {
    console.error("DELETE /api/admin/staff/[id]", error);
    return NextResponse.json({ ok: false, message: "Error al eliminar el personal" }, { status: 500 });
  }
}

// ─── PATCH — Editar campos, activar o desactivar ──────────────────────────────

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

    const staff = await db.staffUser.update({
      where: { id },
      data,
    });

    await logAccess({
      event: parsed.data.status === "ACTIVE" ? "AUTH_SUCCESS" : "DISCONNECTED",
      actor: "admin",
      detail: `staff:${staff.email}:updated`,
    });

    return NextResponse.json({ ok: true, message: "Personal actualizado", data: staff });
  } catch (error) {
    console.error("PATCH /api/admin/staff/[id]", error);
    return NextResponse.json({ ok: false, message: "Personal no encontrado o error interno" }, { status: 404 });
  }
}
