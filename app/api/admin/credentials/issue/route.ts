// app/api/admin/credentials/issue/route.ts
// POST — Emitir una credencial WiFi (PACIENTE o TRANSITO) desde el panel de admisión.
// Modo offline: genera voucher mock sin escribir en DB.
// TODO Fase 3: conectar a db.credential.create() y a createVoucher() del gateway real.

import { NextResponse } from "next/server";
import { issueCredentialSchema } from "@/lib/validators";
import { generateVoucherCode } from "@/lib/auth";
import { logAccess } from "@/lib/audit";
import { db } from "@/lib/db";
import { createVoucher } from "@/lib/ruijie";
import { requireInternal } from "@/lib/jwt";
import { getSystemConfig } from "@/lib/config";

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
    // La credencial se emite "en espera": expireAt = null. El reloj de
    // expiración arranca en la PRIMERA conexión (lo fija /api/radius/verify al
    // casar el primer dispositivo), no al momento de emitir.
    const expireAt = null;

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

    // Grupo de ancho de banda real asignado a invitados (Paciente/Tránsito)
    // en Configuración → Red WiFi. Antes esto usaba RUIJIE_GROUP_ID por
    // error — esa variable es el ID de red/sitio, no el perfil de usuario.
    const groupId = await getSystemConfig("ruijie_group_guest");
    try {
      await createVoucher({ code: voucherCode, groupId, maxDevices, expireAt: undefined, note: nombre });
    } catch (e) {
      console.warn("Fallo al crear voucher en Ruijie (es posible que estés en local sin credenciales)", e);
    }

    // RADIUS: ya no necesitamos crear cuentas en Ruijie Cloud.
    // FreeRADIUS valida directamente contra nuestra DB local.

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
