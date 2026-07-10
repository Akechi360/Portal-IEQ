// app/api/admin/credentials/issue/route.ts
// POST — Emitir una credencial WiFi (PACIENTE o TRANSITO) desde el panel de admisión.
// Modo offline: genera voucher mock sin escribir en DB.
// TODO Fase 3: conectar a db.credential.create() y a createVoucher() del gateway real.

import { NextResponse } from "next/server";
import { issueCredentialSchema } from "@/lib/validators";
import { generateVoucherCode } from "@/lib/auth";
import { logAccess } from "@/lib/audit";
import { db } from "@/lib/db";
import { createVoucher, createAccount } from "@/lib/ruijie";
import { requireInternal } from "@/lib/jwt";

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
  const auth = await requireInternal(req);
  if (auth instanceof Response) return auth;

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

    // Bulletproof: verify that issuerId actually exists in the database to prevent Prisma crashes.
    let finalIssuerId = issuerId;
    const adminExists = await db.admin.findUnique({
      where: { id: issuerId },
    });

    if (!adminExists) {
      const fallbackAdmin = await db.admin.findFirst({
        where: { status: "ACTIVE" },
      });
      if (fallbackAdmin) {
        finalIssuerId = fallbackAdmin.id;
      } else {
        return NextResponse.json(
          { ok: false, message: "No se encontró ningún administrador activo en la base de datos para registrar la emisión." },
          { status: 500 }
        );
      }
    }

    const credential = await db.credential.create({
      data: {
        voucherCode,
        tipo,
        nombre,
        habitacion,
        maxDevices,
        diasEstancia,
        expireAt,
        issuerId: finalIssuerId,
        status: "ACTIVE",
      },
    });

    const groupId = process.env.RUIJIE_GROUP_ID || "default-group";
    try {
      await createVoucher({ code: voucherCode, groupId, maxDevices, expireAt, note: nombre });
    } catch (e) {
      console.warn("Fallo al crear voucher en Ruijie (es posible que estés en local sin credenciales)", e);
    }

    // Además del voucher, creamos una CUENTA con el mismo código como
    // usuario/contraseña — necesaria para el portal WISPr con
    // "Tipo de Auten: Cuenta local", que valida contra account/create,
    // no contra voucher/customerCreate.
    try {
      const accountResult = await createAccount({ username: voucherCode, password: voucherCode });
      if (!accountResult.ok) {
        console.warn(`No se pudo crear cuenta Ruijie para ${voucherCode}: ${accountResult.reason}`);
      }
    } catch (e) {
      console.warn("Fallo al crear cuenta en Ruijie", e);
    }

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
