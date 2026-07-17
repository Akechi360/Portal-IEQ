// app/api/admin/credentials/[id]/extend/route.ts
// POST — Extiende la estadía de una credencial de Paciente sumándole días,
// SIN cambiar el voucher ni tocar los dispositivos ya casados.

import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireInternal } from "@/lib/jwt";
import { logAccess } from "@/lib/audit";

const schema = z.object({ dias: z.number().int().min(1).max(30) });

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireInternal(req);
  if (auth instanceof Response) return auth;

  const { id } = await params;

  try {
    const json = await req.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Número de días inválido (1 a 30)." },
        { status: 400 }
      );
    }

    const cred = await db.credential.findUnique({ where: { id } });
    if (!cred) {
      return NextResponse.json({ ok: false, message: "Credencial no encontrada." }, { status: 404 });
    }
    if (cred.tipo !== "PACIENTE") {
      return NextResponse.json(
        { ok: false, message: "Solo se pueden extender credenciales de Paciente." },
        { status: 400 }
      );
    }

    const dias = parsed.data.dias;
    const ms = dias * 24 * 60 * 60 * 1000;

    let data: { status: "ACTIVE"; expireAt?: Date; diasEstancia?: number };
    if (!cred.expireAt) {
      // Aún no se conecta (en espera): el reloj no ha arrancado, así que
      // aumentamos los días de estancia que se aplicarán en la primera conexión.
      data = { status: "ACTIVE", diasEstancia: (cred.diasEstancia ?? 1) + dias };
    } else {
      // Ya se conectó: sumamos los días a la expiración. Si ya venció, se
      // reactiva contando desde ahora.
      const base = cred.expireAt.getTime() > Date.now() ? cred.expireAt.getTime() : Date.now();
      data = { status: "ACTIVE", expireAt: new Date(base + ms) };
    }

    const updated = await db.credential.update({ where: { id }, data });

    await logAccess({
      event: "NEW_SESSION",
      actor: auth.username,
      detail: `credential:${cred.voucherCode}:extended:+${dias}d`,
    });

    return NextResponse.json({
      ok: true,
      message: `Estadía extendida ${dias} día(s).`,
      data: {
        expireAt: updated.expireAt?.toISOString() ?? null,
        diasEstancia: updated.diasEstancia,
      },
    });
  } catch (error) {
    console.error("POST /api/admin/credentials/[id]/extend", error);
    return NextResponse.json({ ok: false, message: "Error interno del servidor" }, { status: 500 });
  }
}
