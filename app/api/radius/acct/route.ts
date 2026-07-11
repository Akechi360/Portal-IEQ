import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SessionAccessType } from "@prisma/client";

/**
 * POST /api/radius/acct
 *
 * Recibe los paquetes de Accounting de FreeRADIUS (módulo rlm_rest, sección
 * `accounting`). El gateway Reyee informa el ciclo de vida de cada sesión:
 *   - Start          -> el usuario se conecta      (creamos la Session)
 *   - Interim-Update -> actualización periódica     (refrescamos tráfico)
 *   - Stop           -> el usuario se desconecta    (endedAt + tráfico final)
 *
 * Correlación: usamos Acct-Session-Id (único por sesión del NAS) para no
 * confundir reconexiones del mismo dispositivo.
 *
 * Óptica del NAS (gateway):
 *   Acct-Input-Octets  = bytes que el usuario SUBIÓ  -> dataUpMB
 *   Acct-Output-Octets = bytes que el usuario BAJÓ   -> dataDownMB
 *
 * Siempre respondemos HTTP 200: el accounting es independiente de la
 * conectividad del usuario; un fallo aquí no debe tumbar FreeRADIUS.
 */

const GIGAWORD = 4_294_967_296; // 2^32 — los octets de RADIUS se envuelven a los 4 GB

function toBytes(octets?: string, gigawords?: string): number {
  const o = parseInt(octets || "0", 10);
  const g = parseInt(gigawords || "0", 10);
  return (Number.isNaN(g) ? 0 : g) * GIGAWORD + (Number.isNaN(o) ? 0 : o);
}

const bytesToMB = (bytes: number) => Math.round((bytes / 1_048_576) * 10) / 10;

/** Normaliza el MAC a "aa:bb:cc:dd:ee:ff" para que cuadre con el dashboard. */
function normalizeMac(raw?: string): string {
  const clean = (raw || "").replace(/[^a-fA-F0-9]/g, "").toLowerCase();
  if (clean.length !== 12) return (raw || "").toLowerCase();
  return clean.match(/.{2}/g)!.join(":");
}

/** Called-Station-Id suele venir como "AP-MAC:SSID"; extraemos el SSID. */
function parseSsid(calledStationId?: string): string | null {
  if (!calledStationId) return null;
  const idx = calledStationId.lastIndexOf(":");
  if (idx >= 0 && idx < calledStationId.length - 1) {
    return calledStationId.slice(idx + 1).trim() || null;
  }
  return null;
}

export async function POST(req: Request) {
  // JSON primero; si falla, form-urlencoded (mismo patrón que /verify).
  let body: Record<string, string> = {};
  try {
    body = await req.json();
  } catch {
    try {
      const params = new URLSearchParams(await req.text());
      body = Object.fromEntries(params.entries());
    } catch {
      console.error("[RADIUS Acct] No se pudo parsear el body");
      return new NextResponse(null, { status: 200 });
    }
  }

  const statusType = (body.status_type || "").trim().toLowerCase();
  const username = (body.username || "").trim();
  const acctSessionId = (body.session_id || "").trim();
  const mac = normalizeMac(body.mac);
  const ip = (body.ip || "").trim() || null;
  const ssid = parseSsid(body.nas_port);
  const sessionTime = parseInt(body.session_time || "0", 10) || 0;
  const dataUpMB = bytesToMB(toBytes(body.input_octets, body.input_gigawords));
  const dataDownMB = bytesToMB(toBytes(body.output_octets, body.output_gigawords));

  console.log(
    `[RADIUS Acct] ${statusType || "?"} user=${username} mac=${mac} sid=${acctSessionId}`
  );

  if (!acctSessionId) {
    console.warn("[RADIUS Acct] Paquete sin Acct-Session-Id, ignorado");
    return new NextResponse(null, { status: 200 });
  }

  try {
    // ¿A quién pertenece este username? (voucher / médico / staff)
    let accessType: SessionAccessType = SessionAccessType.GUEST;
    let credentialId: string | null = null;
    let doctorId: string | null = null;
    let staffUserId: string | null = null;

    if (username) {
      const credential = await db.credential.findUnique({ where: { voucherCode: username } });
      if (credential) {
        accessType = SessionAccessType.GUEST;
        credentialId = credential.id;
      } else {
        const doctor = await db.doctor.findUnique({ where: { email: username } });
        if (doctor) {
          accessType = SessionAccessType.DOCTOR;
          doctorId = doctor.id;
        } else {
          const staff = await db.staffUser.findUnique({ where: { email: username } });
          if (staff) {
            accessType = SessionAccessType.STAFF;
            staffUserId = staff.id;
          }
        }
      }
    }

    const isStop = statusType === "stop";
    const now = new Date();

    if (statusType === "start") {
      // Alta de sesión. upsert por si el NAS reenvía el Start.
      await db.session.upsert({
        where: { acctSessionId },
        create: {
          acctSessionId,
          mac,
          ip,
          ssid,
          accessType,
          credentialId,
          doctorId,
          staffUserId,
          lastSeenAt: now,
        },
        update: { ip, ssid, endedAt: null, lastSeenAt: now },
      });
    } else {
      // Interim-Update o Stop: actualizamos tráfico/estado. Si perdimos el
      // Start, creamos la sesión para no perder el registro y estimamos el
      // inicio con Acct-Session-Time.
      await db.session.upsert({
        where: { acctSessionId },
        create: {
          acctSessionId,
          mac,
          ip,
          ssid,
          accessType,
          credentialId,
          doctorId,
          staffUserId,
          startedAt: new Date(now.getTime() - sessionTime * 1000),
          dataUpMB,
          dataDownMB,
          endedAt: isStop ? now : null,
          lastSeenAt: now,
        },
        update: {
          ip,
          ssid,
          dataUpMB,
          dataDownMB,
          endedAt: isStop ? now : null,
          lastSeenAt: now,
        },
      });
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("[RADIUS Acct] DB Error:", error);
    return new NextResponse(null, { status: 200 });
  }
}
