import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Protocolo WiFiDog del gateway Reyee EG1510XS (ReyeeOS 2.x = wifidog-ng).
// Formato de respuesta REPLICADO byte a byte de la implementación de
// referencia zhaojh329/wifidog-ng-authserver (main.go):
//   /ping                 → "Pong"          (sin salto de línea)
//   /auth?stage=login     → "Auth: 1" / "Auth: 0"   (SIN "\n")
//   /auth?stage=counters  → {"resp":[]}     (JSON, no "Auth: N")
//   /auth?stage=roam      → "deny" (o "token=...")
//   /auth (otro stage)    → "OK"
// Content-Length explícito (sin chunked) porque el parser HTTP embebido del
// gateway no soporta Transfer-Encoding: chunked (verificado con pktmon).

function raw(body: string, contentType = "text/plain") {
  const buf = new TextEncoder().encode(body);
  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(buf.byteLength),
      Connection: "close",
    },
  });
}

async function hasActiveSessionForMac(mac: string): Promise<boolean> {
  try {
    const session = await db.session.findFirst({
      where: { mac: { equals: mac, mode: "insensitive" }, endedAt: null },
      include: { credential: true },
    });
    if (!session) return false;
    if (session.credential?.expireAt && session.credential.expireAt < new Date()) return false;
    if (session.credential && session.credential.status !== "ACTIVE") return false;
    return true;
  } catch (e) {
    console.error("[wifidogAuth] Error consultando sesión:", e);
    return false;
  }
}

async function isValidToken(token: string): Promise<boolean> {
  try {
    // El token que el gateway trae es el voucher que emitimos en el redirect.
    const cred = await db.credential.findUnique({ where: { voucherCode: token } });
    if (cred) {
      if (cred.status !== "ACTIVE") return false;
      if (cred.expireAt && cred.expireAt < new Date()) return false;
      return true;
    }
    return false;
  } catch (e) {
    console.error("[wifidogAuth] Error consultando voucher:", e);
    return false;
  }
}

async function handle(
  req: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const url = new URL(req.url);
  const segments = slug.filter(Boolean);
  const path = segments.join("/");
  const last = segments[segments.length - 1]?.toLowerCase() ?? "";

  console.log(`[wifidogAuth] ${req.method} /${path}?${url.searchParams.toString()}`);

  // Heartbeat
  if (last === "ping") {
    return raw("Pong");
  }

  if (last === "auth") {
    const stage = url.searchParams.get("stage") ?? "";
    const token = url.searchParams.get("token") ?? "";
    const mac = url.searchParams.get("mac") ?? "";

    if (stage === "login") {
      const ok =
        (token && (await isValidToken(token))) ||
        (mac ? await hasActiveSessionForMac(mac) : false);
      console.log(`[wifidogAuth] login mac=${mac} token=${token ? "sí" : "no"} → Auth: ${ok ? 1 : 0}`);
      return raw(`Auth: ${ok ? 1 : 0}`);
    }

    if (stage === "counters") {
      // Refresco periódico de sesiones activas — formato JSON de wifidog-ng
      return raw('{"resp":[]}', "application/json");
    }

    if (stage === "roam") {
      return raw("deny");
    }

    // stage=query u otros: responder según sesión de la MAC.
    // El gateway usa esto para saber si dejar pasar a un cliente ya visto.
    if (stage === "query") {
      const ok = mac ? await hasActiveSessionForMac(mac) : false;
      console.log(`[wifidogAuth] query mac=${mac} → Auth: ${ok ? 1 : 0}`);
      return raw(`Auth: ${ok ? 1 : 0}`);
    }

    return raw("OK");
  }

  // Portal/mensajes u otras rutas — mandar al login conservando parámetros
  const params2 = new URLSearchParams(url.searchParams);
  const originalUrl = url.searchParams.get("url");
  if (originalUrl) params2.set("redirect", originalUrl);

  return new NextResponse(null, {
    status: 302,
    headers: { Location: `/login?${params2.toString()}` },
  });
}

export const GET = handle;
export const POST = handle;
export const HEAD = handle;
