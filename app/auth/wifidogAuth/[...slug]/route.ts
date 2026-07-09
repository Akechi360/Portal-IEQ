import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Catch-all WiFiDog para el gateway Reyee (EG1510XS).
// El EG construye sus rutas bajo /auth/wifidogAuth/* (con barra final; el
// middleware las reescribe sin barra). Protocolo observado por captura:
//   GET ping/?gw_sn=...            → "Pong" (heartbeat; sin esto deniega todo)
//   GET auth/?stage=query&mac=...  → ¿esta MAC tiene acceso? (sin token)
//   GET auth/?stage=login&token=.. → validar token (voucher) del cliente
//   GET auth/?stage=counters&...   → refresco periódico de sesión
// Respuesta texto plano: "Auth: 1" (permitir) / "Auth: 0" (denegar).

// Respuesta con Content-Length explícito y body binario: Next streamea las
// respuestas como Transfer-Encoding: chunked por defecto y el parser HTTP
// embebido del gateway no entiende chunks (verificado con captura pktmon).
const text = (body: string) => {
  const buf = new TextEncoder().encode(body);
  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
      "Content-Length": String(buf.byteLength),
      Connection: "close",
    },
  });
};

async function hasActiveSessionForMac(mac: string): Promise<boolean> {
  try {
    const session = await db.session.findFirst({
      where: { mac: { equals: mac, mode: "insensitive" }, endedAt: null },
      include: { credential: true },
    });
    if (!session) return false;
    // Si la sesión es de un voucher, verificar que no haya expirado
    if (session.credential?.expireAt && session.credential.expireAt < new Date()) {
      return false;
    }
    if (session.credential && session.credential.status !== "ACTIVE") {
      return false;
    }
    return true;
  } catch (e) {
    console.error("[wifidogAuth] Error consultando sesión:", e);
    return false;
  }
}

async function isValidVoucherToken(token: string): Promise<boolean> {
  try {
    const cred = await db.credential.findUnique({
      where: { voucherCode: token },
    });
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
  const path = slug.join("/");

  console.log(`[wifidogAuth] ${req.method} /${path}?${url.searchParams.toString()}`);

  const last = slug[slug.length - 1]?.toLowerCase() ?? "";

  // Heartbeat del gateway — responder Pong o entra en fail-closed
  if (last === "ping") {
    return text("Pong");
  }

  if (last === "auth") {
    const stage = url.searchParams.get("stage") ?? "";
    const token = url.searchParams.get("token") ?? "";
    const mac = url.searchParams.get("mac") ?? "";

    let allowed = false;

    if (token) {
      // stage=login / counters con token: validar voucher contra la DB;
      // si el token no es un voucher (médico/staff), aceptar si la MAC
      // tiene sesión activa.
      allowed =
        (await isValidVoucherToken(token)) ||
        (mac ? await hasActiveSessionForMac(mac) : false);
    } else if (mac) {
      // stage=query sin token: el gateway pregunta por la MAC
      allowed = await hasActiveSessionForMac(mac);
    }

    console.log(`[wifidogAuth] auth stage=${stage} mac=${mac} token=${token ? "sí" : "no"} → Auth: ${allowed ? 1 : 0}`);
    // El "\n" final es obligatorio: el parser del gateway es estricto con
    // el formato original de wifidog-auth ("Auth: N\n").
    return text(`Auth: ${allowed ? 1 : 0}\n`);
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
