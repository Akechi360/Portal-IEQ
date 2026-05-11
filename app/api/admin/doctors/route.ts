// app/api/admin/doctors/route.ts
// GET  — Lista médicos registrados.
// POST — Registra un nuevo médico y genera su voucher permanente.
// Modo offline: retorna mock data sin consultar DB.
// TODO Fase 3: conectar a db.doctor + createVoucher() del gateway.

import { NextResponse } from "next/server";
import { doctorCreateSchema } from "@/lib/validators";
import { generateVoucherCode } from "@/lib/auth";
import { logAccess } from "@/lib/audit";

// ─── GET — Listar médicos ─────────────────────────────────────────────────────

export async function GET() {
  try {
    // TODO Fase 3: await db.doctor.findMany({ orderBy: { createdAt: "desc" } })
    const MOCK_DOCTORS = [
      {
        id: "doctor-mock-001",
        nombre: "Dr. Jaime Ramírez",
        especialidad: "Cardiología",
        email: "j.ramirez@ieq.med",
        telefono: "809-555-0101",
        voucherCode: "IEQ-AA11-BB22",
        status: "ACTIVE",
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "doctor-mock-002",
        nombre: "Dra. Elena Vargas",
        especialidad: "Pediatría",
        email: "e.vargas@ieq.med",
        telefono: "809-555-0202",
        voucherCode: "IEQ-CC33-DD44",
        status: "ACTIVE",
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    return NextResponse.json({ ok: true, data: MOCK_DOCTORS, total: MOCK_DOCTORS.length, offline: true });
  } catch (error) {
    console.error("GET /api/admin/doctors", error);
    return NextResponse.json({ ok: false, message: "Error interno del servidor" }, { status: 500 });
  }
}

// ─── POST — Crear médico ──────────────────────────────────────────────────────

export async function POST(req: Request) {
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

    // TODO Fase 3: descomentar
    /*
    const doctor = await db.doctor.create({
      data: { nombre, especialidad, email, telefono, voucherCode, status: "PENDING" },
    });

    // Crear voucher permanente en el gateway
    await createVoucher({
      groupId: await getSystemConfig("ruijie_group_medicos"),
      maxDevices: await getSystemConfig("max_devices_doctor"),
      expireAt: undefined, // permanente
      note: nombre,
    });
    */

    await logAccess({
      event: "DOCTOR_APPROVED",
      actor: "admin",
      detail: `doctor:${email}:${voucherCode}`,
    });

    return NextResponse.json(
      {
        ok: true,
        message: "Médico registrado. Voucher generado.",
        data: {
          id: `doctor-mock-${Date.now()}`,
          nombre,
          especialidad: especialidad ?? null,
          email,
          telefono: telefono ?? null,
          voucherCode,
          status: "PENDING", // requiere activación manual hasta Fase 3
          offline: true,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/doctors", error);
    return NextResponse.json({ ok: false, message: "Error interno del servidor" }, { status: 500 });
  }
}
