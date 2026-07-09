import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";

// Endpoints de PROTOCOLO WiFiDog servidos como Pages API (res crudo de Node),
// NO como App Router route handler — así Next NO inyecta el header "Vary" y
// controlamos los bytes exactos que exige el gateway Reyee EG1510XS.
//
// El gateway llega aquí vía rewrite en next.config.ts:
//   /auth/wifidogAuth/auth  → /api/wd/auth
//   /auth/wifidogAuth/ping  → /api/wd/ping
//   /wifidog/auth           → /api/wd/auth
//   /wifidog/ping           → /api/wd/ping
//
// Formato confirmado por soporte Ruijie:
//   ping  → body "Pong", Content-Length: 4
//   auth  → header "Auth: 1"/"Auth: 0" (mayúscula), cuerpo VACÍO,
//           Content-Length: 0, sin chunked, 200 OK.

export const config = { api: { bodyParser: false } };

async function hasActiveSessionForMac(mac: string): Promise<boolean> {
  try {
    const s = await db.session.findFirst({
      where: { mac: { equals: mac, mode: "insensitive" }, endedAt: null },
      include: { credential: true },
    });
    if (!s) return false;
    if (s.credential?.expireAt && s.credential.expireAt < new Date()) return false;
    if (s.credential && s.credential.status !== "ACTIVE") return false;
    return true;
  } catch {
    return false;
  }
}

async function isValidToken(token: string): Promise<boolean> {
  try {
    const c = await db.credential.findUnique({ where: { voucherCode: token } });
    if (!c || c.status !== "ACTIVE") return false;
    if (c.expireAt && c.expireAt < new Date()) return false;
    return true;
  } catch {
    return false;
  }
}

function sendAuth(res: NextApiResponse, allowed: boolean, gwId: string) {
  // Respuesta byte-idéntica al ejemplo de Ruijie: sin Date, sin Vary.
  // ECO del gw_id: soporte Ruijie indica que el portal debe devolver el
  // gw_id sin cambios; no hacerlo es causa conocida de message=denied.
  res.sendDate = false;
  res.removeHeader("Vary");
  res.removeHeader("Date");
  const headers: Record<string, string> = {
    "Content-Type": "text/plain",
    "Content-Length": "0",
    Auth: allowed ? "1" : "0",
    Connection: "close",
  };
  if (gwId) headers["Gw-Id"] = gwId;
  res.writeHead(200, headers);
  res.end();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const path = req.query.path;
  const segs = Array.isArray(path) ? path : path ? [path] : [];
  const last = (segs[segs.length - 1] ?? "").toLowerCase();
  const q = req.query;
  const get = (k: string) => (Array.isArray(q[k]) ? q[k]![0] : (q[k] as string)) ?? "";

  console.log(`[wd] ${req.method} /${segs.join("/")}?${new URLSearchParams(q as any).toString()}`);

  if (last === "ping") {
    res.sendDate = false;
    res.removeHeader("Vary");
    res.removeHeader("Date");
    res.writeHead(200, {
      "Content-Type": "text/plain",
      "Content-Length": "4",
      Connection: "close",
    });
    res.end("Pong");
    return;
  }

  if (last === "auth") {
    const stage = get("stage");
    const token = get("token");
    const mac = get("mac");
    const gwId = get("gw_id");

    if (stage === "login") {
      const ok = (token && (await isValidToken(token))) || (mac ? await hasActiveSessionForMac(mac) : false);
      console.log(`[wd] login mac=${mac} token=${token ? "sí" : "no"} gw_id=${gwId} → Auth: ${ok ? 1 : 0}`);
      return sendAuth(res, !!ok, gwId);
    }
    if (stage === "counters") {
      const ok = mac ? await hasActiveSessionForMac(mac) : true;
      return sendAuth(res, ok, gwId);
    }
    if (stage === "query") {
      const ok = mac ? await hasActiveSessionForMac(mac) : false;
      console.log(`[wd] query mac=${mac} gw_id=${gwId} → Auth: ${ok ? 1 : 0}`);
      return sendAuth(res, ok, gwId);
    }
    return sendAuth(res, false, gwId);
  }

  res.writeHead(404, { "Content-Length": "0", Connection: "close" });
  res.end();
}
