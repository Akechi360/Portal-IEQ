import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin, requireInternal } from "@/lib/jwt";

const portalConfigSchema = z.object({
  welcomeMessage: z.string().optional(),
  logoUrl: z.string().url().optional(),
  primaryColor: z.string().optional(),
  sessionTimeoutMinutes: z.number().int().min(1).optional(),
  maxDevicesGuest: z.number().int().min(1).max(5).optional(),
});

// ─── GET — Leer configuración del portal ──────────────────────────────────────

export async function GET(req: Request) {
  const auth = await requireInternal(req);
  if (auth instanceof Response) return auth;

  try {
    const config = await db.portalConfig.findFirst();
    return NextResponse.json({ ok: true, data: config });
  } catch (error) {
    console.error("GET /api/admin/config/portal", error);
    return NextResponse.json({ ok: false, message: "Error interno del servidor" }, { status: 500 });
  }
}

// ─── PUT — Actualizar configuración del portal ────────────────────────────────

export async function PUT(req: Request) {
  const auth = await requireAdmin(req);
  if (auth instanceof Response) return auth;

  try {
    const json = await req.json();
    const parsed = portalConfigSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Datos inválidos", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await db.portalConfig.findFirst();
    const config = existing
      ? await db.portalConfig.update({ where: { id: existing.id }, data: parsed.data })
      : await db.portalConfig.create({ data: parsed.data as any });

    return NextResponse.json({ ok: true, message: "Configuración actualizada", data: config });
  } catch (error) {
    console.error("PUT /api/admin/config/portal", error);
    return NextResponse.json({ ok: false, message: "Error interno del servidor" }, { status: 500 });
  }
}
