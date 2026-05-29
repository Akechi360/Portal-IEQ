// app/api/ruijie/callback/route.ts
// GET — Callback del gateway Ruijie tras redirigir al usuario de vuelta al portal.
// Conectado a la base de datos real en Fase 3.

import { NextResponse } from "next/server";
import { ruijieCallbackSchema } from "@/lib/validators";
import { logAccess } from "@/lib/audit";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const query = Object.fromEntries(url.searchParams.entries());

    const parsed = ruijieCallbackSchema.safeParse(query);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Parámetros de callback inválidos", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { mac, ip, ssid, username } = parsed.data;

    let sessionId = `sess-mock-${Date.now()}`;
    let isOffline = true;

    if (mac) {
      const activeSession = await db.session.findFirst({
        where: {
          mac: mac,
          endedAt: null
        },
        orderBy: {
          startedAt: "desc"
        }
      });

      if (activeSession) {
        sessionId = activeSession.id;
        isOffline = false;
        // Si el IP está disponible en el callback, lo asociamos a la sesión
        if (ip && activeSession.ip !== ip) {
          await db.session.update({
            where: { id: activeSession.id },
            data: { ip }
          });
        }
      }
    }

    await logAccess({
      event: "NEW_SESSION",
      actor: username ?? mac ?? "unknown",
      mac: mac ?? null,
      ip: ip ?? null,
      ssid: ssid ?? null,
      detail: `ruijie_callback:${sessionId}`,
    });

    return NextResponse.json({
      ok: true,
      message: "Callback recibido",
      data: {
        mac: mac ?? null,
        ip: ip ?? null,
        ssid: ssid ?? null,
        sessionId,
        offline: isOffline,
      },
    });
  } catch (error) {
    console.error("GET /api/ruijie/callback", error);
    return NextResponse.json({ ok: false, message: "Error interno del servidor" }, { status: 500 });
  }
}

