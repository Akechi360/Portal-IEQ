// app/api/admin/devices/route.ts
// GET — Clientes conectados y Access Points.
//
// Hay DOS fuentes que cuentan cosas distintas y confundirlas hacía que el panel
// mostrara 11 mientras Ruijie Cloud reportaba 101:
//
//   1. Ruijie Cloud (getSessions) -> ASOCIACIÓN Wi-Fi: todo equipo enganchado a
//      un AP, se haya autenticado o no, incluidos los exentos del portal.
//   2. La app (Session/RADIUS)    -> AUTENTICACIÓN: solo quien pasó por el
//      portal Y cuyo accounting sigue llegando.
//
// Mostramos las dos y clasificamos cada cliente, que es lo que de verdad
// permite auditar la red. Si Ruijie no responde, caemos a la fuente 2 sola
// (comportamiento anterior) en vez de dejar la pantalla vacía.

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/jwt";
import { getDevices, getSessions } from "@/lib/ruijie";
import { db } from "@/lib/db";
import { activeSessionWhere } from "@/lib/session-activity";

const MB = 1_048_576;

/** Estado de un cliente frente al portal. */
type ClientStatus = "Autenticado" | "Sin accounting" | "Sin portal";

const toBytes = (mb: number | null | undefined) => Math.round((mb ?? 0) * MB);

function normalizeMac(raw?: string | null): string {
  const clean = (raw || "").replace(/[^a-fA-F0-9]/g, "").toLowerCase();
  if (clean.length !== 12) return (raw || "").toLowerCase();
  return clean.match(/.{2}/g)!.join(":");
}

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (auth instanceof Response) return auth;

  try {
    const [openSessions, aps, liveClients, credBindings, docBindings, staffBindings] =
      await Promise.all([
        db.session.findMany({
          where: activeSessionWhere(),
          orderBy: { startedAt: "desc" },
          include: { credential: true, doctor: true, staffUser: true },
        }),
        getDevices().catch((e) => {
          console.warn("[devices] No se pudo obtener APs de Ruijie:", e);
          return [] as Awaited<ReturnType<typeof getDevices>>;
        }),
        getSessions().catch((e) => {
          console.warn("[devices] No se pudo obtener clientes de Ruijie:", e);
          return null; // null = fuente no disponible (distinto de "cero clientes")
        }),
        db.deviceBinding.findMany({ include: { credential: true } }),
        db.doctorDeviceBinding.findMany({ include: { doctor: true } }),
        db.staffDeviceBinding.findMany({ include: { staffUser: true } }),
      ]);

    // ── Índices por MAC para cruzar contra lo que ve Ruijie ──────────────────

    const sessionByMac = new Map<string, (typeof openSessions)[number]>();
    for (const s of openSessions) sessionByMac.set(normalizeMac(s.mac), s);

    // Dispositivos casados: se autenticaron alguna vez aunque su accounting ya
    // no llegue. Distinguirlos de los que nunca pasaron por el portal es justo
    // lo que revela si el accounting se está perdiendo.
    const boundByMac = new Map<string, string>();
    for (const b of staffBindings) {
      boundByMac.set(normalizeMac(b.mac), b.staffUser?.nombre || b.staffUser?.email || "Personal");
    }
    for (const b of docBindings) {
      boundByMac.set(normalizeMac(b.mac), b.doctor?.nombre || "Médico");
    }
    for (const b of credBindings) {
      boundByMac.set(normalizeMac(b.mac), b.credential?.nombre || "Invitado");
    }

    const sessionName = (s: (typeof openSessions)[number]) =>
      s.credential?.nombre || s.doctor?.nombre || s.staffUser?.nombre || s.staffUser?.email || "Invitado";

    // ── Lista unificada de clientes ─────────────────────────────────────────

    const clients: Array<{
      mac: string;
      ip: string;
      username: string;
      ssid: string;
      connectedAt: Date | string | null;
      durationSeconds: number;
      bytesDown: number;
      bytesUp: number;
      status: ClientStatus;
    }> = [];

    const seen = new Set<string>();

    if (liveClients) {
      for (const c of liveClients) {
        const mac = normalizeMac(c.mac);
        seen.add(mac);
        const session = sessionByMac.get(mac);
        const boundName = boundByMac.get(mac);

        const status: ClientStatus = session
          ? "Autenticado"
          : boundName
            ? "Sin accounting"
            : "Sin portal";

        clients.push({
          mac,
          ip: c.ip || session?.ip || "—",
          // El username de Ruijie suele ser el voucher/correo; preferimos el
          // nombre real que ya tenemos en la app.
          username: session ? sessionName(session) : boundName || c.username || "Sin identificar",
          ssid: c.ssid && c.ssid !== "—" ? c.ssid : session?.ssid || "—",
          connectedAt: c.startedAt,
          durationSeconds: c.durationSeconds,
          bytesDown: c.bytesDown,
          bytesUp: c.bytesUp,
          status,
        });
      }
    }

    // Sesiones que la app tiene pero Ruijie no listó (o Ruijie no respondió).
    for (const s of openSessions) {
      const mac = normalizeMac(s.mac);
      if (seen.has(mac)) continue;
      seen.add(mac);
      clients.push({
        mac,
        ip: s.ip ?? "—",
        username: sessionName(s),
        ssid: s.ssid ?? "—",
        connectedAt: s.startedAt,
        durationSeconds: s.startedAt
          ? Math.floor((Date.now() - new Date(s.startedAt).getTime()) / 1000)
          : 0,
        bytesDown: toBytes(s.dataDownMB),
        bytesUp: toBytes(s.dataUpMB),
        status: "Autenticado",
      });
    }

    // Autenticados primero, luego los casados, y de últimos los desconocidos.
    const rank: Record<ClientStatus, number> = {
      Autenticado: 0,
      "Sin accounting": 1,
      "Sin portal": 2,
    };
    clients.sort((a, b) => rank[a.status] - rank[b.status] || b.durationSeconds - a.durationSeconds);

    const authenticated = clients.filter((c) => c.status === "Autenticado").length;
    const staleAccounting = clients.filter((c) => c.status === "Sin accounting").length;
    const withoutPortal = clients.filter((c) => c.status === "Sin portal").length;

    const totalDown = clients.reduce((a, c) => a + c.bytesDown, 0);
    const totalUp = clients.reduce((a, c) => a + c.bytesUp, 0);

    return NextResponse.json({
      ok: true,
      clients,
      aps: aps.map((ap) => ({
        mac: ap.mac,
        ip: ap.ip,
        ssid: ap.ssid,
        name: ap.name,
        model: ap.model,
        connectedAt: ap.connectedAt,
        bytesDown: ap.bytesDown,
        bytesUp: ap.bytesUp,
      })),
      kpis: {
        // Total real de equipos en la red Wi-Fi (lo que reporta Ruijie Cloud).
        totalClients: clients.length,
        // Cuántos de esos pasaron por el portal y siguen reportando accounting.
        activeClients: authenticated,
        staleAccounting,
        withoutPortal,
        totalAps: aps.length,
        totalDownBytes: totalDown,
        totalUpBytes: totalUp,
        // Para que la UI avise si el conteo salió solo de la app.
        source: liveClients ? "ruijie" : "portal",
      },
    });
  } catch (error) {
    console.error("GET /api/admin/devices error:", error);
    return NextResponse.json({ ok: false, message: "Error al obtener dispositivos." }, { status: 500 });
  }
}
