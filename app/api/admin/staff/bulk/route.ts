// app/api/admin/staff/bulk/route.ts
// POST — Importación masiva de personal desde un CSV ya parseado en el
// cliente. Alta directa (status ACTIVE): la ejecuta únicamente Sistemas
// migrando un padrón ya vetado (no es autoregistro).

import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/jwt";
import { logAccess } from "@/lib/audit";

const rowSchema = z.object({
  nombre: z.string().min(1).optional(),
  email: z.string().email(),
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
      const rowNum = i + 2;

      const candidate = rowSchema.safeParse({
        nombre: raw.nombre || undefined,
        email: raw.email,
      });

      if (!candidate.success) {
        skipped.push({ row: rowNum, email: raw.email, reason: "Correo inválido/faltante" });
        continue;
      }

      const { nombre } = candidate.data;
      // Correo normalizado para que el login por correo coincida siempre.
      const email = candidate.data.email.trim().toLowerCase();

      try {
        const existing = await db.staffUser.findUnique({ where: { email } });
        if (existing) {
          skipped.push({ row: rowNum, email, reason: "Ya existe personal con ese correo" });
          continue;
        }

        await db.staffUser.create({
          data: { nombre: nombre ?? null, email, status: "ACTIVE" },
        });
        createdCount++;
      } catch (e) {
        console.error(`[staff/bulk] Fila ${rowNum} (${email}):`, e);
        skipped.push({ row: rowNum, email, reason: "Error al guardar en la base de datos" });
      }
    }

    await logAccess({
      event: "AUTH_SUCCESS",
      actor: "admin",
      detail: `bulk_import:staff:created=${createdCount}:skipped=${skipped.length}`,
    });

    return NextResponse.json({
      ok: true,
      message: `${createdCount} miembro(s) de personal importado(s)`,
      createdCount,
      skipped,
    });
  } catch (error) {
    console.error("POST /api/admin/staff/bulk", error);
    return NextResponse.json({ ok: false, message: "Error interno del servidor" }, { status: 500 });
  }
}
