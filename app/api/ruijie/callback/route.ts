// app/api/ruijie/callback/route.ts
// GET — Callback del gateway Ruijie tras redirigir al usuario de vuelta al portal.
// Modo offline: lee query params y retorna JSON estructurado sin contactar el gateway.
// TODO Fase 3: verificar firma/token del callback del gateway real antes de procesar.

import { NextResponse } from "next/server";
import { ruijieCallbackSchema } from "@/lib/validators";
import { logAccess } from "@/lib/audit";

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

    // TODO Fase 3: verificar que el callback proviene del gateway real (firma HMAC o token)
    // TODO Fase 3: buscar la sesión activa por MAC y marcar como "conectada" en DB

    await logAccess({
      event: "NEW_SESSION",
      actor: username ?? mac ?? "unknown",
      mac: mac ?? null,
      ip: ip ?? null,
      ssid: ssid ?? null,
      detail: "ruijie_callback",
    });

    return NextResponse.json({
      ok: true,
      message: "Callback recibido",
      data: {
        mac: mac ?? null,
        ip: ip ?? null,
        ssid: ssid ?? null,
        // TODO Fase 3: retornar sessionId real de la DB
        sessionId: `sess-mock-${Date.now()}`,
        offline: true,
      },
    });
  } catch (error) {
    console.error("GET /api/ruijie/callback", error);
    return NextResponse.json({ ok: false, message: "Error interno del servidor" }, { status: 500 });
  }
}
