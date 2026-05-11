<<<<<<< HEAD
﻿import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { ok: false, message: "Legacy endpoint — use /api/admin/doctors" },
    { status: 410 }
  );
}

=======
import { AuditAction, UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { generateToken, generateUsername } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

const doctorCreateSchema = z.object({
  nombre: z.string().min(2),
  especialidad: z.string().min(2),
  telefono: z.string().min(5),
  email: z.string().email(),
  maxDevices: z.number().int().min(1).max(5),
  operator: z.string().min(1)
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = doctorCreateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, message: "Payload invalido", errors: parsed.error.flatten() }, { status: 400 });
    }

    const input = parsed.data;
    const existing = await db.user.findUnique({
      where: { email: input.email.toLowerCase() }
    });

    if (existing) {
      return NextResponse.json({ ok: false, message: "Ya existe un medico con ese correo" }, { status: 409 });
    }

    const user = await db.user.create({
      data: {
        username: generateUsername("dr"),
        personName: input.nombre,
        role: UserRole.MEDICO,
        status: "ACTIVE",
        email: input.email.toLowerCase(),
        phone: input.telefono,
        specialty: input.especialidad,
        isPermanent: true
      }
    });

    const grant = await db.accessGrant.create({
      data: {
        userId: user.id,
        token: generateToken(8),
        isPermanent: true,
        endsAt: null,
        maxDevices: input.maxDevices,
        issuedBy: input.operator
      }
    });

    await logAudit({
      action: AuditAction.DOCTOR_CREATE,
      actorUsername: input.operator,
      targetUserId: user.id,
      metadata: { maxDevices: input.maxDevices, email: input.email.toLowerCase() }
    });

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        username: user.username,
        personName: user.personName,
        role: user.role,
        email: user.email
      },
      grant: {
        id: grant.id,
        token: grant.token,
        isPermanent: grant.isPermanent,
        maxDevices: grant.maxDevices
      }
    });
  } catch (error) {
    console.error("POST /api/doctor/create", error);
    return NextResponse.json({ ok: false, message: "Error interno" }, { status: 500 });
  }
}
>>>>>>> 53f8a2c92a064c1299ac43fdff28034dd65a9b27
