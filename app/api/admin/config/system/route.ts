import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/jwt";

const systemConfigPutSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
});

// ─── GET — Leer todas las configuraciones del sistema ────────────────────────

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (auth instanceof Response) return auth;

  try {
    const configs = await db.systemConfig.findMany({ orderBy: { key: "asc" } });
    return NextResponse.json({ ok: true, data: configs });
  } catch (error) {
    console.error("GET /api/admin/config/system", error);
    return NextResponse.json({ ok: false, message: "Error interno del servidor" }, { status: 500 });
  }
}

// ─── PUT — Crear o actualizar una clave de configuración ────────────────────

export async function PUT(req: Request) {
  const auth = await requireAdmin(req);
  if (auth instanceof Response) return auth;

  try {
    const json = await req.json();
    const parsed = systemConfigPutSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Se requieren 'key' y 'value'", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { key, value } = parsed.data;
    const config = await db.systemConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    return NextResponse.json({ ok: true, message: "Configuración guardada", data: config });
  } catch (error) {
    console.error("PUT /api/admin/config/system", error);
    return NextResponse.json({ ok: false, message: "Error interno del servidor" }, { status: 500 });
  }
}
