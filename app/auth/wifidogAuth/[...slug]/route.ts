import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Protocolo WiFiDog del gateway Reyee EG1510XS (ReyeeOS 2.x).
// CLAVE (confirmado por soporte Ruijie 2026-07-09): el resultado va en el
// HEADER "Auth: 1" / "Auth: 0", con CUERPO VACÍO (Content-Length: 0), NO en
// el body. El fork de Reyee difiere del wifidog-ng público (que usa body).
// Requisitos exactos:
//   - HTTP 200 OK
//   - Header "Auth: N" (case-sensitive, sin espacios extra)
//   - Cuerpo vacío, Content-Length: 0
//   - NUNCA Transfer-Encoding: chunked (rompe el parser → message=denied)
//   - /wifidog/ping → body "Pong", Content-Length: 4, en < 3s
//   - Sin redirect 3xx en las respuestas de auth

function authResponse(allowed: boolean) {
  // Respuesta EXACTA al ejemplo funcional de Ruijie: headers mínimos,
  // Content-Type text/plain, cuerpo vacío, Auth como header. Se elimina el
  // header "Vary" que Next.js inyecta (puede romper el parser del gateway).
  const res = new NextResponse(null, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
      "Content-Length": "0",
      Auth: allowed ? "1" : "0",
      Connection: "close",
    },
  });
  res.headers.delete("Vary");
  return res;
}

function pong() {
  const buf = new TextEncoder().encode("Pong");
  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
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
    const cred = await db.credential.findUnique({ where: { voucherCode: token } });
    if (!cred) return false;
    if (cred.status !== "ACTIVE") return false;
    if (cred.expireAt && cred.expireAt < new Date()) return false;
    return true;
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

  if (last === "ping") {
    return pong();
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
      return authResponse(!!ok);
    }

    if (stage === "counters") {
      // Sesión sigue activa mientras la MAC tenga sesión en DB.
      const ok = mac ? await hasActiveSessionForMac(mac) : true;
      return authResponse(ok);
    }

    if (stage === "query") {
      const ok = mac ? await hasActiveSessionForMac(mac) : false;
      console.log(`[wifidogAuth] query mac=${mac} → Auth: ${ok ? 1 : 0}`);
      return authResponse(ok);
    }

    // stage desconocido — denegar por defecto
    return authResponse(false);
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
