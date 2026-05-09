import { AuditAction, UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";

const validateSchema = z.object({
  email: z.string().email()
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = validateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, message: "Payload invalido", errors: parsed.error.flatten() }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();
    const doctor = await db.user.findFirst({
      where: { email, role: UserRole.MEDICO },
      include: {
        grants: { orderBy: { createdAt: "desc" }, take: 1 }
      }
    });

    await logAudit({
      action: AuditAction.DOCTOR_VALIDATE,
      actorUsername: "doctor-portal",
      targetUserId: doctor?.id ?? null,
      metadata: { email, exists: Boolean(doctor) }
    });

    if (!doctor) {
      return NextResponse.json({ ok: true, exists: false });
    }

    return NextResponse.json({
      ok: true,
      exists: true,
      detail: {
        id: doctor.id,
        username: doctor.username,
        personName: doctor.personName,
        email: doctor.email,
        specialty: doctor.specialty,
        phone: doctor.phone,
        accessType: doctor.grants[0]?.isPermanent ? "Permanente" : "Temporal"
      }
    });
  } catch (error) {
    console.error("POST /api/doctor/validate", error);
    return NextResponse.json({ ok: false, message: "Error interno" }, { status: 500 });
  }
}
