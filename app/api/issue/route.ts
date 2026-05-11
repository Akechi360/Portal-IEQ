<<<<<<< HEAD
﻿import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { ok: false, message: "Legacy endpoint — use /api/admin/credentials/issue" },
    { status: 410 }
  );
}

=======
import { AuditAction, UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { generateToken, generateUsername } from "@/lib/auth";
import { mapApiTypeToRole } from "@/lib/access";
import { logAudit } from "@/lib/audit";

const issueSchema = z.object({
  type: z.enum(["Paciente", "Transito", "Medico", "Gerencia"]),
  personName: z.string().min(2),
  room: z.string().optional(),
  operator: z.string().min(1),
  maxDevices: z.number().int().min(1).max(5),
  doctorInDatabase: z.boolean().optional(),
  doctorData: z
    .object({
      email: z.string().email(),
      specialty: z.string().min(2),
      phone: z.string().min(5)
    })
    .optional()
});

function getGrantWindow(type: "Paciente" | "Transito" | "Medico" | "Gerencia") {
  const now = new Date();
  if (type === "Transito") {
    return { endsAt: new Date(now.getTime() + 30 * 60 * 1000), isPermanent: false, durationText: "30 minutos" };
  }
  if (type === "Paciente") {
    return { endsAt: new Date(now.getTime() + (48 * 60 + 120) * 60 * 1000), isPermanent: false, durationText: "2 dias + 2 h adicionales" };
  }
  return { endsAt: null, isPermanent: true, durationText: "Permanente" };
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = issueSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, message: "Payload invalido", errors: parsed.error.flatten() }, { status: 400 });
    }

    const input = parsed.data;
    const role = mapApiTypeToRole(input.type);
    const token = generateToken(8);
    const usernamePrefix =
      role === UserRole.PACIENTE ? "usuario" : role === UserRole.TRANSITO ? "transito" : role === UserRole.MEDICO ? "dr" : "gerencia";
    const username = generateUsername(usernamePrefix);
    const grantWindow = getGrantWindow(input.type);
    const isDoctor = role === UserRole.MEDICO;
    const doctorKnown = input.doctorInDatabase ?? false;

    const user = await db.user.create({
      data: {
        username,
        personName: input.personName,
        room: input.room,
        role,
        status: "ACTIVE",
        isPermanent: grantWindow.isPermanent,
        email: isDoctor ? input.doctorData?.email : undefined,
        phone: isDoctor ? input.doctorData?.phone : undefined,
        specialty: isDoctor ? input.doctorData?.specialty : undefined
      }
    });

    const grant = await db.accessGrant.create({
      data: {
        userId: user.id,
        token,
        maxDevices: input.maxDevices,
        isPermanent: grantWindow.isPermanent,
        startsAt: new Date(),
        endsAt: grantWindow.endsAt,
        issuedBy: input.operator,
        metadata: {
          room: input.room ?? null,
          doctorKnown,
          type: input.type,
          durationText: grantWindow.durationText
        }
      }
    });

    const auditAction =
      role === UserRole.MEDICO
        ? AuditAction.ISSUE_DOCTOR_ACCESS
        : role === UserRole.GERENCIA
          ? AuditAction.ISSUE_MANAGEMENT_ACCESS
          : AuditAction.ISSUE_ACCESS;

    await logAudit({
      action: auditAction,
      actorUsername: input.operator,
      targetUserId: user.id,
      metadata: {
        type: input.type,
        maxDevices: input.maxDevices,
        room: input.room ?? null,
        durationText: grantWindow.durationText
      }
    });

    return NextResponse.json(
      {
        ok: true,
        user: { id: user.id, username: user.username },
        grant: {
          id: grant.id,
          token: grant.token,
          endsAt: grant.endsAt,
          maxDevices: grant.maxDevices,
          room: user.room,
          durationText: grantWindow.durationText
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/issue", error);
    return NextResponse.json({ ok: false, message: "Error interno" }, { status: 500 });
  }
}
>>>>>>> 53f8a2c92a064c1299ac43fdff28034dd65a9b27
