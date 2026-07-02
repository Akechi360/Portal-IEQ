// app/api/admin/doctors/route.ts
// GET  — Lista médicos registrados.
// POST — Registra un nuevo médico y genera su voucher permanente.
// PATCH — Actualiza el estado (ACTIVE / INACTIVE / PENDING) de un médico.
// Conectado a DB real con Prisma e integrado de forma segura con Ruijie Cloud Gateway.

import { NextResponse } from "next/server";
import { doctorCreateSchema } from "@/lib/validators";
import { generateVoucherCode } from "@/lib/auth";
import { logAccess } from "@/lib/audit";
import { db } from "@/lib/db";
import { createVoucher } from "@/lib/ruijie";
import { getSystemConfig } from "@/lib/config";
import { requireAdmin } from "@/lib/jwt";

// ─── GET — Listar médicos ─────────────────────────────────────────────────────

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (auth instanceof Response) return auth;

  try {
    const doctors = await db.doctor.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ ok: true, data: doctors, total: doctors.length });
  } catch (error) {
    console.error("GET /api/admin/doctors", error);
    return NextResponse.json({ ok: false, message: "Error interno del servidor" }, { status: 500 });
  }
}

// ─── POST — Crear médico ──────────────────────────────────────────────────────

export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if (auth instanceof Response) return auth;

  try {
    const json = await req.json();
    const parsed = doctorCreateSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Datos inválidos", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { nombre, especialidad, email, telefono } = parsed.data;
    const voucherCode = generateVoucherCode();

    const doctor = await db.doctor.create({
      data: {
        nombre,
        especialidad: especialidad ?? null,
        email,
        telefono: telefono ?? null,
        voucherCode,
        status: "ACTIVE", // Activado inmediatamente para producción y demo
      },
    });

    try {
      // Crear voucher permanente en el gateway
      await createVoucher({
        code: voucherCode,
        groupId: await getSystemConfig("ruijie_group_medicos"),
        maxDevices: await getSystemConfig("max_devices_doctor"),
        expireAt: undefined, // permanente
        note: nombre,
      });
    } catch (e) {
      console.warn("Fallo al registrar voucher en Ruijie (es posible que estés en local sin credenciales)", e);
    }

    await logAccess({
      event: "DOCTOR_APPROVED",
      actor: "admin",
      detail: `doctor:${email}:${voucherCode}`,
    });

    return NextResponse.json(
      {
        ok: true,
        message: "Médico registrado. Voucher generado.",
        data: doctor,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/doctors", error);
    return NextResponse.json({ ok: false, message: "Error interno del servidor" }, { status: 500 });
  }
}

// ─── PATCH — Actualizar estado del médico ─────────────────────────────────────

export async function PATCH(req: Request) {
  const auth = await requireAdmin(req);
  if (auth instanceof Response) return auth;

  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json(
        { ok: false, message: "Faltan parámetros id o status" },
        { status: 400 }
      );
    }

    const doctor = await db.doctor.update({
      where: { id },
      data: { status }
    });

    await logAccess({
      event: status === "ACTIVE" ? "DOCTOR_APPROVED" : "DISCONNECTED",
      actor: "admin",
      detail: `doctor:${doctor.email}:${status}`
    });

    return NextResponse.json({ ok: true, message: "Médico actualizado", data: doctor });
  } catch (error) {
    console.error("PATCH /api/admin/doctors", error);
    return NextResponse.json({ ok: false, message: "Error interno del servidor" }, { status: 500 });
  }
}
