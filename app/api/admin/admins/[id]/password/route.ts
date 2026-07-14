// app/api/admin/admins/[id]/password/route.ts
// PATCH — Cambia la contraseña de un administrador. Solo un SUPERADMIN puede
// hacerlo. La contraseña llega en texto plano por HTTPS, se hashea con bcrypt
// en el servidor y se guarda solo el hash — nunca el texto plano.

import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/jwt";
import { hashPassword } from "@/lib/auth";
import { logAccess } from "@/lib/audit";

const schema = z.object({
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(100, "La contraseña es demasiado larga"),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (auth instanceof Response) return auth;

  // Solo SUPERADMIN puede cambiar contraseñas de administradores.
  if (auth.role !== "SUPERADMIN") {
    return NextResponse.json(
      { ok: false, message: "Solo un Superadmin puede cambiar contraseñas." },
      { status: 403 }
    );
  }

  const { id } = await params;

  try {
    const json = await req.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos" },
        { status: 400 }
      );
    }

    const target = await db.admin.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ ok: false, message: "Administrador no encontrado." }, { status: 404 });
    }

    const passwordHash = await hashPassword(parsed.data.password);
    await db.admin.update({ where: { id }, data: { passwordHash } });

    await logAccess({
      event: "AUTH_SUCCESS",
      actor: auth.username,
      detail: `password_reset:${target.username}`,
    });

    return NextResponse.json({ ok: true, message: `Contraseña actualizada para ${target.username}.` });
  } catch (error) {
    console.error("PATCH /api/admin/admins/[id]/password", error);
    return NextResponse.json({ ok: false, message: "Error interno del servidor" }, { status: 500 });
  }
}
