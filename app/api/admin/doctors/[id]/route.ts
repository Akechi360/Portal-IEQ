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

// ─── DELETE — Soft delete (INACTIVE) ─────────────────────────────────────────

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (auth instanceof Response) return auth;

  const { id } = await params;

  try {
    const doctor = await db.doctor.update({
      where: { id },
      data: { status: "INACTIVE" },
    });

    await logAccess({
      event: "DISCONNECTED",
      actor: "admin",
      detail: `doctor:${doctor.email}:INACTIVE`,
    });

    return NextResponse.json({ ok: true, message: "Médico desactivado", data: doctor });
  } catch (error) {
    console.error("DELETE /api/admin/doctors/[id]", error);
    return NextResponse.json({ ok: false, message: "Médico no encontrado o error interno" }, { status: 404 });
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

    const doctor = await db.doctor.update({
      where: { id },
      data: parsed.data,
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
