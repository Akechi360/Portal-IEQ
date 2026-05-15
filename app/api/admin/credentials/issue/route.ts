// app/api/admin/credentials/issue/route.ts
// POST — Emitir una credencial WiFi (PACIENTE o TRANSITO) desde el panel de admisión.
// Modo offline: genera voucher mock sin escribir en DB.
// TODO Fase 3: conectar a db.credential.create() y a createVoucher() del gateway real.

import { NextResponse } from "next/server";
import { issueCredentialSchema } from "@/lib/validators";
import { generateVoucherCode } from "@/lib/auth";
import { logAccess } from "@/lib/audit";
import { db } from "@/lib/db";

function getExpireAt(tipo: "PACIENTE" | "TRANSITO", diasEstancia?: number): Date {
  const now = new Date();
  if (tipo === "TRANSITO") {
    return new Date(now.getTime() + 30 * 60 * 1000); // 30 minutos
  }
  // Paciente: días de estancia + 2h de gracia (default 2 días)
  const days = diasEstancia ?? 2;
  return new Date(now.getTime() + (days * 24 + 2) * 60 * 60 * 1000);
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = issueCredentialSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Datos inválidos", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { tipo, nombre, habitacion, maxDevices, diasEstancia, issuerId } = parsed.data;
    const voucherCode = generateVoucherCode();
    const expireAt = getExpireAt(tipo, diasEstancia);

    const credential = await db.credential.create({
      data: {
        voucherCode,
        tipo,
        nombre,
        habitacion,
        maxDevices,
        diasEstancia,
        expireAt,
        issuerId,
        status: "ACTIVE",
      },
    });

    /*
    // TODO Fase 3: Crear voucher en el gateway Ruijie (Pendiente API Docs)
    const groupId = tipo === "PACIENTE"
      ? await getSystemConfig("ruijie_group_guest")
      : await getSystemConfig("ruijie_group_guest");
    await createVoucher({ groupId, maxDevices, expireAt, note: nombre });
    */

    await logAccess({
      event: "NEW_SESSION",
      actor: issuerId,
      detail: `issued:${tipo}:${voucherCode}:${nombre}`,
    });

    return NextResponse.json(
      {
        ok: true,
        message: "Credencial emitida",
        data: {
          id: credential.id,
          voucherCode: credential.voucherCode,
          tipo: credential.tipo,
          nombre: credential.nombre,
          habitacion: credential.habitacion,
          maxDevices: credential.maxDevices,
          expireAt: credential.expireAt?.toISOString() ?? null,
          issuerId: credential.issuerId,
          status: credential.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/credentials/issue", error);
    return NextResponse.json({ ok: false, message: "Error interno del servidor" }, { status: 500 });
  }
}
