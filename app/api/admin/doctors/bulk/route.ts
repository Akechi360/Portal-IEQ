// app/api/admin/doctors/bulk/route.ts
// POST — Importación masiva de médicos desde un CSV ya parseado en el
// cliente. Alta directa (status ACTIVE): esto lo ejecuta únicamente personal
// de Sistemas migrando un padrón ya vetado (no es autoregistro).
//
// No se llama a Ruijie aquí: RADIUS valida directo contra la tabla Doctor
// (ver /api/radius/verify), así que el voucher/cuenta de Ruijie que sí se
// intenta en el alta individual (/api/admin/doctors POST) es legado y
// no bloqueante — omitirlo en el import masivo evita cientos de llamadas
// externas secuenciales en una sola request.

import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/jwt";
import { generateVoucherCode } from "@/lib/auth";
import { logAccess } from "@/lib/audit";

const rowSchema = z.object({
  nombre: z.string().min(2),
  email: z.string().email(),
  especialidad: z.string().optional(),
  telefono: z.string().optional(),
});

const bodySchema = z.object({
  rows: z.array(z.record(z.string(), z.string())).min(1).max(2000),
});

interface SkippedRow {
  row: number;
  email?: string;
  reason: string;
}

export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if (auth instanceof Response) return auth;

  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Formato de solicitud inválido", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const skipped: SkippedRow[] = [];
    let createdCount = 0;

    for (let i = 0; i < parsed.data.rows.length; i++) {
      const raw = parsed.data.rows[i];
      const rowNum = i + 2; // +2: fila 1 es encabezado, arrays son 0-index

      const candidate = rowSchema.safeParse({
        nombre: raw.nombre,
        email: raw.email,
        especialidad: raw.especialidad || undefined,
        telefono: raw.telefono || undefined,
      });

      if (!candidate.success) {
        skipped.push({ row: rowNum, email: raw.email, reason: "Nombre o correo inválido/faltante" });
        continue;
      }

      const { nombre, email, especialidad, telefono } = candidate.data;

      try {
        const existing = await db.doctor.findUnique({ where: { email } });
        if (existing) {
          skipped.push({ row: rowNum, email, reason: "Ya existe un médico con ese correo" });
          continue;
        }

        await db.doctor.create({
          data: {
            nombre,
            especialidad: especialidad ?? null,
            email,
            telefono: telefono ?? null,
            voucherCode: generateVoucherCode(),
            status: "ACTIVE",
          },
        });
        createdCount++;
      } catch (e) {
        console.error(`[doctors/bulk] Fila ${rowNum} (${email}):`, e);
        skipped.push({ row: rowNum, email, reason: "Error al guardar en la base de datos" });
      }
    }

    await logAccess({
      event: "DOCTOR_APPROVED",
      actor: "admin",
      detail: `bulk_import:doctors:created=${createdCount}:skipped=${skipped.length}`,
    });

    return NextResponse.json({
      ok: true,
      message: `${createdCount} médico(s) importado(s)`,
      createdCount,
      skipped,
    });
  } catch (error) {
    console.error("POST /api/admin/doctors/bulk", error);
    return NextResponse.json({ ok: false, message: "Error interno del servidor" }, { status: 500 });
  }
}
