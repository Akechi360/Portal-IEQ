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

    const staff = await db.staffUser.update({
      where: { id },
      data: parsed.data,
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
