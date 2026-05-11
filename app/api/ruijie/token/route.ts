// app/api/ruijie/token/route.ts
// GET — Obtiene el token de autenticación hacia el gateway Ruijie.
// Modo offline: llama al stub getRuijieToken() que retorna "MOCK_TOKEN_OFFLINE".
// TODO Fase 3: getRuijieToken() hará el POST real al gateway con credenciales del .env.

import { NextResponse } from "next/server";
import { getRuijieToken } from "@/lib/ruijie";

export async function GET() {
  try {
    // TODO Fase 3: este token debería cachearse (Redis / in-memory con TTL)
    const token = await getRuijieToken();

    return NextResponse.json({
      ok: true,
      token,
      // El token real del gateway expira cada N minutos
      // TODO Fase 3: incluir expiresAt desde la respuesta del gateway
      expiresAt: null,
      offline: token === "MOCK_TOKEN_OFFLINE",
    });
  } catch (error) {
    console.error("GET /api/ruijie/token", error);
    return NextResponse.json({ ok: false, message: "Error al obtener token del gateway" }, { status: 500 });
  }
}
